import { CONFIG } from '../engine/Config.js';

export class CanvasRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.stage = document.getElementById('stageContainer');
        this.dpr = window.devicePixelRatio || 1;
        
        this.zoomLevel = 1.0;
        this.panX = 0;
        this.panY = 0;
        this.palette = null;
        this.layers = { soft: true, hard: true, nets: true, grid: true };
        this.hatchPattern = null;
        this.errColor = { f: "rgba(241, 76, 76, 0.3)", s: "#ef4444" };

        window.addEventListener('resize', () => this.resizeCanvas());
    }

    setPalette(palette) {
        this.palette = palette;
        this.hatchPattern = this._createHatchPattern(this.palette.isDarkCanvas);
    }

    resizeCanvas() {
        const cssWidth = this.stage.clientWidth;
        const cssHeight = this.stage.clientHeight;
        this.canvas.width = cssWidth * this.dpr;
        this.canvas.height = cssHeight * this.dpr;
        this.canvas.style.width = `${cssWidth}px`;
        this.canvas.style.height = `${cssHeight}px`;
    }

    centerView() {
        const padding = 150; 
        const scaleX = (this.stage.clientWidth - padding) / CONFIG.DIE_WIDTH;
        const scaleY = (this.stage.clientHeight - padding) / CONFIG.DIE_HEIGHT;
        this.zoomLevel = Math.max(0.1, Math.min(scaleX, scaleY));
        this.panX = (this.stage.clientWidth - CONFIG.DIE_WIDTH * this.zoomLevel) / 2;
        this.panY = (this.stage.clientHeight + CONFIG.DIE_HEIGHT * this.zoomLevel) / 2;
        this.updateZoomDisplay();
    }

    applyZoom(delta, mouseX, mouseY) {
        const prevZoom = this.zoomLevel; 
        this.zoomLevel = Math.max(0.1, Math.min(10.0, this.zoomLevel + delta));
        if (mouseX !== undefined && mouseY !== undefined) {
            this.panX = mouseX - (mouseX - this.panX) * (this.zoomLevel / prevZoom);
            this.panY = mouseY - (mouseY - this.panY) * (this.zoomLevel / prevZoom);
        } else {
            const cx = this.stage.clientWidth / 2; const cy = this.stage.clientHeight / 2;
            this.panX = cx - (cx - this.panX) * (this.zoomLevel / prevZoom);
            this.panY = cy - (cy - this.panY) * (this.zoomLevel / prevZoom);
        }
        this.updateZoomDisplay();
    }

    updateZoomDisplay() {
        document.getElementById('zoomValue').innerText = `${Math.round(this.zoomLevel * 100)}%`;
    }

    getMousePos(evt) {
        const rect = this.canvas.getBoundingClientRect();
        return { 
            x: ((evt.clientX - rect.left) - this.panX) / this.zoomLevel, 
            y: -((evt.clientY - rect.top) - this.panY) / this.zoomLevel 
        };
    }

    draw(blocks, nets, dragState = null) {
        if (!this.palette) return;
        const { ctx, dpr, zoomLevel, panX, panY, palette } = this;
        const cssWidth = this.canvas.width / dpr;
        const cssHeight = this.canvas.height / dpr;

        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.fillStyle = palette.bg;
        ctx.fillRect(0, 0, cssWidth, cssHeight);
        ctx.translate(panX, panY);
        ctx.scale(zoomLevel, zoomLevel);

        if (this.layers.grid) this._drawGrid(cssWidth, cssHeight);
        if (this.layers.nets) this._drawNets(blocks, nets);
        this._drawBlocks(blocks, dragState);

        ctx.restore();
    }

    _drawGrid(cssWidth, cssHeight) {
        const { ctx, zoomLevel, panX, panY, palette } = this;
        const left = -panX / zoomLevel; const right = (cssWidth - panX) / zoomLevel;
        const top = -panY / zoomLevel; const bottom = (cssHeight - panY) / zoomLevel;

        const rawMajor = 90 / zoomLevel;
        const mag = Math.pow(10, Math.floor(Math.log10(rawMajor)));
        const residual = rawMajor / mag;
        const majorStep = residual < 1.5 ? mag : residual < 3.5 ? 2 * mag : residual < 7.5 ? 5 * mag : 10 * mag;
        const minorStep = majorStep / 5;

        const startX = Math.floor(left / minorStep) * minorStep; const endX = Math.ceil(right / minorStep) * minorStep;
        const startY = Math.floor(top / minorStep) * minorStep; const endY = Math.ceil(bottom / minorStep) * minorStep;

        ctx.strokeStyle = palette.grid; ctx.lineWidth = 1 / zoomLevel;
        for (let x = startX; x <= endX; x += minorStep) { ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.stroke(); }
        for (let y = startY; y <= endY; y += minorStep) { ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke(); }

        ctx.strokeStyle = palette.isDarkCanvas ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"; ctx.lineWidth = 1.5 / zoomLevel;
        const startMajorX = Math.floor(left / majorStep) * majorStep; const startMajorY = Math.floor(top / majorStep) * majorStep;
        for (let x = startMajorX; x <= endX; x += majorStep) { ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.stroke(); }
        for (let y = startMajorY; y <= endY; y += majorStep) { ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke(); }

        ctx.strokeStyle = palette.die; ctx.lineWidth = 2.5 / zoomLevel;
        ctx.strokeRect(0, -CONFIG.DIE_HEIGHT, CONFIG.DIE_WIDTH, CONFIG.DIE_HEIGHT);

        ctx.strokeStyle = palette.axis; ctx.lineWidth = 2 / zoomLevel;
        if (0 >= top && 0 <= bottom) { ctx.beginPath(); ctx.moveTo(left, 0); ctx.lineTo(right, 0); ctx.stroke(); }
        if (0 >= left && 0 <= right) { ctx.beginPath(); ctx.moveTo(0, top); ctx.lineTo(0, bottom); ctx.stroke(); }

        ctx.fillStyle = palette.textMuted; 
        ctx.font = `${13 / zoomLevel}px "JetBrains Mono", monospace`;
        const tickLen = 6 / zoomLevel; const textPad = 10 / zoomLevel;

        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        for (let x = startMajorX; x <= endX; x += majorStep) {
            if (Math.abs(x) < 0.1) continue;
            if (0 >= top && 0 <= bottom) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, tickLen); ctx.stroke(); ctx.fillText(Math.round(x), x, textPad); }
        }
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        for (let y = startMajorY; y <= endY; y += majorStep) {
            if (Math.abs(y) < 0.1) continue;
            if (0 >= left && 0 <= right) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(-tickLen, y); ctx.stroke(); ctx.fillText(Math.round(-y), -textPad, y); }
        }
    }

    _drawNets(blocks, nets) {
        const { ctx, zoomLevel, palette } = this;
        ctx.lineWidth = 1.5 / zoomLevel;
        nets.forEach(net => {
            const b1 = blocks.find(b => b.id === net.from);
            const b2 = blocks.find(b => b.id === net.to);
            if (b1 && b2) {
                ctx.strokeStyle = palette.textMuted; ctx.globalAlpha = 0.6;
                ctx.beginPath(); ctx.moveTo(b1.x + b1.w/2, -(b1.y + b1.h/2)); ctx.lineTo(b2.x + b2.w/2, -(b2.y + b2.h/2)); ctx.stroke();
                ctx.globalAlpha = 1.0;
            }
        });
    }

    _drawBlocks(blocks, dragState) {
        const { ctx, zoomLevel, palette } = this;
        
        blocks.forEach(block => {
            if (block.type === 'soft' && !this.layers.soft) return;
            if ((block.type === 'hard' || block.type === 'terminal') && !this.layers.hard) return;

            ctx.save();
            let p = block.isError ? this.errColor : palette[block.type];
            if (!p) p = this.errColor; 

            // Terminal Rendering Logic
            if (block.type === 'terminal') {
                const cx = block.x + block.w / 2;
                const cy = -(block.y + block.h / 2);
                
                // Draw Terminal Dot
                ctx.fillStyle = p.s; 
                ctx.beginPath(); 
                ctx.arc(cx, cy, 6 / zoomLevel, 0, Math.PI * 2); 
                ctx.fill(); 

                // Draw Terminal Label
                const fontSize = 13 / zoomLevel;
                ctx.font = `600 ${fontSize}px "JetBrains Mono", monospace`;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                
                const textX = cx + (12 / zoomLevel);
                
                ctx.lineWidth = 3 / zoomLevel;
                ctx.strokeStyle = palette.bg;
                ctx.strokeText(block.id, textX, cy);
                
                ctx.fillStyle = palette.isDarkCanvas ? "#e2e8f0" : "#475569";
                ctx.fillText(block.id, textX, cy);
                
                ctx.restore();
                return; // Only return after both dot and label are drawn
            }

            // Normal Block Rendering Logic
            const renderY = -block.y - block.h;
            const isFixed = (block.type === 'hard');
            
            ctx.fillStyle = isFixed ? this.hatchPattern : p.f;
            ctx.strokeStyle = isFixed && !block.isError ? (palette.isDarkCanvas ? "#94a3b8" : "#cbd5e1") : p.s;
            ctx.lineWidth = 1.5 / zoomLevel; ctx.lineJoin = 'miter';
            
            const isInteracting = dragState && (dragState.hovered === block || dragState.dragged === block);
            if (isInteracting) {
                ctx.fillStyle = isFixed ? this.hatchPattern : p.s; ctx.globalAlpha = isFixed ? 1.0 : 0.25;
                ctx.fillRect(block.x, renderY, block.w, block.h); ctx.globalAlpha = 1.0;
                ctx.strokeStyle = palette.isDarkCanvas ? "#ffffff" : "#0f172a"; ctx.lineWidth = 2.5 / zoomLevel;
            } else {
                ctx.fillRect(block.x, renderY, block.w, block.h);
                if (block.isError) { ctx.lineWidth = 3 / zoomLevel; ctx.setLineDash([4/zoomLevel, 4/zoomLevel]); }
            }
            
            ctx.strokeRect(block.x, renderY, block.w, block.h);
            
            // Normal Block Labels
            const fontSize = 13 / zoomLevel; ctx.font = `600 ${fontSize}px "JetBrains Mono", monospace`;
            const textWidth = ctx.measureText(block.id).width;
            let textX = block.x + (block.w / 2); let textY = renderY + (block.h / 2);
            const fitsInside = (textWidth + 6 / zoomLevel <= block.w) && (fontSize + 6 / zoomLevel <= block.h);
            
            ctx.textAlign = 'center'; ctx.textBaseline = fitsInside ? 'middle' : 'bottom';
            if (!fitsInside) textY = renderY - (6 / zoomLevel);
            
            ctx.lineWidth = 3 / zoomLevel; ctx.strokeStyle = palette.bg; ctx.strokeText(block.id, textX, textY);
            ctx.fillStyle = isFixed ? (palette.isDarkCanvas ? "#e2e8f0" : "#475569") : (palette.isDarkCanvas ? "#ffffff" : "#0f172a");
            ctx.fillText(block.id, textX, textY);
            ctx.restore();
        });

        if (dragState && dragState.dragged && (dragState.snapX !== null || dragState.snapY !== null)) {
            ctx.save(); ctx.strokeStyle = palette.soft.s; ctx.lineWidth = 1 / zoomLevel; ctx.setLineDash([4 / zoomLevel, 4 / zoomLevel]);
            if (dragState.snapX !== null) { ctx.beginPath(); ctx.moveTo(dragState.snapX, -100000); ctx.lineTo(dragState.snapX, 100000); ctx.stroke(); }
            if (dragState.snapY !== null) { ctx.beginPath(); ctx.moveTo(-100000, -dragState.snapY); ctx.lineTo(100000, -dragState.snapY); ctx.stroke(); }
            ctx.restore();
        }
    }

    _createHatchPattern(isDarkCanvas) {
        const pCanvas = document.createElement('canvas');
        pCanvas.width = 16; pCanvas.height = 16;
        const pCtx = pCanvas.getContext('2d');
        pCtx.fillStyle = isDarkCanvas ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"; pCtx.fillRect(0, 0, 16, 16);
        pCtx.strokeStyle = isDarkCanvas ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)"; pCtx.lineWidth = 2;
        pCtx.beginPath(); pCtx.moveTo(0, 16); pCtx.lineTo(16, 0); pCtx.moveTo(-8, 8); pCtx.lineTo(8, -8); pCtx.moveTo(8, 24); pCtx.lineTo(24, 8); pCtx.stroke();
        return this.ctx.createPattern(pCanvas, 'repeat');
    }
}