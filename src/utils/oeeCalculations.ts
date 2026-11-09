import { MachineRecord, DowntimeCauseDetail } from '../types/oee';

export const DEPT = {
  cc: 'Cap Compression',
  bm: 'Blow Moulding',
  inj: 'Injection',
  sec: 'Secondary',
} as const;

export const KW_CAUSES: [string, string][] = [
  ['vfd|variable pump|system pressure', 'Pump VFD / system pressure alarm'],
  ['power|surge|cable overload|overheating', 'Power cut / surge / cable overload'],
  ['packaging|bailer', 'Packaging / bailers unavailable'],
  ['chiller|water|needle|jacket', 'Chiller / water cooling system'],
  ['pipe|hose|burst', 'Pipe / hose burst'],
  ['torpedo', 'Torpedoes (cleaning / replacement)'],
  ['die|contamin|metal object', 'Die change / contamination'],
  ['nozzle|lump|plasticis|inject', 'Nozzle / lump / plasticising'],
  ['belt|trimmer|knife', 'Belt / trimmer / cutter knife'],
  ['fan|cooling tower', 'Cooling tower blow fan'],
  ['cavit|blank|unblank|saddle', 'Cavity / saddle issue'],
  ['colour', 'Colour change'],
  ['mould|mold|station error', 'Mould / station movement issue'],
  ['light', 'Night shift bay lighting'],
  ['housekeeping', 'Housekeeping / shift takeover'],
];

export const CAUSE_EXPLANATIONS: Record<string, DowntimeCauseDetail> = {
  'Power cut / surge / cable overload': {
    rootCause:
      'Simultaneous operation of Compression 1A & 1B alongside all three Borun blow moulders exceeds main feeder cable ampacity, causing thermal overload and forced load-shedding of Borun 02 & 03.',
    action:
      'Upgrade main armoured feeder cable / balance phase loads across busbars; monitor main breaker temperature during Cap 1A + 1B dual runs.',
    owner: 'Chief Electrician / Plant Engineering',
  },
  'Mould / station movement issue': {
    rootCause:
      'Left/right station carriage limit switch misalignment on Borun 01–03 and mould stuck closed in auto mode on 320T 01.',
    action:
      'Calibrate station proximity sensors, lubricate carriage linear guides, and verify hydraulic lock-nut torque.',
    owner: 'Blow Moulding & Injection Setters',
  },
  'Chiller / water cooling system': {
    rootCause:
      'Chiller Compressor 4 trips under daytime ambient heat loads, empty chiller make-up tank on Comp 1A, and broken water needles / cavity water jackets on Comp 1B.',
    action:
      'Repair cooling tower blow fan immediately, clean 380T chiller inline strainer, and complete Cap 1B chiller pipe tie-in.',
    owner: 'Utilities & Maintenance Team',
  },
  'Die change / contamination': {
    rootCause:
      'Foreign metal ingress into Borun 01 die head (parisons #4/#5) and unscreened regrind / hopper contamination on Borun 03.',
    action:
      'Install/clean rare-earth hopper magnets on all extruders and enforce closed-bag regrind handling.',
    owner: 'Process Technicians & Shift Leaders',
  },
  'Torpedoes (cleaning / replacement)': {
    rootCause:
      'Worn or carbonized hot-runner torpedoes on 320T 01 and 380T causing blocked gates, short shots, and forced cavity blanking (down to 10/16–12/16 cavities).',
    action:
      'Mr. Satande replaced torpedoes on 320T 01 (restoring 15–16/16 cavities); schedule complete torpedo overhaul on 380T.',
    owner: 'Toolroom (Mr. Satande)',
  },
  'Packaging / bailers unavailable': {
    rootCause:
      'Packaging bailer bags ran out mid-shift on 05/11 Night and delayed startup on 06/11 Day, forcing Borun 01 & Borun 02 to park for 4+ hours each.',
    action:
      'Set minimum 48-hour buffer stock alert for bailer bags at shift handover before night shifts begin.',
    owner: 'Stores & Shift Leaders',
  },
  'Nozzle / lump / plasticising': {
    rootCause:
      'Nozzle tip leakage on 380T, barrel heater band failures, and melt instability during Dow-to-Wanhua HDPE transition on 320T 01.',
    action:
      'Reseat 380T nozzle tip, verify barrel zone PID temperatures for Wanhua resin, and inspect heater band clamps.',
    owner: 'Injection Setters & Electrician',
  },
  'Cavity / saddle issue': {
    rootCause:
      'Compression 1B cavity #8 moved off cylinder saddle and punching rod #10 demoulding stiffness; 380T sleeve-plate water blockage on spare mould.',
    action:
      'Re-align Comp 1B cavity #8 saddle & water needle; flush blocked sleeve-plate water channels on 380T spare mould.',
    owner: 'Compression & Tooling Fitters',
  },
  'Belt / trimmer / cutter knife': {
    rootCause:
      'Frequent trimmer belt wear on Borun 01 & 03 and broken cutter knife cables on Borun 02 causing bottle jams.',
    action:
      'Procure urgent spare trimmer belts for Borun 03 and spare cutter knife cables for Borun 02.',
    owner: 'Procurement & Maintenance',
  },
  'Pump VFD / system pressure alarm': {
    rootCause:
      'Elevated hydraulic system pressure straining pump drive motor and oil chiller heat-soak on Compression 1A & 1B.',
    action:
      'Keep hydraulic pressure within standard window and maintain shared Cap 2 oil chiller flow.',
    owner: 'Cap Compression Technicians',
  },
};

export function groupDowntimeCause(text: string | null | undefined): string | null {
  const s = String(text || '').trim();
  if (!s || /^nil$/i.test(s)) return null;
  for (const [pat, label] of KW_CAUSES) {
    if (new RegExp(pat, 'i').test(s)) return label;
  }
  return s.slice(0, 42);
}

export function normalizeLeader(raw: string | null | undefined): string {
  const s = String(raw || '').trim();
  if (!s || s === '–' || s === '-') return '–';
  if (/muchauya|josh/i.test(s)) return 'Josh / Muchauya';
  if (/mseza|shingi/i.test(s)) return 'S. Mseza / Shingi';
  if (/mudzimba/i.test(s)) return 'R. Mudzimba';
  return s;
}

export function buildMachineRecord(
  n: string,
  dept: string,
  st: string,
  target: number,
  good: number,
  dt: number,
  scrap: number,
  mat: number,
  wt: number,
  hk: number | null,
  causes: string[] = [],
  cm: string = '',
  cav: string = '',
  cyc: number | null = null,
  hrs: number = 13
): MachineRecord {
  const mins = hrs * 60;
  const av = st === 'Running' || st === 'Idle' ? Math.max(0, (mins - dt) / mins) : 0;
  const att = target > 0 ? good / target : null;
  const perf = target > 0 && av > 0 ? Math.min(1.2, good / (target * av)) : 0;
  const gk = (good * (wt || 0)) / 1000;
  const q = mat > 0 && wt > 0 ? Math.min(1, gk / mat) : 1;
  const loss = mat > 0 && wt > 0 ? Math.max(0, mat - gk) : 0;
  const oee = target > 0 && st === 'Running' ? av * perf * q : st === 'Idle' && target > 0 ? 0 : null;
  const unl = mat > 0 && loss > scrap + 0.02 * mat;

  return {
    n,
    dept,
    st,
    target,
    good,
    dt,
    scrap,
    mat,
    wt,
    loss,
    att,
    av,
    perf,
    q,
    oee,
    hk,
    cav,
    cyc,
    unl,
    causes: causes || [],
    cm: cm || '',
  };
}

export function parseDurationMins(s: string | null | undefined): number {
  const str = String(s || '').replace(/_/g, ' ');
  let h = (str.match(/(\d+)\s*h/i) || [])[1];
  if (h == null && /\bhour\b/i.test(str)) h = '1';
  const m = (str.match(/(\d+)\s*m/i) || [])[1];
  return (+h || 0) * 60 + (+m || 0);
}

export function parseNum(s: string | null | undefined): number {
  const m = String(s || '')
    .replace(/_/g, '')
    .replace(/(\d)\s+(?=\d{3}\b)/g, '$1')
    .match(/\d+(?:\.\d+)?/);
  return m ? +m[0] : 0;
}

export const sum = (arr: number[]): number => (arr || []).reduce((a, b) => a + (b || 0), 0);

export const avg = (arr: (number | null | undefined)[]): number | null => {
  const v = (arr || []).filter((x): x is number => x != null && !isNaN(x));
  return v.length ? sum(v) / v.length : null;
};

export const pc = (v: number | null | undefined): string =>
  v == null ? '–' : Math.round(v * 100) + '%';

export const n0 = (v: number | null | undefined): string =>
  Math.round(v || 0).toLocaleString('en-US');

export const isScheduledPrimary = (m: MachineRecord): boolean =>
  m.st !== 'Not scheduled' && m.dept !== DEPT.sec;

export function aggregateMachines(ms: MachineRecord[]) {
  const schedList = ms.filter(isScheduledPrimary);
  const T = sum(schedList.map((m) => m.target));
  const G = sum(schedList.map((m) => m.good));
  return {
    T,
    G,
    att: T > 0 ? G / T : null,
    oee: avg(schedList.map((m) => m.oee)),
    dt: sum(ms.map((m) => m.dt)),
    sc: sum(ms.map((m) => m.scrap)),
    hk: avg(ms.map((m) => m.hk)),
  };
}

export function getMondayWeekKey(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}
