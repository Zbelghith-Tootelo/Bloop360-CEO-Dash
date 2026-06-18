import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LabelList,
} from "recharts";

interface Employee {
  id: string;
  name: string;
  monthlyData: number[];
}

interface ChartEntry {
  emp: Employee;
  color: string;
  label: string;
}

const LOI27_CATEGORIES = [
  "Manque de\nreconnaissance",
  "Manque de soutien\ndu gestionnaire",
  "Manque de soutien\ndes collègues",
  "Charge de travail\ntrop élevée",
  "Manque d'autonomie\ndécisionnelle",
  "Harcèlement\npsychologique",
  "Manque de justice\norganisationnelle",
  "Autre",
];

// Deterministic score per (team id + category index) so values are stable
function seededScore(id: string, catIdx: number): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  const raw = Math.abs(Math.sin((h + catIdx * 7919) * 0.0001)) * 8 + 1.5;
  return parseFloat(Math.min(10, raw).toFixed(1));
}

// Custom X-axis tick that wraps long labels
function CustomTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  const lines = (payload?.value ?? "").split("\n");
  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, i) => (
        <text
          key={`${payload?.value ?? ""}-${i}`}
          x={0}
          y={0}
          dy={12 + i * 13}
          textAnchor="middle"
          fill="#6B7280"
          style={{ fontFamily: "Montserrat, sans-serif", fontSize: 10 }}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

interface Props {
  chartEntries: ChartEntry[];
}

export function RisquesPsychosociauxChart({ chartEntries }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  // One row per loi-27 category; one key per selected team
  const data = LOI27_CATEGORIES.map((label, catIdx) => {
    const row: Record<string, string | number> = { category: label };
    for (const { emp } of chartEntries) {
      row[emp.id] = seededScore(emp.id, catIdx);
    }
    return row;
  });

  return (
    <div
      className="bg-white rounded-2xl mb-4"
      style={{ boxShadow: "0 2px 16px rgba(196,203,214,0.15)", padding: "14px 20px 12px" }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <div>
          <h3 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 17, color: "#111" }}>
            Indice de risques psychosociaux — Loi 27
          </h3>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, color: "#6B7280", marginTop: 2 }}>
            Comparatif des équipes sélectionnées sur chaque facteur de risque
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          {!collapsed && (
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white"
              style={{ border: "1px solid #E1E1E1", fontFamily: "Montserrat, sans-serif", fontSize: 13, fontWeight: 500, color: "#111" }}
            >
              Derniers 12 mois
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1.5l5 5 5-5" stroke="#00B7AE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
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

      {!collapsed && (<>
      {/* Stats */}
      <div className="mb-3">
        <div
          className="inline-flex items-center gap-3 px-4 py-2 rounded-xl"
          style={{ background: "#FAFAFA", border: "1px solid #E1E1E1" }}
        >
          <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 13, color: "#6B7280" }}>
            Répondants : <strong style={{ color: "#111" }}>524</strong>
          </span>
          <span style={{ color: "#E1E1E1" }}>|</span>
          <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 13, color: "#6B7280" }}>
            Évaluations : <strong style={{ color: "#111" }}>93</strong>
          </span>
        </div>
      </div>

      {/* Chart */}
      {chartEntries.length === 0 ? (
        <div className="flex items-center justify-center" style={{ height: 300 }}>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 13, color: "#CECECE" }}>
            Cochez une équipe ou un membre dans le tableau pour comparer
          </p>
        </div>
      ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={data}
              margin={{ top: 12, right: 10, bottom: 4, left: -10 }}
              barCategoryGap="20%"
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
              <XAxis
                dataKey="category"
                tick={<CustomTick />}
                axisLine={false}
                tickLine={false}
                interval={0}
                height={60}
              />
              <YAxis
                domain={[0, 10]}
                ticks={[0,1,2,3,4,5,6,7,8,9,10]}
                tick={{ fontFamily: "Montserrat, sans-serif", fontSize: 11, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: 12,
                  borderRadius: 10,
                  border: "1px solid #E5E7EB",
                  padding: "10px 14px",
                }}
                labelFormatter={(label: string) => label.replace(/\n/g, " ")}
                labelStyle={{ fontWeight: 700, color: "#111", marginBottom: 6, display: "block" }}
                formatter={(value: number, name: string) => {
                  const id = name.replace("bar-", "");
                  const entry = chartEntries.find(e => e.emp.id === id);
                  return [Number(value).toFixed(1), entry?.emp.name ?? id];
                }}
                itemStyle={{ fontWeight: 600 }}
              />
              {chartEntries.map(({ emp, color }) => (
                <Bar key={`bar-${emp.id}`} name={`bar-${emp.id}`} dataKey={emp.id} fill={color} radius={[3, 3, 0, 0]} maxBarSize={40} isAnimationActive={false}>
                  <LabelList
                    dataKey={emp.id}
                    position="top"
                    style={{ fontFamily: "Montserrat, sans-serif", fontSize: 9, fill: "#6B7280", fontWeight: 600 }}
                    formatter={(v: number) => v.toFixed(1)}
                  />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
      )}

      {/* Légende en bas */}
      <div className="flex items-center gap-2 flex-wrap mt-3 pt-3" style={{ borderTop: "1px solid #F3F4F6" }}>
        {chartEntries.length === 0 ? (
          <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, color: "#CECECE" }}>
            Aucune équipe sélectionnée
          </span>
        ) : (
          chartEntries.map(({ emp, label, color }) => (
            <div
              key={emp.id}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full"
              style={{ background: color + "18", border: `1px solid ${color}40` }}
            >
              <div className="rounded-full shrink-0" style={{ width: 8, height: 8, background: color }} />
              <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 600, color }}>
                {label}
              </span>
            </div>
          ))
        )}
      </div>
      </>)}
    </div>
  );
}
