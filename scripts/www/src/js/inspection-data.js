/**
 * Inspection Data Manager
 * Manages all inspection data, issues, and report generation
 */

class InspectionDataManager {
    constructor() {
        // Default inspection points data
        // 只保留ABC柱6个漆面检测点
        this.defaultPointsData = {
            leftAPillar: {
                id: 'leftAPillar',
                name: '左A柱漆面',
                category: 'paint',
                location: 'left',
                inspectionOrder: 13,
                status: 'good',
                thickness: { min: 130, max: 200, unit: 'μm' },
                issues: [],
                description: '左A柱漆面检测'
            },
            rightAPillar: {
                id: 'rightAPillar',
                name: '右A柱漆面',
                category: 'paint',
                location: 'right',
                inspectionOrder: 4,
                status: 'good',
                thickness: { min: 130, max: 200, unit: 'μm' },
                issues: [],
                description: '右A柱漆面检测'
            },
            leftBPillar: {
                id: 'leftBPillar',
                name: '左B柱漆面',
                category: 'paint',
                location: 'left',
                inspectionOrder: 15,
                status: 'good',
                thickness: { min: 130, max: 200, unit: 'μm' },
                issues: [],
                description: '左B柱漆面检测'
            },
            rightBPillar: {
                id: 'rightBPillar',
                name: '右B柱漆面',
                category: 'paint',
                location: 'right',
                inspectionOrder: 6,
                status: 'good',
                thickness: { min: 130, max: 200, unit: 'μm' },
                issues: [],
                description: '右B柱漆面检测'
            },
            leftCPillar: {
                id: 'leftCPillar',
                name: '左C柱漆面',
                category: 'paint',
                location: 'left',
                inspectionOrder: 17,
                status: 'good',
                thickness: { min: 130, max: 200, unit: 'μm' },
                issues: [],
                description: '左C柱漆面检测'
            },
            rightCPillar: {
                id: 'rightCPillar',
                name: '右C柱漆面',
                category: 'paint',
                location: 'right',
                inspectionOrder: 8,
                status: 'good',
                thickness: { min: 130, max: 200, unit: 'μm' },
                issues: [],
                description: '右C柱漆面检测'
            },
            // ===== 结构检测点（按检测顺序排列）=====
            vehicleSymmetry: {
                id: 'vehicleSymmetry',
                name: '车辆对称性检测',
                category: 'structure',
                subCategory: 'symmetry',
                location: 'overall',
                inspectionOrder: 1,
                status: 'good',
                judgmentCriteria: ['normal', 'abnormal', 'repaired'],
                issues: [],
                description: '检查车身左右对称性，对比左右缝隙、线条是否一致'
            },
            frontFrameRails: {
                id: 'frontFrameRails',
                name: '前左右纵梁',
                category: 'structure',
                subCategory: 'frame',
                location: 'front',
                inspectionOrder: 2,
                status: 'good',
                judgmentCriteria: ['normal', 'abnormal', 'repaired'],
                issues: [],
                description: '检查前纵梁是否有变形、焊接、修复痕迹'
            },
            rightFrontSuspension: {
                id: 'rightFrontSuspension',
                name: '右前悬挂减震器部位',
                category: 'structure',
                subCategory: 'suspension',
                location: 'right',
                inspectionOrder: 3,
                status: 'good',
                judgmentCriteria: ['normal', 'abnormal', 'repaired'],
                issues: [],
                description: '检查右前悬挂塔顶、减震器支座是否有变形或修复痕迹'
            },
            rightAPillarWeld: {
                id: 'rightAPillarWeld',
                name: '右A柱焊点胶条',
                category: 'structure',
                subCategory: 'weld',
                location: 'right',
                inspectionOrder: 4,
                status: 'good',
                judgmentCriteria: ['normal', 'abnormal', 'repaired'],
                issues: [],
                description: '检查右A柱焊点是否原厂、胶条是否完整'
            },
            rightBPillarWeld: {
                id: 'rightBPillarWeld',
                name: '右B柱焊点胶条',
                category: 'structure',
                subCategory: 'weld',
                location: 'right',
                inspectionOrder: 5,
                status: 'good',
                judgmentCriteria: ['normal', 'abnormal', 'repaired'],
                issues: [],
                description: '检查右B柱焊点是否原厂、胶条是否完整'
            },
            rightCPillarWeld: {
                id: 'rightCPillarWeld',
                name: '右C柱焊点胶条',
                category: 'structure',
                subCategory: 'weld',
                location: 'right',
                inspectionOrder: 6,
                status: 'good',
                judgmentCriteria: ['normal', 'abnormal', 'repaired'],
                issues: [],
                description: '检查右C柱焊点是否原厂、胶条是否完整'
            },
            rightRearSuspension: {
                id: 'rightRearSuspension',
                name: '右后悬挂减震器部位',
                category: 'structure',
                subCategory: 'suspension',
                location: 'right',
                inspectionOrder: 7,
                status: 'good',
                judgmentCriteria: ['normal', 'abnormal', 'repaired'],
                issues: [],
                description: '检查右后悬挂塔顶、减震器支座是否有变形或修复痕迹'
            },
            leftRearSuspension: {
                id: 'leftRearSuspension',
                name: '左后悬挂减震器部位',
                category: 'structure',
                subCategory: 'suspension',
                location: 'left',
                inspectionOrder: 8,
                status: 'good',
                judgmentCriteria: ['normal', 'abnormal', 'repaired'],
                issues: [],
                description: '检查左后悬挂塔顶、减震器支座是否有变形或修复痕迹'
            },
            leftCPillarWeld: {
                id: 'leftCPillarWeld',
                name: '左C柱焊点胶条',
                category: 'structure',
                subCategory: 'weld',
                location: 'left',
                inspectionOrder: 9,
                status: 'good',
                judgmentCriteria: ['normal', 'abnormal', 'repaired'],
                issues: [],
                description: '检查左C柱焊点是否原厂、胶条是否完整'
            },
            leftBPillarWeld: {
                id: 'leftBPillarWeld',
                name: '左B柱焊点胶条',
                category: 'structure',
                subCategory: 'weld',
                location: 'left',
                inspectionOrder: 10,
                status: 'good',
                judgmentCriteria: ['normal', 'abnormal', 'repaired'],
                issues: [],
                description: '检查左B柱焊点是否原厂、胶条是否完整'
            },
            leftAPillarWeld: {
                id: 'leftAPillarWeld',
                name: '左A柱焊点胶条',
                category: 'structure',
                subCategory: 'weld',
                location: 'left',
                inspectionOrder: 11,
                status: 'good',
                judgmentCriteria: ['normal', 'abnormal', 'repaired'],
                issues: [],
                description: '检查左A柱焊点是否原厂、胶条是否完整'
            },
            leftFrontSuspension: {
                id: 'leftFrontSuspension',
                name: '左前悬挂减震器部位',
                category: 'structure',
                subCategory: 'suspension',
                location: 'left',
                inspectionOrder: 12,
                status: 'good',
                judgmentCriteria: ['normal', 'abnormal', 'repaired'],
                issues: [],
                description: '检查左前悬挂塔顶、减震器支座是否有变形或修复痕迹'
            }
        };
        
        // Initialize with default data
        this.pointsData = JSON.parse(JSON.stringify(this.defaultPointsData));
        
        // Vehicle information
        this.vehicleInfo = {
            model: 'BYD Qin Pro DM 2019',
            vin: 'LGXC16D39Kxxxxxxx',
            plate: '',
            mileage: 50000,
            color: 'red',
            regDate: '2019-06-15',
            inspectionDate: new Date().toISOString().split('T')[0],
            inspector: '',
            notes: ''
        };
        
        // Initialize with empty data (no sample issues)
        this.loadSampleData();
    }
    
    loadSampleData() {
        // No sample data - start with empty issue list
        // All points start with 'good' status by default
    }
    
    // Get all points data
    getAllPoints() {
        return this.pointsData;
    }
    
    // Get a specific point's data
    getPoint(pointId) {
        return this.pointsData[pointId];
    }
    
    // Update point status
    updatePointStatus(pointId, status) {
        if (this.pointsData[pointId]) {
            this.pointsData[pointId].status = status;
        }
    }
    
    // Add issue to a point
    addIssue(issue) {
        const pointId = issue.pointId;
        if (!this.pointsData[pointId]) return null;
        
        const newIssue = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            ...issue,
            createdAt: new Date().toISOString()
        };
        
        this.pointsData[pointId].issues.push(newIssue);
        
        // Update point status based on issue severity
        if (issue.severity === 'severe') {
            this.updatePointStatus(pointId, 'danger');
        } else if (issue.severity === 'moderate' && this.pointsData[pointId].status !== 'danger') {
            this.updatePointStatus(pointId, 'warning');
        } else if (this.pointsData[pointId].status === 'good') {
            this.updatePointStatus(pointId, 'warning');
        }
        
        return newIssue;
    }
    
    // Remove issue
    removeIssue(pointId, issueId) {
        if (!this.pointsData[pointId]) return false;
        
        const point = this.pointsData[pointId];
        point.issues = point.issues.filter(i => i.id !== issueId);
        
        // Recalculate status
        if (point.issues.length === 0) {
            point.status = 'good';
        } else {
            const hasSevere = point.issues.some(i => i.severity === 'severe');
            const hasModerate = point.issues.some(i => i.severity === 'moderate');
            
            if (hasSevere) {
                point.status = 'danger';
            } else if (hasModerate) {
                point.status = 'warning';
            } else {
                point.status = 'warning';
            }
        }
        
        return true;
    }
    
    // Get all issues
    getAllIssues() {
        const issues = [];
        Object.values(this.pointsData).forEach(point => {
            point.issues.forEach(issue => {
                issues.push({
                    ...issue,
                    pointName: point.name,
                    pointLocation: point.location
                });
            });
        });
        return issues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    // Get issues for a specific point
    getPointIssues(pointId) {
        if (!this.pointsData[pointId]) return [];
        return this.pointsData[pointId].issues;
    }
    
    // Calculate overall score
    calculateOverallScore() {
        const points = Object.values(this.pointsData);
        let totalScore = 0;
        
        points.forEach(point => {
            let pointScore = 100;
            
            point.issues.forEach(issue => {
                switch (issue.severity) {
                    case 'minor':
                        pointScore -= 5;
                        break;
                    case 'moderate':
                        pointScore -= 15;
                        break;
                    case 'severe':
                        pointScore -= 30;
                        break;
                }
            });
            
            totalScore += Math.max(0, pointScore);
        });
        
        return Math.round(totalScore / points.length);
    }
    
    // Get grade based on score
    getGrade(score) {
        if (score >= 95) return { grade: '优秀', level: 'S' };
        if (score >= 85) return { grade: '良好', level: 'A' };
        if (score >= 75) return { grade: '一般', level: 'B' };
        if (score >= 60) return { grade: '较差', level: 'C' };
        return { grade: '差', level: 'D' };
    }
    
    // Calculate total repair cost
    calculateTotalCost() {
        let total = 0;
        Object.values(this.pointsData).forEach(point => {
            point.issues.forEach(issue => {
                total += issue.cost || 0;
            });
        });
        return total;
    }
    
    // Get issues count by severity
    getIssuesCountBySeverity() {
        const counts = { minor: 0, moderate: 0, severe: 0 };
        Object.values(this.pointsData).forEach(point => {
            point.issues.forEach(issue => {
                counts[issue.severity] = (counts[issue.severity] || 0) + 1;
            });
        });
        return counts;
    }
    
    // Update vehicle info
    updateVehicleInfo(info) {
        this.vehicleInfo = { ...this.vehicleInfo, ...info };
    }
    
    // Get vehicle info
    getVehicleInfo() {
        return this.vehicleInfo;
    }
    
    // Reset all data
    resetData() {
        this.pointsData = JSON.parse(JSON.stringify(this.defaultPointsData));
        this.vehicleInfo = {
            model: 'BYD Qin Pro DM 2019',
            vin: 'LGXC16D39Kxxxxxxx',
            plate: '',
            mileage: 0,
            color: 'red',
            regDate: '',
            inspectionDate: new Date().toISOString().split('T')[0],
            inspector: '',
            notes: ''
        };
    }
    
    // Export data to JSON
    exportData() {
        return {
            vehicleInfo: this.vehicleInfo,
            pointsData: this.pointsData,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }
    
    // Import data from JSON
    importData(data) {
        if (data.vehicleInfo) {
            this.vehicleInfo = { ...this.vehicleInfo, ...data.vehicleInfo };
        }
        if (data.pointsData) {
            // Merge with existing data structure to ensure all points exist
            Object.keys(this.pointsData).forEach(key => {
                if (data.pointsData[key]) {
                    this.pointsData[key] = {
                        ...this.pointsData[key],
                        ...data.pointsData[key],
                        // Keep the original name and ID
                        name: this.pointsData[key].name,
                        id: this.pointsData[key].id
                    };
                }
            });
        }
    }
    
    // Save to localStorage
    saveToStorage() {
        try {
            localStorage.setItem('ev_inspection_data', JSON.stringify(this.exportData()));
            return true;
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
            return false;
        }
    }
    
    // Load from localStorage
    loadFromStorage() {
        try {
            const data = localStorage.getItem('ev_inspection_data');
            if (data) {
                this.importData(JSON.parse(data));
                return true;
            }
        } catch (e) {
            console.error('Failed to load from localStorage:', e);
        }
        return false;
    }
    
    // Get report summary
    getReportSummary() {
        const score = this.calculateOverallScore();
        const grade = this.getGrade(score);
        const issues = this.getAllIssues();
        const totalCost = this.calculateTotalCost();
        const severityCounts = this.getIssuesCountBySeverity();
        
        // Count points by status
        const pointsByStatus = { good: 0, warning: 0, danger: 0 };
        Object.values(this.pointsData).forEach(point => {
            pointsByStatus[point.status] = (pointsByStatus[point.status] || 0) + 1;
        });
        
        // Count structure points by judgment
        const structureJudgmentCounts = { normal: 0, abnormal: 0, repaired: 0 };
        Object.values(this.pointsData).forEach(point => {
            if (point.category === 'structure' && point.judgment) {
                structureJudgmentCounts[point.judgment] = (structureJudgmentCounts[point.judgment] || 0) + 1;
            }
        });
        
        return {
            vehicleInfo: this.vehicleInfo,
            score,
            grade,
            totalIssues: issues.length,
            totalCost,
            severityCounts,
            pointsByStatus,
            structureJudgmentCounts,
            inspectionDate: this.vehicleInfo.inspectionDate,
            inspector: this.vehicleInfo.inspector
        };
    }
    
    // Get structure inspection points ordered by inspectionOrder
    getStructurePointsByOrder() {
        return Object.values(this.pointsData)
            .filter(point => point.category === 'structure')
            .sort((a, b) => (a.inspectionOrder || 0) - (b.inspectionOrder || 0));
    }
    
    // Update structure point judgment (normal/abnormal/repaired)
    updateStructureJudgment(pointId, judgment) {
        if (!this.pointsData[pointId]) return false;
        const point = this.pointsData[pointId];
        if (point.category !== 'structure') return false;
        
        point.judgment = judgment;
        // Update status based on judgment
        if (judgment === 'normal') {
            point.status = 'good';
        } else if (judgment === 'abnormal') {
            point.status = 'warning';
        } else if (judgment === 'repaired') {
            point.status = 'danger';
        }
        return true;
    }
    
    // Get judgment label
    static getJudgmentLabel(judgment) {
        const labels = {
            'normal': '正常',
            'abnormal': '异常',
            'repaired': '修复痕迹'
        };
        return labels[judgment] || judgment;
    }
    
    // Get all points ordered by category and inspection order
    getAllPointsOrdered() {
        const paintPoints = Object.values(this.pointsData)
            .filter(p => p.category === 'paint');
        const structurePoints = this.getStructurePointsByOrder();
        return [...paintPoints, ...structurePoints];
    }
    
    // Get issue type label
    static getIssueTypeLabel(type) {
        const labels = {
            'normal': '正常',
            'scratch': '划痕',
            'dent': '凹陷',
            'paint-fade': '漆面褪色',
            'paint-peel': '漆面剥落',
            'rust': '锈蚀',
            'crack': '裂纹',
            'color-diff': '色差',
            'overspray': '飞漆/流漆',
            'stone-chip': '石子冲击',
            'other': '其他'
        };
        return labels[type] || type;
    }
    
    // Get severity label
    static getSeverityLabel(severity) {
        const labels = {
            'minor': '轻微',
            'moderate': '中等',
            'severe': '严重'
        };
        return labels[severity] || severity;
    }
    
    // Get status label
    static getStatusLabel(status) {
        const labels = {
            'good': '正常',
            'warning': '需注意',
            'danger': '异常'
        };
        return labels[status] || status;
    }
}

// Make available globally
window.InspectionDataManager = InspectionDataManager;
