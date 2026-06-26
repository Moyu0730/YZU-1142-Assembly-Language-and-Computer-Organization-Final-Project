import { CONFIG, PALETTES, INITIAL_BLOCKS, INITIAL_NETS } from './engine/Config.js';
import { LayoutEvaluator } from './engine/Evaluator.js';
import { CanvasRenderer } from './view/Renderer.js';

class AppController {
    constructor() {
        this.blocks = JSON.parse(JSON.stringify(INITIAL_BLOCKS));
        this.nets = JSON.parse(JSON.stringify(INITIAL_NETS));
        this.renderer = new CanvasRenderer('floorCanvas');
        
        this.dragState = {
            dragged: null, hovered: null, snapX: null, snapY: null,
            offsetX: 0, offsetY: 0, isPanning: false, panStartX: 0, panStartY: 0, initPanX: 0, initPanY: 0
        };

        this.initUI();
        this.initEvents();
        this.applyTheme(PALETTES[0]);
        
        this.renderer.resizeCanvas();
        this.renderer.centerView();
        this.evaluateAndRender();
    }

    initUI() {
        this.renderPaletteGrid();
        
        // Modals
        document.querySelectorAll('[data-close]').forEach(btn => {
            btn.addEventListener('click', (e) => document.getElementById(e.target.dataset.close).close());
        });

        document.getElementById('btnSettings').addEventListener('click', () => document.getElementById('settingsModal').showModal());
        document.getElementById('btnApplySettings').addEventListener('click', () => {
            if (this.pendingPalette) this.applyTheme(this.pendingPalette);
            document.getElementById('settingsModal').close();
        });

        document.getElementById('btnOpenEditor').addEventListener('click', () => {
            this.tempBlocks = JSON.parse(JSON.stringify(this.blocks));
            this.renderEditorTable();
            document.getElementById('editorModal').showModal();
        });

        document.getElementById('btnSaveEditor').addEventListener('click', () => {
            this.blocks = JSON.parse(JSON.stringify(this.tempBlocks));
            document.getElementById('editorModal').close();
            this.evaluateAndRender();
            this.showToast("Layout topology updated.");
        });

        document.getElementById('btnAddBlock').addEventListener('click', () => {
            this.tempBlocks.push({ id: `b${this.tempBlocks.length+1}`, x: 0, y: 0, w: 100, h: 100, type: "soft", targetArea: 10000, isError: false });
            this.renderEditorTable();
        });
        
        // Upload JSON Data
        document.getElementById('uploadData').addEventListener('change', async (evt) => {
            const file = evt.target.files[0];
            if (!file) return;
            try {
                const text = await file.text();
                const parsed = JSON.parse(text);
                if (!Array.isArray(parsed)) throw new Error("JSON must be an array");
                this.tempBlocks = parsed.map(b => ({
                    id: b.id || `b${Math.random().toString().slice(2,6)}`,
                    x: Number(b.x) || 0,
                    y: Number(b.y) || 0,
                    w: Number(b.w) || 10,
                    h: Number(b.h) || 10,
                    targetArea: Number(b.targetArea) || (Number(b.w)*Number(b.h)),
                    type: b.type || 'soft',
                    isError: false
                }));
                this.renderEditorTable();
                this.showToast("JSON loaded into editor. Click Apply to render.");
            } catch(e) {
                this.showToast("Invalid JSON format.");
            }
            evt.target.value = ''; 
        });

        document.getElementById('btnExportJSON').addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.tempBlocks, null, 2));
            const anchor = document.createElement('a');
            anchor.setAttribute("href", dataStr);
            anchor.setAttribute("download", "floorplan_data.json");
            document.body.appendChild(anchor);
            anchor.click(); anchor.remove();
        });
    }

    initEvents() {
        const cvs = this.renderer.canvas;
        
        cvs.addEventListener('mousedown', (e) => { if(e.button === 0) this.handleMouseDown(e); });
        cvs.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('mouseup', () => this.handleMouseUp());
        cvs.addEventListener('wheel', (e) => {
            e.preventDefault();
            const rect = cvs.getBoundingClientRect();
            this.renderer.applyZoom(e.deltaY < 0 ? 0.1 : -0.1, e.clientX - rect.left, e.clientY - rect.top);
            this.renderer.draw(this.blocks, this.nets, this.dragState);
        });

        document.getElementById('btnZoomIn').addEventListener('click', () => { this.renderer.applyZoom(0.2); this.renderer.draw(this.blocks, this.nets, this.dragState); });
        document.getElementById('btnZoomOut').addEventListener('click', () => { this.renderer.applyZoom(-0.2); this.renderer.draw(this.blocks, this.nets, this.dragState); });
        document.getElementById('btnRecenter').addEventListener('click', () => { this.renderer.centerView(); this.renderer.draw(this.blocks, this.nets, this.dragState); });
        document.getElementById('btnReset').addEventListener('click', () => {
            this.blocks = JSON.parse(JSON.stringify(INITIAL_BLOCKS));
            this.nets = JSON.parse(JSON.stringify(INITIAL_NETS));
            this.renderer.centerView(); this.evaluateAndRender();
        });
        document.getElementById('btnRandom').addEventListener('click', () => this.generateRandomLayout());

        const bindLayer = (id, key) => {
            document.getElementById(id).addEventListener('change', (e) => { this.renderer.layers[key] = e.target.checked; this.renderer.draw(this.blocks, this.nets, this.dragState); });
        };
        bindLayer('toggleSoft', 'soft'); bindLayer('toggleHard', 'hard'); bindLayer('toggleNets', 'nets'); bindLayer('toggleGrid', 'grid');
    }

    handleMouseDown(evt) {
        const pos = this.renderer.getMousePos(evt);
        let found = this.blocks.find(b => pos.x >= b.x && pos.x <= b.x + b.w && pos.y >= b.y && pos.y <= b.y + b.h);
        
        if (found) {
            if (found.type === 'hard' || found.type === 'terminal') {
                this.showToast(`Constraint active: ${found.id} cannot be moved manually.`);
                this.dragState.dragged = null;
            } else {
                this.dragState.dragged = found;
                this.dragState.offsetX = pos.x - found.x; this.dragState.offsetY = pos.y - found.y;
                this.renderer.canvas.style.cursor = 'grabbing';
            }
        } else {
            this.dragState.isPanning = true; this.dragState.panStartX = evt.clientX; this.dragState.panStartY = evt.clientY;
            this.dragState.initPanX = this.renderer.panX; this.dragState.initPanY = this.renderer.panY;
            this.renderer.canvas.style.cursor = 'grabbing';
        }
    }

    handleMouseMove(evt) {
        const pos = this.renderer.getMousePos(evt);
        document.getElementById('coordDisplay').innerText = `X: ${Math.round(pos.x)}, Y: ${Math.round(pos.y)}`;

        if (this.dragState.dragged) {
            let nx = pos.x - this.dragState.offsetX; let ny = pos.y - this.dragState.offsetY;
            const snapDist = CONFIG.SNAP_DISTANCE_BASE / this.renderer.zoomLevel;
            let snapX = [0, CONFIG.DIE_WIDTH]; let snapY = [0, CONFIG.DIE_HEIGHT];
            
            this.blocks.forEach(b => {
                if (b === this.dragState.dragged || b.type === 'terminal') return;
                snapX.push(b.x, b.x + b.w); snapY.push(b.y, b.y + b.h);
            });

            this.dragState.snapX = null; this.dragState.snapY = null;
            let minDx = snapDist, minDy = snapDist;

            snapX.forEach(lx => {
                if (Math.abs(nx - lx) < minDx) { minDx = Math.abs(nx - lx); nx = lx; this.dragState.snapX = lx; }
                if (Math.abs((nx + this.dragState.dragged.w) - lx) < minDx) { minDx = Math.abs((nx + this.dragState.dragged.w) - lx); nx = lx - this.dragState.dragged.w; this.dragState.snapX = lx; }
            });
            snapY.forEach(ly => {
                if (Math.abs(ny - ly) < minDy) { minDy = Math.abs(ny - ly); ny = ly; this.dragState.snapY = ly; }
                if (Math.abs((ny + this.dragState.dragged.h) - ly) < minDy) { minDy = Math.abs((ny + this.dragState.dragged.h) - ly); ny = ly - this.dragState.dragged.h; this.dragState.snapY = ly; }
            });

            this.dragState.dragged.x = nx; this.dragState.dragged.y = ny;
            this.evaluateAndRender();
        } else if (this.dragState.isPanning) {
            this.renderer.panX = this.dragState.initPanX + (evt.clientX - this.dragState.panStartX);
            this.renderer.panY = this.dragState.initPanY + (evt.clientY - this.dragState.panStartY);
            this.renderer.draw(this.blocks, this.nets, this.dragState);
        } else {
            let found = this.blocks.find(b => pos.x >= b.x && pos.x <= b.x + b.w && pos.y >= b.y && pos.y <= b.y + b.h);
            if (this.dragState.hovered !== found) {
                this.dragState.hovered = found; this.updateInspector();
                this.renderer.canvas.style.cursor = found ? ((found.type === 'soft') ? 'grab' : 'not-allowed') : 'default';
                this.renderer.draw(this.blocks, this.nets, this.dragState);
            }
        }
    }

    handleMouseUp() {
        this.dragState.dragged = null; this.dragState.isPanning = false;
        this.dragState.snapX = null; this.dragState.snapY = null;
        this.renderer.canvas.style.cursor = this.dragState.hovered ? ((this.dragState.hovered.type === 'soft') ? 'grab' : 'not-allowed') : 'default';
        this.evaluateAndRender();
    }

    evaluateAndRender() {
        const metrics = LayoutEvaluator.evaluate(this.blocks, this.nets);
        document.getElementById('valArea').innerText = `${metrics.area.toLocaleString()} px²`;
        document.getElementById('valHPWL').innerText = Math.round(metrics.hpwl).toLocaleString();
        
        const sysStatus = document.getElementById('systemStatus');
        const overlapEl = document.getElementById('valOverlap');
        const penaltyEl = document.getElementById('valPenalty');
        const indicator = document.querySelector('.status-indicator');

        if (metrics.totalViolations > 0) {
            overlapEl.innerText = `Infeasible (${metrics.totalViolations} Errors)`; overlapEl.className = "value text-danger";
            penaltyEl.innerText = "M = 10"; penaltyEl.className = "value text-danger";
            sysStatus.innerText = "Hard Constraint Violated"; indicator.classList.add('error');
        } else {
            overlapEl.innerText = "Feasible"; overlapEl.className = "value text-success";
            penaltyEl.innerText = "0"; penaltyEl.className = "value text-success";
            sysStatus.innerText = "Ready & Feasible"; indicator.classList.remove('error');
        }
        document.getElementById('valCost').innerText = metrics.estimatedCost.toFixed(4);
        
        this.updateInspector();
        this.renderer.draw(this.blocks, this.nets, this.dragState);
    }

    generateRandomLayout() {
        this.blocks = []; this.nets = [];
        const numSoft = Math.floor(Math.random() * 5) + 3;
        const numHard = Math.floor(Math.random() * 3) + 1;
        const numTerminals = Math.floor(Math.random() * 2) + 1;
        
        let blockIds = [];
        const getRandomPos = (w, h) => ({ x: Math.random() * (CONFIG.DIE_WIDTH - w - 20) + 10, y: Math.random() * (CONFIG.DIE_HEIGHT - h - 20) + 10 });

        for (let i = 0; i < numSoft; i++) {
            const id = `s_blk_${i}`; const w = Math.floor(Math.random() * 80) + 40; const h = Math.floor(Math.random() * 80) + 40;
            const pos = getRandomPos(w, h);
            this.blocks.push({ id, x: pos.x, y: pos.y, w, h, type: "soft", targetArea: w * h, isError: false });
            blockIds.push(id);
        }
        for (let i = 0; i < numHard; i++) {
            const id = `h_blk_${i}`; const w = Math.floor(Math.random() * 60) + 30; const h = Math.floor(Math.random() * 60) + 30;
            const pos = getRandomPos(w, h);
            this.blocks.push({ id, x: pos.x, y: pos.y, w, h, type: "hard", targetArea: w * h, isError: false });
            blockIds.push(id);
        }
        for (let i = 0; i < numTerminals; i++) {
            const id = `Term_${i}`; const y = Math.random() > 0.5 ? CONFIG.DIE_HEIGHT - 10 : 10;
            this.blocks.push({ id, x: Math.random() * (CONFIG.DIE_WIDTH - 20) + 10, y, w: 10, h: 10, type: "terminal", targetArea: 100, isError: false });
            blockIds.push(id);
        }

        const numNets = Math.floor(Math.random() * 6) + 4;
        for (let i = 0; i < numNets; i++) {
            const sourceIdx = Math.floor(Math.random() * blockIds.length);
            let targetIdx = Math.floor(Math.random() * blockIds.length);
            while(targetIdx === sourceIdx) targetIdx = Math.floor(Math.random() * blockIds.length);
            this.nets.push({ from: blockIds[sourceIdx], to: blockIds[targetIdx], weight: Math.floor(Math.random() * 3) + 1 });
        }

        this.renderer.centerView();
        this.evaluateAndRender();
        this.showToast("Random Layout Generated");
    }

    applyTheme(palette) {
        const root = document.documentElement;
        root.style.setProperty('--bg-base', palette.bg); root.style.setProperty('--bg-panel', palette.panel);
        root.style.setProperty('--bg-surface', palette.surface); root.style.setProperty('--border-color', palette.border);
        root.style.setProperty('--text-main', palette.textMain); root.style.setProperty('--text-bright', palette.textBright);
        root.style.setProperty('--text-muted', palette.textMuted); root.style.setProperty('--accent-blue', palette.axis);
        root.style.setProperty('--accent-cyan', palette.soft.s); root.style.setProperty('--accent-purple', palette.hard.s);
        
        this.renderer.setPalette(palette);
        this.renderer.draw(this.blocks, this.nets, this.dragState);
        this.showToast(`Theme applied: ${palette.name}`);
    }

    renderPaletteGrid() {
        const grid = document.getElementById('paletteGrid');
        grid.innerHTML = '';
        PALETTES.forEach(pal => {
            const btn = document.createElement('div');
            btn.className = `palette-btn ${this.renderer.palette === pal ? 'active' : ''}`;
            btn.innerHTML = `<div class="color-swatches-top"><div style="background:${pal.bg};"></div><div style="background:${pal.panel};"></div><div style="background:${pal.soft.s};"></div></div><div class="palette-info"><div class="palette-name">${pal.name}</div><div class="palette-desc">${pal.desc}</div></div>`;
            btn.onclick = () => { document.querySelectorAll('.palette-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); this.pendingPalette = pal; };
            grid.appendChild(btn);
        });
    }

    renderEditorTable() {
        const tbody = document.getElementById('editorTbody'); tbody.innerHTML = '';
        window.appUpdateBlock = (idx, key, val) => { this.tempBlocks[idx][key] = (key === 'id' || key === 'type') ? val : Number(val); };
        window.appRemoveBlock = (idx) => { this.tempBlocks.splice(idx, 1); this.renderEditorTable(); };

        this.tempBlocks.forEach((b, i) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td><input type="text" class="ed-input" value="${b.id}" oninput="appUpdateBlock(${i}, 'id', this.value)"></td><td><input type="number" class="ed-input" value="${Math.round(b.x)}" oninput="appUpdateBlock(${i}, 'x', this.value)"></td><td><input type="number" class="ed-input" value="${Math.round(b.y)}" oninput="appUpdateBlock(${i}, 'y', this.value)"></td><td><input type="number" class="ed-input" value="${Math.round(b.w)}" oninput="appUpdateBlock(${i}, 'w', this.value)"></td><td><input type="number" class="ed-input" value="${Math.round(b.h)}" oninput="appUpdateBlock(${i}, 'h', this.value)"></td><td><input type="number" class="ed-input" value="${Math.round(b.targetArea)}" oninput="appUpdateBlock(${i}, 'targetArea', this.value)"></td><td><select class="ed-input" onchange="appUpdateBlock(${i}, 'type', this.value)"><option value="soft" ${b.type==='soft'?'selected':''}>Soft</option><option value="hard" ${b.type==='hard'?'selected':''}>Hard</option><option value="terminal" ${b.type==='terminal'?'selected':''}>Terminal</option></select></td><td><button class="btn btn-outline-danger btn-sm" onclick="appRemoveBlock(${i})">Del</button></td>`;
            tbody.appendChild(tr);
        });
    }

    updateInspector() {
        const content = document.getElementById('inspectorContent');
        const block = this.dragState.hovered;
        if (!block) { content.innerHTML = '<div class="empty-state">Hover or drag a block to inspect details.</div>'; return; }

        let statusMsg = "FEASIBLE"; let statusCls = "text-success";
        if (block.isError) {
            statusCls = "text-danger";
            statusMsg = (block.type === 'soft' && Math.abs((block.w * block.h) - block.targetArea) / block.targetArea > CONFIG.AREA_TOLERANCE) ? "AREA ERROR > 1%" : "OVERLAP ERROR";
        }
        content.innerHTML = `<div class="inspector-grid"><div class="prop-box full"><span class="prop-label">ID</span><span class="prop-value">${block.id}</span></div><div class="prop-box"><span class="prop-label">Type</span><span class="prop-value" style="text-transform: capitalize;">${block.type}</span></div><div class="prop-box"><span class="prop-label">Status</span><span class="prop-value ${statusCls}">${statusMsg}</span></div><div class="prop-box"><span class="prop-label">Origin (X,Y)</span><span class="prop-value">${Math.round(block.x)}, ${Math.round(block.y)}</span></div><div class="prop-box"><span class="prop-label">Size (W,H)</span><span class="prop-value">${Math.round(block.w)} x ${Math.round(block.h)}</span></div></div>`;
    }

    showToast(msg) {
        const toast = document.getElementById('toastMsg');
        toast.innerText = msg; toast.classList.add('show');
        if (this.toastTimer) clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
    }
}

// Bootstrap Application
window.onload = () => { window.app = new AppController(); };