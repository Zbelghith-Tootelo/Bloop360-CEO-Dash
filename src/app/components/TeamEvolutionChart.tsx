import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

interface Employee {
  id: string;
  name: string;
  metrics: {
    bienveillance: number; apport: number; positivite: number;
    accomplissement: number; bienEtre: number; plaisir: number; enps: string;
  };
}

interface ChartEntry {
  emp: Employee;
  color: string;
  label: string;
}

const METRICS = [
  { key: "bienveillance",   label: "Bienveillance",     color: "#6CD3BA", textColor: "#111" },
  { key: "apport",          label: "Apport",             color: "#00AB8E", textColor: "#fff" },
  { key: "positivite",      label: "Positivité",         color: "#04604E", textColor: "#fff" },
  { key: "accomplissement", label: "Accomplissement",    color: "#7CBEFF", textColor: "#111" },
  { key: "bienEtre",        label: "Bien-être",          color: "#1E81FF", textColor: "#fff" },
  { key: "plaisir",         label: "Plaisir au travail", color: "#0059D3", textColor: "#fff" },
] as const;

type MetricKey = typeof METRICS[number]["key"];

const PERIODS = [
  { id: "7j",  label: "7 derniers jours",  points: ["6 juin","7 juin","8 juin","9 juin","10 juin","11 juin","12 juin"] },
  { id: "30j", label: "30 derniers jours", points: ["13 mai","17 mai","21 mai","25 mai","29 mai","2 juin","6 juin","10 juin","12 juin"] },
  { id: "3m",  label: "3 derniers mois",   points: ["1 mar","15 mar","1 avr","15 avr","1 mai","15 mai","1 juin","12 juin"] },
  { id: "6m",  label: "6 derniers mois",   points: ["Jan","Fév","Mar","Avr","Mai","Juin"] },
  { id: "12m", label: "12 derniers mois",  points: ["Juil","Aoû","Sep","Oct","Nov","Déc","Jan","Fév","Mar","Avr","Mai","Juin"] },
];

function seededValue(empId: string, metricKey: string, pointIdx: number, base: number): number {
  let h = 0;
  const seed = empId + metricKey;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  const noise = Math.sin(h * 0.001 + pointIdx * 0.8) * 0.7;
  return parseFloat(Math.min(10, Math.max(1, base + noise)).toFixed(2));
}

interface Props {
  chartEntries: ChartEntry[];
}

export function TeamEvolutionChart({ chartEntries }: Props) {
  const [metricKey, setMetricKey] = useState<MetricKey>("bienveillance");
  const [periodId, setPeriodId] = useState("30j");
  const [collapsed, setCollapsed] = useState(false);

  const period = PERIODS.find(p => p.id === periodId) ?? PERIODS[1];
  const metric = METRICS.find(m => m.key === metricKey) ?? METRICS[0];

  // Build time series: one row per point, one key per team
  const data = period.points.map((label, i) => {
    const row: Record<string, string | number> = { date: label };
    for (const { emp } of chartEntries) {
      const base = emp.metrics[metricKey] as number;
      row[emp.id] = seededValue(emp.id, metricKey, i, base);
    }
    return row;
  });

  // Current value (last point) per team, sorted descending
  const ranking = [...chartEntries]
    .map(({ emp, label, color }) => ({
      label,
      color,
      current: emp.metrics[metricKey] as number,
    }))
    .sort((a, b) => b.current - a.current);

  return (
    <div
      className="bg-white rounded-2xl mb-4"
      style={{ boxShadow: "0 2px 16px rgba(196,203,214,0.15)", padding: "14px 20px 12px" }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div>
          <h3 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 17, color: "#111" }}>
            Évolution par métrique
          </h3>
          {!collapsed && (
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, color: "#6B7280", marginTop: 2 }}>
              Comparez l'évolution des équipes sélectionnées sur une métrique à la fois
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!collapsed && (
            <div className="relative">
              <select
                value={periodId}
                onChange={e => setPeriodId(e.target.value)}
                className="appearance-none pl-4 pr-8 py-2 rounded-full bg-white cursor-pointer outline-none"
                style={{ border: "1px solid #E1E1E1", fontFamily: "Montserrat, sans-serif", fontSize: 13, fontWeight: 500, color: "#111" }}
              >
                {PERIODS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1.5l5 5 5-5" stroke="#00B7AE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-all"
            style={{ border: "1px solid #E1E1E1", background: "#FAFAFA" }}
          >
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
              <path d="M1 1.5l5 5 5-5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {!collapsed && chartEntries.length === 0 && (
        <div className="flex items-center justify-center" style={{ height: 260 }}>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 13, color: "#CECECE" }}>
            Cochez une équipe ou un membre dans le tableau pour afficher l'évolution
          </p>
        </div>
      )}
      {!collapsed && chartEntries.length > 0 && (
        <div className="flex gap-6">
          {/* Chart */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data} margin={{ top: 20, right: 16, bottom: 0, left: -8 }}>
                <CartesianGrid stroke="#F3F4F6" strokeDasharray="0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontFamily: "Montserrat, sans-serif", fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 10]}
                  ticks={[0,1,2,3,4,5,6,7,8,9,10]}
                  tick={{ fontFamily: "Montserrat, sans-serif", fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                  width={24}
                />
                <Tooltip
                  content={({ label, payload }) => {
                    if (!payload?.length) return null;
                    const sorted = [...payload].sort((a, b) => (b.value as number) - (a.value as number));
                    return (
                      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 14px", fontFamily: "Montserrat, sans-serif", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
                        <p style={{ fontWeight: 700, fontSize: 13, color: "#111", marginBottom: 8 }}>{label}</p>
                        {sorted.map((item, i) => {
                          const entry = chartEntries.find(e => e.emp.id === item.dataKey);
                          const col = entry?.color ?? "#111";
                          return (
                            <div key={String(item.dataKey)} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                              <span style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", width: 18 }}>#{i + 1}</span>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: col, flexShrink: 0 }} />
                              <span style={{ fontSize: 12, color: "#374151", flex: 1 }}>{entry?.label ?? String(item.dataKey)}</span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: col }}>{Number(item.value).toFixed(2)}<span style={{ fontWeight: 400, color: "#9CA3AF", fontSize: 11 }}> /10</span></span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }}
                />
                {chartEntries.map(({ emp, color }) => (
                  <Line
                    key={emp.id}
                    dataKey={emp.id}
                    stroke={color}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: color, stroke: "#fff", strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Ranking sidebar */}
          <div
            className="flex flex-col justify-center gap-2 shrink-0"
            style={{ width: 200, borderLeft: "1px solid #F3F4F6", paddingLeft: 20 }}
          >
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: 700, color: "#6B7280", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Classement actuel
            </p>
            {ranking.map((r, i) => (
              <div key={r.label} className="flex items-center gap-2">
                <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 10, fontWeight: 700, color: "#9CA3AF", width: 16 }}>#{i + 1}</span>
                <div className="rounded-full shrink-0" style={{ width: 8, height: 8, background: r.color }} />
                <span className="flex-1 truncate" style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, color: "#374151" }}>{r.label}</span>
                <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 13, fontWeight: 700, color: r.color }}>{r.current.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metric pills — bottom */}
      <div className="flex items-center gap-2 flex-wrap mt-3 pt-3" style={{ borderTop: "1px solid #F3F4F6" }}>
        {METRICS.map(m => {
          const active = metricKey === m.key;
          return (
            <button
              key={m.key}
              onClick={() => setMetricKey(m.key)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 700,
                fontSize: 13,
                background: active ? m.color : m.color + "22",
                color: active ? m.textColor : "#374151",
                border: `1px solid ${m.color}44`,
              }}
            >
              {m.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
