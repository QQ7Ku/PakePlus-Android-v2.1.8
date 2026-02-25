/**
 * EV 3D Inspection System - Main Application
 * BYD Qin Pro DM 2019 Inspection Platform
 */

class InspectionApp {
    constructor() {
        this.engine = null;
        this.model = null;
        this.dataManager = null;
        this.reportExporter = null;
        
        this.isMerchantMode = false;
        this.currentInspectionType = 'paint';
        this.selectedPointId = null;
        this.uploadedImages = [];
        this.currentViewerImageIndex = 0;
        this.viewerImages = [];
        this.selectedModelFile = null;
        this.editingIssueId = null;
        this.editingPointId = null;
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
        } else {
            this.onDOMReady();
        }
    }
    
    onDOMReady() {
        // Detect iPad/tablet and apply optimizations
        this.detectAndOptimizeForTablet();
        
        // Initialize data manager
        this.dataManager = new InspectionDataManager();
        
        // Initialize report exporter
        this.reportExporter = new ReportExporter();
        
        // Initialize 3D engine with error handling for tablets
        try {
            this.engine = new Inspection3DEngine('main-canvas');
        } catch (error) {
            console.error('Failed to initialize 3D engine:', error);
            this.showWebGLError();
            return;
        }
        
        // Set up callbacks
        this.engine.onPointClick = (pointId) => this.onPointClick(pointId);
        this.engine.onPointHover = (pointId, pointName) => this.onPointHover(pointId, pointName);
        
        // Set up UI
        this.setupUI();
        this.setupEventListeners();
        
        // Update UI with initial data
        this.updateUI();
        
        // Try to load external GLB model first, fallback to default model
        this.loadPrimaryModel();
    }
    
    /**
     * Show WebGL error for tablets/devices that don't support 3D
     */
    showWebGLError() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            const container = loadingScreen.querySelector('.loading-container');
            if (container) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 20px;">
                        <i class="fas fa-cube" style="font-size: 48px; color: #e74c3c; margin-bottom: 20px;"></i>
                        <h2 style="color: #fff; margin-bottom: 15px;">3D 功能初始化失败</h2>
                        <p style="color: #aaa; margin-bottom: 20px; line-height: 1.6;">
                            您的设备可能不支持 WebGL 3D 渲染。<br>
                            这可能是由于：
                        </p>
                        <ul style="color: #888; text-align: left; display: inline-block; line-height: 1.8; margin-bottom: 20px;">
                            <li>浏览器版本过旧</li>
                            <li>设备处于省电模式</li>
                            <li>WebGL 被禁用</li>
                            <li>设备硬件不支持</li>
                        </ul>
                        <div style="margin-top: 20px;">
                            <p style="color: #666; font-size: 13px;">尝试以下解决方案：</p>
                            <ol style="color: #888; text-align: left; display: inline-block; line-height: 1.8; font-size: 13px;">
                                <li>刷新页面重试</li>
                                <li>更新浏览器到最新版本</li>
                                <li>关闭省电模式后刷新</li>
                                <li>尝试使用 Chrome 或 Safari 浏览器</li>
                            </ol>
                        </div>
                        <button onclick="location.reload()" style="margin-top: 20px; padding: 12px 24px; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
                            <i class="fas fa-sync"></i> 刷新页面
                        </button>
                    </div>
                `;
            }
            // Keep loading screen visible
            loadingScreen.classList.remove('hidden');
        }
    }
    
    /**
     * Load primary GLB model, fallback to default generated model if failed
     */
    loadPrimaryModel() {
        const glbPath = 'models/qin2019.glb';
        const loadingText = document.getElementById('loading-text');
        
        // Check if running from file:// protocol
        if (window.location.protocol === 'file:') {
            console.warn('Running from file:// protocol. GLB model loading may fail due to browser security restrictions.');
            this.showFileProtocolWarning();
            // Still try to load, but will likely fall back to default model
        }
        
        // Update loading text
        if (loadingText) {
            loadingText.textContent = '正在加载3D模型...';
        }
        
        // Try to load GLB model first
        this.engine.loadGLTFModel(glbPath,
            (object) => {
                // GLB loaded successfully
                console.log('Primary GLB model loaded successfully');
                this.engine.loadCarModel(object);
                
                // Update vehicle color to white since we're loading the white version
                this.dataManager.updateVehicleInfo({ color: 'white' });
                
                if (loadingText) {
                    loadingText.textContent = '模型加载完成';
                }
                
                // Hide loading screen
                setTimeout(() => {
                    document.getElementById('loading-screen')?.classList.add('hidden');
                }, 500);
                
                this.showNotification('已加载高精度3D模型');
            },
            (error) => {
                // GLB failed to load
                console.error('Failed to load primary GLB model:', error);
                
                // Check if it's a file protocol issue
                if (window.location.protocol === 'file:') {
                    this.showFileProtocolWarning();
                }
                
                // Use fallback model
                this.loadFallbackModel();
            }
        );
    }
    
    /**
     * Show warning for file:// protocol usage
     */
    showFileProtocolWarning() {
        const loadingScreen = document.getElementById('loading-screen');
        if (!loadingScreen) return;
        
        const container = loadingScreen.querySelector('.loading-container');
        if (!container) return;
        
        // Check if warning already exists
        let warningDiv = container.querySelector('.file-protocol-warning');
        if (warningDiv) return;
        
        warningDiv = document.createElement('div');
        warningDiv.className = 'file-protocol-warning';
        warningDiv.style.cssText = 'margin-top: 20px; padding: 15px; background: rgba(243, 156, 18, 0.15); border: 1px solid #f39c12; border-radius: 8px; color: #fff; text-align: left; font-size: 13px;';
        
        warningDiv.innerHTML = `
            <div style="color: #f39c12; font-weight: 600; margin-bottom: 10px;">
                <i class="fas fa-exclamation-triangle"></i> 需要使用 HTTP 服务器
            </div>
            <div style="margin-bottom: 10px;">
                当前通过 file:// 协议直接打开文件，浏览器会阻止加载本地模型文件。
            </div>
            <div style="color: #aaa; margin-bottom: 10px;">
                <strong>解决方案（任选其一）：</strong>
            </div>
            <ol style="color: #ccc; padding-left: 20px; line-height: 1.8;">
                <li><strong>VS Code Live Server</strong>（推荐）：安装 Live Server 插件，右键点击 index.html → "Open with Live Server"</li>
                <li><strong>Python 简易服务器：</strong><br>
                    <code style="background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 3px;">cd "byd-qinpro-inspection" && python -m http.server 8080</code><br>
                    然后访问 <code style="background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 3px;">http://localhost:8080</code>
                </li>
                <li><strong>Node.js http-server：</strong><br>
                    <code style="background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 3px;">npx http-server "byd-qinpro-inspection" -p 8080</code>
                </li>
            </ol>
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(243, 156, 18, 0.3); color: #888;">
                系统已自动切换到默认模型，功能仍可正常使用。
            </div>
        `;
        
        container.appendChild(warningDiv);
        
        // Update loading text
        const loadingText = document.getElementById('loading-text');
        if (loadingText) {
            loadingText.textContent = '使用备用模型（需要HTTP服务器加载GLB）';
            loadingText.style.color = '#f39c12';
        }
    }
    
    /**
     * Load fallback default generated model
     */
    loadFallbackModel() {
        const loadingText = document.getElementById('loading-text');
        
        if (loadingText) {
            loadingText.textContent = '正在加载默认模型...';
        }
        
        // Create and load default BYD model
        this.model = new BYDQinProModel();
        const carGroup = this.model.generate();
        this.engine.loadCarModel(carGroup);
        
        if (loadingText) {
            loadingText.textContent = '默认模型加载完成';
        }
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loading-screen')?.classList.add('hidden');
        }, 1000);
        
        this.showNotification('已加载默认模型');
    }
    
    detectAndOptimizeForTablet() {
        // Detect iPad / Tablet - Improved detection for modern iPads
        const userAgent = navigator.userAgent.toLowerCase();
        const isIPadLegacy = /ipad/.test(userAgent);
        const isIPadModern = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
        const isIPad = isIPadLegacy || isIPadModern;
        const isAndroidTablet = /android/.test(userAgent) && !/mobile/.test(userAgent);
        const isTabletSize = window.innerWidth >= 768 && 'ontouchstart' in window;
        const isTablet = isIPad || isAndroidTablet || isTabletSize;
        
        console.log('Tablet detection:', { isIPad, isAndroidTablet, isTablet, width: window.innerWidth });
        
        if (isTablet) {
            document.body.classList.add('tablet-mode');
            
            // Optimize 3D canvas for touch
            const canvas = document.getElementById('main-canvas');
            if (canvas) {
                canvas.style.touchAction = 'none';
            }
            
            // Add touch feedback to buttons
            this.addTouchFeedback();
            
            // Optimize scrolling for touch
            document.querySelectorAll('.sidebar, .issues-list, .paint-points-list').forEach(el => {
                el.style.webkitOverflowScrolling = 'touch';
            });
            
            // Handle orientation change
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    this.handleOrientationChange();
                }, 300);
            });
            
            console.log('iPad/Tablet mode activated');
        }
    }
    
    addTouchFeedback() {
        // Add ripple effect for touch
        const buttons = document.querySelectorAll('.type-btn, .view-btn, .tool-btn, .btn-export, .btn-primary, .btn-secondary');
        buttons.forEach(btn => {
            btn.addEventListener('touchstart', function() {
                this.style.opacity = '0.7';
            }, { passive: true });
            btn.addEventListener('touchend', function() {
                this.style.opacity = '';
            }, { passive: true });
        });
    }
    
    handleOrientationChange() {
        // Refresh 3D canvas size
        if (this.engine && this.engine.renderer) {
            setTimeout(() => {
                const canvas = document.getElementById('main-canvas');
                if (canvas) {
                    const container = canvas.parentElement;
                    this.engine.renderer.setSize(container.clientWidth, container.clientHeight);
                    if (this.engine.camera) {
                        this.engine.camera.aspect = container.clientWidth / container.clientHeight;
                        this.engine.camera.updateProjectionMatrix();
                    }
                }
            }, 300);
        }
    }
    
    setupUI() {
        // Update vehicle info display
        this.updateVehicleInfoDisplay();
        
        // Update inspection summary
        this.updateInspectionSummary();
        
        // Update issues list
        this.updateIssuesList();
        
        // Update hotspot statuses
        this.updateHotspotStatuses();
    }
    
    setupEventListeners() {
        // Role switch
        const roleSwitch = document.getElementById('role-switch');
        if (roleSwitch) {
            roleSwitch.addEventListener('change', (e) => {
                this.toggleMerchantMode(e.target.checked);
            });
        }
        
        // Inspection type buttons
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                this.switchInspectionType(type);
                
                // Update active button
                document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });
        
        // View buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.engine.setCameraView(view);
                
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });
        
        // Point checkboxes
        document.querySelectorAll('.point-item input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateVisibleHotspots();
            });
        });
        
        // Select all / Deselect all
        document.getElementById('btn-select-all-points')?.addEventListener('click', () => {
            document.querySelectorAll('.point-item input[type="checkbox"]').forEach(cb => {
                cb.checked = true;
            });
            this.updateVisibleHotspots();
        });
        
        document.getElementById('btn-deselect-all-points')?.addEventListener('click', () => {
            document.querySelectorAll('.point-item input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
            });
            this.updateVisibleHotspots();
        });
        
        // Toggles
        document.getElementById('wireframe-toggle')?.addEventListener('change', (e) => {
            this.engine.toggleWireframe(e.target.checked);
        });
        
        document.getElementById('autorotate-toggle')?.addEventListener('change', (e) => {
            this.engine.toggleAutoRotate(e.target.checked);
        });
        
        document.getElementById('hotspots-toggle')?.addEventListener('change', (e) => {
            this.engine.toggleHotspots(e.target.checked);
        });
        
        // Export buttons
        document.getElementById('btn-export-word')?.addEventListener('click', () => {
            this.exportWordReport();
        });
        
        document.getElementById('btn-export-pdf')?.addEventListener('click', () => {
            this.exportPDFReport();
        });
        
        // Merchant tools
        document.getElementById('btn-add-issue')?.addEventListener('click', () => {
            this.openAddIssueModal();
        });
        
        document.getElementById('btn-edit-vehicle')?.addEventListener('click', () => {
            this.openVehicleModal();
        });
        
        document.getElementById('btn-load-model')?.addEventListener('click', () => {
            this.openLoadModelModal();
        });
        
        // Model file input change
        document.getElementById('model-file-input')?.addEventListener('change', (e) => {
            this.handleModelFileSelect(e.target.files[0]);
        });
        
        // Confirm load model
        document.getElementById('confirm-load-model')?.addEventListener('click', () => {
            this.loadSelectedModel();
        });
        
        // Cancel load model
        document.getElementById('cancel-load-model')?.addEventListener('click', () => {
            this.selectedModelFile = null;
            this.closeModal('load-model-modal');
        });
        
        document.getElementById('btn-save-data')?.addEventListener('click', () => {
            this.saveData();
        });
        
        document.getElementById('btn-load-data')?.addEventListener('click', () => {
            this.loadData();
        });
        
        document.getElementById('btn-reset-data')?.addEventListener('click', () => {
            this.resetData();
        });
        
        // Modal close buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.currentTarget.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });
        
        // Add issue form
        document.getElementById('add-issue-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveIssue();
        });
        
        document.getElementById('cancel-add-issue')?.addEventListener('click', () => {
            this.resetAddIssueForm();
            this.closeModal('add-issue-modal');
        });
        
        // Vehicle form
        document.getElementById('vehicle-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveVehicleInfo();
        });
        
        document.getElementById('cancel-vehicle-edit')?.addEventListener('click', () => {
            this.closeModal('vehicle-modal');
        });
        
        // Image upload
        this.setupImageUpload();
        
        // Image viewer navigation
        document.getElementById('close-image-viewer')?.addEventListener('click', () => {
            this.closeModal('image-viewer-modal');
        });
        
        document.getElementById('prev-image')?.addEventListener('click', () => {
            this.navigateViewerImage(-1);
        });
        
        document.getElementById('next-image')?.addEventListener('click', () => {
            this.navigateViewerImage(1);
        });
        
        // Close modal on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.active').forEach(modal => {
                    this.closeModal(modal.id);
                });
            }
        });
    }
    
    setupImageUpload() {
        const uploadArea = document.getElementById('image-upload-area');
        const fileInput = document.getElementById('issue-images-input');
        
        if (!uploadArea || !fileInput) return;
        
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = Array.from(e.dataTransfer.files);
            this.handleImageFiles(files);
        });
        
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.handleImageFiles(files);
        });
    }
    
    handleImageFiles(files) {
        const validFiles = files.filter(f => f.type.startsWith('image/'));
        
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.uploadedImages.push({
                    name: file.name,
                    dataUrl: e.target.result
                });
                this.updateUploadedImagesDisplay();
            };
            reader.readAsDataURL(file);
        });
    }
    
    updateUploadedImagesDisplay() {
        const container = document.getElementById('uploaded-images');
        if (!container) return;
        
        container.innerHTML = this.uploadedImages.map((img, index) => `
            <div class="uploaded-image">
                <img src="${img.dataUrl}" alt="${img.name}">
                <button type="button" class="remove-btn" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
        
        // Add remove handlers
        container.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.uploadedImages.splice(index, 1);
                this.updateUploadedImagesDisplay();
            });
        });
    }
    
    toggleMerchantMode(enabled) {
        this.isMerchantMode = enabled;
        document.body.classList.toggle('merchant-mode', enabled);
        
        // Update role labels
        document.querySelectorAll('.role-label').forEach((label, index) => {
            label.classList.toggle('active', 
                (enabled && index === 1) || (!enabled && index === 0)
            );
        });
        
        // Re-render issues list to show/hide edit/delete buttons
        this.updateIssuesList();
        
        this.showNotification(enabled ? '已切换至商家模式' : '已切换至顾客模式');
    }
    
    switchInspectionType(type) {
        this.currentInspectionType = type;
        
        // Show/hide relevant panels
        const paintPanel = document.getElementById('paint-points-panel');
        if (paintPanel) {
            paintPanel.style.display = type === 'paint' ? 'block' : 'none';
        }
        
        // Update hotspot visibility based on type
        if (type === 'paint') {
            this.updateVisibleHotspots();
        } else {
            this.engine.toggleHotspots(false);
        }
    }
    
    updateVisibleHotspots() {
        const checkedBoxes = document.querySelectorAll('.point-item input[type="checkbox"]:checked');
        const visiblePoints = Array.from(checkedBoxes).map(cb => cb.dataset.point);
        this.engine.updateHotspotVisibility(visiblePoints);
    }
    
    updateHotspotStatuses() {
        Object.values(this.dataManager.pointsData).forEach(point => {
            this.engine.updateHotspotStatus(point.id, point.status);
        });
    }
    
    onPointClick(pointId) {
        if (!pointId) {
            this.selectedPointId = null;
            this.updatePointDetails(null);
            // Hide tooltip
            const tooltip = document.getElementById('hotspot-tooltip');
            if (tooltip) tooltip.classList.remove('active');
            return;
        }
        
        this.selectedPointId = pointId;
        const pointData = this.dataManager.getPoint(pointId);
        this.updatePointDetails(pointData);
        
        // Show tooltip on touch devices (iPad)
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouchDevice && pointData) {
            this.showTooltipForTouch(pointId, pointData.name);
        }
        
        // Sync with issues list - highlight and scroll to related issues
        this.highlightIssueInList(pointId);
    }
    
    // Highlight and scroll to issues related to a point in the issues list
    highlightIssueInList(pointId) {
        const container = document.getElementById('issues-list');
        if (!container) return;
        
        // Remove previous highlights
        container.querySelectorAll('.issue-card').forEach(card => {
            card.style.borderColor = '';
            card.style.background = '';
        });
        
        // Find and highlight issues for this point
        const relatedCards = container.querySelectorAll(`.issue-card[data-point-id="${pointId}"]`);
        if (relatedCards.length > 0) {
            relatedCards.forEach(card => {
                card.style.borderColor = '#3498db';
                card.style.background = 'rgba(52, 152, 219, 0.1)';
            });
            
            // Scroll to the first related issue
            relatedCards[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    // Select point from issue list and sync with 3D hotspot
    selectPointAndFocus(pointId) {
        if (!pointId) return;
        
        // Update selected point
        this.selectedPointId = pointId;
        
        // Update point details panel
        const pointData = this.dataManager.getPoint(pointId);
        this.updatePointDetails(pointData);
        
        // Sync with 3D engine - highlight the hotspot
        if (this.engine) {
            // Reset previous selection
            if (this.engine.selectedPoint && this.engine.selectedPoint !== pointId) {
                this.engine.highlightHotspot(this.engine.selectedPoint, false);
            }
            
            // Select and highlight new point
            this.engine.selectedPoint = pointId;
            this.engine.highlightHotspot(pointId, true);
            
            // Focus camera on the hotspot
            const hotspot = this.engine.hotspotMeshes.find(h => h.userData.pointKey === pointId);
            if (hotspot) {
                this.engine.focusOnPoint(hotspot.position);
            }
        }
        
        // Update checkbox in the left panel if exists
        const checkbox = document.querySelector(`.point-item input[data-point="${pointId}"]`);
        if (checkbox) {
            checkbox.checked = true;
            this.updateVisibleHotspots();
        }
    }
    
    onPointHover(pointId, pointName) {
        // Skip hover tooltip on touch devices (iPad, tablets)
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouchDevice) {
            // On iPad, tooltip is shown via click, not hover
            return;
        }
        
        const tooltip = document.getElementById('hotspot-tooltip');
        
        if (!pointId || !tooltip) {
            tooltip?.classList.remove('active');
            return;
        }
        
        const pointData = this.dataManager.getPoint(pointId);
        if (!pointData) return;
        
        // Update tooltip content
        document.getElementById('tooltip-title').textContent = pointName;
        const statusEl = document.getElementById('tooltip-status');
        statusEl.textContent = InspectionDataManager.getStatusLabel(pointData.status);
        statusEl.className = 'tooltip-status ' + pointData.status;
        
        const contentEl = document.getElementById('tooltip-content');
        if (pointData.issues.length > 0) {
            contentEl.innerHTML = `
                发现问题: ${pointData.issues.length}处<br>
                ${pointData.issues.map(i => InspectionDataManager.getIssueTypeLabel(i.type)).join(', ')}
            `;
        } else {
            contentEl.innerHTML = '该部位漆面状况良好，未发现明显问题。';
        }
        
        // Position tooltip near hotspot
        const screenPos = this.engine.getHotspotScreenPosition(pointId);
        if (screenPos) {
            tooltip.style.left = (screenPos.x + 20) + 'px';
            tooltip.style.top = (screenPos.y - 20) + 'px';
            tooltip.classList.add('active');
        }
    }
    
    // Show tooltip for iPad (called on click instead of hover)
    showTooltipForTouch(pointId, pointName) {
        const tooltip = document.getElementById('hotspot-tooltip');
        if (!tooltip || !pointId) return;
        
        const pointData = this.dataManager.getPoint(pointId);
        if (!pointData) return;
        
        // Update tooltip content
        document.getElementById('tooltip-title').textContent = pointName;
        const statusEl = document.getElementById('tooltip-status');
        statusEl.textContent = InspectionDataManager.getStatusLabel(pointData.status);
        statusEl.className = 'tooltip-status ' + pointData.status;
        
        const contentEl = document.getElementById('tooltip-content');
        if (pointData.issues.length > 0) {
            contentEl.innerHTML = `
                发现问题: ${pointData.issues.length}处<br>
                ${pointData.issues.map(i => InspectionDataManager.getIssueTypeLabel(i.type)).join(', ')}
            `;
        } else {
            contentEl.innerHTML = '该部位漆面状况良好，未发现明显问题。';
        }
        
        // Position tooltip near hotspot
        const screenPos = this.engine.getHotspotScreenPosition(pointId);
        if (screenPos) {
            // Keep tooltip within viewport bounds
            const tooltipWidth = 240;
            const tooltipHeight = 100;
            let left = screenPos.x + 20;
            let top = screenPos.y - 20;
            
            // Adjust if too close to right edge
            if (left + tooltipWidth > window.innerWidth) {
                left = screenPos.x - tooltipWidth - 20;
            }
            // Adjust if too close to bottom edge
            if (top + tooltipHeight > window.innerHeight) {
                top = screenPos.y - tooltipHeight - 20;
            }
            
            tooltip.style.left = left + 'px';
            tooltip.style.top = top + 'px';
            tooltip.classList.add('active');
            
            // Auto-hide after 3 seconds on touch devices
            setTimeout(() => {
                tooltip.classList.remove('active');
            }, 3000);
        }
    }
    
    updatePointDetails(pointData) {
        const container = document.getElementById('point-details');
        if (!container) return;
        
        if (!pointData) {
            container.innerHTML = '<p class="hint-text">点击3D模型上的热点查看详情</p>';
            return;
        }
        
        const statusText = InspectionDataManager.getStatusLabel(pointData.status);
        const statusClass = pointData.status;
        
        container.innerHTML = `
            <div class="point-info-card">
                <div class="point-info-header">
                    <span class="point-info-name">${pointData.name}</span>
                    <span class="point-info-status ${statusClass}">${statusText}</span>
                </div>
                <div class="point-info-details">
                    <div class="point-info-row">
                        <span class="point-info-label">漆面厚度</span>
                        <span class="point-info-value">${pointData.thickness.min}-${pointData.thickness.max} ${pointData.thickness.unit}</span>
                    </div>
                    <div class="point-info-row">
                        <span class="point-info-label">发现问题</span>
                        <span class="point-info-value">${pointData.issues.length}处</span>
                    </div>
                    ${pointData.issues.length > 0 ? `
                        <div class="point-info-row" style="margin-top: 10px;">
                            <div style="width: 100%;">
                                ${pointData.issues.map((issue, idx) => `
                                    <div class="issue-card" data-issue-id="${issue.id}" style="margin-bottom: 8px;">
                                        <div class="issue-card-header">
                                            <div class="issue-icon ${issue.severity}">
                                                <i class="fas fa-exclamation-triangle"></i>
                                            </div>
                                            <span class="issue-title">${InspectionDataManager.getIssueTypeLabel(issue.type)}</span>
                                            <span class="issue-severity ${issue.severity}">${InspectionDataManager.getSeverityLabel(issue.severity)}</span>
                                        </div>
                                        <div class="issue-desc">${issue.description}</div>
                                        ${issue.images && issue.images.length > 0 ? `
                                            <div class="issue-images-count">
                                                <i class="fas fa-image"></i> ${issue.images.length}张图片
                                            </div>
                                        ` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Add click handlers to issue cards
        container.querySelectorAll('.issue-card').forEach(card => {
            card.addEventListener('click', () => {
                const issueId = card.dataset.issueId;
                this.showIssueDetail(pointData.id, issueId);
            });
        });
    }
    
    showIssueDetail(pointId, issueId) {
        const point = this.dataManager.getPoint(pointId);
        if (!point) return;
        
        const issue = point.issues.find(i => i.id === issueId);
        if (!issue) return;
        
        // Populate detail modal
        const contentEl = document.getElementById('issue-detail-content');
        const galleryEl = document.getElementById('image-gallery');
        
        contentEl.innerHTML = `
            <div class="issue-detail-header">
                <div class="issue-detail-title">
                    <h4>${InspectionDataManager.getIssueTypeLabel(issue.type)}</h4>
                    <div class="location">${point.name}</div>
                </div>
                <span class="issue-severity ${issue.severity}">${InspectionDataManager.getSeverityLabel(issue.severity)}</span>
            </div>
            <div class="issue-detail-meta">
                <div class="meta-item">
                    <span class="meta-label">问题类型</span>
                    <span class="meta-value">${InspectionDataManager.getIssueTypeLabel(issue.type)}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">严重程度</span>
                    <span class="meta-value">${InspectionDataManager.getSeverityLabel(issue.severity)}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">预估费用</span>
                    <span class="meta-value">¥${issue.cost || 0}</span>
                </div>
            </div>
            <div class="issue-detail-description">
                <h5>问题描述</h5>
                <p>${issue.description}</p>
            </div>
            ${issue.suggestion ? `
                <div class="issue-detail-description" style="margin-top: 12px;">
                    <h5>修复建议</h5>
                    <p>${issue.suggestion}</p>
                </div>
            ` : ''}
        `;
        
        // Populate image gallery
        if (issue.images && issue.images.length > 0) {
            galleryEl.innerHTML = issue.images.map((img, idx) => `
                <div class="gallery-image" data-index="${idx}">
                    <img src="${img.dataUrl}" alt="问题图片 ${idx + 1}">
                </div>
            `).join('');
            
            // Store images for viewer
            this.viewerImages = issue.images;
            
            // Add click handlers
            galleryEl.querySelectorAll('.gallery-image').forEach(img => {
                img.addEventListener('click', () => {
                    const index = parseInt(img.dataset.index);
                    this.openImageViewer(index);
                });
            });
        } else {
            galleryEl.innerHTML = '<p class="hint-text">暂无图片</p>';
            this.viewerImages = [];
        }
        
        this.openModal('issue-detail-modal');
    }
    
    openImageViewer(index) {
        this.currentViewerImageIndex = index;
        this.updateViewerImage();
        this.openModal('image-viewer-modal');
    }
    
    updateViewerImage() {
        const img = document.getElementById('viewer-image');
        const counter = document.getElementById('image-counter');
        
        if (this.viewerImages.length > 0 && this.currentViewerImageIndex >= 0) {
            img.src = this.viewerImages[this.currentViewerImageIndex].dataUrl;
            counter.textContent = `${this.currentViewerImageIndex + 1} / ${this.viewerImages.length}`;
        }
    }
    
    navigateViewerImage(direction) {
        this.currentViewerImageIndex += direction;
        
        if (this.currentViewerImageIndex < 0) {
            this.currentViewerImageIndex = this.viewerImages.length - 1;
        } else if (this.currentViewerImageIndex >= this.viewerImages.length) {
            this.currentViewerImageIndex = 0;
        }
        
        this.updateViewerImage();
    }
    
    updateInspectionSummary() {
        const summary = this.dataManager.getReportSummary();
        
        // Update score ring
        const scoreFill = document.querySelector('.score-fill');
        if (scoreFill) {
            scoreFill.style.setProperty('--score', summary.score);
        }
        
        // Update score number
        document.getElementById('overall-score').textContent = summary.score;
        
        // Update grade
        const gradeEl = document.getElementById('grade-value');
        if (gradeEl) {
            gradeEl.textContent = summary.grade.grade;
            gradeEl.style.background = summary.score >= 80 ? '#2ecc71' : 
                                      summary.score >= 60 ? '#f39c12' : '#e74c3c';
        }
        
        // Update paint score
        const paintScoreEl = document.getElementById('paint-score');
        if (paintScoreEl) {
            paintScoreEl.textContent = summary.score + '分';
            paintScoreEl.className = 'stat-value ' + 
                (summary.score >= 80 ? 'health-good' : 
                 summary.score >= 60 ? 'health-warning' : 'health-danger');
        }
        
        // Update issue count
        document.getElementById('issue-count').textContent = summary.totalIssues + '处';
    }
    
    updateIssuesList() {
        const container = document.getElementById('issues-list');
        if (!container) return;
        
        const issues = this.dataManager.getAllIssues();
        
        if (issues.length === 0) {
            container.innerHTML = '<p class="hint-text">暂无发现问题</p>';
            return;
        }
        
        // Check if we need to preserve highlight after update
        const highlightedPointId = this.selectedPointId;
        
        container.innerHTML = issues.map(issue => `
            <div class="issue-card" data-point-id="${issue.pointId}" data-issue-id="${issue.id}">
                <div class="issue-card-header">
                    <div class="issue-icon ${issue.severity}">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <span class="issue-title">${issue.pointName} - ${InspectionDataManager.getIssueTypeLabel(issue.type)}</span>
                    <span class="issue-severity ${issue.severity}">${InspectionDataManager.getSeverityLabel(issue.severity)}</span>
                </div>
                <div class="issue-desc">${issue.description.substring(0, 60)}${issue.description.length > 60 ? '...' : ''}</div>
                <div class="issue-meta">
                    <span class="issue-cost">¥${issue.cost || 0}</span>
                    ${issue.images && issue.images.length > 0 ? `
                        <span class="issue-images-count">
                            <i class="fas fa-image"></i> ${issue.images.length}
                        </span>
                    ` : ''}
                    ${this.isMerchantMode ? `
                        <div class="issue-actions" style="margin-left: auto; display: flex; gap: 8px;">
                            <button class="btn-edit-issue" data-point-id="${issue.pointId}" data-issue-id="${issue.id}" title="编辑">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-delete-issue" data-point-id="${issue.pointId}" data-issue-id="${issue.id}" title="删除">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
        
        // Add click handlers for viewing issue details
        container.querySelectorAll('.issue-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking on action buttons
                if (e.target.closest('.issue-actions') || e.target.closest('.btn-edit-issue') || e.target.closest('.btn-delete-issue')) {
                    return;
                }
                const pointId = card.dataset.pointId;
                const issueId = card.dataset.issueId;
                
                // Sync with 3D hotspot - select the point on the model
                this.selectPointAndFocus(pointId);
                
                this.showIssueDetail(pointId, issueId);
            });
        });
        
        // Add merchant mode action handlers
        if (this.isMerchantMode) {
            // Edit buttons
            container.querySelectorAll('.btn-edit-issue').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const pointId = btn.dataset.pointId;
                    const issueId = btn.dataset.issueId;
                    this.editIssue(pointId, issueId);
                });
            });
            
            // Delete buttons
            container.querySelectorAll('.btn-delete-issue').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const pointId = btn.dataset.pointId;
                    const issueId = btn.dataset.issueId;
                    this.deleteIssue(pointId, issueId);
                });
            });
        }
        
        // Re-apply highlight if there's a selected point
        if (highlightedPointId) {
            setTimeout(() => {
                this.highlightIssueInList(highlightedPointId);
            }, 100);
        }
    }
    
    updateVehicleInfoDisplay() {
        const info = this.dataManager.getVehicleInfo();
        
        document.getElementById('car-model').textContent = info.model;
        document.getElementById('car-vin').textContent = info.vin;
        document.getElementById('inspection-date').textContent = info.inspectionDate;
    }
    
    updateUI() {
        this.updateVehicleInfoDisplay();
        this.updateInspectionSummary();
        this.updateIssuesList();
        this.updateHotspotStatuses();
    }
    
    // Edit issue
    editIssue(pointId, issueId) {
        const point = this.dataManager.getPoint(pointId);
        if (!point) return;
        
        const issue = point.issues.find(i => i.id === issueId);
        if (!issue) return;
        
        // Populate form with existing data
        document.getElementById('issue-point').value = pointId;
        document.getElementById('issue-type').value = issue.type;
        document.querySelector(`input[name="severity"][value="${issue.severity}"]`).checked = true;
        document.getElementById('issue-description').value = issue.description;
        document.getElementById('issue-suggestion').value = issue.suggestion || '';
        document.getElementById('issue-cost').value = issue.cost || 0;
        
        // Load existing images
        this.uploadedImages = issue.images ? [...issue.images] : [];
        this.updateUploadedImagesDisplay();
        
        // Store editing state
        this.editingIssueId = issueId;
        this.editingPointId = pointId;
        
        // Change form submit handler
        const form = document.getElementById('add-issue-form');
        form.onsubmit = (e) => {
            e.preventDefault();
            this.saveEditedIssue();
        };
        
        // Update modal title
        const modalTitle = document.querySelector('#add-issue-modal .modal-header h3');
        if (modalTitle) {
            modalTitle.innerHTML = '<i class="fas fa-edit"></i> 编辑检测问题';
        }
        
        // Update submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = '保存修改';
        }
        
        this.openModal('add-issue-modal');
    }
    
    // Save edited issue
    saveEditedIssue() {
        const pointId = document.getElementById('issue-point').value;
        const type = document.getElementById('issue-type').value;
        const severity = document.querySelector('input[name="severity"]:checked').value;
        const description = document.getElementById('issue-description').value;
        const suggestion = document.getElementById('issue-suggestion').value;
        const cost = parseInt(document.getElementById('issue-cost').value) || 0;
        
        // Remove old issue first
        if (this.editingPointId && this.editingIssueId) {
            this.dataManager.removeIssue(this.editingPointId, this.editingIssueId);
        }
        
        // Add updated issue
        const issue = {
            pointId,
            type,
            severity,
            description,
            suggestion,
            cost,
            images: [...this.uploadedImages],
            id: this.editingIssueId || Date.now().toString(36) + Math.random().toString(36).substr(2)
        };
        
        this.dataManager.addIssue(issue);
        
        // Reset editing state
        this.editingIssueId = null;
        this.editingPointId = null;
        
        // Restore original form handler
        const form = document.getElementById('add-issue-form');
        form.onsubmit = (e) => {
            e.preventDefault();
            this.saveIssue();
        };
        
        // Update UI
        this.updateUI();
        this.updatePointDetails(this.dataManager.getPoint(pointId));
        this.engine.updateHotspotStatus(pointId, this.dataManager.getPoint(pointId).status);
        
        this.closeModal('add-issue-modal');
        this.showNotification('问题已更新');
        
        // Reset modal title and button
        const modalTitle = document.querySelector('#add-issue-modal .modal-header h3');
        if (modalTitle) {
            modalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> 添加检测问题';
        }
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = '保存问题';
        }
    }
    
    // Delete issue
    deleteIssue(pointId, issueId) {
        if (!confirm('确定要删除这个问题吗？此操作不可撤销。')) {
            return;
        }
        
        this.dataManager.removeIssue(pointId, issueId);
        
        // Update UI
        this.updateUI();
        
        // Update point details if currently viewing
        if (this.selectedPointId === pointId) {
            this.updatePointDetails(this.dataManager.getPoint(pointId));
        }
        
        // Update hotspot status
        this.engine.updateHotspotStatus(pointId, this.dataManager.getPoint(pointId).status);
        
        this.showNotification('问题已删除');
    }
    
    // Reset add issue form
    resetAddIssueForm() {
        const form = document.getElementById('add-issue-form');
        if (form) {
            form.reset();
            form.onsubmit = (e) => {
                e.preventDefault();
                this.saveIssue();
            };
        }
        this.uploadedImages = [];
        this.updateUploadedImagesDisplay();
        
        const modalTitle = document.querySelector('#add-issue-modal .modal-header h3');
        if (modalTitle) {
            modalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> 添加检测问题';
        }
        
        const submitBtn = form?.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = '保存问题';
        }
        
        this.editingIssueId = null;
        this.editingPointId = null;
    }
    
    // Modal functions
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    // Add issue modal
    openAddIssueModal() {
        // Reset form
        this.resetAddIssueForm();
        
        // Pre-select current point if any
        if (this.selectedPointId) {
            document.getElementById('issue-point').value = this.selectedPointId;
        }
        
        this.openModal('add-issue-modal');
    }
    
    saveIssue() {
        const pointId = document.getElementById('issue-point').value;
        const type = document.getElementById('issue-type').value;
        const severity = document.querySelector('input[name="severity"]:checked').value;
        const description = document.getElementById('issue-description').value;
        const suggestion = document.getElementById('issue-suggestion').value;
        const cost = parseInt(document.getElementById('issue-cost').value) || 0;
        
        const issue = {
            pointId,
            type,
            severity,
            description,
            suggestion,
            cost,
            images: [...this.uploadedImages]
        };
        
        this.dataManager.addIssue(issue);
        
        // Update UI
        this.updateUI();
        this.updatePointDetails(this.dataManager.getPoint(pointId));
        this.engine.updateHotspotStatus(pointId, this.dataManager.getPoint(pointId).status);
        
        this.closeModal('add-issue-modal');
        this.showNotification('问题已添加');
    }
    
    // Vehicle modal
    openVehicleModal() {
        const info = this.dataManager.getVehicleInfo();
        
        document.getElementById('vehicle-model-input').value = info.model;
        document.getElementById('vehicle-vin-input').value = info.vin;
        document.getElementById('vehicle-plate-input').value = info.plate;
        document.getElementById('vehicle-mileage-input').value = info.mileage;
        document.getElementById('vehicle-reg-date-input').value = info.regDate;
        document.getElementById('inspection-date-input').value = info.inspectionDate;
        document.getElementById('vehicle-notes-input').value = info.notes;
        
        // Set color radio
        document.querySelector(`input[name="vehicle-color"][value="${info.color}"]`)?.click();
        
        this.openModal('vehicle-modal');
    }
    
    saveVehicleInfo() {
        const info = {
            model: document.getElementById('vehicle-model-input').value,
            vin: document.getElementById('vehicle-vin-input').value,
            plate: document.getElementById('vehicle-plate-input').value,
            mileage: parseInt(document.getElementById('vehicle-mileage-input').value) || 0,
            color: document.querySelector('input[name="vehicle-color"]:checked')?.value || 'red',
            regDate: document.getElementById('vehicle-reg-date-input').value,
            inspectionDate: document.getElementById('inspection-date-input').value,
            notes: document.getElementById('vehicle-notes-input').value
        };
        
        this.dataManager.updateVehicleInfo(info);
        this.updateVehicleInfoDisplay();
        
        // Update model color (only for default generated model)
        const colorMap = {
            red: 0xcc0000,
            white: 0xffffff,
            black: 0x111111,
            silver: 0x888888,
            blue: 0x0033cc
        };
        if (this.model && typeof this.model.updateBodyColor === 'function') {
            this.model.updateBodyColor(colorMap[info.color] || 0xcc0000);
        }
        
        this.closeModal('vehicle-modal');
        this.showNotification('车辆信息已更新');
    }
    
    // Load model modal
    openLoadModelModal() {
        this.selectedModelFile = null;
        
        // Setup drag and drop
        const uploadArea = document.getElementById('model-upload-area');
        if (uploadArea) {
            uploadArea.ondragover = (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            };
            
            uploadArea.ondragleave = () => {
                uploadArea.classList.remove('dragover');
            };
            
            uploadArea.ondrop = (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                
                const file = e.dataTransfer.files[0];
                if (file) {
                    this.handleModelFileSelect(file);
                }
            };
        }
        
        this.openModal('load-model-modal');
    }
    
    // Handle model file selection
    handleModelFileSelect(file) {
        if (!file) return;
        
        // Check file extension
        const validExtensions = ['.fbx', '.glb', '.gltf'];
        const extension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!validExtensions.includes(extension)) {
            this.showNotification('不支持的文件格式，请使用 FBX, GLB 或 GLTF 格式', 'error');
            return;
        }
        
        this.selectedModelFile = file;
        
        // Update UI to show selected file
        const uploadArea = document.getElementById('model-upload-area');
        if (uploadArea) {
            uploadArea.innerHTML = `
                <i class="fas fa-check-circle" style="color: #2ecc71;"></i>
                <p>已选择: ${file.name}</p>
                <span>文件大小: ${(file.size / 1024 / 1024).toFixed(2)} MB</span>
            `;
        }
    }
    
    // Load selected model
    loadSelectedModel() {
        if (!this.selectedModelFile) {
            // No file selected, use default model
            this.showNotification('使用默认模型');
            this.closeModal('load-model-modal');
            return;
        }
        
        const url = URL.createObjectURL(this.selectedModelFile);
        const fileName = this.selectedModelFile.name;
        const extension = fileName.split('.').pop().toLowerCase();
        
        this.showNotification('正在加载模型...');
        
        // Load based on file extension
        const onSuccess = (object) => {
            // Success
            this.engine.loadCarModel(object);
            this.showNotification(`模型 ${fileName} 加载成功`);
            this.closeModal('load-model-modal');
            URL.revokeObjectURL(url);
            
            // Reset upload area
            const uploadArea = document.getElementById('model-upload-area');
            if (uploadArea) {
                uploadArea.innerHTML = `
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>拖拽模型文件到此处</p>
                    <span>支持 FBX, GLB, GLTF 格式</span>
                `;
            }
            this.selectedModelFile = null;
        };
        
        const onError = (error) => {
            // Error
            this.showNotification('模型加载失败: ' + error.message, 'error');
            URL.revokeObjectURL(url);
        };
        
        // Call appropriate loader based on extension
        if (extension === 'fbx') {
            this.engine.loadFBXModel(url, onSuccess, onError);
        } else if (extension === 'glb' || extension === 'gltf') {
            this.engine.loadGLTFModel(url, onSuccess, onError);
        } else {
            onError(new Error(`不支持的文件格式: ${extension}`));
        }
    }
    
    // Export functions
    exportWordReport() {
        const data = {
            vehicleInfo: this.dataManager.getVehicleInfo(),
            pointsData: this.dataManager.getAllPoints(),
            summary: this.dataManager.getReportSummary()
        };
        
        this.reportExporter.downloadWordReport(data);
        this.showNotification('Word报告已导出');
    }
    
    async exportPDFReport() {
        const data = {
            vehicleInfo: this.dataManager.getVehicleInfo(),
            pointsData: this.dataManager.getAllPoints(),
            summary: this.dataManager.getReportSummary()
        };
        
        await this.reportExporter.downloadPDFReport(data);
        this.showNotification('PDF报告已导出');
    }
    
    // Data management
    saveData() {
        const data = this.dataManager.exportData();
        this.reportExporter.downloadJSON(data);
        this.showNotification('检测数据已保存');
    }
    
    loadData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.reportExporter.loadJSONFile(file, (err, data) => {
                    if (err) {
                        this.showNotification('加载失败: ' + err.message, 'error');
                        return;
                    }
                    
                    this.dataManager.importData(data);
                    this.updateUI();
                    this.showNotification('检测数据已加载');
                });
            }
        };
        input.click();
    }
    
    resetData() {
        if (!confirm('确定要重置所有检测数据吗？此操作不可撤销。')) {
            return;
        }
        
        this.dataManager.resetData();
        this.updateUI();
        this.showNotification('数据已重置');
    }
    
    // Notification
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const textEl = document.getElementById('notification-text');
        
        textEl.textContent = message;
        notification.className = 'notification ' + type;
        notification.classList.add('active');
        
        setTimeout(() => {
            notification.classList.remove('active');
        }, 3000);
    }
}

// Initialize app
window.app = new InspectionApp();
