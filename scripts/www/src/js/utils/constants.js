/**
 * Application Constants
 * Centralized configuration and constant values
 */

// Inspection Points Configuration (18 steps)
const INSPECTION_POINTS_CONFIG = [
    // Structure - Symmetry & Frame
    { id: 'vehicleSymmetry', name: '车辆对称性检测', category: 'structure', subCategory: 'symmetry', location: 'overall', order: 1 },
    { id: 'frontFrameRails', name: '前左右纵梁', category: 'structure', subCategory: 'frame', location: 'front', order: 2 },
    
    // Right Side (Clockwise)
    { id: 'rightFrontSuspension', name: '右前悬挂减震器部位', category: 'structure', subCategory: 'suspension', location: 'right', order: 3 },
    { id: 'rightAPillar', name: '右A柱漆面', category: 'paint', location: 'right', order: 4 },
    { id: 'rightAPillarWeld', name: '右A柱焊点胶条', category: 'structure', subCategory: 'weld', location: 'right', order: 5 },
    { id: 'rightBPillar', name: '右B柱漆面', category: 'paint', location: 'right', order: 6 },
    { id: 'rightBPillarWeld', name: '右B柱焊点胶条', category: 'structure', subCategory: 'weld', location: 'right', order: 7 },
    { id: 'rightCPillar', name: '右C柱漆面', category: 'paint', location: 'right', order: 8 },
    { id: 'rightCPillarWeld', name: '右C柱焊点胶条', category: 'structure', subCategory: 'weld', location: 'right', order: 9 },
    { id: 'rightRearSuspension', name: '右后悬挂减震器部位', category: 'structure', subCategory: 'suspension', location: 'right', order: 10 },
    
    // Left Side
    { id: 'leftRearSuspension', name: '左后悬挂减震器部位', category: 'structure', subCategory: 'suspension', location: 'left', order: 11 },
    { id: 'leftCPillarWeld', name: '左C柱焊点胶条', category: 'structure', subCategory: 'weld', location: 'left', order: 12 },
    { id: 'leftCPillar', name: '左C柱漆面', category: 'paint', location: 'left', order: 13 },
    { id: 'leftBPillarWeld', name: '左B柱焊点胶条', category: 'structure', subCategory: 'weld', location: 'left', order: 14 },
    { id: 'leftBPillar', name: '左B柱漆面', category: 'paint', location: 'left', order: 15 },
    { id: 'leftAPillarWeld', name: '左A柱焊点胶条', category: 'structure', subCategory: 'weld', location: 'left', order: 16 },
    { id: 'leftAPillar', name: '左A柱漆面', category: 'paint', location: 'left', order: 17 },
    { id: 'leftFrontSuspension', name: '左前悬挂减震器部位', category: 'structure', subCategory: 'suspension', location: 'left', order: 18 }
];

// 3D Hotspot Positions
const HOTSPOT_POSITIONS = {
    // Paint points
    leftAPillar: { x: -0.9, y: 1.35, z: 1.4 },
    rightAPillar: { x: 0.9, y: 1.35, z: 1.4 },
    leftBPillar: { x: -1.25, y: 1.2, z: 0.1 },
    rightBPillar: { x: 1.25, y: 1.2, z: 0.1 },
    leftCPillar: { x: -1.05, y: 1.35, z: -1.5 },
    rightCPillar: { x: 1.05, y: 1.35, z: -1.5 },
    
    // Structure points
    vehicleSymmetry: { x: 0, y: 2.2, z: 0 },
    frontFrameRails: { x: 0, y: 0.5, z: 2.0 },
    rightFrontSuspension: { x: 1.0, y: 0.8, z: 1.8 },
    rightAPillarWeld: { x: 1.1, y: 1.4, z: 1.3 },
    rightBPillarWeld: { x: 1.4, y: 1.3, z: 0.1 },
    rightCPillarWeld: { x: 1.2, y: 1.4, z: -1.4 },
    rightRearSuspension: { x: 1.0, y: 0.8, z: -1.8 },
    leftRearSuspension: { x: -1.0, y: 0.8, z: -1.8 },
    leftCPillarWeld: { x: -1.2, y: 1.4, z: -1.4 },
    leftBPillarWeld: { x: -1.4, y: 1.3, z: 0.1 },
    leftAPillarWeld: { x: -1.1, y: 1.4, z: 1.3 },
    leftFrontSuspension: { x: -1.0, y: 0.8, z: 1.8 }
};

// Issue Types
const ISSUE_TYPES = {
    normal: { label: '✓ 正常 - 无问题', color: '#2ecc71', isNormal: true },
    scratch: { label: '划痕', color: '#e74c3c' },
    dent: { label: '凹陷', color: '#e74c3c' },
    'paint-fade': { label: '漆面褪色', color: '#f39c12' },
    'paint-peel': { label: '漆面剥落', color: '#f39c12' },
    rust: { label: '锈蚀', color: '#e74c3c' },
    crack: { label: '裂纹', color: '#e74c3c' },
    'color-diff': { label: '色差', color: '#f39c12' },
    overspray: { label: '飞漆/流漆', color: '#f39c12' },
    'stone-chip': { label: '石子冲击', color: '#f39c12' },
    other: { label: '其他', color: '#95a5a6' }
};

// Severity Levels
const SEVERITY_LEVELS = {
    minor: { label: '轻微', color: '#f39c12', deduction: 3 },
    moderate: { label: '中等', color: '#e67e22', deduction: 8 },
    severe: { label: '严重', color: '#e74c3c', deduction: 15 }
};

// Status Types
const STATUS_TYPES = {
    good: { label: '良好', color: '#2ecc71' },
    warning: { label: '需注意', color: '#f39c12' },
    danger: { label: '异常', color: '#e74c3c' }
};

// Structure Judgments
const STRUCTURE_JUDGMENTS = {
    normal: { label: '正常', color: '#2ecc71', status: 'good' },
    abnormal: { label: '异常', color: '#f39c12', status: 'warning' },
    repaired: { label: '修复痕迹', color: '#e74c3c', status: 'danger' }
};

// Paint Thickness Standards
const PAINT_THICKNESS = {
    min: 130,
    max: 200,
    unit: 'μm'
};

// Vehicle Info Defaults
const DEFAULT_VEHICLE_INFO = {
    model: 'BYD Qin Pro DM 2019',
    vin: 'LGXC16D39Kxxxxxxx',
    plate: '',
    mileage: 50000,
    color: 'white',
    regDate: '2019-06-15',
    inspectionDate: '',
    inspector: '',
    notes: ''
};

// Score Grades
const SCORE_GRADES = [
    { min: 90, grade: '优秀', level: 1 },
    { min: 80, grade: '良好', level: 2 },
    { min: 70, grade: '一般', level: 3 },
    { min: 60, grade: '较差', level: 4 },
    { min: 0, grade: '差', level: 5 }
];

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        INSPECTION_POINTS_CONFIG,
        HOTSPOT_POSITIONS,
        ISSUE_TYPES,
        SEVERITY_LEVELS,
        STATUS_TYPES,
        STRUCTURE_JUDGMENTS,
        PAINT_THICKNESS,
        DEFAULT_VEHICLE_INFO,
        SCORE_GRADES
    };
} else {
    window.Constants = {
        INSPECTION_POINTS_CONFIG,
        HOTSPOT_POSITIONS,
        ISSUE_TYPES,
        SEVERITY_LEVELS,
        STATUS_TYPES,
        STRUCTURE_JUDGMENTS,
        PAINT_THICKNESS,
        DEFAULT_VEHICLE_INFO,
        SCORE_GRADES
    };
}
