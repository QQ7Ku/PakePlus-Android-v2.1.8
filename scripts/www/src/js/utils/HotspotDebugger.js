/**
 * Hotspot Debugger - Real-time hotspot position adjustment
 * Usage: Open browser console and use: app.debugHotspot('rightAPillar', 0.01, 0, 0)
 */

class HotspotDebugger {
    constructor(app) {
        this.app = app;
        this.adjustments = {};
        this.isVisible = true;
    }

    /**
     * Adjust a hotspot position in real-time
     * @param {string} pointId - Point ID (e.g., 'rightAPillar')
     * @param {number} dx - X adjustment
     * @param {number} dy - Y adjustment  
     * @param {number} dz - Z adjustment
     */
    adjust(pointId, dx = 0, dy = 0, dz = 0) {
        if (!Constants.HOTSPOT_POSITIONS[pointId]) {
            console.error('❌ Unknown point:', pointId);
            this.listPoints();
            return;
        }

        // Track adjustments
        if (!this.adjustments[pointId]) {
            this.adjustments[pointId] = { x: 0, y: 0, z: 0 };
        }
        this.adjustments[pointId].x += dx;
        this.adjustments[pointId].y += dy;
        this.adjustments[pointId].z += dz;

        // Apply to Constants
        const pos = Constants.HOTSPOT_POSITIONS[pointId];
        pos.x += dx;
        pos.y += dy;
        pos.z += dz;

        console.log(`✅ Adjusted ${pointId}:`, { x: pos.x.toFixed(3), y: pos.y.toFixed(3), z: pos.z.toFixed(3) });

        // Recreate hotspots to see changes
        this.refreshHotspots();
        
        // Focus camera on this point
        if (this.app.engine3D) {
            this.app.engine3D.focusOnPoint(pos);
        }
    }

    /**
     * Set absolute position for a hotspot
     */
    set(pointId, x, y, z) {
        if (!Constants.HOTSPOT_POSITIONS[pointId]) {
            console.error('❌ Unknown point:', pointId);
            return;
        }

        const pos = Constants.HOTSPOT_POSITIONS[pointId];
        pos.x = x;
        pos.y = y;
        pos.z = z;

        console.log(`✅ Set ${pointId} to:`, { x, y, z });
        this.refreshHotspots();
    }

    /**
     * Get current position of a hotspot
     */
    get(pointId) {
        if (!Constants.HOTSPOT_POSITIONS[pointId]) {
            console.error('❌ Unknown point:', pointId);
            return null;
        }
        return { ...Constants.HOTSPOT_POSITIONS[pointId] };
    }

    /**
     * List all hotspot positions
     */
    list() {
        console.log('📍 Current Hotspot Positions:');
        console.log('================================');
        
        const points = this.app.dataService.getPointsByOrder();
        points.forEach((point, index) => {
            const pos = Constants.HOTSPOT_POSITIONS[point.id];
            const adj = this.adjustments[point.id] || { x: 0, y: 0, z: 0 };
            console.log(
                `${(index + 1).toString().padStart(2, '0')}. ${point.id.padEnd(25)} ` +
                `x: ${pos.x.toFixed(2).padStart(6)}, y: ${pos.y.toFixed(2).padStart(6)}, z: ${pos.z.toFixed(2).padStart(6)}` +
                (adj.x || adj.y || adj.z ? ` (adjusted)` : '')
            );
        });
        
        console.log('================================');
        console.log('💡 Use: app.debugHotspot("pointId", dx, dy, dz)');
        console.log('💡 Or:  app.debugHotspot.set("pointId", x, y, z)');
    }

    /**
     * List all point IDs for reference
     */
    listPoints() {
        console.log('📋 Available Point IDs:');
        Object.keys(Constants.HOTSPOT_POSITIONS).forEach((id, index) => {
            const point = this.app.dataService.getPoint(id);
            const name = point ? point.name : 'Unknown';
            console.log(`  ${index + 1}. ${id} - ${name}`);
        });
    }

    /**
     * Reset a hotspot to original position
     */
    reset(pointId) {
        if (!this.adjustments[pointId]) {
            console.log('ℹ️ No adjustments for', pointId);
            return;
        }

        const adj = this.adjustments[pointId];
        const pos = Constants.HOTSPOT_POSITIONS[pointId];
        
        pos.x -= adj.x;
        pos.y -= adj.y;
        pos.z -= adj.z;
        
        delete this.adjustments[pointId];
        
        console.log(`🔄 Reset ${pointId}`);
        this.refreshHotspots();
    }

    /**
     * Reset all hotspots
     */
    resetAll() {
        Object.keys(this.adjustments).forEach(id => this.reset(id));
        console.log('🔄 All hotspots reset');
    }

    /**
     * Export current positions as code
     */
    export() {
        console.log('📤 Exporting current positions:');
        console.log('================================');
        console.log('const HOTSPOT_POSITIONS = {');
        
        Object.entries(Constants.HOTSPOT_POSITIONS).forEach(([id, pos]) => {
            console.log(`    ${id}: { x: ${pos.x.toFixed(2)}, y: ${pos.y.toFixed(2)}, z: ${pos.z.toFixed(2)} },`);
        });
        
        console.log('};');
        console.log('================================');
    }

    /**
     * Show/hide hotspots
     */
    toggle() {
        this.isVisible = !this.isVisible;
        if (this.app.engine3D) {
            this.app.engine3D.hotspots.forEach((mesh) => {
                mesh.visible = this.isVisible;
            });
        }
        console.log(this.isVisible ? '👁️ Hotspots visible' : '🙈 Hotspots hidden');
    }

    /**
     * Highlight a specific hotspot
     */
    highlight(pointId) {
        if (!this.app.engine3D) return;
        
        const mesh = this.app.engine3D.hotspots.get(pointId);
        if (mesh) {
            // Reset all
            this.app.engine3D.hotspots.forEach(m => {
                m.scale.setScalar(1);
            });
            
            // Highlight this one
            mesh.scale.setScalar(2);
            
            // Focus camera
            const pos = Constants.HOTSPOT_POSITIONS[pointId];
            this.app.engine3D.focusOnPoint(pos);
            
            console.log('✨ Highlighted:', pointId);
        } else {
            console.error('❌ Hotspot not found:', pointId);
        }
    }

    /**
     * Refresh hotspots after position change
     */
    refreshHotspots() {
        if (!this.app.engine3D) return;
        
        // Clear and recreate
        this.app.engine3D.clearHotspots();
        const points = this.app.dataService.getAllPoints();
        this.app.engine3D.createHotspots(points);
    }

    /**
     * Batch adjust multiple points
     * @param {string} pattern - 'all', 'paint', 'structure', 'right', 'left', 'front', 'rear'
     * @param {number} dx - X adjustment
     * @param {number} dy - Y adjustment
     * @param {number} dz - Z adjustment
     */
    batchAdjust(pattern, dx, dy, dz) {
        const points = this.app.dataService.getPointsByOrder();
        let count = 0;
        
        points.forEach(point => {
            let shouldAdjust = false;
            
            switch (pattern) {
                case 'all':
                    shouldAdjust = true;
                    break;
                case 'paint':
                    shouldAdjust = point.category === 'paint';
                    break;
                case 'structure':
                    shouldAdjust = point.category === 'structure';
                    break;
                case 'right':
                    shouldAdjust = point.location === 'right';
                    break;
                case 'left':
                    shouldAdjust = point.location === 'left';
                    break;
                case 'front':
                    shouldAdjust = point.location === 'front';
                    break;
                case 'rear':
                    shouldAdjust = point.location === 'rear';
                    break;
            }
            
            if (shouldAdjust) {
                this.adjust(point.id, dx, dy, dz);
                count++;
            }
        });
        
        console.log(`✅ Adjusted ${count} points matching pattern: ${pattern}`);
    }

    /**
     * Show help
     */
    help() {
        console.log(`
🛠️ Hotspot Debugger Commands:
=============================

1. Adjust single point:
   app.debugHotspot.adjust("rightAPillar", 0.01, 0, 0)
   
2. Set absolute position:
   app.debugHotspot.set("rightAPillar", 0.85, 0.72, 0.95)
   
3. Get current position:
   app.debugHotspot.get("rightAPillar")
   
4. List all positions:
   app.debugHotspot.list()
   
5. Highlight a point:
   app.debugHotspot.highlight("rightAPillar")
   
6. Batch adjust (all/paint/structure/right/left):
   app.debugHotspot.batchAdjust("right", 0.05, 0, 0)
   
7. Reset point:
   app.debugHotspot.reset("rightAPillar")
   
8. Export positions:
   app.debugHotspot.export()
   
9. Show/hide hotspots:
   app.debugHotspot.toggle()

Tips:
- X: Left(-) / Right(+)
- Y: Down(-) / Up(+)
- Z: Rear(-) / Front(+)
- Use small increments: 0.01 to 0.05
=============================
        `);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HotspotDebugger };
} else {
    window.HotspotDebugger = HotspotDebugger;
}
