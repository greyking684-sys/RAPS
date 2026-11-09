import React from 'react';
import { ShiftReport } from '../types/oee';
import { avg, pc, DEPT } from '../utils/oeeCalculations';
import { getTextColor, ProgressBar } from './ProgressBar';
import { Sparkles, CheckSquare, Shield } from 'lucide-react';

interface Props {
  reports: ShiftReport[];
  dark?: boolean;
}

export const HousekeepingTab: React.FC<Props> = ({ reports: R, dark = false }) => {
  const cardCls = `rounded-2xl border p-4 shadow-xs transition-all ${
    dark ? 'bg-[#1a212b] border-[#2b3643] text-[#e8ecf1]' : 'bg-white border-[#dce1e8] text-[#18212d]'
  }`;
  const mutedCls = `text-xs ${dark ? 'text-[#97a3b2]' : 'text-[#64707f]'}`;
  const borderCls = dark ? 'border-[#2b3643]' : 'border-[#dce1e8]';

  const allHk = R.flatMap((r) =>
    r.ms.filter((m) => m.hk != null).map((m) => ({ ...m, d: r.date }))
  );

  const mm: Record<string, { d: string; v: number[] }> = {};
  allHk.forEach((m) => {
    if (!mm[m.n]) mm[m.n] = { d: m.dept, v: [] };
    if (m.hk != null) mm[m.n].v.push(m.hk);
  });

  const rankedList = Object.entries(mm)
    .map(([n, x]) => ({ n, d: x.d, a: avg(x.v) }))
    .sort((a, b) => (b.a || 0) - (a.a || 0));

  const deptHk = [DEPT.inj, DEPT.bm, DEPT.cc, DEPT.sec].map((d) => ({
    d,
    a: avg(rankedList.filter((x) => x.d === d).map((x) => x.a)),
  }));

  const fiveSStandards = [
    { title: '1. Sort (Seiri)', desc: 'Remove unused items, purge lumps, defective preforms, and damaged cartons from machine footprint.' },
    { title: '2. Set in Order (Seiton)', desc: 'Designate clear tool locations, regrind hopper bins, and spare water needle saddles.' },
    { title: '3. Shine (Seiso)', desc: 'Clean extruder barrels, wipe oil chiller sumps, clear floor purges and water puddles before shift handover.' },
    { title: '4. Standardize (Seiketsu)', desc: 'Maintain shift audit checklists, color-coded bins, and standard cycle time placards.' },
    { title: '5. Sustain (Shitsuke)', desc: 'Daily shift leader audits, handover score tracking, and team accountability across Day & Night shifts.' },
  ];

  return (
    <div className="space-y-4">
      {/* Department Scores Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {deptHk.map((x) => (
          <div key={x.d} className={cardCls}>
            <div className={mutedCls}>{x.d}</div>
            <div className={`text-3xl font-black mt-1 ${getTextColor(x.a, dark)}`}>
              {pc(x.a)}
            </div>
            <div className="mt-2">
              <ProgressBar val={x.a} dark={dark} />
            </div>
          </div>
        ))}
      </div>

      {/* Machine 5S Audit Rankings Table */}
      <div className={cardCls}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Machine Housekeeping (5S) Average Audit Scores</span>
          </span>
          <span className={mutedCls}>
            Audit target: 90%+ across all production centers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className={`border-b ${borderCls} text-slate-500 dark:text-slate-400`}>
                <th className="py-2 px-2.5 font-bold">Rank</th>
                <th className="py-2 px-2.5 font-bold">Machine</th>
                <th className="py-2 px-2.5 font-bold">Department</th>
                <th className="py-2 px-2.5 font-bold">5S Audit Score</th>
                <th className="py-2 px-2.5 font-bold min-w-[120px]">Performance Band</th>
                <th className="py-2 px-2.5 font-bold">Compliance Status</th>
              </tr>
            </thead>
            <tbody>
              {rankedList.map((row, idx) => (
                <tr key={idx} className={`border-b last:border-b-0 ${borderCls}`}>
                  <td className="py-2 px-2.5 font-bold text-slate-400">{idx + 1}</td>
                  <td className="py-2 px-2.5 font-bold text-slate-900 dark:text-white">{row.n}</td>
                  <td className="py-2 px-2.5">{row.d}</td>
                  <td className={`py-2 px-2.5 font-bold ${getTextColor(row.a, dark)}`}>
                    {pc(row.a)}
                  </td>
                  <td className="py-2 px-2.5">
                    <ProgressBar val={row.a} dark={dark} />
                  </td>
                  <td className="py-2 px-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        (row.a || 0) >= 0.9
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : (row.a || 0) >= 0.8
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {(row.a || 0) >= 0.9 ? 'Exemplary' : (row.a || 0) >= 0.8 ? 'Acceptable' : 'Audit Priority'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5S Housekeeping Standards Guide */}
      <div className={cardCls}>
        <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-blue-500" />
          <span>Plant 5S Standard Operating Guidelines</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          {fiveSStandards.map((std, i) => (
            <div key={i} className={`p-3 rounded-xl border ${borderCls} ${dark ? 'bg-[#11161d]' : 'bg-slate-50'}`}>
              <b className="text-slate-900 dark:text-white block mb-1">{std.title}</b>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">{std.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
