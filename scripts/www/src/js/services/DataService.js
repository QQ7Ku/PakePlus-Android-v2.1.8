/**
 * Data Service - Business Logic
 * Fixes: Data validation, status calculation, caching
 */

class DataService {
    // 图片压缩相关配置常量
    static IMAGE_CONFIG = {
        // 允许的图片格式（MIME types）
        ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        // 最大文件大小限制（10MB）
        MAX_FILE_SIZE: 10 * 1024 * 1024,
        // 缩略图最大尺寸（200px）
        THUMBNAIL_MAX_SIZE: 200,
        // 图片压缩质量（0-1）
        COMPRESSION_QUALITY: 0.8,
        // Base64数据URL前缀验证正则
        BASE64_PATTERN: /^data:image\/(jpeg|png|webp|gif);base64,/
    };

    constructor(eventBus, store) {
        this.eventBus = eventBus;
        this.store = store;
        
        // Initialize default data
        this.initDefaultData();
        
        // Subscribe to store changes
        this.store.subscribe((state, prevState, action) => {
            this.onStateChange(state, prevState, action);
        });
    }

    initDefaultData() {
        // Create default points from config
        const points = {};
        
        Constants.INSPECTION_POINTS_CONFIG.forEach(config => {
            points[config.id] = {
                id: config.id,
                name: config.name,
                category: config.category,
                subCategory: config.subCategory,
                location: config.location,
                inspectionOrder: config.order,
                status: 'good',
                issues: [],
                
                // Paint specific
                ...(config.category === 'paint' && {
                    thickness: { ...Constants.PAINT_THICKNESS }
                }),
                
                // Structure specific
                ...(config.category === 'structure' && {
                    judgment: 'normal'
                })
            };
        });
        
        this.store.dispatch({ type: 'DATA/SET_POINTS', payload: points });
        this.store.dispatch({
            type: 'DATA/SET_VEHICLE_INFO',
            payload: {
                ...Constants.DEFAULT_VEHICLE_INFO,
                inspectionDate: new Date().toISOString().split('T')[0]
            }
        });
    }

    // Getters
    getPoint(pointId) {
        return this.store.state.data.points[pointId] || null;
    }

    getAllPoints() {
        return this.store.state.data.points;
    }

    getPointsByCategory(category) {
        return Object.values(this.store.state.data.points)
            .filter(p => p.category === category);
    }

    getPointsByOrder() {
        return Object.values(this.store.state.data.points)
            .filter(p => p.inspectionOrder)
            .sort((a, b) => a.inspectionOrder - b.inspectionOrder);
    }

    getCurrentFlowPoint() {
        const state = this.store.state;
        if (!state.flow.isActive || state.flow.currentStep === 0) return null;
        
        const points = this.getPointsByOrder();
        return points[state.flow.currentStep - 1] || null;
    }

    /**
     * 验证图片数据
     * @param {Array} images - 图片数组
     * @returns {Object} - 验证结果 { valid: boolean, errors: string[], validImages: Array }
     */
    validateImages(images) {
        const errors = [];
        const validImages = [];

        if (!Array.isArray(images)) {
            return { valid: true, errors: [], validImages: [] };
        }

        images.forEach((image, index) => {
            // 验证必填字段
            if (!image.id || typeof image.id !== 'string') {
                errors.push(`图片[${index}]: 缺少或无效的id字段`);
                return;
            }

            // 验证dataUrl格式
            if (!image.dataUrl || typeof image.dataUrl !== 'string') {
                errors.push(`图片[${index}]: 缺少或无效的dataUrl字段`);
                return;
            }

            // 验证Base64格式
            if (!DataService.IMAGE_CONFIG.BASE64_PATTERN.test(image.dataUrl)) {
                errors.push(`图片[${index}]: dataUrl格式无效，必须是有效的base64图片数据`);
                return;
            }

            // 验证图片类型
            if (image.type && !DataService.IMAGE_CONFIG.ALLOWED_TYPES.includes(image.type)) {
                errors.push(`图片[${index}]: 不支持的图片格式 "${image.type}"，允许的格式: ${DataService.IMAGE_CONFIG.ALLOWED_TYPES.join(', ')}`);
                return;
            }

            // 验证文件大小
            if (image.size !== undefined) {
                if (typeof image.size !== 'number' || image.size < 0) {
                    errors.push(`图片[${index}]: size字段必须是正整数`);
                    return;
                }
                if (image.size > DataService.IMAGE_CONFIG.MAX_FILE_SIZE) {
                    errors.push(`图片[${index}]: 图片大小 ${(image.size / 1024 / 1024).toFixed(2)}MB 超过最大限制 ${(DataService.IMAGE_CONFIG.MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB`);
                    return;
                }
            }

            // 验证缩略图（如果存在）
            if (image.thumbnail !== undefined) {
                if (typeof image.thumbnail !== 'string') {
                    errors.push(`图片[${index}]: thumbnail字段必须是字符串`);
                    return;
                }
                if (image.thumbnail && !DataService.IMAGE_CONFIG.BASE64_PATTERN.test(image.thumbnail)) {
                    errors.push(`图片[${index}]: thumbnail格式无效`);
                    return;
                }
            }

            // 验证name字段
            if (image.name !== undefined && typeof image.name !== 'string') {
                errors.push(`图片[${index}]: name字段必须是字符串`);
                return;
            }

            // 验证createdAt字段
            if (image.createdAt !== undefined) {
                const date = new Date(image.createdAt);
                if (isNaN(date.getTime())) {
                    errors.push(`图片[${index}]: createdAt字段必须是有效的ISO日期字符串`);
                    return;
                }
            }

            // 图片数据有效，添加到有效数组
            validImages.push({
                id: image.id,
                dataUrl: image.dataUrl,
                thumbnail: image.thumbnail || null,
                name: image.name || '',
                size: image.size || 0,
                type: image.type || 'image/jpeg',
                createdAt: image.createdAt || new Date().toISOString()
            });
        });

        return {
            valid: errors.length === 0,
            errors,
            validImages
        };
    }

    // Issue Management
    addIssue(issueData) {
        console.log('📝 DataService.addIssue called:', issueData);
        const { pointId, type, severity, description = '', suggestion = '', cost = 0, images = [] } = issueData;
        
        // Validation - 描述在severity为normal时可选
        if (!pointId || !type || !severity) {
            console.error('Invalid issue data:', issueData);
            return null;
        }
        
        // 非normal级别必须填写描述
        if (severity !== 'normal' && !description.trim()) {
            console.error('Description required for non-normal severity');
            return null;
        }
        
        const point = this.getPoint(pointId);
        if (!point) {
            console.error('Point not found:', pointId);
            return null;
        }

        // Handle "normal" type - clear all issues
        if (type === 'normal') {
            return this.markPointAsNormal(pointId);
        }

        // 验证图片数据
        const imageValidation = this.validateImages(images);
        if (!imageValidation.valid) {
            console.warn('Image validation warnings:', imageValidation.errors);
        }

        const issue = {
            id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            severity,
            description: description.trim(),
            suggestion: suggestion.trim(),
            cost: severity === 'normal' ? 0 : (parseInt(cost) || 0),
            images: imageValidation.validImages,
            createdAt: new Date().toISOString()
        };

        // Update point
        const updatedPoint = {
            ...point,
            issues: [...point.issues, issue]
        };
        
        // Recalculate status
        updatedPoint.status = this.calculatePointStatus(updatedPoint);
        
        // Update store
        this.updatePoint(updatedPoint);
        
        // Emit event - 添加调试
        console.log('📝 Emitting ISSUE_ADDED event for point:', pointId, 'status:', updatedPoint.status);
        this.eventBus.emit(Events.ISSUE_ADDED, issue, updatedPoint);
        console.log('✅ Issue saved successfully:', issue.id);
        
        return issue;
    }

    updateIssue(pointId, issueId, updates) {
        const point = this.getPoint(pointId);
        if (!point) return false;

        const issueIndex = point.issues.findIndex(i => i.id === issueId);
        if (issueIndex === -1) return false;

        // 如果更新中包含images字段，进行验证
        let validatedUpdates = { ...updates };
        if (updates.images !== undefined) {
            const imageValidation = this.validateImages(updates.images);
            if (!imageValidation.valid) {
                console.warn('Image validation warnings in update:', imageValidation.errors);
            }
            validatedUpdates.images = imageValidation.validImages;
        }

        const updatedIssues = [...point.issues];
        updatedIssues[issueIndex] = {
            ...updatedIssues[issueIndex],
            ...validatedUpdates,
            updatedAt: new Date().toISOString()
        };

        const updatedPoint = {
            ...point,
            issues: updatedIssues
        };
        
        updatedPoint.status = this.calculatePointStatus(updatedPoint);
        this.updatePoint(updatedPoint);
        
        this.eventBus.emit(Events.ISSUE_UPDATED, updatedIssues[issueIndex], updatedPoint);
        return true;
    }

    removeIssue(pointId, issueId) {
        const point = this.getPoint(pointId);
        if (!point) return false;

        const issueIndex = point.issues.findIndex(i => i.id === issueId);
        if (issueIndex === -1) return false;

        const removed = point.issues[issueIndex];
        const updatedIssues = point.issues.filter(i => i.id !== issueId);

        const updatedPoint = {
            ...point,
            issues: updatedIssues
        };
        
        updatedPoint.status = this.calculatePointStatus(updatedPoint);
        this.updatePoint(updatedPoint);
        
        this.eventBus.emit(Events.ISSUE_DELETED, removed, updatedPoint);
        return true;
    }

    markPointAsNormal(pointId) {
        const point = this.getPoint(pointId);
        if (!point) return false;

        const updatedPoint = {
            ...point,
            issues: [],
            status: 'good'
        };

        if (point.category === 'structure') {
            updatedPoint.judgment = 'normal';
        }

        this.updatePoint(updatedPoint);
        
        this.eventBus.emit(Events.ISSUE_DELETED, { type: 'normal' }, updatedPoint);
        return true;
    }

    // Structure Judgment
    setStructureJudgment(pointId, judgment) {
        const point = this.getPoint(pointId);
        if (!point || point.category !== 'structure') {
            console.error('Invalid structure point:', pointId);
            return false;
        }

        if (!['normal', 'abnormal', 'repaired'].includes(judgment)) {
            console.error('Invalid judgment:', judgment);
            return false;
        }

        const status = judgment === 'normal' ? 'good' :
                      judgment === 'abnormal' ? 'warning' : 'danger';

        const updatedPoint = {
            ...point,
            judgment,
            status
        };

        this.updatePoint(updatedPoint);
        this.eventBus.emit(Events.POINT_STATUS_CHANGED, updatedPoint);
        
        return true;
    }

    // Status calculation
    calculatePointStatus(point) {
        // 如果没有问题，返回good状态
        if (!point.issues || point.issues.length === 0) {
            return 'good';
        }

        // 根据问题的严重程度计算状态
        // 带图片的问题也会根据severity被正确处理
        const hasSevere = point.issues.some(i => i.severity === 'severe');
        const hasModerate = point.issues.some(i => i.severity === 'moderate');

        return hasSevere ? 'danger' : hasModerate ? 'warning' : 'good';
    }

    updatePoint(updatedPoint) {
        const points = {
            ...this.store.state.data.points,
            [updatedPoint.id]: updatedPoint
        };
        this.store.dispatch({ type: 'DATA/SET_POINTS', payload: points });
    }

    // Vehicle Info
    getVehicleInfo() {
        return this.store.state.data.vehicleInfo;
    }

    updateVehicleInfo(info) {
        const current = this.store.state.data.vehicleInfo;
        this.store.dispatch({
            type: 'DATA/SET_VEHICLE_INFO',
            payload: { ...current, ...info }
        });
        this.eventBus.emit(Events.DATA_SAVED);
    }

    // Import/Export
    exportData() {
        return {
            version: '2.0',
            exportDate: new Date().toISOString(),
            vehicleInfo: this.store.state.data.vehicleInfo,
            points: this.store.state.data.points
        };
    }

    importData(data) {
        if (!data || !data.points) {
            console.error('Invalid import data');
            return false;
        }

        // Merge with defaults to ensure all fields exist
        const mergedPoints = {};
        const defaultPoints = this.getAllPoints();
        
        Object.keys(defaultPoints).forEach(key => {
            if (data.points[key]) {
                mergedPoints[key] = {
                    ...defaultPoints[key],  // Default values
                    ...data.points[key],     // Imported values
                    // Preserve critical metadata
                    id: defaultPoints[key].id,
                    name: defaultPoints[key].name,
                    category: defaultPoints[key].category,
                    inspectionOrder: defaultPoints[key].inspectionOrder
                };
            } else {
                mergedPoints[key] = defaultPoints[key];
            }
        });

        this.store.dispatch({ type: 'DATA/SET_POINTS', payload: mergedPoints });
        
        if (data.vehicleInfo) {
            this.store.dispatch({
                type: 'DATA/SET_VEHICLE_INFO',
                payload: { ...Constants.DEFAULT_VEHICLE_INFO, ...data.vehicleInfo }
            });
        }

        this.eventBus.emit(Events.DATA_LOADED);
        return true;
    }

    resetData() {
        this.initDefaultData();
        this.eventBus.emit(Events.DATA_RESET);
    }

    // State change handler
    onStateChange(state, prevState, action) {
        // Handle side effects if needed
    }

    // Static label getters
    static getIssueTypeLabel(type) {
        return Constants.ISSUE_TYPES[type]?.label || type;
    }

    static getSeverityLabel(severity) {
        const labels = {
            normal: '正常',
            minor: '轻微',
            moderate: '中等',
            severe: '严重'
        };
        return Constants.SEVERITY_LEVELS[severity]?.label || labels[severity] || severity;
    }

    static getStatusLabel(status) {
        return Constants.STATUS_TYPES[status]?.label || status;
    }

    static getJudgmentLabel(judgment) {
        return Constants.STRUCTURE_JUDGMENTS[judgment]?.label || judgment;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DataService };
} else {
    window.DataService = DataService;
}
