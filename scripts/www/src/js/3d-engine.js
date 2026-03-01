/**
 * 3D Engine for EV Inspection System
 * Three.js based 3D visualization engine
 */

class Inspection3DEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.carGroup = null;
        this.carParts = {};
        this.hotspots = [];
        this.hotspotMeshes = [];
        
        this.selectedPoint = null;
        this.hoveredPoint = null;
        
        this.animationId = null;
        this.autoRotate = false;
        this.showHotspots = true;
        
        this.onPointClick = null;
        this.onPointHover = null;
        
        // Initialize touch state to prevent undefined errors
        this.touchState = {
            startX: 0,
            startY: 0,
            startTime: 0,
            isMoving: false,
            isOnHotspot: false,
            lastTouchX: 0,
            lastTouchY: 0
        };
        
        // Hotspot positions (normalized relative to car center)
        // 只保留ABC柱漆面检测点 + 所有结构检测点
        this.defaultHotspotPositions = {
            // ===== 漆面检测点（只保留ABC柱）=====
            leftAPillar: { x: -0.9, y: 1.35, z: 1.4, name: '左A柱漆面' },
            rightAPillar: { x: 0.9, y: 1.35, z: 1.4, name: '右A柱漆面' },
            leftBPillar: { x: -1.25, y: 1.2, z: 0.1, name: '左B柱漆面' },
            rightBPillar: { x: 1.25, y: 1.2, z: 0.1, name: '右B柱漆面' },
            leftCPillar: { x: -1.05, y: 1.35, z: -1.5, name: '左C柱漆面' },
            rightCPillar: { x: 1.05, y: 1.35, z: -1.5, name: '右C柱漆面' },
            
            // ===== 结构检测点 =====
            // 对称性与框架
            vehicleSymmetry: { x: 0, y: 2.2, z: 0, name: '车辆对称性检测', category: 'structure' },
            frontFrameRails: { x: 0, y: 0.5, z: 2.0, name: '前左右纵梁', category: 'structure' },
            
            // 右侧结构（顺时针检测）
            rightFrontSuspension: { x: 1.0, y: 0.8, z: 1.8, name: '右前悬挂减震器部位', category: 'structure' },
            rightAPillarWeld: { x: 1.1, y: 1.4, z: 1.3, name: '右A柱焊点胶条', category: 'structure' },
            rightBPillarWeld: { x: 1.4, y: 1.3, z: 0.1, name: '右B柱焊点胶条', category: 'structure' },
            rightCPillarWeld: { x: 1.2, y: 1.4, z: -1.4, name: '右C柱焊点胶条', category: 'structure' },
            rightRearSuspension: { x: 1.0, y: 0.8, z: -1.8, name: '右后悬挂减震器部位', category: 'structure' },
            
            // 左侧结构
            leftRearSuspension: { x: -1.0, y: 0.8, z: -1.8, name: '左后悬挂减震器部位', category: 'structure' },
            leftCPillarWeld: { x: -1.2, y: 1.4, z: -1.4, name: '左C柱焊点胶条', category: 'structure' },
            leftBPillarWeld: { x: -1.4, y: 1.3, z: 0.1, name: '左B柱焊点胶条', category: 'structure' },
            leftAPillarWeld: { x: -1.1, y: 1.4, z: 1.3, name: '左A柱焊点胶条', category: 'structure' },
            leftFrontSuspension: { x: -1.0, y: 0.8, z: 1.8, name: '左前悬挂减震器部位', category: 'structure' }
        };
        
        this.init();
    }
    
    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0e17);
        this.scene.fog = new THREE.Fog(0x0a0e17, 10, 50);
        
        // Camera setup
        const aspect = this.canvas.parentElement.clientWidth / this.canvas.parentElement.clientHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        this.camera.position.set(6, 4, 6);
        
        // Renderer setup with tablet optimizations
        // Limit pixel ratio on tablets to prevent memory issues and WebGL context loss
        const isTablet = /iPad|Android/.test(navigator.userAgent) || 
                        (window.innerWidth >= 768 && 'ontouchstart' in window);
        const pixelRatio = isTablet ? 
            Math.min(window.devicePixelRatio, 1.5) : // Lower limit for tablets
            Math.min(window.devicePixelRatio, 2);     // Standard limit for desktop
        
        try {
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
                antialias: !isTablet, // Disable antialias on tablets for better performance
                alpha: true,
                powerPreference: 'high-performance',
                failIfMajorPerformanceCaveat: false // Allow running on devices with software rendering
            });
            this.renderer.setSize(this.canvas.parentElement.clientWidth, this.canvas.parentElement.clientHeight);
            this.renderer.setPixelRatio(pixelRatio);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            
            // Handle WebGL context loss
            this.canvas.addEventListener('webglcontextlost', (e) => this.onContextLost(e), false);
            this.canvas.addEventListener('webglcontextrestored', (e) => this.onContextRestored(e), false);
            
        } catch (e) {
            console.error('Failed to create WebGL renderer:', e);
            throw new Error('WebGL not supported or disabled');
        }
        
        // Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 20;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.05;
        
        // iPad/Tablet touch optimizations
        this.setupTouchOptimizations();
        
        // Lighting
        this.setupLighting();
        
        // Environment
        this.setupEnvironment();
        
        // Event listeners
        window.addEventListener('resize', () => this.onWindowResize());
        this.canvas.addEventListener('click', (e) => this.onClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        
        // Touch events for mobile/tablet
        this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });
        
        // Start render loop
        this.animate();
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        // Main directional light
        const mainLight = new THREE.DirectionalLight(0xffffff, 1);
        mainLight.position.set(5, 10, 5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        this.scene.add(mainLight);
        
        // Fill light
        const fillLight = new THREE.DirectionalLight(0x3498db, 0.3);
        fillLight.position.set(-5, 5, -5);
        this.scene.add(fillLight);
        
        // Rim light
        const rimLight = new THREE.SpotLight(0xffffff, 0.5);
        rimLight.position.set(0, 5, -8);
        rimLight.lookAt(0, 0, 0);
        this.scene.add(rimLight);
        
        // Bottom light for better visibility
        const bottomLight = new THREE.DirectionalLight(0x444444, 0.3);
        bottomLight.position.set(0, -5, 0);
        this.scene.add(bottomLight);
    }
    
    setupEnvironment() {
        // Grid helper
        const gridHelper = new THREE.GridHelper(30, 30, 0x2a3449, 0x1a2332);
        gridHelper.position.y = -0.01;
        this.scene.add(gridHelper);
        
        // Ground plane
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x0a0e17,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.02;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Shadow catcher
        const shadowGeometry = new THREE.PlaneGeometry(12, 20);
        const shadowMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
        const shadowPlane = new THREE.Mesh(shadowGeometry, shadowMaterial);
        shadowPlane.rotation.x = -Math.PI / 2;
        shadowPlane.position.y = -0.015;
        shadowPlane.receiveShadow = true;
        this.scene.add(shadowPlane);
    }
    
    loadCarModel(carGroup) {
        // Remove existing car if any
        if (this.carGroup) {
            this.scene.remove(this.carGroup);
        }
        
        this.carGroup = carGroup;
        this.scene.add(this.carGroup);
        
        // Normalize model size and position
        this.normalizeModel();
        
        // Create hotspots
        this.createHotspots();
        
        // Set initial camera view
        this.setCameraView('iso');
    }
    
    normalizeModel() {
        if (!this.carGroup) return;
        
        // Compute bounding box
        const box = new THREE.Box3().setFromObject(this.carGroup);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = box.getCenter(new THREE.Vector3());
        
        console.log('Model size:', size);
        console.log('Model center:', center);
        
        // Calculate scale to normalize to typical car size (~4.7m length for BYD Qin Pro)
        const targetLength = 4.7;
        const maxDimension = Math.max(size.x, size.y, size.z);
        const scale = targetLength / maxDimension;
        
        // Apply scale
        this.carGroup.scale.setScalar(scale);
        
        // Recompute bounding box after scaling
        const scaledBox = new THREE.Box3().setFromObject(this.carGroup);
        const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
        
        // Center the model
        this.carGroup.position.x = -scaledCenter.x;
        this.carGroup.position.z = -scaledCenter.z;
        
        // Lift model so bottom touches ground
        const minY = scaledBox.min.y;
        this.carGroup.position.y = -minY;
        
        // Store normalized scale
        this.carGroup.userData.normalizedScale = scale;
        this.carGroup.userData.boundingSize = size.clone().multiplyScalar(scale);
        
        console.log('Normalized model, scale:', scale);
    }
    
    createHotspots() {
        // Clear existing hotspots
        this.clearHotspots();
        
        if (!this.carGroup) return;
        
        const positions = this.defaultHotspotPositions;
        
        Object.entries(positions).forEach(([key, data]) => {
            this.createHotspotMarker(key, data);
        });
    }
    
    createHotspotMarker(key, data) {
        // Create a group for the hotspot
        const hotspotGroup = new THREE.Group();
        hotspotGroup.name = `hotspot_${key}`;
        hotspotGroup.userData = {
            type: 'hotspot',
            pointKey: key,
            pointName: data.name,
            category: data.category || 'paint'
        };
        
        // Position
        hotspotGroup.position.set(data.x, data.y, data.z);
        
        // Default: hide hotspot, only show when has issues (status != 'good')
        hotspotGroup.visible = false;
        
        // Check if tablet for larger hotspot size
        const isTablet = /iPad|Android/.test(navigator.userAgent) || 
                        (window.innerWidth >= 768 && 'ontouchstart' in window);
        const scale = isTablet ? 2.0 : 1.0; // 100% larger on tablets for easier touch
        
        // Determine color based on category
        const isStructure = data.category === 'structure';
        const mainColor = isStructure ? 0xe67e22 : 0x3498db; // Orange for structure, Blue for paint
        
        // Outer ring (pulse effect) - larger and more visible on iPad
        const ringGeometry = new THREE.RingGeometry(0.15 * scale, 0.2 * scale, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: mainColor,
            transparent: true,
            opacity: isTablet ? 0.8 : 0.6,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = -Math.PI / 2;
        ring.name = 'ring';
        hotspotGroup.add(ring);
        
        // Inner dot - larger on iPad
        const dotGeometry = new THREE.SphereGeometry(0.1 * scale, 16, 16);
        const dotMaterial = new THREE.MeshBasicMaterial({
            color: mainColor
        });
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        dot.name = 'dot';
        hotspotGroup.add(dot);
        
        // Touch feedback ring (for iPad touch feedback)
        if (isTablet) {
            const touchFeedbackGeometry = new THREE.RingGeometry(0.25 * scale, 0.28 * scale, 32);
            const touchFeedbackMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.0,
                side: THREE.DoubleSide
            });
            const touchFeedback = new THREE.Mesh(touchFeedbackGeometry, touchFeedbackMaterial);
            touchFeedback.rotation.x = -Math.PI / 2;
            touchFeedback.name = 'touchFeedback';
            hotspotGroup.add(touchFeedback);
        }
        
        // Invisible larger hit area for easier clicking on tablets
        const hitAreaGeometry = new THREE.SphereGeometry(0.4 * scale, 16, 16);
        const hitAreaMaterial = new THREE.MeshBasicMaterial({
            color: 0x3498db,
            transparent: true,
            opacity: 0.0, // Completely invisible
            side: THREE.DoubleSide
        });
        const hitArea = new THREE.Mesh(hitAreaGeometry, hitAreaMaterial);
        hitArea.name = 'hitArea';
        hitArea.userData = { isHitArea: true };
        hotspotGroup.add(hitArea);
        
        // Vertical line connecting to car
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, -0.3 * scale, 0)
        ]);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x3498db,
            transparent: true,
            opacity: 0.5
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        hotspotGroup.add(line);
        
        // Add to scene (not to carGroup so it doesn't scale with model)
        this.scene.add(hotspotGroup);
        this.hotspotMeshes.push(hotspotGroup);
        
        // Animate pulse
        this.animateHotspotPulse(ring);
    }
    
    animateHotspotPulse(ringMesh) {
        const pulse = () => {
            if (!ringMesh.parent) return;
            
            const time = Date.now() * 0.002;
            const scale = 1 + Math.sin(time) * 0.2;
            ringMesh.scale.setScalar(scale);
            ringMesh.material.opacity = 0.4 + Math.sin(time) * 0.2;
            
            requestAnimationFrame(pulse);
        };
        pulse();
    }
    
    clearHotspots() {
        this.hotspotMeshes.forEach(hotspot => {
            this.scene.remove(hotspot);
            // Dispose geometries and materials
            hotspot.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        });
        this.hotspotMeshes = [];
    }
    
    updateHotspotVisibility(visiblePoints) {
        this.hotspotMeshes.forEach(hotspot => {
            const pointKey = hotspot.userData.pointKey;
            const visible = visiblePoints.includes(pointKey);
            hotspot.visible = visible && this.showHotspots;
        });
    }
    
    updateHotspotStatus(pointKey, status, judgment) {
        const hotspot = this.hotspotMeshes.find(h => h.userData.pointKey === pointKey);
        if (!hotspot) return;
        
        // Save status to userData for color restoration
        hotspot.userData.status = status;
        hotspot.userData.judgment = judgment;
        
        const ring = hotspot.getObjectByName('ring');
        const dot = hotspot.getObjectByName('dot');
        const line = hotspot.children.find(c => c.type === 'Line');
        
        // Determine base color by category
        const isStructure = hotspot.userData.category === 'structure';
        const baseColor = isStructure ? 0xe67e22 : 0x3498db; // Orange for structure, Blue for paint
        
        let color;
        switch (status) {
            case 'good':
                color = 0x2ecc71; // Green
                break;
            case 'warning':
                color = 0xf39c12; // Orange
                break;
            case 'danger':
                color = 0xe74c3c; // Red
                break;
            default:
                color = baseColor;
        }
        
        if (ring) {
            gsap.to(ring.material.color, {
                r: ((color >> 16) & 255) / 255,
                g: ((color >> 8) & 255) / 255,
                b: (color & 255) / 255,
                duration: 0.3
            });
        }
        if (dot) {
            gsap.to(dot.material.color, {
                r: ((color >> 16) & 255) / 255,
                g: ((color >> 8) & 255) / 255,
                b: (color & 255) / 255,
                duration: 0.3
            });
        }
        if (line) {
            gsap.to(line.material.color, {
                r: ((color >> 16) & 255) / 255,
                g: ((color >> 8) & 255) / 255,
                b: (color & 255) / 255,
                duration: 0.3
            });
        }
        
        // Show/hide hotspot based on status - only show if has issues (not 'good')
        const shouldShow = status !== 'good';
        if (hotspot.visible !== shouldShow) {
            hotspot.visible = shouldShow;
        }
    }
    
    highlightHotspot(pointKey, highlight) {
        const hotspot = this.hotspotMeshes.find(h => h.userData.pointKey === pointKey);
        if (!hotspot) return;
        
        const dot = hotspot.getObjectByName('dot');
        const ring = hotspot.getObjectByName('ring');
        const touchFeedback = hotspot.getObjectByName('touchFeedback');
        
        if (highlight) {
            // Enlarge dot
            if (dot) {
                gsap.to(dot.scale, {
                    x: 1.8, y: 1.8, z: 1.8,
                    duration: 0.3,
                    ease: 'back.out(1.7)'
                });
            }
            // Highlight ring
            if (ring) {
                gsap.to(ring.material, {
                    opacity: 1,
                    duration: 0.2
                });
                ring.material.color.setHex(0xffffff);
            }
            // Show touch feedback on iPad
            if (touchFeedback) {
                touchFeedback.material.opacity = 0.6;
                gsap.to(touchFeedback.scale, {
                    x: 1.5, y: 1.5, z: 1.5,
                    duration: 0.3,
                    ease: 'back.out(1.7)'
                });
                gsap.to(touchFeedback.material, {
                    opacity: 0,
                    duration: 0.5,
                    delay: 0.2
                });
            }
        } else {
            // Reset dot
            if (dot) {
                gsap.to(dot.scale, {
                    x: 1, y: 1, z: 1,
                    duration: 0.3
                });
            }
            // Reset ring
            if (ring) {
                const status = hotspot.userData.status || 'normal';
                const colors = {
                    good: 0x2ecc71,
                    warning: 0xf39c12,
                    danger: 0xe74c3c,
                    normal: 0x3498db
                };
                ring.material.color.setHex(colors[status] || 0x3498db);
                ring.material.opacity = 0.6;
            }
            // Reset touch feedback
            if (touchFeedback) {
                touchFeedback.material.opacity = 0;
                touchFeedback.scale.set(1, 1, 1);
            }
        }
    }
    
    onClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Check intersection with hotspots
        const hotspotIntersects = this.raycaster.intersectObjects(this.hotspotMeshes, true);
        
        if (hotspotIntersects.length > 0) {
            // Find the hotspot group
            let target = hotspotIntersects[0].object;
            while (target.parent && !target.userData.pointKey) {
                target = target.parent;
            }
            
            if (target.userData.pointKey) {
                this.selectPoint(target.userData.pointKey);
            }
        } else if (this.carGroup) {
            // Check intersection with car
            const carIntersects = this.raycaster.intersectObjects(this.carGroup.children, true);
            
            if (carIntersects.length > 0) {
                // Could implement car part selection here
            } else {
                this.selectPoint(null);
            }
        }
    }
    
    onMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Check intersection with hotspots
        const hotspotIntersects = this.raycaster.intersectObjects(this.hotspotMeshes, true);
        
        if (hotspotIntersects.length > 0) {
            this.canvas.style.cursor = 'pointer';
            
            let target = hotspotIntersects[0].object;
            while (target.parent && !target.userData.pointKey) {
                target = target.parent;
            }
            
            if (target.userData.pointKey && this.onPointHover) {
                this.onPointHover(target.userData.pointKey, target.userData.pointName);
            }
        } else {
            this.canvas.style.cursor = 'grab';
            if (this.onPointHover) {
                this.onPointHover(null, null);
            }
        }
    }
    
    selectPoint(pointKey) {
        if (this.selectedPoint === pointKey) {
            // On iPad, clicking the same point again can deselect
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            if (isTouchDevice && pointKey) {
                this.highlightHotspot(pointKey, false);
                this.selectedPoint = null;
                if (this.onPointClick) {
                    this.onPointClick(null);
                }
            }
            return;
        }
        
        // Reset previous selection
        if (this.selectedPoint) {
            this.highlightHotspot(this.selectedPoint, false);
        }
        
        this.selectedPoint = pointKey;
        
        if (pointKey) {
            this.highlightHotspot(pointKey, true);
            
            // Focus camera on point with shorter duration on iPad for snappier feel
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            const duration = isTouchDevice ? 0.6 : 1.0;
            
            const hotspot = this.hotspotMeshes.find(h => h.userData.pointKey === pointKey);
            if (hotspot) {
                this.focusOnPoint(hotspot.position, duration);
            }
            
            // Haptic feedback on supported devices
            if (isTouchDevice && navigator.vibrate) {
                navigator.vibrate(30);
            }
        }
        
        if (this.onPointClick) {
            this.onPointClick(pointKey);
        }
    }
    
    focusOnPoint(position, duration = 1.0) {
        // Calculate a position offset from the hotspot for better viewing
        const offset = new THREE.Vector3(3, 2, 3);
        const targetPosition = position.clone().add(offset);
        
        gsap.to(this.camera.position, {
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            duration: duration,
            ease: 'power2.inOut'
        });
        
        gsap.to(this.controls.target, {
            x: position.x,
            y: position.y,
            z: position.z,
            duration: 1,
            ease: 'power2.inOut',
            onUpdate: () => this.controls.update()
        });
    }
    
    setCameraView(view) {
        const positions = {
            front: { pos: [0, 1.5, 8], target: [0, 0.5, 0] },
            rear: { pos: [0, 1.5, -8], target: [0, 0.5, 0] },
            left: { pos: [-8, 1.5, 0], target: [0, 0.5, 0] },
            right: { pos: [8, 1.5, 0], target: [0, 0.5, 0] },
            top: { pos: [0, 10, 0], target: [0, 0, 0] },
            iso: { pos: [6, 4, 6], target: [0, 0.5, 0] }
        };
        
        const viewData = positions[view];
        if (!viewData) return;
        
        gsap.to(this.camera.position, {
            x: viewData.pos[0],
            y: viewData.pos[1],
            z: viewData.pos[2],
            duration: 1.2,
            ease: 'power2.inOut'
        });
        
        gsap.to(this.controls.target, {
            x: viewData.target[0],
            y: viewData.target[1],
            z: viewData.target[2],
            duration: 1.2,
            ease: 'power2.inOut',
            onUpdate: () => this.controls.update()
        });
    }
    
    toggleWireframe(enabled) {
        if (!this.carGroup) return;
        
        this.carGroup.traverse(child => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.wireframe = enabled);
                } else {
                    child.material.wireframe = enabled;
                }
            }
        });
    }
    
    toggleAutoRotate(enabled) {
        this.autoRotate = enabled;
        this.controls.autoRotate = enabled;
        this.controls.autoRotateSpeed = 1;
    }
    
    toggleHotspots(show) {
        this.showHotspots = show;
        this.hotspotMeshes.forEach(hotspot => {
            hotspot.visible = show;
        });
    }
    
    getHotspotScreenPosition(pointKey) {
        const hotspot = this.hotspotMeshes.find(h => h.userData.pointKey === pointKey);
        if (!hotspot) return null;
        
        const vector = hotspot.position.clone();
        vector.project(this.camera);
        
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (vector.x + 1) / 2 * rect.width,
            y: -(vector.y - 1) / 2 * rect.height
        };
    }
    
    onWindowResize() {
        const width = this.canvas.parentElement.clientWidth;
        const height = this.canvas.parentElement.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
    
    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.clearHotspots();
        
        if (this.carGroup) {
            this.scene.remove(this.carGroup);
        }
        
        this.renderer.dispose();
    }
    
    // Handle WebGL context loss (important for tablets)
    onContextLost(event) {
        console.warn('WebGL context lost');
        event.preventDefault();
        
        // Stop animation loop
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Show loading screen
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
            const loadingText = document.getElementById('loading-text');
            if (loadingText) {
                loadingText.textContent = '3D渲染恢复中...';
            }
        }
    }
    
    // Handle WebGL context restoration
    onContextRestored(event) {
        console.log('WebGL context restored');
        
        // Re-initialize renderer
        try {
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
                antialias: false,
                alpha: true
            });
            this.renderer.setSize(this.canvas.parentElement.clientWidth, this.canvas.parentElement.clientHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
            this.renderer.shadowMap.enabled = true;
            
            // Restart animation
            this.animate();
            
            // Hide loading screen
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                setTimeout(() => {
                    loadingScreen.classList.add('hidden');
                }, 500);
            }
        } catch (e) {
            console.error('Failed to restore WebGL context:', e);
        }
    }
    
    // Method to load external FBX model
    loadFBXModel(url, onLoad, onError) {
        const loader = new THREE.FBXLoader();
        
        loader.load(url, 
            (object) => {
                // Process the loaded model
                object.traverse(child => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                if (onLoad) onLoad(object);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('Error loading FBX:', error);
                if (onError) onError(error);
            }
        );
    }
    
    // Method to load GLTF/GLB model
    loadGLTFModel(url, onLoad, onProgress, onError) {
        const loader = new THREE.GLTFLoader();
        
        loader.load(url,
            (gltf) => {
                const object = gltf.scene;
                
                // Process the loaded model
                object.traverse(child => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                if (onLoad) onLoad(object);
            },
            (xhr) => {
                // Progress callback
                if (onProgress) {
                    onProgress(xhr);
                } else {
                    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                }
            },
            (error) => {
                console.error('Error loading GLTF:', error);
                if (onError) onError(error);
            }
        );
    }
    
    // Universal model loader - auto-detect format
    loadExternalModel(url, onLoad, onProgress, onError) {
        const extension = url.split('.').pop().toLowerCase();
        
        if (extension === 'fbx') {
            this.loadFBXModel(url, onLoad, onError);
        } else if (extension === 'gltf' || extension === 'glb') {
            this.loadGLTFModel(url, onLoad, onProgress, onError);
        } else {
            const error = new Error(`Unsupported file format: ${extension}`);
            console.error(error);
            if (onError) onError(error);
        }
    }
    
    // iPad/Tablet touch optimizations
    setupTouchOptimizations() {
        const isIPad = /iPad/.test(navigator.userAgent) || 
                       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const isAndroid = /Android/.test(navigator.userAgent);
        const isTablet = isIPad || isAndroid || (window.innerWidth >= 768 && window.innerWidth <= 1366 && 'ontouchstart' in window);
        
        if (isTablet) {
            // Optimize controls for touch
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.08;
            this.controls.rotateSpeed = 0.8;
            this.controls.zoomSpeed = 1.2;
            this.controls.panSpeed = 0.8;
            
            // Enable touch events
            this.controls.touches = {
                ONE: THREE.TOUCH.ROTATE,
                TWO: THREE.TOUCH.DOLLY_PAN
            };
            
            // Much larger hit area for touch - critical for Android tablets
            this.raycaster.params.Points.threshold = 25;
            this.raycaster.params.Line.threshold = 25;
            
            // Disable controls zoom/pan on single touch to allow hotspot clicking
            this.controls.enableZoom = true;
            this.controls.enablePan = false;
            
            // Store touch state
            this.touchState = {
                startX: 0,
                startY: 0,
                startTime: 0,
                isMoving: false,
                lastTouchX: 0,
                lastTouchY: 0
            };
            
            console.log('3D Engine: Touch optimizations applied for tablet (threshold: 25)');
        }
    }
    
    onTouchStart(event) {
        if (event.touches.length !== 1) return;
        
        const touch = event.touches[0];
        this.touchState.startX = touch.clientX;
        this.touchState.startY = touch.clientY;
        this.touchState.startTime = Date.now();
        this.touchState.isMoving = false;
        this.touchState.lastTouchX = touch.clientX;
        this.touchState.lastTouchY = touch.clientY;
        
        // Update mouse coordinates immediately for raycasting
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Check if touch started on a hotspot
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const hotspotIntersects = this.raycaster.intersectObjects(this.hotspotMeshes, true);
        this.touchState.isOnHotspot = hotspotIntersects.length > 0;
        
        if (this.touchState.isOnHotspot) {
            // Prevent default to avoid scrolling/zooming when touching hotspot
            event.preventDefault();
        }
    }
    
    onTouchEnd(event) {
        if (!this.touchState.startTime) return;
        
        const touchDuration = Date.now() - this.touchState.startTime;
        const touch = event.changedTouches[0];
        
        // Calculate movement distance
        const moveDistance = Math.sqrt(
            Math.pow(touch.clientX - this.touchState.startX, 2) +
            Math.pow(touch.clientY - this.touchState.startY, 2)
        );
        
        // More lenient tap detection for iPad: < 400ms and < 20px movement
        const isTap = touchDuration < 400 && moveDistance < 20;
        
        if (isTap) {
            // Update mouse coordinates to touch end position
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
            
            // Perform raycasting to find clicked hotspot
            this.raycaster.setFromCamera(this.mouse, this.camera);
            
            // Check intersection with hotspots - use larger threshold for tablets
            const hotspotIntersects = this.raycaster.intersectObjects(this.hotspotMeshes, true);
            
            if (hotspotIntersects.length > 0) {
                event.preventDefault();
                event.stopPropagation();
                
                // Find the hotspot group
                let target = hotspotIntersects[0].object;
                while (target.parent && !target.userData.pointKey) {
                    target = target.parent;
                }
                
                if (target.userData.pointKey) {
                    // Visual feedback - flash the hotspot
                    this.flashHotspot(target.userData.pointKey);
                    
                    // Add haptic feedback if available
                    if (navigator.vibrate) {
                        navigator.vibrate(50);
                    }
                    
                    // Delay selection slightly for visual feedback
                    setTimeout(() => {
                        this.selectPoint(target.userData.pointKey);
                    }, 100);
                }
            } else if (this.carGroup) {
                // Check intersection with car
                const carIntersects = this.raycaster.intersectObjects(this.carGroup.children, true);
                
                if (carIntersects.length === 0) {
                    this.selectPoint(null);
                }
            }
        }
        
        // Reset touch state
        this.touchState.startTime = 0;
    }
    
    // Flash hotspot for visual feedback on touch
    flashHotspot(pointKey) {
        const hotspot = this.hotspotMeshes.find(h => h.userData.pointKey === pointKey);
        if (!hotspot) return;
        
        const dot = hotspot.getObjectByName('dot');
        const ring = hotspot.getObjectByName('ring');
        
        // Flash effect
        if (dot) {
            const originalColor = dot.material.color.getHex();
            dot.material.color.setHex(0xffffff);
            dot.scale.setScalar(2.5);
            
            setTimeout(() => {
                dot.material.color.setHex(originalColor);
                dot.scale.setScalar(1);
            }, 200);
        }
        
        if (ring) {
            const originalOpacity = ring.material.opacity;
            ring.material.opacity = 1;
            
            setTimeout(() => {
                ring.material.opacity = originalOpacity;
            }, 200);
        }
    }
}
