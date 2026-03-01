/**
 * Engine 3D Service
 * Fixes: Memory management, raycasting performance, error handling
 */

class Engine3DService {
    constructor(canvasId, eventBus) {
        this.canvasId = canvasId;
        this.eventBus = eventBus;
        this.canvas = document.getElementById(canvasId);
        
        if (!this.canvas) {
            throw new Error(`Canvas #${canvasId} not found`);
        }

        // Core objects
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Objects
        this.carGroup = null;
        this.hotspots = new Map();
        
        // State
        this.selectedPoint = null;
        this.hoveredPoint = null;
        this.isRunning = false;
        this.animationId = null;
        
        // Performance
        this.raycastThrottle = null;
        this.lastRaycastTime = 0;
        
        // Animation management
        this.animationMixers = new Map();
        
        // Performance settings from device detector
        this.perfConfig = window.DevicePerformanceDetector?.getOptimizationConfig() || {
            pixelRatio: Math.min(window.devicePixelRatio, 2),
            antialias: true,
            shadows: { enabled: true, mapSize: 2048 },
            hotspotSegments: 32,
            frameRate: 60
        };
        
        // Page visibility
        this.isVisible = true;
        
        // Bound event handlers (for proper cleanup)
        this._boundOnResize = this.onResize.bind(this);
        this._boundOnClick = this.onClick.bind(this);
        this._boundOnMouseMove = this.onMouseMove.bind(this);
        this._boundOnTouchStart = this.onTouchStart.bind(this);
        this._boundOnTouchEnd = this.onTouchEnd.bind(this);
        this._boundContextLost = this.onContextLost.bind(this);
        this._boundContextRestored = this.onContextRestored.bind(this);
        
        // Init
        this.init();
    }

    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupControls();
        this.setupLighting();
        this.setupEnvironment();
        this.setupEvents();
        
        this.isRunning = true;
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0e17);
        this.scene.fog = new THREE.Fog(0x0a0e17, 10, 50);
    }

    setupCamera() {
        const aspect = this.canvas.parentElement.clientWidth / this.canvas.parentElement.clientHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        this.camera.position.set(6, 4, 6);
    }

    setupRenderer() {
        const config = this.perfConfig;
        
        console.log('🎨 Setting up renderer with config:', config);

        // Check WebGL support first
        if (!this.isWebGLSupported()) {
            throw new Error('WebGL is not supported in this browser');
        }

        // Ensure canvas has valid size
        const parent = this.canvas.parentElement;
        if (!parent || parent.clientWidth === 0 || parent.clientHeight === 0) {
            console.warn('Canvas parent has no size, using default');
        }

        const width = parent?.clientWidth || 800;
        const height = parent?.clientHeight || 600;

        try {
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
                antialias: config.antialias,
                alpha: true,
                powerPreference: config.frameRate === 30 ? 'low-power' : 'default',
                failIfMajorPerformanceCaveat: false,
                preserveDrawingBuffer: true
            });
        } catch (e) {
            console.error('Failed to create WebGL renderer:', e);
            throw new Error('Error creating WebGL context');
        }

        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(config.pixelRatio);
        this.renderer.shadowMap.enabled = config.shadows.enabled;
        
        if (config.shadows.enabled) {
            const shadowTypes = {
                'PCFSoftShadowMap': THREE.PCFSoftShadowMap,
                'PCFShadowMap': THREE.PCFShadowMap,
                'BasicShadowMap': THREE.BasicShadowMap
            };
            this.renderer.shadowMap.type = shadowTypes[config.shadows.type] || THREE.PCFSoftShadowMap;
        }

        // Context loss handling
        this.canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            this.isRunning = false;
            console.warn('WebGL context lost');
        }, false);

        this.canvas.addEventListener('webglcontextrestored', () => {
            console.log('WebGL context restored');
            this.init();
        }, false);
    }

    isWebGLSupported() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 20;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.05;

        if (this.isMobile()) {
            this.controls.rotateSpeed = 0.8;
            this.controls.zoomSpeed = 1.2;
            this.controls.enablePan = false;
            this.raycaster.params.Points.threshold = 20;
            this.raycaster.params.Line.threshold = 20;
        }
    }

    setupLighting() {
        const config = this.perfConfig;
        let lightCount = 0;

        // 环境光 - 始终启用
        const ambient = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambient);
        lightCount++;

        // 主光源
        if (lightCount < config.maxLights) {
            const main = new THREE.DirectionalLight(0xffffff, 1);
            main.position.set(5, 10, 5);
            
            if (config.shadows.enabled) {
                main.castShadow = true;
                main.shadow.mapSize.set(config.shadows.mapSize, config.shadows.mapSize);
                main.shadow.camera.near = 0.5;
                main.shadow.camera.far = 50;
                main.shadow.bias = -0.0005;
            }
            
            this.scene.add(main);
            lightCount++;
        }

        // 补光 - 仅在高端设备
        if (lightCount < config.maxLights && config.maxLights > 3) {
            const fill = new THREE.DirectionalLight(0x88ccff, 0.4);
            fill.position.set(-5, 5, -5);
            this.scene.add(fill);
        }
    }

    setupEnvironment() {
        // Grid
        const grid = new THREE.GridHelper(20, 20, 0x2a3449, 0x1a2332);
        this.scene.add(grid);

        // Ground
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(40, 40),
            new THREE.MeshStandardMaterial({
                color: 0x0a0e17,
                roughness: 0.8,
                metalness: 0.2
            })
        );
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -0.01;
        plane.receiveShadow = true;
        this.scene.add(plane);
    }

    setupEvents() {
        window.addEventListener('resize', this._boundOnResize);
        document.addEventListener('visibilitychange', () => this.onVisibilityChange());
        
        // Mouse
        this.canvas.addEventListener('click', this._boundOnClick);
        this.canvas.addEventListener('mousemove', this._boundOnMouseMove);
        
        // Touch
        this.canvas.addEventListener('touchstart', this._boundOnTouchStart, { passive: false });
        this.canvas.addEventListener('touchend', this._boundOnTouchEnd, { passive: false });
        
        // WebGL Context
        this.canvas.addEventListener('webglcontextlost', this._boundContextLost);
        this.canvas.addEventListener('webglcontextrestored', this._boundContextRestored);
    }

    onVisibilityChange() {
        this.isVisible = !document.hidden;
        if (document.hidden) {
            this.isRunning = false;
            console.log('📱 Page hidden, pausing render');
        } else {
            this.isRunning = true;
            console.log('📱 Page visible, resuming render');
        }
    }

    onContextLost(e) {
        e.preventDefault();
        this.isRunning = false;
        console.warn('WebGL context lost');
    }

    onContextRestored() {
        console.log('WebGL context restored');
        this.init();
    }

    // Hotspot creation
    createHotspots(points) {
        console.log('🔥 Creating hotspots for', Object.keys(points).length, 'points');
        let created = 0;
        let skipped = 0;
        
        Object.values(points).forEach(point => {
            const result = this.createHotspot(point.id, point);
            if (result) {
                created++;
            } else {
                skipped++;
                console.warn('⚠️ Failed to create hotspot for:', point.id);
            }
        });
        
        console.log(`✅ Hotspots created: ${created}, skipped: ${skipped}, total in map: ${this.hotspots.size}`);
    }

    createHotspot(id, config) {
        const position = Constants.HOTSPOT_POSITIONS[id];
        if (!position) {
            console.warn('No position for hotspot:', id);
            return null;
        }

        const isStructure = config.category === 'structure';
        // Use unified color scheme from Constants
        const colors = isStructure ? Constants.HOTSPOT_COLORS.structure : Constants.HOTSPOT_COLORS.paint;
        const isMobile = this.isMobile();
        const scale = isMobile ? 2.0 : 1.0;
        const segments = this.perfConfig.hotspotSegments || 32;

        const group = new THREE.Group();
        group.position.set(position.x, position.y, position.z);
        group.userData = {
            id,
            name: config.name,
            category: config.category,
            visible: false
        };

        // Ring - outer glow (使用配置的分段数)
        const ringGeo = new THREE.RingGeometry(0.15 * scale, 0.2 * scale, segments);
        const ringMat = new THREE.MeshBasicMaterial({
            color: colors.ring,
            transparent: true,
            opacity: isMobile ? 0.8 : 0.6,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.name = 'ring';
        group.add(ring);

        // Dot - center point with glow effect (使用配置的分段数)
        const dotGeo = new THREE.SphereGeometry(0.1 * scale, segments, segments);
        const dotMat = new THREE.MeshStandardMaterial({ 
            color: colors.primary,
            emissive: colors.primary,
            emissiveIntensity: 0.5,
            roughness: 0.4,
            metalness: 0.6
        });
        const dot = new THREE.Mesh(dotGeo, dotMat);
        dot.name = 'dot';
        group.add(dot);

        // Glow effect - larger transparent sphere (仅在高端设备显示)
        if (this.perfConfig.frameRate >= 60) {
            const glowGeo = new THREE.SphereGeometry(0.2 * scale, Math.max(8, segments/2), Math.max(8, segments/2));
            const glowMat = new THREE.MeshBasicMaterial({
                color: colors.glow,
                transparent: true,
                opacity: 0.3
            });
            const glow = new THREE.Mesh(glowGeo, glowMat);
            glow.name = 'glow';
            group.add(glow);
        }

        // Hit area (invisible)
        const hitGeo = new THREE.SphereGeometry(0.4 * scale, 8, 8);
        const hitMat = new THREE.MeshBasicMaterial({
            color: colors.primary,
            transparent: true,
            opacity: 0
        });
        const hitArea = new THREE.Mesh(hitGeo, hitMat);
        hitArea.name = 'hitArea';
        group.add(hitArea);

        // Line - connecting to ground
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, -0.3 * scale, 0)
        ]);
        const lineMat = new THREE.LineBasicMaterial({ color: colors.primary, transparent: true, opacity: 0.5 });
        const line = new THREE.Line(lineGeo, lineMat);
        group.add(line);

        this.scene.add(group);
        this.hotspots.set(id, group);
        
        // Verify hotspot was created correctly
        console.log('✅ Hotspot created:', id, 'children:', group.children.map(c => ({ 
            name: c.name, 
            hasMaterial: !!c.material,
            hasColor: !!(c.material?.color)
        })));
        
        // Animate
        this.animateRing(ring);
        
        return group;
    }

    animateRing(ring) {
        // Cancel existing animation if any
        if (ring.userData?.animationId) {
            cancelAnimationFrame(ring.userData.animationId);
        }
        
        const animate = () => {
            if (!ring.parent || !this.isRunning) {
                // Stop animation if ring removed or engine stopped
                return;
            }
            const time = Date.now() * 0.002;
            const scale = 1 + Math.sin(time) * 0.2;
            ring.scale.set(scale, scale, 1);
            ring.userData = ring.userData || {};
            ring.userData.animationId = requestAnimationFrame(animate);
        };
        
        ring.userData = ring.userData || {};
        ring.userData.animationId = requestAnimationFrame(animate);
    }

    updateHotspot(id, status, judgment) {
        const hotspot = this.hotspots.get(id);
        if (!hotspot) {
            console.warn('⚠️ updateHotspot: hotspot not found for id:', id);
            return;
        }
        
        console.log('🎨 updateHotspot:', id, 'status:', status, 'children:', hotspot.children.map(c => c.name));

        const isStructure = hotspot.userData.category === 'structure';
        // Use unified color scheme
        const colors = isStructure ? Constants.HOTSPOT_COLORS.structure : Constants.HOTSPOT_COLORS.paint;
        
        // 按状态着色：正常时用类别色（漆面蓝/结构橙），有问题时用状态色（黄/红）
        let primaryColor, ringColor, glowColor;
        switch (status) {
            case 'good':
                primaryColor = colors.primary;
                ringColor = colors.ring;
                glowColor = colors.glow;
                break;
            case 'warning':
                primaryColor = Constants.HOTSPOT_COLORS.status.warning;
                ringColor = 0xf5b041;
                glowColor = 0xf8c471;
                break;
            case 'danger':
                primaryColor = Constants.HOTSPOT_COLORS.status.danger;
                ringColor = 0xec7063;
                glowColor = 0xf1948a;
                break;
            default:
                primaryColor = colors.primary;
                ringColor = colors.ring;
                glowColor = colors.glow;
        }

        const ring = hotspot.getObjectByName('ring');
        const dot = hotspot.getObjectByName('dot');
        const glow = hotspot.getObjectByName('glow');

        // 安全地更新颜色，添加详细检查
        if (ring && ring.material && ring.material.color) {
            ring.material.color.setHex(ringColor);
        } else {
            console.warn('⚠️ Cannot update ring color for hotspot:', id, 'ring:', !!ring, 'material:', !!(ring?.material), 'color:', !!(ring?.material?.color));
        }
        
        if (dot && dot.material && dot.material.color) {
            dot.material.color.setHex(primaryColor);
            if (dot.material.emissive) {
                dot.material.emissive.setHex(primaryColor);
            }
        } else {
            console.warn('⚠️ Cannot update dot color for hotspot:', id, 'dot:', !!dot, 'material:', !!(dot?.material), 'color:', !!(dot?.material?.color));
        }
        
        if (glow && glow.material && glow.material.color) {
            glow.material.color.setHex(glowColor);
        } else {
            console.warn('⚠️ Cannot update glow color for hotspot:', id, 'glow:', !!glow, 'material:', !!(glow?.material), 'color:', !!(glow?.material?.color));
        }

        // All hotspots are visible by default, filter controls visibility
        hotspot.visible = true;
        hotspot.userData.status = status;
        hotspot.userData.judgment = judgment;
    }

    clearHotspots() {
        this.hotspots.forEach(hotspot => {
            this.scene.remove(hotspot);
        });
        this.hotspots.clear();
    }

    setHotspotVisibility(id, visible) {
        const hotspot = this.hotspots.get(id);
        if (hotspot) {
            hotspot.visible = visible;
        }
    }

    /**
     * Show all hotspots
     */
    showAllHotspots() {
        this.hotspots.forEach(hotspot => {
            hotspot.visible = true;
        });
        console.log('👁️ Showing all hotspots');
    }

    /**
     * Filter hotspots by category and status
     * @param {string|null} category - 'paint', 'structure', or null for all
     * @param {boolean} showOnlyIssues - If true, only show hotspots with issues (warning/danger)
     */
    filterHotspots(category = null, showOnlyIssues = false) {
        this.hotspots.forEach((hotspot, id) => {
            const hotspotCategory = hotspot.userData.category;
            const status = hotspot.userData.status;
            
            // Check category filter
            const categoryMatch = !category || hotspotCategory === category;
            
            // Check issues filter
            const hasIssues = status === 'warning' || status === 'danger';
            const issuesMatch = !showOnlyIssues || hasIssues;
            
            // Show if both conditions match
            hotspot.visible = categoryMatch && issuesMatch;
        });
        
        console.log(`🔍 Hotspot filter: category=${category}, showOnlyIssues=${showOnlyIssues}`);
    }

    /**
     * Focus on first visible hotspot of a category
     */
    focusOnFirstVisible(category) {
        for (const [id, hotspot] of this.hotspots) {
            if (hotspot.visible && hotspot.userData.category === category) {
                const pos = Constants.HOTSPOT_POSITIONS[id];
                if (pos) {
                    this.focusOnPoint(pos);
                    return id;
                }
            }
        }
        return null;
    }

    /**
     * Reset camera to show full vehicle overview
     */
    showFullVehicleView() {
        // Position camera to see the whole vehicle
        const targetPosition = { x: 8, y: 5, z: 8 };  // Isometric view from distance
        const targetLookAt = { x: 0, y: 1, z: 0 };    // Look at center of vehicle
        
        if (typeof gsap !== 'undefined') {
            gsap.to(this.camera.position, {
                x: targetPosition.x,
                y: targetPosition.y,
                z: targetPosition.z,
                duration: 1,
                ease: 'power2.inOut'
            });
            gsap.to(this.controls.target, {
                x: targetLookAt.x,
                y: targetLookAt.y,
                z: targetLookAt.z,
                duration: 1,
                ease: 'power2.inOut'
            });
        } else {
            this.camera.position.set(targetPosition.x, targetPosition.y, targetPosition.z);
            this.controls.target.set(targetLookAt.x, targetLookAt.y, targetLookAt.z);
            this.controls.update();
        }
    }

    // Interactions
    onClick(event) {
        this.updateMouse(event);
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const objects = Array.from(this.hotspots.values());
        const intersects = this.raycaster.intersectObjects(objects, true);

        if (intersects.length > 0) {
            let target = intersects[0].object;
            while (target.parent && !target.userData.id) {
                target = target.parent;
            }

            const id = target.userData.id;
            if (id) {
                this.selectPoint(id);
            }
        }
    }

    onMouseMove(event) {
        this.updateMouse(event);

        // Throttled raycasting
        const now = performance.now();
        if (now - this.lastRaycastTime < 50) return; // 20fps max
        this.lastRaycastTime = now;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const objects = Array.from(this.hotspots.values());
        const intersects = this.raycaster.intersectObjects(objects, true);

        if (intersects.length > 0) {
            let target = intersects[0].object;
            while (target.parent && !target.userData.id) {
                target = target.parent;
            }
            const id = target.userData.id;
            if (id && id !== this.hoveredPoint) {
                this.hoveredPoint = id;
                this.eventBus.emit(Events.POINT_HOVERED, id, target.userData.name);
            }
        } else if (this.hoveredPoint) {
            this.hoveredPoint = null;
            this.eventBus.emit(Events.POINT_HOVERED, null, null);
        }
    }

    onTouchStart(e) {
        if (e.touches.length === 1) {
            this.touchStart = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
                time: Date.now()
            };
        }
    }

    onTouchEnd(e) {
        if (!this.touchStart || e.changedTouches.length !== 1) return;

        const touch = e.changedTouches[0];
        const dx = touch.clientX - this.touchStart.x;
        const dy = touch.clientY - this.touchStart.y;
        const dt = Date.now() - this.touchStart.time;

        // Tap detection
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && dt < 300) {
            this.onClick({ clientX: touch.clientX, clientY: touch.clientY });
        }
    }

    selectPoint(id) {
        if (this.selectedPoint === id) return;

        // Deselect previous
        if (this.selectedPoint) {
            this.highlightHotspot(this.selectedPoint, false);
        }

        this.selectedPoint = id;
        this.highlightHotspot(id, true);

        this.eventBus.emit(Events.POINT_SELECTED, id);
    }

    highlightHotspot(id, highlight) {
        const hotspot = this.hotspots.get(id);
        if (!hotspot) return;

        const dot = hotspot.getObjectByName('dot');
        const ring = hotspot.getObjectByName('ring');

        if (dot) {
            const scale = highlight ? 1.8 : 1.0;
            if (typeof gsap !== 'undefined') {
                gsap.to(dot.scale, { x: scale, y: scale, z: scale, duration: 0.3 });
            } else {
                dot.scale.setScalar(scale);
            }
        }

        if (ring) {
            ring.material.opacity = highlight ? 1.0 : (this.isMobile() ? 0.8 : 0.6);
        }
    }

    setCameraView(view) {
        const positions = {
            front: { x: 0, y: 2, z: 8 },
            rear: { x: 0, y: 2, z: -8 },
            left: { x: -8, y: 2, z: 0 },
            right: { x: 8, y: 2, z: 0 },
            top: { x: 0, y: 10, z: 0 },
            iso: { x: 6, y: 4, z: 6 }
        };

        const pos = positions[view] || positions.iso;

        if (typeof gsap !== 'undefined') {
            gsap.to(this.camera.position, {
                x: pos.x, y: pos.y, z: pos.z,
                duration: 1,
                onUpdate: () => this.camera.lookAt(0, 0, 0)
            });
        } else {
            this.camera.position.set(pos.x, pos.y, pos.z);
            this.camera.lookAt(0, 0, 0);
        }

        this.eventBus.emit(Events.CAMERA_CHANGED, view);
    }

    focusOnPoint(position) {
        if (typeof gsap !== 'undefined') {
            gsap.to(this.controls.target, {
                x: position.x,
                y: position.y,
                z: position.z,
                duration: 0.5
            });
        } else {
            this.controls.target.set(position.x, position.y, position.z);
        }
    }

    loadModel(object) {
        if (this.carGroup) {
            this.scene.remove(this.carGroup);
        }

        this.carGroup = object;
        
        // Note: Position is already set by ModelLoader.processModel()
        // to ensure the bottom of the model touches the ground (y=0).
        // We only center X and Z here if needed, but preserve Y position.
        // 
        // If you need to re-center horizontally, do it carefully:
        // const box = new THREE.Box3().setFromObject(object);
        // const center = box.getCenter(new THREE.Vector3());
        // // Only adjust X and Z, preserve Y (height from ground)
        // object.position.x -= center.x;
        // object.position.z -= center.z;
        // // DO NOT modify object.position.y here - it's already set correctly

        this.scene.add(object);
        this.eventBus.emit(Events.MODEL_LOADED, object);
    }

    animate() {
        if (!this.isRunning) return;
        
        this.animationId = requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    // Utilities
    updateMouse(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    onResize() {
        const container = this.canvas.parentElement;
        if (!container) return;
        
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    isMobile() {
        return /iPad|Android|iPhone/.test(navigator.userAgent) || 
               (window.innerWidth >= 768 && 'ontouchstart' in window);
    }

    setActive(active) {
        this.isRunning = active;
        if (active) {
            this.animate();
        }
    }

    handleResize() {
        const container = this.canvas.parentElement;
        if (!container) return;
        
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    dispose() {
        this.isRunning = false;
        
        // Cancel main animation frame
        if (this.animationId) cancelAnimationFrame(this.animationId);
        
        // Remove all event listeners
        window.removeEventListener('resize', this._boundOnResize);
        this.canvas?.removeEventListener('click', this._boundOnClick);
        this.canvas?.removeEventListener('mousemove', this._boundOnMouseMove);
        this.canvas?.removeEventListener('touchstart', this._boundOnTouchStart);
        this.canvas?.removeEventListener('touchend', this._boundOnTouchEnd);
        this.canvas?.removeEventListener('webglcontextlost', this._boundContextLost);
        this.canvas?.removeEventListener('webglcontextrestored', this._boundContextRestored);

        // Dispose geometries and materials
        this.scene.traverse(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => m.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        });

        this.renderer.dispose();
        this.clearHotspots();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Engine3DService };
} else {
    window.Engine3DService = Engine3DService;
}
