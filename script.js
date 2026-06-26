const DIE_WIDTH = 700;
const DIE_HEIGHT = 400;

// Polyfill for roundRect
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
        if (w < 2 * r) r = w / 2; if (h < 2 * r) r = h / 2;
        this.beginPath(); this.moveTo(x + r, y); this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r); this.arcTo(x, y + h, x, y, r); this.arcTo(x, y, x + w, y, r);
        this.closePath(); return this;
    };
}

// 9 Premium Exact Match Themes (High-Contrast White is now the default at index 0)
const palettes = [
    {
        name: "High-Contrast White", desc: "Optimized for reports", isDarkCanvas: false,
        bg: "#f1f5f9", panel: "#ffffff", surface: "#f8fafc", border: "#e2e8f0",
        textMain: "#334155", textBright: "#0f172a", textMuted: "#64748b",
        grid: "rgba(0,0,0,0.05)", axis: "#64748b", die: "rgba(0,0,0,0.8)",
        soft: {f: "rgba(100, 116, 139, 0.1)", s: "#64748b"}, hard: {f: "rgba(71, 85, 105, 0.1)", s: "#475569"}, terminal: {f: "rgba(249, 115, 22, 0.1)", s: "#f97316"}
    },
    {
        name: "Carbon Graphite Grey", desc: "Neutral low-glare profile", isDarkCanvas: true,
        bg: "#334155", panel: "#ffffff", surface: "#f8fafc", border: "#e2e8f0",
        textMain: "#334155", textBright: "#0f172a", textMuted: "#64748b",
        grid: "rgba(255,255,255,0.05)", axis: "#475569", die: "rgba(255,255,255,0.8)",
        soft: {f: "rgba(71, 85, 105, 0.15)", s: "#475569"}, hard: {f: "rgba(100, 116, 139, 0.15)", s: "#64748b"}, terminal: {f: "rgba(249, 115, 22, 0.15)", s: "#f97316"}
    },
    {
        name: "Deep Industrial Navy", desc: "Default engineering theme", isDarkCanvas: true,
        bg: "#0a192f", panel: "#ffffff", surface: "#f8fafc", border: "#e2e8f0",
        textMain: "#334155", textBright: "#0f172a", textMuted: "#64748b",
        grid: "rgba(255,255,255,0.05)", axis: "#2563eb", die: "rgba(255,255,255,0.8)",
        soft: {f: "rgba(37, 99, 235, 0.15)", s: "#2563eb"}, hard: {f: "rgba(139, 92, 246, 0.15)", s: "#8b5cf6"}, terminal: {f: "rgba(249, 115, 22, 0.15)", s: "#f97316"}
    },
    {
        name: "Laboratory Green", desc: "Medical visualization mode", isDarkCanvas: true,
        bg: "#064e3b", panel: "#ffffff", surface: "#f8fafc", border: "#e2e8f0",
        textMain: "#334155", textBright: "#0f172a", textMuted: "#64748b",
        grid: "rgba(255,255,255,0.05)", axis: "#10b981", die: "rgba(255,255,255,0.8)",
        soft: {f: "rgba(16, 185, 129, 0.15)", s: "#10b981"}, hard: {f: "rgba(5, 150, 105, 0.15)", s: "#059669"}, terminal: {f: "rgba(245, 158, 11, 0.15)", s: "#f59e0b"}
    },
    {
        name: "Amber Sunset Glow", desc: "Warm amber alert theme", isDarkCanvas: true,
        bg: "#78350f", panel: "#fffbeb", surface: "#fef3c7", border: "#fde68a",
        textMain: "#78350f", textBright: "#451a03", textMuted: "#92400e",
        grid: "rgba(255,255,255,0.05)", axis: "#ea580c", die: "rgba(255,255,255,0.8)",
        soft: {f: "rgba(234, 88, 12, 0.15)", s: "#ea580c"}, hard: {f: "rgba(217, 119, 6, 0.15)", s: "#d97706"}, terminal: {f: "rgba(16, 185, 129, 0.15)", s: "#10b981"}
    },
    {
        name: "Violet Nightshade", desc: "Deep purple dark theme", isDarkCanvas: true,
        bg: "#4c1d95", panel: "#ffffff", surface: "#f8fafc", border: "#e2e8f0",
        textMain: "#334155", textBright: "#0f172a", textMuted: "#64748b",
        grid: "rgba(255,255,255,0.05)", axis: "#8b5cf6", die: "rgba(255,255,255,0.8)",
        soft: {f: "rgba(139, 92, 246, 0.15)", s: "#8b5cf6"}, hard: {f: "rgba(124, 58, 237, 0.15)", s: "#7c3aed"}, terminal: {f: "rgba(236, 72, 153, 0.15)", s: "#ec4899"}
    },
    {
        name: "Quantum Blackhole", desc: "Absolute pitch-black theme", isDarkCanvas: true,
        bg: "#000000", panel: "#0f172a", surface: "#1e293b", border: "#334155",
        textMain: "#cbd5e1", textBright: "#ffffff", textMuted: "#94a3b8",
        grid: "rgba(255,255,255,0.08)", axis: "#3b82f6", die: "rgba(255,255,255,0.8)",
        soft: {f: "rgba(59, 130, 246, 0.2)", s: "#3b82f6"}, hard: {f: "rgba(168, 85, 247, 0.2)", s: "#a855f7"}, terminal: {f: "rgba(16, 185, 129, 0.2)", s: "#10b981"}
    },
    {
        name: "Ocean Breeze Blue", desc: "Vibrant clear sky palette", isDarkCanvas: true,
        bg: "#0369a1", panel: "#ffffff", surface: "#f8fafc", border: "#e2e8f0",
        textMain: "#334155", textBright: "#0f172a", textMuted: "#64748b",
        grid: "rgba(255,255,255,0.05)", axis: "#0ea5e9", die: "rgba(255,255,255,0.8)",
        soft: {f: "rgba(14, 165, 233, 0.15)", s: "#0ea5e9"}, hard: {f: "rgba(2, 132, 199, 0.15)", s: "#0284c7"}, terminal: {f: "rgba(244, 63, 94, 0.15)", s: "#f43f5e"}
    },
    {
        name: "Blossoming Rose", desc: "Soft rose high-contrast theme", isDarkCanvas: true,
        bg: "#881337", panel: "#fff1f2", surface: "#ffe4e6", border: "#fecdd3",
        textMain: "#881337", textBright: "#4c0519", textMuted: "#9f1239",
        grid: "rgba(255,255,255,0.05)", axis: "#f43f5e", die: "rgba(255,255,255,0.8)",
        soft: {f: "rgba(244, 63, 94, 0.15)", s: "#f43f5e"}, hard: {f: "rgba(225, 29, 72, 0.15)", s: "#e11d48"}, terminal: {f: "rgba(14, 165, 233, 0.15)", s: "#0ea5e9"}
    }
];

// Initialize with the new default
let appliedPalette = palettes[0]; 
let pendingPalette = palettes[0];
const errColor = { f: "rgba(241, 76, 76, 0.3)", s: "#ef4444" };

// Hard Block Hatched Pattern Generator
function createHatchPattern(ctx, isDarkCanvas) {
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 16;
    pCanvas.height = 16;
    const pCtx = pCanvas.getContext('2d');
    
    pCtx.fillStyle = isDarkCanvas ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";
    pCtx.fillRect(0, 0, 16, 16);
    
    pCtx.strokeStyle = isDarkCanvas ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)";
    pCtx.lineWidth = 2;
    pCtx.beginPath();
    pCtx.moveTo(0, 16);
    pCtx.lineTo(16, 0);
    pCtx.moveTo(-8, 8);
    pCtx.lineTo(8, -8);
    pCtx.moveTo(8, 24);
    pCtx.lineTo(24, 8);
    pCtx.stroke();

    return ctx.createPattern(pCanvas, 'repeat');
}

const initialBlocks = [
    { id: "b1", x: 50, y: 50, w: 120, h: 80, type: "soft", targetArea: 9600, isError: false },
    { id: "b2", x: 180, y: 50, w: 100, h: 100, type: "hard", targetArea: 10000, isError: false },
    { id: "b3", x: 50, y: 140, w: 230, h: 60, type: "soft", targetArea: 13800, isError: false },
    { id: "b4", x: 290, y: 50, w: 80, h: 150, type: "soft", targetArea: 12000, isError: false },
    { id: "b5", x: 380, y: 50, w: 140, h: 120, type: "hard", targetArea: 16800, isError: false },
    { id: "Terminal_1", x: 550, y: 250, w: 15, h: 15, type: "terminal", targetArea: 225, isError: false } 
];

const initialNets = [
    { from: "b1", to: "b2", weight: 1 },
    { from: "b2", to: "b3", weight: 2 },
    { from: "b4", to: "Terminal_1", weight: 1 },
    { from: "b5", to: "Terminal_1", weight: 3 }
];

let blocks = JSON.parse(JSON.stringify(initialBlocks));
let tempEditorBlocks = [];
let nets = JSON.parse(JSON.stringify(initialNets));

const canvas = document.getElementById('floorCanvas');
const ctx = canvas.getContext('2d');
const stageContainer = document.getElementById('stageContainer');

let zoomLevel = 1.0;
let panX = 0, panY = 0; 
let isPanning = false, panStartX = 0, panStartY = 0, initialPanX = 0, initialPanY = 0;

let draggedBlock = null;
let dragOffsetX = 0, dragOffsetY = 0;
let hoveredBlock = null;
let snapGuides = { x: null, y: null };

let showSoft = true, showHard = true, showGrid = true, showNets = true;
let toastTimer = null;

function showToast(message) {
    const toast = document.getElementById('toastMsg');
    toast.innerText = message;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

function getNiceStep(rawStep) {
    const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const residual = rawStep / mag;
    if (residual < 1.5) return mag;
    if (residual < 3.5) return 2 * mag;
    if (residual < 7.5) return 5 * mag;
    return 10 * mag;
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

// ---- Settings & Palette Configuration Engine ----
function renderPaletteGrid() {
    const grid = document.getElementById('paletteGrid');
    grid.innerHTML = '';
    palettes.forEach((pal, idx) => {
        const btn = document.createElement('div');
        btn.className = `palette-btn ${pendingPalette.name === pal.name ? 'active' : ''}`;
        btn.innerHTML = `
            <div class="color-swatches-top">
                <div style="background:${pal.bg};"></div>
                <div style="background:${pal.panel};"></div>
                <div style="background:${pal.soft.s};"></div>
            </div>
            <div class="palette-info">
                <div class="palette-name">${pal.name}</div>
                <div class="palette-desc">${pal.desc}</div>
            </div>
        `;
        btn.onclick = () => { pendingPalette = palettes[idx]; renderPaletteGrid(); };
        grid.appendChild(btn);
    });
}

document.getElementById('btnSettings').addEventListener('click', () => {
    pendingPalette = appliedPalette; 
    renderPaletteGrid();
    openModal('settingsModal');
});

function applySettings() {
    appliedPalette = pendingPalette;
    const root = document.documentElement;
    root.style.setProperty('--bg-base', appliedPalette.bg);
    root.style.setProperty('--bg-panel', appliedPalette.panel);
    root.style.setProperty('--bg-surface', appliedPalette.surface);
    root.style.setProperty('--border-color', appliedPalette.border);
    root.style.setProperty('--text-main', appliedPalette.textMain);
    root.style.setProperty('--text-bright', appliedPalette.textBright);
    root.style.setProperty('--text-muted', appliedPalette.textMuted);
    root.style.setProperty('--accent-blue', appliedPalette.axis);
    root.style.setProperty('--accent-cyan', appliedPalette.soft.s);
    root.style.setProperty('--accent-purple', appliedPalette.hard.s);
    root.style.setProperty('--accent-orange', appliedPalette.terminal.s);
    
    closeModal('settingsModal'); drawScene();
    showToast(`Theme applied: ${appliedPalette.name}`);
}

// ---- Data Editor ----
document.getElementById('btnOpenEditor').addEventListener('click', () => {
    tempEditorBlocks = JSON.parse(JSON.stringify(blocks));
    renderEditorTable();
    openModal('editorModal');
});

function renderEditorTable() {
    const tbody = document.getElementById('editorTbody');
    tbody.innerHTML = '';
    tempEditorBlocks.forEach((b, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" class="ed-input" value="${b.id}" oninput="updateBlockField(${i}, 'id', this.value)"></td>
            <td><input type="number" class="ed-input" value="${Math.round(b.x)}" oninput="updateBlockField(${i}, 'x', this.value)"></td>
            <td><input type="number" class="ed-input" value="${Math.round(b.y)}" oninput="updateBlockField(${i}, 'y', this.value)"></td>
            <td><input type="number" class="ed-input" value="${Math.round(b.w)}" oninput="updateBlockField(${i}, 'w', this.value)"></td>
            <td><input type="number" class="ed-input" value="${Math.round(b.h)}" oninput="updateBlockField(${i}, 'h', this.value)"></td>
            <td><input type="number" class="ed-input" value="${Math.round(b.targetArea)}" oninput="updateBlockField(${i}, 'targetArea', this.value)"></td>
            <td>
                <select class="ed-input" onchange="updateBlockField(${i}, 'type', this.value)">
                    <option value="soft" ${b.type==='soft'?'selected':''}>Soft</option>
                    <option value="hard" ${b.type==='hard'?'selected':''}>Hard</option>
                    <option value="terminal" ${b.type==='terminal'?'selected':''}>Terminal</option>
                </select>
            </td>
            <td><button class="btn btn-outline-danger btn-sm" onclick="removeBlock(${i})">Del</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function updateBlockField(idx, key, val) {
    if (key === 'id' || key === 'type') tempEditorBlocks[idx][key] = val;
    else tempEditorBlocks[idx][key] = Number(val);
}

function addBlock() {
    tempEditorBlocks.push({ id: `b${tempEditorBlocks.length+1}`, x: 0, y: 0, w: 100, h: 100, type: "soft", targetArea: 10000, isError: false });
    renderEditorTable();
}

function removeBlock(idx) {
    tempEditorBlocks.splice(idx, 1);
    renderEditorTable();
}

function saveEditor() {
    blocks = JSON.parse(JSON.stringify(tempEditorBlocks));
    closeModal('editorModal');
    evaluateLayout(); drawScene();
    showToast("Layout settings applied successfully.");
}

// Upload JSON inside Editor
document.getElementById('uploadData').addEventListener('change', async (evt) => {
    const file = evt.target.files[0];
    if (!file) return;
    try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) throw new Error("JSON must be an array");
        tempEditorBlocks = parsed.map(b => ({
            id: b.id || `b${Math.random().toString().slice(2,6)}`,
            x: Number(b.x) || 0,
            y: Number(b.y) || 0,
            w: Number(b.w) || 10,
            h: Number(b.h) || 10,
            targetArea: Number(b.targetArea) || (Number(b.w)*Number(b.h)),
            type: b.type || 'soft',
            isError: false
        }));
        renderEditorTable();
        showToast("JSON loaded into editor. Click Apply to render.");
    } catch(e) {
        showToast("Invalid JSON format.");
    }
    evt.target.value = ''; 
});

function exportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tempEditorBlocks, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", "floorplan_data.json");
    document.body.appendChild(anchor);
    anchor.click(); anchor.remove();
}

// ---- High-Resolution Sub-pixel Rendering Engine ----
function centerView() {
    const padding = 150; 
    const cssWidth = stageContainer.clientWidth;
    const cssHeight = stageContainer.clientHeight;
    
    const scaleX = (cssWidth - padding) / DIE_WIDTH;
    const scaleY = (cssHeight - padding) / DIE_HEIGHT;
    
    zoomLevel = Math.max(0.1, Math.min(scaleX, scaleY));
    document.getElementById('zoomValue').innerText = `${Math.round(zoomLevel * 100)}%`;
    panX = (cssWidth - DIE_WIDTH * zoomLevel) / 2;
    panY = (cssHeight + DIE_HEIGHT * zoomLevel) / 2;
}

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = stageContainer.clientWidth;
    const cssHeight = stageContainer.clientHeight;
    
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    
    centerView(); drawScene();
}
window.addEventListener('resize', resizeCanvas);

function drawScene() {
    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.scale(dpr, dpr);
    
    const cssWidth = canvas.width / dpr;
    const cssHeight = canvas.height / dpr;
    
    ctx.fillStyle = appliedPalette.bg;
    ctx.fillRect(0, 0, cssWidth, cssHeight);
    
    ctx.translate(panX, panY);
    ctx.scale(zoomLevel, zoomLevel);

    if (showGrid) {
        const left = -panX / zoomLevel;
        const right = (cssWidth - panX) / zoomLevel;
        const top = -panY / zoomLevel;
        const bottom = (cssHeight - panY) / zoomLevel;

        const minMajorTickPx = 90; 
        const rawMajor = minMajorTickPx / zoomLevel;
        const majorStep = getNiceStep(rawMajor);
        const minorStep = majorStep / 5;

        const startX = Math.floor(left / minorStep) * minorStep;
        const endX = Math.ceil(right / minorStep) * minorStep;
        const startY = Math.floor(top / minorStep) * minorStep;
        const endY = Math.ceil(bottom / minorStep) * minorStep;

        ctx.strokeStyle = appliedPalette.grid;
        ctx.lineWidth = 1 / zoomLevel;
        for (let x = startX; x <= endX; x += minorStep) {
            ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.stroke();
        }
        for (let y = startY; y <= endY; y += minorStep) {
            ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke();
        }

        ctx.strokeStyle = appliedPalette.isDarkCanvas ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
        ctx.lineWidth = 1.5 / zoomLevel;
        const startMajorX = Math.floor(left / majorStep) * majorStep;
        const startMajorY = Math.floor(top / majorStep) * majorStep;
        for (let x = startMajorX; x <= endX; x += majorStep) {
            ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.stroke();
        }
        for (let y = startMajorY; y <= endY; y += majorStep) {
            ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke();
        }

        ctx.strokeStyle = appliedPalette.die;
        ctx.lineWidth = 2.5 / zoomLevel;
        ctx.strokeRect(0, -DIE_HEIGHT, DIE_WIDTH, DIE_HEIGHT);

        ctx.strokeStyle = appliedPalette.axis; 
        ctx.lineWidth = 2 / zoomLevel;
        if (0 >= top && 0 <= bottom) {
            ctx.beginPath(); ctx.moveTo(left, 0); ctx.lineTo(right, 0); ctx.stroke();
        }
        if (0 >= left && 0 <= right) {
            ctx.beginPath(); ctx.moveTo(0, top); ctx.lineTo(0, bottom); ctx.stroke();
        }

        ctx.fillStyle = appliedPalette.textMuted; 
        const axisFontSize = 13 / zoomLevel; 
        ctx.font = `${axisFontSize}px "JetBrains Mono", monospace`;
        const tickLen = 6 / zoomLevel;
        const textPad = 10 / zoomLevel;

        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        for (let x = startMajorX; x <= endX; x += majorStep) {
            if (Math.abs(x) < 0.1) continue;
            if (0 >= top && 0 <= bottom) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, tickLen); ctx.stroke();
                ctx.fillText(Math.round(x), x, textPad);
            }
        }
        
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        for (let y = startMajorY; y <= endY; y += majorStep) {
            if (Math.abs(y) < 0.1) continue;
            if (0 >= left && 0 <= right) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(-tickLen, y); ctx.stroke();
                ctx.fillText(Math.round(-y), -textPad, y); 
            }
        }
        ctx.textAlign = 'right'; ctx.textBaseline = 'top';
        if (0 >= left && 0 <= right && 0 >= top && 0 <= bottom) {
            ctx.fillText("0", -textPad, textPad);
        }
    }

    if (showNets) {
        ctx.lineWidth = 1.5 / zoomLevel;
        nets.forEach(net => {
            const b1 = blocks.find(b => b.id === net.from);
            const b2 = blocks.find(b => b.id === net.to);
            if (b1 && b2) {
                ctx.strokeStyle = appliedPalette.textMuted;
                ctx.globalAlpha = 0.6;
                ctx.beginPath();
                ctx.moveTo(b1.x + b1.w/2, -(b1.y + b1.h/2));
                ctx.lineTo(b2.x + b2.w/2, -(b2.y + b2.h/2));
                ctx.stroke();
                ctx.globalAlpha = 1.0;
            }
        });
    }

    const hatchPattern = createHatchPattern(ctx, appliedPalette.isDarkCanvas);

    blocks.forEach(block => {
        if (block.type === 'soft' && !showSoft) return;
        if ((block.type === 'hard' || block.type === 'terminal') && !showHard) return;

        ctx.save();
        let p = block.isError ? errColor : appliedPalette[block.type];
        if (!p) p = errColor; 

        if (block.type === 'terminal') {
            const cx = block.x + block.w / 2;
            const cy = -(block.y + block.h / 2);
            ctx.fillStyle = p.s;
            ctx.beginPath();
            ctx.arc(cx, cy, 6 / zoomLevel, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return;
        }

        const renderY = -block.y - block.h;
        const isFixed = (block.type === 'hard');
        
        ctx.fillStyle = isFixed ? hatchPattern : p.f;
        
        ctx.strokeStyle = isFixed && !block.isError 
            ? (appliedPalette.isDarkCanvas ? "#94a3b8" : "#cbd5e1") 
            : p.s;
        
        ctx.lineWidth = 1.5 / zoomLevel;
        ctx.lineJoin = 'miter';
        
        if (hoveredBlock === block || draggedBlock === block) {
            ctx.fillStyle = isFixed ? hatchPattern : p.s; 
            ctx.globalAlpha = isFixed ? 1.0 : 0.25;
            ctx.fillRect(block.x, renderY, block.w, block.h);
            ctx.globalAlpha = 1.0;
            ctx.strokeStyle = appliedPalette.isDarkCanvas ? "#ffffff" : "#0f172a";
            ctx.lineWidth = 2.5 / zoomLevel;
        } else {
            ctx.fillRect(block.x, renderY, block.w, block.h);
            if (block.isError) { 
                ctx.lineWidth = 3 / zoomLevel; 
                ctx.setLineDash([4/zoomLevel, 4/zoomLevel]); 
            }
        }
        
        ctx.strokeRect(block.x, renderY, block.w, block.h);
        ctx.restore();
    });

    // Text Label Rendering Layer
    blocks.forEach(block => {
        if (block.type === 'soft' && !showSoft) return;
        if ((block.type === 'hard' || block.type === 'terminal') && !showHard) return;

        ctx.save();
        const fontSize = 13 / zoomLevel; 
        ctx.font = `600 ${fontSize}px "JetBrains Mono", monospace`;
        const displayId = block.id;
        
        if (block.type === 'terminal') {
            const cx = block.x + block.w / 2;
            const cy = -(block.y + block.h / 2);
            
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            
            const textX = cx + (12 / zoomLevel);
            
            ctx.lineWidth = 3 / zoomLevel;
            ctx.strokeStyle = appliedPalette.bg;
            ctx.strokeText(displayId, textX, cy);
            
            ctx.fillStyle = appliedPalette.isDarkCanvas ? "#e2e8f0" : "#475569";
            ctx.fillText(displayId, textX, cy);
            ctx.restore();
            return;
        }

        const renderY = -block.y - block.h;
        const isFixed = (block.type === 'hard');
        const textWidth = ctx.measureText(displayId).width;
        
        let textX = block.x + (block.w / 2);
        let textY = renderY + (block.h / 2);
        
        const fitsInside = (textWidth + 6 / zoomLevel <= block.w) && (fontSize + 6 / zoomLevel <= block.h);
        
        ctx.textAlign = 'center';
        ctx.textBaseline = fitsInside ? 'middle' : 'bottom';
        if (!fitsInside) textY = renderY - (6 / zoomLevel);
        
        ctx.lineWidth = 3 / zoomLevel;
        ctx.strokeStyle = appliedPalette.bg;
        ctx.strokeText(displayId, textX, textY);
        
        let textColor;
        if (isFixed) {
            textColor = appliedPalette.isDarkCanvas ? "#e2e8f0" : "#475569";
        } else {
            textColor = appliedPalette.isDarkCanvas ? "#ffffff" : "#0f172a";
        }
        
        ctx.fillStyle = textColor;
        ctx.fillText(displayId, textX, textY);
        ctx.restore();
    });

    if (draggedBlock && (snapGuides.x !== null || snapGuides.y !== null)) {
        ctx.save();
        ctx.strokeStyle = appliedPalette.soft.s; 
        ctx.lineWidth = 1 / zoomLevel; 
        ctx.setLineDash([4 / zoomLevel, 4 / zoomLevel]);

        if (snapGuides.x !== null) {
            ctx.beginPath(); ctx.moveTo(snapGuides.x, -100000); ctx.lineTo(snapGuides.x, 100000); ctx.stroke();
        }
        if (snapGuides.y !== null) {
            ctx.beginPath(); ctx.moveTo(-100000, -snapGuides.y); ctx.lineTo(100000, -snapGuides.y); ctx.stroke();
        }
        ctx.restore();
    }
    ctx.restore();
}

function getMousePos(evt) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = evt.clientX - rect.left;
    const mouseY = evt.clientY - rect.top;
    const unscaledX = (mouseX - panX) / zoomLevel;
    const unscaledY = (mouseY - panY) / zoomLevel;
    return { x: unscaledX, y: -unscaledY };
}

function checkIntersection(pos, block) {
    return (pos.x >= block.x && pos.x <= block.x + block.w && pos.y >= block.y && pos.y <= block.y + block.h);
}

function isOverlapping(b1, b2) {
    return !(b1.x + b1.w <= b2.x || b2.x + b2.w <= b1.x || b1.y + b1.h <= b2.y || b2.y + b2.h <= b1.y);
}

function evaluateLayout() {
    let overlapCount = 0;
    let areaViolations = 0;
    blocks.forEach(b => b.isError = false); 

    for (let i = 0; i < blocks.length; i++) {
        for (let j = i + 1; j < blocks.length; j++) {
            if (blocks[i].type === 'terminal' || blocks[j].type === 'terminal') continue; 
            if (isOverlapping(blocks[i], blocks[j])) {
                blocks[i].isError = true; blocks[j].isError = true; overlapCount++;
            }
        }
    }

    blocks.forEach(b => {
        if (b.type === 'soft' && b.targetArea) {
            const currentArea = b.w * b.h;
            const error = Math.abs(currentArea - b.targetArea) / b.targetArea;
            if (error > 0.01) { b.isError = true; areaViolations++; }
        }
    });

    let hpwl = 0;
    nets.forEach(net => {
        const b1 = blocks.find(b => b.id === net.from);
        const b2 = blocks.find(b => b.id === net.to);
        if (b1 && b2) {
            const cx1 = b1.x + b1.w/2; const cy1 = b1.y + b1.h/2;
            const cx2 = b2.x + b2.w/2; const cy2 = b2.y + b2.h/2;
            hpwl += net.weight * (Math.abs(cx1 - cx2) + Math.abs(cy1 - cy2));
        }
    });

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    blocks.forEach(b => {
        if (b.type === 'terminal') return; 
        if (b.x < minX) minX = b.x; if (b.y < minY) minY = b.y;
        if (b.x + b.w > maxX) maxX = b.x + b.w; if (b.y + b.h > maxY) maxY = b.y + b.h;
    });
    const area = (maxX === -Infinity) ? 0 : Math.round((maxX - minX) * (maxY - minY));

    document.getElementById('valArea').innerText = `${area.toLocaleString()} px²`;
    document.getElementById('valHPWL').innerText = Math.round(hpwl).toLocaleString();
    
    const overlapEl = document.getElementById('valOverlap');
    const penaltyEl = document.getElementById('valPenalty');
    const costEl = document.getElementById('valCost');
    const sysStatus = document.getElementById('systemStatus');

    const totalViolations = overlapCount + areaViolations;

    if (totalViolations > 0) {
        overlapEl.innerText = `Infeasible (Errors: ${totalViolations})`;
        overlapEl.className = "value text-danger";
        penaltyEl.innerText = "M = 10";
        penaltyEl.className = "value text-danger";
        costEl.innerText = "10.00";
        sysStatus.innerText = "Hard Constraint Violated";
        sysStatus.style.color = "var(--accent-red)";
    } else {
        overlapEl.innerText = "Feasible";
        overlapEl.className = "value text-success";
        penaltyEl.innerText = "0";
        penaltyEl.className = "value text-success";
        const estimatedCost = (0.7 + (area / 200000) + (hpwl / 5000)).toFixed(4); 
        costEl.innerText = estimatedCost;
        sysStatus.innerText = "Ready & Feasible";
        sysStatus.style.color = "var(--accent-green)";
    }
}

function updateInspector(block) {
    const content = document.getElementById('inspectorContent');
    if (!block) { content.innerHTML = '<div class="empty-state">Select block to inspect.</div>'; return; }

    let statusMsg = "FEASIBLE";
    let statusCls = "text-success";
    if (block.isError) {
        statusCls = "text-danger";
        if (block.type === 'soft' && block.targetArea) {
            const err = Math.abs((block.w * block.h) - block.targetArea) / block.targetArea;
            statusMsg = err > 0.01 ? "AREA ERROR > 1%" : "OVERLAP ERROR";
        } else { statusMsg = "OVERLAP ERROR"; }
    }

    content.innerHTML = `
        <div class="inspector-grid">
            <div class="prop-box full">
                <span class="prop-label">ID</span>
                <span class="prop-value" style="font-size:14.5px;">${block.id}</span>
            </div>
            <div class="prop-box">
                <span class="prop-label">Type</span>
                <span class="prop-value" style="text-transform: capitalize;">${block.type}</span>
            </div>
            <div class="prop-box">
                <span class="prop-label">Status</span>
                <span class="prop-value ${statusCls}" style="font-weight:bold;">${statusMsg}</span>
            </div>
            <div class="prop-box">
                <span class="prop-label">Origin (X,Y)</span>
                <span class="prop-value">${Math.round(block.x)}, ${Math.round(block.y)}</span>
            </div>
            <div class="prop-box">
                <span class="prop-label">Size (W,H)</span>
                <span class="prop-value">${Math.round(block.w)} x ${Math.round(block.h)}</span>
            </div>
        </div>
    `;
}

canvas.addEventListener('mousedown', (evt) => {
    if (evt.button === 0) {
        const mousePos = getMousePos(evt);
        let found = null;
        for (let i = blocks.length - 1; i >= 0; i--) {
            if (checkIntersection(mousePos, blocks[i])) { found = blocks[i]; break; }
        }
        
        if (found) {
            if (found.type === 'hard' || found.type === 'terminal') {
                showToast(`Fixed constraint: ${found.id} cannot be moved.`);
                draggedBlock = null; 
            } else {
                draggedBlock = found;
                dragOffsetX = mousePos.x - found.x;
                dragOffsetY = mousePos.y - found.y;
                canvas.style.cursor = 'grabbing';
            }
        } else {
            isPanning = true; panStartX = evt.clientX; panStartY = evt.clientY;
            initialPanX = panX; initialPanY = panY; canvas.style.cursor = 'grabbing';
        }
    }
});

canvas.addEventListener('mousemove', (evt) => {
    const mousePos = getMousePos(evt);
    document.getElementById('coordDisplay').innerText = `X: ${Math.round(mousePos.x)}, Y: ${Math.round(mousePos.y)}`;

    if (draggedBlock) {
        let newX = mousePos.x - dragOffsetX;
        let newY = mousePos.y - dragOffsetY;
        const SNAP_DIST = 10 / zoomLevel;
        let snapLinesX = [0, DIE_WIDTH]; let snapLinesY = [0, DIE_HEIGHT];

        blocks.forEach(b => {
            if (b === draggedBlock) return;
            snapLinesX.push(b.x, b.x + b.w); snapLinesY.push(b.y, b.y + b.h);
        });

        snapGuides = { x: null, y: null };
        let minDiffX = SNAP_DIST, minDiffY = SNAP_DIST;

        snapLinesX.forEach(lineX => {
            if (Math.abs(newX - lineX) < minDiffX) { minDiffX = Math.abs(newX - lineX); newX = lineX; snapGuides.x = lineX; }
            if (Math.abs((newX + draggedBlock.w) - lineX) < minDiffX) { minDiffX = Math.abs((newX + draggedBlock.w) - lineX); newX = lineX - draggedBlock.w; snapGuides.x = lineX; }
        });
        snapLinesY.forEach(lineY => {
            if (Math.abs(newY - lineY) < minDiffY) { minDiffY = Math.abs(newY - lineY); newY = lineY; snapGuides.y = lineY; }
            if (Math.abs((newY + draggedBlock.h) - lineY) < minDiffY) { minDiffY = Math.abs((newY + draggedBlock.h) - lineY); newY = lineY - draggedBlock.h; snapGuides.y = lineY; }
        });

        draggedBlock.x = newX; draggedBlock.y = newY;
        updateInspector(draggedBlock); evaluateLayout();
    } else if (isPanning) {
        panX = initialPanX + (evt.clientX - panStartX);
        panY = initialPanY + (evt.clientY - panStartY);
    } else {
        let found = null;
        for (let i = blocks.length - 1; i >= 0; i--) {
            if (checkIntersection(mousePos, blocks[i])) { found = blocks[i]; break; }
        }
        if (hoveredBlock !== found) {
            hoveredBlock = found; updateInspector(hoveredBlock);
            canvas.style.cursor = found ? ((found.type === 'hard' || found.type === 'terminal') ? 'not-allowed' : 'grab') : 'default';
        }
    }
    drawScene();
});

window.addEventListener('mouseup', () => {
    draggedBlock = null; isPanning = false; snapGuides = { x: null, y: null }; 
    canvas.style.cursor = hoveredBlock ? ((hoveredBlock.type === 'hard' || hoveredBlock.type === 'terminal') ? 'not-allowed' : 'grab') : 'default';
    evaluateLayout(); drawScene();
});

function applyZoom(delta, mouseX, mouseY) {
    const prevZoom = zoomLevel; zoomLevel += delta; zoomLevel = Math.max(0.1, Math.min(10.0, zoomLevel));
    if (mouseX !== undefined && mouseY !== undefined) {
        panX = mouseX - (mouseX - panX) * (zoomLevel / prevZoom);
        panY = mouseY - (mouseY - panY) * (zoomLevel / prevZoom);
    } else {
        const cx = stageContainer.clientWidth / 2; const cy = stageContainer.clientHeight / 2;
        panX = cx - (cx - panX) * (zoomLevel / prevZoom);
        panY = cy - (cy - panY) * (zoomLevel / prevZoom);
    }
    document.getElementById('zoomValue').innerText = `${Math.round(zoomLevel * 100)}%`; drawScene();
}

canvas.addEventListener('wheel', (evt) => {
    evt.preventDefault();
    const wheel = evt.deltaY < 0 ? 0.1 : -0.1;
    const rect = canvas.getBoundingClientRect();
    applyZoom(wheel, evt.clientX - rect.left, evt.clientY - rect.top);
});

document.getElementById('btnZoomIn').addEventListener('click', () => applyZoom(0.2));
document.getElementById('btnZoomOut').addEventListener('click', () => applyZoom(-0.2));
document.getElementById('btnRecenter').addEventListener('click', () => { centerView(); drawScene(); });
document.getElementById('btnReset').addEventListener('click', () => {
    blocks = JSON.parse(JSON.stringify(initialBlocks));
    evaluateLayout(); updateInspector(null); 
    centerView(); drawScene();
});
document.getElementById('toggleSoft').addEventListener('change', (e) => { showSoft = e.target.checked; drawScene(); });
document.getElementById('toggleHard').addEventListener('change', (e) => { showHard = e.target.checked; drawScene(); });
document.getElementById('toggleNets').addEventListener('change', (e) => { showNets = e.target.checked; drawScene(); });
document.getElementById('toggleGrid').addEventListener('change', (e) => { showGrid = e.target.checked; drawScene(); });

// Init
const root = document.documentElement;
root.style.setProperty('--bg-base', appliedPalette.bg);
root.style.setProperty('--bg-panel', appliedPalette.panel);
root.style.setProperty('--bg-surface', appliedPalette.surface);
root.style.setProperty('--border-color', appliedPalette.border);
root.style.setProperty('--text-main', appliedPalette.textMain);
root.style.setProperty('--text-bright', appliedPalette.textBright);
root.style.setProperty('--text-muted', appliedPalette.textMuted);
root.style.setProperty('--accent-blue', appliedPalette.axis);
root.style.setProperty('--accent-cyan', appliedPalette.soft.s);
root.style.setProperty('--accent-purple', appliedPalette.hard.s);
root.style.setProperty('--accent-orange', appliedPalette.terminal.s);

renderPaletteGrid();
resizeCanvas(); 
evaluateLayout();