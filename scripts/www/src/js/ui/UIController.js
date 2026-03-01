/**
 * UI Controller - User Interface Management
 * Performance Optimized Version
 * Features: Event delegation, DOM batch updates, memory management, lazy loading, virtual scrolling
 */

// ==================== 性能工具函数 ====================

/**
 * 防抖函数 - 延迟执行直到停止调用后wait毫秒
 */
function debounce(func, wait = 300, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(this, args);
    };
}

/**
 * 节流函数 - 限制执行频率
 */
function throttle(func, limit = 100) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 性能监控工具
 */
const PerfMonitor = {
    marks: new Map(),
    
    start(label) {
        this.marks.set(label, performance.now());
        console.time?.(label);
    },
    
    end(label) {
        const start = this.marks.get(label);
        if (start) {
            const duration = performance.now() - start;
            console.timeEnd?.(label);
            console.log(`[Perf] ${label}: ${duration.toFixed(2)}ms`);
            this.marks.delete(label);
            return duration;
        }
    },
    
    measureMemory() {
        if (performance.memory) {
            const mem = performance.memory;
            console.log(`[Memory] Used: ${(mem.usedJSHeapSize / 1048576).toFixed(2)}MB, ` +
                       `Total: ${(mem.totalJSHeapSize / 1048576).toFixed(2)}MB, ` +
                       `Limit: ${(mem.jsHeapSizeLimit / 1048576).toFixed(2)}MB`);
            return mem;
        }
        return null;
    }
};

// ==================== 图片懒加载管理器 ====================

class LazyImageLoader {
    constructor(options = {}) {
        this.selector = options.selector || 'img[data-src]';
        this.rootMargin = options.rootMargin || '50px';
        this.threshold = options.threshold || 0.01;
        this.placeholder = options.placeholder || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
        
        this.observer = null;
        this.imageCache = new Map();
        this.init();
    }
    
    init() {
        if (!('IntersectionObserver' in window)) {
            // 降级处理：直接加载所有图片
            this.loadAllImages();
            return;
        }
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: this.rootMargin,
            threshold: this.threshold
        });
        
        this.observe();
    }
    
    observe(container = document) {
        const images = container.querySelectorAll(this.selector);
        images.forEach(img => {
            // 设置占位符
            if (!img.src) {
                img.src = this.placeholder;
            }
            this.observer?.observe(img);
        });
    }
    
    loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;
        
        // 检查缓存
        if (this.imageCache.has(src)) {
            img.src = this.imageCache.get(src);
            img.classList.add('loaded');
            return;
        }
        
        // 加载图片
        const imageLoader = new Image();
        imageLoader.onload = () => {
            this.imageCache.set(src, src);
            img.src = src;
            img.classList.add('loaded');
            img.removeAttribute('data-src');
        };
        imageLoader.onerror = () => {
            img.classList.add('error');
            img.dispatchEvent(new CustomEvent('imageLoadError', { detail: { src } }));
        };
        imageLoader.src = src;
    }
    
    loadAllImages() {
        document.querySelectorAll(this.selector).forEach(img => this.loadImage(img));
    }
    
    destroy() {
        this.observer?.disconnect();
        this.imageCache.clear();
    }
}

// ==================== 虚拟滚动管理器 ====================

class VirtualScroller {
    constructor(container, options = {}) {
        this.container = container;
        this.itemHeight = options.itemHeight || 100;
        this.overscan = options.overscan || 5;
        this.renderItem = options.renderItem;
        this.items = options.items || [];
        
        this.visibleItems = new Map();
        this.scrollTop = 0;
        this.containerHeight = 0;
        
        this.init();
    }
    
    init() {
        // 创建滚动容器结构
        this.viewport = document.createElement('div');
        this.viewport.className = 'virtual-scroll-viewport';
        this.viewport.style.cssText = 'position:relative;overflow:auto;height:100%;';
        
        this.content = document.createElement('div');
        this.content.className = 'virtual-scroll-content';
        this.content.style.cssText = 'position:relative;';
        
        // 清空原容器并重新构建
        this.container.innerHTML = '';
        this.container.appendChild(this.viewport);
        this.viewport.appendChild(this.content);
        
        // 绑定滚动事件（节流）
        this.viewport.addEventListener('scroll', throttle(() => this.onScroll(), 16));
        
        // 监听容器大小变化
        if (window.ResizeObserver) {
            this.resizeObserver = new ResizeObserver(entries => {
                for (const entry of entries) {
                    this.containerHeight = entry.contentRect.height;
                    this.update();
                }
            });
            this.resizeObserver.observe(this.container);
        }
        
        this.update();
    }
    
    setItems(items) {
        this.items = items;
        this.update();
    }
    
    update() {
        const totalHeight = this.items.length * this.itemHeight;
        this.content.style.height = `${totalHeight}px`;
        this.renderVisibleItems();
    }
    
    onScroll() {
        this.scrollTop = this.viewport.scrollTop;
        this.renderVisibleItems();
    }
    
    renderVisibleItems() {
        const startIndex = Math.max(0, Math.floor(this.scrollTop / this.itemHeight) - this.overscan);
        const visibleCount = Math.ceil(this.containerHeight / this.itemHeight) + this.overscan * 2;
        const endIndex = Math.min(this.items.length, startIndex + visibleCount);
        
        // 确定需要渲染的项目
        const visibleSet = new Set();
        for (let i = startIndex; i < endIndex; i++) {
            visibleSet.add(i);
        }
        
        // 移除不在视图中的项目
        this.visibleItems.forEach((element, index) => {
            if (!visibleSet.has(index)) {
                element.remove();
                this.visibleItems.delete(index);
            }
        });
        
        // 添加新项目
        for (let i = startIndex; i < endIndex; i++) {
            if (!this.visibleItems.has(i) && this.items[i]) {
                const element = this.renderItem(this.items[i], i);
                element.style.position = 'absolute';
                element.style.top = `${i * this.itemHeight}px`;
                element.style.left = '0';
                element.style.right = '0';
                element.style.height = `${this.itemHeight}px`;
                this.content.appendChild(element);
                this.visibleItems.set(i, element);
            }
        }
    }
    
    destroy() {
        this.resizeObserver?.disconnect();
        this.visibleItems.clear();
    }
}

// ==================== Lightbox 懒加载模块 ====================

const LightboxModule = {
    loaded: false,
    
    async load() {
        if (this.loaded) return;
        PerfMonitor.start('LightboxModule.load');
        
        // 动态加载Lightbox所需资源
        this.loaded = true;
        
        PerfMonitor.end('LightboxModule.load');
    },
    
    createLightboxHTML(options) {
        const { imageUrl, title = '', description = '', currentIndex = 1, total = 1, hasNav = false } = options;
        
        return `
            <div class="lightbox-overlay" data-lightbox-close></div>
            <div class="lightbox-content">
                <button class="lightbox-close" data-lightbox-close>
                    <i class="fas fa-times"></i>
                </button>
                ${hasNav ? `
                    <button class="lightbox-nav prev" data-lightbox-prev ${currentIndex === 1 ? 'style="opacity:0.3;pointer-events:none"' : ''}>
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="lightbox-nav next" data-lightbox-next ${currentIndex === total ? 'style="opacity:0.3;pointer-events:none"' : ''}>
                        <i class="fas fa-chevron-right"></i>
                    </button>
                ` : ''}
                <div class="lightbox-image-container">
                    <img src="${imageUrl}" alt="${title}" loading="eager">
                </div>
                ${title || description ? `
                    <div class="lightbox-info">
                        ${title ? `<div class="lightbox-title">${title}</div>` : ''}
                        ${description ? `<div class="lightbox-desc">${description}</div>` : ''}
                        ${total > 1 ? `<div class="lightbox-meta"><span>${currentIndex} / ${total}</span></div>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }
};

// ==================== UI Controller 主类 ====================

class UIController {
    constructor({ store, eventBus, dataService, engine3D, reportService, imageService }) {
        this.store = store;
        this.eventBus = eventBus;
        this.dataService = dataService;
        this.engine3D = engine3D;
        this.reportService = reportService;
        this.imageService = imageService || new ImageService();
        
        // DOM缓存
        this.elements = {};
        this._domCache = new Map(); // 额外的DOM查询缓存
        
        // 事件管理
        this.unsubscribers = [];
        this._eventListeners = new Map(); // 跟踪绑定的事件监听器
        
        // 图片管理
        this.pendingImages = [];
        this.lazyImageLoader = null;
        
        // Lightbox状态
        this._lightboxKeyHandler = null;
        this._lightboxState = null;
        
        // 滚动相关
        this.issuesVirtualScroller = null;
        this._scrollHandler = null;
        
        // 批量更新队列
        this._updateQueue = new Map();
        this._rafId = null;
        
        // Intersection Observers
        this._observers = new Map();
        
        // 流程步骤跟踪（防止重复打开）
        this._currentFlowStep = null;
        
        PerfMonitor.start('UIController.init');
        this.init();
        PerfMonitor.end('UIController.init');
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.initImageUpload();
        this.initLazyImageLoader();
        this.subscribeToStore();
        this.subscribeToEvents();
        this.showCameraDebugInfo();
    }
    
    /**
     * 显示相机调试信息（开发环境）
     */
    showCameraDebugInfo() {
        const debugDiv = document.getElementById('camera-debug-info');
        if (!debugDiv) return;
        
        // 只在特定条件下显示（如URL参数包含 debug=1）
        const urlParams = new URLSearchParams(window.location.search);
        const isDebug = urlParams.get('debug') === '1' || this.isHuaweiDevice() || this.isPakePlus();
        
        if (!isDebug) return;
        
        const info = {
            'UserAgent': navigator.userAgent.substring(0, 50) + '...',
            'PakePlus': this.isPakePlus(),
            '华为设备': this.isHuaweiDevice(),
            '安卓': this.isAndroid(),
            'iOS': this.isIOS(),
            'getUserMedia': !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            'TAURI': window.__TAURI__ !== undefined
        };
        
        debugDiv.style.display = 'block';
        debugDiv.innerHTML = Object.entries(info)
            .map(([k, v]) => `<div><strong>${k}:</strong> ${v}</div>`)
            .join('');
        
        console.log('📷 相机调试信息:', info);
    }

    // ==================== DOM缓存优化 ====================
    
    cacheElements() {
        // 批量查询DOM元素，减少重排
        const elementsToCache = {
            // Loading
            loadingScreen: 'loading-screen',
            loadingText: 'loading-text',
            loadingProgress: '.progress-fill',
            
            // Sidebar
            roleSwitch: 'role-switch',
            
            // Flow
            flowStep: 'current-step',
            flowProgress: 'flow-progress-fill',
            flowPointName: '.flow-point-name',
            btnStartFlow: 'btn-start-flow',
            btnPrevPoint: 'btn-prev-point',
            btnNextPoint: 'btn-next-point',
            btnCompletePoint: 'btn-complete-point',
            flowJumpSelect: 'flow-jump-select',
            
            // Summary
            overallScore: 'overall-score',
            gradeValue: 'grade-value',
            issueCount: 'issue-count',
            normalCount: 'normal-count',
            minorCount: 'minor-count',
            moderateCount: 'moderate-count',
            severeCount: 'severe-count',
            
            // Lists
            issuesList: 'issues-list',
            pointDetails: 'point-details',
            
            // Filter badge
            filterBadge: 'issues-filter-badge',
            
            // Modals
            addIssueModal: 'add-issue-modal',
            
            // Image upload
            imageUploadInput: 'image-upload-input',
            imageDropZone: 'image-drop-zone',
            imagePreviewContainer: 'image-preview-container'
        };
        
        // 使用DocumentFragment批量查询（减少重排）
        const fragment = document.createDocumentFragment();
        
        Object.entries(elementsToCache).forEach(([key, selector]) => {
            const element = selector.startsWith('.') 
                ? document.querySelector(selector)
                : document.getElementById(selector);
            this.elements[key] = element;
            if (element) {
                fragment.appendChild(element.cloneNode(false));
            }
        });
        
        // 清理fragment
        fragment.textContent = '';
    }
    
    /**
     * 缓存DOM查询结果
     */
    query(selector, context = document, cacheKey = null) {
        const key = cacheKey || `${selector}_${context === document ? 'doc' : context.id || 'ctx'}`;
        
        if (this._domCache.has(key)) {
            const cached = this._domCache.get(key);
            // 验证元素是否仍在DOM中
            if (cached && document.contains(cached)) {
                return cached;
            }
            this._domCache.delete(key);
        }
        
        const result = typeof selector === 'string' 
            ? (selector.startsWith('.') || selector.includes('[') 
                ? context.querySelector(selector) 
                : context.getElementById?.(selector) || document.getElementById(selector))
            : selector;
            
        if (result) {
            this._domCache.set(key, result);
        }
        
        return result;
    }
    
    queryAll(selector, context = document, cacheKey = null) {
        const key = cacheKey || `all_${selector}_${context === document ? 'doc' : context.id || 'ctx'}`;
        
        if (this._domCache.has(key)) {
            return this._domCache.get(key);
        }
        
        const result = Array.from(context.querySelectorAll(selector));
        this._domCache.set(key, result);
        return result;
    }

    // ==================== 批量DOM更新 ====================
    
    /**
     * 使用requestAnimationFrame批量更新DOM
     */
    batchUpdate(key, updateFn) {
        this._updateQueue.set(key, updateFn);
        
        if (!this._rafId) {
            this._rafId = requestAnimationFrame(() => {
                this._rafId = null;
                this.flushUpdates();
            });
        }
    }
    
    flushUpdates() {
        PerfMonitor.start('UIController.flushUpdates');
        
        this._updateQueue.forEach((updateFn, key) => {
            try {
                updateFn();
            } catch (error) {
                console.error(`Batch update failed for ${key}:`, error);
            }
        });
        
        this._updateQueue.clear();
        PerfMonitor.end('UIController.flushUpdates');
    }

    // ==================== 事件优化 ====================
    
    bindEvents() {
        // 使用防抖处理高频事件
        const debouncedFilter = debounce((e) => this.handleFilterClick(e), 100);
        const debouncedScroll = debounce(() => this.handleScroll(), 150);
        
        // Role switch
        this.elements.roleSwitch?.addEventListener('change', (e) => {
            this.store.setMerchantMode(e.target.checked);
            this.updateMerchantMode(e.target.checked);
        });

        // Type buttons (delegation) - 优化的事件委托
        const typeContainer = document.querySelector('.inspection-types');
        if (typeContainer) {
            const typeHandler = (e) => {
                const btn = e.target.closest('.type-btn');
                if (!btn) return;
                
                const type = btn.dataset.type;
                const currentType = this.store.state.ui.inspectionType;
                
                // 如果点击的是当前激活的按钮，不做任何操作
                if (type === currentType) return;
                
                // 批量更新按钮状态
                this.batchUpdate('typeButtons', () => {
                    this.queryAll('.type-btn').forEach(b => {
                        b.classList.toggle('active', b.dataset.type === type);
                    });
                });
                
                this.store.dispatch({ type: 'UI/SET_INSPECTION_TYPE', payload: type });
                this.filterHotspotsByType(type);
            };
            typeContainer.addEventListener('click', typeHandler);
            this._trackListener(typeContainer, 'click', typeHandler);
        }

        // View buttons
        const viewContainer = document.querySelector('.view-buttons');
        if (viewContainer) {
            const viewHandler = (e) => {
                const btn = e.target.closest('.view-btn');
                if (!btn) return;
                
                this.batchUpdate('viewButtons', () => {
                    this.queryAll('.view-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                });
                
                const view = btn.dataset.view;
                if (view === 'full') {
                    this.engine3D?.showFullVehicleView();
                    this.engine3D?.showAllHotspots();
                } else {
                    this.engine3D?.setCameraView(view);
                }
            };
            viewContainer.addEventListener('click', viewHandler);
            this._trackListener(viewContainer, 'click', viewHandler);
        }

        // Severity filter (delegation)
        const summaryGrid = document.querySelector('.issues-summary-grid');
        if (summaryGrid) {
            const severityHandler = throttle((e) => {
                const item = e.target.closest('.issue-stat-item');
                if (!item) return;
                
                const severity = item.dataset.severity;
                const currentFilter = this.store.state.filter.severity;
                
                if (currentFilter === severity) {
                    this.store.dispatch({ type: 'FILTER/CLEAR' });
                } else {
                    this.store.dispatch({ type: 'FILTER/SET_SEVERITY', payload: severity });
                }
            }, 100);
            summaryGrid.addEventListener('click', severityHandler);
            this._trackListener(summaryGrid, 'click', severityHandler);
        }

        // Issues list (delegation)
        if (this.elements.issuesList) {
            const issueListHandler = (e) => {
                const card = e.target.closest('.issue-card');
                if (!card) return;
                
                // Skip if clicked on action buttons or thumbnail
                if (e.target.closest('.issue-actions') || e.target.closest('.issue-thumbnail')) return;
                
                const pointId = card.dataset.pointId;
                this.store.selectPoint(pointId);
            };
            this.elements.issuesList.addEventListener('click', issueListHandler);
            this._trackListener(this.elements.issuesList, 'click', issueListHandler);
        }

        // Tool buttons - 批量绑定
        const toolButtons = [
            { id: 'btn-add-issue', handler: () => this.openAddIssueModal() },
            { id: 'btn-export-word', handler: () => this.exportReport('word') },
            { id: 'btn-export-pdf', handler: () => this.exportReport('pdf') },
            { id: 'btn-save-data', handler: () => this.saveData() },
            { id: 'btn-load-data', handler: () => this.loadData() },
            { id: 'btn-reset-data', handler: () => this.resetData() }
        ];
        
        toolButtons.forEach(({ id, handler }) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', handler);
                this._trackListener(btn, 'click', handler);
            }
        });

        // Flow buttons
        this._bindFlowButtons();

        // Modal close - 优化的事件委托
        const modalCloseHandler = (e) => {
            const closeBtn = e.target.closest('.close-btn');
            if (!closeBtn) return;
            this.resetModalState();
            this.store.closeModal();
        };
        document.addEventListener('click', modalCloseHandler);
        this._trackListener(document, 'click', modalCloseHandler, true);

        // Add issue form（表单内回车仍会触发表单 submit）
        const addIssueForm = document.getElementById('add-issue-form');
        if (addIssueForm) {
            const submitHandler = (e) => {
                e.preventDefault();
                this.saveIssue(true);
            };
            addIssueForm.addEventListener('submit', submitHandler);
            this._trackListener(addIssueForm, 'submit', submitHandler);
        }

        // 保存并继续按钮在表单外，必须单独绑定点击
        const saveContinueBtn = document.getElementById('btn-save-continue');
        if (saveContinueBtn) {
            const saveContinueHandler = () => this.saveIssue(true);
            saveContinueBtn.addEventListener('click', saveContinueHandler);
            this._trackListener(saveContinueBtn, 'click', saveContinueHandler);
        }

        // Skip step button
        const skipBtn = document.getElementById('btn-skip-step');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.skipStep());
            this._trackListener(skipBtn, 'click', () => this.skipStep());
        }

        // Severity change - 使用事件委托
        const severityContainer = document.querySelector('.severity-options');
        if (severityContainer) {
            const severityChangeHandler = (e) => {
                if (e.target.name === 'severity') {
                    this.updateSeverityUI(e.target.value);
                }
            };
            severityContainer.addEventListener('change', severityChangeHandler);
            this._trackListener(severityContainer, 'change', severityChangeHandler);
        }

        // Filter badge click
        if (this.elements.filterBadge) {
            const filterHandler = () => this.store.dispatch({ type: 'FILTER/CLEAR' });
            this.elements.filterBadge.addEventListener('click', filterHandler);
            this._trackListener(this.elements.filterBadge, 'click', filterHandler);
        }

        // Keyboard shortcuts
        const keyHandler = (e) => {
            if (e.key === 'Escape') {
                this.resetModalState();
                this.store.closeModal();
            }
        };
        document.addEventListener('keydown', keyHandler);
        this._trackListener(document, 'keydown', keyHandler, true);
    }
    
    _bindFlowButtons() {
        const flowButtons = [
            { el: this.elements.btnStartFlow, action: 'FLOW/START' },
            { el: this.elements.btnPrevPoint, action: 'FLOW/PREV' },
            { el: this.elements.btnNextPoint, action: 'FLOW/NEXT' },
            { el: this.elements.btnCompletePoint, action: null, handler: () => this.completeFlowStep() }
        ];
        
        flowButtons.forEach(({ el, action, handler }) => {
            if (el) {
                const cb = handler || (() => this.store.dispatch({ type: action }));
                el.addEventListener('click', cb);
                this._trackListener(el, 'click', cb);
                console.log(`Flow button bound: ${el.id}`);
            } else {
                console.warn(`Flow button not found: ${action || 'complete'}`);
            }
        });
    }
    
    /**
     * 跟踪绑定的事件监听器，便于清理
     */
    _trackListener(element, event, handler, isDocument = false) {
        if (!this._eventListeners.has(element)) {
            this._eventListeners.set(element, []);
        }
        this._eventListeners.get(element).push({ event, handler, isDocument });
    }
    
    handleFilterClick(e) {
        // 防抖处理后的过滤器点击
        console.log('Filter click debounced');
    }
    
    handleScroll() {
        // 防抖处理后的滚动事件
        console.log('Scroll debounced');
    }

    // ==================== 图片上传优化 ====================
    
    initImageUpload() {
        const { imageUploadInput, imageDropZone, imagePreviewContainer } = this.elements;
        const btnSelectFiles = document.getElementById('btn-select-files');
        const btnTakePhoto = document.getElementById('btn-take-photo');
        const cameraInput = document.getElementById('camera-upload-input');
        
        // 使用节流处理文件选择
        const throttledFileSelect = throttle((files) => this.handleFileSelect(files), 200);
        
        // "选择图片"按钮点击 - 打开相册（多选）
        if (btnSelectFiles) {
            btnSelectFiles.addEventListener('click', () => imageUploadInput?.click());
        }
        
        // "拍照"按钮点击 - 智能相机调用
        if (btnTakePhoto) {
            btnTakePhoto.addEventListener('click', () => this.handleTakePhotoClick());
        }
        
        // 文件input的change事件
        if (imageUploadInput) {
            imageUploadInput.addEventListener('change', (e) => {
                throttledFileSelect(e.target.files);
                // 清空input，允许重复选择相同文件
                e.target.value = '';
            });
        }
        
        if (cameraInput) {
            cameraInput.addEventListener('change', (e) => {
                throttledFileSelect(e.target.files);
                e.target.value = '';
            });
        }
        
        // 初始化相机服务
        this.initCameraService();
    }
    
    // ==================== 相机服务 ====================
    
    initCameraService() {
        this.cameraStream = null;
        this.videoElement = null;
        this.canvasElement = null;
        this.isCameraActive = false;
    }
    
    /**
     * 检测是否为移动设备
     */
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    /**
     * 检测是否为 iOS 设备
     */
    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }
    
    /**
     * 检测是否为安卓设备
     */
    isAndroid() {
        return /Android/.test(navigator.userAgent);
    }
    
    /**
     * 检测是否为华为设备（鸿蒙系统）
     */
    isHuaweiDevice() {
        const ua = navigator.userAgent;
        return /Huawei|HarmonyOS|OpenHarmony|HMSCore/.test(ua) || 
               (/Android/.test(ua) && /HUAWEI|Honor| honor/.test(ua));
    }
    
    /**
     * 检测是否为 PakePlus 环境
     */
    isPakePlus() {
        return navigator.userAgent.includes('PakePlus') || 
               window.__TAURI__ !== undefined ||
               window.pakeplus !== undefined;
    }
    
    /**
     * 处理拍照按钮点击
     * 针对 PakePlus + 华为环境做特殊处理
     */
    async handleTakePhotoClick() {
        console.log('📷 拍照按钮点击');
        console.log('UserAgent:', navigator.userAgent);
        console.log('是否PakePlus:', this.isPakePlus());
        console.log('是否华为设备:', this.isHuaweiDevice());
        console.log('是否安卓:', this.isAndroid());
        
        // PakePlus + 华为/安卓环境特殊处理
        if (this.isPakePlus() && (this.isHuaweiDevice() || this.isAndroid())) {
            console.log('📦 PakePlus Android 环境：使用兼容模式');
            this.openCameraForPakePlus();
            return;
        }
        
        // 华为设备浏览器环境
        if (this.isHuaweiDevice()) {
            console.log('🔄 华为设备浏览器：尝试多种方式');
            this.openCameraForHuawei();
            return;
        }
        
        // 方法1: 使用 getUserMedia（桌面设备）
        const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
        if (hasGetUserMedia && !this.isMobileDevice()) {
            try {
                await this.startCameraCapture();
                return;
            } catch (error) {
                console.warn('getUserMedia 失败:', error);
            }
        }
        
        // 方法2: 使用 input file
        this.openCameraInputStandard();
    }
    
    /**
     * PakePlus 环境专用相机调用
     * 使用最简单的 file input，不设置 capture 属性
     */
    openCameraForPakePlus() {
        console.log('📦 PakePlus: 创建相机输入');
        
        // 创建最简单的 file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        // 注意：不设置 capture 属性，让系统弹出选择框
        
        input.addEventListener('change', (e) => {
            console.log('PakePlus 文件选择:', e.target.files?.length);
            if (e.target.files?.length > 0) {
                this.handleFileSelect(e.target.files);
            }
            input.remove();
        });
        
        // 必须添加到 DOM 才能触发
        input.style.cssText = 'position:fixed;top:-1000px;opacity:0;';
        document.body.appendChild(input);
        
        // 使用 HTMLElement.click() 方法
        input.click();
        
        // 3秒后清理
        setTimeout(() => input.remove(), 3000);
    }
    
    /**
     * 华为设备专用相机调用
     */
    openCameraForHuawei() {
        console.log('📱 华为设备: 创建相机输入');
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        // 华为鸿蒙对 capture="camera" 支持更好
        input.capture = 'camera';
        
        input.addEventListener('change', (e) => {
            console.log('华为设备文件选择:', e.target.files?.length);
            if (e.target.files?.length > 0) {
                this.handleFileSelect(e.target.files);
            }
            input.remove();
        });
        
        input.style.cssText = 'position:fixed;top:-1000px;opacity:0;';
        document.body.appendChild(input);
        input.click();
        
        setTimeout(() => input.remove(), 3000);
    }
    
    /**
     * 标准相机输入（其他设备）
     */
    openCameraInputStandard() {
        const cameraInput = document.getElementById('camera-upload-input');
        if (cameraInput) {
            cameraInput.click();
        }
    }
    
    /**
     * 使用 getUserMedia 启动相机
     */
    async startCameraCapture() {
        try {
            // 请求相机权限
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // 优先使用后置相机
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            });
            
            this.cameraStream = stream;
            this.showCameraModal();
            
        } catch (error) {
            console.error('相机启动失败:', error);
            
            // 根据错误类型给出提示
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                alert('请允许访问相机权限，或选择"从相册选择"上传图片');
            } else if (error.name === 'NotFoundError') {
                alert('未检测到相机设备，请使用相册选择图片');
            } else {
                alert('相机启动失败: ' + error.message);
            }
            
            throw error;
        }
    }
    
    /**
     * 显示相机拍摄模态框
     */
    showCameraModal() {
        // 创建相机模态框
        const modal = document.createElement('div');
        modal.id = 'camera-capture-modal';
        modal.className = 'camera-modal';
        modal.innerHTML = `
            <div class="camera-modal-overlay"></div>
            <div class="camera-modal-content">
                <div class="camera-header">
                    <button class="camera-close-btn" title="关闭">
                        <i class="fas fa-times"></i>
                    </button>
                    <span class="camera-title">拍照</span>
                    <button class="camera-switch-btn" title="切换摄像头">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
                <div class="camera-video-container">
                    <video id="camera-video" autoplay playsinline></video>
                    <canvas id="camera-canvas" style="display: none;"></canvas>
                </div>
                <div class="camera-controls">
                    <button class="camera-capture-btn" title="拍照">
                        <i class="fas fa-camera"></i>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 设置视频流
        this.videoElement = modal.querySelector('#camera-video');
        this.canvasElement = modal.querySelector('#camera-canvas');
        this.videoElement.srcObject = this.cameraStream;
        
        // 绑定事件
        const closeBtn = modal.querySelector('.camera-close-btn');
        const captureBtn = modal.querySelector('.camera-capture-btn');
        const switchBtn = modal.querySelector('.camera-switch-btn');
        
        closeBtn.addEventListener('click', () => this.closeCameraModal());
        captureBtn.addEventListener('click', () => this.capturePhoto());
        switchBtn.addEventListener('click', () => this.switchCamera());
        
        // 点击遮罩关闭
        modal.querySelector('.camera-modal-overlay').addEventListener('click', () => {
            this.closeCameraModal();
        });
        
        this.isCameraActive = true;
    }
    
    /**
     * 关闭相机模态框
     */
    closeCameraModal() {
        // 停止相机流
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
        
        // 移除模态框
        const modal = document.getElementById('camera-capture-modal');
        if (modal) {
            modal.remove();
        }
        
        this.videoElement = null;
        this.canvasElement = null;
        this.isCameraActive = false;
    }
    
    /**
     * 拍照
     */
    capturePhoto() {
        if (!this.videoElement || !this.canvasElement) return;
        
        const video = this.videoElement;
        const canvas = this.canvasElement;
        const context = canvas.getContext('2d');
        
        // 设置画布尺寸与视频一致
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        
        // 绘制视频帧到画布
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // 转换为 Blob
        canvas.toBlob((blob) => {
            if (blob) {
                // 创建 File 对象
                const file = new File([blob], `camera_${Date.now()}.jpg`, {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                });
                
                // 处理图片
                this.handleFileSelect([file]);
                
                // 关闭相机
                this.closeCameraModal();
            }
        }, 'image/jpeg', 0.9);
    }
    
    /**
     * 切换前后摄像头
     */
    async switchCamera() {
        if (!this.cameraStream) return;
        
        // 获取当前使用的摄像头
        const videoTrack = this.cameraStream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();
        const currentFacingMode = settings.facingMode || 'environment';
        const newFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
        
        // 停止当前流
        this.cameraStream.getTracks().forEach(track => track.stop());
        
        try {
            // 请求新的流
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: newFacingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            });
            
            this.cameraStream = newStream;
            this.videoElement.srcObject = newStream;
            
        } catch (error) {
            console.error('切换摄像头失败:', error);
            // 尝试恢复原来的流
            try {
                const originalStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: currentFacingMode },
                    audio: false
                });
                this.cameraStream = originalStream;
                this.videoElement.srcObject = originalStream;
            } catch (e) {
                console.error('恢复摄像头失败:', e);
            }
        }

        // 拖拽事件（节流）
        if (imageDropZone) {
            const dragOverHandler = throttle((e) => {
                e.preventDefault();
                e.stopPropagation();
                imageDropZone.classList.add('drag-over');
            }, 50);
            
            const dragLeaveHandler = throttle((e) => {
                e.preventDefault();
                e.stopPropagation();
                imageDropZone.classList.remove('drag-over');
            }, 50);
            
            imageDropZone.addEventListener('dragover', dragOverHandler);
            imageDropZone.addEventListener('dragleave', dragLeaveHandler);
            imageDropZone.addEventListener('drop', (e) => this.handleDrop(e));
            
            this._trackListener(imageDropZone, 'dragover', dragOverHandler);
            this._trackListener(imageDropZone, 'dragleave', dragLeaveHandler);
        }

        // 图片预览容器的删除按钮事件（事件委托）
        if (imagePreviewContainer) {
            const previewClickHandler = (e) => {
                const removeBtn = e.target.closest('.image-delete-btn');
                if (removeBtn) {
                    const imageId = removeBtn.dataset.imageId;
                    this.removeImage(imageId);
                }
            };
            imagePreviewContainer.addEventListener('click', previewClickHandler);
            this._trackListener(imagePreviewContainer, 'click', previewClickHandler);
        }
    }
    
    initLazyImageLoader() {
        this.lazyImageLoader = new LazyImageLoader({
            selector: 'img[data-src]',
            rootMargin: '100px',
            placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150"%3E%3Crect fill="%23f0f0f0" width="200" height="150"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="14"%3E加载中...%3C/text%3E%3C/svg%3E'
        });
    }

    async handleFileSelect(files) {
        if (!files || files.length === 0) return;
        
        PerfMonitor.start('handleFileSelect');

        const maxImages = 6;
        const remainingSlots = maxImages - this.pendingImages.length;
        if (remainingSlots <= 0) {
            alert(`最多只能上传 ${maxImages} 张图片`);
            return;
        }

        const filesToProcess = Array.from(files).slice(0, remainingSlots);
        
        // 并行处理图片，但限制并发数
        const concurrency = 2;
        const results = [];
        
        for (let i = 0; i < filesToProcess.length; i += concurrency) {
            const batch = filesToProcess.slice(i, i + concurrency);
            const batchResults = await Promise.allSettled(
                batch.map(file => this.processImageFile(file))
            );
            results.push(...batchResults);
        }
        
        // 处理结果
        let successCount = 0;
        results.forEach(result => {
            if (result.status === 'fulfilled' && result.value) {
                this.addImagePreview(result.value);
                successCount++;
            } else if (result.status === 'rejected') {
                console.error('图片处理失败:', result.reason);
            }
        });
        
        if (successCount > 0) {
            console.log(`成功处理 ${successCount} 张图片`);
        }
        
        PerfMonitor.end('handleFileSelect');
        PerfMonitor.measureMemory();
    }
    
    async processImageFile(file) {
        const validation = this.imageService.validateFile(file);
        if (!validation.valid) {
            console.warn(`跳过文件 ${file.name}: ${validation.error}`);
            return null;
        }

        try {
            const processed = await this.imageService.processFile(file);
            return {
                id: processed.id,
                name: processed.name,
                type: processed.type,
                size: processed.size,
                originalSize: processed.originalSize,
                width: processed.width,
                height: processed.height,
                dataUrl: processed.dataUrl,
                thumbnail: processed.thumbnail,
                createdAt: processed.createdAt
            };
        } catch (error) {
            console.error(`处理图片失败 ${file.name}:`, error);
            alert(`处理图片 ${file.name} 失败: ${error.message}`);
            return null;
        }
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();

        const { imageDropZone } = this.elements;
        imageDropZone?.classList.remove('drag-over');

        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            this.handleFileSelect(files);
        }
    }

    addImagePreview(imageData) {
        if (!imageData || !imageData.id) return;

        this.pendingImages.push(imageData);

        const previewItem = document.createElement('div');
        previewItem.className = 'image-preview-item';
        previewItem.dataset.imageId = imageData.id;

        const fileSize = imageData.size ? (imageData.size / 1024).toFixed(1) + ' KB' : '';
        
        // 使用data-src实现懒加载
        previewItem.innerHTML = `
            <img data-src="${imageData.thumbnail || imageData.dataUrl}" 
                 alt="${this.escapeHtml(imageData.name)}" 
                 class="preview-thumbnail"
                 loading="lazy">
            <div class="image-preview-overlay" title="点击放大查看">
                <i class="fas fa-search-plus"></i>
            </div>
            <button type="button" class="image-delete-btn" data-image-id="${imageData.id}" title="删除图片">
                <i class="fas fa-times"></i>
            </button>
            ${fileSize ? `<div class="image-info-tag">${fileSize}</div>` : ''}
        `;
        
        // 使用事件委托模式，避免每个图片都绑定事件
        previewItem.addEventListener('click', (e) => {
            if (!e.target.closest('.image-delete-btn')) {
                this.openLightboxLazy(imageData.dataUrl);
            }
        });

        this.elements.imagePreviewContainer?.appendChild(previewItem);
        
        // 触发懒加载观察
        this.lazyImageLoader?.observe(previewItem);

        this.updateImageCount();
        this.eventBus?.emit('IMAGE_ADDED', { imageId: imageData.id, count: this.pendingImages.length });
    }

    removeImage(imageId) {
        if (!imageId) return;

        const index = this.pendingImages.findIndex(img => img.id === imageId);
        if (index > -1) {
            this.pendingImages.splice(index, 1);
        }

        const previewItem = this.elements.imagePreviewContainer?.querySelector(`[data-image-id="${imageId}"]`);
        if (previewItem) {
            previewItem.remove();
        }

        this.updateImageCount();
        this.eventBus?.emit('IMAGE_REMOVED', { imageId, count: this.pendingImages.length });
    }

    clearImagePreview() {
        // 清空临时存储数组
        this.pendingImages = [];

        // 批量清空DOM
        if (this.elements.imagePreviewContainer) {
            this.elements.imagePreviewContainer.innerHTML = '';
        }

        // 重置文件input
        if (this.elements.imageUploadInput) {
            this.elements.imageUploadInput.value = '';
        }

        this.updateImageCount();
        this.eventBus?.emit('IMAGES_CLEARED', { count: 0 });
        
        // 建议垃圾回收
        if (globalThis.gc) {
            setTimeout(() => globalThis.gc(), 100);
        }
    }

    updateImageCount() {
        // 批量更新所有计数相关元素
        this.batchUpdate('imageCount', () => {
            const countElement = document.getElementById('image-count');
            const sizeElement = document.getElementById('image-size-info');
            const emptyState = document.getElementById('image-empty-state');
            
            const count = this.pendingImages.length;
            
            if (countElement) {
                countElement.textContent = `${count} / 6`;
                // 根据数量改变颜色
                if (count >= 6) {
                    countElement.style.color = '#e74c3c';
                } else if (count >= 4) {
                    countElement.style.color = '#f39c12';
                } else {
                    countElement.style.color = '';
                }
            }
            
            if (sizeElement) {
                const totalSize = this.pendingImages.reduce((sum, img) => sum + (img.size || 0), 0);
                sizeElement.textContent = `已用: ${(totalSize / 1024 / 1024).toFixed(2)} MB`;
            }
            
            if (emptyState) {
                emptyState.style.display = count === 0 ? 'flex' : 'none';
            }
        });
    }

    subscribeToStore() {
        const unsub = this.store.subscribe((state, prevState, action) => {
            this.onStateChange(state, prevState, action);
        });
        this.unsubscribers.push(unsub);
    }

    subscribeToEvents() {
        const events = [
            { event: Events.POINT_SELECTED, handler: (pointId) => this.updatePointDetails(pointId) },
            { event: Events.ISSUE_ADDED, handler: () => { this.updateIssuesList(); this.updateSummary(); } },
            { event: Events.ISSUE_DELETED, handler: () => { this.updateIssuesList(); this.updateSummary(); } },
            { event: Events.POINT_STATUS_CHANGED, handler: () => { this.updateHotspotStatuses(); this.updateSummary(); } },
            { event: Events.DATA_LOADED, handler: () => this.updateAll() },
            { event: Events.DATA_RESET, handler: () => this.updateAll() }
        ];
        
        events.forEach(({ event, handler }) => {
            this.eventBus.on(event, handler);
        });
    }

    onStateChange(state, prevState, action) {
        // 使用requestAnimationFrame批量处理状态更新
        this.batchUpdate('stateChange', () => {
            this._processStateChange(state, prevState, action);
        });
    }
    
    _processStateChange(state, prevState, action) {
        // Loading
        if (state.ui.loadingText !== prevState.ui.loadingText) {
            if (this.elements.loadingText) {
                this.elements.loadingText.textContent = state.ui.loadingText;
            }
        }
        if (state.ui.loadingProgress !== prevState.ui.loadingProgress) {
            if (this.elements.loadingProgress) {
                this.elements.loadingProgress.style.width = `${state.ui.loadingProgress}%`;
            }
        }
        if (state.ui.isLoading !== prevState.ui.isLoading) {
            if (!state.ui.isLoading) {
                setTimeout(() => {
                    this.elements.loadingScreen?.classList.add('hidden');
                }, 300);
            }
        }

        // Flow
        if (state.flow.currentStep !== prevState.flow.currentStep) {
            this.updateFlowUI();
            if (state.flow.isActive && state.flow.currentStep > 0) {
                this.openFlowStepModal(state.flow.currentStep);
            }
        }
        if (state.flow.isActive !== prevState.flow.isActive) {
            this.updateFlowButtons();
            if (state.flow.isActive && state.flow.currentStep === 1) {
                this.openFlowStepModal(1);
            }
            // 流程结束时重置当前步骤记录
            if (!state.flow.isActive) {
                this._currentFlowStep = null;
            }
        }

        // Inspection type changed
        if (state.ui.inspectionType !== prevState.ui.inspectionType) {
            this.queryAll('.type-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.type === state.ui.inspectionType);
            });
            this.filterHotspotsByType(state.ui.inspectionType);
        }

        // Filter
        if (state.filter.severity !== prevState.filter.severity) {
            this.updateFilterBadge();
            this.updateIssuesList();
        }

        // Modal
        if (state.ui.activeModal !== prevState.ui.activeModal) {
            this.handleModalChange(state.ui.activeModal);
        }
    }

    updateAll() {
        PerfMonitor.start('UIController.updateAll');
        
        this.updateSummary();
        this.updateIssuesList();
        this.updateHotspotStatuses();
        this.populateFlowSelect();
        this.updateFilterBadge();
        
        const inspectionType = this.store.state.ui.inspectionType;
        if (this.engine3D) {
            this.filterHotspotsByType(inspectionType);
        }
        
        PerfMonitor.end('UIController.updateAll');
    }

    updateSummary() {
        PerfMonitor.start('UIController.updateSummary');
        
        const summary = this.store.getComputed('summary');
        if (!summary) return;

        const updates = [
            { el: this.elements.overallScore, value: summary.score },
            { el: this.elements.gradeValue, value: summary.grade.grade },
            { el: this.elements.issueCount, value: `${summary.totalIssues}处` },
            { el: this.elements.normalCount, value: summary.severityCounts.normal },
            { el: this.elements.minorCount, value: summary.severityCounts.minor },
            { el: this.elements.moderateCount, value: summary.severityCounts.moderate },
            { el: this.elements.severeCount, value: summary.severityCounts.severe }
        ];

        updates.forEach(({ el, value }) => {
            if (el && el.textContent !== String(value)) {
                el.textContent = value;
            }
        });
        
        PerfMonitor.end('UIController.updateSummary');
    }

    // ==================== 优化后的 updateIssuesList ====================
    
    updateIssuesList() {
        PerfMonitor.start('UIController.updateIssuesList');
        
        const container = this.elements.issuesList;
        if (!container) {
            PerfMonitor.end('UIController.updateIssuesList');
            return;
        }

        let issues = this.store.getComputed('allIssues') || [];
        const filter = this.store.state.filter.severity;
        
        if (filter) {
            issues = issues.filter(i => i.severity === filter);
        }

        if (issues.length === 0) {
            container.innerHTML = `<p class="hint-text">${filter ? '暂无该级别问题' : '暂无发现问题'}</p>`;
            PerfMonitor.end('UIController.updateIssuesList');
            return;
        }

        // 如果问题列表很长（>50），使用虚拟滚动
        if (issues.length > 50 && !this.issuesVirtualScroller) {
            this.initVirtualScrolling(container, issues);
            PerfMonitor.end('UIController.updateIssuesList');
            return;
        }

        // 使用DocumentFragment批量更新
        const fragment = document.createDocumentFragment();
        
        // 批量创建元素，减少重排
        const batchSize = 20;
        const processBatch = (startIdx) => {
            const endIdx = Math.min(startIdx + batchSize, issues.length);
            
            for (let i = startIdx; i < endIdx; i++) {
                const card = this.createIssueCard(issues[i]);
                fragment.appendChild(card);
            }
            
            if (endIdx < issues.length) {
                requestAnimationFrame(() => processBatch(endIdx));
            } else {
                container.innerHTML = '';
                container.appendChild(fragment);
                
                // 重新观察懒加载图片
                this.lazyImageLoader?.observe(container);
                
                PerfMonitor.end('UIController.updateIssuesList');
            }
        };
        
        processBatch(0);
    }
    
    createIssueCard(issue) {
        const isNormal = issue.type === 'normal';
        const iconClass = isNormal ? 'fa-check-circle' : 'fa-exclamation-triangle';
        const issueClass = isNormal ? 'normal' : issue.severity;
        
        const images = issue.images || [];
        const hasImages = images.length > 0 && !isNormal;
        const thumbnailUrl = hasImages ? (images[0].thumbnail || images[0].dataUrl) : null;
        const remainingCount = images.length > 1 ? images.length - 1 : 0;
        
        const card = document.createElement('div');
        card.className = `issue-card ${isNormal ? 'issue-type-normal' : ''} ${hasImages ? 'has-image' : ''}`;
        card.dataset.pointId = issue.pointId;
        card.dataset.issueId = issue.id;
        
        // 构建图片缩略图HTML - 使用data-src实现懒加载
        let thumbnailHtml = '';
        if (hasImages) {
            thumbnailHtml = `
                <div class="issue-thumbnail" data-issue-id="${issue.id}" title="点击查看所有图片">
                    <img data-src="${thumbnailUrl}" alt="问题图片" loading="lazy">
                    ${remainingCount > 0 ? `<span class="image-count-badge">+${remainingCount}</span>` : ''}
                </div>
            `;
        }
        
        const desc = issue.description || '';
        const shortDesc = desc.length > 60 ? desc.substring(0, 60) + '...' : desc;
        
        card.innerHTML = `
            <div class="issue-card-main">
                ${thumbnailHtml}
                <div class="issue-card-content">
                    <div class="issue-card-header">
                        <div class="issue-icon ${issueClass}">
                            <i class="fas ${iconClass}"></i>
                        </div>
                        <span class="issue-title">${this.escapeHtml(issue.pointName)} - ${this.escapeHtml(DataService.getIssueTypeLabel(issue.type))}</span>
                        <span class="issue-severity ${issueClass}">
                            ${isNormal ? '正常' : this.escapeHtml(DataService.getSeverityLabel(issue.severity))}
                        </span>
                    </div>
                    ${!isNormal ? `
                        <div class="issue-desc">${this.escapeHtml(shortDesc)}</div>
                        <div class="issue-meta">
                            <span class="issue-cost">¥${(issue.cost || 0).toLocaleString()}</span>
                            ${hasImages ? `<span class="issue-image-indicator"><i class="fas fa-image"></i> ${images.length}张</span>` : ''}
                        </div>
                    ` : '<div class="issue-desc" style="color:var(--success-color)">该检测点状态正常</div>'}
                </div>
            </div>
        `;
        
        // 使用事件委托，不在每个卡片上绑定事件
        if (hasImages) {
            const thumbnail = card.querySelector('.issue-thumbnail');
            thumbnail?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showIssueImages(issue);
            });
        }
        
        return card;
    }
    
    initVirtualScrolling(container, issues) {
        this.issuesVirtualScroller = new VirtualScroller(container, {
            itemHeight: 120,
            overscan: 3,
            items: issues,
            renderItem: (issue) => this.createIssueCard(issue)
        });
    }

    // ==================== 优化后的 updatePointDetails ====================
    
    updatePointDetails(pointId) {
        PerfMonitor.start('UIController.updatePointDetails');
        
        const container = this.elements.pointDetails;
        if (!container || !pointId) {
            if (container && !pointId) {
                container.innerHTML = '<p class="hint-text">点击3D模型上的热点查看详情</p>';
            }
            PerfMonitor.end('UIController.updatePointDetails');
            return;
        }

        const point = this.dataService.getPoint(pointId);
        if (!point) {
            container.innerHTML = '<p class="hint-text">点击3D模型上的热点查看详情</p>';
            PerfMonitor.end('UIController.updatePointDetails');
            return;
        }

        const statusLabel = DataService.getStatusLabel(point.status);
        const isStructure = point.category === 'structure';

        // 使用DocumentFragment构建内容
        const fragment = document.createDocumentFragment();
        
        // 构建详情HTML
        let detailsHTML = this.buildPointDetailsHTML(point, isStructure);
        
        // 构建图片HTML - 使用懒加载
        const imagesHTML = this.buildPointImagesHTML(point);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'point-info-card';
        contentDiv.innerHTML = `
            <div class="point-info-header">
                <span class="point-info-name">${point.name}</span>
                <span class="point-info-status ${point.status}">${statusLabel}</span>
            </div>
            <div class="point-info-details">
                ${detailsHTML}
                <div class="point-info-row">
                    <span class="point-info-label">发现问题</span>
                    <span class="point-info-value">${point.issues?.length || 0}处</span>
                </div>
            </div>
            ${imagesHTML}
            <div class="point-info-actions" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
                <button id="btn-add-issue-for-point" class="btn btn-primary" style="width: 100%; padding: 12px; border-radius: 8px; border: none; background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.95rem;">
                    <i class="fas fa-plus-circle"></i> 为此检测点添加记录
                </button>
            </div>
        `;
        
        // 绑定添加记录按钮事件
        const addBtn = contentDiv.querySelector('#btn-add-issue-for-point');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.openAddIssueModalForPoint(pointId);
            });
        }
        
        fragment.appendChild(contentDiv);
        
        // 批量更新DOM
        container.innerHTML = '';
        container.appendChild(fragment);
        
        // 触发懒加载观察
        this.lazyImageLoader?.observe(container);

        // Focus camera
        const position = Constants.HOTSPOT_POSITIONS[pointId];
        if (position && this.engine3D?.focusOnPoint) {
            requestAnimationFrame(() => {
                this.engine3D.focusOnPoint(position);
            });
        }
        
        PerfMonitor.end('UIController.updatePointDetails');
    }
    
    buildPointDetailsHTML(point, isStructure) {
        if (isStructure) {
            const judgment = point.judgment || 'normal';
            return `
                <div class="point-info-row">
                    <span class="point-info-label">检测类型</span>
                    <span class="point-info-value">结构检测</span>
                </div>
                <div class="point-info-row">
                    <span class="point-info-label">判定结果</span>
                    <span class="point-info-status ${judgment === 'normal' ? 'good' : judgment === 'abnormal' ? 'warning' : 'danger'}">
                        ${DataService.getJudgmentLabel(judgment)}
                    </span>
                </div>
            `;
        } else {
            return `
                <div class="point-info-row">
                    <span class="point-info-label">漆面厚度</span>
                    <span class="point-info-value">${point.thickness?.min}-${point.thickness?.max} ${point.thickness?.unit}</span>
                </div>
            `;
        }
    }
    
    buildPointImagesHTML(point) {
        // 收集所有问题图片并按严重程度分组
        const imagesBySeverity = { severe: [], moderate: [], minor: [] };
        if (point.issues && point.issues.length > 0) {
            point.issues.forEach(issue => {
                if (issue.images && issue.images.length > 0) {
                    const severity = issue.severity || 'minor';
                    if (imagesBySeverity[severity]) {
                        issue.images.forEach(img => {
                            imagesBySeverity[severity].push({
                                ...img,
                                issueType: issue.type,
                                issueDescription: issue.description
                            });
                        });
                    }
                }
            });
        }

        const hasImages = imagesBySeverity.severe.length > 0 || 
                          imagesBySeverity.moderate.length > 0 || 
                          imagesBySeverity.minor.length > 0;

        if (!hasImages) return '';

        const severityConfig = {
            severe: { label: '严重', class: 'severe', color: '#e74c3c' },
            moderate: { label: '中等', class: 'moderate', color: '#f39c12' },
            minor: { label: '轻微', class: 'minor', color: '#f1c40f' }
        };

        let html = `<div class="point-images-section">`;
        
        ['severe', 'moderate', 'minor'].forEach(severity => {
            const images = imagesBySeverity[severity];
            if (images.length > 0) {
                const config = severityConfig[severity];
                html += `
                    <div class="image-group">
                        <div class="image-group-header" style="color: ${config.color}">
                            <span class="severity-badge ${config.class}">${config.label}</span>
                            <span class="group-image-count">${images.length}张</span>
                        </div>
                        <div class="point-images-grid">
                            ${images.slice(0, 6).map((img, index) => `
                                <div class="point-image-thumb" 
                                     data-lightbox-trigger
                                     data-point-id="${point.id}"
                                     data-severity="${severity}"
                                     data-index="${index}">
                                    <img data-src="${img.thumbnail || img.dataUrl}" 
                                         alt="${this.escapeHtml(img.name || '问题图片')}" 
                                         loading="lazy">
                                    ${index === 5 && images.length > 6 ? `
                                        <div class="point-image-more">+${images.length - 6}</div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        });
        
        html += `</div>`;
        
        // 使用事件委托处理lightbox打开
        setTimeout(() => {
            const container = this.elements.pointDetails;
            container?.querySelectorAll('[data-lightbox-trigger]').forEach(thumb => {
                thumb.addEventListener('click', (e) => {
                    const pointId = thumb.dataset.pointId;
                    const severity = thumb.dataset.severity;
                    const index = parseInt(thumb.dataset.index);
                    this.openImageLightbox(pointId, severity, index);
                });
            });
        }, 0);
        
        return html;
    }

    updateHotspotStatuses() {
        PerfMonitor.start('UIController.updateHotspotStatuses');
        
        const points = this.dataService.getAllPoints();
        
        // 批量更新，减少渲染次数
        requestAnimationFrame(() => {
            Object.values(points).forEach(point => {
                this.engine3D?.updateHotspot(point.id, point.status, point.judgment);
            });
            
            const inspectionType = this.store.state.ui.inspectionType;
            if (inspectionType && this.engine3D) {
                this.engine3D.filterHotspots(inspectionType, false);
            }
            
            PerfMonitor.end('UIController.updateHotspotStatuses');
        });
    }

    updateFlowUI() {
        const state = this.store.state.flow;
        const points = this.dataService.getPointsByOrder();
        const currentPoint = points[state.currentStep - 1];

        if (this.elements.flowStep) {
            this.elements.flowStep.textContent = state.currentStep;
        }
        if (this.elements.flowProgress) {
            const progress = (state.currentStep / state.totalSteps) * 100;
            this.elements.flowProgress.style.width = `${progress}%`;
        }
        if (this.elements.flowPointName && currentPoint) {
            const prefix = currentPoint.category === 'paint' ? '【漆面】' : '【结构】';
            this.elements.flowPointName.innerHTML = `<span style="color:var(--primary-color)">${prefix}</span> ${currentPoint.name}`;
        }
    }

    updateFlowButtons() {
        const state = this.store.state.flow;
        
        const buttonStates = [
            { el: this.elements.btnStartFlow, show: !state.isActive },
            { el: this.elements.btnPrevPoint, show: state.isActive },
            { el: this.elements.btnNextPoint, show: state.isActive },
            { el: this.elements.btnCompletePoint, show: state.isActive }
        ];
        
        buttonStates.forEach(({ el, show }) => {
            if (el) {
                el.style.display = show ? 'flex' : 'none';
            }
        });
    }

    populateFlowSelect() {
        const select = this.elements.flowJumpSelect;
        if (!select) return;

        const points = this.dataService.getPointsByOrder();
        
        // 使用DocumentFragment
        const fragment = document.createDocumentFragment();
        
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '跳转到...';
        fragment.appendChild(defaultOption);
        
        points.forEach((p, i) => {
            const option = document.createElement('option');
            option.value = i + 1;
            const prefix = p.category === 'paint' ? '【漆面】' : '【结构】';
            option.textContent = `${i + 1}. ${prefix}${p.name}`;
            fragment.appendChild(option);
        });
        
        select.innerHTML = '';
        select.appendChild(fragment);
        
        // 使用once选项避免重复绑定
        select.addEventListener('change', (e) => {
            if (e.target.value) {
                this.store.dispatch({ type: 'FLOW/JUMP', payload: parseInt(e.target.value) });
            }
        }, { once: false });
    }

    updateFilterBadge() {
        const badge = this.elements.filterBadge;
        if (!badge) return;

        const filter = this.store.state.filter.severity;
        
        if (filter) {
            badge.textContent = `筛选: ${DataService.getSeverityLabel(filter)}`;
            badge.style.display = 'inline-flex';
        } else {
            badge.style.display = 'none';
        }
    }

    handleModalChange(modalId) {
        this.batchUpdate('modalChange', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.toggle('active', modal.id === modalId);
            });
        });
    }

    openAddIssueModal() {
        const selectedPoint = this.store.state.ui.selectedPointId;
        console.log('📝 openAddIssueModal - selectedPoint:', selectedPoint);
        
        const select = document.getElementById('issue-point');
        if (select) {
            select.disabled = false;
            if (selectedPoint) {
                select.value = selectedPoint;
                console.log('📝 Set issue-point value to:', selectedPoint);
            } else {
                console.warn('📝 No selectedPoint, issue-point will use default');
            }
        }
        
        const modalTitle = document.querySelector('#add-issue-modal .modal-header h3');
        if (modalTitle) {
            modalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> 添加检测记录';
        }
        
        const saveBtn = document.getElementById('btn-save-continue');
        if (saveBtn) {
            saveBtn.innerHTML = '保存';
        }
        
        this.resetSeverityUI();
        this.updateIssueTypeOptions(selectedPoint);
        this.clearImagePreview();
        
        this.store.openModal('add-issue-modal');
    }

    /**
     * 为指定检测点打开添加记录弹窗
     * @param {string} pointId - 检测点ID
     */
    openAddIssueModalForPoint(pointId) {
        if (!pointId) {
            console.error('❌ openAddIssueModalForPoint: pointId is required');
            return;
        }
        
        console.log('📝 openAddIssueModalForPoint:', pointId);
        
        // 先选中该检测点
        this.store.selectPoint(pointId);
        
        const point = this.dataService.getPoint(pointId);
        if (!point) {
            console.error('❌ Point not found:', pointId);
            return;
        }
        
        // 设置下拉框值
        const select = document.getElementById('issue-point');
        if (select) {
            select.value = pointId;
            select.disabled = false;
            console.log('✅ Set issue-point value to:', pointId);
        }
        
        // 更新弹窗标题
        const modalTitle = document.querySelector('#add-issue-modal .modal-header h3');
        if (modalTitle) {
            const categoryLabel = point.category === 'paint' ? '漆面检测' : '结构检测';
            modalTitle.innerHTML = `<i class="fas fa-clipboard-check"></i> ${categoryLabel}: ${point.name}`;
        }
        
        // 重置表单
        this.resetSeverityUI();
        this.clearImagePreview();
        
        // 根据检测点类型更新问题类型选项
        this.updateIssueTypeOptions(pointId);
        
        // 打开弹窗
        this.store.openModal('add-issue-modal');
    }

    /**
     * 根据检测点类型更新问题类型选项
     * @param {string} pointId - 检测点ID
     */
    updateIssueTypeOptions(pointId) {
        const issueTypeSelect = document.getElementById('issue-type');
        if (!issueTypeSelect || !pointId) return;
        
        const point = this.dataService.getPoint(pointId);
        if (!point) return;
        
        const isStructure = point.category === 'structure';
        console.log('📝 Updating issue type options for:', pointId, 'category:', point.category);
        
        // 清空现有选项
        issueTypeSelect.innerHTML = '';
        
        // 添加"正常"选项
        issueTypeSelect.add(new Option('✓ 正常 - 无问题', 'normal'));
        
        if (isStructure) {
            // 结构检测问题类型
            issueTypeSelect.add(new Option('焊接异常', 'weld_abnormal'));
            issueTypeSelect.add(new Option('变形', 'deformation'));
            issueTypeSelect.add(new Option('裂纹/裂缝', 'crack'));
            issueTypeSelect.add(new Option('锈蚀', 'rust'));
            issueTypeSelect.add(new Option('修复痕迹', 'repair_trace'));
        } else {
            // 漆面检测问题类型
            issueTypeSelect.add(new Option('划痕', 'scratch'));
            issueTypeSelect.add(new Option('凹陷', 'dent'));
            issueTypeSelect.add(new Option('漆面异常', 'paint_anomaly'));
            issueTypeSelect.add(new Option('色差', 'color_diff'));
            issueTypeSelect.add(new Option('流漆/飞漆', 'overspray'));
            issueTypeSelect.add(new Option('锈蚀', 'rust'));
        }
        
        // 添加通用选项
        issueTypeSelect.add(new Option('其他', 'other'));
        
        // 默认选择"正常"
        issueTypeSelect.value = 'normal';
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ==================== 优化后的图片查看功能 ====================
    
    showIssueImages(issue) {
        if (!issue.images || issue.images.length === 0) return;
        
        PerfMonitor.start('UIController.showIssueImages');
        
        let modal = document.getElementById('issue-images-modal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'issue-images-modal';
            modal.className = 'modal image-viewer-modal';
            modal.innerHTML = `
                <div class="modal-overlay" data-modal-close></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-images"></i> 问题图片</h3>
                        <button class="close-btn" data-modal-close>
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="image-viewer-container"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // 事件委托关闭模态框
            modal.addEventListener('click', (e) => {
                if (e.target.hasAttribute('data-modal-close')) {
                    modal.classList.remove('active');
                }
            });
        }
        
        const container = modal.querySelector('.image-viewer-container');
        
        // 使用DocumentFragment批量构建
        const fragment = document.createDocumentFragment();
        
        issue.images.forEach((img, index) => {
            const item = document.createElement('div');
            item.className = 'image-viewer-item';
            item.innerHTML = `
                <img data-src="${img.dataUrl}" alt="图片 ${index + 1}" loading="lazy">
                <div class="image-viewer-info">
                    <span>${img.name || `图片 ${index + 1}`}</span>
                    <span>${new Date(img.createdAt || Date.now()).toLocaleString()}</span>
                </div>
            `;
            item.addEventListener('click', () => this.openLightboxLazy(img.dataUrl));
            fragment.appendChild(item);
        });
        
        container.innerHTML = '';
        container.appendChild(fragment);
        
        // 触发懒加载
        this.lazyImageLoader?.observe(container);
        
        modal.classList.add('active');
        
        PerfMonitor.end('UIController.showIssueImages');
    }

    /**
     * 延迟加载Lightbox模块
     */
    async openLightboxLazy(imageUrl) {
        PerfMonitor.start('UIController.openLightboxLazy');
        
        await LightboxModule.load();
        this.openLightbox(imageUrl);
        
        PerfMonitor.end('UIController.openLightboxLazy');
    }

    openImageLightbox(pointId, severity, startIndex = 0) {
        PerfMonitor.start('UIController.openImageLightbox');
        
        const point = this.dataService.getPoint(pointId);
        if (!point || !point.issues) {
            PerfMonitor.end('UIController.openImageLightbox');
            return;
        }

        // 收集该严重程度的所有图片
        const images = [];
        point.issues.forEach(issue => {
            if (issue.severity === severity && issue.images) {
                issue.images.forEach(img => {
                    images.push({
                        ...img,
                        issueType: issue.type,
                        issueDescription: issue.description
                    });
                });
            }
        });

        if (images.length === 0) {
            PerfMonitor.end('UIController.openImageLightbox');
            return;
        }

        // 保存lightbox状态
        this._lightboxState = { pointId, severity, images };
        this._currentImageIndex = startIndex;

        this.renderLightbox(images[startIndex], startIndex, images.length, pointId, severity);
        
        PerfMonitor.end('UIController.openImageLightbox');
    }
    
    renderLightbox(image, index, total, pointId, severity) {
        // 移除旧的lightbox
        const oldLightbox = document.getElementById('point-image-lightbox');
        if (oldLightbox) {
            oldLightbox.remove();
        }

        const lightbox = document.createElement('div');
        lightbox.className = 'image-lightbox';
        lightbox.id = 'point-image-lightbox';
        
        lightbox.innerHTML = LightboxModule.createLightboxHTML({
            imageUrl: image.dataUrl,
            title: DataService.getIssueTypeLabel(image.issueType) || '问题图片',
            description: image.issueDescription,
            currentIndex: index + 1,
            total: total,
            hasNav: total > 1
        });

        document.body.appendChild(lightbox);
        document.body.style.overflow = 'hidden';
        
        // 使用事件委托
        lightbox.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-lightbox-close')) {
                this.closeImageLightbox();
            } else if (e.target.hasAttribute('data-lightbox-prev')) {
                this.navigateLightbox(index - 1);
            } else if (e.target.hasAttribute('data-lightbox-next')) {
                this.navigateLightbox(index + 1);
            }
        });
        
        // 清理旧的键盘处理器
        if (this._lightboxKeyHandler) {
            document.removeEventListener('keydown', this._lightboxKeyHandler);
        }
        
        this._lightboxKeyHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeImageLightbox();
            } else if (e.key === 'ArrowLeft' && index > 0) {
                this.navigateLightbox(index - 1);
            } else if (e.key === 'ArrowRight' && index < total - 1) {
                this.navigateLightbox(index + 1);
            }
        };
        document.addEventListener('keydown', this._lightboxKeyHandler);
    }

    closeImageLightbox() {
        const lightbox = document.getElementById('point-image-lightbox');
        if (lightbox) {
            lightbox.remove();
        }
        document.body.style.overflow = '';
        
        if (this._lightboxKeyHandler) {
            document.removeEventListener('keydown', this._lightboxKeyHandler);
            this._lightboxKeyHandler = null;
        }
        
        this._lightboxState = null;
        this._currentImageIndex = null;
        
        // 建议垃圾回收
        if (globalThis.gc) {
            setTimeout(() => globalThis.gc(), 100);
        }
    }

    navigateLightbox(newIndex) {
        if (!this._lightboxState) return;
        
        const { images, pointId, severity } = this._lightboxState;
        
        if (newIndex < 0 || newIndex >= images.length) return;
        
        this._currentImageIndex = newIndex;
        this.renderLightbox(images[newIndex], newIndex, images.length, pointId, severity);
    }

    openLightbox(imageUrl) {
        // 复用renderLightbox逻辑
        const oldLightbox = document.getElementById('point-image-lightbox');
        if (oldLightbox) {
            oldLightbox.remove();
        }

        const lightbox = document.createElement('div');
        lightbox.className = 'image-lightbox';
        lightbox.id = 'point-image-lightbox';
        
        lightbox.innerHTML = `
            <div class="lightbox-overlay" data-lightbox-close></div>
            <div class="lightbox-content">
                <button class="lightbox-close" data-lightbox-close>
                    <i class="fas fa-times"></i>
                </button>
                <div class="lightbox-image-container">
                    <img src="${imageUrl}" alt="图片预览" loading="eager">
                </div>
            </div>
        `;

        document.body.appendChild(lightbox);
        document.body.style.overflow = 'hidden';
        
        lightbox.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-lightbox-close')) {
                this.closeImageLightbox();
            }
        });
        
        if (this._lightboxKeyHandler) {
            document.removeEventListener('keydown', this._lightboxKeyHandler);
        }
        
        this._lightboxKeyHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeImageLightbox();
            }
        };
        document.addEventListener('keydown', this._lightboxKeyHandler);
    }

    filterHotspotsByType(type) {
        if (!this.engine3D) return;
        
        if (type === null || type === 'all') {
            this.engine3D.showAllHotspots();
        } else {
            this.engine3D.filterHotspots(type, false);
            
            // 使用requestAnimationFrame延迟聚焦
            requestAnimationFrame(() => {
                setTimeout(() => {
                    const firstId = this.engine3D.focusOnFirstVisible(type);
                    if (firstId) {
                        this.store.selectPoint(firstId);
                    }
                }, 300);
            });
        }
    }

    focusOnHotspot(pointId) {
        if (!this.engine3D) return;
        
        const position = Constants.HOTSPOT_POSITIONS[pointId];
        if (!position) return;
        
        const cameraOffset = this.calculateCameraOffset(position, pointId);
        
        if (typeof gsap !== 'undefined') {
            gsap.to(this.engine3D.camera.position, {
                x: cameraOffset.x,
                y: cameraOffset.y,
                z: cameraOffset.z,
                duration: 0.8,
                ease: 'power2.inOut'
            });
            
            gsap.to(this.engine3D.controls.target, {
                x: position.x,
                y: position.y,
                z: position.z,
                duration: 0.8,
                ease: 'power2.inOut'
            });
        } else {
            this.engine3D.camera.position.set(cameraOffset.x, cameraOffset.y, cameraOffset.z);
            this.engine3D.controls.target.set(position.x, position.y, position.z);
            this.engine3D.controls.update();
        }
        
        this.engine3D.selectPoint?.(pointId);
    }

    calculateCameraOffset(position, pointId) {
        const point = this.dataService.getPoint(pointId);
        const isStructure = point?.category === 'structure';
        
        const distance = isStructure ? 5 : 4;
        let offsetX = 0, offsetZ = 0;
        
        if (Math.abs(position.x) > 1.5) {
            offsetX = position.x > 0 ? -distance : distance;
            offsetZ = position.z * 0.3;
        } else if (position.z > 2) {
            offsetX = distance * 0.7;
            offsetZ = -distance * 0.7;
        } else if (position.z < -2) {
            offsetX = distance * 0.7;
            offsetZ = distance * 0.7;
        } else {
            offsetX = distance * 0.8;
            offsetZ = distance * 0.6;
        }
        
        const offsetY = Math.max(1.5, position.y + 1.5);
        
        return {
            x: position.x + offsetX,
            y: offsetY,
            z: position.z + offsetZ
        };
    }

    updateSeverityUI(severity) {
        const descInput = document.getElementById('issue-description');
        const descHint = document.getElementById('desc-hint');
        
        if (severity === 'normal') {
            if (descInput) {
                descInput.placeholder = '选择"正常"时，可不填描述';
                descInput.style.opacity = '0.7';
            }
            if (descHint) {
                descHint.textContent = '（可选）';
                descHint.style.color = '#2ecc71';
            }
        } else {
            if (descInput) {
                descInput.placeholder = '请详细描述问题...';
                descInput.style.opacity = '1';
            }
            if (descHint) {
                descHint.textContent = '（必填）';
                descHint.style.color = '#e74c3c';
            }
        }
    }

    resetSeverityUI() {
        const normalRadio = document.querySelector('input[name="severity"][value="normal"]');
        if (normalRadio) {
            normalRadio.checked = true;
        }
        
        this.updateSeverityUI('normal');
        
        const descInput = document.getElementById('issue-description');
        if (descInput) {
            descInput.value = '';
        }
    }

    openFlowStepModal(step) {
        console.log('openFlowStepModal called:', step, 'current:', this._currentFlowStep);
        // 防止重复调用 - 如果已经在显示该步骤的模态框，直接返回
        if (this._currentFlowStep === step && this.store.state.ui.activeModal === 'add-issue-modal') {
            console.log('Already showing step', step);
            return;
        }
        
        const points = this.dataService.getPointsByOrder();
        const currentPoint = points[step - 1];
        
        if (!currentPoint) {
            console.warn('No point found for step:', step);
            return;
        }
        
        // 记录当前步骤，防止重复调用
        this._currentFlowStep = step;
        
        // 只有在非状态变更触发的情况下才dispatch（避免onStateChange和此方法形成循环）
        if (this.store.state.flow.currentStep !== step) {
            this.store.dispatch({ type: 'FLOW/JUMP', payload: step });
        }
        
        this.store.selectPoint(currentPoint.id);
        this.focusOnHotspot(currentPoint.id);
        
        // 直接设置模态框，不使用延迟
        this.setupFlowModal(currentPoint, step);
    }
    
    setupFlowModal(currentPoint, step) {
        console.log('setupFlowModal:', currentPoint.name, 'step:', step);
        
        const select = document.getElementById('issue-point');
        if (select) {
            select.value = currentPoint.id;
            select.disabled = true;
        }
        
        const modalTitle = document.querySelector('#add-issue-modal .modal-header h3');
        if (modalTitle) {
            const categoryLabel = currentPoint.category === 'paint' ? '漆面检测' : '结构检测';
            modalTitle.innerHTML = `<i class="fas fa-clipboard-check"></i> 第${step}/${Constants.FLOW_CONFIG.TOTAL_STEPS}步 - ${categoryLabel}: ${currentPoint.name}`;
        }
        
        const saveBtn = document.getElementById('btn-save-continue');
        if (saveBtn) {
            saveBtn.innerHTML = step < Constants.FLOW_CONFIG.TOTAL_STEPS 
                ? '<i class="fas fa-arrow-right"></i> 保存并继续' 
                : '<i class="fas fa-check"></i> 保存并完成';
        }
        
        this.resetSeverityUI();
        this.clearImagePreview();
        
        // 根据检测点类型更新问题类型选项
        this.updateIssueTypeOptions(currentPoint.id);
        
        console.log('Opening modal...');
        this.store.openModal('add-issue-modal');
        // 同步更新 DOM：当 activeModal 未变化时 handleModalChange 不会被调用，弹窗可能不显示，此处强制显示
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.toggle('active', modal.id === 'add-issue-modal');
        });
    }

    saveIssue(andContinue = true) {
        try {
            const form = document.getElementById('add-issue-form');
            if (!form) {
                console.error('Form not found');
                return;
            }

            const formData = new FormData(form);
            
            // 获取 pointId - 优先使用表单值，其次使用下拉框值
            const pointIdFromForm = formData.get('point');
            const pointIdFromSelect = document.getElementById('issue-point')?.value;
            const pointId = pointIdFromForm || pointIdFromSelect;
            
            console.log('📝 Form data - point from FormData:', pointIdFromForm);
            console.log('📝 Form data - point from select:', pointIdFromSelect);
            console.log('📝 Final pointId:', pointId);
            
            const issue = {
                pointId: pointId,
                type: formData.get('type') || document.getElementById('issue-type')?.value,
                severity: form.querySelector('input[name="severity"]:checked')?.value || 'normal',
                description: document.getElementById('issue-description')?.value || '',
                suggestion: document.getElementById('issue-suggestion')?.value || '',
                cost: parseInt(document.getElementById('issue-cost')?.value) || 0,
                images: [...this.pendingImages]
            };

            console.log('📝 Saving issue:', issue);

            if (!issue.pointId) {
                console.error('❌ Validation failed: pointId is empty');
                alert('请选择检测部位');
                return;
            }
            
            if (!issue.type) {
                console.error('❌ Validation failed: type is empty');
                alert('请选择问题类型');
                return;
            }
            
            if (issue.severity !== 'normal' && !issue.description.trim()) {
                alert('请详细描述问题（选择"正常"时可不填）');
                document.getElementById('issue-description')?.focus();
                return;
            }

            const result = this.dataService.addIssue(issue);
            if (!result) {
                console.error('Failed to add issue');
                alert('保存失败，请检查数据');
                return;
            }

            // ✅ 强制刷新 UI（备用方案，确保列表和热点更新）
            console.log('📝 Force updating UI after save');
            this.updateIssuesList();
            this.updateSummary();
            if (this.engine3D) {
                this.updateHotspotVisibility?.();
            }
            
            // 刷新当前检测点详情
            if (issue.pointId && this.store.state.ui.selectedPointId === issue.pointId) {
                this.updatePointDetails(issue.pointId);
            }

            this.store.closeModal();
            form.reset();
        
        this.clearImagePreview();
        
        const select = document.getElementById('issue-point');
        if (select) {
            select.disabled = false;
        }
        
        const modalTitle = document.querySelector('#add-issue-modal .modal-header h3');
        if (modalTitle) {
            modalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> 添加检测记录';
        }
        
        console.log('Checking flow continuation:', andContinue, 'isActive:', this.store.state.flow.isActive);
        if (andContinue && this.store.state.flow.isActive) {
            const currentStep = this.store.state.flow.currentStep;
            console.log('Continuing to next step from:', currentStep);
            if (currentStep < Constants.FLOW_CONFIG.TOTAL_STEPS) {
                setTimeout(() => {
                    console.log('Dispatching FLOW/NEXT');
                    this.store.dispatch({ type: 'FLOW/NEXT' });
                }, 300);
            } else {
                setTimeout(() => {
                    alert('🎉 恭喜！18步检测流程已完成！');
                    this.store.dispatch({ type: 'FLOW/RESET' });
                }, 300);
            }
        }
        } catch (error) {
            console.error('Save issue error:', error);
            alert('保存时出错: ' + error.message);
        }
    }

    skipStep() {
        const form = document.getElementById('add-issue-form');
        if (form) {
            form.reset();
        }
        
        const select = document.getElementById('issue-point');
        if (select) {
            select.disabled = false;
        }
        
        const modalTitle = document.querySelector('#add-issue-modal .modal-header h3');
        if (modalTitle) {
            modalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> 添加检测记录';
        }
        
        this.clearImagePreview();
        this.store.closeModal();
        
        if (this.store.state.flow.isActive) {
            const currentStep = this.store.state.flow.currentStep;
            if (currentStep < Constants.FLOW_CONFIG.TOTAL_STEPS) {
                setTimeout(() => {
                    this.store.dispatch({ type: 'FLOW/NEXT' });
                }, 300);
            } else {
                setTimeout(() => {
                    alert('🎉 恭喜！18步检测流程已完成！');
                    this.store.dispatch({ type: 'FLOW/RESET' });
                }, 300);
            }
        }
    }

    resetModalState() {
        const form = document.getElementById('add-issue-form');
        if (form) {
            form.reset();
        }
        
        const select = document.getElementById('issue-point');
        if (select) {
            select.disabled = false;
        }
        
        const modalTitle = document.querySelector('#add-issue-modal .modal-header h3');
        if (modalTitle) {
            modalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> 添加检测记录';
        }
        
        const saveBtn = document.getElementById('btn-save-continue');
        if (saveBtn) {
            saveBtn.innerHTML = '保存';
        }
        
        this.clearImagePreview();
    }

    completeFlowStep() {
        try {
            const currentStep = this.store.state.flow.currentStep;
            console.log('Complete flow step called, current step:', currentStep);
            if (currentStep > 0 && currentStep <= Constants.FLOW_CONFIG.TOTAL_STEPS) {
                this.openFlowStepModal(currentStep);
            } else {
                // 如果流程还没开始，从第1步开始
                this.store.dispatch({ type: 'FLOW/START' });
            }
        } catch (error) {
            console.error('Complete flow step error:', error);
        }
    }

    async exportReport(type) {
        PerfMonitor.start(`exportReport.${type}`);
        
        const data = {
            vehicleInfo: this.dataService.getVehicleInfo(),
            issues: this.store.getComputed('allIssues'),
            summary: this.store.getComputed('summary')
        };

        if (type === 'word') {
            this.reportService.exportWord(data);
        } else if (type === 'pdf') {
            await this.reportService.exportPDF(data);
        }
        
        PerfMonitor.end(`exportReport.${type}`);
    }

    saveData() {
        const data = this.dataService.exportData();
        this.reportService.exportJSON(data);
    }

    loadData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    this.dataService.importData(data);
                    alert('数据加载成功');
                } catch (err) {
                    alert('数据格式错误');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    resetData() {
        if (confirm('确定要重置所有数据吗？此操作不可撤销。')) {
            this.dataService.resetData();
        }
    }

    updateMerchantMode(enabled) {
        const toolsSection = document.querySelector('.tools-section');
        if (toolsSection) {
            toolsSection.classList.toggle('visible', enabled);
        }
    }

    // ==================== 内存清理 ====================
    
    destroy() {
        PerfMonitor.start('UIController.destroy');
        
        // 取消所有store订阅
        this.unsubscribers.forEach(unsub => unsub());
        this.unsubscribers = [];
        
        // 清理所有事件监听器
        this._eventListeners.forEach((listeners, element) => {
            listeners.forEach(({ event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        this._eventListeners.clear();
        
        // 清理Intersection Observers
        this._observers.forEach(observer => observer.disconnect());
        this._observers.clear();
        
        // 清理懒加载器
        this.lazyImageLoader?.destroy();
        this.lazyImageLoader = null;
        
        // 清理虚拟滚动
        this.issuesVirtualScroller?.destroy();
        this.issuesVirtualScroller = null;
        
        // 取消所有待执行的RAF
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
        
        // 清理lightbox
        this.closeImageLightbox();
        
        // 清空DOM缓存
        this._domCache.clear();
        
        // 清空图片数组
        this.pendingImages = [];
        
        // 清空更新队列
        this._updateQueue.clear();
        
        // 清理滚动处理器
        if (this._scrollHandler) {
            window.removeEventListener('scroll', this._scrollHandler);
            this._scrollHandler = null;
        }
        
        // 断开所有引用
        this.store = null;
        this.eventBus = null;
        this.dataService = null;
        this.engine3D = null;
        this.reportService = null;
        this.imageService = null;
        this.elements = {};
        
        // 建议垃圾回收
        if (globalThis.gc) {
            globalThis.gc();
        }
        
        PerfMonitor.end('UIController.destroy');
        PerfMonitor.measureMemory();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UIController, debounce, throttle, PerfMonitor, LazyImageLoader, VirtualScroller };
} else {
    window.UIController = UIController;
    window.UIUtils = { debounce, throttle, PerfMonitor, LazyImageLoader, VirtualScroller };
}
