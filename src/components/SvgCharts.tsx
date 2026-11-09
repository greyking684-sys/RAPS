import React from 'react';

const CW = 640;
const CH = 230;
const PL = 38;
const PB = 44;
const PT = 12;
const CR = 14;

const cx = (n: number, i: number) =>
  PL + (n < 2 ? (CW - PL - CR) / 2 : (i * (CW - PL - CR)) / (n - 1));

const cy = (v: number, mx: number) =>
  PT + (CH - PT - PB) * (1 - Math.min(v || 0, mx) / (mx || 1));

interface LineSeries {
  n: string;
  c: string;
  v: (number | null)[];
}

interface SvgLineChartProps {
  labels: string[];
  series: LineSeries[];
  maxVal?: number;
  refLine?: number | null;
  activeIdx?: number | null;
  onSelectIdx?: (idx: number) => void;
  dark?: boolean;
}

export const SvgLineChart: React.FC<SvgLineChartProps> = ({
  labels,
  series,
  maxVal = 1,
  refLine = 0.9,
  activeIdx,
  onSelectIdx,
  dark = false,
}) => {
  const n = labels.length;

  return (
    <div>
      <svg viewBox={`0 0 ${CW} ${CH}`} className="w-full h-auto select-none">
        {[0, 0.25, 0.5, 0.75, 1].map((g, idx) => {
          const y = cy(g * maxVal, maxVal);
          return (
            <g key={idx}>
              <line
                x1={PL}
                x2={CW - CR}
                y1={y}
                y2={y}
                stroke={dark ? '#2b3643' : '#dce1e8'}
              />
              <text
                x={PL - 5}
                y={y + 4}
                textAnchor="end"
                fill={dark ? '#97a3b2' : '#64707f'}
                fontSize="10"
              >
                {Math.round(g * maxVal * 100)}%
              </text>
            </g>
          );
        })}

        {refLine != null && (
          <line
            x1={PL}
            x2={CW - CR}
            y1={cy(refLine, maxVal)}
            y2={cy(refLine, maxVal)}
            strokeDasharray="4 4"
            stroke={dark ? '#3ecf82' : '#17935a'}
            strokeWidth="1.5"
          />
        )}

        {activeIdx != null && activeIdx >= 0 && activeIdx < n && (
          <g>
            <rect
              x={Math.max(PL, cx(n, activeIdx) - 14)}
              y={PT}
              width="28"
              height={CH - PT - PB}
              rx="6"
              fill={dark ? 'rgba(106,165,255,0.12)' : 'rgba(31,95,191,0.09)'}
            />
            <line
              x1={cx(n, activeIdx)}
              x2={cx(n, activeIdx)}
              y1={PT}
              y2={CH - PB}
              stroke={dark ? '#6aa5ff' : '#1f5fbf'}
              strokeWidth="2"
              strokeDasharray="3 3"
            />
          </g>
        )}

        {labels.map((l, i) => {
          if (n > 18 && i % 2 !== 0) return null;
          const x = cx(n, i);
          return (
            <text
              key={i}
              onClick={() => onSelectIdx && onSelectIdx(i)}
              transform={`translate(${x},${CH - PB + 12}) rotate(-45)`}
              textAnchor="end"
              fill={activeIdx === i ? (dark ? '#6aa5ff' : '#1f5fbf') : dark ? '#97a3b2' : '#64707f'}
              fontWeight={activeIdx === i ? '800' : '500'}
              fontSize="9.5"
              className="cursor-pointer"
            >
              {l}
            </text>
          );
        })}

        {series.map((s, sIdx) => {
          const pts = s.v
            .map((val, i) =>
              val == null ? null : { x: cx(n, i), y: cy(val, maxVal), val, i }
            )
            .filter((p): p is { x: number; y: number; val: number; i: number } => p !== null);

          return (
            <g key={sIdx}>
              <polyline
                points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={s.c}
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {pts.map((p) => {
                const isSel = activeIdx === p.i;
                return (
                  <g
                    key={p.i}
                    onClick={() => onSelectIdx && onSelectIdx(p.i)}
                    className="cursor-pointer group"
                  >
                    <circle cx={p.x} cy={p.y} r="12" fill="transparent" />
                    {isSel && (
                      <circle cx={p.x} cy={p.y} r="9" fill={s.c} opacity="0.25" />
                    )}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isSel ? '6' : '4'}
                      fill={s.c}
                      stroke={isSel ? (dark ? '#ffffff' : '#0f172a') : dark ? '#1a212b' : '#ffffff'}
                      strokeWidth={isSel ? '2.5' : '1.5'}
                    />
                    <title>{`${labels[p.i]} · ${s.n}: ${Math.round(
                      p.val * 100
                    )}% (Click to inspect shift)`}</title>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>

      <div className="flex flex-wrap items-center justify-between gap-2 mt-1.5">
        <div className={`text-xs font-medium ${dark ? 'text-[#97a3b2]' : 'text-[#64707f]'}`}>
          {series.map((s, idx) => (
            <span key={idx} className="mr-3 inline-flex items-center gap-1">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: s.c }}
              />{' '}
              {s.n}
            </span>
          ))}
        </div>
        {onSelectIdx && (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#1f5fbf]/10 text-[#1f5fbf] dark:bg-[#6aa5ff]/15 dark:text-[#6aa5ff]">
            👆 Click any point on the chart to inspect Output, OEE & Targets
          </span>
        )}
      </div>
    </div>
  );
};

interface SvgBarChartProps {
  labels: string[];
  values: number[];
  color: string;
  unit: string;
  activeIdx?: number | null;
  onSelectIdx?: (idx: number) => void;
  dark?: boolean;
}

export const SvgBarChart: React.FC<SvgBarChartProps> = ({
  labels,
  values,
  color,
  unit,
  activeIdx,
  onSelectIdx,
  dark = false,
}) => {
  const n = labels.length;
  const mx = Math.max(...values, 1);
  const bw = (CW - PL - CR) / Math.max(1, n);

  return (
    <div>
      <svg viewBox={`0 0 ${CW} ${CH}`} className="w-full h-auto select-none">
        {[0, 0.25, 0.5, 0.75, 1].map((g, idx) => {
          const y = cy(g * mx, mx);
          return (
            <g key={idx}>
              <line
                x1={PL}
                x2={CW - CR}
                y1={y}
                y2={y}
                stroke={dark ? '#2b3643' : '#dce1e8'}
              />
              <text
                x={PL - 5}
                y={y + 4}
                textAnchor="end"
                fill={dark ? '#97a3b2' : '#64707f'}
                fontSize="10"
              >
                {(g * mx).toFixed(1)} {unit}
              </text>
            </g>
          );
        })}

        {values.map((v, i) => {
          const y = cy(v, mx);
          const x = PL + i * bw;
          const isSel = activeIdx === i;

          return (
            <g
              key={i}
              onClick={() => onSelectIdx && onSelectIdx(i)}
              className="cursor-pointer"
            >
              <rect
                x={x + 2}
                y={PT}
                width={Math.max(4, bw - 4)}
                height={CH - PT - PB}
                fill={isSel ? (dark ? 'rgba(106,165,255,0.12)' : 'rgba(31,95,191,0.08)') : 'transparent'}
                rx="4"
              />
              <rect
                x={x + 3.5}
                y={y}
                width={Math.max(3, bw - 7)}
                height={Math.max(2, CH - PB - y)}
                rx="4"
                fill={color}
                opacity={activeIdx == null || isSel ? 1 : 0.55}
                stroke={isSel ? (dark ? '#ffffff' : '#0f172a') : 'none'}
                strokeWidth={isSel ? 2 : 0}
              />
              <title>{`${labels[i]}: ${v.toFixed(1)} ${unit} (Click to inspect shift)`}</title>
              {(n <= 18 || i % 2 === 0) && (
                <text
                  transform={`translate(${x + bw / 2 + 4},${CH - PB + 12}) rotate(-45)`}
                  textAnchor="end"
                  fill={isSel ? (dark ? '#6aa5ff' : '#1f5fbf') : dark ? '#97a3b2' : '#64707f'}
                  fontWeight={isSel ? '800' : '500'}
                  fontSize="9.5"
                >
                  {labels[i]}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {onSelectIdx && (
        <div className="text-right mt-1">
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#1f5fbf]/10 text-[#1f5fbf] dark:bg-[#6aa5ff]/15 dark:text-[#6aa5ff]">
            👆 Click any bar to inspect full shift Output, OEE & Downtime
          </span>
        </div>
      )}
    </div>
  );
};
