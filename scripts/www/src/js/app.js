/**
 * 3D Inspection System v2.0 - Main Application
 * BYD Qin Pro DM 2019 - 比亚迪秦Pro DM 2019款二手车检测系统
 * 
 * Architecture: Modular with clean separation of concerns
 * Fixes: Event cleanup, state synchronization, hotspot visibility
 */

(function() {
    'use strict';

    // Application instance
    let app = null;

    /**
     * Main Application Class
     */
    class InspectionApplication {
        constructor() {
            // State tracking
            this.initialized = false;
            this.destroyCallbacks = [];
            
            // Initialize modules
            this.store = new Store();
            this.eventBus = new EventBus();
            this.store.setEventBus(this.eventBus);
            
            this.dataService = new DataService(this.eventBus, this.store);
            this.reportService = new ReportService(this.eventBus);
            this.modelLoader = null;
            
            // 3D engine will be created after DOM ready
            this.engine3D = null;
            this.uiController = null;
            
            // Bind methods
            this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
            this.handleResize = this.handleResize.bind(this);
            this.handleError = this.handleError.bind(this);
        }

        async init() {
            try {
                console.log('🚗 初始化检测系统...');
                
                // Error handling
                window.onerror = this.handleError;
                window.onunhandledrejection = (e) => this.handleError(e.reason);

                // Wait for DOM
                if (document.readyState === 'loading') {
                    await new Promise(resolve => {
                        document.addEventListener('DOMContentLoaded', resolve, { once: true });
                    });
                }

                // Initialize 3D engine with error handling
                try {
                    this.engine3D = new Engine3DService('main-canvas', this.eventBus, this.store);
                    
                    // Create hotspots
                    const points = this.dataService.getAllPoints();
                    this.engine3D.createHotspots(points);
                    
                    // Load model (external or procedural)
                    this.store.setLoading(true, '正在加载车辆模型...', 50);
                    this.modelLoader = new ModelLoader(this.eventBus, this.engine3D);
                    await this.modelLoader.init();
                    
                } catch (e) {
                    console.error('3D引擎初始化失败:', e);
                    this.showWebGLError();
                    // Continue without 3D - UI will still work
                    this.engine3D = null;
                }

                // Initialize UI (even if 3D fails)
                // Initialize image service
                this.imageService = new ImageService();
                
                this.uiController = new UIController({
                    store: this.store,
                    eventBus: this.eventBus,
                    dataService: this.dataService,
                    engine3D: this.engine3D,
                    reportService: this.reportService,
                    imageService: this.imageService
                });

                // Initialize hotspot debugger
                this.debugHotspot = new HotspotDebugger(this);
                console.log('🛠️ 热点调试工具已加载，输入 app.debugHotspot.help() 查看用法');

                // Subscribe to store for debug logging
                this.store.subscribe((state, prevState, action) => {
                    console.log('📝 State action:', action?.type);
                    
                    // Global update trigger for hotspots on status change
                    if (action?.type === 'DATA/UPDATE_POINT') {
                        this.updateHotspotVisibility();
                    }
                });

                // Event subscriptions
                this.setupEventSubscriptions();
                
                // PakePlus detection
                if (this.isPakePlus()) {
                    console.log('📦 运行在 PakePlus 桌面环境中');
                    document.body.classList.add('pakeplus');
                }

                // Window events
                window.addEventListener('resize', this.handleResize);
                document.addEventListener('visibilitychange', this.handleVisibilityChange);

                // Track cleanup
                this.destroyCallbacks.push(() => {
                    window.removeEventListener('resize', this.handleResize);
                    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
                });

                // Show full vehicle view and all hotspots
                if (this.engine3D) {
                    console.log('🚗 显示全车视角和所有检测点');
                    this.engine3D.showFullVehicleView();
                    this.engine3D.showAllHotspots();
                }

                // Hide loading after delay
                setTimeout(() => {
                    this.store.setLoading(false);
                }, 1000);

                this.initialized = true;
                console.log('✅ 检测系统初始化完成');
                
                return true;

            } catch (error) {
                console.error('❌ 初始化失败:', error);
                this.handleError(error);
                return false;
            }
        }

        setupEventSubscriptions() {
            // 3D interaction events
            this.eventBus.on(Events.POINT_SELECTED, (pointId) => {
                this.store.selectPoint(pointId);
            });

            this.eventBus.on(Events.CAMERA_CHANGED, (data) => {
                this.store.setCameraView(data);
            });

            // Data events
            this.eventBus.on(Events.ISSUE_ADDED, () => {
                this.updateHotspotVisibility();
            });

            this.eventBus.on(Events.ISSUE_DELETED, () => {
                this.updateHotspotVisibility();
            });

            this.eventBus.on(Events.POINT_STATUS_CHANGED, () => {
                this.updateHotspotVisibility();
            });

            // Flow events
            this.eventBus.on(Events.FLOW_STARTED, () => {
                console.log('🔍 开始检测流程');
                this.focusCurrentPoint();
            });

            this.eventBus.on(Events.FLOW_STEP_CHANGED, () => {
                this.focusCurrentPoint();
            });
        }

        /**
         * Update hotspot visibility based on point status
         * Hotspots only show for points with issues (not 'good' status)
         */
        updateHotspotVisibility() {
            console.log('🔄 updateHotspotVisibility called, engine3D:', !!this.engine3D);
            
            if (!this.engine3D) {
                console.warn('⚠️ updateHotspotVisibility: engine3D is null');
                return;
            }
            
            const points = this.dataService.getAllPoints();
            console.log('📊 Total points:', Object.keys(points).length);
            
            Object.values(points).forEach(point => {
                console.log('🎯 Updating point:', point.id, 'status:', point.status);
                
                // Always show all hotspots
                this.engine3D?.setHotspotVisibility(point.id, true);
                
                // Update appearance based on status
                try {
                    this.engine3D?.updateHotspot(point.id, point.status, point.judgment);
                } catch (error) {
                    console.error('❌ Error updating hotspot for point:', point.id, error);
                }
            });
            
            console.log('✅ updateHotspotVisibility completed');
        }

        focusCurrentPoint() {
            const state = this.store.state.flow;
            if (!state.isActive || state.currentStep === 0) return;

            const points = this.dataService.getPointsByOrder();
            const currentPoint = points[state.currentStep - 1];
            
            if (currentPoint) {
                this.store.selectPoint(currentPoint.id);
                this.store.dispatch({ type: 'UI/SET_INSPECTION_TYPE', payload: currentPoint.category });
            }
        }

        /**
         * Inspection Flow Controls
         */
        startFlow() {
            this.store.dispatch({ type: 'FLOW/START' });
            this.updateHotspotVisibility();
        }

        nextStep() {
            this.store.dispatch({ type: 'FLOW/NEXT' });
        }

        prevStep() {
            this.store.dispatch({ type: 'FLOW/PREV' });
        }

        completePoint() {
            const pointId = this.store.state.ui.selectedPointId;
            if (pointId) {
                const point = this.dataService.getPoint(pointId);
                
                // Mark as normal if no issues
                if (!point.issues?.length) {
                    this.dataService.markPointNormal(pointId);
                }
                
                this.nextStep();
            }
        }

        /**
         * Event Handlers
         */
        handleVisibilityChange() {
            if (this.engine3D) {
                this.engine3D.setActive(!document.hidden);
            }
        }

        handleResize() {
            if (this.engine3D) {
                this.engine3D.handleResize();
            }
        }

        handleError(error) {
            console.error('Application error:', error);
            // Could show error modal here
        }

        showWebGLError() {
            const loadingText = document.getElementById('loading-text');
            if (loadingText) {
                loadingText.innerHTML = `
                    <div style="color: #e74c3c; margin-bottom: 10px;">
                        <i class="fas fa-exclamation-triangle"></i> 
                        3D渲染初始化失败
                    </div>
                    <div style="font-size: 14px; color: #888;">
                        请尝试以下方法：<br>
                        1. 使用Chrome/Edge浏览器<br>
                        2. 启用硬件加速<br>
                        3. 更新显卡驱动<br>
                        <br>
                        系统将以2D模式继续运行
                    </div>
                `;
            }
            
            // Hide progress bar
            const progressBar = document.querySelector('.loading-progress');
            if (progressBar) {
                progressBar.style.display = 'none';
            }
            
            // Show a fallback message in canvas container
            const container = document.getElementById('canvas-container');
            if (container) {
                container.innerHTML = `
                    <div style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100%;
                        background: #1a1a2e;
                        color: #888;
                        text-align: center;
                        padding: 20px;
                    ">
                        <div>
                            <i class="fas fa-cube" style="font-size: 48px; margin-bottom: 16px; color: #444;"></i>
                            <p>3D渲染不可用</p>
                            <p style="font-size: 12px; margin-top: 8px;">
                                请使用支持WebGL的浏览器<br>
                                检测功能仍可正常使用
                            </p>
                        </div>
                    </div>
                `;
            }
            
            // Allow continuing after a delay
            setTimeout(() => {
                this.store.setLoading(false);
            }, 3000);
        }

        /**
         * Detect PakePlus desktop environment
         */
        isPakePlus() {
            return navigator.userAgent.includes('PakePlus') || 
                   window.__TAURI__ !== undefined ||
                   window.pakeplus !== undefined;
        }

        /**
         * Debug: Adjust hotspot position
         * Usage: app.adjustHotspot('rightAPillar', 0, -0.1, 0)
         */
        adjustHotspot(pointId, dx, dy, dz) {
            if (!Constants.HOTSPOT_POSITIONS[pointId]) {
                console.error('Unknown point:', pointId);
                return;
            }
            
            const pos = Constants.HOTSPOT_POSITIONS[pointId];
            pos.x += dx;
            pos.y += dy;
            pos.z += dz;
            
            console.log(`Updated ${pointId}:`, pos);
            
            // Recreate hotspots
            if (this.engine3D) {
                this.engine3D.clearHotspots();
                const points = this.dataService.getAllPoints();
                this.engine3D.createHotspots(points);
            }
        }

        /**
         * Debug: Get current model bounds
         */
        getModelBounds() {
            if (!this.engine3D || !this.engine3D.carGroup) {
                console.error('No model loaded');
                return null;
            }
            
            const box = new THREE.Box3().setFromObject(this.engine3D.carGroup);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            
            console.log('Model bounds:');
            console.log('  Size:', size.x.toFixed(3), size.y.toFixed(3), size.z.toFixed(3));
            console.log('  Center:', center.x.toFixed(3), center.y.toFixed(3), center.z.toFixed(3));
            console.log('  Min:', box.min.x.toFixed(3), box.min.y.toFixed(3), box.min.z.toFixed(3));
            console.log('  Max:', box.max.x.toFixed(3), box.max.y.toFixed(3), box.max.z.toFixed(3));
            
            return { box, size, center };
        }

        /**
         * Cleanup
         */
        destroy() {
            this.destroyCallbacks.forEach(cb => cb());
            this.destroyCallbacks = [];
            
            this.uiController?.destroy();
            this.engine3D?.destroy();
            
            this.initialized = false;
        }
    }

    // Initialize when DOM is ready
    function initApp() {
        app = new InspectionApplication();
        app.init().then(success => {
            if (success) {
                window.app = app; // Expose for debugging
            }
        });
    }

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp, { once: true });
    } else {
        initApp();
    }

    // Expose for tests
    window.InspectionApplication = InspectionApplication;

})();
