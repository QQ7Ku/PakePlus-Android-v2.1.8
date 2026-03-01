/**
 * Application Constants
 */

// Inspection Points Configuration (18 steps)
const INSPECTION_POINTS_CONFIG = [
    { id: 'vehicleSymmetry', name: '车辆对称性检测', category: 'structure', subCategory: 'symmetry', location: 'overall', order: 1 },
    { id: 'frontFrameRails', name: '前左右纵梁', category: 'structure', subCategory: 'frame', location: 'front', order: 2 },
    { id: 'rightFrontSuspension', name: '右前悬挂减震器部位', category: 'structure', subCategory: 'suspension', location: 'right', order: 3 },
    { id: 'rightAPillar', name: '右A柱漆面', category: 'paint', location: 'right', order: 4 },
    { id: 'rightAPillarWeld', name: '右A柱焊点胶条', category: 'structure', subCategory: 'weld', location: 'right', order: 5 },
    { id: 'rightBPillar', name: '右B柱漆面', category: 'paint', location: 'right', order: 6 },
    { id: 'rightBPillarWeld', name: '右B柱焊点胶条', category: 'structure', subCategory: 'weld', location: 'right', order: 7 },
    { id: 'rightCPillar', name: '右C柱漆面', category: 'paint', location: 'right', order: 8 },
    { id: 'rightCPillarWeld', name: '右C柱焊点胶条', category: 'structure', subCategory: 'weld', location: 'right', order: 9 },
    { id: 'rightRearSuspension', name: '右后悬挂减震器部位', category: 'structure', subCategory: 'suspension', location: 'right', order: 10 },
    { id: 'leftRearSuspension', name: '左后悬挂减震器部位', category: 'structure', subCategory: 'suspension', location: 'left', order: 11 },
    { id: 'leftCPillarWeld', name: '左C柱焊点胶条', category: 'structure', subCategory: 'weld', location: 'left', order: 12 },
    { id: 'leftCPillar', name: '左C柱漆面', category: 'paint', location: 'left', order: 13 },
    { id: 'leftBPillarWeld', name: '左B柱焊点胶条', category: 'structure', subCategory: 'weld', location: 'left', order: 14 },
    { id: 'leftBPillar', name: '左B柱漆面', category: 'paint', location: 'left', order: 15 },
    { id: 'leftAPillarWeld', name: '左A柱焊点胶条', category: 'structure', subCategory: 'weld', location: 'left', order: 16 },
    { id: 'leftAPillar', name: '左A柱漆面', category: 'paint', location: 'left', order: 17 },
    { id: 'leftFrontSuspension', name: '左前悬挂减震器部位', category: 'structure', subCategory: 'suspension', location: 'left', order: 18 }
];

// 3D Hotspot Positions - Aligned with qin2019.glb model
// Model scaled to: width=4.0, height=2.9, length=8.86
// Bounds: x=[-2.0, 2.0], y=[0.0, 2.9], z=[-4.43, 4.43]
// +Z=front, -Z=rear, +X=right, -X=left
const HOTSPOT_POSITIONS = {
    // ==========================================
    // 1. Vehicle Symmetry - 车辆对称性检测（车顶中央上方）
    // ==========================================
    vehicleSymmetry: { x: 0, y: 3.2, z: 0 },
    
    // ==========================================
    // 2. Front Frame Rails - 前左右纵梁（车头下方）
    // ==========================================
    frontFrameRails: { x: 0, y: 0.2, z: 4.2 },
    
    // ==========================================
    // 3. Right Front Suspension - 右前悬挂减震器（右前轮拱）
    // ==========================================
    rightFrontSuspension: { x: 1.9, y: 0.6, z: 3.2 },
    
    // ==========================================
    // 4-9. Right Side ABC Pillars（右侧ABC柱，从前到后）
    // ==========================================
    // 漆面点在车身外侧，焊点在更外侧或不同高度，避免重叠
    // A柱在前部(z=1.8)
    rightAPillar: { x: 1.8, y: 1.2, z: 1.8 },         // 漆面 - 下方
    rightAPillarWeld: { x: 2.2, y: 2.0, z: 1.8 },     // 焊点 - 上方
    
    // B柱在中部(z=0)
    rightBPillar: { x: 1.8, y: 1.2, z: 0 },           // 漆面 - 下方
    rightBPillarWeld: { x: 2.2, y: 2.0, z: 0 },       // 焊点 - 上方
    
    // C柱在后部(z=-1.8)
    rightCPillar: { x: 1.8, y: 1.2, z: -1.8 },        // 漆面 - 下方
    rightCPillarWeld: { x: 2.2, y: 2.0, z: -1.8 },    // 焊点 - 上方
    
    // ==========================================
    // 10-11. Rear Suspensions（后悬挂，左右轮拱）
    // ==========================================
    rightRearSuspension: { x: 1.9, y: 0.6, z: -3.2 },
    leftRearSuspension: { x: -1.9, y: 0.6, z: -3.2 },
    
    // ==========================================
    // 12-17. Left Side ABC Pillars（左侧ABC柱，从后到前）
    // ==========================================
    // C柱在后部(z=-1.8)
    leftCPillarWeld: { x: -2.2, y: 2.0, z: -1.8 },    // 焊点 - 上方
    leftCPillar: { x: -1.8, y: 1.2, z: -1.8 },        // 漆面 - 下方
    
    // B柱在中部(z=0)
    leftBPillarWeld: { x: -2.2, y: 2.0, z: 0 },       // 焊点 - 上方
    leftBPillar: { x: -1.8, y: 1.2, z: 0 },           // 漆面 - 下方
    
    // A柱在前部(z=1.8)
    leftAPillarWeld: { x: -2.2, y: 2.0, z: 1.8 },     // 焊点 - 上方
    leftAPillar: { x: -1.8, y: 1.2, z: 1.8 },         // 漆面 - 下方
    
    // ==========================================
    // 18. Left Front Suspension - 左前悬挂减震器
    // ==========================================
    leftFrontSuspension: { x: -1.9, y: 0.6, z: 3.2 }
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
    normal: { label: '正常', color: '#2ecc71', deduction: 0 },
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

// Hotspot Colors - Unified color scheme
const HOTSPOT_COLORS = {
    // Base colors for different categories
    paint: {
        primary: 0x1a5276,      // Deep blue for paint points
        ring: 0x2980b9,         // Medium blue ring
        glow: 0x5dade2          // Light blue glow effect
    },
    structure: {
        primary: 0x3498db,      // Blue for structure points  
        ring: 0x5dade2,         // Light blue ring
        glow: 0x85c1e9          // Lighter blue glow effect
    },
    // Status-based colors (override base when point has issues)
    status: {
        good: 0x2ecc71,         // Green - no issues
        warning: 0xf39c12,      // Yellow - minor issues
        danger: 0xe74c3c        // Red - severe issues
    },
    // Common
    hover: 0xffffff,           // White on hover
    selected: 0xf1c40f         // Yellow when selected
};

// Structure Judgments
const STRUCTURE_JUDGMENTS = {
    normal: { label: '正常', color: '#2ecc71', status: 'good' },
    abnormal: { label: '异常', color: '#f39c12', status: 'warning' },
    repaired: { label: '修复痕迹', color: '#e74c3c', status: 'danger' }
};

// Scoring Rules - Centralized scoring configuration
const SCORING_RULES = {
    DEDUCTIONS: {
        severe: 15,
        moderate: 8,
        minor: 3,
        normal: 0
    },
    GRADES: [
        { min: 90, grade: '优秀', level: 1 },
        { min: 80, grade: '良好', level: 2 },
        { min: 70, grade: '一般', level: 3 },
        { min: 60, grade: '较差', level: 4 },
        { min: 0,  grade: '差', level: 5 }
    ],
    MAX_SCORE: 100,
    MIN_SCORE: 0
};

// Flow Configuration
const FLOW_CONFIG = {
    TOTAL_STEPS: 18
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
        HOTSPOT_COLORS,
        ISSUE_TYPES,
        SEVERITY_LEVELS,
        STATUS_TYPES,
        STRUCTURE_JUDGMENTS,
        SCORING_RULES,
        FLOW_CONFIG,
        PAINT_THICKNESS,
        DEFAULT_VEHICLE_INFO,
        SCORE_GRADES
    };
} else {
    window.Constants = {
        INSPECTION_POINTS_CONFIG,
        HOTSPOT_POSITIONS,
        HOTSPOT_COLORS,
        ISSUE_TYPES,
        SEVERITY_LEVELS,
        STATUS_TYPES,
        STRUCTURE_JUDGMENTS,
        SCORING_RULES,
        FLOW_CONFIG,
        PAINT_THICKNESS,
        DEFAULT_VEHICLE_INFO,
        SCORE_GRADES
    };
}
