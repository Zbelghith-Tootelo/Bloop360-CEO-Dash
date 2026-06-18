import { useState, useRef } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Metrics {
  bienveillance: number;
  apport: number;
  positivite: number;
  accomplissement: number;
  bienEtre: number;
  plaisir: number;
  enps: string;
}

interface Drapeaux {
  green: number;
  orange: number;
  red: number;
}

interface Employee {
  id: string;
  name: string;
  avatar: string;
  teamId: string;
  metrics: Metrics;
  drapeaux: Drapeaux;
}

interface Props {
  allEmployees: Employee[];
  teamColors: Record<string, string>;
}

const CRITERIA = [
  {
    key: "bienveillance",
    label: "Bienveillance",
    get: (m: Metrics) => m.bienveillance,
  },
  {
    key: "apport",
    label: "Apport",
    get: (m: Metrics) => m.apport,
  },
  {
    key: "positivisme",
    label: "Positivisme",
    get: (m: Metrics) => m.positivite,
  },
  {
    key: "accomplissement",
    label: "Accomplissement",
    get: (m: Metrics) => m.accomplissement,
  },
  {
    key: "bienEtre",
    label: "Bien être",
    get: (m: Metrics) => m.bienEtre,
  },
  {
    key: "plaisir",
    label: "Plaisir au travail",
    get: (m: Metrics) => m.plaisir,
  },
];

const CRITERION_COLORS = [
  "#00B7AE",
  "#1E81FF",
  "#04604E",
  "#7CBEFF",
  "#F59E0B",
  "#8B5CF6",
];
const CRITERION_LIGHT = [
  "#B2F0EB",
  "#BAD9FF",
  "#A3D4C8",
  "#D6EEFF",
  "#FDEABC",
  "#DDD6FE",
];

const CX = 150;
const CY = 150;
const R_MAX = 122;
const DOT_R = 14;
const RINGS = [2, 4, 6, 8, 10];

const PERIODS = [
  { id: "7j", label: "7 derniers jours" },
  { id: "30j", label: "30 derniers jours" },
  { id: "3m", label: "3 derniers mois" },
  { id: "6m", label: "6 derniers mois" },
  { id: "12m", label: "12 derniers mois" },
];

const PERIOD_LABELS: Record<string, string[]> = {
  "7j":  ["6 juin", "7 juin", "8 juin", "9 juin", "10 juin", "11 juin", "12 juin"],
  "30j": ["13 mai", "17 mai", "21 mai", "25 mai", "29 mai", "2 juin", "6 juin", "10 juin", "12 juin"],
  "3m":  ["Mar", "Avr", "Mai", "Juin"],
  "6m":  ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"],
  "12m": ["Juil", "Aoû", "Sep", "Oct", "Nov", "Déc", "Jan", "Fév", "Mar", "Avr", "Mai", "Juin"],
};

// Deterministic smooth daily data seeded per employee + criterion
function seededValue(
  id: string,
  critIdx: number,
  dayIdx: number,
  base: number,
): number {
  let h = 0;
  for (let i = 0; i < id.length; i++)
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  const noise =
    Math.sin(h * 0.001 + critIdx * 1.3 + dayIdx * 0.7) * 0.6;
  return parseFloat(
    Math.min(10, Math.max(1, base + noise)).toFixed(2),
  );
}

export function RadialScoreChart({
  allEmployees,
  teamColors,
}: Props) {
  const [criterionIdx, setCriterionIdx] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [periodId, setPeriodId] = useState("30j");
  const [collapsed, setCollapsed] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const criterion = CRITERIA[criterionIdx];
  const criterionColor = CRITERION_COLORS[criterionIdx];
  const criterionLight = CRITERION_LIGHT[criterionIdx];
  const n = allEmployees.length;

  const dots = allEmployees.map((emp, i) => {
    const score = criterion.get(emp.metrics);
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    const r = (score / 10) * R_MAX;
    return {
      emp,
      score,
      x: CX + r * Math.cos(angle),
      y: CY + r * Math.sin(angle),
      color: teamColors[emp.teamId] ?? "#00B7AE",
    };
  });

  const activeId = pinned ?? hovered;
  const hoveredDot = activeId
    ? (dots.find((d) => d.emp.id === activeId) ?? null)
    : null;
  const periodLabels = PERIOD_LABELS[periodId];
  const chartData = hoveredDot
    ? periodLabels.map((label, i) => ({
        date: label,
        value: seededValue(hoveredDot.emp.id, criterionIdx, i, hoveredDot.score),
      }))
    : [];

  return (
    <div
      className="bg-white rounded-2xl flex flex-col"
      style={{
        boxShadow: "0 2px 16px rgba(196,203,214,0.15)",
        padding: "14px 18px 12px",
        flex: 1,
        minWidth: 0,
      }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <div>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 15, color: "#111" }}>
            Stats individuels ·{" "}
            <span style={{ color: criterionColor }}>{criterion.label}</span>
          </p>
          {!collapsed && (
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, color: "#6B7280", marginTop: 2 }}>
              Tous les membres · survolez un point pour voir l'évolution
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
        {/* Period selector */}
        {!collapsed && (<div className="relative shrink-0">
          <select
            value={periodId}
            onChange={e => setPeriodId(e.target.value)}
            className="appearance-none pl-3 pr-7 py-1.5 rounded-full bg-white cursor-pointer outline-none"
            style={{ border: "1px solid #E1E1E1", fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 500, color: "#111" }}
          >
            {PERIODS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          <svg className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" width="10" height="7" viewBox="0 0 12 8" fill="none">
            <path d="M1 1.5l5 5 5-5" stroke="#00B7AE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>)}
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

      {!collapsed && (
      <><div className="flex gap-3 flex-1 items-start min-h-0">
        {/* SVG radial */}
        <div className="flex-shrink-0">
          <svg
            ref={svgRef}
            width={300}
            height={300}
            viewBox="0 0 300 300"
          >
            <defs>
              {dots.map(({ emp }) => (
                <clipPath
                  key={`clip-${emp.id}`}
                  id={`clip-${emp.id}`}
                >
                  <circle cx={0} cy={0} r={DOT_R} />
                </clipPath>
              ))}
            </defs>

            {/* Rings */}
            {RINGS.map((score) => (
              <g key={score}>
                <circle
                  cx={CX}
                  cy={CY}
                  r={(score / 10) * R_MAX}
                  fill="none"
                  stroke={score === 10 ? "#D1D5DB" : "#E5E7EB"}
                  strokeWidth={score === 10 ? 1.5 : 1}
                  strokeDasharray={
                    score === 10 ? undefined : "3 3"
                  }
                />
                <text
                  x={CX + 4}
                  y={CY - (score / 10) * R_MAX + 4}
                  fill="#9CA3AF"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: 9,
                  }}
                >
                  {score}
                </text>
              </g>
            ))}
            <text
              x={CX + 4}
              y={CY + 4}
              fill="#9CA3AF"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: 9,
              }}
            >
              0
            </text>

            {/* Profile dots */}
            {dots.map(({ emp, x, y, color }) => {
              const isPinned = pinned === emp.id;
              const isActive = activeId === emp.id;
              const r = isActive ? DOT_R + 3 : DOT_R;
              return (
                <g
                  key={emp.id}
                  transform={`translate(${x},${y})`}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => {
                    if (!pinned) setHovered(emp.id);
                  }}
                  onMouseLeave={() => {
                    if (!pinned) setHovered(null);
                  }}
                  onClick={() =>
                    setPinned((prev) =>
                      prev === emp.id ? null : emp.id,
                    )
                  }
                >
                  <circle
                    r={r + 2}
                    fill={color}
                    opacity={isActive ? 1 : 0.85}
                  />
                  <image
                    href={emp.avatar}
                    x={-r}
                    y={-r}
                    width={r * 2}
                    height={r * 2}
                    clipPath={`url(#clip-${emp.id})`}
                    preserveAspectRatio="xMidYMid slice"
                  />
                  {isActive && (
                    <circle
                      r={r + 5}
                      fill="none"
                      stroke={color}
                      strokeWidth={2}
                      opacity={0.4}
                    />
                  )}
                  {/* Pin indicator */}
                  {isPinned && (
                    <circle
                      cx={r - 2}
                      cy={-(r - 2)}
                      r={4}
                      fill={color}
                      stroke="#fff"
                      strokeWidth={1.5}
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hover card — matches the screenshot style */}
        <div
          className="flex-1 rounded-2xl overflow-hidden"
          style={{
            background: "#fff",
            border: hoveredDot
              ? "1px solid #E5E7EB"
              : "1px solid transparent",
            opacity: hoveredDot ? 1 : 0,
            transition: "opacity 0.2s",
            minWidth: 200,
          }}
        >
          {hoveredDot && (
            <div style={{ padding: "14px 16px 10px" }}>
              {/* Card header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <img
                    src={hoveredDot.emp.avatar}
                    alt={hoveredDot.emp.name}
                    className="rounded-full object-cover"
                    style={{
                      width: 28,
                      height: 28,
                      border: `2px solid ${hoveredDot.color}`,
                    }}
                  />
                  <div>
                    <p
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontWeight: 700,
                        fontSize: 13,
                        color: "#111",
                        lineHeight: 1.2,
                      }}
                    >
                      {hoveredDot.emp.name}
                    </p>
                    <p
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: 10,
                        color: "#6B7280",
                      }}
                    >
                      Évaluations par les pairs
                    </p>
                  </div>
                </div>
                {/* Close (when pinned) or pin hint */}
                <button
                  onClick={() =>
                    setPinned((prev) =>
                      prev === hoveredDot.emp.id
                        ? null
                        : hoveredDot.emp.id,
                    )
                  }
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    border: `1.5px solid ${pinned === hoveredDot.emp.id ? hoveredDot.color : "#E5E7EB"}`,
                    background:
                      pinned === hoveredDot.emp.id
                        ? hoveredDot.color + "15"
                        : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  title={
                    pinned === hoveredDot.emp.id
                      ? "Fermer"
                      : "Épingler"
                  }
                >
                  {pinned === hoveredDot.emp.id ? (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                    >
                      <path
                        d="M2 2l6 6M8 2l-6 6"
                        stroke={hoveredDot.color}
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 14 14"
                      fill="none"
                    >
                      <path
                        d="M8 2h4v4M6 8l6-6M2 6v6h6"
                        stroke="#111"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Line chart — matches screenshot */}
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{
                      top: 15,
                      right: 4,
                      bottom: 0,
                      left: -16,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id={`grad-${hoveredDot.emp.id}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={criterionColor}
                          stopOpacity={0.18}
                        />
                        <stop
                          offset="100%"
                          stopColor={criterionColor}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      stroke="#F3F4F6"
                      strokeDasharray="0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: 9,
                        fill: "#9CA3AF",
                      }}
                      axisLine={false}
                      tickLine={false}
                      interval={2}
                    />
                    <YAxis
                      domain={[0, 10]}
                      ticks={[0,1,2,3,4,5,6,7,8,9,10]}
                      interval={0}
                      tick={{ fontFamily: "Montserrat, sans-serif", fontSize: 9, fill: "#9CA3AF" }}
                      axisLine={false}
                      tickLine={false}
                      width={22}
                      tickFormatter={(v) => `${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: 12,
                        borderRadius: 8,
                        border: "1px solid #E5E7EB",
                        padding: "6px 12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      }}
                      labelStyle={{ fontWeight: 700, color: "#111", marginBottom: 2 }}
                      formatter={(value: number) => [`${Number(value).toFixed(2)} / 10`, criterion.label]}
                      itemStyle={{ color: criterionColor, fontWeight: 600 }}
                      cursor={{ stroke: criterionColor, strokeWidth: 1, strokeDasharray: "4 2" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={criterionColor}
                      strokeWidth={2}
                      fill={`url(#grad-${hoveredDot.emp.id})`}
                      dot={false}
                      activeDot={{
                        r: 4,
                        fill: criterionColor,
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Criterion pills */}
              <div className="flex gap-2 flex-wrap mt-1">
                {CRITERIA.slice(0, 3).map((c, idx) => {
                  const active = idx === criterionIdx;
                  const col = CRITERION_COLORS[idx];
                  const light = CRITERION_LIGHT[idx];
                  return null;
                })}
              </div>

              {/* Flags */}
              <div
                className="flex items-center gap-3 mt-2 pt-2"
                style={{ borderTop: "1px solid #F3F4F6" }}
              >
                {[
                  {
                    count: hoveredDot.emp.drapeaux.green,
                    color: "#22C55E",
                  },
                  {
                    count: hoveredDot.emp.drapeaux.orange,
                    color: "#F59E0B",
                  },
                  {
                    count: hoveredDot.emp.drapeaux.red,
                    color: "#EF4444",
                  },
                ].map(({ count, color }) => (
                  <div
                    key={color}
                    className="flex items-center gap-1"
                  >
                    <svg
                      width="9"
                      height="11"
                      viewBox="0 0 10 14"
                      fill="none"
                    >
                      <path
                        d="M1.5 1v12M1.5 1l9 3-9 3"
                        stroke={color}
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#111",
                      }}
                    >
                      ×{count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Criterion pills — full set below chart */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {CRITERIA.map((c, idx) => {
          const active = idx === criterionIdx;
          const col = CRITERION_COLORS[idx];
          return (
            <button
              key={c.key}
              onClick={() => setCriterionIdx(idx)}
              className="px-3 py-1.5 rounded-full transition-all"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 600,
                fontSize: 11,
                background: active ? col : col + "18",
                color: active ? "#fff" : col,
                border: `1px solid ${col}40`,
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>
      </>)}
    </div>
  );
}