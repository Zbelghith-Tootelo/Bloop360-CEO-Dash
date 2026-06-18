import { useState, useMemo, useRef, useCallback } from "react";

interface Metrics {
  bienveillance: number; apport: number; positivite: number;
  accomplissement: number; bienEtre: number; plaisir: number; enps: string;
}

interface Employee {
  id: string; name: string; avatar: string;
  teamId: string; metrics: Metrics;
  drapeaux: { green: number; orange: number; red: number };
}

interface Props {
  allEmployees: Employee[];
  teamColors: Record<string, string>;
}

const METRICS = [
  { key: "bienveillance",   label: "Bienveillance" },
  { key: "apport",          label: "Apport" },
  { key: "positivite",      label: "Positivité" },
  { key: "accomplissement", label: "Accomplissement" },
  { key: "bienEtre",        label: "Bien-être" },
  { key: "plaisir",         label: "Plaisir au travail" },
] as const;

type MetricKey = typeof METRICS[number]["key"];

const METRIC_COLORS: Record<MetricKey, string> = {
  bienveillance: "#6CD3BA", apport: "#00AB8E", positivite: "#04604E",
  accomplissement: "#7CBEFF", bienEtre: "#1E81FF", plaisir: "#0059D3",
};

// Chart dimensions
const W = 700;
const H = 300;
const PAD = { top: 24, right: 40, bottom: 48, left: 44 };
const INNER_W = W - PAD.left - PAD.right;
const INNER_H = H - PAD.top - PAD.bottom;
const AVATAR_R = 18;

function stdDev(values: number[]): number {
  const m = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(values.reduce((a, b) => a + (b - m) ** 2, 0) / values.length);
}
function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

// Jitter X position deterministically per employee to avoid exact overlaps
function jitter(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  return ((h & 0xff) / 255 - 0.5) * 0.6; // ±0.3 units on a 0-6 axis
}

export function ScatterProfileChart({ allEmployees, teamColors }: Props) {
  const [metricKey, setMetricKey] = useState<MetricKey>("bienveillance");
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  // Zoom state: [minY, maxY] on the Y axis (0–10)
  const [zoomY, setZoomY] = useState<[number, number]>([0, 10]);
  const isDragging = useRef(false);
  const dragStart = useRef<{ y: number; zoomY: [number, number] } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const scores = useMemo(
    () => allEmployees.map(e => ({ id: e.id, score: e.metrics[metricKey] as number })),
    [allEmployees, metricKey]
  );

  const avg = useMemo(() => mean(scores.map(s => s.score)), [scores]);
  const sd = useMemo(() => stdDev(scores.map(s => s.score)), [scores]);

  // Map score → Y pixel (inverted: high score = top)
  const toY = useCallback((score: number) => {
    const [lo, hi] = zoomY;
    return PAD.top + INNER_H - ((score - lo) / (hi - lo)) * INNER_H;
  }, [zoomY]);

  // Map metric index + jitter → X pixel
  const toX = useCallback((idx: number, id: string) => {
    const step = INNER_W / 5; // 6 metrics spread across width
    return PAD.left + idx * step + jitter(id) * step * 0.6;
  }, []);

  // Build points: one per employee per visible metric (we show ALL metrics at once as scatter)
  // X axis = metric index, Y = score on that metric
  const points = useMemo(() =>
    allEmployees.flatMap((emp, _ei) =>
      METRICS.map((m, mi) => {
        const score = emp.metrics[m.key] as number;
        const x = toX(mi, emp.id);
        const y = toY(score);
        const isOutlier = Math.abs(score - avg) > 1.5 * sd;
        return { emp, metricKey: m.key, metricLabel: m.label, score, x, y, isOutlier };
      })
    ),
  [allEmployees, toX, toY, avg, sd]);

  // Y axis ticks within zoom range
  const yTicks = useMemo(() => {
    const [lo, hi] = zoomY;
    const ticks: number[] = [];
    for (let t = Math.ceil(lo); t <= Math.floor(hi); t++) ticks.push(t);
    return ticks;
  }, [zoomY]);

  // Wheel zoom on Y axis
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relY = (e.clientY - rect.top - PAD.top) / INNER_H;
    const centerScore = zoomY[1] - relY * (zoomY[1] - zoomY[0]);
    const factor = e.deltaY > 0 ? 1.15 : 0.87;
    const half = ((zoomY[1] - zoomY[0]) * factor) / 2;
    const newLo = Math.max(0, centerScore - half);
    const newHi = Math.min(10, centerScore + half);
    if (newHi - newLo >= 1) setZoomY([newLo, newHi]);
  }, [zoomY]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { y: e.clientY, zoomY: [...zoomY] as [number, number] };
  }, [zoomY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !dragStart.current) return;
    const dy = e.clientY - dragStart.current.y;
    const range = dragStart.current.zoomY[1] - dragStart.current.zoomY[0];
    const delta = (dy / INNER_H) * range;
    const lo = Math.max(0, dragStart.current.zoomY[0] + delta);
    const hi = Math.min(10, dragStart.current.zoomY[1] + delta);
    if (hi - lo >= 1) setZoomY([lo, hi]);
  }, []);

  const handleMouseUp = useCallback(() => { isDragging.current = false; dragStart.current = null; }, []);

  const hoveredPoint = hovered ? points.find(p => p.emp.id + p.metricKey === hovered) ?? null : null;

  return (
    <div
      className="bg-white rounded-2xl mb-6"
      style={{ boxShadow: "0 2px 16px rgba(196,203,214,0.15)", padding: "20px 24px 16px" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 17, color: "#111" }}>
            Vue individuelle — Tous les membres
          </h3>
          {!collapsed && (
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, color: "#6B7280", marginTop: 2 }}>
              Chaque point = un membre · Scroll pour zoomer · Glisser pour déplacer · <span style={{ color: "#EF4444", fontWeight: 600 }}>Rouge = outlier</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!collapsed && (
            <button
              onClick={() => setZoomY([0, 10])}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{ border: "1px solid #E1E1E1", fontFamily: "Montserrat, sans-serif", color: "#6B7280", background: "#FAFAFA", fontSize: 11 }}
            >
              Réinitialiser zoom
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

      {!collapsed && (
        <>
          {/* Chart area */}
          <div style={{ position: "relative", userSelect: "none" }}>
            <svg
              ref={svgRef}
              width="100%"
              viewBox={`0 0 ${W} ${H}`}
              style={{ overflow: "visible", cursor: isDragging.current ? "grabbing" : "grab" }}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Clip path */}
              <defs>
                <clipPath id="scatter-clip">
                  <rect x={PAD.left} y={PAD.top} width={INNER_W} height={INNER_H} />
                </clipPath>
                {allEmployees.map(emp => (
                  <pattern key={emp.id} id={`avatar-${emp.id}`} patternUnits="objectBoundingBox" width="1" height="1">
                    <image href={emp.avatar} x="0" y="0" width={AVATAR_R * 2} height={AVATAR_R * 2} preserveAspectRatio="xMidYMid slice" />
                  </pattern>
                ))}
              </defs>

              {/* Y grid lines + ticks */}
              {yTicks.map(t => {
                const y = toY(t);
                if (y < PAD.top || y > PAD.top + INNER_H) return null;
                return (
                  <g key={t}>
                    <line x1={PAD.left} y1={y} x2={PAD.left + INNER_W} y2={y} stroke="#F3F4F6" strokeWidth="1" />
                    <text x={PAD.left - 8} y={y + 4} textAnchor="end" fill="#9CA3AF" fontSize="10" fontFamily="Montserrat, sans-serif">{t}</text>
                  </g>
                );
              })}

              {/* Mean line */}
              {(() => {
                const y = toY(avg);
                if (y < PAD.top || y > PAD.top + INNER_H) return null;
                return (
                  <g>
                    <line x1={PAD.left} y1={y} x2={PAD.left + INNER_W} y2={y} stroke="#00B7AE" strokeWidth="1.5" strokeDasharray="6 3" />
                    <text x={PAD.left + INNER_W + 6} y={y + 4} fill="#00B7AE" fontSize="10" fontFamily="Montserrat, sans-serif" fontWeight="600">moy.</text>
                  </g>
                );
              })()}

              {/* X axis — metric labels */}
              {METRICS.map((m, mi) => {
                const x = PAD.left + (mi / 5) * INNER_W;
                return (
                  <g key={m.key}>
                    <line x1={x} y1={PAD.top} x2={x} y2={PAD.top + INNER_H} stroke="#F3F4F6" strokeWidth="1" />
                    <text x={x} y={PAD.top + INNER_H + 16} textAnchor="middle" fill="#9CA3AF" fontSize="10" fontFamily="Montserrat, sans-serif">{m.label}</text>
                  </g>
                );
              })}

              {/* Points (clipped) */}
              <g clipPath="url(#scatter-clip)">
                {points.map(p => {
                  const key = p.emp.id + p.metricKey;
                  const isHov = hovered === key;
                  const col = teamColors[p.emp.teamId] ?? "#00B7AE";
                  const inView = p.y >= PAD.top - AVATAR_R && p.y <= PAD.top + INNER_H + AVATAR_R;
                  if (!inView) return null;
                  return (
                    <g
                      key={key}
                      onMouseEnter={() => setHovered(key)}
                      onMouseLeave={() => setHovered(null)}
                      style={{ cursor: "pointer" }}
                    >
                      {/* Outlier halo */}
                      {p.isOutlier && (
                        <circle
                          cx={p.x} cy={p.y} r={AVATAR_R + 6}
                          fill="none" stroke="#EF4444" strokeWidth="2"
                          strokeDasharray="4 2"
                          opacity={0.7}
                        />
                      )}
                      {/* Avatar circle */}
                      <circle
                        cx={p.x} cy={p.y} r={AVATAR_R + 2}
                        fill={col}
                        opacity={isHov ? 1 : 0.9}
                      />
                      <circle
                        cx={p.x} cy={p.y} r={AVATAR_R}
                        fill={`url(#avatar-${p.emp.id})`}
                      />
                      {/* Hover ring */}
                      {isHov && (
                        <circle
                          cx={p.x} cy={p.y} r={AVATAR_R + 4}
                          fill="none" stroke={col} strokeWidth="2.5"
                        />
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Tooltip */}
            {hoveredPoint && (() => {
              const col = teamColors[hoveredPoint.emp.teamId] ?? "#00B7AE";
              const diff = hoveredPoint.score - avg;
              const team = hoveredPoint.emp.teamId.replace("team-", "Équipe ");
              return (
                <div
                  style={{
                    position: "absolute",
                    left: Math.min((hoveredPoint.x / W) * 100, 70) + "%",
                    top: (hoveredPoint.y / H) * 100 + "%",
                    transform: "translate(16px, -50%)",
                    background: "#fff",
                    border: "1px solid #E5E7EB",
                    borderRadius: 12,
                    padding: "10px 14px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    fontFamily: "Montserrat, sans-serif",
                    zIndex: 50,
                    minWidth: 180,
                    pointerEvents: "none",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <img src={hoveredPoint.emp.avatar} alt="" style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${col}`, objectFit: "cover" }} />
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 13, color: "#111", lineHeight: 1.2 }}>{hoveredPoint.emp.name}</p>
                      <p style={{ fontSize: 10, color: "#6B7280", marginTop: 1 }}>{team}</p>
                    </div>
                  </div>
                  <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: 8 }}>
                    <p style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>{hoveredPoint.metricLabel}</p>
                    <div className="flex items-baseline gap-2">
                      <span style={{ fontSize: 20, fontWeight: 700, color: col }}>{hoveredPoint.score.toFixed(2)}</span>
                      <span style={{ fontSize: 10, color: "#9CA3AF" }}>/ 10</span>
                    </div>
                    <p style={{ fontSize: 11, marginTop: 4, color: diff >= 0 ? "#10B981" : "#EF4444", fontWeight: 600 }}>
                      {diff >= 0 ? "+" : ""}{diff.toFixed(2)} vs moyenne ({avg.toFixed(2)})
                    </p>
                    {hoveredPoint.isOutlier && (
                      <p style={{ fontSize: 10, color: "#EF4444", marginTop: 4, fontWeight: 700 }}>⚠ Outlier détecté</p>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Legend — team colors */}
          <div className="flex items-center gap-3 flex-wrap mt-4 pt-3" style={{ borderTop: "1px solid #F3F4F6" }}>
            <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Équipes :</span>
            {Object.entries(teamColors).filter(([k]) => k.startsWith("team-")).map(([teamId, color]) => {
              const teamLead = allEmployees.find(e => e.teamId === teamId);
              if (!teamLead) return null;
              return (
                <div key={teamId} className="flex items-center gap-1.5">
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
                  <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, color: "#374151" }}>{teamLead.name.split(" ")[0]}</span>
                </div>
              );
            })}
            <div className="flex items-center gap-1.5 ml-4">
              <div style={{ width: 10, height: 10, borderRadius: "50%", border: "2px dashed #EF4444", background: "transparent" }} />
              <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, color: "#EF4444", fontWeight: 600 }}>Outlier (&gt;1.5σ)</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
