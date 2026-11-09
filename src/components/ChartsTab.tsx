import React, { useState } from 'react';
import { ShiftReport } from '../types/oee';
import {
  aggregateMachines,
  isScheduledPrimary,
  n0,
  pc,
  DEPT,
} from '../utils/oeeCalculations';
import { getTextColor, ProgressBar } from './ProgressBar';
import { SvgLineChart, SvgBarChart } from './SvgCharts';
import { BarChart3, PieChart, Layers } from 'lucide-react';

interface Props {
  reports: ShiftReport[];
  dark?: boolean;
}

export const ChartsTab: React.FC<Props> = ({ reports: R, dark = false }) => {
  const [selectedShiftIdx, setSelectedShiftIdx] = useState<number>(R.length - 1);

  const cardCls = `rounded-2xl border p-4 shadow-xs transition-all ${
    dark ? 'bg-[#1a212b] border-[#2b3643] text-[#e8ecf1]' : 'bg-white border-[#dce1e8] text-[#18212d]'
  }`;
  const mutedCls = `text-xs ${dark ? 'text-[#97a3b2]' : 'text-[#64707f]'}`;
  const borderCls = dark ? 'border-[#2b3643]' : 'border-[#dce1e8]';

  const lb = R.map((r) => r.date.slice(5) + (r.shift === 'day' ? ' D' : ' N'));
  const depts = [DEPT.inj, DEPT.bm, DEPT.cc];

  // Loss waterfall by department
  const lost = depts.map((d) => {
    let G = 0,
      dl = 0,
      sl = 0;
    R.forEach((r) => {
      r.ms
        .filter((m) => m.dept === d && isScheduledPrimary(m))
        .forEach((m) => {
          G += m.good;
          dl += m.target * (1 - m.av);
          sl += Math.max(0, m.target * m.av - m.good);
        });
    });
    const tot = G + dl + sl || 1;
    return { d, g: G / tot, dl: dl / tot, sl: sl / tot, G, dlPcs: dl, slPcs: sl };
  });

  const activeRep = R[selectedShiftIdx] || R[R.length - 1];
  const activeAgg = activeRep ? aggregateMachines(activeRep.ms) : null;

  // Machine scrap summary across shifts
  const scrapMap: Record<string, number> = {};
  R.forEach((r) =>
    r.ms.forEach((m) => {
      if (m.scrap > 0) {
        scrapMap[m.n] = (scrapMap[m.n] || 0) + m.scrap;
      }
    })
  );
  const scrapMachines = Object.entries(scrapMap).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-4">
      {/* Interactive Shift Selector Ribbon */}
      <div className={cardCls}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1f5fbf] dark:text-[#6aa5ff]">
            🎯 Interactive Chart Shift Selector (Click any shift pill below):
          </span>
          <span className={mutedCls}>
            Selected: <b>{activeRep?.date} ({activeRep?.shift.toUpperCase()})</b>
          </span>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {R.map((rep, idx) => {
            const ra = aggregateMachines(rep.ms);
            const isSel = selectedShiftIdx === idx;
            return (
              <button
                key={rep.id}
                onClick={() => setSelectedShiftIdx(idx)}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium whitespace-nowrap cursor-pointer transition ${
                  isSel
                    ? 'bg-[#1f5fbf] text-white border-[#1f5fbf] shadow-sm'
                    : dark
                    ? 'bg-[#11161d] border-[#2b3643] text-slate-300 hover:bg-[#1a212b]'
                    : 'bg-slate-50 border-[#dce1e8] text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div>{rep.date.slice(5)} {rep.shift === 'day' ? '☀️' : '🌙'}</div>
                <div className={`text-[10px] font-bold ${isSel ? 'text-white' : getTextColor(ra.att, dark)}`}>
                  {pc(ra.att)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Shift Snapshot */}
      {activeRep && activeAgg && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className={`${cardCls} py-3`}>
            <span className={mutedCls}>Shift Attainment</span>
            <div className={`text-xl font-black mt-0.5 ${getTextColor(activeAgg.att, dark)}`}>
              {pc(activeAgg.att)}
            </div>
            <div className={mutedCls}>{n0(activeAgg.G)} of {n0(activeAgg.T)} pcs</div>
          </div>
          <div className={`${cardCls} py-3`}>
            <span className={mutedCls}>Shift OEE</span>
            <div className={`text-xl font-black mt-0.5 ${getTextColor(activeAgg.oee, dark)}`}>
              {pc(activeAgg.oee)}
            </div>
            <div className={mutedCls}>Availability × Perf × Qual</div>
          </div>
          <div className={`${cardCls} py-3`}>
            <span className={mutedCls}>Shift Downtime</span>
            <div className="text-xl font-black mt-0.5 text-slate-800 dark:text-slate-100">
              {((activeAgg.dt || 0) / 60).toFixed(1)} h
            </div>
            <div className={mutedCls}>{activeAgg.dt} mins total</div>
          </div>
          <div className={`${cardCls} py-3`}>
            <span className={mutedCls}>Logged Scrap</span>
            <div className="text-xl font-black mt-0.5 text-amber-600 dark:text-amber-400">
              {(activeAgg.sc || 0).toFixed(1)} kg
            </div>
            <div className={mutedCls}>Leader: {activeRep.ld}</div>
          </div>
        </div>
      )}

      {/* Waterfall: Loss Breakdown by Department */}
      <div className={cardCls}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-500" />
            <span>Capacity &amp; Loss Waterfall (Across All Shifts)</span>
          </span>
          <span className={mutedCls}>
            Target vs Operating Output vs Downtime &amp; Speed Losses
          </span>
        </div>

        <div className="space-y-4">
          {lost.map(({ d, g, dl, sl, G, dlPcs, slPcs }) => (
            <div key={d} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-900 dark:text-white">{d}</span>
                <span className="text-slate-500 dark:text-slate-400 font-normal">
                  Good: <b>{pc(g)}</b> ({n0(G)} pcs) · Down loss: <b>{pc(dl)}</b> · Speed loss: <b>{pc(sl)}</b>
                </span>
              </div>

              {/* Stacked Bar */}
              <div className="h-4 rounded-lg overflow-hidden flex bg-slate-200 dark:bg-slate-700">
                <div
                  style={{ width: `${g * 100}%` }}
                  className="bg-emerald-500 transition-all duration-300"
                  title={`Good Output: ${pc(g)}`}
                />
                <div
                  style={{ width: `${dl * 100}%` }}
                  className="bg-rose-500 transition-all duration-300"
                  title={`Downtime Loss: ${pc(dl)}`}
                />
                <div
                  style={{ width: `${sl * 100}%` }}
                  className="bg-amber-500 transition-all duration-300"
                  title={`Speed Loss: ${pc(sl)}`}
                />
              </div>

              <div className="flex items-center gap-4 text-[10px] text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Good Output ({pc(g)})
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Downtime Loss ({pc(dl)})
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Speed / Cycle Loss ({pc(sl)})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Machine Scrap Distribution Chart */}
      <div className={cardCls}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-500" />
            <span>Cumulative Scrap Generation by Machine (kg)</span>
          </span>
          <span className={mutedCls}>Across recorded production history</span>
        </div>

        <SvgBarChart
          labels={scrapMachines.map(([name]) => name)}
          values={scrapMachines.map(([, kg]) => kg)}
          color={dark ? '#f0b040' : '#c98200'}
          unit="kg"
          dark={dark}
        />
      </div>
    </div>
  );
};
