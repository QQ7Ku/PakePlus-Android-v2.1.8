/**
 * 触摸交互修复模块
 * 解决移动端触摸相关问题
 */

(function() {
    'use strict';

    console.log('🔧 Touch interaction fix loaded');

    // 1. 消除300ms点击延迟
    document.addEventListener('touchstart', function() {}, {passive: true});

    // 2. 阻止双击缩放
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, {passive: false});

    // 3. iOS橡皮筋效果修复
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    if (isIOS) {
        document.body.addEventListener('touchmove', function(e) {
            if (e.target.closest('.canvas-container')) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    // 4. 为3D画布添加触摸优化
    const canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer) {
        // 防止触摸时的默认行为
        canvasContainer.addEventListener('touchstart', function(e) {
            // 单指触摸时不阻止（允许旋转）
            // 双指触摸时阻止（允许缩放）
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });

        // 触摸反馈
        canvasContainer.addEventListener('touchstart', function() {
            canvasContainer.style.cursor = 'grabbing';
        }, { passive: true });

        canvasContainer.addEventListener('touchend', function() {
            canvasContainer.style.cursor = 'grab';
        }, { passive: true });
    }

    // 5. 热点触摸区域扩大
    const expandHotspotTouchArea = function() {
        const style = document.createElement('style');
        style.textContent = `
            /* 扩大热点的CSS触摸区域 */
            .hotspot-marker::after {
                content: '';
                position: absolute;
                top: -20px;
                left: -20px;
                right: -20px;
                bottom: -20px;
                z-index: -1;
            }
        `;
        document.head.appendChild(style);
    };

    // 6. 添加触摸反馈效果
    const addTouchFeedback = function() {
        const touchElements = document.querySelectorAll('.btn, .type-btn, .view-btn, .issue-card');
        
        touchElements.forEach(el => {
            el.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.96)';
                this.style.opacity = '0.8';
            }, { passive: true });

            el.addEventListener('touchend', function() {
                this.style.transform = '';
                this.style.opacity = '';
            }, { passive: true });
        });
    };

    // 7. 处理触摸和鼠标事件冲突
    const handleTouchMouseConflict = function() {
        let isTouch = false;

        document.addEventListener('touchstart', function() {
            isTouch = true;
            document.body.classList.add('is-touching');
        }, { passive: true });

        document.addEventListener('touchend', function() {
            setTimeout(() => {
                isTouch = false;
                document.body.classList.remove('is-touching');
            }, 100);
        }, { passive: true });

        // 鼠标事件在触摸后忽略
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            if (type === 'mouseenter' || type === 'mouseleave') {
                const wrappedListener = function(e) {
                    if (!isTouch) {
                        listener.call(this, e);
                    }
                };
                return originalAddEventListener.call(this, type, wrappedListener, options);
            }
            return originalAddEventListener.call(this, type, listener, options);
        };
    };

    // 8. 检测并添加设备类名
    const detectDevice = function() {
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        const isTouch = window.matchMedia('(pointer: coarse)').matches;
        const isLandscape = window.matchMedia('(orientation: landscape)').matches;

        if (isMobile) document.body.classList.add('is-mobile');
        if (isTouch) document.body.classList.add('is-touch');
        if (isLandscape) document.body.classList.add('is-landscape');

        // 监听变化
        window.matchMedia('(max-width: 768px)').addEventListener('change', (e) => {
            document.body.classList.toggle('is-mobile', e.matches);
        });

        window.matchMedia('(orientation: landscape)').addEventListener('change', (e) => {
            document.body.classList.toggle('is-landscape', e.matches);
        });
    };

    // 9. 添加触摸调试信息（开发用）
    const addTouchDebug = function() {
        if (location.hash !== '#touch-debug') return;

        const debugInfo = document.createElement('div');
        debugInfo.id = 'touch-debug-info';
        debugInfo.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            background: rgba(0,0,0,0.8);
            color: #0f0;
            padding: 10px;
            font-family: monospace;
            font-size: 12px;
            z-index: 9999;
            border-radius: 4px;
        `;
        document.body.appendChild(debugInfo);

        let touchCount = 0;
        document.addEventListener('touchstart', (e) => {
            touchCount = e.touches.length;
            updateDebug();
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            touchCount = e.touches.length;
            updateDebug();
        }, { passive: true });

        const updateDebug = () => {
            debugInfo.innerHTML = `
                Touch count: ${touchCount}<br>
                Is mobile: ${document.body.classList.contains('is-mobile')}<br>
                Is touch: ${document.body.classList.contains('is-touch')}<br>
                Is landscape: ${document.body.classList.contains('is-landscape')}<br>
                Screen: ${window.innerWidth}x${window.innerHeight}
            `;
        };

        updateDebug();
    };

    // 初始化
    document.addEventListener('DOMContentLoaded', function() {
        expandHotspotTouchArea();
        addTouchFeedback();
        handleTouchMouseConflict();
        detectDevice();
        addTouchDebug();
        
        console.log('✅ Touch interaction fix initialized');
    });

    // 导出全局对象
    window.TouchInteractionFix = {
        isTouchDevice: () => window.matchMedia('(pointer: coarse)').matches,
        isMobile: () => window.matchMedia('(max-width: 768px)').matches
    };
})();
