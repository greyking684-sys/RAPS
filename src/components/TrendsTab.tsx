import React, { useState } from 'react';
import { ShiftReport } from '../types/oee';
import {
  aggregateMachines,
  getMondayWeekKey,
  n0,
  pc,
} from '../utils/oeeCalculations';
import { getTextColor, ProgressBar } from './ProgressBar';
import { SvgLineChart } from './SvgCharts';
import { TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Props {
  reports: ShiftReport[];
  dark?: boolean;
}

export const TrendsTab: React.FC<Props> = ({ reports: R, dark = false }) => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [selectedTrendKey, setSelectedTrendKey] = useState<string | null>(null);

  const cardCls = `rounded-2xl border p-4 shadow-xs transition-all ${
    dark ? 'bg-[#1a212b] border-[#2b3643] text-[#e8ecf1]' : 'bg-white border-[#dce1e8] text-[#18212d]'
  }`;
  const mutedCls = `text-xs ${dark ? 'text-[#97a3b2]' : 'text-[#64707f]'}`;
  const borderCls = dark ? 'border-[#2b3643]' : 'border-[#dce1e8]';

  const keyFn = {
    day: (r: ShiftReport) => r.date,
    week: (r: ShiftReport) => getMondayWeekKey(r.date),
    month: (r: ShiftReport) => r.date.slice(0, 7),
  }[period];

  const groups: Record<string, any[]> = {};
  const shiftGroups: Record<string, ShiftReport[]> = {};

  R.forEach((r) => {
    const k = keyFn(r);
    if (!groups[k]) groups[k] = [];
    if (!shiftGroups[k]) shiftGroups[k] = [];
    groups[k].push(...r.ms);
    shiftGroups[k].push(r);
  });

  const periodKeys = Object.keys(groups).sort();
  let prevAtt: number | null = null;
  let prevOee: number | null = null;

  const trendRows = periodKeys.map((k) => {
    const a = aggregateMachines(groups[k]);
    const diff = prevAtt != null && a.att != null ? (a.att - prevAtt) * 100 : null;
    const oeeDiff = prevOee != null && a.oee != null ? (a.oee - prevOee) * 100 : null;
    prevAtt = a.att;
    prevOee = a.oee;
    return { k, a, diff, oeeDiff, reps: shiftGroups[k] || [] };
  });

  const chartLabels = trendRows.map((row) =>
    period === 'day' ? row.k.slice(5) : row.k
  );

  return (
    <div className="space-y-4">
      {/* Header with Period Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label htmlFor="trend-period" className="sr-only">
            Select Trend Period
          </label>
          <select
            id="trend-period"
            value={period}
            onChange={(e) => {
              setPeriod(e.target.value as any);
              setSelectedTrendKey(null);
            }}
            className={`px-3.5 py-2 rounded-xl border text-sm font-bold cursor-pointer ${
              dark
                ? 'bg-[#1a212b] border-[#2b3643] text-[#e8ecf1]'
                : 'bg-white border-[#dce1e8] text-[#18212d]'
            }`}
          >
            <option value="day">Daily Aggregation</option>
            <option value="week">Weekly Aggregation (Mon–Sun)</option>
            <option value="month">Monthly Aggregation</option>
          </select>
          <span className={mutedCls}>
            Tracking Attainment &amp; OEE progression over time
          </span>
        </div>
      </div>

      {/* Interactive Trend Chart */}
      <div className={cardCls}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span>Attainment &amp; OEE Trend Curve</span>
          </span>
          <span className={mutedCls}>Green target line at 90%</span>
        </div>

        <SvgLineChart
          labels={chartLabels}
          series={[
            {
              n: 'Attainment',
              c: dark ? '#6aa5ff' : '#1f5fbf',
              v: trendRows.map((r) => r.a.att),
            },
            {
              n: 'OEE',
              c: dark ? '#3ecf82' : '#17935a',
              v: trendRows.map((r) => r.a.oee),
            },
          ]}
          maxVal={1}
          refLine={0.9}
          dark={dark}
        />
      </div>

      {/* Aggregate Period Table */}
      <div className={cardCls}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            Performance Ledger by {period === 'day' ? 'Date' : period === 'week' ? 'Week' : 'Month'}
          </span>
          <span className={mutedCls}>
            Click any row to inspect shifts within that period
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className={`border-b ${borderCls} text-slate-500 dark:text-slate-400`}>
                <th className="py-2 px-2.5 font-bold">Period</th>
                <th className="py-2 px-2.5 font-bold">Shifts</th>
                <th className="py-2 px-2.5 font-bold">Target pcs</th>
                <th className="py-2 px-2.5 font-bold">Good pcs</th>
                <th className="py-2 px-2.5 font-bold">Attainment</th>
                <th className="py-2 px-2.5 font-bold min-w-[90px]">Progress</th>
                <th className="py-2 px-2.5 font-bold">Attain Δ</th>
                <th className="py-2 px-2.5 font-bold">OEE</th>
                <th className="py-2 px-2.5 font-bold">OEE Δ</th>
                <th className="py-2 px-2.5 font-bold">Downtime (h)</th>
                <th className="py-2 px-2.5 font-bold">Scrap (kg)</th>
                <th className="py-2 px-2.5 font-bold">HK</th>
              </tr>
            </thead>
            <tbody>
              {trendRows.map((row, idx) => {
                const isSel = selectedTrendKey === row.k;
                return (
                  <tr
                    key={idx}
                    onClick={() => setSelectedTrendKey(isSel ? null : row.k)}
                    className={`border-b last:border-b-0 ${borderCls} cursor-pointer transition ${
                      isSel ? 'bg-blue-500/15 font-semibold' : 'hover:bg-slate-500/5'
                    }`}
                  >
                    <td className="py-2 px-2.5 font-bold text-blue-600 dark:text-blue-400">
                      {row.k}
                    </td>
                    <td className="py-2 px-2.5">{row.reps.length}</td>
                    <td className="py-2 px-2.5">{n0(row.a.T)}</td>
                    <td className="py-2 px-2.5 font-bold">{n0(row.a.G)}</td>
                    <td className={`py-2 px-2.5 font-bold ${getTextColor(row.a.att, dark)}`}>
                      {pc(row.a.att)}
                    </td>
                    <td className="py-2 px-2.5">
                      <ProgressBar val={row.a.att} dark={dark} />
                    </td>
                    <td className="py-2 px-2.5">
                      {row.diff == null ? (
                        '–'
                      ) : (
                        <span
                          className={`inline-flex items-center gap-0.5 font-bold ${
                            row.diff >= 0 ? 'text-emerald-500' : 'text-rose-500'
                          }`}
                        >
                          {row.diff >= 0 ? '+' : ''}
                          {row.diff.toFixed(1)}%
                        </span>
                      )}
                    </td>
                    <td className={`py-2 px-2.5 font-bold ${getTextColor(row.a.oee, dark)}`}>
                      {pc(row.a.oee)}
                    </td>
                    <td className="py-2 px-2.5">
                      {row.oeeDiff == null ? (
                        '–'
                      ) : (
                        <span
                          className={`inline-flex items-center gap-0.5 font-bold ${
                            row.oeeDiff >= 0 ? 'text-emerald-500' : 'text-rose-500'
                          }`}
                        >
                          {row.oeeDiff >= 0 ? '+' : ''}
                          {row.oeeDiff.toFixed(1)}%
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-2.5">{((row.a.dt || 0) / 60).toFixed(1)}</td>
                    <td className="py-2 px-2.5">{(row.a.sc || 0).toFixed(1)}</td>
                    <td className={`py-2 px-2.5 font-bold ${getTextColor(row.a.hk, dark)}`}>
                      {pc(row.a.hk)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Selected Period Shift List Drilldown */}
        {selectedTrendKey && (
          <div className={`mt-3.5 p-3 rounded-xl border ${borderCls} bg-slate-50 dark:bg-slate-800/40`}>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
              Shifts within Period {selectedTrendKey}:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {(shiftGroups[selectedTrendKey] || []).map((sh) => {
                const sAgg = aggregateMachines(sh.ms);
                return (
                  <div
                    key={sh.id}
                    className={`p-2 rounded-lg border ${borderCls} bg-white dark:bg-[#1a212b] flex items-center justify-between`}
                  >
                    <div>
                      <b className="text-slate-900 dark:text-white">{sh.date}</b> ({sh.shift.toUpperCase()})
                      <div className="text-[11px] text-slate-500">Leader: {sh.ld}</div>
                    </div>
                    <div className="text-right">
                      <div className={getTextColor(sAgg.att, dark)}>
                        Attain: <b>{pc(sAgg.att)}</b>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        OEE: {pc(sAgg.oee)} · Down: {((sAgg.dt || 0) / 60).toFixed(1)}h
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
