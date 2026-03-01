/**
 * 设备性能检测与分级系统
 */

(function() {
    'use strict';

    class DevicePerformanceDetector {
        constructor() {
            this.tier = null;
            this.capabilities = null;
            this.batteryLevel = null;
            this.isCharging = null;
            this.init();
        }

        init() {
            // 检测性能等级
            this.detectTier();
            
            // 监听电池状态
            this.monitorBattery();
            
            // 添加设备类名
            this.addDeviceClasses();
            
            console.log('📱 Device Performance Detector initialized:', this.tier);
        }

        detectTier() {
            // 尝试从缓存读取
            try {
                const cached = sessionStorage.getItem('devicePerformanceTier');
                if (cached) {
                    this.tier = cached;
                    return this.tier;
                }
            } catch (e) {}

            let score = 0;
            const checks = {
                hardwareConcurrency: navigator.hardwareConcurrency || 4,
                deviceMemory: navigator.deviceMemory || 4,
                isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                isLowEndAndroid: this.isLowEndAndroid(),
                pixelRatio: window.devicePixelRatio || 1
            };

            // 计算分数
            score += Math.min(checks.hardwareConcurrency * 10, 80);
            score += Math.min(checks.deviceMemory * 15, 60);
            
            if (checks.isMobile) score -= 20;
            if (checks.isLowEndAndroid) score -= 30;
            if (checks.pixelRatio > 2) score -= 10;
            if (checks.pixelRatio > 3) score -= 20;

            // 根据分数分级
            if (score >= 80) {
                this.tier = 'high';
            } else if (score >= 50) {
                this.tier = 'medium';
            } else {
                this.tier = 'low';
            }

            // 缓存结果
            try {
                sessionStorage.setItem('devicePerformanceTier', this.tier);
            } catch (e) {}

            this.capabilities = checks;
            return this.tier;
        }

        isLowEndAndroid() {
            const ua = navigator.userAgent;
            if (!/Android/.test(ua)) return false;
            
            const androidVersion = parseFloat(ua.match(/Android\s+([\d.]+)/)?.[1] || '9');
            const isOldAndroid = androidVersion < 8;
            
            const lowEndChips = /(MT6[0-9]{3}|SC98[0-9]{2}|MSM8[0-9]{3}|Snapdragon 4[0-9]{2})/i;
            const hasLowEndChip = lowEndChips.test(ua);
            
            return isOldAndroid || hasLowEndChip;
        }

        getOptimizationConfig() {
            const tier = this.tier || this.detectTier();
            
            const configs = {
                high: {
                    pixelRatio: Math.min(window.devicePixelRatio, 2.5),
                    antialias: true,
                    shadows: { enabled: true, mapSize: 2048 },
                    maxLights: 5,
                    hotspotSegments: 32,
                    frameRate: 60,
                    fog: true
                },
                medium: {
                    pixelRatio: Math.min(window.devicePixelRatio, 2),
                    antialias: true,
                    shadows: { enabled: true, mapSize: 1024 },
                    maxLights: 3,
                    hotspotSegments: 24,
                    frameRate: 60,
                    fog: true
                },
                low: {
                    pixelRatio: Math.min(window.devicePixelRatio, 1.5),
                    antialias: false,
                    shadows: { enabled: false, mapSize: 512 },
                    maxLights: 2,
                    hotspotSegments: 16,
                    frameRate: 30,
                    fog: false
                }
            };

            return configs[tier];
        }

        async monitorBattery() {
            if ('getBattery' in navigator) {
                try {
                    const battery = await navigator.getBattery();
                    this.batteryLevel = battery.level;
                    this.isCharging = battery.charging;

                    battery.addEventListener('levelchange', () => {
                        this.batteryLevel = battery.level;
                        this.adjustForBattery();
                    });

                    battery.addEventListener('chargingchange', () => {
                        this.isCharging = battery.charging;
                        this.adjustForBattery();
                    });
                } catch (e) {
                    console.warn('Battery API not available');
                }
            }
        }

        adjustForBattery() {
            if (this.batteryLevel < 0.2 && !this.isCharging) {
                console.warn('Low battery detected, downgrading performance');
                this.tier = 'low';
                document.body.classList.add('low-power-mode');
                
                // 触发性能降级事件
                window.dispatchEvent(new CustomEvent('performance:degraded', { 
                    detail: { reason: 'low_battery' } 
                }));
            }
        }

        addDeviceClasses() {
            document.body.classList.add(`perf-tier-${this.tier}`);
            
            if (this.capabilities) {
                if (this.capabilities.isMobile) {
                    document.body.classList.add('device-mobile');
                }
                if (this.capabilities.isLowEndAndroid) {
                    document.body.classList.add('device-low-end');
                }
            }
        }

        getTier() {
            return this.tier || this.detectTier();
        }
    }

    // 创建全局实例
    window.DevicePerformanceDetector = new DevicePerformanceDetector();
})();
