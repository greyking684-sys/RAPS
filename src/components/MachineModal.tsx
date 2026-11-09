import React from 'react';
import { MachineRecord } from '../types/oee';
import { n0, pc } from '../utils/oeeCalculations';
import { getTextColor, ProgressBar } from './ProgressBar';
import { X, Wrench, AlertTriangle, ShieldCheck, Cpu, Clock, Layers } from 'lucide-react';

interface Props {
  machine: MachineRecord | null;
  shiftDate: string;
  shiftType: string;
  dark?: boolean;
  onClose: () => void;
}

export const MachineModal: React.FC<Props> = ({
  machine,
  shiftDate,
  shiftType,
  dark = false,
  onClose,
}) => {
  if (!machine) return null;

  const borderCls = dark ? 'border-[#2b3643]' : 'border-[#dce1e8]';
  const mutedCls = `text-xs ${dark ? 'text-[#97a3b2]' : 'text-[#64707f]'}`;

  return (
    <div className={`mt-3.5 p-4 rounded-2xl border-2 border-[#1f5fbf] shadow-lg ${
      dark ? 'bg-[#11161d]' : 'bg-blue-50/80'
    }`}>
      {/* Modal Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-[#1f5fbf] text-white">
            {machine.dept}
          </span>
          <b className="text-base text-slate-900 dark:text-white">
            {machine.n} — Shift Deep-Dive ({shiftDate} {shiftType.toUpperCase()})
          </b>
        </div>
        <button
          onClick={onClose}
          aria-label="Close machine deep-dive"
          className="text-xs font-bold px-3 py-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition"
        >
          ✕ Close
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs mb-3">
        {/* Good vs Target */}
        <div className={`p-3 rounded-xl border ${borderCls} ${dark ? 'bg-[#1a212b]' : 'bg-white'}`}>
          <span className={mutedCls}>Good vs Target</span>
          <div className="text-sm font-black mt-1 text-slate-900 dark:text-white">
            {n0(machine.good)} / {n0(machine.target)} pcs
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className={getTextColor(machine.att, dark)}>
              Attainment: <b>{pc(machine.att)}</b>
            </span>
            <span className="text-[11px] text-slate-400">
              Shortfall: {n0(Math.max(0, machine.target - machine.good))} pcs
            </span>
          </div>
          <div className="mt-2">
            <ProgressBar val={machine.att} dark={dark} />
          </div>
        </div>

        {/* OEE Breakdown */}
        <div className={`p-3 rounded-xl border ${borderCls} ${dark ? 'bg-[#1a212b]' : 'bg-white'}`}>
          <span className={mutedCls}>OEE (A × P × Q)</span>
          <div className={`text-sm font-black mt-1 ${getTextColor(machine.oee, dark)}`}>
            OEE: {pc(machine.oee)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Avail <b>{pc(machine.av)}</b> · Perf <b>{pc(machine.perf)}</b> · Qual <b>{pc(machine.q)}</b>
          </div>
          <div className="mt-2">
            <ProgressBar val={machine.oee} dark={dark} />
          </div>
        </div>

        {/* Downtime & Handover */}
        <div className={`p-3 rounded-xl border ${borderCls} ${dark ? 'bg-[#1a212b]' : 'bg-white'}`}>
          <span className={mutedCls}>Downtime &amp; Status</span>
          <div className="text-sm font-black mt-1 text-slate-900 dark:text-white flex items-center gap-2">
            <span>{machine.dt} mins down</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              machine.st === 'Running'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
            }`}>
              {machine.st}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {machine.cm || 'Machine running normally'}
          </div>
        </div>

        {/* Material & Loss */}
        <div className={`p-3 rounded-xl border ${borderCls} ${dark ? 'bg-[#1a212b]' : 'bg-white'}`}>
          <span className={mutedCls}>Material &amp; Loss</span>
          <div className="text-sm font-black mt-1 text-slate-900 dark:text-white">
            {machine.scrap || 0} kg scrap {machine.mat ? `· ${machine.mat} kg fed` : ''}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>Loss: {(machine.loss || 0).toFixed(1)} kg</span>
            {machine.unl && (
              <span className="font-bold text-rose-500 inline-flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Unaccounted loss
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Causes & Comments row */}
      {(machine.causes.length > 0 || machine.cm) && (
        <div className={`p-3 rounded-xl border mb-3 ${borderCls} ${dark ? 'bg-[#1a212b]' : 'bg-white'}`}>
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-blue-500" />
            <span>Logged Downtime Causes &amp; Handover Details:</span>
          </div>
          {machine.causes.length > 0 && (
            <ul className="list-disc pl-5 text-xs text-slate-600 dark:text-slate-300 space-y-0.5 mb-2">
              {machine.causes.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          )}
          {machine.cm && (
            <div className="text-xs text-slate-500 dark:text-slate-400 italic">
              " {machine.cm} "
            </div>
          )}
        </div>
      )}

      {/* Technical Specifications */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className={`p-2 rounded-xl border ${borderCls} ${dark ? 'bg-[#1a212b]' : 'bg-white'}`}>
          <span className={mutedCls}>Cavities</span>
          <div className="font-bold mt-0.5 text-slate-800 dark:text-slate-200">
            {machine.cav || '–'}
          </div>
        </div>
        <div className={`p-2 rounded-xl border ${borderCls} ${dark ? 'bg-[#1a212b]' : 'bg-white'}`}>
          <span className={mutedCls}>Cycle Time</span>
          <div className="font-bold mt-0.5 text-slate-800 dark:text-slate-200">
            {machine.cyc ? `${machine.cyc}s` : '–'}
          </div>
        </div>
        <div className={`p-2 rounded-xl border ${borderCls} ${dark ? 'bg-[#1a212b]' : 'bg-white'}`}>
          <span className={mutedCls}>Housekeeping (5S)</span>
          <div className={`font-bold mt-0.5 ${getTextColor(machine.hk, dark)}`}>
            {pc(machine.hk)}
          </div>
        </div>
      </div>
    </div>
  );
};
