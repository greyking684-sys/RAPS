import React from 'react';
import { ShiftReport, MachineRecord } from '../types/oee';
import {
  aggregateMachines,
  isScheduledPrimary,
  n0,
  pc,
  DEPT,
} from '../utils/oeeCalculations';
import { getTextColor, ProgressBar } from './ProgressBar';
import { MachineModal } from './MachineModal';
import { AlertCircle, Flag, ChevronRight, FileDown, Copy, Check, Briefcase } from 'lucide-react';
import { exportShiftToPdf, exportShiftToWhatsAppText } from '../utils/exportReport';
import { useAuth } from '../context/AuthContext';

interface Props {
  currentReport: ShiftReport;
  allReports: ShiftReport[];
  selectedId: string;
  onSelectId: (id: string) => void;
  selectedMachineModal: MachineRecord | null;
  onSelectMachineModal: (m: MachineRecord | null) => void;
  dark?: boolean;
}

export const OverviewTab: React.FC<Props> = ({
  currentReport: r,
  allReports: R,
  selectedId,
  onSelectId,
  selectedMachineModal,
  onSelectMachineModal,
  dark = false,
}) => {
  const A = aggregateMachines(r.ms);
  const { role } = useAuth();

  const cardCls = `rounded-2xl border p-4 shadow-xs transition-all ${
    dark ? 'bg-[#1a212b] border-[#2b3643] text-[#e8ecf1]' : 'bg-white border-[#dce1e8] text-[#18212d]'
  }`;
  const mutedCls = `text-xs ${dark ? 'text-[#97a3b2]' : 'text-[#64707f]'}`;
  const borderCls = dark ? 'border-[#2b3643]' : 'border-[#dce1e8]';

  const alerts: string[] = [];
  r.ms.forEach((m) => {
    if (m.unl) {
      alerts.push(`${m.n}: ${m.loss.toFixed(1)} kg material unaccounted for (logged scrap ${m.scrap} kg)`);
    }
    if (m.hk != null && m.hk < 0.85) {
      alerts.push(`${m.n}: housekeeping ${pc(m.hk)}`);
    }
    if (isScheduledPrimary(m) && m.att != null && m.att < 0.6) {
      alerts.push(`${m.n}: attainment ${pc(m.att)}`);
    }
  });

  const depts = [
    { key: DEPT.inj, name: 'Injection' },
    { key: DEPT.bm, name: 'Blow Moulding' },
    { key: DEPT.cc, name: 'Cap Compression' },
  ];

  const [copiedWa, setCopiedWa] = React.useState(false);

  const handleCopyWhatsApp = () => {
    const text = exportShiftToWhatsAppText(r);
    navigator.clipboard.writeText(text);
    setCopiedWa(true);
    setTimeout(() => setCopiedWa(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Shift Selector & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="shift-select" className="sr-only">
            Select Shift
          </label>
          <select
            id="shift-select"
            value={r.id}
            onChange={(e) => onSelectId(e.target.value)}
            className={`px-3.5 py-2 rounded-xl border text-sm font-bold cursor-pointer ${
              dark
                ? 'bg-[#1a212b] border-[#2b3643] text-[#e8ecf1]'
                : 'bg-white border-[#dce1e8] text-[#18212d]'
            }`}
          >
            {R.slice()
              .reverse()
              .map((x) => (
                <option key={x.id} value={x.id}>
                  {x.date} · {x.shift}
                </option>
              ))}
          </select>
          <span className={mutedCls}>
            Colour key: green ≥90%, amber 60–89%, red &lt;60% · Click machine row to inspect
          </span>
        </div>

        {/* Quick Export Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportShiftToPdf(r)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              dark
                ? 'bg-[#1a212b] border-[#2b3643] text-slate-200 hover:bg-[#242e3b]'
                : 'bg-white border-[#dce1e8] text-slate-700 hover:bg-slate-50'
            }`}
            title="Download executive shift PDF"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-500" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={handleCopyWhatsApp}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              dark
                ? 'bg-[#1a212b] border-[#2b3643] text-slate-200 hover:bg-[#242e3b]'
                : 'bg-white border-[#dce1e8] text-slate-700 hover:bg-slate-50'
            }`}
            title="Copy formatted WhatsApp shift handover report"
          >
            {copiedWa ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-emerald-600" />}
            <span>{copiedWa ? 'Copied!' : 'Copy WhatsApp'}</span>
          </button>
        </div>
      </div>

      {/* Managing Director Executive Briefing Card (Visible when logged in as Managing Director) */}
      {role === 'managing_director' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-purple-900/30 border border-purple-500/40 text-white shadow-sm space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-500/20 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300">
                <Briefcase className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300">
                Managing Director Executive Briefing · Shift {r.date} ({r.shift.toUpperCase()})
              </h3>
            </div>
            <button
              onClick={() => exportShiftToPdf(r)}
              className="px-2.5 py-1 rounded-lg bg-purple-600/40 hover:bg-purple-600/60 border border-purple-400/40 text-purple-200 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Download Executive Shift Briefing</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Plant Operational Health:</span>
              <span className={`font-bold ${A.oee && A.oee >= 0.75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {pc(A.oee)} Plant OEE · {pc(A.att)} Attainment
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Material &amp; Scrap Economics:</span>
              <span className="font-bold text-slate-200">
                {A.sc.toFixed(1)} kg logged rejects ({n0(A.G)} good units saleable)
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Stoppage Exposure:</span>
              <span className={`font-bold ${A.dt > 300 ? 'text-red-400' : 'text-slate-200'}`}>
                {(A.dt / 60).toFixed(1)} hrs total downtime across machines
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className={`${cardCls} border-t-4 border-t-[#1f5fbf]`}>
          <div className={mutedCls}>Attainment</div>
          <div className={`text-2xl font-black mt-1 ${getTextColor(A.att, dark)}`}>
            {pc(A.att)}
          </div>
          <div className={mutedCls}>
            {n0(A.G)} of {n0(A.T)} pcs
          </div>
        </div>

        <div className={`${cardCls} border-t-4 border-t-[#1f5fbf]`}>
          <div className={mutedCls}>OEE (scheduled)</div>
          <div className={`text-2xl font-black mt-1 ${getTextColor(A.oee, dark)}`}>
            {pc(A.oee)}
          </div>
          <div className={mutedCls}>Availability × Perf × Qual</div>
        </div>

        <div className={`${cardCls} border-t-4 border-t-[#d13a3a]`}>
          <div className={mutedCls}>Downtime</div>
          <div className="text-2xl font-black mt-1 text-slate-800 dark:text-slate-100">
            {((A.dt || 0) / 60).toFixed(1)} h
          </div>
          <div className={mutedCls}>{A.dt || 0} mins total</div>
        </div>

        <div className={`${cardCls} border-t-4 border-t-amber-500`}>
          <div className={mutedCls}>Logged scrap</div>
          <div className="text-2xl font-black mt-1 text-slate-800 dark:text-slate-100">
            {(A.sc || 0).toFixed(1)} kg
          </div>
          <div className={mutedCls}>Floor &amp; startup purge</div>
        </div>

        <div className={`${cardCls} border-t-4 border-t-[#17935a]`}>
          <div className={mutedCls}>Housekeeping</div>
          <div className={`text-2xl font-black mt-1 ${getTextColor(A.hk, dark)}`}>
            {pc(A.hk)}
          </div>
          <div className={mutedCls}>5S shift audit</div>
        </div>
      </div>

      {/* 3 Department Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {depts.map(({ key, name }) => {
          const dMs = r.ms.filter((m) => m.dept === key);
          const dAgg = aggregateMachines(dMs);
          const schedMs = dMs.filter(isScheduledPrimary);
          const best = schedMs.slice().sort((a, b) => (b.att || 0) - (a.att || 0))[0];
          const lag = schedMs.slice().sort((a, b) => (a.att || 0) - (b.att || 0))[0];

          const borderColor =
            dAgg.att == null
              ? 'border-l-slate-400'
              : dAgg.att >= 0.9
              ? 'border-l-[#17935a] dark:border-l-[#3ecf82]'
              : dAgg.att >= 0.6
              ? 'border-l-[#c98200] dark:border-l-[#f0b040]'
              : 'border-l-[#d13a3a] dark:border-l-[#ff6b6b]';

          return (
            <div key={key} className={`${cardCls} border-l-4 ${borderColor} space-y-2`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-base text-slate-900 dark:text-white">
                  {name}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1f5fbf]/10 text-[#1f5fbf] dark:bg-[#6aa5ff]/20 dark:text-[#6aa5ff]">
                  OEE {pc(dAgg.oee)}
                </span>
              </div>

              <div className={`text-3xl font-black ${getTextColor(dAgg.att, dark)}`}>
                {pc(dAgg.att)}
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400">
                {n0(dAgg.G)} / {n0(dAgg.T)} pcs · HK {pc(dAgg.hk)} · Down{' '}
                {((dAgg.dt || 0) / 60).toFixed(1)}h
              </div>

              <div className="pt-2">
                <ProgressBar val={dAgg.att} dark={dark} />
              </div>

              <div className="text-[11px] pt-1 space-y-1 text-slate-600 dark:text-slate-300">
                {best && (
                  <div className="flex items-center justify-between">
                    <span>
                      🏆 Best: <b>{best.n}</b>
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {pc(best.att)} (OEE {pc(best.oee)})
                    </span>
                  </div>
                )}
                {lag && (
                  <div className="flex items-center justify-between">
                    <span>
                      ⚠️ Lagging: <b>{lag.n}</b>
                    </span>
                    <span className="font-bold text-rose-500">
                      {pc(lag.att)} (OEE {pc(lag.oee)})
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Machines Table with Mobile Scroll */}
      <div className={cardCls}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            Machines
          </span>
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
            👆 Click any machine row to open full shift deep-dive &amp; formula audit
          </span>
        </div>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className={`border-b ${borderCls} text-slate-500 dark:text-slate-400`}>
                <th className="py-2 px-2.5 font-bold">Machine</th>
                <th className="py-2 px-2.5 font-bold">Dept</th>
                <th className="py-2 px-2.5 font-bold">Status</th>
                <th className="py-2 px-2.5 font-bold">Target</th>
                <th className="py-2 px-2.5 font-bold">Good</th>
                <th className="py-2 px-2.5 font-bold">Attain.</th>
                <th className="py-2 px-2.5 font-bold min-w-[90px]">Progress</th>
                <th className="py-2 px-2.5 font-bold">Avail.</th>
                <th className="py-2 px-2.5 font-bold">Qual.</th>
                <th className="py-2 px-2.5 font-bold">OEE</th>
                <th className="py-2 px-2.5 font-bold">Down (min)</th>
                <th className="py-2 px-2.5 font-bold">Scrap kg</th>
                <th className="py-2 px-2.5 font-bold">HK</th>
              </tr>
            </thead>
            <tbody>
              {r.ms.map((m, idx) => {
                const isSel = selectedMachineModal && selectedMachineModal.n === m.n;
                return (
                  <tr
                    key={idx}
                    onClick={() => onSelectMachineModal(isSel ? null : m)}
                    className={`border-b last:border-b-0 ${borderCls} cursor-pointer transition-all ${
                      isSel ? 'bg-blue-500/15' : 'hover:bg-slate-500/10'
                    }`}
                  >
                    <td className="py-2 px-2.5 font-bold text-[#1f5fbf] dark:text-[#6aa5ff] underline decoration-dotted underline-offset-2">
                      {m.n}
                    </td>
                    <td className="py-2 px-2.5">{m.dept}</td>
                    <td className="py-2 px-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.st === 'Running'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {m.st}
                      </span>
                    </td>
                    <td className="py-2 px-2.5">{n0(m.target)}</td>
                    <td className="py-2 px-2.5 font-bold">{n0(m.good)}</td>
                    <td className={`py-2 px-2.5 font-bold ${getTextColor(m.att, dark)}`}>
                      {pc(m.att)}
                    </td>
                    <td className="py-2 px-2.5">
                      <ProgressBar val={m.att} dark={dark} />
                    </td>
                    <td className="py-2 px-2.5">{pc(m.av)}</td>
                    <td className="py-2 px-2.5">{pc(m.q)}</td>
                    <td className={`py-2 px-2.5 font-bold ${getTextColor(m.oee, dark)}`}>
                      {pc(m.oee)}
                    </td>
                    <td className="py-2 px-2.5">{m.dt}</td>
                    <td className="py-2 px-2.5">{m.scrap || '–'}</td>
                    <td className={`py-2 px-2.5 font-bold ${getTextColor(m.hk, dark)}`}>
                      {pc(m.hk)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Machine Modal Inspector */}
        <MachineModal
          machine={selectedMachineModal}
          shiftDate={r.date}
          shiftType={r.shift}
          dark={dark}
          onClose={() => onSelectMachineModal(null)}
        />
      </div>

      {/* Alerts & Shift Notes Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className={cardCls}>
          <h2 className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mb-2.5">
            <AlertCircle className="w-4 h-4" />
            <span>⚠ Alerts</span>
          </h2>
          {alerts.length === 0 ? (
            <div className={mutedCls}>No active alerts on this shift.</div>
          ) : (
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              {alerts.map((a, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={cardCls}>
          <h2 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mb-2.5">
            <Flag className="w-4 h-4" />
            <span>🚩 Flags &amp; shift notes</span>
          </h2>
          {r.flags.length === 0 && r.notes.length === 0 ? (
            <div className={mutedCls}>No flags or notes recorded for this shift.</div>
          ) : (
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              {r.flags.map((f, i) => (
                <li key={`flag-${i}`} className="flex items-start gap-1.5 font-medium text-rose-600 dark:text-rose-400">
                  <span>🚩</span>
                  <span>{f}</span>
                </li>
              ))}
              {r.notes.map((n, i) => (
                <li key={`note-${i}`} className="flex items-start gap-1.5">
                  <span className="text-slate-400">•</span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
