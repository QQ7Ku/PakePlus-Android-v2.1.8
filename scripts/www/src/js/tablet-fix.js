/**
 * Tablet/iPad Compatibility Fixes
 * 解决平板设备上的加载和交互问题
 */

// 1. WebGL 上下文检测和修复
function checkWebGLSupport() {
    const canvas = document.createElement('canvas');
    let gl = null;
    
    try {
        gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    } catch (e) {
        console.warn('WebGL not supported:', e);
        return false;
    }
    
    if (!gl) {
        console.warn('WebGL context creation failed');
        return false;
    }
    
    // 检查 WebGL 扩展支持
    const extensions = gl.getSupportedExtensions();
    console.log('WebGL extensions:', extensions);
    
    return true;
}

// 2. iOS Safari 特定修复
function iOSFixes() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    if (isIOS) {
        // 防止 iOS 橡皮筋效果
        document.body.addEventListener('touchmove', function(e) {
            if (e.target === document.body || e.target.tagName === 'CANVAS') {
                e.preventDefault();
            }
        }, { passive: false });
        
        // 修复 iOS 双击缩放
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(e) {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // 强制重绘修复 iOS 渲染问题
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                window.dispatchEvent(new Event('resize'));
            }
        });
    }
    
    return isIOS;
}

// 3. Android 平板特定修复
function androidFixes() {
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isAndroid) {
        // Android Chrome 有时需要强制硬件加速
        document.body.style.transform = 'translateZ(0)';
        
        // 修复 Android 上的触摸延迟
        document.addEventListener('touchstart', function() {}, {passive: true});
    }
    
    return isAndroid;
}

// 4. 检测平板设备
function detectTablet() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIPad = /ipad/.test(userAgent) || 
                   (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroidTablet = /android/.test(userAgent) && !/mobile/.test(userAgent);
    const isTabletSize = window.innerWidth >= 768 && 'ontouchstart' in window;
    
    return isIPad || isAndroidTablet || isTabletSize;
}

// 5. 初始化所有修复
function initTabletFixes() {
    console.log('Initializing tablet fixes...');
    
    const isTablet = detectTablet();
    const isIOS = iOSFixes();
    const isAndroid = androidFixes();
    
    console.log('Device detection:', { isTablet, isIOS, isAndroid });
    
    // 检查 WebGL 支持
    if (!checkWebGLSupport()) {
        console.error('WebGL not supported on this device');
        showWebGLError();
        return false;
    }
    
    // 应用 CSS 类
    if (isTablet) {
        document.body.classList.add('tablet-device');
    }
    if (isIOS) {
        document.body.classList.add('ios-device');
    }
    if (isAndroid) {
        document.body.classList.add('android-device');
    }
    
    return true;
}

// 6. 显示 WebGL 错误信息
function showWebGLError() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        const container = loadingScreen.querySelector('.loading-container');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #f39c12; margin-bottom: 20px;"></i>
                    <h2 style="color: #fff; margin-bottom: 15px;">3D 功能不可用</h2>
                    <p style="color: #aaa; margin-bottom: 20px;">
                        您的设备或浏览器不支持 WebGL，无法显示 3D 模型。<br>
                        请尝试以下解决方案：
                    </p>
                    <ul style="color: #888; text-align: left; display: inline-block; line-height: 1.8;">
                        <li>更新浏览器到最新版本</li>
                        <li>尝试使用 Chrome 或 Safari 浏览器</li>
                        <li>检查设备是否开启了"省电模式"</li>
                        <li>在设置中启用 WebGL 支持</li>
                    </ul>
                </div>
            `;
        }
    }
}

// 7. 等待 DOM 加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTabletFixes);
} else {
    initTabletFixes();
}

// 导出供其他模块使用
window.TabletFixes = {
    checkWebGLSupport,
    detectTablet,
    isIOS: () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
    isAndroid: () => /Android/.test(navigator.userAgent)
};
