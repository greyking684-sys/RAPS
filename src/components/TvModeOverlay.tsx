import React from 'react';
import { ShiftReport } from '../types/oee';
import {
  aggregateMachines,
  normalizeLeader,
  groupDowntimeCause,
} from '../utils/oeeCalculations';
import { SvgLineChart } from './SvgCharts';
import { Tv, Play, Pause, ChevronRight, ChevronLeft, X } from 'lucide-react';

interface Props {
  report: ShiftReport;
  allReports: ShiftReport[];
  tvSlide: number;
  tvPaused: boolean;
  onSetSlide: (slide: number) => void;
  onTogglePause: () => void;
  onExit: () => void;
}

export const TvModeOverlay: React.FC<Props> = ({
  report,
  allReports,
  tvSlide,
  tvPaused,
  onSetSlide,
  onTogglePause,
  onExit,
}) => {
  const r = report;
  const A = aggregateMachines(r.ms);

  const allPareto: Record<string, number> = {};
  allReports.forEach((rep) =>
    rep.ms.forEach((m) => {
      const cLen = (m.causes || []).length;
      if (cLen > 0) {
        m.causes.forEach((txt) => {
          const k = groupDowntimeCause(txt);
          if (k) allPareto[k] = (allPareto[k] || 0) + m.dt / cLen;
        });
      } else if (m.dt > 0) {
        const k = groupDowntimeCause(m.cm) || 'Unclassified stop';
        allPareto[k] = (allPareto[k] || 0) + m.dt;
      }
    })
  );

  const topCauses = Object.entries(allPareto)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const slides = [
    [0, '1. Shift KPIs & Depts'],
    [1, '2. Machine Status Board'],
    [2, '3. Trend & OEE Progression'],
    [3, '4. Top Downtime & Alerts'],
  ] as const;

  return (
    <div className="fixed inset-0 z-50 bg-[#070b12] text-white p-6 flex flex-col justify-between font-sans overflow-y-auto">
      {/* TV Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Tv className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ● LIVE FACTORY TV MODE
              </span>
              <span className="text-xs text-slate-400">
                Rig &amp; Plant Services · Harare
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight mt-0.5">
              Shift {r.date} ({r.shift.toUpperCase()}) · Leader: {normalizeLeader(r.ld)}
            </h1>
          </div>
        </div>

        {/* Slide Selector Buttons & Play/Pause & Exit */}
        <div className="flex flex-wrap items-center gap-2">
          {slides.map(([idx, title]) => (
            <button
              key={idx}
              onClick={() => onSetSlide(idx)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${
                tvSlide === idx
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {title}
            </button>
          ))}
          <button
            onClick={onTogglePause}
            aria-label={tvPaused ? 'Play slide rotation' : 'Pause slide rotation'}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            {tvPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
          </button>
          <button
            onClick={onExit}
            aria-label="Exit TV Mode"
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>Exit TV Mode</span>
          </button>
        </div>
      </div>

      {/* Slide Body */}
      <div className="my-auto py-6">
        {/* Slide 0: Shift KPIs & Depts */}
        {tvSlide === 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Attainment
                </span>
                <div className="text-5xl font-black text-emerald-400 mt-2">
                  {Math.round((A.att || 0) * 100)}%
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {(A.G || 0).toLocaleString()} / {(A.T || 0).toLocaleString()} pcs
                </div>
              </div>

              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  OEE (Scheduled)
                </span>
                <div className="text-5xl font-black text-blue-400 mt-2">
                  {Math.round((A.oee || 0) * 100)}%
                </div>
                <div className="text-xs text-slate-400 mt-1">Avail × Perf × Qual</div>
              </div>

              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Downtime
                </span>
                <div className="text-5xl font-black text-amber-400 mt-2">
                  {((A.dt || 0) / 60).toFixed(1)} h
                </div>
                <div className="text-xs text-slate-400 mt-1">{A.dt || 0} mins total</div>
              </div>

              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Logged Scrap
                </span>
                <div className="text-5xl font-black text-purple-400 mt-2">
                  {(A.sc || 0).toFixed(1)} kg
                </div>
                <div className="text-xs text-slate-400 mt-1">Floor &amp; purge scrap</div>
              </div>

              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Housekeeping
                </span>
                <div className="text-5xl font-black text-emerald-400 mt-2">
                  {Math.round((A.hk || 0) * 100)}%
                </div>
                <div className="text-xs text-slate-400 mt-1">5S shift audit score</div>
              </div>
            </div>

            {/* Department Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Injection', 'Blow Moulding', 'Cap Compression'].map((deptName) => {
                const dMs = r.ms.filter((m) => m.dept === deptName);
                const dAgg = aggregateMachines(dMs);
                return (
                  <div
                    key={deptName}
                    className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold">{deptName}</h2>
                      <span className="px-3 py-1 rounded-full text-sm font-bold bg-blue-500/20 text-blue-400">
                        OEE {Math.round((dAgg.oee || 0) * 100)}%
                      </span>
                    </div>
                    <div className="text-4xl font-black text-emerald-400">
                      {Math.round((dAgg.att || 0) * 100)}%{' '}
                      <span className="text-sm font-normal text-slate-400">attainment</span>
                    </div>
                    <div className="text-sm text-slate-300">
                      {dAgg.G.toLocaleString()} / {dAgg.T.toLocaleString()} pcs · Down{' '}
                      {((dAgg.dt || 0) / 60).toFixed(1)}h
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Slide 1: Machine Status Board */}
        {tvSlide === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {r.ms.map((m, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-2 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold">{m.dept}</span>
                    <h3 className="text-lg font-bold text-white">{m.n}</h3>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      m.st === 'Running'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {m.st}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-slate-400 block">Attain</span>
                    <b className="text-emerald-400">{Math.round((m.att || 0) * 100)}%</b>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Down</span>
                    <b className="text-rose-400">{m.dt}m</b>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Scrap</span>
                    <b className="text-amber-400">{m.scrap || 0}kg</b>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Slide 2: Attainment & OEE Progression */}
        {tvSlide === 2 && (
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">
              📈 Shift-by-Shift Attainment &amp; OEE Progression ({allReports.length} Shifts)
            </h2>
            <SvgLineChart
              labels={allReports.map((x) => x.date.slice(5) + (x.shift === 'day' ? ' D' : ' N'))}
              series={[
                {
                  n: 'Attainment',
                  c: '#6aa5ff',
                  v: allReports.map((x) => aggregateMachines(x.ms).att),
                },
                {
                  n: 'OEE',
                  c: '#3ecf82',
                  v: allReports.map((x) => aggregateMachines(x.ms).oee),
                },
              ]}
              maxVal={1}
              refLine={0.9}
              dark={true}
            />
          </div>
        )}

        {/* Slide 3: Top Downtime & Alerts */}
        {tvSlide === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl">
              <h2 className="text-xl font-bold mb-4 text-amber-400">
                🔧 Top Plant Downtime Causes (Hours Lost)
              </h2>
              <div className="space-y-4">
                {topCauses.map(([cause, mins], idx) => {
                  const maxMins = topCauses[0]?.[1] || 1;
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-base">
                        <span className="font-bold">{cause}</span>
                        <span className="text-amber-400 font-extrabold">
                          {(mins / 60).toFixed(1)} hrs
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-rose-500"
                          style={{
                            width: `${Math.min(100, (mins / maxMins) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl">
              <h2 className="text-xl font-bold mb-4 text-rose-400">
                🚩 Critical Floor Flags &amp; Priorities
              </h2>
              <ul className="space-y-3 text-base text-slate-200 list-disc pl-6">
                {[...(r.flags || []), ...(r.notes || [])].map((f, i) => (
                  <li key={i} className="leading-relaxed">
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* TV Footer */}
      <div className="flex items-center justify-between text-sm text-slate-400 border-t border-slate-800 pt-4">
        <span>Colour Key: Green ≥90% · Amber 60–89% · Red &lt;60%</span>
        <span>
          Auto-rotating slide {tvSlide + 1} of 4 · Click any button above to lock view
        </span>
      </div>
    </div>
  );
};
