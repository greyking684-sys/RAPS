import React, { useState } from 'react';
import { ShiftReport } from '../types/oee';
import {
  groupDowntimeCause,
  CAUSE_EXPLANATIONS,
} from '../utils/oeeCalculations';
import { SvgBarChart } from './SvgCharts';
import { Wrench, AlertTriangle, ShieldCheck, UserCheck, CheckCircle2 } from 'lucide-react';

interface Props {
  reports: ShiftReport[];
  dark?: boolean;
}

export const DowntimeTab: React.FC<Props> = ({ reports: R, dark = false }) => {
  const [selectedCause, setSelectedCause] = useState<string | null>(null);
  const [selectedMachineFilter, setSelectedMachineFilter] = useState<string | null>(null);

  const cardCls = `rounded-2xl border p-4 shadow-xs transition-all ${
    dark ? 'bg-[#1a212b] border-[#2b3643] text-[#e8ecf1]' : 'bg-white border-[#dce1e8] text-[#18212d]'
  }`;
  const mutedCls = `text-xs ${dark ? 'text-[#97a3b2]' : 'text-[#64707f]'}`;
  const borderCls = dark ? 'border-[#2b3643]' : 'border-[#dce1e8]';

  // Group all downtime causes
  const causeGroups: Record<
    string,
    {
      totalMins: number;
      count: number;
      machines: Record<string, number>;
      shifts: { date: string; shift: string; m: string; text: string; mins: number }[];
    }
  > = {};

  let grandTotalMins = 0;

  R.forEach((rep) => {
    rep.ms.forEach((m) => {
      if (selectedMachineFilter && m.n !== selectedMachineFilter) return;

      const cLen = (m.causes || []).length;
      if (cLen > 0) {
        m.causes.forEach((txt) => {
          const k = groupDowntimeCause(txt) || 'Unclassified stop';
          const mins = m.dt / cLen;
          grandTotalMins += mins;
          if (!causeGroups[k]) {
            causeGroups[k] = { totalMins: 0, count: 0, machines: {}, shifts: [] };
          }
          causeGroups[k].totalMins += mins;
          causeGroups[k].count += 1;
          causeGroups[k].machines[m.n] = (causeGroups[k].machines[m.n] || 0) + mins;
          causeGroups[k].shifts.push({
            date: rep.date,
            shift: rep.shift,
            m: m.n,
            text: txt,
            mins,
          });
        });
      } else if (m.dt > 0) {
        const k = groupDowntimeCause(m.cm) || 'Unclassified stop';
        grandTotalMins += m.dt;
        if (!causeGroups[k]) {
          causeGroups[k] = { totalMins: 0, count: 0, machines: {}, shifts: [] };
        }
        causeGroups[k].totalMins += m.dt;
        causeGroups[k].count += 1;
        causeGroups[k].machines[m.n] = (causeGroups[k].machines[m.n] || 0) + m.dt;
        causeGroups[k].shifts.push({
          date: rep.date,
          shift: rep.shift,
          m: m.n,
          text: m.cm || 'Machine stoppage',
          mins: m.dt,
        });
      }
    });
  });

  const paretoList = Object.entries(causeGroups).sort(
    (a, b) => b[1].totalMins - a[1].totalMins
  );

  const activeCauseKey = selectedCause || (paretoList[0] ? paretoList[0][0] : null);
  const activeCauseObj = activeCauseKey ? causeGroups[activeCauseKey] : null;
  const activeExplain = activeCauseKey ? CAUSE_EXPLANATIONS[activeCauseKey] : null;

  // Unique machine list for filter
  const allMachineNames = [
    ...new Set(R.flatMap((r) => r.ms.map((m) => m.n))),
  ].sort();

  return (
    <div className="space-y-4">
      {/* Top Bar with Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label htmlFor="machine-filter" className="sr-only">
            Filter by Machine
          </label>
          <select
            id="machine-filter"
            value={selectedMachineFilter || ''}
            onChange={(e) => setSelectedMachineFilter(e.target.value || null)}
            className={`px-3.5 py-2 rounded-xl border text-sm font-bold cursor-pointer ${
              dark
                ? 'bg-[#1a212b] border-[#2b3643] text-[#e8ecf1]'
                : 'bg-white border-[#dce1e8] text-[#18212d]'
            }`}
          >
            <option value="">All Machines ({allMachineNames.length})</option>
            {allMachineNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <span className={mutedCls}>
            Total Logged Downtime: <b>{((grandTotalMins || 0) / 60).toFixed(1)} hours</b> ({Math.round(grandTotalMins)} mins)
          </span>
        </div>
      </div>

      {/* Pareto Chart */}
      <div className={cardCls}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-500" />
            <span>Plant Downtime Pareto (Hours Lost by Root Cause)</span>
          </span>
          <span className={mutedCls}>
            Click any bar or row to inspect root cause &amp; action plan
          </span>
        </div>

        <SvgBarChart
          labels={paretoList.slice(0, 10).map(([k]) => k.length > 20 ? k.slice(0, 18) + '…' : k)}
          values={paretoList.slice(0, 10).map(([, v]) => +(v.totalMins / 60).toFixed(1))}
          color={dark ? '#ff6b6b' : '#d13a3a'}
          unit="hrs"
          dark={dark}
          onSelectIdx={(idx) => {
            if (paretoList[idx]) setSelectedCause(paretoList[idx][0]);
          }}
        />
      </div>

      {/* Selected Cause Deep-Dive Card */}
      {activeCauseKey && activeCauseObj && (
        <div className={`p-4 rounded-2xl border-2 border-amber-500/80 shadow-md ${
          dark ? 'bg-[#1a212b]' : 'bg-amber-50/60'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500 text-white">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <b className="text-base text-slate-900 dark:text-white">
                {activeCauseKey}
              </b>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
              <span>{((activeCauseObj.totalMins || 0) / 60).toFixed(1)} hrs lost</span>
              <span>· {activeCauseObj.count} occurrences</span>
            </div>
          </div>

          {/* Root cause, Action plan & Owner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-3">
            <div className={`p-3 rounded-xl border ${borderCls} ${dark ? 'bg-[#11161d]' : 'bg-white'}`}>
              <div className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Root Cause Analysis</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeExplain?.rootCause || 'Root cause under investigation by plant reliability engineer.'}
              </p>
            </div>

            <div className={`p-3 rounded-xl border ${borderCls} ${dark ? 'bg-[#11161d]' : 'bg-white'}`}>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Corrective Action Plan</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeExplain?.action || 'Implement standard operating procedure and maintenance work order.'}
              </p>
            </div>

            <div className={`p-3 rounded-xl border ${borderCls} ${dark ? 'bg-[#11161d]' : 'bg-white'}`}>
              <div className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 mb-1">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Responsible Owner</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                {activeExplain?.owner || 'Shift Technicians & Maintenance Lead'}
              </p>
            </div>
          </div>

          {/* Machines affected breakdown */}
          <div className="text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-800 dark:text-slate-200 mr-2">
              Machines Affected:
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              {Object.entries(activeCauseObj.machines)
                .map(([mName, mins]) => `${mName} (${((mins || 0) / 60).toFixed(1)}h)`)
                .join(' · ')}
            </span>
          </div>
        </div>
      )}

      {/* Full Pareto Table */}
      <div className={cardCls}>
        <div className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          All Logged Downtime Categories ({paretoList.length})
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className={`border-b ${borderCls} text-slate-500 dark:text-slate-400`}>
                <th className="py-2 px-2.5 font-bold">Category</th>
                <th className="py-2 px-2.5 font-bold">Total Lost (h)</th>
                <th className="py-2 px-2.5 font-bold">% of Plant Downtime</th>
                <th className="py-2 px-2.5 font-bold">Occurrences</th>
                <th className="py-2 px-2.5 font-bold">Machines Involved</th>
              </tr>
            </thead>
            <tbody>
              {paretoList.map(([cause, obj], idx) => {
                const isSel = activeCauseKey === cause;
                const pct = grandTotalMins > 0 ? (obj.totalMins / grandTotalMins) * 100 : 0;
                return (
                  <tr
                    key={idx}
                    onClick={() => setSelectedCause(isSel ? null : cause)}
                    className={`border-b last:border-b-0 ${borderCls} cursor-pointer transition ${
                      isSel ? 'bg-amber-500/15 font-semibold' : 'hover:bg-slate-500/5'
                    }`}
                  >
                    <td className="py-2 px-2.5 font-bold text-slate-900 dark:text-white">
                      {cause}
                    </td>
                    <td className="py-2 px-2.5 font-bold text-rose-600 dark:text-rose-400">
                      {((obj.totalMins || 0) / 60).toFixed(1)} h
                    </td>
                    <td className="py-2 px-2.5 font-bold">
                      {pct.toFixed(1)}%
                    </td>
                    <td className="py-2 px-2.5">{obj.count}</td>
                    <td className="py-2 px-2.5 text-slate-500 dark:text-slate-400">
                      {Object.keys(obj.machines).join(', ')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
