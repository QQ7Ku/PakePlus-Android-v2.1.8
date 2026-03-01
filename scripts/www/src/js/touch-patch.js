/**
 * 快速补丁文件 - 直接引入即可生效
 * 在main.js或app.js最后引入此文件
 * <script src="src/js/touch-patch.js"></script>
 */

(function() {
    'use strict';
    
    // 检查是否是触摸设备
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouchDevice) {
        console.log('[TouchPatch] 非触摸设备，跳过');
        return;
    }
    
    console.log('[TouchPatch] 正在应用触摸优化补丁...');
    
    // ========== 1. 添加CSS优化 ==========
    const styleId = 'touch-patch-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* 消除点击延迟 */
            * {
                touch-action: manipulation;
                -webkit-tap-highlight-color: transparent;
            }
            
            /* Canvas优化 */
            canvas, .canvas-container, #car-canvas {
                touch-action: none !important;
                user-select: none !important;
                -webkit-user-select: none !important;
            }
            
            /* 按钮反馈 */
            button:active, .btn:active {
                transform: scale(0.96);
            }
            
            /* 热点扩展触摸区域 */
            .hotspot, [class*="hotspot"] {
                position: relative;
            }
            
            .hotspot::after, [class*="hotspot"]::after {
                content: '';
                position: absolute;
                top: -15px;
                left: -15px;
                right: -15px;
                bottom: -15px;
            }
        `;
        document.head.appendChild(style);
    }
    
    // ========== 2. 阻止双击缩放 ==========
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(e) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false, capture: true });
    
    // 阻止手势缩放
    document.addEventListener('gesturestart', function(e) { e.preventDefault(); }, { passive: false });
    document.addEventListener('gesturechange', function(e) { e.preventDefault(); }, { passive: false });
    document.addEventListener('gestureend', function(e) { e.preventDefault(); }, { passive: false });
    
    // ========== 3. iOS橡皮筋效果修复 ==========
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    if (isIOS) {
        document.body.addEventListener('touchmove', function(e) {
            if (e.target.tagName === 'CANVAS' || e.target.closest('.canvas-container')) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    // ========== 4. Canvas触摸增强 ==========
    function enhanceCanvasTouch(canvas) {
        if (!canvas || canvas._touchEnhanced) return;
        canvas._touchEnhanced = true;
        
        let touchStart = null;
        let isMoving = false;
        
        canvas.addEventListener('touchstart', function(e) {
            if (e.touches.length === 1) {
                touchStart = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY,
                    time: Date.now()
                };
                isMoving = false;
                e.preventDefault();
            }
        }, { passive: false });
        
        canvas.addEventListener('touchmove', function(e) {
            if (!touchStart) return;
            const touch = e.touches[0];
            const dx = touch.clientX - touchStart.x;
            const dy = touch.clientY - touchStart.y;
            if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                isMoving = true;
            }
        }, { passive: false });
        
        canvas.addEventListener('touchend', function(e) {
            if (!touchStart) return;
            
            const touch = e.changedTouches[0];
            const dx = touch.clientX - touchStart.x;
            const dy = touch.clientY - touchStart.y;
            const dt = Date.now() - touchStart.time;
            
            // 点击检测
            if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && dt < 300 && !isMoving) {
                // 创建点击事件
                const clickEvent = new MouseEvent('click', {
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                    bubbles: true
                });
                
                // 触觉反馈
                if (navigator.vibrate) {
                    navigator.vibrate(30);
                }
                
                // 延迟派发，避免与原生click重复
                setTimeout(() => {
                    e.target.dispatchEvent(clickEvent);
                }, 0);
            }
            
            touchStart = null;
            isMoving = false;
        }, { passive: false });
        
        canvas.addEventListener('touchcancel', function() {
            touchStart = null;
            isMoving = false;
        }, { passive: false });
    }
    
    // 自动增强所有canvas
    document.querySelectorAll('canvas').forEach(enhanceCanvasTouch);
    
    // 监听新canvas
    new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.tagName === 'CANVAS') {
                    enhanceCanvasTouch(node);
                } else if (node.querySelectorAll) {
                    node.querySelectorAll('canvas').forEach(enhanceCanvasTouch);
                }
            });
        });
    }).observe(document.body, { childList: true, subtree: true });
    
    // ========== 5. OrbitControls触摸优化 ==========
    // 如果Three.js已加载，增强OrbitControls
    if (typeof THREE !== 'undefined' && THREE.OrbitControls) {
        const OriginalOrbitControls = THREE.OrbitControls;
        
        THREE.OrbitControls = function(object, domElement) {
            OriginalOrbitControls.call(this, object, domElement);
            
            // 触摸优化配置
            this.touches = {
                ONE: THREE.TOUCH.ROTATE,
                TWO: THREE.TOUCH.DOLLY_PAN
            };
            
            // 根据设备调整
            const isTablet = window.innerWidth >= 768 && 'ontouchstart' in window;
            if (isTablet) {
                this.rotateSpeed = 0.8;
                this.zoomSpeed = 1.2;
                this.enablePan = false;
            }
        };
        
        THREE.OrbitControls.prototype = Object.create(OriginalOrbitControls.prototype);
        THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;
    }
    
    // ========== 6. Raycaster触摸优化 ==========
    // 增强hotspot点击检测
    function patchRaycaster(raycaster) {
        if (!raycaster || raycaster._touchPatched) return;
        raycaster._touchPatched = true;
        
        const isTouchDevice = 'ontouchstart' in window;
        if (isTouchDevice) {
            raycaster.params.Points.threshold = 25;
            raycaster.params.Line.threshold = 25;
        }
    }
    
    // 自动patch已有的raycaster实例
    if (typeof THREE !== 'undefined') {
        // patch场景中的raycaster
        setTimeout(() => {
            if (window.engine3D && window.engine3D.raycaster) {
                patchRaycaster(window.engine3D.raycaster);
            }
            if (window.engine && window.engine.raycaster) {
                patchRaycaster(window.engine.raycaster);
            }
        }, 1000);
    }
    
    console.log('[TouchPatch] 触摸优化补丁已应用 ✓');
})();
