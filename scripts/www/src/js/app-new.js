/**
 * EV 3D Inspection System - Refactored Application
 * Modular architecture with clear separation of concerns
 */

class InspectionApp {
    constructor() {
        // Core dependencies
        this.store = window.store;
        this.eventBus = window.eventBus;
        
        // Services
        this.dataService = null;
        this.engine3D = null;
        this.uiController = null;
        this.reportExporter = null;
        
        // State
        this.isInitialized = false;
        this.lazyLibs = {};
        
        this.init();
    }

    async init() {
        try {
            // Phase 1: Core initialization (fast)
            this.updateLoadingProgress('初始化系统...', 10);
            await this.initializeCore();
            
            // Phase 2: 3D Engine
            this.updateLoadingProgress('初始化3D引擎...', 30);
            await this.initialize3DEngine();
            
            // Phase 3: UI
            this.updateLoadingProgress('配置用户界面...', 50);
            this.initializeUI();
            
            // Phase 4: Load model
            this.updateLoadingProgress('加载3D模型...', 70);
            await this.loadModel();
            
            // Phase 5: Final setup
            this.updateLoadingProgress('完成加载', 100);
            this.finalizeInitialization();
            
        } catch (error) {
            console.error('Initialization failed:', error);
            this.handleInitError(error);
        }
    }

    async initializeCore() {
        // Initialize services
        this.dataService = new DataService(this.eventBus, this.store);
        
        // Register service worker
        this.registerServiceWorker();
        
        // Subscribe to store changes
        this.store.subscribe((state, prevState, action) => {
            this.onStateChange(state, prevState, action);
        });
    }

    async initialize3DEngine() {
        try {
            this.engine3D = new Engine3DService('main-canvas', this.eventBus);
            
            // Create hotspots for all points
            const points = this.dataService.getAllPoints();
            Object.entries(points).forEach(([key, point]) => {
                const position = this.getHotspotPosition(key);
                if (position) {
                    this.engine3D.createHotspot(key, {
                        ...position,
                        name: point.name,
                        category: point.category
                    });
                }
            });
            
        } catch (error) {
            console.error('3D Engine init failed:', error);
            throw error;
        }
    }

    initializeUI() {
        // Initialize UI Controller
        this.uiController = new UIController({
            store: this.store,
            eventBus: this.eventBus,
            dataService: this.dataService,
            engine3D: this.engine3D
        });
        
        // Subscribe to events
        this.subscribeToEvents();
    }

    async loadModel() {
        const glbPath = 'models/qin2019.glb';
        const startTime = performance.now();
        
        return new Promise((resolve, reject) => {
            // Check if GLTFLoader is available
            if (!THREE.GLTFLoader) {
                console.warn('GLTFLoader not available, using fallback model');
                this.loadFallbackModel();
                resolve();
                return;
            }
            
            const loader = new THREE.GLTFLoader();
            loader.load(
                glbPath,
                (gltf) => {
                    this.engine3D.loadCarModel(gltf.scene);
                    
                    const loadTime = (performance.now() - startTime).toFixed(1);
                    console.log(`Model loaded in ${loadTime}ms`);
                    
                    this.dataService.updateVehicleInfo({ color: 'white' });
                    resolve();
                },
                (xhr) => {
                    if (xhr.lengthComputable) {
                        const percent = (xhr.loaded / xhr.total * 100).toFixed(0);
                        this.updateLoadingProgress(
                            `加载3D模型... ${percent}%`,
                            50 + (percent * 0.4)
                        );
                    }
                },
                (error) => {
                    console.warn('GLB load failed, using fallback:', error);
                    this.loadFallbackModel();
                    resolve();
                }
            );
        });
    }

    loadFallbackModel() {
        if (typeof BYDQinProModel !== 'undefined') {
            const model = new BYDQinProModel();
            const carGroup = model.generate();
            this.engine3D.loadCarModel(carGroup);
        }
    }

    finalizeInitialization() {
        // Update UI with initial data
        this.uiController.updateAll();
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loading-screen')?.classList.add('hidden');
            this.store.dispatch({ type: 'UI/SET_LOADING', payload: false });
        }, 300);
        
        this.isInitialized = true;
        this.eventBus.emit(Events.APP_INITIALIZED);
    }

    subscribeToEvents() {
        // Point events
        this.eventBus.on(Events.POINT_SELECTED, (pointId) => {
            this.store.dispatch({ type: 'UI/SELECT_POINT', payload: pointId });
        });

        // Flow events
        this.eventBus.on(Events.FLOW_STEP_CHANGED, () => {
            const state = this.store.getState();
            if (state.flow.isActive && state.flow.currentOrder > 0) {
                const points = this.dataService.getPointsByOrder();
                const currentPoint = points[state.flow.currentOrder - 1];
                if (currentPoint) {
                    this.eventBus.emit(Events.POINT_SELECTED, currentPoint.id);
                }
            }
        });

        // Issue events
        this.eventBus.on(Events.ISSUE_ADDED, () => {
            this.uiController.updateIssuesList();
            this.updateHotspotStatuses();
        });

        this.eventBus.on(Events.ISSUE_DELETED, () => {
            this.uiController.updateIssuesList();
            this.updateHotspotStatuses();
        });
    }

    onStateChange(state, prevState, action) {
        // Handle specific state changes
        switch (action.type) {
            case 'UI/SELECT_POINT':
                this.onPointSelected(state.ui.selectedPointId);
                break;
                
            case 'FLOW/NEXT':
            case 'FLOW/PREV':
            case 'FLOW/JUMP':
                this.eventBus.emit(Events.FLOW_STEP_CHANGED);
                break;
        }
    }

    onPointSelected(pointId) {
        if (!pointId) return;
        
        const point = this.dataService.getPoint(pointId);
        if (!point) return;

        // Update UI
        this.uiController.showPointDetails(point);
        
        // Focus camera
        const position = this.getHotspotPosition(pointId);
        if (position) {
            this.engine3D.focusOnPoint({ x: position.x, y: position.y, z: position.z });
        }
        
        // Highlight hotspot
        this.engine3D.selectPoint(pointId);
    }

    updateHotspotStatuses() {
        const points = this.dataService.getAllPoints();
        Object.values(points).forEach(point => {
            this.engine3D.updateHotspotStatus(point.id, point.status, point.judgment);
        });
    }

    updateLoadingProgress(text, progress) {
        this.store.dispatch({ type: 'UI/SET_LOADING_TEXT', payload: text });
        this.store.dispatch({ type: 'UI/SET_LOADING_PROGRESS', payload: progress });
        
        const loadingText = document.getElementById('loading-text');
        const progressFill = document.querySelector('.progress-fill');
        
        if (loadingText) loadingText.textContent = text;
        if (progressFill) progressFill.style.width = `${Math.min(progress, 100)}%`;
    }

    handleInitError(error) {
        const loadingText = document.getElementById('loading-text');
        if (loadingText) {
            loadingText.textContent = '加载失败，请刷新页面重试';
            loadingText.style.color = '#e74c3c';
        }
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .catch(err => console.log('SW registration failed:', err));
        }
    }

    // Lazy loading utilities
    async loadScript(url, id) {
        if (this.lazyLibs[id]) return;
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            script.onload = () => {
                this.lazyLibs[id] = true;
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Hotspot position mapping
    getHotspotPosition(key) {
        const positions = {
            // Paint points
            leftAPillar: { x: -0.9, y: 1.35, z: 1.4, name: '左A柱漆面' },
            rightAPillar: { x: 0.9, y: 1.35, z: 1.4, name: '右A柱漆面' },
            leftBPillar: { x: -1.25, y: 1.2, z: 0.1, name: '左B柱漆面' },
            rightBPillar: { x: 1.25, y: 1.2, z: 0.1, name: '右B柱漆面' },
            leftCPillar: { x: -1.05, y: 1.35, z: -1.5, name: '左C柱漆面' },
            rightCPillar: { x: 1.05, y: 1.35, z: -1.5, name: '右C柱漆面' },
            
            // Structure points
            vehicleSymmetry: { x: 0, y: 2.2, z: 0, name: '车辆对称性检测', category: 'structure' },
            frontFrameRails: { x: 0, y: 0.5, z: 2.0, name: '前左右纵梁', category: 'structure' },
            rightFrontSuspension: { x: 1.0, y: 0.8, z: 1.8, name: '右前悬挂减震器部位', category: 'structure' },
            rightAPillarWeld: { x: 1.1, y: 1.4, z: 1.3, name: '右A柱焊点胶条', category: 'structure' },
            rightBPillarWeld: { x: 1.4, y: 1.3, z: 0.1, name: '右B柱焊点胶条', category: 'structure' },
            rightCPillarWeld: { x: 1.2, y: 1.4, z: -1.4, name: '右C柱焊点胶条', category: 'structure' },
            rightRearSuspension: { x: 1.0, y: 0.8, z: -1.8, name: '右后悬挂减震器部位', category: 'structure' },
            leftRearSuspension: { x: -1.0, y: 0.8, z: -1.8, name: '左后悬挂减震器部位', category: 'structure' },
            leftCPillarWeld: { x: -1.2, y: 1.4, z: -1.4, name: '左C柱焊点胶条', category: 'structure' },
            leftBPillarWeld: { x: -1.4, y: 1.3, z: 0.1, name: '左B柱焊点胶条', category: 'structure' },
            leftAPillarWeld: { x: -1.1, y: 1.4, z: 1.3, name: '左A柱焊点胶条', category: 'structure' },
            leftFrontSuspension: { x: -1.0, y: 0.8, z: 1.8, name: '左前悬挂减震器部位', category: 'structure' }
        };
        
        return positions[key];
    }
}

// UI Controller class
class UIController {
    constructor({ store, eventBus, dataService, engine3D }) {
        this.store = store;
        this.eventBus = eventBus;
        this.dataService = dataService;
        this.engine3D = engine3D;
        
        this.bindElements();
        this.bindEvents();
    }

    bindElements() {
        this.elements = {
            loadingScreen: document.getElementById('loading-screen'),
            pointDetails: document.getElementById('point-details'),
            issuesList: document.getElementById('issues-list'),
            summaryPanel: document.getElementById('inspection-summary-panel'),
            
            // Stats
            overallScore: document.getElementById('overall-score'),
            gradeValue: document.getElementById('grade-value'),
            issueCount: document.getElementById('issue-count'),
            minorCount: document.getElementById('minor-count'),
            moderateCount: document.getElementById('moderate-count'),
            severeCount: document.getElementById('severe-count')
        };
    }

    bindEvents() {
        // Merchant mode toggle
        document.getElementById('role-switch')?.addEventListener('change', (e) => {
            this.store.setMerchantMode(e.target.checked);
        });

        // Inspection type buttons
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                this.store.dispatch({ type: 'UI/SET_INSPECTION_TYPE', payload: type });
            });
        });

        // View buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.engine3D.setCameraView(view);
            });
        });

        // Tool buttons
        document.getElementById('btn-add-issue')?.addEventListener('click', () => {
            this.store.openModal('add-issue-modal');
        });

        document.getElementById('btn-export-word')?.addEventListener('click', () => {
            this.exportReport('word');
        });

        document.getElementById('btn-export-pdf')?.addEventListener('click', () => {
            this.exportReport('pdf');
        });
    }

    updateAll() {
        this.updateSummary();
        this.updateIssuesList();
        this.updateHotspotStatuses();
    }

    updateSummary() {
        const summary = this.dataService.getReportSummary();
        
        if (this.elements.overallScore) {
            this.elements.overallScore.textContent = summary.score;
        }
        if (this.elements.gradeValue) {
            this.elements.gradeValue.textContent = summary.grade.grade;
        }
        if (this.elements.issueCount) {
            this.elements.issueCount.textContent = summary.totalIssues + '处';
        }
        if (this.elements.minorCount) {
            this.elements.minorCount.textContent = summary.severityCounts.minor;
        }
        if (this.elements.moderateCount) {
            this.elements.moderateCount.textContent = summary.severityCounts.moderate;
        }
        if (this.elements.severeCount) {
            this.elements.severeCount.textContent = summary.severityCounts.severe;
        }
    }

    updateIssuesList() {
        const container = this.elements.issuesList;
        if (!container) return;

        const issues = this.dataService.getAllIssues();
        const state = this.store.getState();
        
        // Apply filters
        let filteredIssues = issues;
        if (state.filter.severity) {
            filteredIssues = filteredIssues.filter(i => i.severity === state.filter.severity);
        }

        if (filteredIssues.length === 0) {
            container.innerHTML = '<p class="hint-text">暂无发现问题</p>';
            return;
        }

        container.innerHTML = filteredIssues.map(issue => `
            <div class="issue-card" data-point-id="${issue.pointId}" data-issue-id="${issue.id}">
                <div class="issue-card-header">
                    <div class="issue-icon ${issue.severity}">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <span class="issue-title">${issue.pointName} - ${DataService.getIssueTypeLabel(issue.type)}</span>
                    <span class="issue-severity ${issue.severity}">${DataService.getSeverityLabel(issue.severity)}</span>
                </div>
                <div class="issue-desc">${issue.description?.substring(0, 60) || ''}${(issue.description?.length || 0) > 60 ? '...' : ''}</div>
            </div>
        `).join('');
    }

    updateHotspotStatuses() {
        const points = this.dataService.getAllPoints();
        Object.values(points).forEach(point => {
            this.engine3D.updateHotspotStatus(point.id, point.status, point.judgment);
        });
    }

    showPointDetails(point) {
        const container = this.elements.pointDetails;
        if (!container) return;

        const statusText = DataService.getStatusLabel(point.status);
        const statusClass = point.status;

        let detailsHTML = '';
        
        if (point.category === 'structure') {
            const judgment = point.judgment || 'normal';
            const judgmentLabel = DataService.getJudgmentLabel(judgment);
            const judgmentClass = judgment === 'normal' ? 'good' : (judgment === 'abnormal' ? 'warning' : 'danger');
            
            detailsHTML = `
                <div class="point-info-row">
                    <span class="point-info-label">检测类型</span>
                    <span class="point-info-value">结构检测</span>
                </div>
                <div class="point-info-row">
                    <span class="point-info-label">判定结果</span>
                    <span class="point-info-status ${judgmentClass}">${judgmentLabel}</span>
                </div>
            `;
        } else {
            detailsHTML = `
                <div class="point-info-row">
                    <span class="point-info-label">漆面厚度</span>
                    <span class="point-info-value">${point.thickness?.min || 100}-${point.thickness?.max || 200} ${point.thickness?.unit || 'μm'}</span>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="point-info-card">
                <div class="point-info-header">
                    <span class="point-info-name">${point.name}</span>
                    <span class="point-info-status ${statusClass}">${statusText}</span>
                </div>
                <div class="point-info-details">
                    ${detailsHTML}
                    <div class="point-info-row">
                        <span class="point-info-label">发现问题</span>
                        <span class="point-info-value">${point.issues?.length || 0}处</span>
                    </div>
                </div>
            </div>
        `;
    }

    async exportReport(type) {
        // Lazy load export libraries
        if (type === 'pdf') {
            await this.ensurePDFLibLoaded();
        }

        const data = {
            vehicleInfo: this.dataService.getVehicleInfo(),
            pointsData: this.dataService.getAllPoints(),
            summary: this.dataService.getReportSummary()
        };

        // Implementation would use ReportExporter
        console.log(`Exporting ${type} report...`, data);
    }

    async ensurePDFLibLoaded() {
        if (!window.jspdf) {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new InspectionApp();
    });
} else {
    window.app = new InspectionApp();
}
