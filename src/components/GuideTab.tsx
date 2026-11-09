import React from 'react';
import { BookOpen, Calculator, Clock, Layers, ShieldCheck, Gauge } from 'lucide-react';

interface Props {
  dark?: boolean;
}

export const GuideTab: React.FC<Props> = ({ dark = false }) => {
  const cardCls = `rounded-2xl border p-4 shadow-xs transition-all ${
    dark ? 'bg-[#1a212b] border-[#2b3643] text-[#e8ecf1]' : 'bg-white border-[#dce1e8] text-[#18212d]'
  }`;
  const mutedCls = `text-xs ${dark ? 'text-[#97a3b2]' : 'text-[#64707f]'}`;
  const borderCls = dark ? 'border-[#2b3643]' : 'border-[#dce1e8]';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
      {/* 1. What is OEE? */}
      <div className={cardCls}>
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
          <Gauge className="w-4 h-4 text-blue-500" />
          <span>What is OEE?</span>
        </h2>
        <p className="my-1.5 leading-relaxed text-slate-700 dark:text-slate-300">
          <b>Overall Equipment Effectiveness (OEE)</b> measures the percentage of planned production time that is truly productive. It evaluates operational losses across three fundamental dimensions:
        </p>
        <div className="my-2 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 font-mono font-bold text-[#1f5fbf] dark:text-[#6aa5ff] text-center">
          OEE = Availability × Performance × Quality
        </div>
        <p className={mutedCls}>
          Industry benchmarks: <b>≥85%</b> is World Class, <b>60–84%</b> is Typical/Fair, and <b>&lt;60%</b> indicates major machine stoppage or cycle bottlenecks.
        </p>
      </div>

      {/* 2. Availability (A) */}
      <div className={cardCls}>
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>Availability (A)</span>
        </h2>
        <p className="my-1.5 leading-relaxed text-slate-700 dark:text-slate-300">
          Accounts for unpredicted and planned downtime losses (VFD alarms, power surges, mould water leaks, tool swaps):
        </p>
        <div className="my-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 font-mono font-bold text-amber-700 dark:text-amber-400 text-center">
          Availability = (Planned Mins − Downtime Mins) ÷ Planned Mins
        </div>
        <p className={mutedCls}>
          Planned shift durations: <b>11 hours (660 mins)</b> for Day Shifts, <b>13 hours (780 mins)</b> for Night Shifts.
        </p>
      </div>

      {/* 3. Performance (P) */}
      <div className={cardCls}>
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
          <Calculator className="w-4 h-4 text-emerald-500" />
          <span>Performance (P)</span>
        </h2>
        <p className="my-1.5 leading-relaxed text-slate-700 dark:text-slate-300">
          Evaluates speed loss and micro-stoppages. Measures whether machines ran at their rated cycle time during available operating minutes:
        </p>
        <div className="my-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 font-mono font-bold text-emerald-700 dark:text-emerald-400 text-center">
          Performance = Good Output ÷ (Target Output × Availability)
        </div>
        <p className={mutedCls}>
          Capped at 120% to prevent overspeed distortion when catching up post-stoppage.
        </p>
      </div>

      {/* 4. Quality (Q) */}
      <div className={cardCls}>
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
          <ShieldCheck className="w-4 h-4 text-indigo-500" />
          <span>Quality (Q)</span>
        </h2>
        <p className="my-1.5 leading-relaxed text-slate-700 dark:text-slate-300">
          Measures material conversion yield by comparing the total weight of saleable good units against raw material consumed:
        </p>
        <div className="my-2 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 font-mono font-bold text-indigo-700 dark:text-indigo-400 text-center">
          Quality = (Good Units × Unit Weight) ÷ Total Fed Material (kg)
        </div>
        <p className={mutedCls}>
          Standard weights: Caps = <b>2.5g</b>, Preforms = <b>13.5g</b>, Bottles = <b>23.5g</b>.
        </p>
      </div>

      {/* 5. Attainment vs OEE */}
      <div className={cardCls}>
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
          <Layers className="w-4 h-4 text-purple-500" />
          <span>Attainment vs. OEE</span>
        </h2>
        <p className="my-1.5 leading-relaxed text-slate-700 dark:text-slate-300">
          <b>Attainment</b> is simple volume adherence: <code>Good Output ÷ Target Output</code>. If a machine produces 178,500 of 182,761 target, attainment is <b>98%</b>.
        </p>
        <p className="my-1.5 leading-relaxed text-slate-700 dark:text-slate-300">
          <b>OEE</b> checks if the machine ran efficiently without masking downtime through excessive scrap or unmetered resin feed.
        </p>
      </div>

      {/* 6. Machine & Cavity Specifications */}
      <div className={cardCls}>
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
          <BookOpen className="w-4 h-4 text-teal-500" />
          <span>Machine Tooling &amp; Cavities</span>
        </h2>
        <ul className="space-y-1.5 leading-relaxed text-slate-700 dark:text-slate-300 text-[11px]">
          <li><b>Compression 1A &amp; 1B:</b> 24-cavity rotary continuous compression (5.2s cycle).</li>
          <li><b>Borun 01–03:</b> Double-station extrusion blow moulding for 2L containers (10–12s cycle).</li>
          <li><b>320T 01 &amp; 380T:</b> 16-cavity hot runner injection preform systems (13.5–16s cycle).</li>
          <li><b>Laser Printing:</b> High-speed closure promotional code marking (36,000+ units/shift).</li>
        </ul>
      </div>

      {/* 7. Real-Time Pipeline & Access Control */}
      <div className={`${cardCls} md:col-span-2 lg:col-span-3 border-blue-500/30 bg-blue-950/10`}>
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Real-Time Cloud Pipeline &amp; Role-Based Security</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] leading-relaxed">
          <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
            <b className="text-emerald-400 block">4-Tier Role-Based Access Control</b>
            <p className="text-slate-300">
              <b>1. Administrator:</b> Full system control, exclusive Upload tab, Gemini AI report extractor, cloud database seeding, and shift edits.
            </p>
            <p className="text-slate-300">
              <b>2. Managing Director:</b> Executive C-suite oversight, multi-department scorecard, executive shift PDF exports, and complete analytics.
            </p>
            <p className="text-slate-400">
              <b>3. Shift Supervisor &amp; Operator:</b> Floor operations, downtime causes, machine telemetry, and shift handovers.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
            <b className="text-blue-400 block">Instant Real-Time Synchronization</b>
            <p className="text-slate-300">
              Powered by Firebase Firestore <code>onSnapshot</code> listeners. Whenever an approved shift is submitted, all active factory TVs, floor tablets, and mobile phones update in sub-second latency with zero manual page reloading.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
            <b className="text-purple-400 block">Dual Real-Time Ingestion Architecture</b>
            <p className="text-slate-300">
              <b>Channel 1 (WhatsApp):</b> Copy/paste handover messages into the Smart Extractor with Gemini AI parsing and instant broadcast.
            </p>
            <p className="text-slate-300">
              <b>Channel 2 (Automated Gmail):</b> Run the free Google Apps Script trigger that polls incoming emails with subject <i>"Shift Report"</i> and calls <code>/api/ingest-report</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
