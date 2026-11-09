import React from 'react';

interface Props {
  val: number | null | undefined;
  dark?: boolean;
  forceClass?: string;
  className?: string;
}

export const ProgressBar: React.FC<Props> = ({ val, dark = false, forceClass, className = '' }) => {
  const pct = Math.min(100, Math.max(0, (val || 0) * 100));

  const barBgColor = (v: number | null | undefined) => {
    if (v == null) return 'bg-[#1f5fbf]';
    if (v >= 0.9) return dark ? 'bg-[#3ecf82]' : 'bg-[#17935a]';
    if (v >= 0.6) return dark ? 'bg-[#f0b040]' : 'bg-[#c98200]';
    return dark ? 'bg-[#ff6b6b]' : 'bg-[#d13a3a]';
  };

  const fillCls = forceClass || barBgColor(val);

  return (
    <div
      className={`h-2 rounded overflow-hidden min-w-[75px] ${
        dark ? 'bg-[#2b3643]' : 'bg-[#dce1e8]'
      } ${className}`}
    >
      <i
        className={`block h-full transition-all duration-300 ${fillCls}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

export const getTextColor = (v: number | null | undefined, dark = false) => {
  if (v == null) return dark ? 'text-slate-400' : 'text-slate-500';
  if (v >= 0.9) return dark ? 'text-[#3ecf82]' : 'text-[#17935a]';
  if (v >= 0.6) return dark ? 'text-[#f0b040]' : 'text-[#c98200]';
  return dark ? 'text-[#ff6b6b]' : 'text-[#d13a3a]';
};
