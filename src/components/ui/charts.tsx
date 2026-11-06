/* Lightweight SVG charts in the brand palette (server-rendered, no JS). */

const INK = "#0e1a2b";
const niceCeil = (v: number) => {
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 4 ? 4 : n <= 5 ? 5 : 10) * p;
};
const RED = "#e34234";
const ICE = "#94bfdf";

export function BarChart({
  data,
  height = 200,
  format = (n: number) => String(n),
  highlightLast = false,
}: {
  data: { label: string; value: number }[];
  height?: number;
  format?: (n: number) => string;
  highlightLast?: boolean;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const top = niceCeil(max);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * top);
  return (
    <div className="flex gap-2" style={{ height }}>
      <div className="flex flex-col justify-between pb-6 text-right text-[11px] text-ink-400 num">
        {[...ticks].reverse().map((t) => <span key={t}>{format(t)}</span>)}
      </div>
      <div className="relative flex-1">
        <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between">
          {ticks.map((t) => <div key={t} className="border-t border-line-soft" />)}
        </div>
        <div className="absolute inset-x-0 top-0 bottom-0 flex items-end gap-[6%] px-[3%]">
          {data.map((d, i) => {
            const last = highlightLast && i === data.length - 1;
            return (
              <div key={d.label} className="group flex h-full flex-1 flex-col items-center justify-end">
                <div className="relative w-full max-w-11 flex-1">
                  <div
                    className="absolute inset-x-0 bottom-0 rounded-t-md transition group-hover:opacity-85"
                    style={{ height: `${(d.value / top) * 100}%`, background: last ? ICE : i === data.findIndex((x) => x.value === max) ? RED : INK }}
                    title={`${d.label}: ${format(d.value)}`}
                  />
                </div>
                <span className="mt-2 h-4 text-[11px] font-semibold text-ink-500">{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function LineChart({ data, height = 200 }: { data: { label: string; value: number }[]; height?: number }) {
  const W = 560, H = height, pad = 26;
  const max = Math.max(5, ...data.map((d) => d.value));
  const top = Math.ceil(max / 5) * 5;
  const x = (i: number) => pad + (i * (W - pad * 2)) / Math.max(1, data.length - 1);
  const y = (v: number) => H - 22 - (v / top) * (H - 40);
  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(" ");
  const area = `${line} L${x(data.length - 1)},${H - 22} L${x(0)},${H - 22} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Line chart">
      <defs>
        <linearGradient id="mc-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={ICE} stopOpacity="0.55" />
          <stop offset="1" stopColor={ICE} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <g key={t}>
          <line x1={pad} x2={W - pad} y1={y(t * top)} y2={y(t * top)} stroke="#e6eff7" />
          <text x={pad - 6} y={y(t * top) + 4} textAnchor="end" fontSize="10" fill="#8a98ab">{Math.round(t * top)}</text>
        </g>
      ))}
      <path d={area} fill="url(#mc-area)" />
      <path d={line} fill="none" stroke={INK} strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <g key={d.label}>
          <circle cx={x(i)} cy={y(d.value)} r={i === data.length - 1 ? 4.5 : 3} fill={i === data.length - 1 ? RED : "white"} stroke={i === data.length - 1 ? RED : INK} strokeWidth="1.75">
            <title>{`${d.label}: ${d.value}`}</title>
          </circle>
          {(i % 3 === 0 || i === data.length - 1) && (
            <text x={x(i)} y={H - 4} textAnchor="middle" fontSize="10" fill="#6c7a8e">{d.label}</text>
          )}
        </g>
      ))}
    </svg>
  );
}

export function Donut({ parts, center, sub }: { parts: { label: string; value: number; color: string }[]; center: string; sub?: string }) {
  const total = parts.reduce((a, p) => a + p.value, 0) || 1;
  const R = 52, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <svg viewBox="0 0 140 140" className="size-36 shrink-0" role="img" aria-label={`${center} ${sub ?? ""}`}>
      <circle cx="70" cy="70" r={R} fill="none" stroke="#e8f2fa" strokeWidth="16" />
      {parts.map((p) => {
        const len = (p.value / total) * C;
        const el = (
          <circle key={p.label} cx="70" cy="70" r={R} fill="none" stroke={p.color} strokeWidth="16" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-acc} transform="rotate(-90 70 70)" />
        );
        acc += len;
        return el;
      })}
      <text x="70" y="72" textAnchor="middle" fontSize="24" fontWeight="800" fill={INK}>{center}</text>
      {sub && <text x="70" y="90" textAnchor="middle" fontSize="10" fill="#6c7a8e">{sub}</text>}
    </svg>
  );
}

export function HBars({ data, color = INK, format = (n: number) => n.toLocaleString("en-NG") }: { data: { label: string; value: number }[]; color?: string; format?: (n: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="space-y-3">
      {data.map((d, i) => (
        <li key={d.label} className="grid grid-cols-[minmax(90px,150px)_1fr_auto] items-center gap-3 text-sm">
          <span className="truncate text-ink-600">{d.label}</span>
          <span className="h-3 overflow-hidden rounded-full bg-ice-100">
            <span className="block h-full rounded-full" style={{ width: `${(d.value / max) * 100}%`, background: i === 0 ? RED : color }} />
          </span>
          <span className="num w-14 text-right font-bold">{format(d.value)}</span>
        </li>
      ))}
    </ul>
  );
}

export const CHART = { INK, RED, ICE };
