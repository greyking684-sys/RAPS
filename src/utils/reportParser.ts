import { ShiftReport, MachineRecord } from '../types/oee';
import {
  DEPT,
  buildMachineRecord,
  parseDurationMins,
  parseNum,
  normalizeLeader,
  sum,
} from './oeeCalculations';

export function parseWhatsAppShiftReport(t: string): ShiftReport {
  const lm = t.match(/(?:Team|Shift)\s*Leader\*?:\s*\*?\s*([^\n]+)/i);
  const ld = lm
    ? normalizeLeader(lm[1].replace(/\*/g, '').replace(/[.\s]+$/, '').trim())
    : '–';
  const dm = t.match(/Date\*?:\s*(\d\d)\/(\d\d)\/(\d\d(?:\d\d)?)/i);
  const shiftHeaderMatch = t.match(/\b(DAY|NIGHT)\s+SHIFT\b/i);
  const sh: 'day' | 'night' = shiftHeaderMatch
    ? (shiftHeaderMatch[1].toLowerCase() as 'day' | 'night')
    : /NIGHT/i.test(t.slice(0, 300))
    ? 'night'
    : 'day';
  const date = dm
    ? (dm[3].length === 2 ? '20' + dm[3] : dm[3]) + '-' + dm[2] + '-' + dm[1]
    : '2026-11-09';
  const hrs = sh === 'night' ? 13 : 11;

  let dept: string = '';
  let cur: any = null;
  let mode: string = '';
  const ms: MachineRecord[] = [];
  const flags: string[] = [];
  const notes: string[] = [];

  const finishMachine = () => {
    if (!cur) return;
    const c = cur;
    cur = null;
    const rejText = (c.rj || '') + ' ' + (c.sub.rj || []).join(' ');
    let sc = 0;
    let x: RegExpExecArray | null;
    const re = /(\d+(?:\.\d+)?)_?\s*kg/gi;
    while ((x = re.exec(rejText)) !== null) sc += +x[1];

    const causes = (c.sub.dt || [])
      .map((l: string) => l.replace(/^[>•\-\s]+/, '').replace(/_/g, ' ').trim())
      .filter((l: string) => l && !/exact cause|^min\b/i.test(l));

    let dt = parseDurationMins(c.dtl);
    if (!dt) {
      dt = sum((c.sub.dt || []).map((l: string) => parseDurationMins(l.split(/[–-]/)[0])));
    }

    const good = c.good || c.act || 0;
    const cm = ((c.sub.cm || []).join(' ') + ' ' + (c.cm || '')).trim();

    let st = 'Running';
    if (!good && (/not (yet )?running|maintenance|shutdown|complet/i.test(cm) || (!dt && !cm))) {
      st = 'Not scheduled';
    } else if (!good) {
      st = 'Idle';
    }

    if (!c.target && !good) return;

    ms.push(
      buildMachineRecord(
        c.n,
        c.dept || DEPT.cc,
        st,
        c.target,
        good,
        dt,
        sc,
        c.mat,
        c.wt || 2.5,
        c.hk,
        causes,
        cm,
        c.cav || '',
        c.cyc || null,
        hrs
      )
    );
  };

  for (const raw of String(t || '').split(/\r?\n/)) {
    const l = raw.trim();
    const cn = l.replace(/\*/g, '').trim();
    if (!cn || /^[━\-─]+$/.test(cn)) continue;

    const h = cn.match(/^[^\w]*(CAP COMPRESSION|BLOW MOULDING|INJECTION|SECONDARY)\s*$/i);
    if (h) {
      finishMachine();
      dept = /COMP/i.test(h[1])
        ? DEPT.cc
        : /BLOW/i.test(h[1])
        ? DEPT.bm
        : /INJ/i.test(h[1])
        ? DEPT.inj
        : DEPT.sec;
      continue;
    }

    if (/^[^\w]*SHIFT/i.test(cn)) {
      finishMachine();
      dept = '';
      mode = 'notes';
      continue;
    }

    if (cn.includes('🚩')) {
      flags.push((cur ? cur.n + ': ' : '') + cn.replace(/🚩/g, '').trim());
      continue;
    }

    if (mode === 'notes') {
      if (/^[>•\-]/.test(cn)) notes.push(cn.replace(/^[>•\-\s]+/, ''));
      continue;
    }

    const mh = l.match(/^\*([^*]+)\*$/);
    if (
      mh &&
      /^(compression \w+|borun \d+|320t \d+|380t|slitter \d+|laser printing)$/i.test(mh[1].trim())
    ) {
      finishMachine();
      cur = { n: mh[1].trim(), dept, sub: {}, mat: 0, good: 0, act: 0, target: 0, hk: null };
      mode = '';
      continue;
    }

    if (!cur) continue;

    const k = cn.match(
      /^(Product|Operator\(s\)|Operator|Target|Actual weight|Std weight|Std cycle|Actual|Good output|Material|Downtime|Housekeeping|Cavities|Comments|Rejects|Total printed)\s*:?\s*(.*)$/i
    );

    if (k) {
      const key = k[1].toLowerCase();
      const v = k[2];
      mode = '';
      if (key === 'target') {
        cur.target = parseNum(v);
        const a = v.match(/Actual\s*:\s*(.*)/i);
        if (a) cur.act = parseNum(a[1]);
      } else if (key === 'actual' || key === 'total printed') {
        cur.act = parseNum(v);
      } else if (key === 'good output') {
        cur.good = parseNum(v);
      } else if (key === 'material') {
        cur.mat = parseNum(v);
      } else if (key === 'std weight') {
        cur.wt = parseNum(v);
      } else if (key === 'actual weight' && parseNum(v)) {
        cur.wt = parseNum(v);
      } else if (key === 'std cycle') {
        const a = v.match(/Actual cycle\*?:\s*_*([\d.]+)/i);
        if (a) cur.cyc = +a[1];
      } else if (key === 'housekeeping') {
        const a = v.match(/\d+/);
        cur.hk = a ? +a[0] / 100 : null;
      } else if (key === 'cavities') {
        cur.cav = v.replace(/_/g, '').trim();
      } else if (key === 'downtime') {
        mode = 'dt';
        const p = v.split('>');
        cur.dtl = p[0];
        if (p[1]) (cur.sub.dt = cur.sub.dt || []).push(p.slice(1).join('>'));
      } else if (key === 'rejects') {
        mode = 'rj';
        cur.rj = v;
      } else if (key === 'comments') {
        mode = 'cm';
        cur.cm = v;
      }
      continue;
    }

    if (/^[>•\-]/.test(cn) && mode) {
      (cur.sub[mode] = cur.sub[mode] || []).push(cn);
    }
  }

  finishMachine();

  return {
    id: `${date}_${sh}`,
    date,
    shift: sh,
    hrs,
    ms,
    flags,
    notes,
    ld,
  };
}

export const SAMPLE_PASTE_TEXT = `*🏭 RIG & PLANT SERVICES*
*DAY SHIFT PRODUCTION REPORT (11 hrs)*
*Date*: 09/11/26
👤 *Team Leader*: Josh / Muchauya
━━━━━━━━━━━━━━
*🔵 CAP COMPRESSION*
━━━━━━━━━━━━━━
*Compression 1A*
*Product*: 38mm pfuko brown closures- DZL
*Operator*: Tanaka & Isiah
*Target*: 182 761
*Actual*: 178 500
*Std cycle*: 5.2 sec | *Actual cycle*: 5.2 sec
*Std weight*: 2.5 g (2.40–2.50)
*Actual weight*: 2.45g
*Rejects*: 1.5 kg
*Good output*: 178 500
*Material*: 439.2kg
*Downtime*: 15 mins
> attending cooling water pressure
*Housekeeping*: 95%
*Comments*: Handed over machine running well

*Compression 1B*
*Product*: 38mm cream closure- CBC
*Operator*: Makombe C and Allen Kainga
*Target*: 182 761
*Actual*: 162 000
*Std cycle*: 5.2 sec | *Actual cycle*: 5.2 sec
*Std weight*: 2.5 g (2.40–2.50)
*Actual weight*: 2.47g
*Rejects*: 4.5 kg
*Good output*: 162 000
*Material*: 406.1kg
*Downtime*: 55 mins
> 35m pump VFD alarm reset
> 20m saddle alignment check
*Housekeeping*: 90%
*Comments*: Handed over running well

━━━━━━━━━━━━━━
*🟢 BLOW MOULDING*
━━━━━━━━━━━━━━
*Borun 01*
*Product*: 2L Maheu bottle
*Operator*: T. Sibanda
*Target*: 21 120
*Actual*: 18 450
*Std weight*: 23.5 g
*Actual weight*: 23.5 g
*Rejects*: 2.1 kg
*Good output*: 18 450
*Material*: 435.6kg
*Downtime*: 45 mins
> 45m trimmer belt adjustment
*Housekeeping*: 92%
*Comments*: Handed over running well

*Borun 02*
*Product*: 2L Maheu bottle
*Operator*: K. Chuma
*Target*: 21 120
*Actual*: 16 200
*Std weight*: 23.5 g
*Actual weight*: 23.6 g
*Rejects*: 3.8 kg
*Good output*: 16 200
*Material*: 386.1kg
*Downtime*: 1h 20m
> 80m cutter knife cable replacement
*Housekeeping*: 90%
*Comments*: Handed over machine running

*Borun 03*
*Product*: 2L Maheu bottle
*Target*: 21 120
*Actual*: 0
*Comments*: Not scheduled - planned preventive maintenance

━━━━━━━━━━━━━━
*🟠 INJECTION*
━━━━━━━━━━━━━━
*320T 01*
*Product*: 38mm preform
*Operator*: P. Moyo
*Target*: 45 900
*Actual*: 44 200
*Std weight*: 13.5 g
*Actual weight*: 13.5 g
*Cavities*: 16/16
*Rejects*: 1.2 kg
*Good output*: 44 200
*Material*: 597.9kg
*Downtime*: 20 mins
> nozzle tip inspection
*Housekeeping*: 94%
*Comments*: Handed over running smoothly

*380T*
*Product*: 38mm preform
*Operator*: E. Ncube
*Target*: 45 900
*Actual*: 36 800
*Std weight*: 13.5 g
*Actual weight*: 13.5 g
*Cavities*: 14/16
*Rejects*: 3.4 kg
*Good output*: 36 800
*Material*: 500.2kg
*Downtime*: 1h 35m
> 65m sleeve-plate cooling channel flush
> 30m temperature profile tuning
*Housekeeping*: 88%
*Comments*: Handed over running

━━━━━━━━━━━━━━
*📝 SHIFT NOTES & FLAGS*
━━━━━━━━━━━━━━
🚩 Cap 1B: VFD drive alarm monitored closely after reset
🚩 380T: Mr. Satande scheduled for torpedo cleaning tomorrow
• Night shift handover completed smoothly
• Cooler fan unit operating normally`;
