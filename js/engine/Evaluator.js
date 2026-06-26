import { CONFIG } from './Config.js';

export class LayoutEvaluator {
    static isOverlapping(b1, b2) {
        return !(b1.x + b1.w <= b2.x || b2.x + b2.w <= b1.x || b1.y + b1.h <= b2.y || b2.y + b2.h <= b1.y);
    }

    static evaluate(blocks, nets) {
        let overlapCount = 0;
        let areaViolations = 0;
        blocks.forEach(b => b.isError = false); 

        // Overlap Verification
        for (let i = 0; i < blocks.length; i++) {
            for (let j = i + 1; j < blocks.length; j++) {
                if (blocks[i].type === 'terminal' || blocks[j].type === 'terminal') continue; 
                if (this.isOverlapping(blocks[i], blocks[j])) {
                    blocks[i].isError = true; blocks[j].isError = true; overlapCount++;
                }
            }
        }

        // Area Constraint Verification
        blocks.forEach(b => {
            if (b.type === 'soft' && b.targetArea) {
                const currentArea = b.w * b.h;
                const error = Math.abs(currentArea - b.targetArea) / b.targetArea;
                if (error > CONFIG.AREA_TOLERANCE) { b.isError = true; areaViolations++; }
            }
        });

        // HPWL Calculation
        let hpwl = 0;
        nets.forEach(net => {
            const b1 = blocks.find(b => b.id === net.from);
            const b2 = blocks.find(b => b.id === net.to);
            if (b1 && b2) {
                const cx1 = b1.x + b1.w / 2; const cy1 = b1.y + b1.h / 2;
                const cx2 = b2.x + b2.w / 2; const cy2 = b2.y + b2.h / 2;
                hpwl += net.weight * (Math.abs(cx1 - cx2) + Math.abs(cy1 - cy2));
            }
        });

        // Area Bounding Box
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        blocks.forEach(b => {
            if (b.type === 'terminal') return; 
            if (b.x < minX) minX = b.x; if (b.y < minY) minY = b.y;
            if (b.x + b.w > maxX) maxX = b.x + b.w; if (b.y + b.h > maxY) maxY = b.y + b.h;
        });
        const area = (maxX === -Infinity) ? 0 : Math.round((maxX - minX) * (maxY - minY));

        const totalViolations = overlapCount + areaViolations;
        const estimatedCost = totalViolations > 0 ? 10.0 : (0.7 + (area / 200000) + (hpwl / 5000));

        return { area, hpwl, totalViolations, estimatedCost };
    }
}