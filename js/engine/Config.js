export const CONFIG = {
    DIE_WIDTH: 700,
    DIE_HEIGHT: 400,
    AREA_TOLERANCE: 0.01,
    SNAP_DISTANCE_BASE: 10
};

export const INITIAL_BLOCKS = [
    { id: "b1", x: 50, y: 50, w: 120, h: 80, type: "soft", targetArea: 9600, isError: false },
    { id: "b2", x: 180, y: 50, w: 100, h: 100, type: "hard", targetArea: 10000, isError: false },
    { id: "b3", x: 50, y: 140, w: 230, h: 60, type: "soft", targetArea: 13800, isError: false },
    { id: "b4", x: 290, y: 50, w: 80, h: 150, type: "soft", targetArea: 12000, isError: false },
    { id: "b5", x: 380, y: 50, w: 140, h: 120, type: "hard", targetArea: 16800, isError: false },
    { id: "Terminal_1", x: 550, y: 250, w: 15, h: 15, type: "terminal", targetArea: 225, isError: false } 
];

export const INITIAL_NETS = [
    { from: "b1", to: "b2", weight: 1 },
    { from: "b2", to: "b3", weight: 2 },
    { from: "b4", to: "Terminal_1", weight: 1 },
    { from: "b5", to: "Terminal_1", weight: 3 }
];

export const PALETTES = [
    { name: "High-Contrast White", desc: "Optimized for reports", isDarkCanvas: false, bg: "#f1f5f9", panel: "#ffffff", surface: "#f8fafc", border: "#e2e8f0", textMain: "#334155", textBright: "#0f172a", textMuted: "#64748b", grid: "rgba(0,0,0,0.05)", axis: "#64748b", die: "rgba(0,0,0,0.8)", soft: {f: "rgba(100, 116, 139, 0.1)", s: "#64748b"}, hard: {f: "rgba(71, 85, 105, 0.1)", s: "#475569"}, terminal: {f: "rgba(249, 115, 22, 0.1)", s: "#f97316"} },
    { name: "Deep Industrial Navy", desc: "Default engineering theme", isDarkCanvas: true, bg: "#0a192f", panel: "#ffffff", surface: "#f8fafc", border: "#e2e8f0", textMain: "#334155", textBright: "#0f172a", textMuted: "#64748b", grid: "rgba(255,255,255,0.05)", axis: "#2563eb", die: "rgba(255,255,255,0.8)", soft: {f: "rgba(37, 99, 235, 0.15)", s: "#2563eb"}, hard: {f: "rgba(139, 92, 246, 0.15)", s: "#8b5cf6"}, terminal: {f: "rgba(249, 115, 22, 0.15)", s: "#f97316"} },
    { name: "Quantum Blackhole", desc: "Absolute pitch-black theme", isDarkCanvas: true, bg: "#000000", panel: "#0f172a", surface: "#1e293b", border: "#334155", textMain: "#cbd5e1", textBright: "#ffffff", textMuted: "#94a3b8", grid: "rgba(255,255,255,0.08)", axis: "#3b82f6", die: "rgba(255,255,255,0.8)", soft: {f: "rgba(59, 130, 246, 0.2)", s: "#3b82f6"}, hard: {f: "rgba(168, 85, 247, 0.2)", s: "#a855f7"}, terminal: {f: "rgba(16, 185, 129, 0.2)", s: "#10b981"} }
];