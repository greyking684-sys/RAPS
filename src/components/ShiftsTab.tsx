import React, { useState } from 'react';
import { ShiftReport, MachineRecord } from '../types/oee';
import {
  aggregateMachines,
  normalizeLeader,
  n0,
  pc,
  isScheduledPrimary,
} from '../utils/oeeCalculations';
import { getTextColor, ProgressBar } from './ProgressBar';
import { ChevronDown, ChevronRight, User, Award, Moon, Sun } from 'lucide-react';

interface Props {
  reports: ShiftReport[];
  selectedId: string;
  onSelectId: (id: string) => void;
  onSelectMachineModal: (m: MachineRecord | null) => void;
  dark?: boolean;
}

export const ShiftsTab: React.FC<Props> = ({
  reports: R,
  selectedId,
  onSelectId,
  onSelectMachineModal,
  dark = false,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedLeader, setSelectedLeader] = useState<string | null>(null);

  const cardCls = `rounded-2xl border p-4 shadow-xs transition-all ${
    dark ? 'bg-[#1a212b] border-[#2b3643] text-[#e8ecf1]' : 'bg-white border-[#dce1e8] text-[#18212d]'
  }`;
  const mutedCls = `text-xs ${dark ? 'text-[#97a3b2]' : 'text-[#64707f]'}`;
  const borderCls = dark ? 'border-[#2b3643]' : 'border-[#dce1e8]';

  // Day vs Night Comparison
  const shifts = ['day', 'night'] as const;
  const rs = shifts.map((s) => R.filter((r) => r.shift === s));
  const ag = rs.map((list) => aggregateMachines(list.flatMap((r) => r.ms)));
  const counts = rs.map((list) => list.length || 1);

  const measures: [string, (a: any, i: number) => number | null, (v: any) => string, boolean][] = [
    ['Attainment', (a) => a.att, pc, true],
    ['OEE', (a) => a.oee, pc, true],
    ['Housekeeping', (a) => a.hk, pc, true],
    ['Avg downtime per shift (h)', (a, i) => a.dt / 60 / counts[i], (v) => v.toFixed(1), false],
    ['Avg logged scrap per shift (kg)', (a, i) => a.sc / counts[i], (v) => v.toFixed(1), false],
  ];

  const measureRows = measures.map(([name, fn, fmt, higherBetter]) => {
    const v = ag.map((a, i) => fn(a, i));
    const w =
      v[0] == null || v[1] == null || v[0] === v[1]
        ? -1
        : v[0] > v[1] === higherBetter
        ? 0
        : 1;
    return { name, v0: fmt(v[0]), v1: fmt(v[1]), w };
  });

  // Shift Leader Grouping
  const leaderGroups: Record<string, { n: string; rs: ShiftReport[] }> = {};
  R.forEach((r) => {
    const name = normalizeLeader(r.ld);
    if (name === '–') return;
    if (!leaderGroups[name]) leaderGroups[name] = { n: name, rs: [] };
    leaderGroups[name].rs.push(r);
  });

  const leaderList = Object.values(leaderGroups)
    .map((g) => ({
      n: g.n,
      c: g.rs.length,
      a: aggregateMachines(g.rs.flatMap((r) => r.ms)),
      s: [...new Set(g.rs.map((r) => r.shift))].join('/'),
    }))
    .sort((x, y) => (y.a.att || 0) - (x.a.att || 0));

  const filteredReports = selectedLeader
    ? R.filter((r) => normalizeLeader(r.ld) === selectedLeader)
    : R;

  return (
    <div className="space-y-4">
      {/* Day vs Night Head-to-Head Comparison */}
      <div className={cardCls}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Shift Performance Benchmark (Day vs Night)</span>
          </span>
          <span className={mutedCls}>
            Across {R.length} recorded production shifts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className={`border-b ${borderCls} text-slate-500 dark:text-slate-400`}>
                  <th className="py-2 px-2.5 font-bold">Metric</th>
                  <th className="py-2 px-2.5 font-bold text-blue-600 dark:text-blue-400">
                    ☀️ Day ({counts[0]} shifts)
                  </th>
                  <th className="py-2 px-2.5 font-bold text-indigo-600 dark:text-indigo-400">
                    🌙 Night ({counts[1]} shifts)
                  </th>
                  <th className="py-2 px-2.5 font-bold">Advantage</th>
                </tr>
              </thead>
              <tbody>
                {measureRows.map((m, idx) => (
                  <tr key={idx} className={`border-b last:border-b-0 ${borderCls}`}>
                    <td className="py-2 px-2.5 font-medium">{m.name}</td>
                    <td className={`py-2 px-2.5 font-bold ${m.w === 0 ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                      {m.v0} {m.w === 0 ? '★' : ''}
                    </td>
                    <td className={`py-2 px-2.5 font-bold ${m.w === 1 ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                      {m.v1} {m.w === 1 ? '★' : ''}
                    </td>
                    <td className="py-2 px-2.5 text-[11px] text-slate-500">
                      {m.w === 0 ? 'Day' : m.w === 1 ? 'Night' : 'Tied'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Shift Leaders Leaderboard */}
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-500" />
                <span>Shift Leaders Leaderboard</span>
              </span>
              {selectedLeader && (
                <button
                  onClick={() => setSelectedLeader(null)}
                  className="text-[11px] text-blue-600 dark:text-blue-400 underline cursor-pointer"
                >
                  Clear filter ({selectedLeader})
                </button>
              )}
            </div>

            <div className="space-y-2">
              {leaderList.map((ldr, idx) => {
                const isSelected = selectedLeader === ldr.n;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedLeader(isSelected ? null : ldr.n)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10'
                        : `${borderCls} hover:bg-slate-500/5`
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-900 dark:text-white">
                        {idx + 1}. {ldr.n}
                      </span>
                      <span className={getTextColor(ldr.a.att, dark)}>
                        Attainment: {pc(ldr.a.att)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      <span>{ldr.c} shifts ({ldr.s})</span>
                      <span>OEE: {pc(ldr.a.oee)} · HK: {pc(ldr.a.hk)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Shift Ledger Table */}
      <div className={cardCls}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            Shift Ledger ({filteredReports.length} Shifts)
          </span>
          <span className={mutedCls}>
            Click any row to expand machine breakdown or select for full shift view
          </span>
        </div>

        <div className="space-y-2">
          {filteredReports.slice().reverse().map((rep) => {
            const a = aggregateMachines(rep.ms);
            const isExpanded = expandedId === rep.id;
            const isCurrent = selectedId === rep.id;

            return (
              <div
                key={rep.id}
                className={`rounded-xl border transition-all ${
                  isCurrent
                    ? 'border-blue-500 shadow-sm'
                    : borderCls
                } ${dark ? 'bg-[#11161d]' : 'bg-slate-50/50'}`}
              >
                {/* Summary Header Row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : rep.id)}
                  className="p-3 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label="Expand shift"
                      className="text-slate-400"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-blue-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <b className="text-sm text-slate-900 dark:text-white">{rep.date}</b>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rep.shift === 'day'
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                              : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400'
                          }`}
                        >
                          {rep.shift.toUpperCase()} ({rep.hrs}h)
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Leader: <b>{normalizeLeader(rep.ld)}</b>
                      </div>
                    </div>
                  </div>

                  {/* Shift KPI metrics */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <span className={mutedCls}>Attainment</span>
                      <div className={`font-black ${getTextColor(a.att, dark)}`}>
                        {pc(a.att)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={mutedCls}>OEE</span>
                      <div className={`font-black ${getTextColor(a.oee, dark)}`}>
                        {pc(a.oee)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={mutedCls}>Down</span>
                      <div className="font-bold text-slate-700 dark:text-slate-300">
                        {((a.dt || 0) / 60).toFixed(1)}h
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={mutedCls}>Scrap</span>
                      <div className="font-bold text-amber-600 dark:text-amber-400">
                        {(a.sc || 0).toFixed(1)}kg
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectId(rep.id);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    >
                      View Shift
                    </button>
                  </div>
                </div>

                {/* Expanded Machines Detail */}
                {isExpanded && (
                  <div className={`p-3 border-t ${borderCls} space-y-3 bg-white dark:bg-[#1a212b]`}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead>
                          <tr className={`border-b ${borderCls} text-slate-500 dark:text-slate-400`}>
                            <th className="py-1.5 px-2 font-bold">Machine</th>
                            <th className="py-1.5 px-2 font-bold">Dept</th>
                            <th className="py-1.5 px-2 font-bold">Status</th>
                            <th className="py-1.5 px-2 font-bold">Good</th>
                            <th className="py-1.5 px-2 font-bold">Target</th>
                            <th className="py-1.5 px-2 font-bold">Attain</th>
                            <th className="py-1.5 px-2 font-bold">OEE</th>
                            <th className="py-1.5 px-2 font-bold">Down (m)</th>
                            <th className="py-1.5 px-2 font-bold">Scrap (kg)</th>
                            <th className="py-1.5 px-2 font-bold">Handover Comment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rep.ms.map((m, mIdx) => (
                            <tr
                              key={mIdx}
                              onClick={() => onSelectMachineModal(m)}
                              className={`border-b last:border-b-0 ${borderCls} hover:bg-blue-500/10 cursor-pointer`}
                            >
                              <td className="py-1.5 px-2 font-bold text-blue-600 dark:text-blue-400 underline decoration-dotted">
                                {m.n}
                              </td>
                              <td className="py-1.5 px-2">{m.dept}</td>
                              <td className="py-1.5 px-2">
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  m.st === 'Running' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-amber-500/15 text-amber-600'
                                }`}>
                                  {m.st}
                                </span>
                              </td>
                              <td className="py-1.5 px-2 font-bold">{n0(m.good)}</td>
                              <td className="py-1.5 px-2">{n0(m.target)}</td>
                              <td className={`py-1.5 px-2 font-bold ${getTextColor(m.att, dark)}`}>
                                {pc(m.att)}
                              </td>
                              <td className={`py-1.5 px-2 font-bold ${getTextColor(m.oee, dark)}`}>
                                {pc(m.oee)}
                              </td>
                              <td className="py-1.5 px-2">{m.dt}</td>
                              <td className="py-1.5 px-2">{m.scrap || '–'}</td>
                              <td className="py-1.5 px-2 text-slate-500 dark:text-slate-400 max-w-[240px] truncate">
                                {m.cm || '–'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Flags / Notes */}
                    {(rep.flags.length > 0 || rep.notes.length > 0) && (
                      <div className="text-xs pt-1 border-t border-slate-200 dark:border-slate-800">
                        {rep.flags.map((f, i) => (
                          <div key={i} className="text-rose-600 dark:text-rose-400 font-medium">
                            🚩 {f}
                          </div>
                        ))}
                        {rep.notes.map((n, i) => (
                          <div key={i} className="text-slate-600 dark:text-slate-300">
                            • {n}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
