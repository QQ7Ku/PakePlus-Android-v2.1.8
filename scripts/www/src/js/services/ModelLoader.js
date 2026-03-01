/**
 * Model Loader - Loads the qin2019.glb model
 * Only uses external GLB model, no fallback
 */

class ModelLoader {
    constructor(eventBus, engine3D) {
        this.eventBus = eventBus;
        this.engine3D = engine3D;
        this.modelPath = 'models/qin2019.glb';
        this.isLoading = false;
    }

    async init() {
        console.log('🚗 加载车辆模型...');
        
        const loaded = await this.loadModel();
        
        if (!loaded) {
            throw new Error('无法加载车辆模型，请检查 models/qin2019.glb 文件是否存在');
        }
    }

    async loadModel() {
        if (this.isLoading) return false;
        this.isLoading = true;

        try {
            // Check if GLTFLoader is available
            if (!window.THREE || !THREE.GLTFLoader) {
                console.error('GLTFLoader not available');
                this.isLoading = false;
                return false;
            }

            const loader = new THREE.GLTFLoader();
            
            // Try multiple path formats for compatibility
            const pathsToTry = [
                this.modelPath,
                './' + this.modelPath,
                'models/qin2019.glb',
                'qin2019.glb'
            ];

            for (const path of pathsToTry) {
                try {
                    console.log('📂 尝试加载:', path);
                    const gltf = await this.loadGLTF(loader, path);
                    
                    if (gltf && gltf.scene) {
                        console.log('✅ 模型加载成功:', path);
                        this.processModel(gltf.scene);
                        this.isLoading = false;
                        return true;
                    }
                } catch (e) {
                    console.warn('❌ 路径失败:', path);
                }
            }

            this.isLoading = false;
            return false;

        } catch (error) {
            console.error('模型加载错误:', error);
            this.isLoading = false;
            return false;
        }
    }

    loadGLTF(loader, path) {
        return new Promise((resolve, reject) => {
            loader.load(
                path,
                (gltf) => resolve(gltf),
                (progress) => {
                    if (progress.total > 0) {
                        const percent = (progress.loaded / progress.total) * 100;
                        this.eventBus.emit(Events.MODEL_PROGRESS, percent);
                    }
                },
                (error) => reject(error)
            );
        });
    }

    processModel(scene) {
        // Apply optimizations
        scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                
                if (child.material) {
                    child.material.envMapIntensity = 1.0;
                }
            }
        });

        // Get bounding box BEFORE scaling
        const originalBox = new THREE.Box3().setFromObject(scene);
        const originalSize = originalBox.getSize(new THREE.Vector3());
        const originalCenter = originalBox.getCenter(new THREE.Vector3());
        
        console.log('【缩放前】模型尺寸:', originalSize.x.toFixed(3), originalSize.y.toFixed(3), originalSize.z.toFixed(3));
        console.log('【缩放前】模型边界:', 
            'min:', originalBox.min.x.toFixed(2), originalBox.min.y.toFixed(2), originalBox.min.z.toFixed(2),
            'max:', originalBox.max.x.toFixed(2), originalBox.max.y.toFixed(2), originalBox.max.z.toFixed(2)
        );
        
        // Scale to target size (width ~4 units)
        const targetWidth = 4;
        const scale = targetWidth / originalSize.x;
        scene.scale.setScalar(scale);
        
        // Update world matrix after scaling
        scene.updateMatrixWorld(true);
        
        // Get bounding box AFTER scaling
        const scaledBox = new THREE.Box3().setFromObject(scene);
        const scaledSize = scaledBox.getSize(new THREE.Vector3());
        const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
        
        console.log('【缩放后】模型尺寸:', scaledSize.x.toFixed(3), scaledSize.y.toFixed(3), scaledSize.z.toFixed(3));
        console.log('【缩放后】模型边界:', 
            'min:', scaledBox.min.x.toFixed(2), scaledBox.min.y.toFixed(2), scaledBox.min.z.toFixed(2),
            'max:', scaledBox.max.x.toFixed(2), scaledBox.max.y.toFixed(2), scaledBox.max.z.toFixed(2)
        );
        
        // Reset position
        scene.position.set(0, 0, 0);
        
        // Center X and Z
        scene.position.x = -scaledCenter.x;
        scene.position.z = -scaledCenter.z;
        
        // Position Y so bottom touches ground (with small offset to prevent z-fighting)
        const zFightOffset = 0.01;
        scene.position.y = -scaledBox.min.y + zFightOffset;

        console.log('【最终】模型位置:', scene.position.x.toFixed(3), scene.position.y.toFixed(3), scene.position.z.toFixed(3));
        console.log('【验证】模型底部 Y:', (scaledBox.min.y + scene.position.y).toFixed(3), '(应该接近 0.01)');

        this.engine3D.loadModel(scene);
        console.log('✅ 车辆模型已加载');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModelLoader };
} else {
    window.ModelLoader = ModelLoader;
}
