/**
 * Inspection Data Manager
 * Manages all inspection data, issues, and report generation
 */

class InspectionDataManager {
    constructor() {
        // Default inspection points data
        this.defaultPointsData = {
            hood: {
                id: 'hood',
                name: '引擎盖漆面',
                category: 'paint',
                location: 'front',
                status: 'good',
                thickness: { min: 120, max: 150, unit: 'μm' },
                issues: [],
                description: '引擎盖漆面检测'
            },
            frontBumper: {
                id: 'frontBumper',
                name: '前保险杠漆面',
                category: 'paint',
                location: 'front',
                status: 'good',
                thickness: { min: 100, max: 180, unit: 'μm' },
                issues: [],
                description: '前保险杠漆面检测'
            },
            leftFender: {
                id: 'leftFender',
                name: '左前翼子板漆面',
                category: 'paint',
                location: 'left',
                status: 'good',
                thickness: { min: 110, max: 160, unit: 'μm' },
                issues: [],
                description: '左前翼子板漆面检测'
            },
            rightFender: {
                id: 'rightFender',
                name: '右前翼子板漆面',
                category: 'paint',
                location: 'right',
                status: 'good',
                thickness: { min: 110, max: 160, unit: 'μm' },
                issues: [],
                description: '右前翼子板漆面检测'
            },
            leftFrontDoor: {
                id: 'leftFrontDoor',
                name: '左前门漆面',
                category: 'paint',
                location: 'left',
                status: 'good',
                thickness: { min: 110, max: 160, unit: 'μm' },
                issues: [],
                description: '左前门漆面检测'
            },
            rightFrontDoor: {
                id: 'rightFrontDoor',
                name: '右前门漆面',
                category: 'paint',
                location: 'right',
                status: 'good',
                thickness: { min: 110, max: 160, unit: 'μm' },
                issues: [],
                description: '右前门漆面检测'
            },
            leftRearDoor: {
                id: 'leftRearDoor',
                name: '左后门漆面',
                category: 'paint',
                location: 'left',
                status: 'good',
                thickness: { min: 110, max: 160, unit: 'μm' },
                issues: [],
                description: '左后门漆面检测'
            },
            rightRearDoor: {
                id: 'rightRearDoor',
                name: '右后门漆面',
                category: 'paint',
                location: 'right',
                status: 'good',
                thickness: { min: 110, max: 160, unit: 'μm' },
                issues: [],
                description: '右后门漆面检测'
            },
            leftRearFender: {
                id: 'leftRearFender',
                name: '左后翼子板漆面',
                category: 'paint',
                location: 'left',
                status: 'good',
                thickness: { min: 110, max: 160, unit: 'μm' },
                issues: [],
                description: '左后翼子板漆面检测'
            },
            rightRearFender: {
                id: 'rightRearFender',
                name: '右后翼子板漆面',
                category: 'paint',
                location: 'right',
                status: 'good',
                thickness: { min: 110, max: 160, unit: 'μm' },
                issues: [],
                description: '右后翼子板漆面检测'
            },
            trunk: {
                id: 'trunk',
                name: '后备箱盖漆面',
                category: 'paint',
                location: 'rear',
                status: 'good',
                thickness: { min: 120, max: 150, unit: 'μm' },
                issues: [],
                description: '后备箱盖漆面检测'
            },
            rearBumper: {
                id: 'rearBumper',
                name: '后保险杠漆面',
                category: 'paint',
                location: 'rear',
                status: 'good',
                thickness: { min: 100, max: 180, unit: 'μm' },
                issues: [],
                description: '后保险杠漆面检测'
            },
            roof: {
                id: 'roof',
                name: '车顶漆面',
                category: 'paint',
                location: 'top',
                status: 'good',
                thickness: { min: 120, max: 150, unit: 'μm' },
                issues: [],
                description: '车顶漆面检测'
            },
            leftAPillar: {
                id: 'leftAPillar',
                name: '左A柱漆面',
                category: 'paint',
                location: 'left',
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
                status: 'good',
                thickness: { min: 130, max: 200, unit: 'μm' },
                issues: [],
                description: '右C柱漆面检测'
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
        
        return {
            vehicleInfo: this.vehicleInfo,
            score,
            grade,
            totalIssues: issues.length,
            totalCost,
            severityCounts,
            pointsByStatus,
            inspectionDate: this.vehicleInfo.inspectionDate,
            inspector: this.vehicleInfo.inspector
        };
    }
    
    // Get issue type label
    static getIssueTypeLabel(type) {
        const labels = {
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
