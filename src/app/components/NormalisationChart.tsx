import { useState, useMemo, useRef, useCallback, useEffect } from "react";

interface Employee {
  id: string;
  name: string;
  avatar: string;
  metrics: {
    bienveillance: number;
    apport: number;
    positivite: number;
    accomplissement: number;
    bienEtre: number;
    plaisir: number;
    enps: string;
  };
}

interface ChartEntry {
  emp: Employee;
  color: string;
  label: string;
}

interface Props {
  chartEntries: ChartEntry[];
  allEmployees: Employee[];
}

const METRICS = [
  { key: "bienveillance"   as const, label: "Bienveillance",     color: "#6CD3BA", textColor: "#111" },
  { key: "apport"          as const, label: "Apport",             color: "#00AB8E", textColor: "#fff" },
  { key: "positivite"      as const, label: "Positivisme",        color: "#04604E", textColor: "#fff" },
  { key: "accomplissement" as const, label: "Accomplissement",    color: "#7CBEFF", textColor: "#111" },
  { key: "bienEtre"        as const, label: "Bien-être",          color: "#1E81FF", textColor: "#fff" },
  { key: "plaisir"         as const, label: "Plaisir au travail", color: "#0059D3", textColor: "#fff" },
];

const PERIODS = [
  { id: "7j",  label: "7 derniers jours" },
  { id: "30j", label: "30 derniers jours" },
  { id: "3m",  label: "3 derniers mois" },
  { id: "6m",  label: "6 derniers mois" },
  { id: "12m", label: "Derniers 12 mois" },
];

function gaussian(x: number): number {
  return Math.exp(-(x * x) / 2) / Math.sqrt(2 * Math.PI);
}

const W = 880;
const H = 300;
const padL = 50;
const padR = 40;
const padT = 24;
const padB = 60;
const chartW = W - padL - padR;
const chartH = H - padT - padB;
const baseline = padT + chartH;
const xMin = -4.5;
const xMax = 4.5;
const peakG = gaussian(0);
const PHOTO_R = 9;

function xToSvg(x: number) {
  return padL + ((x - xMin) / (xMax - xMin)) * chartW;
}
function yToSvg(gy: number) {
  return baseline - (gy / peakG) * chartH * 0.88;
}

const bellPath = (() => {
  const pts: string[] = [];
  for (let i = 0; i <= 300; i++) {
    const x = xMin + (i / 300) * (xMax - xMin);
    const sx = xToSvg(x).toFixed(1);
    const sy = yToSvg(gaussian(x)).toFixed(1);
    pts.push(`${i === 0 ? "M" : "L"}${sx},${sy}`);
  }
  return pts.join(" ");
})();

const bellFill = `${bellPath} L${xToSvg(xMax).toFixed(1)},${baseline} L${xToSvg(xMin).toFixed(1)},${baseline} Z`;

export function NormalisationChart({ chartEntries, allEmployees }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [period, setPeriod]       = useState("30j");
  const [activeMetrics, setActiveMetrics] = useState<Set<string>>(
    () => new Set(METRICS.map(m => m.key))
  );
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [vb, setVb] = useState({ x: 0, y: 0, w: W, h: H });
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ mx: number; my: number; vx: number; vy: number } | null>(null);

  const vbRef = useRef(vb);
  vbRef.current = vb;

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const cur = vbRef.current;
    const cx = cur.x + ((e.clientX - rect.left) / rect.width)  * cur.w;
    const cy = cur.y + ((e.clientY - rect.top)  / rect.height) * cur.h;
    const factor = e.deltaY > 0 ? 1.12 : 0.89;
    const nw = Math.min(W, Math.max(W * 0.15, cur.w * factor));
    const nh = Math.min(H, Math.max(H * 0.15, cur.h * factor));
    setVb({
      x: Math.max(0, Math.min(W - nw, cx - (cx - cur.x) * (nw / cur.w))),
      y: Math.max(0, Math.min(H - nh, cy - (cy - cur.y) * (nh / cur.h))),
      w: nw,
      h: nh,
    });
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.addEventListener("wheel", handleWheel, { passive: false });
    return () => svg.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const resetZoom = () => setVb({ x: 0, y: 0, w: W, h: H });
  const isZoomed = vb.w < W - 1;

  const rafRef = useRef<number | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isZoomed) return;
    e.preventDefault();
    dragStart.current = { mx: e.clientX, my: e.clientY, vx: vbRef.current.x, vy: vbRef.current.y };
    setIsDragging(true);

    const onMove = (ev: MouseEvent) => {
      // update tooltip mouse pos
      const r = containerRef.current?.getBoundingClientRect();
      if (r) setMousePos({ x: ev.clientX - r.left, y: ev.clientY - r.top });

      if (!dragStart.current) return;
      if (rafRef.current) return; // throttle to one frame
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const svg = svgRef.current;
        if (!svg || !dragStart.current) return;
        const rect = svg.getBoundingClientRect();
        const cur = vbRef.current;
        const dx = ((ev.clientX - dragStart.current.mx) / rect.width)  * cur.w;
        const dy = ((ev.clientY - dragStart.current.my) / rect.height) * cur.h;
        setVb(prev => ({
          ...prev,
          x: Math.max(0, Math.min(W - prev.w, dragStart.current!.vx - dx)),
          y: Math.max(0, Math.min(H - prev.h, dragStart.current!.vy - dy)),
        }));
      });
    };

    const onUp = () => {
      dragStart.current = null;
      setIsDragging(false);
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [isZoomed]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragStart.current) return; // handled by window listener during drag
    const r = containerRef.current?.getBoundingClientRect();
    if (r) setMousePos({ x: e.clientX - r.left, y: e.clientY - r.top });
  }, []);

  const handleMouseUp = useCallback(() => {}, []);

  const toggleMetric = (key: string) => {
    setActiveMetrics(prev => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); } else { next.add(key); }
      return next;
    });
  };

  const teamAvgs = useMemo(() => {
    const avgs: Record<string, number> = {};
    for (const m of METRICS) {
      const vals = allEmployees.map(e => e.metrics[m.key] as number).filter(v => !isNaN(v));
      avgs[m.key] = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 5;
    }
    return avgs;
  }, [allEmployees]);

  const allDots = useMemo(() => {
    const dots: {
      id: string;
      metricKey: string;
      avatar: string;
      empColor: string;
      metricColor: string;
      metricLabel: string;
      metricTextColor: string;
      empLabel: string;
      dev: number;
      score: number;
      avg: number;
    }[] = [];

    for (const entry of chartEntries) {
      for (const m of METRICS) {
        if (!activeMetrics.has(m.key)) continue;
        const score = entry.emp.metrics[m.key] as number;
        const avg   = teamAvgs[m.key];
        const dev   = parseFloat((score - avg).toFixed(2));
        dots.push({
          id: `${entry.emp.id}-${m.key}`,
          metricKey: m.key,
          avatar: entry.emp.avatar,
          empColor: entry.color,
          metricColor: m.color,
          metricTextColor: m.textColor,
          metricLabel: m.label,
          empLabel: entry.label,
          dev,
          score,
          avg,
        });
      }
    }
    return dots;
  }, [chartEntries, activeMetrics, teamAvgs]);

  const photoPositions = useMemo(() => {
    const GAP = PHOTO_R * 2.3;
    const placed: { x: number; y: number; dot: typeof allDots[0] }[] = [];

    for (const dot of allDots) {
      const clampedDev = Math.max(xMin + 0.5, Math.min(xMax - 0.5, dot.dev));
      const rawX = xToSvg(clampedDev);
      let y = baseline - PHOTO_R - 2;
      for (let attempt = 0; attempt < 20; attempt++) {
        const clash = placed.some(p => Math.abs(p.x - rawX) < GAP && Math.abs(p.y - y) < GAP);
        if (!clash) break;
        y -= GAP;
      }
      placed.push({ x: rawX, y, dot });
    }
    return placed;
  }, [allDots]);

  // Cluster photos that are too close in screen space; breaks apart when zoomed
  const CLUSTER_SCREEN_PX = 24;
  type PhotoPos = typeof photoPositions[0];
  type RenderItem =
    | { kind: "single"; pos: PhotoPos }
    | { kind: "cluster"; x: number; y: number; items: PhotoPos[]; dominantColor: string };

  const renderItems = useMemo((): RenderItem[] => {
    const threshold = CLUSTER_SCREEN_PX * (vb.w / W); // convert screen px to SVG units
    const used = new Set<string>();
    const result: RenderItem[] = [];
    for (const pos of photoPositions) {
      if (used.has(pos.dot.id)) continue;
      const group: PhotoPos[] = [pos];
      used.add(pos.dot.id);
      for (const other of photoPositions) {
        if (used.has(other.dot.id)) continue;
        if (Math.abs(other.x - pos.x) < threshold && Math.abs(other.y - pos.y) < threshold) {
          group.push(other);
          used.add(other.dot.id);
        }
      }
      if (group.length === 1) {
        result.push({ kind: "single", pos });
      } else {
        const cx = group.reduce((s, p) => s + p.x, 0) / group.length;
        const cy = group.reduce((s, p) => s + p.y, 0) / group.length;
        // pick the most represented metric color
        const colorCount: Record<string, number> = {};
        group.forEach(p => { colorCount[p.dot.metricColor] = (colorCount[p.dot.metricColor] || 0) + 1; });
        const dominantColor = Object.entries(colorCount).sort((a, b) => b[1] - a[1])[0][0];
        result.push({ kind: "cluster", x: cx, y: cy, items: group, dominantColor });
      }
    }
    return result;
  }, [photoPositions, vb.w]);

  const ticks = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

  return (
    <div
      className="bg-white rounded-2xl mb-4"
      style={{ boxShadow: "0 2px 16px rgba(196,203,214,0.15)", padding: "14px 20px 12px" }}
    >
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <div>
          <h3 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 17, color: "#111" }}>
            Normalisation de la moyenne de l'équipe par membre
          </h3>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, color: "#6B7280", marginTop: 2 }}>
            Position de chaque membre par rapport à la moyenne de l'équipe
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!collapsed && (
            <div className="relative">
              <select
                value={period}
                onChange={e => setPeriod(e.target.value)}
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
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ border: "1px solid #E1E1E1", background: "#FAFAFA" }}
          >
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none"
              style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
              <path d="M1 1.5l5 5 5-5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          {chartEntries.length === 0 ? (
            <div className="flex items-center justify-center" style={{ height: 280 }}>
              <div className="text-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CECECE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 8px" }}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 13, color: "#CECECE" }}>
                  Cochez un membre dans le tableau pour voir sa position par rapport à la moyenne
                </p>
              </div>
            </div>
          ) : (
            <div
              ref={containerRef}
              style={{ position: "relative", overflow: "hidden", cursor: isDragging ? "grabbing" : isZoomed ? "grab" : "default" }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {isZoomed && (
                <button
                  onClick={resetZoom}
                  style={{
                    position: "absolute", top: 8, right: 8, zIndex: 10,
                    fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: 600,
                    color: "#00B7AE", background: "white", border: "1px solid #00B7AE44",
                    borderRadius: 20, padding: "3px 10px", cursor: "pointer",
                  }}
                >
                  Réinitialiser zoom
                </button>
              )}
              <svg
                ref={svgRef}
                width="100%"
                viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
                style={{ overflow: "hidden", display: "block" }}
              >
                <path d={bellFill} fill="#00B7AE" opacity="0.07" />
                <path d={bellPath} fill="none" stroke="#00B7AE" strokeWidth="2.5" />
                <line x1={padL} y1={baseline} x2={W - padR} y2={baseline} stroke="#1A1A1A" strokeWidth="2" />
                <line x1={xToSvg(0)} y1={padT + 4} x2={xToSvg(0)} y2={baseline} stroke="#1A1A1A" strokeWidth="1.8" />

                {[-3, -2, -1, 1, 2, 3].map(t => (
                  <line key={t}
                    x1={xToSvg(t)} y1={padT + 30}
                    x2={xToSvg(t)} y2={baseline}
                    stroke="#CBD5E1" strokeWidth="1" strokeDasharray="5 4"
                  />
                ))}

                {ticks.map(t => (
                  <g key={t}>
                    <line x1={xToSvg(t)} y1={baseline} x2={xToSvg(t)} y2={baseline + 6} stroke="#9CA3AF" strokeWidth="1" />
                    <text x={xToSvg(t)} y={baseline + 22} textAnchor="middle"
                      style={{ fontFamily: "Montserrat, sans-serif", fontSize: 11, fill: t === 0 ? "#111" : "#9CA3AF", fontWeight: t === 0 ? 700 : 400 }}>
                      {t === 0 ? "Moyenne" : t > 0 ? `+${t}` : `${t}`}
                    </text>
                  </g>
                ))}

                {/* ROLLBACK: individual rendering without clustering
                {photoPositions.map(({ x, y, dot }) => (
                  <line key={`line-${dot.id}`} x1={x} y1={y + PHOTO_R + 1} x2={x} y2={baseline}
                    stroke={dot.metricColor} strokeWidth="1.5" opacity={hoveredId === dot.id ? 0.8 : 0.4} />
                ))}
                {photoPositions.map(({ x, y, dot }) => {
                  const isHovered = hoveredId === dot.id;
                  const r = isHovered ? PHOTO_R + 3 : PHOTO_R;
                  return (
                    <g key={`photo-${dot.id}`} style={{ cursor: "pointer" }}
                      onMouseEnter={() => setHoveredId(dot.id)} onMouseLeave={() => setHoveredId(null)}>
                      <clipPath id={`clip-norm-${dot.id}`}><circle cx={x} cy={y} r={r} /></clipPath>
                      <image href={dot.avatar} x={x - r} y={y - r} width={r * 2} height={r * 2}
                        clipPath={`url(#clip-norm-${dot.id})`} preserveAspectRatio="xMidYMid slice" />
                      <circle cx={x} cy={y} r={r} fill="none" stroke={dot.metricColor}
                        strokeWidth={isHovered ? 2.5 : 1.8} style={{ transition: "all 0.15s" }} />
                    </g>
                  );
                })}
                END ROLLBACK */}

                {/* Connector lines */}
                {renderItems.map(item => {
                  if (item.kind === "single") {
                    const { x, y, dot } = item.pos;
                    return (
                      <line key={`line-${dot.id}`}
                        x1={x} y1={y + PHOTO_R + 1} x2={x} y2={baseline}
                        stroke={dot.metricColor} strokeWidth="1.5"
                        opacity={hoveredId === dot.id ? 0.8 : 0.4}
                      />
                    );
                  }
                  return (
                    <line key={`line-cluster-${item.x.toFixed(0)}-${item.y.toFixed(0)}`}
                      x1={item.x} y1={item.y + PHOTO_R + 4} x2={item.x} y2={baseline}
                      stroke={item.dominantColor} strokeWidth="1.5" opacity={0.4}
                    />
                  );
                })}

                {/* Photos & clusters */}
                {renderItems.map(item => {
                  if (item.kind === "single") {
                    const { x, y, dot } = item.pos;
                    const isHovered = hoveredId === dot.id;
                    const r = isHovered ? PHOTO_R + 3 : PHOTO_R;
                    return (
                      <g key={`photo-${dot.id}`} style={{ cursor: "pointer" }}
                        onMouseEnter={() => setHoveredId(dot.id)}
                        onMouseLeave={() => setHoveredId(null)}
                      >
                        <clipPath id={`clip-norm-${dot.id}`}><circle cx={x} cy={y} r={r} /></clipPath>
                        <image href={dot.avatar} x={x - r} y={y - r} width={r * 2} height={r * 2}
                          clipPath={`url(#clip-norm-${dot.id})`} preserveAspectRatio="xMidYMid slice" />
                        <circle cx={x} cy={y} r={r} fill="none"
                          stroke={dot.metricColor} strokeWidth={isHovered ? 2.5 : 1.8}
                          style={{ transition: "all 0.15s" }} />
                      </g>
                    );
                  }
                  // Cluster bubble
                  const CR = PHOTO_R + 4;
                  const key = `cluster-${item.x.toFixed(0)}-${item.y.toFixed(0)}`;
                  const isHov = hoveredId === key;
                  return (
                    <g key={key} style={{ cursor: "zoom-in" }}
                      onMouseEnter={() => setHoveredId(key)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <circle cx={item.x} cy={item.y} r={CR + 2}
                        fill={item.dominantColor} opacity="0.15" />
                      <circle cx={item.x} cy={item.y} r={CR}
                        fill="white" stroke={item.dominantColor}
                        strokeWidth={isHov ? 2.5 : 1.8}
                        style={{ transition: "all 0.15s" }} />
                      <text x={item.x} y={item.y + 4} textAnchor="middle"
                        style={{ fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: 700, fill: item.dominantColor, pointerEvents: "none" }}>
                        {item.items.length}
                      </text>
                    </g>
                  );
                })}

              </svg>

              {/* HTML tooltip — fixed size, unaffected by zoom */}
              {(() => {
                // Cluster tooltip
                const clusterItem = hoveredId
                  ? renderItems.find(i => i.kind === "cluster" && `cluster-${i.x.toFixed(0)}-${i.y.toFixed(0)}` === hoveredId)
                  : null;
                if (clusterItem && clusterItem.kind === "cluster") {
                  return (
                    <div style={{
                      position: "absolute", left: mousePos.x + 14, top: mousePos.y - 30,
                      background: "white", borderRadius: 10, border: `1.5px solid ${clusterItem.dominantColor}`,
                      boxShadow: "0 4px 14px rgba(0,0,0,0.13)", padding: "10px 12px",
                      pointerEvents: "none", zIndex: 50, fontFamily: "Montserrat, sans-serif", minWidth: 160,
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: clusterItem.dominantColor, marginBottom: 6 }}>
                        {clusterItem.items.length} profils groupés
                      </div>
                      <div style={{ height: 1, background: "#F3F4F6", marginBottom: 8 }} />
                      {clusterItem.items.map(p => (
                        <div key={p.dot.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                          <span style={{ fontSize: 11, color: "#374151" }}>{p.dot.empLabel}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: p.dot.metricColor }}>{p.dot.score.toFixed(1)}</span>
                        </div>
                      ))}
                      <div style={{ marginTop: 6, fontSize: 10, color: "#9CA3AF" }}>Zoomez pour séparer</div>
                    </div>
                  );
                }

                const hovered = photoPositions.find(p => p.dot.id === hoveredId);
                if (!hovered) return null;
                const { dot } = hovered;
                const ox = mousePos.x + 14;
                const oy = mousePos.y - 48;
                return (
                  <div
                    style={{
                      position: "absolute",
                      left: ox,
                      top: oy,
                      width: 192,
                      background: "white",
                      borderRadius: 10,
                      border: `1.5px solid ${dot.metricColor}`,
                      boxShadow: "0 4px 14px rgba(0,0,0,0.13)",
                      padding: "10px 12px 10px",
                      pointerEvents: "none",
                      zIndex: 50,
                      fontFamily: "Montserrat, sans-serif",
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, color: dot.metricColor, marginBottom: 6 }}>
                      {dot.metricLabel}
                    </div>
                    <div style={{ height: 1, background: "#F3F4F6", marginBottom: 8 }} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: "#9CA3AF" }}>Moy. équipe</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>{dot.avg.toFixed(1)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: "#9CA3AF" }}>{dot.empLabel}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: dot.metricColor }}>{dot.score.toFixed(1)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, color: "#9CA3AF" }}>Écart</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: dot.dev >= 0 ? "#00AB8E" : "#EF4444" }}>
                        {dot.dev >= 0 ? `+${dot.dev.toFixed(2)}` : dot.dev.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Metric filter pills — no deviation numbers */}
          <div className="flex items-center gap-2 flex-wrap mt-3 pt-3" style={{ borderTop: "1px solid #F3F4F6" }}>
            {METRICS.map(m => {
              const isActive = activeMetrics.has(m.key);
              return (
                <button
                  key={m.key}
                  onClick={() => toggleMetric(m.key)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 700,
                    fontSize: 13,
                    background: isActive ? m.color : m.color + "22",
                    color: isActive ? m.textColor : "#374151",
                    border: `1px solid ${m.color}55`,
                    opacity: isActive ? 1 : 0.45,
                    transition: "all 0.2s",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <circle cx="5" cy="4" r="2.5" stroke={isActive ? m.textColor : m.color} strokeWidth="1.2" />
                    <path d="M1 12c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke={isActive ? m.textColor : m.color} strokeWidth="1.2" />
                    <circle cx="10" cy="4" r="1.8" stroke={isActive ? m.textColor : m.color} strokeWidth="1.2" />
                    <path d="M12 12c0-1.7-1-3-2.5-3.5" stroke={isActive ? m.textColor : m.color} strokeWidth="1.2" />
                  </svg>
                  {m.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
