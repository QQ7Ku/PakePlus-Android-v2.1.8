/**
 * EV Export Pro - Main Application
 * New Energy Vehicle Export Assistant for ASEAN Countries
 */

// ========================================
// Application State
// ========================================
const AppState = {
    currentStep: 1,
    totalSteps: 5,
    licenseData: null,
    reportData: null,
    vehicleInfo: {},
    selectedCountry: null,
    complianceResult: null,
    isProcessing: false,
    auditData: {
        issues: [],
        auditor: '',
        auditDate: '',
        remarks: ''
    },
    step3Data: {
        // 基本信息
        plate: '桂A·YX019',
        brand: '比亚迪',
        model: '秦Pro DM 2022款 旗舰版',
        year: 2022,
        vin: 'LSVDF6C48NN024488',
        engine: 'BYD476ZQA',
        regDate: '2022-03-01',
        mileage: 52600,
        color: '白色',
        usage: '非营运',
        powerType: '插电混动',
        
        // 新能源信息
        batteryType: '磷酸铁锂',
        batteryCapacity: 18.3,
        batteryHealth: 95,
        range: 82,
        batteryStatus: '全新（未使用）',
        isDangerous: '否',
        packageType: '标准集装箱',
        
        // 检测结果摘要
        inspectionOrg: '查博士',
        reportNo: '135525946',
        score: 95,
        grade: 'A级',
        auditor: '1',
        auditNotes: '经审核，AI识别结果准确，车辆整体状况良好。',
        
        // 检测问题列表
        issues: [
            { id: 1, name: '左前纵梁', desc: '轻微划痕', severity: '轻微' },
            { id: 2, name: '左前门内饰板', desc: '轻微磨损', severity: '轻微' },
            { id: 3, name: '前保险杠', desc: '喷漆修复', severity: '轻微' }
        ]
    },
    declarationData: {
        // 报关信息
        customsDeclarant: '',
        declarationNo: '',
        declarationDate: '',
        customsPort: '',
        tradeMode: '',
        // 车辆信息
        plate: '',
        brand: '',
        model: '',
        year: '',
        vin: '',
        mileage: '',
        // 出口信息
        exporter: '',
        exporterContact: '',
        destinationCountry: '',
        // 海关信息
        hsCode: '',
        customsValue: '',
        currency: 'CNY',
        dutyRate: 0,
        // 证书信息
        certificateNo: '',
        certificateType: '',
        // 电池信息
        batteryType: '',
        batteryCapacity: '',
        batteryHealth: '',
        un38_3: false,
        msds: false
    }
};

// ========================================
// ASEAN Countries Data
// ========================================
const countriesData = [
    { code: 'KH', name: '柬埔寨', nameEn: 'Cambodia', region: 'asean', flag: '🇰🇭', priority: true },
    { code: 'TH', name: '泰国', nameEn: 'Thailand', region: 'asean', flag: '🇹🇭', priority: true },
    { code: 'VN', name: '越南', nameEn: 'Vietnam', region: 'asean', flag: '🇻🇳', priority: false },
    { code: 'LA', name: '老挝', nameEn: 'Laos', region: 'asean', flag: '🇱🇦', priority: false },
    { code: 'MM', name: '缅甸', nameEn: 'Myanmar', region: 'asean', flag: '🇲🇲', priority: false },
    { code: 'MY', name: '马来西亚', nameEn: 'Malaysia', region: 'asean', flag: '🇲🇾', priority: false },
    { code: 'SG', name: '新加坡', nameEn: 'Singapore', region: 'asean', flag: '🇸🇬', priority: false },
    { code: 'ID', name: '印度尼西亚', nameEn: 'Indonesia', region: 'asean', flag: '🇮🇩', priority: false },
    { code: 'PH', name: '菲律宾', nameEn: 'Philippines', region: 'asean', flag: '🇵🇭', priority: false },
    { code: 'BN', name: '文莱', nameEn: 'Brunei', region: 'asean', flag: '🇧🇳', priority: false },
    { code: 'CN', name: '中国', nameEn: 'China', region: 'other', flag: '🇨🇳', priority: false },
    { code: 'JP', name: '日本', nameEn: 'Japan', region: 'other', flag: '🇯🇵', priority: false },
    { code: 'KR', name: '韩国', nameEn: 'South Korea', region: 'other', flag: '🇰🇷', priority: false },
    { code: 'IN', name: '印度', nameEn: 'India', region: 'other', flag: '🇮🇳', priority: false },
    { code: 'AU', name: '澳大利亚', nameEn: 'Australia', region: 'other', flag: '🇦🇺', priority: false }
];

// ========================================
// Demo Data - Based on the provided inspection report image
// ========================================
const demoLicenseData = {
    plate: '桂A·YX019',
    type: '小型新能源轿车',
    owner: '尹飞',
    usage: '非营运',
    model: '比亚迪 秦Pro DM 2022款 旗舰版',
    vin: 'LSVDF6C48NN024488',
    engine: 'BYD476ZQA',
    regDate: '2022-03',
    inspectionDate: '2025-11-07',
    mileage: 52600
};

// Demo Report Data - Extracted from the provided inspection report image
const demoReportData = {
    score: 95,
    grade: 'A',
    goodItems: 68,
    warningItems: 3,
    dangerItems: 0,
    inspectionOrg: '查博士',
    reportNo: '135525946',
    inspectionDate: '2025-11-07',
    completionDate: '2025-11-07',
    issues: [
        {
            id: 1,
            severity: 'minor',
            title: '左前纵梁 - 轻微划痕',
            description: '左前纵梁表面有轻微划痕，不影响结构强度',
            cost: 0,
            category: '骨架'
        },
        {
            id: 2,
            severity: 'minor',
            title: '左前门内饰板 - 轻微磨损',
            description: '左前门内饰板有轻微使用磨损痕迹',
            cost: 0,
            category: '内饰'
        },
        {
            id: 3,
            severity: 'minor',
            title: '前保险杠 - 喷漆修复',
            description: '前保险杠有喷漆修复痕迹，已修复良好',
            cost: 0,
            category: '漆面'
        }
    ],
    battery: {
        type: '磷酸铁锂',
        capacity: 18.3,
        health: 95,
        range: 82,
        driveType: '前驱',
        chargingPort: '国标'
    },
    vehicleStructure: {
        bodyPanels: '正常',
        frame: '无异常',
        chassis: '正常'
    },
    reportImage: '../1528DDEF4FC1236E6ABC03C677685F95.jpg',
    // 详细检测项目列表 - 参考检测报告图片
    detailedItems: {
        // 1. 车身漆面检测
        bodyPaint: {
            category: '车身漆面',
            icon: 'fa-spray-can',
            items: [
                { name: '引擎盖漆面', status: 'good', note: '无异常' },
                { name: '前保险杠漆面', status: 'warning', note: '喷漆修复' },
                { name: '左前翼子板漆面', status: 'good', note: '无异常' },
                { name: '左前门漆面', status: 'good', note: '无异常' },
                { name: '左后门漆面', status: 'good', note: '无异常' },
                { name: '左后翼子板漆面', status: 'good', note: '无异常' },
                { name: '后备箱盖漆面', status: 'good', note: '无异常' },
                { name: '后保险杠漆面', status: 'good', note: '无异常' },
                { name: '右后翼子板漆面', status: 'good', note: '无异常' },
                { name: '右后门漆面', status: 'good', note: '无异常' },
                { name: '右前门漆面', status: 'good', note: '无异常' },
                { name: '右前翼子板漆面', status: 'good', note: '无异常' },
                { name: '车顶漆面', status: 'good', note: '无异常' }
            ]
        },
        // 2. 车身骨架检测
        bodyFrame: {
            category: '车身骨架',
            icon: 'fa-car-side',
            items: [
                { name: '左前纵梁', status: 'warning', note: '轻微划痕' },
                { name: '右前纵梁', status: 'good', note: '无异常' },
                { name: '左前减震器座', status: 'good', note: '无异常' },
                { name: '右前减震器座', status: 'good', note: '无异常' },
                { name: '左A柱', status: 'good', note: '无异常' },
                { name: '右A柱', status: 'good', note: '无异常' },
                { name: '左B柱', status: 'good', note: '无异常' },
                { name: '右B柱', status: 'good', note: '无异常' },
                { name: '左C柱', status: 'good', note: '无异常' },
                { name: '右C柱', status: 'good', note: '无异常' },
                { name: '左后翼子板内衬', status: 'good', note: '无异常' },
                { name: '右后翼子板内衬', status: 'good', note: '无异常' },
                { name: '后备箱围板', status: 'good', note: '无异常' },
                { name: '后底板', status: 'good', note: '无异常' },
                { name: '左后纵梁', status: 'good', note: '无异常' },
                { name: '右后纵梁', status: 'good', note: '无异常' }
            ]
        },
        // 3. 必检项 - 结构件
        requiredItems: {
            category: '必检项（结构件）',
            icon: 'fa-clipboard-check',
            items: [
                { name: '水箱框架', status: 'good', note: '无异常' },
                { name: '左前翼子板支架', status: 'good', note: '无异常' },
                { name: '右前翼子板支架', status: 'good', note: '无异常' },
                { name: '左前裙边', status: 'good', note: '无异常' },
                { name: '右前裙边', status: 'good', note: '无异常' },
                { name: '左后裙边', status: 'good', note: '无异常' },
                { name: '右后裙边', status: 'good', note: '无异常' },
                { name: '左后翼子板支架', status: 'good', note: '无异常' },
                { name: '右后翼子板支架', status: 'good', note: '无异常' },
                { name: '备胎槽', status: 'good', note: '无异常' },
                { name: '后围板内侧', status: 'good', note: '无异常' }
            ]
        },
        // 4. 车况检测
        vehicleCondition: {
            category: '车况检测',
            icon: 'fa-stethoscope',
            items: [
                { name: '漆面检测', status: 'good', note: '前保险杠喷漆修复' },
                { name: '外观检测', status: 'good', note: '无异常' },
                { name: '内饰检测', status: 'warning', note: '左前门内饰板轻微磨损' },
                { name: '骨架检测', status: 'warning', note: '左前纵梁轻微划痕' },
                { name: '机舱检测', status: 'good', note: '无异常' },
                { name: '底盘检测', status: 'good', note: '无异常' }
            ]
        },
        // 5. 机电系统
        electromechanical: {
            category: '机电系统',
            icon: 'fa-bolt',
            items: [
                { name: '动力电池系统', status: 'good', note: '健康度95%' },
                { name: '电机系统', status: 'good', note: '无异常' },
                { name: '电控系统', status: 'good', note: '无异常' },
                { name: '充电系统', status: 'good', note: '无异常' },
                { name: '空调系统', status: 'good', note: '制冷正常' },
                { name: '转向系统', status: 'good', note: '无异常' },
                { name: '制动系统', status: 'good', note: '无异常' },
                { name: '悬挂系统', status: 'good', note: '无异常' },
                { name: '传动系统', status: 'good', note: '无异常' }
            ]
        },
        // 6. 基本照片检测
        basicPhotos: {
            category: '基本照片检测',
            icon: 'fa-camera',
            items: [
                { name: '左前45度', status: 'good', note: '已拍摄' },
                { name: '左前大灯', status: 'good', note: '已拍摄' },
                { name: '正前', status: 'good', note: '已拍摄' },
                { name: '车头下部', status: 'good', note: '已拍摄' },
                { name: '车辆铭牌', status: 'good', note: '已拍摄' },
                { name: '右侧底大边', status: 'good', note: '已拍摄' },
                { name: '右后尾灯', status: 'good', note: '已拍摄' },
                { name: '右后45度', status: 'good', note: '已拍摄' },
                { name: '车尾下部', status: 'good', note: '已拍摄' },
                { name: '后备箱', status: 'good', note: '已拍摄' },
                { name: '左侧底大边', status: 'good', note: '已拍摄' },
                { name: '后排座椅', status: 'good', note: '已拍摄' },
                { name: '中控台', status: 'good', note: '已拍摄' },
                { name: '中控面板', status: 'good', note: '已拍摄' },
                { name: '档把', status: 'good', note: '已拍摄' },
                { name: '钥匙', status: 'good', note: '已拍摄' },
                { name: '方向盘', status: 'good', note: '已拍摄' },
                { name: '仪表盘', status: 'good', note: '已拍摄' },
                { name: '表显里程', status: 'good', note: '5.26万公里' },
                { name: '左前门内饰板', status: 'warning', note: '轻微磨损' },
                { name: '左前门功能区', status: 'good', note: '已拍摄' },
                { name: '左前排座椅', status: 'good', note: '已拍摄' },
                { name: '车内顶棚', status: 'good', note: '已拍摄' },
                { name: '发动机舱', status: 'good', note: '已拍摄' },
                { name: 'VIN钢印号', status: 'good', note: '已拍摄' },
                { name: '铭牌', status: 'good', note: '已拍摄' }
            ]
        }
    }
};

// ========================================
// Country Policies - ASEAN Focus
// ========================================
const countryPolicies = {
    'KH': {
        name: '柬埔寨',
        nameEn: 'Cambodia',
        policies: {
            age: { max: 15, strict: false },
            emissions: { required: false, standard: null },
            leftHandDrive: { allowed: true, note: '允许左舵车进口' },
            electricVehicle: { encouraged: true, incentives: true, subsidy: false },
            batteryHealth: { min: 75, strict: false },
            inspection: { required: true, validity: 12 },
            customs: { duty: { ev: 0, hybrid: 10, ice: 35 }, vat: 10 },
            registration: { required: true, fee: 500 }
        },
        notes: [
            '电动汽车进口关税为0%（2024年政策）',
            '左舵车和右舵车均可进口，无方向限制',
            '电池健康度要求相对宽松',
            '需要办理进口许可证',
            '二手车市场活跃，中国新能源车受欢迎'
        ],
        opportunities: [
            '柬埔寨政府鼓励新能源汽车发展',
            '中国品牌在柬埔寨认知度高',
            '充电基础设施正在快速建设中'
        ],
        challenges: [
            '道路条件较差，建议选择SUV车型',
            '维修服务网络有待完善'
        ]
    },
    'TH': {
        name: '泰国',
        nameEn: 'Thailand',
        policies: {
            age: { max: 5, strict: true },
            emissions: { required: true, standard: 'Euro 5' },
            leftHandDrive: { allowed: false, note: '必须改装为右舵' },
            electricVehicle: { encouraged: true, incentives: true, subsidy: true },
            batteryHealth: { min: 85, strict: true },
            inspection: { required: true, validity: 6 },
            customs: { duty: { ev: 0, hybrid: 20, ice: 40 }, vat: 7 },
            registration: { required: true, fee: 800 }
        },
        notes: [
            '电动汽车进口关税0%（EV政策2022-2025）',
            '政府对EV有7万-15万泰铢购车补贴',
            '必须通过右舵改装才能上牌',
            '需要获得型式认证（TISI）',
            '电池健康度要求严格（≥85%）'
        ],
        opportunities: [
            '泰国是东南亚最大的汽车生产国',
            'EV市场增长迅速，政策支持力度大',
            '中国品牌在泰国市场份额快速增长'
        ],
        challenges: [
            '必须右舵改装，增加成本约2-5万元',
            '车龄限制严格（5年以内）',
            '需要通过严格的型式认证'
        ]
    },
    'VN': {
        name: '越南',
        nameEn: 'Vietnam',
        policies: {
            age: { max: 5, strict: true },
            emissions: { required: true, standard: 'Euro 4' },
            leftHandDrive: { allowed: false, note: '必须右舵' },
            electricVehicle: { encouraged: true, incentives: false, subsidy: false },
            batteryHealth: { min: 80, strict: false },
            inspection: { required: true, validity: 12 },
            customs: { duty: { ev: 0, hybrid: 25, ice: 45 }, vat: 10 },
            registration: { required: true, fee: 600 }
        },
        notes: [
            '电动汽车进口关税为0%',
            '仅允许右舵车进口',
            '需要通过型式认证',
            '河内、胡志明市限行区域较多'
        ],
        opportunities: [
            '摩托车大国向汽车转型中',
            '年轻人对新能源汽车接受度高'
        ],
        challenges: [
            '必须右舵改装',
            '充电基础设施尚不完善'
        ]
    },
    'LA': {
        name: '老挝',
        nameEn: 'Laos',
        policies: {
            age: { max: 12, strict: false },
            emissions: { required: false, standard: null },
            leftHandDrive: { allowed: true, note: '允许左舵' },
            electricVehicle: { encouraged: true, incentives: true, subsidy: false },
            batteryHealth: { min: 75, strict: false },
            inspection: { required: true, validity: 12 },
            customs: { duty: { ev: 5, hybrid: 15, ice: 30 }, vat: 10 },
            registration: { required: true, fee: 400 }
        },
        notes: [
            '电动汽车进口关税仅5%',
            '左舵车可直接进口',
            '车龄限制较宽松'
        ],
        opportunities: [
            '中国投资活跃，对中国车接受度高',
            '政策相对宽松'
        ],
        challenges: [
            '市场规模较小',
            '基础设施相对落后'
        ]
    },
    'MM': {
        name: '缅甸',
        nameEn: 'Myanmar',
        policies: {
            age: { max: 10, strict: false },
            emissions: { required: false, standard: null },
            leftHandDrive: { allowed: true, note: '允许左舵' },
            electricVehicle: { encouraged: false, incentives: false, subsidy: false },
            batteryHealth: { min: 75, strict: false },
            inspection: { required: true, validity: 12 },
            customs: { duty: { ev: 5, hybrid: 20, ice: 40 }, vat: 5 },
            registration: { required: true, fee: 300 }
        },
        notes: [
            '电动汽车进口关税约5%',
            '左舵车可直接进口',
            '市场尚处于起步阶段'
        ],
        opportunities: [
            '政策逐步开放中',
            '中国车品牌影响力强'
        ],
        challenges: [
            '政治局势不稳定',
            '基础设施落后',
            '金融服务不完善'
        ]
    },
    'MY': {
        name: '马来西亚',
        nameEn: 'Malaysia',
        policies: {
            age: { max: 5, strict: true },
            emissions: { required: true, standard: 'Euro 4' },
            leftHandDrive: { allowed: false, note: '必须右舵' },
            electricVehicle: { encouraged: true, incentives: true, taxExemption: true },
            batteryHealth: { min: 85, strict: true },
            inspection: { required: true, validity: 12 },
            customs: { duty: { ev: 0, hybrid: 15, ice: 30 }, vat: 10 },
            registration: { required: true, fee: 700 }
        },
        notes: [
            '电动汽车免进口税',
            '有道路税减免',
            '需要右舵改装',
            '需要通过SIRIM认证'
        ],
        opportunities: [
            '人均GDP较高，购买力强',
            'EV充电基础设施较完善'
        ],
        challenges: [
            '需要右舵改装',
            '本土品牌保护政策'
        ]
    },
    'SG': {
        name: '新加坡',
        nameEn: 'Singapore',
        policies: {
            age: { max: 3, strict: true },
            emissions: { required: true, standard: 'Euro 6' },
            leftHandDrive: { allowed: false, note: '必须右舵' },
            electricVehicle: { encouraged: true, incentives: true, coe: true },
            batteryHealth: { min: 90, strict: true },
            inspection: { required: true, validity: 6 },
            customs: { duty: { ev: 0, hybrid: 8, ice: 20 }, vat: 8 },
            registration: { required: true, fee: 1000 }
        },
        notes: [
            '需申请COE（拥车证）',
            '碳排放要求严格',
            '需要右舵改装',
            'VITAS认证要求高'
        ],
        opportunities: [
            '人均收入高，购买力强',
            '政府大力推广EV'
        ],
        challenges: [
            'COE价格昂贵',
            '车龄限制极严格（3年内）',
            '认证要求极高'
        ]
    },
    'ID': {
        name: '印度尼西亚',
        nameEn: 'Indonesia',
        policies: {
            age: { max: 5, strict: true },
            emissions: { required: true, standard: 'Euro 4' },
            leftHandDrive: { allowed: false, note: '必须右舵' },
            electricVehicle: { encouraged: true, incentives: true, subsidy: false },
            batteryHealth: { min: 80, strict: false },
            inspection: { required: true, validity: 12 },
            customs: { duty: { ev: 0, hybrid: 20, ice: 40 }, vat: 11 },
            registration: { required: true, fee: 500 }
        },
        notes: [
            '电动汽车进口关税0%',
            '需要右舵改装',
            '需要通过SNI认证'
        ],
        opportunities: [
            '人口众多，市场潜力大',
            '政府有EV推广计划'
        ],
        challenges: [
            '需要右舵改装',
            '认证流程复杂',
            '充电基础设施不足'
        ]
    },
    'PH': {
        name: '菲律宾',
        nameEn: 'Philippines',
        policies: {
            age: { max: 5, strict: false },
            emissions: { required: true, standard: 'Euro 4' },
            leftHandDrive: { allowed: false, note: '必须右舵' },
            electricVehicle: { encouraged: true, incentives: true, subsidy: false },
            batteryHealth: { min: 80, strict: false },
            inspection: { required: true, validity: 12 },
            customs: { duty: { ev: 0, hybrid: 15, ice: 30 }, vat: 12 },
            registration: { required: true, fee: 400 }
        },
        notes: [
            '电动汽车进口关税0%',
            '需要右舵改装',
            '需要通过LTO认证'
        ],
        opportunities: [
            '英语普及，沟通便利',
            '年轻人对EV接受度高'
        ],
        challenges: [
            '需要右舵改装',
            '充电基础设施不完善'
        ]
    },
    'BN': {
        name: '文莱',
        nameEn: 'Brunei',
        policies: {
            age: { max: 7, strict: false },
            emissions: { required: false, standard: null },
            leftHandDrive: { allowed: false, note: '必须右舵' },
            electricVehicle: { encouraged: true, incentives: true, subsidy: false },
            batteryHealth: { min: 80, strict: false },
            inspection: { required: true, validity: 12 },
            customs: { duty: { ev: 5, hybrid: 15, ice: 30 }, vat: 0 },
            registration: { required: true, fee: 300 }
        },
        notes: [
            '电动汽车进口关税较低',
            '免税国家，无VAT',
            '需要右舵改装'
        ],
        opportunities: [
            '人均GDP极高',
            '无个人所得税'
        ],
        challenges: [
            '市场规模很小',
            '需要右舵改装'
        ]
    }
};

// ========================================
// Utility Functions
// ========================================
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle',
        error: 'fa-times-circle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function showModal(title, content, buttons = []) {
    const modal = document.getElementById('modal');
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = content;
    
    const footer = document.getElementById('modal-footer');
    if (buttons.length === 0) {
        footer.innerHTML = '<button class="btn-primary" onclick="closeModal()">确定</button>';
    } else {
        footer.innerHTML = buttons.map(btn => 
            `<button class="${btn.class || 'btn-secondary'}" onclick="${btn.action}">${btn.text}</button>`
        ).join('');
    }
    
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

function formatCurrency(amount, currency = 'CNY') {
    return new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('zh-CN');
}

// ========================================
// Step Management
// ========================================
function goToStep(step) {
    if (step < 1 || step > AppState.totalSteps) return;
    
    // Validate previous steps
    if (step > 1 && !AppState.licenseData) {
        showToast('请先完成行驶证识别', 'warning');
        return;
    }
    if (step > 2 && !AppState.reportData) {
        showToast('请先完成检测报告识别', 'warning');
        return;
    }
    if (step > 4 && !AppState.selectedCountry) {
        showToast('请先选择目标国家', 'warning');
        return;
    }
    
    AppState.currentStep = step;
    
    // Update step indicators
    document.querySelectorAll('.step').forEach((el, index) => {
        el.classList.remove('active', 'completed');
        if (index + 1 < step) {
            el.classList.add('completed');
        } else if (index + 1 === step) {
            el.classList.add('active');
        }
    });
    
    // Show current step content
    document.querySelectorAll('.step-content').forEach((el, index) => {
        el.classList.toggle('active', index + 1 === step);
    });
    
    // Special handling for step 3 (manual review)
    if (step === 3) {
        initManualReview();
    }
    
    // Special handling for step 4 (declaration info)
    if (step === 4) {
        loadDeclarationData();
    }
    
    // Special handling for step 5 (compliance check and result)
    if (step === 5) {
        startComplianceCheck();
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextStep() {
    goToStep(AppState.currentStep + 1);
}

function prevStep() {
    goToStep(AppState.currentStep - 1);
}

// ========================================
// Step 1: License Recognition
// ========================================
function initLicenseUpload() {
    const uploadArea = document.getElementById('license-upload-area');
    const fileInput = document.getElementById('license-input');
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleLicenseUpload(file);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleLicenseUpload(file);
        }
    });
    
    document.getElementById('btn-demo-license').addEventListener('click', () => {
        useDemoLicenseData();
    });
    
    document.getElementById('btn-reupload-license').addEventListener('click', () => {
        resetLicenseUpload();
    });
    
    document.getElementById('btn-confirm-license').addEventListener('click', () => {
        confirmLicenseData();
    });
    
    document.getElementById('btn-step1-next').addEventListener('click', nextStep);
}

function handleLicenseUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('license-preview').src = e.target.result;
        document.getElementById('license-upload-area').classList.add('hidden');
        document.getElementById('license-preview-area').classList.remove('hidden');
        
        // Start AI recognition simulation
        startLicenseRecognition();
    };
    reader.readAsDataURL(file);
}

function startLicenseRecognition() {
    const overlay = document.getElementById('scanning-overlay');
    const line = document.getElementById('scanning-line');
    
    overlay.classList.remove('hidden');
    line.classList.add('active');
    
    // Simulate AI recognition process
    setTimeout(() => {
        // Generate simulated data based on the demo
        AppState.licenseData = { ...demoLicenseData };
        displayLicenseResult();
        
        overlay.classList.add('hidden');
        line.classList.remove('active');
        showToast('行驶证识别完成', 'success');
    }, 2500);
}

function displayLicenseResult() {
    const data = AppState.licenseData;
    
    document.getElementById('result-plate').textContent = data.plate;
    document.getElementById('result-type').textContent = data.type;
    document.getElementById('result-owner').textContent = data.owner;
    document.getElementById('result-usage').textContent = data.usage;
    document.getElementById('result-model').textContent = data.model;
    document.getElementById('result-vin').textContent = data.vin;
    document.getElementById('result-engine').textContent = data.engine;
    document.getElementById('result-reg-date').textContent = data.regDate;
    
    document.getElementById('license-result').classList.remove('hidden');
}

function useDemoLicenseData() {
    AppState.licenseData = { ...demoLicenseData };
    
    // Show a placeholder image
    document.getElementById('license-preview').src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iI2Y5ZmFmYiIvPgogIDx0ZXh0IHg9IjIwMCIgeT0iMTI1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7lj5bor4HnjKvnkIYgKOaIkOeri+Wbvik8L3RleHQ+Cjwvc3ZnPg==';
    
    document.getElementById('license-upload-area').classList.add('hidden');
    document.getElementById('license-preview-area').classList.remove('hidden');
    
    displayLicenseResult();
    showToast('已加载演示数据', 'info');
}

function resetLicenseUpload() {
    document.getElementById('license-upload-area').classList.remove('hidden');
    document.getElementById('license-preview-area').classList.add('hidden');
    document.getElementById('license-result').classList.add('hidden');
    document.getElementById('license-input').value = '';
    AppState.licenseData = null;
    document.getElementById('btn-step1-next').disabled = true;
}

function confirmLicenseData() {
    document.getElementById('btn-step1-next').disabled = false;
    
    if (AppState.licenseData) {
        // 更新step3Data
        AppState.step3Data = AppState.step3Data || {};
        AppState.step3Data.plate = AppState.licenseData.plate || AppState.step3Data.plate;
        AppState.step3Data.vin = AppState.licenseData.vin || AppState.step3Data.vin;
        
        // 解析品牌和型号
        const modelParts = (AppState.licenseData.model || '').split(' ');
        if (modelParts.length >= 2) {
            AppState.step3Data.brand = modelParts[0] || AppState.step3Data.brand;
            AppState.step3Data.model = modelParts.slice(1).join(' ') || AppState.step3Data.model;
        }
        
        // 解析年份
        if (AppState.licenseData.regDate) {
            const year = AppState.licenseData.regDate.split('-')[0];
            AppState.step3Data.year = parseInt(year) || AppState.step3Data.year;
            AppState.step3Data.regDate = AppState.licenseData.regDate;
        }
        
        AppState.step3Data.engine = AppState.licenseData.engine || AppState.step3Data.engine;
        AppState.step3Data.usage = AppState.licenseData.usage || AppState.step3Data.usage;
    }
    
    showToast('识别结果已确认', 'success');
}

// ========================================
// Step 2: Report Recognition
// ========================================
function initReportUpload() {
    const uploadArea = document.getElementById('report-upload-area');
    const fileInput = document.getElementById('report-input');
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) {
            handleReportUpload(file);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleReportUpload(file);
        }
    });
    
    document.getElementById('btn-demo-report').addEventListener('click', () => {
        useDemoReportData();
    });
    
    document.getElementById('btn-reupload-report').addEventListener('click', () => {
        resetReportUpload();
    });
    
    document.getElementById('btn-confirm-report').addEventListener('click', () => {
        confirmReportData();
    });
    
    document.getElementById('btn-step2-prev').addEventListener('click', prevStep);
    document.getElementById('btn-step2-next').addEventListener('click', nextStep);
}

function handleReportUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('report-preview').src = e.target.result;
        document.getElementById('report-upload-area').classList.add('hidden');
        document.getElementById('report-preview-area').classList.remove('hidden');
        
        // Start AI recognition simulation
        startReportRecognition();
    };
    reader.readAsDataURL(file);
}

function startReportRecognition() {
    const overlay = document.getElementById('report-scanning-overlay');
    const line = document.getElementById('report-scanning-line');
    const progressBar = document.getElementById('report-scan-progress');
    const progressText = document.getElementById('report-scan-text');
    
    line.classList.add('active');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            setTimeout(() => {
                AppState.reportData = { ...demoReportData };
                displayReportResult();
                overlay.classList.add('hidden');
                line.classList.remove('active');
                showToast('检测报告识别完成', 'success');
            }, 500);
        }
        
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;
    }, 300);
}

function displayReportResult() {
    const data = AppState.reportData;
    
    document.getElementById('summary-good').textContent = data.goodItems;
    document.getElementById('summary-warning').textContent = data.warningItems;
    document.getElementById('summary-danger').textContent = data.dangerItems;
    document.getElementById('summary-score').textContent = `${data.score}分 (${data.grade}级)`;
    
    // Render detailed inspection items
    renderDetailedItems(data.detailedItems);
    
    document.getElementById('detection-summary').classList.remove('hidden');
}

// Render detailed inspection items list
// 当前编辑中的项目索引
let currentEditingItem = null;

function renderDetailedItems(detailedItems) {
    if (!detailedItems) return;
    
    const container = document.getElementById('inspection-categories');
    if (!container) return;
    
    const categories = [
        { key: 'bodyPaint', label: '车身漆面', icon: 'fa-spray-can' },
        { key: 'basicPhotos', label: '基本照片检测', icon: 'fa-camera' },
        { key: 'bodyFrame', label: '车身骨架', icon: 'fa-car-side' },
        { key: 'requiredItems', label: '必检项（结构件）', icon: 'fa-clipboard-check' },
        { key: 'vehicleCondition', label: '车况检测', icon: 'fa-stethoscope' },
        { key: 'electromechanical', label: '机电系统', icon: 'fa-bolt' }
    ];
    
    let html = '';
    
    categories.forEach(cat => {
        const categoryData = detailedItems[cat.key];
        if (!categoryData || !categoryData.items) return;
        
        const goodCount = categoryData.items.filter(i => i.status === 'good').length;
        const warningCount = categoryData.items.filter(i => i.status === 'warning').length;
        const dangerCount = categoryData.items.filter(i => i.status === 'danger').length;
        
        html += `
            <div class="inspection-category" data-category="${cat.key}">
                <div class="category-header">
                    <div class="category-icon">
                        <i class="fas ${cat.icon}"></i>
                    </div>
                    <span class="category-title">${categoryData.category || cat.label}</span>
                    <span class="category-count">
                        <i class="fas fa-check-circle" style="color: var(--success-color);"></i> ${goodCount}
                        ${warningCount > 0 ? `<i class="fas fa-exclamation-triangle" style="color: var(--warning-color); margin-left: 8px;"></i> ${warningCount}` : ''}
                        ${dangerCount > 0 ? `<i class="fas fa-times-circle" style="color: var(--danger-color); margin-left: 8px;"></i> ${dangerCount}` : ''}
                    </span>
                </div>
                <div class="category-items">
                    ${categoryData.items.map((item, index) => `
                        <div class="category-item ${item.status} editable-item" 
                             data-category="${cat.key}" 
                             data-index="${index}"
                             onclick="openItemEditModal('${cat.key}', ${index})">
                            <i class="fas fa-${item.status === 'good' ? 'check-circle' : item.status === 'warning' ? 'exclamation-triangle' : 'times-circle'}"></i>
                            <span class="item-name">${item.name}</span>
                            ${item.note ? `<span class="item-status">${item.note}</span>` : ''}
                            <i class="fas fa-pencil-alt edit-icon" style="margin-left: auto; opacity: 0.5;"></i>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 初始化检测项目明细的编辑功能
function initDetailedItemsEditing() {
    // 编辑功能通过 onclick 属性绑定到每个项目上
    // 这里可以添加额外的初始化逻辑
}

// 打开项目编辑模态框
function openItemEditModal(categoryKey, itemIndex) {
    if (!AppState.reportData || !AppState.reportData.detailedItems) return;
    
    const category = AppState.reportData.detailedItems[categoryKey];
    if (!category || !category.items[itemIndex]) return;
    
    const item = category.items[itemIndex];
    currentEditingItem = { categoryKey, itemIndex };
    
    const content = `
        <div class="edit-item-form">
            <div class="form-group">
                <label>项目名称</label>
                <input type="text" id="edit-item-name" value="${item.name}" placeholder="项目名称">
            </div>
            <div class="form-group">
                <label>检测状态</label>
                <select id="edit-item-status">
                    <option value="good" ${item.status === 'good' ? 'selected' : ''}>正常 (good)</option>
                    <option value="warning" ${item.status === 'warning' ? 'selected' : ''}>警告 (warning)</option>
                    <option value="danger" ${item.status === 'danger' ? 'selected' : ''}>异常 (danger)</option>
                </select>
            </div>
            <div class="form-group">
                <label>备注</label>
                <textarea id="edit-item-note" rows="3" placeholder="备注信息">${item.note || ''}</textarea>
            </div>
        </div>
    `;
    
    showModal('编辑检测项目', content, [
        { text: '取消', class: 'btn-secondary', action: 'closeModal()' },
        { text: '保存', class: 'btn-primary', action: 'saveItemEdit()' }
    ]);
}

// 保存项目编辑
function saveItemEdit() {
    if (!currentEditingItem || !AppState.reportData) return;
    
    const { categoryKey, itemIndex } = currentEditingItem;
    const category = AppState.reportData.detailedItems[categoryKey];
    if (!category || !category.items[itemIndex]) return;
    
    const nameInput = document.getElementById('edit-item-name');
    const statusInput = document.getElementById('edit-item-status');
    const noteInput = document.getElementById('edit-item-note');
    
    if (nameInput && statusInput) {
        category.items[itemIndex].name = nameInput.value;
        category.items[itemIndex].status = statusInput.value;
        category.items[itemIndex].note = noteInput ? noteInput.value : '';
        
        // 重新渲染检测项目列表
        renderDetailedItems(AppState.reportData.detailedItems);
        showToast('检测项目已更新', 'success');
    }
    
    closeModal();
    currentEditingItem = null;
}

function useDemoReportData() {
    AppState.reportData = { ...demoReportData };
    
    // Use the provided image as preview - using correct relative path
    document.getElementById('report-preview').src = '../1528DDEF4FC1236E6ABC03C677685F95.jpg';
    
    document.getElementById('report-upload-area').classList.add('hidden');
    document.getElementById('report-preview-area').classList.remove('hidden');
    document.getElementById('report-scanning-overlay').classList.add('hidden');
    
    displayReportResult();
    
    // Auto confirm for demo
    confirmReportData();
    
    showToast('已加载示例检测报告（大众帕萨特2022款）', 'info');
}

function resetReportUpload() {
    document.getElementById('report-upload-area').classList.remove('hidden');
    document.getElementById('report-preview-area').classList.add('hidden');
    document.getElementById('detection-summary').classList.add('hidden');
    document.getElementById('report-input').value = '';
    AppState.reportData = null;
    document.getElementById('btn-step2-next').disabled = true;
}

function confirmReportData() {
    document.getElementById('btn-step2-next').disabled = false;
    
    if (AppState.reportData) {
        AppState.step3Data = AppState.step3Data || {};
        
        // 更新电池信息
        if (AppState.reportData.battery) {
            AppState.step3Data.batteryType = AppState.reportData.battery.type || AppState.step3Data.batteryType;
            AppState.step3Data.batteryCapacity = AppState.reportData.battery.capacity || AppState.step3Data.batteryCapacity;
            AppState.step3Data.batteryHealth = AppState.reportData.battery.health || AppState.step3Data.batteryHealth;
            AppState.step3Data.range = AppState.reportData.battery.range || AppState.step3Data.range;
        }
        
        // 更新检测信息
        AppState.step3Data.inspectionOrg = AppState.reportData.inspectionOrg || AppState.step3Data.inspectionOrg;
        AppState.step3Data.reportNo = AppState.reportData.reportNo || AppState.step3Data.reportNo;
        AppState.step3Data.score = AppState.reportData.score || AppState.step3Data.score;
        AppState.step3Data.grade = AppState.reportData.grade || AppState.step3Data.grade;
        AppState.step3Data.mileage = AppState.reportData.mileage || AppState.step3Data.mileage;
        
        // 更新问题列表
        if (AppState.reportData.issues) {
            AppState.step3Data.issues = AppState.reportData.issues.map(issue => ({
                id: issue.id || Date.now(),
                name: issue.title || issue.name || '未命名',
                desc: issue.description || issue.desc || '',
                severity: issue.severity === 'minor' ? '轻微' : 
                          issue.severity === 'warning' ? '一般' : '轻微'
            }));
        }
    }
    
    showToast('检测报告已确认', 'success');
}

function renderIssues(issues) {
    const container = document.getElementById('issues-container');
    
    if (!issues || issues.length === 0) {
        container.innerHTML = `
            <div class="issues-placeholder">
                <i class="fas fa-check-circle"></i>
                <p>未检测到问题，车辆状况良好</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = issues.map(issue => `
        <div class="issue-item ${issue.severity}">
            <div class="issue-icon">
                <i class="fas fa-${issue.severity === 'danger' ? 'times' : issue.severity === 'warning' ? 'exclamation' : 'info'}-circle"></i>
            </div>
            <div class="issue-content">
                <span class="issue-title">${issue.title}</span>
                <span class="issue-desc">${issue.description}</span>
                <span class="issue-cost">预估修复费用: ¥${issue.cost}</span>
            </div>
        </div>
    `).join('');
}

// ========================================
// Step 3: Manual Review
// ========================================
function initManualReview() {
    // 填充Step 3表单
    fillStep3Form();
    
    // 渲染问题列表
    renderIssuesList();
    
    // 绑定事件
    bindManualReviewEvents();
}

function fillStep3Form() {
    const data = AppState.step3Data;
    
    const safeSetValue = (id, value) => {
        const el = document.getElementById(id);
        if (el && value !== undefined && value !== null) {
            el.value = value;
        }
    };
    
    // 车辆识别信息
    safeSetValue('form-plate', data.plate);
    safeSetValue('form-vin', data.vin);
    safeSetValue('form-engine', data.engine);
    safeSetValue('form-reg-date', data.regDate);
    
    // 车辆属性信息
    safeSetValue('form-brand', data.brand);
    safeSetValue('form-model', data.model);
    safeSetValue('form-year', data.year);
    safeSetValue('form-mileage', data.mileage);
    safeSetValue('form-color', data.color);
    safeSetValue('form-usage', data.usage);
    safeSetValue('form-power-type', data.powerType);
    
    // 电池核心参数
    safeSetValue('form-battery-type', data.batteryType);
    safeSetValue('form-battery-capacity', data.batteryCapacity);
    safeSetValue('form-battery-health', data.batteryHealth);
    safeSetValue('form-range', data.range);
    
    // 电池状态信息
    safeSetValue('form-battery-status', data.batteryStatus);
    safeSetValue('form-is-dangerous', data.isDangerous);
    safeSetValue('form-package-type', data.packageType);
    
    // 检测结果摘要（卡片式）
    const safeSetText = (id, text) => {
        const el = document.getElementById(id);
        if (el && text !== undefined && text !== null) {
            el.textContent = text;
        }
    };
    
    safeSetText('display-inspection-org', data.inspectionOrg);
    safeSetText('display-report-no', data.reportNo);
    safeSetText('display-score', data.score + '分');
    safeSetText('display-grade', data.grade);
    safeSetText('display-auditor', data.auditor);
    safeSetText('display-notes', data.auditNotes);
}

function renderIssuesList() {
    const container = document.getElementById('editable-issues-list');
    const data = AppState.step3Data;
    
    if (!data.issues || data.issues.length === 0) {
        container.innerHTML = `
            <div class="issues-empty-state">
                <i class="fas fa-check-circle"></i>
                <p>暂无检测问题</p>
                <span class="hint">点击右上角"添加问题"按钮添加</span>
            </div>
        `;
        return;
    }
    
    container.innerHTML = data.issues.map((issue, index) => `
        <div class="issue-item-compact ${getSeverityClass(issue.severity)}" data-index="${index}">
            <div class="issue-icon">
                <i class="fas fa-${getSeverityIcon(issue.severity)}"></i>
            </div>
            <div class="issue-content">
                <div class="issue-name">${issue.name}</div>
                <div class="issue-desc">${issue.desc}</div>
            </div>
            <div class="issue-severity-badge">${issue.severity}</div>
            <div class="issue-actions">
                <button class="btn-icon" onclick="editIssue(${index})" title="编辑">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="deleteIssue(${index})" title="删除">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function getSeverityClass(severity) {
    const map = {
        '轻微': 'minor',
        '一般': 'warning',
        '严重': 'danger'
    };
    return map[severity] || 'minor';
}

function getSeverityIcon(severity) {
    const map = {
        '轻微': 'info-circle',
        '一般': 'exclamation-triangle',
        '严重': 'times-circle'
    };
    return map[severity] || 'info-circle';
}

function renderEditableIssues() {
    const container = document.getElementById('editable-issues-list');
    if (!container) return;
    
    const issues = AppState.auditData.issues;
    
    if (!issues || issues.length === 0) {
        container.innerHTML = `
            <div class="issues-placeholder">
                <i class="fas fa-info-circle"></i>
                <p>暂无检测项目，点击上方"添加检测项目"按钮添加</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = issues.map((issue, index) => `
        <div class="editable-issue-item ${issue.severity}" data-index="${index}">
            <div class="issue-header">
                <select class="issue-severity-select" onchange="updateIssue(${index}, 'severity', this.value)">
                    <option value="minor" ${issue.severity === 'minor' ? 'selected' : ''}>轻微</option>
                    <option value="warning" ${issue.severity === 'warning' ? 'selected' : ''}>警告</option>
                    <option value="danger" ${issue.severity === 'danger' ? 'selected' : ''}>严重</option>
                </select>
                <select class="issue-category-select" onchange="updateIssue(${index}, 'category', this.value)">
                    <option value="漆面" ${issue.category === '漆面' ? 'selected' : ''}>漆面</option>
                    <option value="骨架" ${issue.category === '骨架' ? 'selected' : ''}>骨架</option>
                    <option value="内饰" ${issue.category === '内饰' ? 'selected' : ''}>内饰</option>
                    <option value="电器" ${issue.category === '电器' ? 'selected' : ''}>电器</option>
                    <option value="底盘" ${issue.category === '底盘' ? 'selected' : ''}>底盘</option>
                    <option value="发动机" ${issue.category === '发动机' ? 'selected' : ''}>发动机</option>
                    <option value="电池" ${issue.category === '电池' ? 'selected' : ''}>电池</option>
                    <option value="其他" ${issue.category === '其他' ? 'selected' : ''}>其他</option>
                </select>
                <button class="btn-icon btn-delete" onclick="deleteIssue(${index})" title="删除">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
            <div class="issue-body">
                <input type="text" class="issue-title-input" placeholder="检测项目标题" 
                       value="${issue.title || ''}" onchange="updateIssue(${index}, 'title', this.value)">
                <textarea class="issue-desc-input" placeholder="问题描述" 
                          onchange="updateIssue(${index}, 'description', this.value)">${issue.description || ''}</textarea>
                <div class="issue-cost-row">
                    <label>修复费用:</label>
                    <input type="number" class="issue-cost-input" placeholder="0" min="0"
                           value="${issue.cost || 0}" onchange="updateIssue(${index}, 'cost', parseFloat(this.value) || 0)">
                    <span>元</span>
                </div>
            </div>
        </div>
    `).join('');
}

function addIssue() {
    const newIssue = {
        id: Date.now(),
        severity: 'minor',
        title: '新检测项目',
        description: '',
        cost: 0,
        category: '其他'
    };
    
    AppState.auditData.issues.push(newIssue);
    renderEditableIssues();
    showToast('已添加新检测项目', 'success');
}

function deleteIssue(index) {
    AppState.auditData.issues.splice(index, 1);
    renderEditableIssues();
    showToast('已删除检测项目', 'info');
}

function updateIssue(index, field, value) {
    if (AppState.auditData.issues[index]) {
        AppState.auditData.issues[index][field] = value;
    }
}

function saveAuditData() {
    const getValue = (id) => {
        const el = document.getElementById(id);
        return el ? el.value : '';
    };
    
    // 保存到step3Data
    AppState.step3Data = {
        // 基本信息
        plate: getValue('form-plate'),
        brand: getValue('form-brand'),
        model: getValue('form-model'),
        year: parseInt(getValue('form-year')) || 0,
        vin: getValue('form-vin'),
        engine: getValue('form-engine'),
        regDate: getValue('form-reg-date'),
        mileage: parseInt(getValue('form-mileage')) || 0,
        color: getValue('form-color'),
        usage: getValue('form-usage'),
        powerType: getValue('form-power-type'),
        
        // 新能源信息
        batteryType: getValue('form-battery-type'),
        batteryCapacity: parseFloat(getValue('form-battery-capacity')) || 0,
        batteryHealth: parseInt(getValue('form-battery-health')) || 0,
        range: parseInt(getValue('form-range')) || 0,
        batteryStatus: getValue('form-battery-status'),
        isDangerous: getValue('form-is-dangerous'),
        packageType: getValue('form-package-type'),
        
        // 检测结果摘要
        inspectionOrg: document.getElementById('display-inspection-org')?.textContent || '',
        reportNo: document.getElementById('display-report-no')?.textContent || '',
        score: parseInt(document.getElementById('display-score')?.textContent) || 0,
        grade: document.getElementById('display-grade')?.textContent || '',
        auditor: document.getElementById('display-auditor')?.textContent || '',
        auditNotes: document.getElementById('display-notes')?.textContent || '',
        
        // 问题列表
        issues: AppState.step3Data?.issues || []
    };
    
    // 同时更新vehicleInfo供后续步骤使用
    AppState.vehicleInfo = {
        plate: AppState.step3Data.plate,
        brand: AppState.step3Data.brand,
        model: AppState.step3Data.model,
        year: AppState.step3Data.year,
        vin: AppState.step3Data.vin,
        mileage: AppState.step3Data.mileage,
        batteryType: AppState.step3Data.batteryType,
        batteryCapacity: AppState.step3Data.batteryCapacity,
        batteryHealth: AppState.step3Data.batteryHealth,
        range: AppState.step3Data.range
    };
    
    showToast('审核信息已保存', 'success');
    return true;
}

function initManualReviewEvents() {
    // Add issue button
    const addBtn = document.getElementById('btn-add-issue');
    if (addBtn) {
        addBtn.addEventListener('click', addIssue);
    }
    
    // Navigation buttons
    const prevBtn = document.getElementById('btn-step3-prev');
    const nextBtn = document.getElementById('btn-step3-next');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', prevStep);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            // 保存数据并验证，成功后跳转
            if (saveAuditData()) {
                nextStep();
            }
        });
    }
    
    // 初始化检测项目明细的编辑功能
    initDetailedItemsEditing();
}

// ========================================
// Step 4: Declaration Information
// ========================================
function loadDeclarationData() {
    // Step 4现在只显示摘要信息
    if (AppState.step3Data) {
        renderVehicleSummary(AppState.step3Data);
    }
}

function renderVehicleSummary(data) {
    // 填充各个字段
    const fields = [
        { id: 'summary-plate', value: data.plate },
        { id: 'summary-brand', value: data.brand },
        { id: 'summary-model', value: data.model },
        { id: 'summary-vin', value: data.vin },
        { id: 'summary-year', value: data.year },
        { id: 'summary-mileage', value: data.mileage ? data.mileage + ' km' : '-' },
        { id: 'summary-power-type', value: data.powerType },
        { id: 'summary-battery-type', value: data.batteryType },
        { id: 'summary-battery-capacity', value: data.batteryCapacity ? data.batteryCapacity + ' kWh' : '-' },
        { id: 'summary-range', value: data.range ? data.range + ' km' : '-' }
    ];
    
    fields.forEach(field => {
        const el = document.getElementById(field.id);
        if (el) {
            el.textContent = field.value || '-';
        }
    });
}

function validateDeclarationForm() {
    // 修复字段映射 - 使用 form- 前缀
    const requiredFields = [
        'form-plate', 'form-vin', 'form-brand', 'form-model',
        'form-company-name', 'form-credit-code'
    ];
    
    let isValid = true;
    let firstInvalidField = null;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !field.value.trim()) {
            field.style.borderColor = 'var(--danger-color)';
            field.style.borderWidth = '2px';
            isValid = false;
            if (!firstInvalidField) firstInvalidField = field;
        } else if (field) {
            field.style.borderColor = '';
            field.style.borderWidth = '';
        }
    });
    
    if (!isValid) {
        showToast('请填写所有必填项（标红字段）', 'error');
        if (firstInvalidField) {
            firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstInvalidField.focus();
        }
    }
    
    return isValid;
}

function saveDeclarationInfo() {
    // Step 4现在只使用step3Data，不需要额外保存
    // 但保留vehicleInfo的更新以供后续步骤使用
    if (AppState.step3Data) {
        AppState.vehicleInfo = {
            plate: AppState.step3Data.plate,
            brand: AppState.step3Data.brand,
            model: AppState.step3Data.model,
            year: AppState.step3Data.year,
            vin: AppState.step3Data.vin,
            engine: AppState.step3Data.engine,
            mileage: AppState.step3Data.mileage,
            batteryType: AppState.step3Data.batteryType,
            batteryCapacity: AppState.step3Data.batteryCapacity,
            batteryHealth: AppState.step3Data.batteryHealth,
            range: AppState.step3Data.range
        };
    }
}

function initDeclarationForm() {
    const prevBtn = document.getElementById('btn-step4-prev');
    const nextBtn = document.getElementById('btn-step4-next');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', prevStep);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (!AppState.selectedCountry) {
                showToast('请先选择目标国家', 'warning');
                return;
            }
            // 保存报关信息并更新vehicleInfo
            saveDeclarationInfo();
            // 进入政策检测
            goToStep(5);
            startComplianceCheck();
        });
    }
}

// 更新检测摘要显示（Step 4）
function updateInspectionSummaryDisplay() {
    // 更新检测报告摘要
    if (AppState.reportData) {
        const displayOrg = document.getElementById('display-inspection-org');
        const displayReportNo = document.getElementById('display-report-no');
        const displayScore = document.getElementById('display-score');
        const displayGrade = document.getElementById('display-grade');
        
        if (displayOrg) displayOrg.textContent = AppState.reportData.inspectionOrg || '-';
        if (displayReportNo) displayReportNo.textContent = AppState.reportData.reportNo || '-';
        if (displayScore) displayScore.textContent = AppState.reportData.score ? AppState.reportData.score + '分' : '-';
        if (displayGrade) displayGrade.textContent = AppState.reportData.grade ? AppState.reportData.grade + '级' : '-';
    }
    
    // 更新审核人信息
    if (AppState.auditData) {
        const displayAuditor = document.getElementById('display-auditor');
        const displayNotes = document.getElementById('display-notes');
        
        if (displayAuditor) displayAuditor.textContent = AppState.auditData.auditor || '-';
        if (displayNotes) displayNotes.textContent = AppState.auditData.remarks || '-';
    }
    
    // 更新检测项目预览列表
    const previewList = document.getElementById('preview-list');
    if (previewList && AppState.auditData && AppState.auditData.issues) {
        if (AppState.auditData.issues.length === 0) {
            previewList.innerHTML = '<p class="no-issues">无检测问题</p>';
        } else {
            previewList.innerHTML = AppState.auditData.issues.map(issue => `
                <div class="preview-issue-item ${issue.severity}">
                    <i class="fas fa-${issue.severity === 'danger' ? 'times-circle' : issue.severity === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                    <span>${issue.title}</span>
                </div>
            `).join('');
        }
    }
}

// ========================================
// Step 5: Country Selection (was Step 4)
// ========================================
function prepareComplianceCheck() {
    // Ensure we have vehicle data before compliance check
    if (Object.keys(AppState.vehicleInfo).length === 0) {
        saveDeclarationInfo();
    }
}

function initVehicleForm() {
    // This function is kept for backward compatibility
    // Step 3 is now manual review, vehicle info is in step 4
}

function validateVehicleForm() {
    const requiredFields = [
        'form-plate', 'form-brand', 'form-model', 'form-year',
        'form-vin', 'form-mileage', 'form-battery-type',
        'form-battery-capacity', 'form-battery-health', 'form-range'
    ];
    
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            field.style.borderColor = 'var(--danger-color)';
            isValid = false;
        } else {
            field.style.borderColor = '';
        }
    });
    
    if (!isValid) {
        showToast('请填写所有必填项', 'error');
    }
    
    return isValid;
}

function saveVehicleInfo() {
    AppState.vehicleInfo = {
        plate: document.getElementById('form-plate').value,
        brand: document.getElementById('form-brand').value,
        model: document.getElementById('form-model').value,
        year: parseInt(document.getElementById('form-year').value),
        vin: document.getElementById('form-vin').value,
        mileage: parseInt(document.getElementById('form-mileage').value),
        batteryType: document.getElementById('form-battery-type').value,
        batteryCapacity: parseFloat(document.getElementById('form-battery-capacity').value),
        batteryHealth: parseInt(document.getElementById('form-battery-health').value),
        range: parseInt(document.getElementById('form-range').value),
        driveType: document.getElementById('form-drive-type').value,
        chargingPort: document.getElementById('form-charging-port').value,
        inspectionOrg: document.getElementById('form-inspection-org').value,
        reportNo: document.getElementById('form-report-no').value,
        inspectionDate: document.getElementById('form-inspection-date').value,
        grade: document.getElementById('form-grade').value
    };
}

// ========================================
// Step 5: Country Selection
// ========================================
function initCountrySelection() {
    renderCountries('all');
    
    // Region tabs
    document.querySelectorAll('.region-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.region-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderCountries(btn.dataset.region);
        });
    });
    
    // Search
    const searchInput = document.getElementById('country-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = countriesData.filter(c => 
                c.name.toLowerCase().includes(query) ||
                c.nameEn.toLowerCase().includes(query) ||
                c.code.toLowerCase().includes(query)
            );
            renderCountries('all', filtered);
        });
    }
    
    const prevBtn = document.getElementById('btn-step5-prev');
    
    if (prevBtn) prevBtn.addEventListener('click', prevStep);
}

function renderCountries(region, countries = null) {
    const grid = document.getElementById('countries-grid');
    let data = countries || countriesData;
    
    if (region !== 'all' && !countries) {
        data = countriesData.filter(c => c.region === region || (region === 'southeast' && c.region === 'asean'));
    }
    
    // Sort priority countries first
    data.sort((a, b) => {
        if (a.priority && !b.priority) return -1;
        if (!a.priority && b.priority) return 1;
        return a.name.localeCompare(b.name);
    });
    
    grid.innerHTML = data.map(country => `
        <div class="country-card ${country.priority ? 'highlighted' : ''}" 
             data-code="${country.code}"
             onclick="selectCountry('${country.code}')">
            <span class="country-flag">${country.flag}</span>
            <span class="country-name">${country.name}</span>
            <span class="country-code">${country.code}</span>
        </div>
    `).join('');
}

function selectCountry(code) {
    const country = countriesData.find(c => c.code === code);
    if (!country) return;
    
    AppState.selectedCountry = country;
    
    // Update UI
    document.querySelectorAll('.country-card').forEach(card => {
        card.classList.toggle('selected', card.dataset.code === code);
    });
    
    // Update selected info
    const selectedContainer = document.getElementById('selected-country');
    selectedContainer.innerHTML = `
        <div class="selected-info">
            <span class="country-flag">${country.flag}</span>
            <div class="selected-details">
                <h4>${country.name} (${country.nameEn})</h4>
                <p>${country.region === 'asean' ? '东盟成员国' : '出口目标国'}</p>
            </div>
        </div>
    `;
    
    const btnStep4Next = document.getElementById('btn-step4-next');
    
    if (btnStep4Next) btnStep4Next.disabled = false;
    
    showToast(`已选择 ${country.name} 作为目标国家`, 'success');
}

// ========================================
// Step 6: Compliance Check
// ========================================
function startComplianceCheck() {
    const checkingContainer = document.getElementById('checking-container');
    const resultContainer = document.getElementById('result-container');
    const step6Nav = document.getElementById('step6-navigation') || document.getElementById('step5-navigation');
    
    if (checkingContainer) checkingContainer.classList.remove('hidden');
    if (resultContainer) resultContainer.classList.add('hidden');
    if (step6Nav) step6Nav.classList.add('hidden');
    
    const checkingItems = [
        { id: 'info', text: '读取车辆信息...', duration: 800 },
        { id: 'age', text: '检测车龄限制...', duration: 1000 },
        { id: 'battery', text: '检测电池健康度...', duration: 1200 },
        { id: 'emissions', text: '检测排放标准...', duration: 1000 },
        { id: 'drive', text: '检测驾驶位方向...', duration: 800 },
        { id: 'incentives', text: '查询EV优惠政策...', duration: 1200 },
        { id: 'customs', text: '计算关税费用...', duration: 1000 },
        { id: 'final', text: '生成合规报告...', duration: 800 }
    ];
    
    const container = document.getElementById('checking-items');
    container.innerHTML = checkingItems.map(item => `
        <div class="checking-item pending" id="check-${item.id}">
            <i class="fas fa-circle-notch"></i>
            <span>${item.text}</span>
        </div>
    `).join('');
    
    let currentIndex = 0;
    let totalProgress = 0;
    
    function processNextItem() {
        if (currentIndex > 0) {
            const prevItem = document.getElementById(`check-${checkingItems[currentIndex - 1].id}`);
            prevItem.classList.remove('processing');
            prevItem.classList.add('completed');
            prevItem.innerHTML = `<i class="fas fa-check-circle"></i><span>${checkingItems[currentIndex - 1].text}</span>`;
        }
        
        if (currentIndex >= checkingItems.length) {
            setTimeout(() => {
                showComplianceResult();
            }, 500);
            return;
        }
        
        const item = checkingItems[currentIndex];
        const element = document.getElementById(`check-${item.id}`);
        element.classList.remove('pending');
        element.classList.add('processing');
        
        document.getElementById('checking-status').textContent = item.text;
        
        // Update progress
        const progressIncrement = 100 / checkingItems.length;
        totalProgress += progressIncrement;
        document.getElementById('checking-progress-bar').style.width = `${Math.min(totalProgress, 100)}%`;
        document.getElementById('checking-percent').textContent = `${Math.round(Math.min(totalProgress, 100))}%`;
        
        currentIndex++;
        setTimeout(processNextItem, item.duration);
    }
    
    processNextItem();
}

function showComplianceResult() {
    const checkingContainer = document.getElementById('checking-container');
    const resultContainer = document.getElementById('result-container');
    const step6Nav = document.getElementById('step6-navigation') || document.getElementById('step5-navigation');
    
    if (checkingContainer) checkingContainer.classList.add('hidden');
    if (resultContainer) resultContainer.classList.remove('hidden');
    if (step6Nav) step6Nav.classList.remove('hidden');
    
    const country = AppState.selectedCountry;
    const vehicle = AppState.vehicleInfo;
    const policies = countryPolicies[country.code] || countryPolicies['TH'];
    
    // Generate compliance check results
    const results = performComplianceCheck(vehicle, policies);
    AppState.complianceResult = results;
    
    // Update UI
    const statusEl = document.getElementById('result-status');
    statusEl.className = 'result-status ' + results.overall;
    statusEl.innerHTML = results.overall === 'pass' 
        ? '<i class="fas fa-check-circle"></i><span>合规通过</span>'
        : results.overall === 'warning'
        ? '<i class="fas fa-exclamation-triangle"></i><span>条件通过</span>'
        : '<i class="fas fa-times-circle"></i><span>不合规</span>';
    
    document.getElementById('result-country-name').textContent = country.name;
    
    // Score animation
    animateScore(results.score);
    
    // Details
    document.getElementById('detail-pass').textContent = results.passCount;
    document.getElementById('detail-warning').textContent = results.warningCount;
    document.getElementById('detail-fail').textContent = results.failCount;
    
    // Compliance list
    const listContainer = document.getElementById('compliance-list');
    listContainer.innerHTML = results.items.map(item => `
        <div class="compliance-item ${item.status}">
            <div class="compliance-icon">
                <i class="fas fa-${item.status === 'pass' ? 'check' : item.status === 'warning' ? 'exclamation' : 'times'}"></i>
            </div>
            <div class="compliance-content">
                <span class="compliance-title">${item.title}</span>
                <span class="compliance-desc">${item.description}</span>
            </div>
            <span class="compliance-status">${item.statusText}</span>
        </div>
    `).join('');
    
    // Recommendations
    const recContainer = document.getElementById('recommendation-list');
    if (results.recommendations.length > 0) {
        document.getElementById('recommendations').classList.remove('hidden');
        recContainer.innerHTML = results.recommendations.map(rec => `
            <div class="recommendation-item">
                <i class="fas fa-lightbulb"></i>
                <p>${rec}</p>
            </div>
        `).join('');
    } else {
        document.getElementById('recommendations').classList.add('hidden');
    }
    
    // Export info
    const infoGrid = document.getElementById('export-info-grid');
    infoGrid.innerHTML = results.exportInfo.map(info => `
        <div class="info-item">
            <label>${info.label}</label>
            <span>${info.value}</span>
        </div>
    `).join('');
    
    // Render country specific details
    renderCountryDetails(policies);
}

function renderCountryDetails(policies) {
    // Add country specific section if not exists
    let detailsSection = document.getElementById('country-details');
    if (!detailsSection) {
        detailsSection = document.createElement('div');
        detailsSection.id = 'country-details';
        detailsSection.className = 'country-details';
        document.querySelector('.result-container').insertBefore(
            detailsSection, 
            document.getElementById('step5-navigation')
        );
    }
    
    const notesHtml = policies.notes ? policies.notes.map(note => `<li><i class="fas fa-info-circle"></i> ${note}</li>`).join('') : '';
    const opportunitiesHtml = policies.opportunities ? policies.opportunities.map(opp => `<li><i class="fas fa-thumbs-up"></i> ${opp}</li>`).join('') : '';
    const challengesHtml = policies.challenges ? policies.challenges.map(chal => `<li><i class="fas fa-exclamation-triangle"></i> ${chal}</li>`).join('') : '';
    
    detailsSection.innerHTML = `
        <div class="country-policy-details">
            <h3><i class="fas fa-flag"></i> ${policies.name} 出口政策详情</h3>
            
            <div class="policy-section">
                <h4><i class="fas fa-file-alt"></i> 重要政策说明</h4>
                <ul class="policy-notes">${notesHtml}</ul>
            </div>
            
            ${opportunitiesHtml ? `
            <div class="policy-section opportunities">
                <h4><i class="fas fa-chart-line"></i> 市场机会</h4>
                <ul>${opportunitiesHtml}</ul>
            </div>
            ` : ''}
            
            ${challengesHtml ? `
            <div class="policy-section challenges">
                <h4><i class="fas fa-shield-alt"></i> 注意事项</h4>
                <ul>${challengesHtml}</ul>
            </div>
            ` : ''}
        </div>
    `;
}

function performComplianceCheck(vehicle, policies) {
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - vehicle.year;
    const results = {
        items: [],
        recommendations: [],
        exportInfo: [],
        passCount: 0,
        warningCount: 0,
        failCount: 0,
        score: 0
    };
    
    // Age check
    if (vehicleAge <= policies.policies.age.max) {
        results.items.push({
            title: '车龄检测',
            description: `车辆年龄 ${vehicleAge} 年，符合要求（最大 ${policies.policies.age.max} 年）`,
            status: 'pass',
            statusText: '通过'
        });
        results.passCount++;
    } else if (policies.policies.age.strict) {
        results.items.push({
            title: '车龄检测',
            description: `车辆年龄 ${vehicleAge} 年，超过限制（最大 ${policies.policies.age.max} 年）`,
            status: 'fail',
            statusText: '未通过'
        });
        results.failCount++;
        results.recommendations.push(`⚠️ 风险提示：车龄${vehicleAge}年超过${policies.name}法规限制(${policies.policies.age.max}年)，建议转向其他市场或联系当地代理商详询特殊审批流程`);
    } else {
        results.items.push({
            title: '车龄检测',
            description: `车辆年龄 ${vehicleAge} 年，建议谨慎考虑`,
            status: 'warning',
            statusText: '警告'
        });
        results.warningCount++;
        results.recommendations.push(`📋 市场建议：车龄${vehicleAge}年较大，建议采用"高性价比"定位策略，目标客户群体可定位为价格敏感型买家或商用车队`);
    }
    
    // Battery health check
    if (vehicle.batteryHealth >= policies.policies.batteryHealth.min) {
        results.items.push({
            title: '电池健康度',
            description: `电池健康度 ${vehicle.batteryHealth}%，符合要求（最低 ${policies.policies.batteryHealth.min}%）`,
            status: 'pass',
            statusText: '通过'
        });
        results.passCount++;
        if (vehicle.batteryHealth >= 90) {
            results.recommendations.push(`🔹 销售卖点：电池健康度${vehicle.batteryHealth}%优秀，可作为核心竞争力，建议在广告中突出"高品质二手车"定位`);
        } else if (vehicle.batteryHealth >= 80) {
            results.recommendations.push(`📋 技术备注：电池健康度${vehicle.batteryHealth}%良好，建议出口前进行一次完整的BMS系统检测并出具报告，增强买家信任度`);
        } else {
            results.recommendations.push(`🔹 产品优势：车龄仅${vehicleAge}年，属于准新车，建议定价时可考虑${Math.round(vehicle.batteryHealth * 0.8)}%-${Math.round(vehicle.batteryHealth)}%的保值率`);
        }
    } else if (policies.policies.batteryHealth.strict) {
        results.items.push({
            title: '电池健康度',
            description: `电池健康度 ${vehicle.batteryHealth}%，低于要求（最低 ${policies.policies.batteryHealth.min}%）`,
            status: 'fail',
            statusText: '未通过'
        });
        results.failCount++;
        results.recommendations.push(`⚠️ 合规风险：电池健康度${vehicle.batteryHealth}%未达${policies.name}入境标准(${policies.policies.batteryHealth.min}%)，必须更换电池组或获取专业检测机构的特殊评估报告方可清关`);
    } else {
        results.items.push({
            title: '电池健康度',
            description: `电池健康度 ${vehicle.batteryHealth}%，略低于建议值`,
            status: 'warning',
            statusText: '警告'
        });
        results.warningCount++;
        const suggestedPrice = Math.round(vehicle.batteryHealth * 0.6);
        results.recommendations.push(`💰 定价策略：电池健康度${vehicle.batteryHealth}%偏低，建议采用"以价换量"策略，将售价调整至原价的${suggestedPrice}%-${suggestedPrice+10}%，同时提供电池质保或更换服务作为附加价值`);
    }
    
    // EV incentives
    if (policies.policies.electricVehicle.encouraged) {
        results.items.push({
            title: '新能源汽车政策',
            description: policies.policies.electricVehicle.incentives 
                ? '目标国鼓励新能源汽车进口，享受优惠政策'
                : '目标国接受新能源汽车进口',
            status: 'pass',
            statusText: '有利'
        });
        results.passCount++;
        
        if (policies.policies.electricVehicle.subsidy) {
            results.recommendations.push(`🎯 市场机会：${policies.name}对新能源汽车提供购车补贴，建议在销售资料中明确标注"可享受政府补贴"，这将显著提升产品竞争力`);
            results.recommendations.push(`📋 政策建议：${policies.name}对新能源汽车持正面态度，建议联合当地经销商申请"绿色通道"或优先清关资质，缩短交付周期`);
        } else {
            results.recommendations.push(`📊 市场分析：${policies.name}对新能源汽车中性政策，建议通过产品差异化(如续航里程、智能配置)和售后服务优势弥补缺乏补贴的影响`);
        }
    }
    
    // Left hand drive check
    if (policies.policies.leftHandDrive.allowed) {
        results.items.push({
            title: '驾驶位方向',
            description: '目标国允许左舵车进口',
            status: 'pass',
            statusText: '通过'
        });
        results.passCount++;
        results.recommendations.push(`✅ 成本优势：${policies.name}接受左舵车，无需改装，可节省成本约2-5万元及2-4周改装时间`);
    } else {
        results.items.push({
            title: '驾驶位方向',
            description: '目标国要求右舵车，需要改装',
            status: 'warning',
            statusText: '需改装'
        });
        results.warningCount++;
        results.recommendations.push(`🔧 运营方案：${policies.name}要求右舵，改装成本约2-5万元、工期2-4周。建议：1)选择当地有改装资质的合作伙伴；2)在报价时预留改装费用；3)考虑批量改装以降低单车成本`);
    }
    
    // Customs duty
    const duty = policies.policies.customs.duty.ev;
    results.items.push({
        title: '进口关税',
        description: `新能源汽车进口关税 ${duty}%`,
        status: duty === 0 ? 'pass' : 'warning',
        statusText: duty === 0 ? '免税' : `${duty}%`
    });
    if (duty === 0) {
        results.passCount++;
        results.recommendations.push(`🔹 利好政策：${policies.name}对新能源汽车免征进口关税，可显著降低终端售价或提升渠道利润率约5%-15%`);
    } else {
        results.warningCount++;
        const estimatedDutyCost = duty * 1000;
        results.recommendations.push(`💰 成本分析：关税${duty}%将增加约${estimatedDutyCost.toLocaleString()}-${(estimatedDutyCost*3).toLocaleString()}元/车的成本，建议：1)选择高端车型以吸收税负；2)考虑在${policies.name}设立分公司以享受本地企业优惠税率`);
    }
    
    // Calculate score
    const total = results.items.length;
    results.score = Math.round((results.passCount * 100 + results.warningCount * 50) / total);
    
    // Determine overall status
    if (results.failCount > 0) {
        results.overall = 'fail';
    } else if (results.warningCount > 0) {
        results.overall = 'warning';
    } else {
        results.overall = 'pass';
    }
    
    // Export info
    results.exportInfo = [
        { label: '目标国家', value: policies.name },
        { label: '车辆年龄', value: `${vehicleAge} 年` },
        { label: '电池健康度', value: `${vehicle.batteryHealth}%` },
        { label: '进口关税', value: `${duty}%` },
        { label: '检测有效期', value: `${policies.policies.inspection.validity} 个月` },
        { label: '需要改装', value: policies.policies.leftHandDrive.allowed ? '否' : '是' }
    ];
    
    // 添加综合建议
    if (results.passCount >= 4) {
        results.recommendations.push(`🎯 出口策略：该车辆综合条件优越，建议优先选择${policies.name}一线城市作为首批目标市场，通过体验店模式建立品牌认知`);
    } else if (results.warningCount >= 2) {
        results.recommendations.push(`📊 风控建议：该车辆存在多项需关注因素，建议先进行小批量试单（建议3-5台）验证市场反馈，确认清关流程和客户接受度后再扩大规模`);
    }

    // 添加文件准备建议
    results.recommendations.push(`📋 文件清单：出口${policies.name}需准备：1)商务部出具的出口许可证；2)CCIC或CIQ检验报告；3)海关出境货物报关单；4)原产地证明(C/O)或自由贸易协定原产地证明；5)UN38.3电池安全认证(电动车必备)`);
    
    return results;
}

function animateScore(targetScore) {
    const circle = document.querySelector('#compliance-score .score-fill');
    const number = document.getElementById('score-number');
    
    // Set color based on score
    circle.classList.remove('high', 'medium', 'low');
    if (targetScore >= 80) {
        circle.classList.add('high');
    } else if (targetScore >= 60) {
        circle.classList.add('medium');
    } else {
        circle.classList.add('low');
    }
    
    // Animate circle
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (targetScore / 100) * circumference;
    
    setTimeout(() => {
        circle.style.strokeDashoffset = offset;
    }, 100);
    
    // Animate number
    let current = 0;
    const increment = targetScore / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= targetScore) {
            current = targetScore;
            clearInterval(timer);
        }
        number.textContent = Math.round(current);
    }, 20);
}

// ========================================
// Export Declaration Document
// ========================================
function exportDeclaration() {
    const decl = AppState.declarationData;
    const vehicle = AppState.vehicleInfo;
    const audit = AppState.auditData;
    const country = AppState.selectedCountry;
    
    if (!decl.declarationNo) {
        showToast('请先填写报关单号', 'warning');
        return;
    }
    
    const reportContent = `
================================================================================
                        新能源汽车出口报关确认单
================================================================================

【报关基本信息】
--------------------------------------------------------------------------------
报关单号:        ${decl.declarationNo || '待生成'}
报关日期:        ${decl.declarationDate || new Date().toLocaleDateString('zh-CN')}
报关口岸:        ${decl.customsPort || ''}
贸易方式:        ${decl.tradeMode || ''}
报关人:          ${decl.customsDeclarant || ''}

【车辆基本信息】
--------------------------------------------------------------------------------
车牌号码:        ${decl.plate || vehicle.plate || ''}
车辆品牌:        ${decl.brand || vehicle.brand || ''}
车辆型号:        ${decl.model || vehicle.model || ''}
生产年份:        ${decl.year || vehicle.year || ''}
VIN码:           ${decl.vin || vehicle.vin || ''}
行驶里程:        ${(decl.mileage || vehicle.mileage || 0).toLocaleString()} km

【出口商信息】
--------------------------------------------------------------------------------
出口商名称:      ${decl.exporter || ''}
联系方式:        ${decl.exporterContact || ''}
目的国家:        ${country ? country.name : (decl.destinationCountry || '')}

【海关申报信息】
--------------------------------------------------------------------------------
HS编码:          ${decl.hsCode || '8703.80 (新能源汽车)'}
申报价值:        ${decl.customsValue || ''} ${decl.currency || 'CNY'}
关税税率:        ${decl.dutyRate || 0}%
预估关税:        ${decl.customsValue && decl.dutyRate ? (parseFloat(decl.customsValue) * decl.dutyRate / 100).toFixed(2) : ''} ${decl.currency || 'CNY'}

【电池与认证信息】
--------------------------------------------------------------------------------
电池类型:        ${decl.batteryType || vehicle.batteryType || ''}
电池容量:        ${decl.batteryCapacity || vehicle.batteryCapacity || ''} kWh
电池健康度:      ${decl.batteryHealth || vehicle.batteryHealth || ''}%
UN38.3认证:      ${decl.un38_3 ? '✓ 已获取' : '✗ 未获取'}
MSDS报告:        ${decl.msds ? '✓ 已获取' : '✗ 未获取'}
证书编号:        ${decl.certificateNo || ''}
证书类型:        ${decl.certificateType || ''}

【人工审核信息】
--------------------------------------------------------------------------------
审核人:          ${audit.auditor || ''}
审核日期:        ${audit.auditDate || ''}
检测项目数:      ${audit.issues ? audit.issues.length : 0}
问题项目数:      ${audit.issues ? audit.issues.filter(i => i.severity !== 'minor').length : 0}

【检测问题清单】
--------------------------------------------------------------------------------
${audit.issues && audit.issues.length > 0 ? audit.issues.map((issue, idx) => `
[${idx + 1}] ${issue.title}
    类别: ${issue.category || '其他'}
    严重程度: ${issue.severity === 'danger' ? '严重' : issue.severity === 'warning' ? '警告' : '轻微'}
    描述: ${issue.description || '无'}
    修复费用: ¥${issue.cost || 0}
`).join('') : '无检测问题'}

【审核备注】
--------------------------------------------------------------------------------
${audit.remarks || '无'}

================================================================================
声明: 本确认单信息由系统自动生成，实际报关以海关审核为准。
生成时间: ${new Date().toLocaleString('zh-CN')}
================================================================================
`;

    // Create and download file
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `报关确认单_${decl.declarationNo || decl.plate || 'EV'}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('报关确认单已导出', 'success');
}

// ========================================
// Step Navigation (Click on step indicators)
// ========================================
function initStepNavigation() {
    const steps = document.querySelectorAll('.step');
    
    steps.forEach((step, index) => {
        const stepNumber = index + 1;
        
        // 添加点击事件
        step.addEventListener('click', () => {
            // 检查是否可以跳转到该步骤
            // 允许跳转到已完成的步骤或当前步骤的下一步
            const currentStep = AppState.currentStep;
            
            // 不允许跳转到未解锁的步骤
            if (stepNumber > currentStep + 1) {
                showToast('请按顺序完成前面的步骤', 'warning');
                return;
            }
            
            // 检查前置条件
            if (stepNumber > 1 && !AppState.licenseData) {
                showToast('请先完成行驶证识别', 'warning');
                goToStep(1);
                return;
            }
            if (stepNumber > 2 && !AppState.reportData) {
                showToast('请先完成检测报告识别', 'warning');
                goToStep(2);
                return;
            }
            
            // 跳转到指定步骤
            goToStep(stepNumber);
            
            // 如果是Step 3，初始化人工审核
            if (stepNumber === 3) {
                initManualReview();
            }
            
            // 如果是Step 4，加载报关数据
            if (stepNumber === 4) {
                loadDeclarationData();
            }
        });
        
        // 添加鼠标样式，表示可点击
        step.style.cursor = 'pointer';
    });
    
    console.log('Step navigation initialized');
}

// ========================================
// Navigation & Reset
// ========================================
function initNavigation() {
    const btnReset = document.getElementById('btn-reset');
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            showModal(
                '确认重置',
                '确定要重新开始吗？所有已填写的数据将被清空。',
                [
                    { text: '取消', class: 'btn-secondary', action: 'closeModal()' },
                    { text: '确定重置', class: 'btn-danger', action: 'resetApp(); closeModal();' }
                ]
            );
        });
    }
    
    // Step 4 navigation
    const btnStep4Prev = document.getElementById('btn-step4-prev');
    if (btnStep4Prev) {
        btnStep4Prev.addEventListener('click', prevStep);
    }
    
    // Step 5 navigation
    const btnStep5Prev = document.getElementById('btn-step5-prev');
    if (btnStep5Prev) {
        btnStep5Prev.addEventListener('click', prevStep);
    }
    
    // Export Word report button
    const btnExportWord = document.getElementById('btn-export-word');
    if (btnExportWord) {
        btnExportWord.addEventListener('click', () => {
            exportWordReport();
        });
    }
    
    // Export PDF report button
    const btnExportPDF = document.getElementById('btn-export-pdf');
    if (btnExportPDF) {
        btnExportPDF.addEventListener('click', () => {
            exportPDFReport();
        });
    }
    
    // Export English Word report button
    const btnExportWordEn = document.getElementById('btn-export-word-en');
    if (btnExportWordEn) {
        btnExportWordEn.addEventListener('click', () => {
            exportWordReportEnglish();
        });
    }
    
    // Export English PDF report button
    const btnExportPDFEn = document.getElementById('btn-export-pdf-en');
    if (btnExportPDFEn) {
        btnExportPDFEn.addEventListener('click', () => {
            exportPDFReportEnglish();
        });
    }
    
    // Export report button
    const btnExportReport = document.getElementById('btn-export-report');
    if (btnExportReport) {
        btnExportReport.addEventListener('click', () => {
            exportReport();
        });
    }
    
    // Export declaration button
    const btnExportDeclaration = document.getElementById('btn-export-declaration');
    if (btnExportDeclaration) {
        btnExportDeclaration.addEventListener('click', () => {
            exportDeclaration();
        });
    }
    
    // Start over button
    const btnStartOver = document.getElementById('btn-start-over');
    if (btnStartOver) {
        btnStartOver.addEventListener('click', () => {
            resetApp();
        });
    }
}

// Export PDF Report (Chinese) - Fixed version with html2canvas
function exportPDFReport() {
    const { jsPDF } = window.jspdf;
    const country = AppState.selectedCountry;
    const vehicle = AppState.vehicleInfo;
    const result = AppState.complianceResult;
    const audit = AppState.auditData;
    const report = AppState.reportData;
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('zh-CN');
    
    // Create hidden container for PDF content
    const container = document.createElement('div');
    container.style.cssText = 'position: absolute; left: -9999px; top: 0; width: 800px; padding: 40px; background: white; font-family: "SimSun", "Microsoft YaHei", sans-serif;';
    
    // Build inspection items HTML
    let inspectionItemsHtml = '';
    if (report && report.issues && report.issues.length > 0) {
        inspectionItemsHtml = `
        <table style="width:100%; border-collapse: collapse; margin: 10px 0; font-size: 10pt;">
            <tr style="background-color: #f0f0f0;">
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">序号 / No.</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">检测项目 / Inspection Item</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">状态 / Status</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">说明 / Description</th>
            </tr>
            ${report.issues.map((item, index) => `
            <tr>
                <td style="border: 1px solid #ccc; padding: 6px;">${index + 1}</td>
                <td style="border: 1px solid #ccc; padding: 6px;">${item.title}</td>
                <td style="border: 1px solid #ccc; padding: 6px; color: ${item.severity === 'danger' ? '#d32f2f' : item.severity === 'warning' ? '#f57c00' : '#388e3c'};">
                    ${item.severity === 'danger' ? '异常 / Abnormal' : item.severity === 'warning' ? '需注意 / Attention' : '正常 / Normal'}
                </td>
                <td style="border: 1px solid #ccc; padding: 6px;">${item.description}</td>
            </tr>
            `).join('')}
        </table>`;
    }
    
    // Build compliance result HTML
    let complianceHtml = '';
    if (result && result.items) {
        complianceHtml = `
        <table style="width:100%; border-collapse: collapse; margin: 10px 0; font-size: 10pt;">
            <tr style="background-color: #f0f0f0;">
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">检测项 / Check Item</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">说明 / Description</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">结果 / Result</th>
            </tr>
            ${result.items.map(item => `
            <tr>
                <td style="border: 1px solid #ccc; padding: 6px; font-weight: bold;">${item.title}</td>
                <td style="border: 1px solid #ccc; padding: 6px;">${item.description}</td>
                <td style="border: 1px solid #ccc; padding: 6px; color: ${item.status === 'fail' ? '#d32f2f' : item.status === 'warning' ? '#f57c00' : '#388e3c'}; font-weight: bold;">
                    ${item.statusText}
                </td>
            </tr>
            `).join('')}
        </table>`;
    }
    
    const scoreColor = result && result.score >= 80 ? '#2e7d32' : result && result.score >= 60 ? '#ed6c02' : '#d32f2f';
    const resultText = result ? (result.overall === 'pass' ? '✓ 合规通过 / Compliant' : result.overall === 'warning' ? '⚠ 条件通过 / Conditional Pass' : '✗ 不合规 / Non-compliant') : '-';
    
    container.innerHTML = `
        <div style="font-family: 'SimSun', 'Microsoft YaHei', sans-serif; font-size: 11pt; line-height: 1.6; color: #333;">
            <h1 style="font-size: 20pt; text-align: center; color: #1565c0; border-bottom: 3px solid #1565c0; padding-bottom: 15px; margin-bottom: 20px;">
                新能源汽车出海检测报告 / NEV Export Inspection Report
            </h1>
            <div style="text-align: center; margin-bottom: 30px; color: #666; font-size: 10pt;">
                报告编号 / Report No.: EV-${Date.now().toString().slice(-8)} | 生成时间 / Generated: ${dateStr}
            </div>

            <h2 style="font-size: 14pt; color: #1976d2; margin-top: 25px; border-left: 4px solid #1976d2; padding-left: 10px;">一、车辆基本信息 / I. Vehicle Information</h2>
            <table style="width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10pt;">
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold; width: 20%;">车牌号码 / License Plate</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; width: 30%;">${vehicle.plate || '-'}</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold; width: 20%;">车辆品牌 / Brand</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; width: 30%;">${vehicle.brand || '-'}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">车辆型号 / Model</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px;">${vehicle.model || '-'}</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">车辆年份 / Year</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px;">${vehicle.year || '-'}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">VIN码 / VIN</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px;" colspan="3">${vehicle.vin || '-'}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">行驶里程 / Mileage</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px;">${vehicle.mileage ? vehicle.mileage + ' km' : '-'}</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">车辆颜色 / Color</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px;">${vehicle.color || '-'}</td>
                </tr>
            </table>

            <h2 style="font-size: 14pt; color: #1976d2; margin-top: 25px; border-left: 4px solid #1976d2; padding-left: 10px;">二、新能源信息 / II. Battery Information</h2>
            <table style="width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10pt;">
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold; width: 20%;">电池类型 / Battery Type</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; width: 30%;">${vehicle.batteryType || '-'}</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold; width: 20%;">电池容量 / Capacity</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; width: 30%;">${vehicle.batteryCapacity ? vehicle.batteryCapacity + ' kWh' : '-'}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">电池健康度 / Battery Health</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px;">${vehicle.batteryHealth ? vehicle.batteryHealth + '%' : '-'}</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">续航里程 / Range</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px;">${vehicle.range ? vehicle.range + ' km' : '-'}</td>
                </tr>
            </table>

            <h2 style="font-size: 14pt; color: #1976d2; margin-top: 25px; border-left: 4px solid #1976d2; padding-left: 10px;">三、检测结果 / III. Inspection Results</h2>
            <div style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 10px; margin: 20px 0;">
                <div style="font-size: 42pt; font-weight: bold;">${report ? report.score : '-'}</div>
                <div style="font-size: 14pt; margin-top: 5px;">综合评分 / Overall Score (Grade ${report ? report.grade : '-'})</div>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10pt;">
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold; width: 20%;">检测机构 / Inspection Org</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; width: 30%;">${report ? report.inspectionOrg : '-'}</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold; width: 20%;">报告编号 / Report No.</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; width: 30%;">${report ? report.reportNo : '-'}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">审核人 / Auditor</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px;">${audit && audit.auditor ? audit.auditor : '-'}</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">审核日期 / Audit Date</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px;">${audit && audit.auditDate ? audit.auditDate : '-'}</td>
                </tr>
            </table>

            <h3 style="font-size: 12pt; color: #424242; margin-top: 20px;">检测问题列表 / Inspection Issues</h3>
            ${inspectionItemsHtml || '<p style="color: #666;">未发现问题，车辆状况良好 / No issues found. Vehicle in good condition.</p>'}

            <h2 style="font-size: 14pt; color: #1976d2; margin-top: 25px; border-left: 4px solid #1976d2; padding-left: 10px;">四、目标国家信息 / IV. Target Country</h2>
            <table style="width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10pt;">
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold; width: 20%;">目标国家 / Country</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; width: 30%;">${country ? country.name : '-'} ${country ? country.flag : ''}</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold; width: 20%;">国家代码 / Code</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; width: 30%;">${country ? country.code : '-'}</td>
                </tr>
            </table>

            <h2 style="font-size: 14pt; color: #1976d2; margin-top: 25px; border-left: 4px solid #1976d2; padding-left: 10px;">五、合规检测结果 / V. Compliance Results</h2>
            <div style="text-align: center; background: ${scoreColor}; color: white; padding: 25px; border-radius: 10px; margin: 20px 0;">
                <div style="font-size: 42pt; font-weight: bold;">${result ? result.score : '-'}</div>
                <div style="font-size: 14pt; margin-top: 5px;">合规评分 / Compliance Score</div>
                <div style="margin-top: 10px; font-size: 12pt;">结果 / Result: ${resultText}</div>
            </div>

            <h3 style="font-size: 12pt; color: #424242; margin-top: 20px;">详细检测结果 / Detailed Results</h3>
            ${complianceHtml || '<p style="color: #666;">暂无检测结果 / No check results available</p>'}

            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 9pt;">
                <p>本报告由 EV Export Pro 新能源汽车出海智能助手自动生成 / This report is automatically generated by EV Export Pro</p>
                <p>报告生成时间 / Report Generated: ${dateStr}</p>
                <p>注：本报告仅供参考，具体出口事宜请以海关实际审核为准 / Note: This report is for reference only. Actual export matters are subject to customs review.</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(container);
    
    // Use html2canvas to render the content
    html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
    }).then(canvas => {
        document.body.removeChild(container);
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        let position = 0;
        let heightLeft = imgHeight;
        
        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight * pdfWidth / imgWidth);
        heightLeft -= pdfHeight * imgWidth / pdfWidth;
        
        // Add additional pages if needed
        while (heightLeft > 0) {
            position = heightLeft - imgHeight * pdfWidth / imgWidth;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight * pdfWidth / imgWidth);
            heightLeft -= pdfHeight * imgWidth / pdfWidth;
        }
        
        const fileName = `出海检车报告_${vehicle.plate || 'Unknown'}_${country ? country.code : 'XX'}_${now.toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
        showToast('PDF报告已导出', 'success');
    }).catch(err => {
        console.error('PDF导出失败:', err);
        if (document.body.contains(container)) {
            document.body.removeChild(container);
        }
        showToast('PDF导出失败，请重试', 'error');
    });
}

// Export PDF Report (English) - Bilingual version
function exportPDFReportEnglish() {
    const { jsPDF } = window.jspdf;
    const country = AppState.selectedCountry;
    const vehicle = AppState.vehicleInfo;
    const result = AppState.complianceResult;
    const audit = AppState.auditData;
    const report = AppState.reportData;
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('zh-CN');
    
    // Create hidden container for PDF content
    const container = document.createElement('div');
    container.style.cssText = 'position: absolute; left: -9999px; top: 0; width: 800px; padding: 40px; background: white; font-family: "SimSun", "Microsoft YaHei", sans-serif;';
    
    // Build inspection items HTML (Bilingual)
    let inspectionItemsHtml = '';
    if (report && report.issues && report.issues.length > 0) {
        inspectionItemsHtml = `
        <table style="width:100%; border-collapse: collapse; margin: 10px 0; font-size: 10pt;">
            <tr style="background-color: #f0f0f0;">
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">序号 / No.</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">检测项目 / Inspection Item</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">状态 / Status</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">说明 / Description</th>
            </tr>
            ${report.issues.map((item, index) => `
            <tr>
                <td style="border: 1px solid #ccc; padding: 6px;">${index + 1}</td>
                <td style="border: 1px solid #ccc; padding: 6px;">${item.title}</td>
                <td style="border: 1px solid #ccc; padding: 6px; color: ${item.severity === 'danger' ? '#d32f2f' : item.severity === 'warning' ? '#f57c00' : '#388e3c'};">
                    ${item.severity === 'danger' ? '异常 / Abnormal' : item.severity === 'warning' ? '需注意 / Attention' : '正常 / Normal'}
                </td>
                <td style="border: 1px solid #ccc; padding: 6px;">${item.description}</td>
            </tr>
            `).join('')}
        </table>`;
    }
    
    // Build compliance result HTML (Bilingual)
    let complianceHtml = '';
    if (result && result.items) {
        complianceHtml = `
        <table style="width:100%; border-collapse: collapse; margin: 10px 0; font-size: 10pt;">
            <tr style="background-color: #f0f0f0;">
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">检测项 / Check Item</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">说明 / Description</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">结果 / Result</th>
            </tr>
            ${result.items.map(item => `
            <tr>
                <td style="border: 1px solid #ccc; padding: 6px; font-weight: bold;">${item.title}</td>
                <td style="border: 1px solid #ccc; padding: 6px;">${item.description}</td>
                <td style="border: 1px solid #ccc; padding: 6px; color: ${item.status === 'fail' ? '#d32f2f' : item.status === 'warning' ? '#f57c00' : '#388e3c'}; font-weight: bold;">
                    ${item.statusText}
                </td>
            </tr>
            `).join('')}
        </table>`;
    }
    
    const scoreColor = result && result.score >= 80 ? '#2e7d32' : result && result.score >= 60 ? '#ed6c02' : '#d32f2f';
    const resultText = result ? (result.overall === 'pass' ? '✓ 合规通过 / Compliant' : result.overall === 'warning' ? '⚠ 条件通过 / Conditional Pass' : '✗ 不合规 / Non-compliant') : '-';
    
    container.innerHTML = `
        <div style="font-family: 'SimSun', 'Microsoft YaHei', sans-serif; font-size: 11pt; line-height: 1.6; color: #333;">
            <h1 style="font-size: 20pt; text-align: center; color: #1565c0; border-bottom: 3px solid #1565c0; padding-bottom: 15px; margin-bottom: 20px;">
                新能源汽车出海检测报告 / NEV Export Inspection Report
            </h1>
            <div style="text-align: center; margin-bottom: 30px; color: #666; font-size: 10pt;">
                报告编号 / Report No.: EV-${Date.now().toString().slice(-8)} | 生成时间 / Generated: ${dateStr}
            </div>

            <h2 style="font-size: 14pt; color: #1976d2; margin-top: 25px; border-left: 4px solid #1976d2; padding-left: 10px;">一、车辆基本信息 / I. Vehicle Information</h2>
            <table style="width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10pt;">
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold; width: 20%;">车牌号码 / License Plate</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; width: 30%;">${vehicle.plate || '-'}</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold; width: 20%;">车辆品牌 / Brand</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; width: 30%;">${vehicle.brand || '-'}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">车辆型号 / Model</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px;">${vehicle.model || '-'}</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">车辆年份 / Year</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px;">${vehicle.year || '-'}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">VIN码 / VIN</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px;" colspan="3">${vehicle.vin || '-'}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">行驶里程 / Mileage</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px;">${vehicle.mileage ? vehicle.mileage + ' km' : '-'}</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">车辆颜色 / Color</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px;">${vehicle.color || '-'}</td>
                </tr>
            </table>

            <h2 style="font-size: 14pt; color: #1976d2; margin-top: 25px; border-left: 4px solid #1976d2; padding-left: 10px;">二、新能源信息 / II. Battery Information</h2>
            <table style="width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10pt;">
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold; width: 20%;">电池类型 / Battery Type</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; width: 30%;">${vehicle.batteryType || '-'}</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold; width: 20%;">电池容量 / Capacity</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; width: 30%;">${vehicle.batteryCapacity ? vehicle.batteryCapacity + ' kWh' : '-'}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">电池健康度 / Battery Health</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px;">${vehicle.batteryHealth ? vehicle.batteryHealth + '%' : '-'}</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">续航里程 / Range</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px;">${vehicle.range ? vehicle.range + ' km' : '-'}</td>
                </tr>
            </table>

            <h2 style="font-size: 14pt; color: #1976d2; margin-top: 25px; border-left: 4px solid #1976d2; padding-left: 10px;">三、检测结果 / III. Inspection Results</h2>
            <div style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 10px; margin: 20px 0;">
                <div style="font-size: 42pt; font-weight: bold;">${report ? report.score : '-'}</div>
                <div style="font-size: 14pt; margin-top: 5px;">综合评分 / Overall Score (Grade ${report ? report.grade : '-'})</div>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10pt;">
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold; width: 20%;">检测机构 / Inspection Org</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; width: 30%;">${report ? report.inspectionOrg : '-'}</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold; width: 20%;">报告编号 / Report No.</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; width: 30%;">${report ? report.reportNo : '-'}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">审核人 / Auditor</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px;">${audit && audit.auditor ? audit.auditor : '-'}</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">审核日期 / Audit Date</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px;">${audit && audit.auditDate ? audit.auditDate : '-'}</td>
                </tr>
            </table>

            <h3 style="font-size: 12pt; color: #424242; margin-top: 20px;">检测问题列表 / Inspection Issues</h3>
            ${inspectionItemsHtml || '<p style="color: #666;">未发现问题，车辆状况良好 / No issues found. Vehicle in good condition.</p>'}

            <h2 style="font-size: 14pt; color: #1976d2; margin-top: 25px; border-left: 4px solid #1976d2; padding-left: 10px;">四、目标国家信息 / IV. Target Country</h2>
            <table style="width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10pt;">
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold; width: 20%;">目标国家 / Country</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; width: 30%;">${country ? country.name : '-'} ${country ? country.flag : ''}</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; background: #f5f5f5; font-weight: bold; width: 20%;">国家代码 / Code</td>
                    <td style="border: 1px solid #ddd; padding: 8px 12px; width: 30%;">${country ? country.code : '-'}</td>
                </tr>
            </table>

            <h2 style="font-size: 14pt; color: #1976d2; margin-top: 25px; border-left: 4px solid #1976d2; padding-left: 10px;">五、合规检测结果 / V. Compliance Results</h2>
            <div style="text-align: center; background: ${scoreColor}; color: white; padding: 25px; border-radius: 10px; margin: 20px 0;">
                <div style="font-size: 42pt; font-weight: bold;">${result ? result.score : '-'}</div>
                <div style="font-size: 14pt; margin-top: 5px;">合规评分 / Compliance Score</div>
                <div style="margin-top: 10px; font-size: 12pt;">结果 / Result: ${resultText}</div>
            </div>

            <h3 style="font-size: 12pt; color: #424242; margin-top: 20px;">详细检测结果 / Detailed Results</h3>
            ${complianceHtml || '<p style="color: #666;">暂无检测结果 / No check results available</p>'}

            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 9pt;">
                <p>本报告由 EV Export Pro 新能源汽车出海智能助手自动生成 / This report is automatically generated by EV Export Pro</p>
                <p>报告生成时间 / Report Generated: ${dateStr}</p>
                <p>注：本报告仅供参考，具体出口事宜请以海关实际审核为准 / Note: This report is for reference only. Actual export matters are subject to customs review.</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(container);
    
    // Use html2canvas to render the content
    html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
    }).then(canvas => {
        document.body.removeChild(container);
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        let position = 0;
        let heightLeft = imgHeight;
        
        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight * pdfWidth / imgWidth);
        heightLeft -= pdfHeight * imgWidth / pdfWidth;
        
        // Add additional pages if needed
        while (heightLeft > 0) {
            position = heightLeft - imgHeight * pdfWidth / imgWidth;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight * pdfWidth / imgWidth);
            heightLeft -= pdfHeight * imgWidth / pdfWidth;
        }
        
        const fileName = `NEV_Export_Report_${vehicle.plate || 'Unknown'}_${country ? country.code : 'XX'}_${now.toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
        showToast('PDF Report Exported', 'success');
    }).catch(err => {
        console.error('PDF export failed:', err);
        if (document.body.contains(container)) {
            document.body.removeChild(container);
        }
        showToast('PDF export failed, please try again', 'error');
    });
}

// Export Word Report (.docx format)
function exportWordReport() {
    const country = AppState.selectedCountry;
    const vehicle = AppState.vehicleInfo;
    const result = AppState.complianceResult;
    const license = AppState.licenseData;
    const audit = AppState.auditData;
    const report = AppState.reportData;
    
    // Get current date
    const now = new Date();
    const dateStr = now.toLocaleDateString('zh-CN');
    const timeStr = now.toLocaleTimeString('zh-CN');
    
    // Build inspection items table
    let inspectionItemsHtml = '';
    if (report && report.issues && report.issues.length > 0) {
        inspectionItemsHtml = `
        <table style="width:100%; border-collapse: collapse; margin: 10px 0; font-size: 10pt;">
            <tr style="background-color: #f0f0f0;">
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">序号 / No.</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">检测项目 / Inspection Item</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">状态 / Status</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">说明 / Description</th>
            </tr>
            ${report.issues.map((item, index) => `
            <tr>
                <td style="border: 1px solid #ccc; padding: 6px;">${index + 1}</td>
                <td style="border: 1px solid #ccc; padding: 6px;">${item.title}</td>
                <td style="border: 1px solid #ccc; padding: 6px; color: ${item.severity === 'danger' ? '#d32f2f' : item.severity === 'warning' ? '#f57c00' : '#388e3c'};">
                    ${item.severity === 'danger' ? '异常 / Abnormal' : item.severity === 'warning' ? '需注意 / Attention' : '正常 / Normal'}
                </td>
                <td style="border: 1px solid #ccc; padding: 6px;">${item.description}</td>
            </tr>
            `).join('')}
        </table>`;
    }
    
    // Build compliance result table
    let complianceHtml = '';
    if (result && result.items) {
        complianceHtml = `
        <table style="width:100%; border-collapse: collapse; margin: 10px 0; font-size: 10pt;">
            <tr style="background-color: #f0f0f0;">
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">检测项 / Check Item</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">说明 / Description</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">结果 / Result</th>
            </tr>
            ${result.items.map(item => `
            <tr>
                <td style="border: 1px solid #ccc; padding: 6px; font-weight: bold;">${item.title}</td>
                <td style="border: 1px solid #ccc; padding: 6px;">${item.description}</td>
                <td style="border: 1px solid #ccc; padding: 6px; color: ${item.status === 'fail' ? '#d32f2f' : item.status === 'warning' ? '#f57c00' : '#388e3c'}; font-weight: bold;">
                    ${item.statusText}
                </td>
            </tr>
            `).join('')}
        </table>`;
    }
    
    // Create Word document HTML
    const wordContent = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
    <meta charset="utf-8">
    <title>新能源汽车出海检测报告 / NEV Export Inspection Report</title>
    <style>
        body { font-family: "SimSun", "宋体", sans-serif; font-size: 11pt; line-height: 1.6; }
        h1 { font-size: 18pt; text-align: center; color: #1565c0; border-bottom: 2px solid #1565c0; padding-bottom: 10px; }
        h2 { font-size: 14pt; color: #1976d2; margin-top: 20px; border-left: 4px solid #1976d2; padding-left: 10px; }
        h3 { font-size: 12pt; color: #424242; margin-top: 15px; }
        .header-info { text-align: center; margin-bottom: 20px; color: #666; font-size: 10pt; }
        .info-table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10pt; }
        .info-table td { border: 1px solid #ddd; padding: 6px 10px; }
        .info-table .label { background-color: #f5f5f5; font-weight: bold; width: 25%; }
        .info-table .value { width: 25%; }
        .score-box { text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .score-number { font-size: 48pt; font-weight: bold; }
        .score-label { font-size: 14pt; }
        .status-pass { color: #2e7d32; font-weight: bold; }
        .status-warning { color: #ed6c02; font-weight: bold; }
        .status-fail { color: #d32f2f; font-weight: bold; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 9pt; }
        @page { size: A4; margin: 2cm; }
    </style>
</head>
<body>
    <h1>新能源汽车出海检测报告 / NEV Export Inspection Report</h1>
    <div class="header-info">
        报告编号 / Report No.: EV-${Date.now().toString().slice(-8)} | 生成时间 / Generated: ${dateStr} ${timeStr}
    </div>

    <h2>一、车辆基本信息 / I. Vehicle Information</h2>
    <table class="info-table">
        <tr>
            <td class="label">车牌号码 / License Plate</td>
            <td class="value">${vehicle.plate || '-'}</td>
            <td class="label">车辆品牌 / Brand</td>
            <td class="value">${vehicle.brand || '-'}</td>
        </tr>
        <tr>
            <td class="label">车辆型号 / Model</td>
            <td class="value">${vehicle.model || '-'}</td>
            <td class="label">车辆年份 / Year</td>
            <td class="value">${vehicle.year || '-'}</td>
        </tr>
        <tr>
            <td class="label">VIN码 / VIN</td>
            <td class="value" colspan="3">${vehicle.vin || '-'}</td>
        </tr>
        <tr>
            <td class="label">行驶里程 / Mileage</td>
            <td class="value">${vehicle.mileage ? vehicle.mileage + ' km' : '-'}</td>
            <td class="label">车辆颜色 / Color</td>
            <td class="value">${vehicle.color || '-'}</td>
        </tr>
        <tr>
            <td class="label">使用性质 / Usage Type</td>
            <td class="value">${vehicle.usage || '-'}</td>
            <td class="label">动力源类型 / Power Type</td>
            <td class="value">${vehicle.powerType || '-'}</td>
        </tr>
    </table>

    <h2>二、新能源信息 / II. Battery Information</h2>
    <table class="info-table">
        <tr>
            <td class="label">电池类型 / Battery Type</td>
            <td class="value">${vehicle.batteryType || '-'}</td>
            <td class="label">电池容量 / Capacity</td>
            <td class="value">${vehicle.batteryCapacity ? vehicle.batteryCapacity + ' kWh' : '-'}</td>
        </tr>
        <tr>
            <td class="label">电池健康度 / Battery Health</td>
            <td class="value">${vehicle.batteryHealth ? vehicle.batteryHealth + '%' : '-'}</td>
            <td class="label">续航里程 / Range</td>
            <td class="value">${vehicle.range ? vehicle.range + ' km' : '-'}</td>
        </tr>
        <tr>
            <td class="label">电池状态 / Battery Status</td>
            <td class="value">${vehicle.batteryStatus || '-'}</td>
            <td class="label">是否危险品 / Dangerous Goods</td>
            <td class="value">${vehicle.isDangerous || '-'}</td>
        </tr>
    </table>

    <h2>三、检测结果 / III. Inspection Results</h2>
    <h3>3.1 检测评分 / Inspection Score</h3>
    <div class="score-box">
        <div class="score-number">${report ? report.score : '-'}</div>
        <div class="score-label">综合评分 / Overall Score (${report ? report.grade : '-'}级 / Grade)</div>
    </div>
    
    <table class="info-table">
        <tr>
            <td class="label">检测机构 / Inspection Org</td>
            <td class="value">${report ? report.inspectionOrg : '-'}</td>
            <td class="label">报告编号 / Report No.</td>
            <td class="value">${report ? report.reportNo : '-'}</td>
        </tr>
        <tr>
            <td class="label">正常项目 / Normal Items</td>
            <td class="value" style="color: #2e7d32; font-weight: bold;">${report ? report.goodItems : '0'}</td>
            <td class="label">需注意项目 / Warning Items</td>
            <td class="value" style="color: #ed6c02; font-weight: bold;">${report ? report.warningItems : '0'}</td>
        </tr>
    </table>

    <h3>3.2 检测问题列表 / Inspection Issues</h3>
    ${inspectionItemsHtml || '<p style="color: #666;">未发现问题，车辆状况良好 / No issues found. Vehicle in good condition.</p>'}

    <h3>3.3 审核信息 / Audit Information</h3>
    <table class="info-table">
        <tr>
            <td class="label">审核人 / Auditor</td>
            <td class="value">${audit && audit.auditor ? audit.auditor : '-'}</td>
            <td class="label">审核日期 / Audit Date</td>
            <td class="value">${audit && audit.auditDate ? audit.auditDate : '-'}</td>
        </tr>
        <tr>
            <td class="label">审核备注 / Remarks</td>
            <td colspan="3">${audit && audit.remarks ? audit.remarks : '-'}</td>
        </tr>
    </table>

    <h2>四、目标国家信息 / IV. Target Country</h2>
    <table class="info-table">
        <tr>
            <td class="label">目标国家 / Country</td>
            <td class="value">${country ? country.name : '-'} ${country ? country.flag : ''}</td>
            <td class="label">国家代码 / Code</td>
            <td class="value">${country ? country.code : '-'}</td>
        </tr>
    </table>

    <h2>五、合规检测结果 / V. Compliance Results</h2>
    <h3>5.1 合规评分 / Compliance Score</h3>
    <div class="score-box" style="background: linear-gradient(135deg, ${result && result.score >= 80 ? '#43a047' : result && result.score >= 60 ? '#fb8c00' : '#e53935'} 0%, ${result && result.score >= 80 ? '#66bb6a' : result && result.score >= 60 ? '#ffb74d' : '#ef5350'} 100%);">
        <div class="score-number">${result ? result.score : '-'}</div>
        <div class="score-label">合规评分 / Compliance Score</div>
        <div style="margin-top: 10px; font-size: 12pt;">
            结果 / Result：<span class="${result && result.overall === 'pass' ? 'status-pass' : result && result.overall === 'warning' ? 'status-warning' : 'status-fail'}">
                ${result ? (result.overall === 'pass' ? '✓ 合规通过 / Compliant' : result.overall === 'warning' ? '⚠ 条件通过 / Conditional Pass' : '✗ 不合规 / Non-compliant') : '-'}
            </span>
        </div>
    </div>

    <h3>5.2 详细检测结果 / Detailed Results</h3>
    ${complianceHtml || '<p style="color: #666;">暂无检测结果 / No check results available</p>'}

    <h3>5.3 出口相关信息 / Export Information</h3>
    <table class="info-table">
        ${result && result.exportInfo ? result.exportInfo.map(info => `
        <tr>
            <td class="label">${info.label}</td>
            <td class="value" colspan="3">${info.value}</td>
        </tr>
        `).join('') : '<tr><td colspan="4" style="text-align: center; color: #999;">暂无数据 / No data available</td></tr>'}
    </table>

    <h2>六、报关信息摘要 / VI. Customs Declaration</h2>
    <table class="info-table">
        <tr>
            <td class="label">经营企业 / Company</td>
            <td class="value">${vehicle.companyName || '-'}</td>
            <td class="label">统一信用代码 / Credit Code</td>
            <td class="value">${vehicle.creditCode || '-'}</td>
        </tr>
        <tr>
            <td class="label">出口方式 / Export Mode</td>
            <td class="value">${vehicle.exportMode || '-'}</td>
            <td class="label">出口口岸 / Export Port</td>
            <td class="value">${vehicle.exportPort || '-'}</td>
        </tr>
        <tr>
            <td class="label">成交方式 / Trade Term</td>
            <td class="value">${vehicle.tradeTerm || '-'}</td>
            <td class="label">目的港 / Destination</td>
            <td class="value">${vehicle.destination || '-'}</td>
        </tr>
        <tr>
            <td class="label">HS编码 / HS Code</td>
            <td class="value">${vehicle.hsCode || '8703.80'}</td>
            <td class="label">运输方式 / Transport</td>
            <td class="value">${vehicle.transport || '-'}</td>
        </tr>
    </table>

    <div class="footer">
        <p>本报告由 EV Export Pro 新能源汽车出海智能助手自动生成 / This report is automatically generated by EV Export Pro</p>
        <p>报告生成时间 / Report Generated: ${dateStr} ${timeStr}</p>
        <p>注：本报告仅供参考，具体出口事宜请以海关实际审核为准 / Note: This report is for reference only. Actual export matters are subject to customs review.</p>
    </div>
</body>
</html>
    `;
    
    // Create Blob and download
    const blob = new Blob(['\ufeff', wordContent], { 
        type: 'application/msword;charset=utf-8' 
    });
    
    const fileName = `出海检车报告_${vehicle.plate || '未上牌'}_${country ? country.code : '未知'}_${now.toISOString().split('T')[0]}.doc`;
    
    saveAs(blob, fileName);
    
    showToast('Word报告已导出 / Word Report Exported', 'success');
}

// Export Word Report (English) - Chinese-English Bilingual Version
function exportWordReportEnglish() {
    const country = AppState.selectedCountry;
    const vehicle = AppState.vehicleInfo;
    const result = AppState.complianceResult;
    const audit = AppState.auditData;
    const report = AppState.reportData;
    
    // Get current date
    const now = new Date();
    const dateStr = now.toLocaleDateString('zh-CN');
    const timeStr = now.toLocaleTimeString('zh-CN');
    
    // Build inspection items table
    let inspectionItemsHtml = '';
    if (report && report.issues && report.issues.length > 0) {
        inspectionItemsHtml = `
        <table style="width:100%; border-collapse: collapse; margin: 10px 0; font-size: 10pt;">
            <tr style="background-color: #f0f0f0;">
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">序号 / No.</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">检测项目 / Inspection Item</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">状态 / Status</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">说明 / Description</th>
            </tr>
            ${report.issues.map((item, index) => `
            <tr>
                <td style="border: 1px solid #ccc; padding: 6px;">${index + 1}</td>
                <td style="border: 1px solid #ccc; padding: 6px;">${item.title}</td>
                <td style="border: 1px solid #ccc; padding: 6px; color: ${item.severity === 'danger' ? '#d32f2f' : item.severity === 'warning' ? '#f57c00' : '#388e3c'};">
                    ${item.severity === 'danger' ? '异常 / Abnormal' : item.severity === 'warning' ? '需注意 / Attention' : '正常 / Normal'}
                </td>
                <td style="border: 1px solid #ccc; padding: 6px;">${item.description}</td>
            </tr>
            `).join('')}
        </table>`;
    }
    
    // Build compliance result table
    let complianceHtml = '';
    if (result && result.items) {
        complianceHtml = `
        <table style="width:100%; border-collapse: collapse; margin: 10px 0; font-size: 10pt;">
            <tr style="background-color: #f0f0f0;">
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">检测项 / Check Item</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">说明 / Description</th>
                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">结果 / Result</th>
            </tr>
            ${result.items.map(item => `
            <tr>
                <td style="border: 1px solid #ccc; padding: 6px; font-weight: bold;">${item.title}</td>
                <td style="border: 1px solid #ccc; padding: 6px;">${item.description}</td>
                <td style="border: 1px solid #ccc; padding: 6px; color: ${item.status === 'fail' ? '#d32f2f' : item.status === 'warning' ? '#f57c00' : '#388e3c'}; font-weight: bold;">
                    ${item.statusText}
                </td>
            </tr>
            `).join('')}
        </table>`;
    }
    
    // Create Word document HTML (Chinese-English Bilingual)
    const wordContent = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
    <meta charset="utf-8">
    <title>新能源汽车出海检测报告 / NEV Export Inspection Report</title>
    <style>
        body { font-family: "SimSun", "宋体", sans-serif; font-size: 11pt; line-height: 1.6; }
        h1 { font-size: 18pt; text-align: center; color: #1565c0; border-bottom: 2px solid #1565c0; padding-bottom: 10px; }
        h2 { font-size: 14pt; color: #1976d2; margin-top: 20px; border-left: 4px solid #1976d2; padding-left: 10px; }
        h3 { font-size: 12pt; color: #424242; margin-top: 15px; }
        .header-info { text-align: center; margin-bottom: 20px; color: #666; font-size: 10pt; }
        .info-table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10pt; }
        .info-table td { border: 1px solid #ddd; padding: 6px 10px; }
        .info-table .label { background-color: #f5f5f5; font-weight: bold; width: 25%; }
        .info-table .value { width: 25%; }
        .score-box { text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .score-number { font-size: 48pt; font-weight: bold; }
        .score-label { font-size: 14pt; }
        .status-pass { color: #2e7d32; font-weight: bold; }
        .status-warning { color: #ed6c02; font-weight: bold; }
        .status-fail { color: #d32f2f; font-weight: bold; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 9pt; }
        @page { size: A4; margin: 2cm; }
    </style>
</head>
<body>
    <h1>新能源汽车出海检测报告 / NEV Export Inspection Report</h1>
    <div class="header-info">
        报告编号 / Report No.: EV-${Date.now().toString().slice(-8)} | 生成时间 / Generated: ${dateStr} ${timeStr}
    </div>

    <h2>一、车辆基本信息 / I. Vehicle Information</h2>
    <table class="info-table">
        <tr>
            <td class="label">车牌号码 / License Plate</td>
            <td class="value">${vehicle.plate || '-'}</td>
            <td class="label">车辆品牌 / Brand</td>
            <td class="value">${vehicle.brand || '-'}</td>
        </tr>
        <tr>
            <td class="label">车辆型号 / Model</td>
            <td class="value">${vehicle.model || '-'}</td>
            <td class="label">车辆年份 / Year</td>
            <td class="value">${vehicle.year || '-'}</td>
        </tr>
        <tr>
            <td class="label">VIN码 / VIN</td>
            <td class="value" colspan="3">${vehicle.vin || '-'}</td>
        </tr>
        <tr>
            <td class="label">行驶里程 / Mileage</td>
            <td class="value">${vehicle.mileage ? vehicle.mileage + ' km' : '-'}</td>
            <td class="label">车辆颜色 / Color</td>
            <td class="value">${vehicle.color || '-'}</td>
        </tr>
        <tr>
            <td class="label">使用性质 / Usage Type</td>
            <td class="value">${vehicle.usage || '-'}</td>
            <td class="label">动力源类型 / Power Type</td>
            <td class="value">${vehicle.powerType || '-'}</td>
        </tr>
    </table>

    <h2>二、新能源信息 / II. Battery Information</h2>
    <table class="info-table">
        <tr>
            <td class="label">电池类型 / Battery Type</td>
            <td class="value">${vehicle.batteryType || '-'}</td>
            <td class="label">电池容量 / Capacity</td>
            <td class="value">${vehicle.batteryCapacity ? vehicle.batteryCapacity + ' kWh' : '-'}</td>
        </tr>
        <tr>
            <td class="label">电池健康度 / Battery Health</td>
            <td class="value">${vehicle.batteryHealth ? vehicle.batteryHealth + '%' : '-'}</td>
            <td class="label">续航里程 / Range</td>
            <td class="value">${vehicle.range ? vehicle.range + ' km' : '-'}</td>
        </tr>
        <tr>
            <td class="label">电池状态 / Battery Status</td>
            <td class="value">${vehicle.batteryStatus || '-'}</td>
            <td class="label">是否危险品 / Dangerous Goods</td>
            <td class="value">${vehicle.isDangerous || '-'}</td>
        </tr>
    </table>

    <h2>三、检测结果 / III. Inspection Results</h2>
    <h3>3.1 检测评分 / Inspection Score</h3>
    <div class="score-box">
        <div class="score-number">${report ? report.score : '-'}</div>
        <div class="score-label">综合评分 / Overall Score (${report ? report.grade : '-'}级 / Grade)</div>
    </div>
    
    <table class="info-table">
        <tr>
            <td class="label">检测机构 / Inspection Org</td>
            <td class="value">${report ? report.inspectionOrg : '-'}</td>
            <td class="label">报告编号 / Report No.</td>
            <td class="value">${report ? report.reportNo : '-'}</td>
        </tr>
        <tr>
            <td class="label">正常项目 / Normal Items</td>
            <td class="value" style="color: #2e7d32; font-weight: bold;">${report ? report.goodItems : '0'}</td>
            <td class="label">需注意项目 / Warning Items</td>
            <td class="value" style="color: #ed6c02; font-weight: bold;">${report ? report.warningItems : '0'}</td>
        </tr>
    </table>

    <h3>3.2 检测问题列表 / Inspection Issues</h3>
    ${inspectionItemsHtml || '<p style="color: #666;">未发现问题，车辆状况良好 / No issues found. Vehicle in good condition.</p>'}

    <h3>3.3 审核信息 / Audit Information</h3>
    <table class="info-table">
        <tr>
            <td class="label">审核人 / Auditor</td>
            <td class="value">${audit && audit.auditor ? audit.auditor : '-'}</td>
            <td class="label">审核日期 / Audit Date</td>
            <td class="value">${audit && audit.auditDate ? audit.auditDate : '-'}</td>
        </tr>
        <tr>
            <td class="label">审核备注 / Remarks</td>
            <td colspan="3">${audit && audit.remarks ? audit.remarks : '-'}</td>
        </tr>
    </table>

    <h2>四、目标国家信息 / IV. Target Country</h2>
    <table class="info-table">
        <tr>
            <td class="label">目标国家 / Country</td>
            <td class="value">${country ? country.name : '-'} ${country ? country.flag : ''}</td>
            <td class="label">国家代码 / Code</td>
            <td class="value">${country ? country.code : '-'}</td>
        </tr>
    </table>

    <h2>五、合规检测结果 / V. Compliance Results</h2>
    <h3>5.1 合规评分 / Compliance Score</h3>
    <div class="score-box" style="background: linear-gradient(135deg, ${result && result.score >= 80 ? '#43a047' : result && result.score >= 60 ? '#fb8c00' : '#e53935'} 0%, ${result && result.score >= 80 ? '#66bb6a' : result && result.score >= 60 ? '#ffb74d' : '#ef5350'} 100%);">
        <div class="score-number">${result ? result.score : '-'}</div>
        <div class="score-label">合规评分 / Compliance Score</div>
        <div style="margin-top: 10px; font-size: 12pt;">
            结果 / Result：<span class="${result && result.overall === 'pass' ? 'status-pass' : result && result.overall === 'warning' ? 'status-warning' : 'status-fail'}">
                ${result ? (result.overall === 'pass' ? '✓ 合规通过 / Compliant' : result.overall === 'warning' ? '⚠ 条件通过 / Conditional Pass' : '✗ 不合规 / Non-compliant') : '-'}
            </span>
        </div>
    </div>

    <h3>5.2 详细检测结果 / Detailed Results</h3>
    ${complianceHtml || '<p style="color: #666;">暂无检测结果 / No check results available</p>'}

    <h3>5.3 出口相关信息 / Export Information</h3>
    <table class="info-table">
        ${result && result.exportInfo ? result.exportInfo.map(info => `
        <tr>
            <td class="label">${info.label}</td>
            <td class="value" colspan="3">${info.value}</td>
        </tr>
        `).join('') : '<tr><td colspan="4" style="text-align: center; color: #999;">暂无数据 / No data available</td></tr>'}
    </table>

    <h2>六、报关信息摘要 / VI. Customs Declaration</h2>
    <table class="info-table">
        <tr>
            <td class="label">经营企业 / Company</td>
            <td class="value">${vehicle.companyName || '-'}</td>
            <td class="label">统一信用代码 / Credit Code</td>
            <td class="value">${vehicle.creditCode || '-'}</td>
        </tr>
        <tr>
            <td class="label">出口方式 / Export Mode</td>
            <td class="value">${vehicle.exportMode || '-'}</td>
            <td class="label">出口口岸 / Export Port</td>
            <td class="value">${vehicle.exportPort || '-'}</td>
        </tr>
        <tr>
            <td class="label">成交方式 / Trade Term</td>
            <td class="value">${vehicle.tradeTerm || '-'}</td>
            <td class="label">目的港 / Destination</td>
            <td class="value">${vehicle.destination || '-'}</td>
        </tr>
        <tr>
            <td class="label">HS编码 / HS Code</td>
            <td class="value">${vehicle.hsCode || '8703.80'}</td>
            <td class="label">运输方式 / Transport</td>
            <td class="value">${vehicle.transport || '-'}</td>
        </tr>
    </table>

    <div class="footer">
        <p>本报告由 EV Export Pro 新能源汽车出海智能助手自动生成 / This report is automatically generated by EV Export Pro</p>
        <p>报告生成时间 / Report Generated: ${dateStr} ${timeStr}</p>
        <p>注：本报告仅供参考，具体出口事宜请以海关实际审核为准 / Note: This report is for reference only. Actual export matters are subject to customs review.</p>
    </div>
</body>
</html>
    `;
    
    // Create Blob and download
    const blob = new Blob(['\ufeff', wordContent], { 
        type: 'application/msword;charset=utf-8' 
    });
    
    const fileName = `NEV_Export_Report_${vehicle.plate || 'Unregistered'}_${country ? country.code : 'Unknown'}_${now.toISOString().split('T')[0]}.doc`;
    
    saveAs(blob, fileName);
    
    showToast('Word Report Exported / Word报告已导出', 'success');
}

function exportReport() {
    const country = AppState.selectedCountry;
    const vehicle = AppState.vehicleInfo;
    const result = AppState.complianceResult;
    
    // Generate report content
    const reportContent = `
========================================
新能源汽车出海合规检测报告
========================================

生成时间: ${new Date().toLocaleString('zh-CN')}

【车辆信息】
- 车牌号码: ${vehicle.plate}
- 车辆品牌: ${vehicle.brand}
- 车辆型号: ${vehicle.model}
- 车辆年份: ${vehicle.year}
- VIN码: ${vehicle.vin}
- 行驶里程: ${vehicle.mileage} km
- 电池类型: ${vehicle.batteryType}
- 电池容量: ${vehicle.batteryCapacity} kWh
- 电池健康度: ${vehicle.batteryHealth}%
- 续航里程: ${vehicle.range} km

【目标国家】
- 国家: ${country.name} (${country.nameEn})

【合规评分】
- 综合评分: ${result.score} 分
- 通过项目: ${result.passCount}
- 警告项目: ${result.warningCount}
- 未通过项目: ${result.failCount}
- 总体结论: ${result.overall === 'pass' ? '合规通过' : result.overall === 'warning' ? '条件通过' : '不合规'}

【详细检测结果】
${result.items.map(item => `- ${item.title}: ${item.description} [${item.statusText}]`).join('\n')}

【出口相关信息】
${result.exportInfo.map(info => `- ${info.label}: ${info.value}`).join('\n')}

========================================
报告由 EV Export Pro 自动生成
========================================
`;

    // Create and download file
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `出海合规检测报告_${vehicle.plate}_${country.code}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('检测报告已导出', 'success');
}

function resetApp() {
    AppState.currentStep = 1;
    AppState.licenseData = null;
    AppState.reportData = null;
    AppState.vehicleInfo = {};
    AppState.selectedCountry = null;
    AppState.complianceResult = null;
    
    // 重置step3Data到默认值
    AppState.step3Data = {
        plate: '桂A·YX019',
        brand: '比亚迪',
        model: '秦Pro DM 2022款 旗舰版',
        year: 2022,
        vin: 'LSVDF6C48NN024488',
        engine: 'BYD476ZQA',
        regDate: '2022-03-01',
        mileage: 52600,
        color: '白色',
        usage: '非营运',
        powerType: '插电混动',
        batteryType: '磷酸铁锂',
        batteryCapacity: 18.3,
        batteryHealth: 95,
        range: 82,
        batteryStatus: '全新（未使用）',
        isDangerous: '否',
        packageType: '标准集装箱',
        inspectionOrg: '查博士',
        reportNo: '135525946',
        score: 95,
        grade: 'A级',
        auditor: '1',
        auditNotes: '经审核，AI识别结果准确，车辆整体状况良好。',
        issues: [
            { id: 1, name: '左前纵梁', desc: '轻微划痕', severity: '轻微' },
            { id: 2, name: '左前门内饰板', desc: '轻微磨损', severity: '轻微' },
            { id: 3, name: '前保险杠', desc: '喷漆修复', severity: '轻微' }
        ]
    };
    
    // Reset UI
    resetLicenseUpload();
    resetReportUpload();
    
    // Clear form
    document.querySelectorAll('input, select').forEach(el => {
        if (el.type !== 'button' && el.type !== 'submit') {
            el.value = '';
        }
    });
    
    // Reset country selection
    document.getElementById('selected-country').innerHTML = `
        <div class="selected-placeholder">
            <i class="fas fa-hand-pointer"></i>
            <p>请点击上方选择目标国家</p>
        </div>
    `;
    document.querySelectorAll('.country-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Clear issues
    document.getElementById('issues-container').innerHTML = `
        <div class="issues-placeholder">
            <i class="fas fa-info-circle"></i>
            <p>请先在第二步上传检测报告，系统将自动识别检测问题</p>
        </div>
    `;
    
    // Remove country details if exists
    const countryDetails = document.getElementById('country-details');
    if (countryDetails) {
        countryDetails.remove();
    }
    
    // Reset audit data
    AppState.auditData = {
        issues: [],
        auditor: '',
        auditDate: '',
        remarks: ''
    };
    
    // Reset declaration data
    AppState.declarationData = {
        customsDeclarant: '',
        declarationNo: '',
        declarationDate: '',
        customsPort: '',
        tradeMode: '',
        plate: '',
        brand: '',
        model: '',
        year: '',
        vin: '',
        mileage: '',
        exporter: '',
        exporterContact: '',
        destinationCountry: '',
        hsCode: '',
        customsValue: '',
        currency: 'CNY',
        dutyRate: 0,
        certificateNo: '',
        certificateType: '',
        batteryType: '',
        batteryCapacity: '',
        batteryHealth: '',
        un38_3: false,
        msds: false
    };
    
    goToStep(1);
    showToast('已重置所有数据', 'success');
}

// ========================================
// Initialization
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Simulate loading
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        if (loadingScreen) loadingScreen.classList.add('hidden');
        if (app) app.classList.remove('hidden');
    }, 2000);
    
    // Initialize all components
    initLicenseUpload();
    initReportUpload();
    initManualReviewEvents();      // Step 3: Manual Review
    initDeclarationForm();         // Step 4: Declaration Info
    initCountrySelection();        // Step 5: Country Selection
    initNavigation();              // Navigation & Export
    initStepNavigation();          // Step indicators click navigation
    
    // Close modal on outside click
    const modal = document.getElementById('modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'modal') {
                closeModal();
            }
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    // Expose functions to global scope for onclick handlers
    window.selectCountry = selectCountry;
    window.closeModal = closeModal;
    window.resetApp = resetApp;
    window.addIssue = addIssue;
    window.deleteIssue = deleteIssue;
    window.updateIssue = updateIssue;
    window.saveAuditData = saveAuditData;
    window.exportDeclaration = exportDeclaration;
    window.exportWordReport = exportWordReport;
    window.exportPDFReport = exportPDFReport;
    window.exportWordReportEnglish = exportWordReportEnglish;
    window.exportPDFReportEnglish = exportPDFReportEnglish;
    window.openItemEditModal = openItemEditModal;
    window.saveItemEdit = saveItemEdit;
    window.editIssue = editIssue;
    
    console.log('EV Export Pro initialized (5 steps version)');
});

// ========================================
// Missing Functions for Step 3
// ========================================

// Bind events for manual review page
function bindManualReviewEvents() {
    // Add issue button
    const addIssueBtn = document.getElementById('btn-add-issue');
    if (addIssueBtn) {
        addIssueBtn.addEventListener('click', addNewIssue);
    }
    
    // Form input change events - auto save
    const formInputs = document.querySelectorAll('#step-3 input, #step-3 select, #step-3 textarea');
    formInputs.forEach(input => {
        input.addEventListener('change', () => {
            saveAuditData();
        });
    });
}

// Add new issue
function addNewIssue() {
    const newIssue = {
        id: Date.now(),
        name: '新问题',
        desc: '请描述问题',
        severity: '轻微'
    };
    
    if (!AppState.step3Data) {
        AppState.step3Data = { issues: [] };
    }
    if (!AppState.step3Data.issues) {
        AppState.step3Data.issues = [];
    }
    
    AppState.step3Data.issues.push(newIssue);
    renderIssuesList();
    saveAuditData();
    
    showToast('问题已添加', 'success');
}

// Edit issue
function editIssue(index) {
    const issues = AppState.step3Data?.issues;
    if (!issues || !issues[index]) {
        console.error('Issue not found:', index);
        return;
    }
    
    const issue = issues[index];
    
    const content = `
        <div class="form-group">
            <label>问题名称</label>
            <input type="text" id="edit-issue-name" value="${issue.name}" placeholder="问题名称">
        </div>
        <div class="form-group">
            <label>问题描述</label>
            <input type="text" id="edit-issue-desc" value="${issue.desc}" placeholder="问题描述">
        </div>
        <div class="form-group">
            <label>严重程度</label>
            <select id="edit-issue-severity">
                <option value="轻微" ${issue.severity === '轻微' ? 'selected' : ''}>轻微</option>
                <option value="一般" ${issue.severity === '一般' ? 'selected' : ''}>一般</option>
                <option value="严重" ${issue.severity === '严重' ? 'selected' : ''}>严重</option>
            </select>
        </div>
    `;
    
    showModal('编辑问题', content, [
        { text: '取消', class: 'btn-secondary', action: 'closeModal()' },
        { text: '保存', class: 'btn-primary', action: `saveIssueEdit(${index})` }
    ]);
}

// Save issue edit
function saveIssueEdit(index) {
    const nameInput = document.getElementById('edit-issue-name');
    const descInput = document.getElementById('edit-issue-desc');
    const severityInput = document.getElementById('edit-issue-severity');
    
    if (!nameInput || !AppState.step3Data?.issues?.[index]) return;
    
    AppState.step3Data.issues[index].name = nameInput.value;
    AppState.step3Data.issues[index].desc = descInput.value;
    AppState.step3Data.issues[index].severity = severityInput.value;
    
    closeModal();
    renderIssuesList();
    saveAuditData();
    
    showToast('问题已更新', 'success');
}

// Delete issue
function deleteIssue(index) {
    showModal('确认删除', '确定要删除这个问题吗？', [
        { text: '取消', class: 'btn-secondary', action: 'closeModal()' },
        { text: '删除', class: 'btn-danger', action: `confirmDeleteIssue(${index})` }
    ]);
}

// Confirm delete issue
function confirmDeleteIssue(index) {
    if (AppState.step3Data?.issues) {
        AppState.step3Data.issues.splice(index, 1);
        renderIssuesList();
        saveAuditData();
        showToast('问题已删除', 'success');
    }
    closeModal();
}
