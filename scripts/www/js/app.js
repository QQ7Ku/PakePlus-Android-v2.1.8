/**
 * 东行车道 EastWheels - Main Application
 * Used Car Export Platform for ASEAN Countries
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
        plate: '粤B·88888',
        brand: '大众',
        model: '迈腾 2023款 330TSI DSG豪华型',
        year: 2023,
        vin: 'LFV3A23C7P3000001',
        engine: 'EA888-DPL',
        regDate: '2023-03-15',
        mileage: 28000,
        color: '幻影黑',
        usage: '非营运',
        powerType: '汽油',
        
        // 发动机参数
        displacement: 2.0,
        power: 137,
        emissionStandard: '国六',
        transmission: '双离合',
        driveType: '前驱',
        steering: '左舵',
        
        // 检测结果摘要
        inspectionOrg: '查博士',
        reportNo: '20240320001',
        score: 94,
        grade: 'A级',
        auditor: '王检验员',
        auditNotes: '经审核，AI识别结果准确，迈腾车况良好，适合出口东盟市场。',
        
        // 检测问题列表
        issues: [
            { id: 1, name: '左前门漆面', desc: '轻微划痕', severity: '轻微' }
        ]
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
    { code: 'BN', name: '文莱', nameEn: 'Brunei', region: 'asean', flag: '🇧🇳', priority: false }
];

// ========================================
// Demo Data
// ========================================
const demoLicenseData = {
    plate: '粤B·88888',
    type: '小型轿车',
    owner: '李某某',
    usage: '非营运',
    model: '大众 迈腾 2023款 330TSI DSG豪华型',
    vin: 'LFV3A23C7P3000001',
    engine: 'EA888-DPL',
    regDate: '2023-03',
    inspectionDate: '2024-01-15',
    mileage: 28000
};

// Demo Report Data
const demoReportData = {
    score: 94,
    grade: 'A',
    goodItems: 80,
    warningItems: 1,
    dangerItems: 0,
    inspectionOrg: '查博士',
    reportNo: '20240320001',
    inspectionDate: '2024-03-20',
    completionDate: '2024-03-20',
    issues: [
        {
            id: 1,
            severity: 'minor',
            title: '左前门漆面 - 轻微划痕',
            description: '左前门表面有轻微划痕，不影响车身结构',
            cost: 0,
            category: '漆面'
        }
    ],
    vehicleStructure: {
        bodyPanels: '正常',
        frame: '无异常',
        chassis: '正常'
    },
    // 详细检测项目列表
    detailedItems: {
        // 1. 车身漆面检测
        bodyPaint: {
            category: '车身漆面',
            icon: 'fa-spray-can',
            items: [
                { name: '引擎盖漆面', status: 'good', note: '无异常' },
                { name: '前保险杠漆面', status: 'good', note: '无异常' },
                { name: '左前翼子板漆面', status: 'good', note: '无异常' },
                { name: '右前翼子板漆面', status: 'good', note: '无异常' },
                { name: '左前门漆面', status: 'warning', note: '轻微划痕' },
                { name: '右前门漆面', status: 'good', note: '无异常' },
                { name: '左后门漆面', status: 'good', note: '无异常' },
                { name: '右后门漆面', status: 'good', note: '无异常' },
                { name: '左后翼子板漆面', status: 'good', note: '无异常' },
                { name: '右后翼子板漆面', status: 'good', note: '无异常' },
                { name: '后备箱盖漆面', status: 'good', note: '无异常' },
                { name: '后保险杠漆面', status: 'good', note: '无异常' },
                { name: '车顶漆面', status: 'good', note: '无异常' }
            ]
        },
        // 2. 车身骨架检测
        bodyFrame: {
            category: '车身骨架',
            icon: 'fa-car-side',
            items: [
                { name: '左前纵梁', status: 'good', note: '无异常' },
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
                { name: '漆面检测', status: 'warning', note: '左前门轻微划痕' },
                { name: '外观检测', status: 'good', note: '无异常' },
                { name: '内饰检测', status: 'good', note: '无异常' },
                { name: '骨架检测', status: 'good', note: '无异常' },
                { name: '机舱检测', status: 'good', note: '无异常' },
                { name: '底盘检测', status: 'good', note: '无异常' }
            ]
        },
        // 5. 机电系统
        electromechanical: {
            category: '机电系统',
            icon: 'fa-bolt',
            items: [
                { name: '发动机系统', status: 'good', note: '运行正常' },
                { name: '变速箱系统', status: 'good', note: '换挡平顺' },
                { name: '转向系统', status: 'good', note: '无异常' },
                { name: '制动系统', status: 'good', note: '无异常' },
                { name: '悬挂系统', status: 'good', note: '无异常' },
                { name: '传动系统', status: 'good', note: '无异常' },
                { name: '空调系统', status: 'good', note: '制冷正常' },
                { name: '电气系统', status: 'good', note: '无异常' },
                { name: '排放系统', status: 'good', note: '符合国六标准' }
            ]
        },
        // 6. 基本照片检测
        basicPhotos: {
            category: '基本照片检测',
            icon: 'fa-camera',
            items: [
                { name: '左前45度', status: 'good', note: '已拍摄' },
                { name: '右前45度', status: 'good', note: '已拍摄' },
                { name: '正前', status: 'good', note: '已拍摄' },
                { name: '正后', status: 'good', note: '已拍摄' },
                { name: '车辆铭牌', status: 'good', note: '已拍摄' },
                { name: '发动机舱', status: 'good', note: '已拍摄' },
                { name: '后备箱', status: 'good', note: '已拍摄' },
                { name: '中控台', status: 'good', note: '已拍摄' },
                { name: '仪表盘', status: 'good', note: '已拍摄' },
                { name: '表显里程', status: 'good', note: '2.8万公里' },
                { name: 'VIN钢印号', status: 'good', note: '已拍摄' }
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
            steering: { required: '左舵', note: '与中国相同，无需改装' },
            inspection: { required: true, validity: 12 },
            customs: { duty: { car: 35, suv: 35, truck: 25 }, vat: 10 },
            registration: { required: true, fee: 500 }
        },
        notes: [
            '二手车进口关税约35%',
            '左舵车可直接进口，无需改装',
            '车龄限制较宽松（15年以内）',
            '需要办理进口许可证',
            '中国品牌在柬埔寨市场接受度高'
        ],
        opportunities: [
            '柬埔寨汽车市场快速增长',
            '左舵车可直接出口，节省改装成本',
            '中国二手车价格有竞争力'
        ],
        challenges: [
            '道路基础设施相对落后',
            '进口关税较高'
        ]
    },
    'TH': {
        name: '泰国',
        nameEn: 'Thailand',
        policies: {
            age: { max: 5, strict: true },
            emissions: { required: true, standard: '欧五/国五以上' },
            leftHandDrive: { allowed: false, note: '必须改装为右舵' },
            steering: { required: '右舵', note: '必须改装' },
            inspection: { required: true, validity: 6 },
            customs: { duty: { car: 80, suv: 80, truck: 40 }, vat: 7 },
            registration: { required: true, fee: 800 }
        },
        notes: [
            '仅允许右舵车进口，必须改装',
            '车龄限制严格（5年以内）',
            '进口关税较高（约80%）',
            '需要通过严格的排放检测',
            '需要获得型式认证'
        ],
        opportunities: [
            '泰国是东南亚最大汽车市场',
            '消费者对高品质二手车需求大',
            '改装产业链成熟'
        ],
        challenges: [
            '必须右舵改装，成本约2-5万元',
            '车龄限制严格',
            '进口关税高'
        ]
    },
    'VN': {
        name: '越南',
        nameEn: 'Vietnam',
        policies: {
            age: { max: 5, strict: true },
            emissions: { required: true, standard: '欧四/国四以上' },
            leftHandDrive: { allowed: false, note: '必须右舵' },
            steering: { required: '右舵', note: '必须改装' },
            inspection: { required: true, validity: 12 },
            customs: { duty: { car: 45, suv: 50, truck: 30 }, vat: 10 },
            registration: { required: true, fee: 600 }
        },
        notes: [
            '仅允许右舵车进口',
            '车龄限制5年以内',
            '进口关税约45-50%',
            '需要通过排放检测',
            '河内、胡志明市限行区域多'
        ],
        opportunities: [
            '摩托车向汽车转型期',
            '年轻人口多，汽车需求增长'
        ],
        challenges: [
            '必须右舵改装',
            '车龄限制严格'
        ]
    },
    'LA': {
        name: '老挝',
        nameEn: 'Laos',
        policies: {
            age: { max: 12, strict: false },
            emissions: { required: false, standard: null },
            leftHandDrive: { allowed: true, note: '允许左舵' },
            steering: { required: '左舵', note: '与中国相同' },
            inspection: { required: true, validity: 12 },
            customs: { duty: { car: 40, suv: 40, truck: 20 }, vat: 10 },
            registration: { required: true, fee: 400 }
        },
        notes: [
            '左舵车可直接进口',
            '车龄限制较宽松（12年以内）',
            '进口关税约40%',
            '政策相对宽松'
        ],
        opportunities: [
            '中国投资活跃，对中国车接受度高',
            '左舵车可直接出口',
            '市场竞争相对较小'
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
            steering: { required: '左舵', note: '与中国相同' },
            inspection: { required: true, validity: 12 },
            customs: { duty: { car: 40, suv: 40, truck: 25 }, vat: 5 },
            registration: { required: true, fee: 300 }
        },
        notes: [
            '左舵车可直接进口',
            '车龄限制10年以内',
            '进口关税约40%',
            '市场尚处于起步阶段'
        ],
        opportunities: [
            '市场潜力大',
            '中国品牌认知度高',
            '左舵车可直接出口'
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
            emissions: { required: true, standard: '欧四/国四以上' },
            leftHandDrive: { allowed: false, note: '必须右舵' },
            steering: { required: '右舵', note: '必须改装' },
            inspection: { required: true, validity: 12 },
            customs: { duty: { car: 30, suv: 30, truck: 20 }, vat: 10 },
            registration: { required: true, fee: 700 }
        },
        notes: [
            '仅允许右舵车进口',
            '车龄限制严格（5年以内）',
            '进口关税约30%',
            '本土品牌保护政策'
        ],
        opportunities: [
            '人均GDP较高，购买力强',
            '汽车文化成熟'
        ],
        challenges: [
            '必须右舵改装',
            '本土品牌竞争激烈'
        ]
    },
    'SG': {
        name: '新加坡',
        nameEn: 'Singapore',
        policies: {
            age: { max: 3, strict: true },
            emissions: { required: true, standard: '欧六/国六' },
            leftHandDrive: { allowed: false, note: '必须右舵' },
            steering: { required: '右舵', note: '必须改装' },
            inspection: { required: true, validity: 6 },
            customs: { duty: { car: 20, suv: 20, truck: 10 }, vat: 8 },
            registration: { required: true, fee: 1000 }
        },
        notes: [
            '需申请COE（拥车证），费用昂贵',
            '车龄限制极严格（3年以内）',
            '碳排放要求严格',
            '需要右舵改装'
        ],
        opportunities: [
            '人均收入高，购买力强',
            '政府推广环保车'
        ],
        challenges: [
            'COE价格昂贵',
            '车龄限制极严格',
            '认证要求极高'
        ]
    },
    'ID': {
        name: '印度尼西亚',
        nameEn: 'Indonesia',
        policies: {
            age: { max: 5, strict: true },
            emissions: { required: true, standard: '欧四/国四以上' },
            leftHandDrive: { allowed: false, note: '必须右舵' },
            steering: { required: '右舵', note: '必须改装' },
            inspection: { required: true, validity: 12 },
            customs: { duty: { car: 40, suv: 40, truck: 25 }, vat: 11 },
            registration: { required: true, fee: 500 }
        },
        notes: [
            '仅允许右舵车进口',
            '车龄限制5年以内',
            '进口关税约40%',
            '人口众多，市场潜力大'
        ],
        opportunities: [
            '人口众多，市场潜力大',
            '汽车需求持续增长'
        ],
        challenges: [
            '必须右舵改装',
            '认证流程复杂'
        ]
    },
    'PH': {
        name: '菲律宾',
        nameEn: 'Philippines',
        policies: {
            age: { max: 5, strict: false },
            emissions: { required: true, standard: '欧四/国四以上' },
            leftHandDrive: { allowed: false, note: '必须右舵' },
            steering: { required: '右舵', note: '必须改装' },
            inspection: { required: true, validity: 12 },
            customs: { duty: { car: 30, suv: 30, truck: 20 }, vat: 12 },
            registration: { required: true, fee: 400 }
        },
        notes: [
            '仅允许右舵车进口',
            '需要右舵改装',
            '进口关税约30%',
            '英语普及，沟通便利'
        ],
        opportunities: [
            '英语普及，沟通便利',
            '年轻人对汽车接受度高'
        ],
        challenges: [
            '必须右舵改装',
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
            steering: { required: '右舵', note: '必须改装' },
            inspection: { required: true, validity: 12 },
            customs: { duty: { car: 20, suv: 20, truck: 15 }, vat: 0 },
            registration: { required: true, fee: 300 }
        },
        notes: [
            '仅允许右舵车进口',
            '免税国家，无VAT',
            '进口关税较低（约20%）',
            '需要右舵改装'
        ],
        opportunities: [
            '人均GDP极高',
            '无个人所得税'
        ],
        challenges: [
            '市场规模很小',
            '必须右舵改装'
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
    document.getElementById('license-preview').src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iI2YwZmRmNCIvPgogIDx0ZXh0IHg9IjIwMCIgeT0iMTI1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiMwNTk2NjkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7lj5bor4HnjKvnkIYgKOaIkOeri+Wbvik8L3RleHQ+Cjwvc3ZnPg==';
    
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
    
    // Use placeholder for preview
    document.getElementById('report-preview').src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2YwZmRmNCIvPgogIDx0ZXh0IHg9IjIwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiMwNTk2NjkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7mmbrkuIvmoYgj5qC56KGM5pS26Ze0PC90ZXh0Pgo8L3N2Zz4=';
    
    document.getElementById('report-upload-area').classList.add('hidden');
    document.getElementById('report-preview-area').classList.remove('hidden');
    document.getElementById('report-scanning-overlay').classList.add('hidden');
    
    displayReportResult();
    
    // Auto confirm for demo
    confirmReportData();
    
    showToast('已加载示例检测报告（大众迈腾2023款）', 'info');
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
    
    // 发动机参数
    safeSetValue('form-displacement', data.displacement);
    safeSetValue('form-power', data.power);
    safeSetValue('form-emission-standard', data.emissionStandard);
    safeSetValue('form-transmission', data.transmission);
    safeSetValue('form-drive-type', data.driveType);
    safeSetValue('form-steering', data.steering);
    
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

function addIssue() {
    const newIssue = {
        id: Date.now(),
        name: '新检测问题',
        desc: '',
        severity: '轻微'
    };
    
    AppState.step3Data.issues.push(newIssue);
    renderIssuesList();
    showToast('已添加新问题', 'success');
}

function deleteIssue(index) {
    AppState.step3Data.issues.splice(index, 1);
    renderIssuesList();
    showToast('已删除问题', 'info');
}

function editIssue(index) {
    const issue = AppState.step3Data.issues[index];
    if (!issue) return;
    
    const content = `
        <div class="edit-item-form">
            <div class="form-group">
                <label>问题名称</label>
                <input type="text" id="edit-issue-name" value="${issue.name}" placeholder="问题名称">
            </div>
            <div class="form-group">
                <label>严重程度</label>
                <select id="edit-issue-severity">
                    <option value="轻微" ${issue.severity === '轻微' ? 'selected' : ''}>轻微</option>
                    <option value="一般" ${issue.severity === '一般' ? 'selected' : ''}>一般</option>
                    <option value="严重" ${issue.severity === '严重' ? 'selected' : ''}>严重</option>
                </select>
            </div>
            <div class="form-group">
                <label>问题描述</label>
                <textarea id="edit-issue-desc" rows="3" placeholder="问题描述">${issue.desc || ''}</textarea>
            </div>
        </div>
    `;
    
    showModal('编辑检测问题', content, [
        { text: '取消', class: 'btn-secondary', action: 'closeModal()' },
        { text: '保存', class: 'btn-primary', action: `saveIssueEdit(${index})` }
    ]);
}

function saveIssueEdit(index) {
    const nameInput = document.getElementById('edit-issue-name');
    const severityInput = document.getElementById('edit-issue-severity');
    const descInput = document.getElementById('edit-issue-desc');
    
    if (nameInput && severityInput) {
        AppState.step3Data.issues[index].name = nameInput.value;
        AppState.step3Data.issues[index].severity = severityInput.value;
        AppState.step3Data.issues[index].desc = descInput ? descInput.value : '';
        
        renderIssuesList();
        showToast('检测问题已更新', 'success');
    }
    
    closeModal();
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
        
        // 发动机参数
        displacement: parseFloat(getValue('form-displacement')) || 0,
        power: parseInt(getValue('form-power')) || 0,
        emissionStandard: getValue('form-emission-standard'),
        transmission: getValue('form-transmission'),
        driveType: getValue('form-drive-type'),
        steering: getValue('form-steering'),
        
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
        displacement: AppState.step3Data.displacement,
        emissionStandard: AppState.step3Data.emissionStandard,
        steering: AppState.step3Data.steering
    };
    
    showToast('审核信息已保存', 'success');
    return true;
}

function bindManualReviewEvents() {
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
}

// ========================================
// Step 4: Declaration Information
// ========================================
function loadDeclarationData() {
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
        { id: 'summary-year', value: data.year },
        { id: 'summary-mileage', value: data.mileage ? data.mileage + ' km' : '-' },
        { id: 'summary-displacement', value: data.displacement ? data.displacement + ' L' : '-' },
        { id: 'summary-emission', value: data.emissionStandard || '-' }
    ];
    
    fields.forEach(field => {
        const el = document.getElementById(field.id);
        if (el) {
            el.textContent = field.value || '-';
        }
    });
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

function saveDeclarationInfo() {
    if (AppState.step3Data) {
        AppState.vehicleInfo = {
            plate: AppState.step3Data.plate,
            brand: AppState.step3Data.brand,
            model: AppState.step3Data.model,
            year: AppState.step3Data.year,
            vin: AppState.step3Data.vin,
            engine: AppState.step3Data.engine,
            mileage: AppState.step3Data.mileage,
            displacement: AppState.step3Data.displacement,
            emissionStandard: AppState.step3Data.emissionStandard,
            steering: AppState.step3Data.steering
        };
    }
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
    
    const prevBtn = document.getElementById('btn-step4-prev');
    
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
// Step 5: Compliance Check
// ========================================
function startComplianceCheck() {
    const checkingContainer = document.getElementById('checking-container');
    const resultContainer = document.getElementById('result-container');
    const step5Nav = document.getElementById('step5-navigation');
    
    if (checkingContainer) checkingContainer.classList.remove('hidden');
    if (resultContainer) resultContainer.classList.add('hidden');
    if (step5Nav) step5Nav.classList.add('hidden');
    
    const checkingItems = [
        { id: 'info', text: '读取车辆信息...', duration: 800 },
        { id: 'age', text: '检测车龄限制...', duration: 1000 },
        { id: 'emissions', text: '检测排放标准...', duration: 1200 },
        { id: 'steering', text: '检测驾驶位方向...', duration: 800 },
        { id: 'customs', text: '计算关税费用...', duration: 1200 },
        { id: 'policy', text: '查询进口政策...', duration: 1000 },
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
    const step5Nav = document.getElementById('step5-navigation');
    
    if (checkingContainer) checkingContainer.classList.add('hidden');
    if (resultContainer) resultContainer.classList.remove('hidden');
    if (step5Nav) step5Nav.classList.remove('hidden');
    
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
    const ageLimit = policies.policies.age.max;
    const ageStrict = policies.policies.age.strict;
    if (vehicleAge <= ageLimit) {
        results.items.push({
            title: '车龄限制',
            description: `车辆年龄 ${vehicleAge} 年，符合要求（≤${ageLimit}年）`,
            status: 'pass',
            statusText: '通过'
        });
        results.passCount++;
    } else if (vehicleAge <= ageLimit + 2 && !ageStrict) {
        results.items.push({
            title: '车龄限制',
            description: `车辆年龄 ${vehicleAge} 年，超出建议年限（≤${ageLimit}年）`,
            status: 'warning',
            statusText: '警告'
        });
        results.warningCount++;
        results.recommendations.push(`车辆车龄为${vehicleAge}年，建议优先出口到${policies.name}。`);
    } else {
        results.items.push({
            title: '车龄限制',
            description: `车辆年龄 ${vehicleAge} 年，超出限制（≤${ageLimit}年）`,
            status: 'fail',
            statusText: '未通过'
        });
        results.failCount++;
        results.recommendations.push(`车辆车龄超标，建议更换其他目标国家。`);
    }
    
    // Emissions check
    if (policies.policies.emissions.required) {
        const emissionStandards = ['国一', '国二', '国三', '国四', '国五', '国六'];
        const vehicleEmissionIndex = emissionStandards.indexOf(vehicle.emissionStandard);
        const requiredIndex = emissionStandards.indexOf(policies.policies.emissions.standard);
        
        if (vehicleEmissionIndex >= requiredIndex) {
            results.items.push({
                title: '排放标准',
                description: `${vehicle.emissionStandard} 符合要求（${policies.policies.emissions.standard}以上）`,
                status: 'pass',
                statusText: '通过'
            });
            results.passCount++;
        } else {
            results.items.push({
                title: '排放标准',
                description: `${vehicle.emissionStandard} 不符合要求（需${policies.policies.emissions.standard}以上）`,
                status: 'fail',
                statusText: '未通过'
            });
            results.failCount++;
            results.recommendations.push(`车辆排放标准不达标，建议选择排放标准要求较低的国家。`);
        }
    } else {
        results.items.push({
            title: '排放标准',
            description: `${policies.name} 暂无排放限制要求`,
            status: 'pass',
            statusText: '通过'
        });
        results.passCount++;
    }
    
    // Steering check (left/right hand drive)
    const steeringRequired = policies.policies.steering?.required;
    if (steeringRequired) {
        if (vehicle.steering === steeringRequired) {
            results.items.push({
                title: '驾驶位方向',
                description: `${vehicle.steering}，符合要求`,
                status: 'pass',
                statusText: '通过'
            });
            results.passCount++;
        } else {
            results.items.push({
                title: '驾驶位方向',
                description: `${vehicle.steering}，需改装为${steeringRequired}（改装成本约2-5万元）`,
                status: 'warning',
                statusText: '需改装'
            });
            results.warningCount++;
            results.recommendations.push(`需进行方向盘改装，预计增加成本2-5万元。`);
        }
    }
    
    // Calculate score
    const totalItems = results.items.length;
    if (totalItems > 0) {
        results.score = Math.round((results.passCount / totalItems) * 100);
        if (results.warningCount > 0) results.score -= results.warningCount * 10;
        if (results.failCount > 0) results.score -= results.failCount * 20;
        results.score = Math.max(0, Math.min(100, results.score));
    }
    
    // Determine overall status
    if (results.failCount > 0) {
        results.overall = results.score >= 60 ? 'warning' : 'fail';
    } else if (results.warningCount > 0) {
        results.overall = 'warning';
    } else {
        results.overall = 'pass';
    }
    
    // Export info
    results.exportInfo = [
        { label: '进口关税', value: `约${policies.policies.customs.duty.car}%` },
        { label: '增值税', value: `${policies.policies.customs.vat}%` },
        { label: '车龄限制', value: `${policies.policies.age.max}年` },
        { label: '检测有效期', value: `${policies.policies.inspection.validity}个月` }
    ];
    
    return results;
}

function animateScore(targetScore) {
    const scoreElement = document.getElementById('score-number');
    const scoreCircle = document.querySelector('.score-fill');
    let currentScore = 0;
    const duration = 1000;
    const interval = 20;
    const increment = targetScore / (duration / interval);
    
    const timer = setInterval(() => {
        currentScore += increment;
        if (currentScore >= targetScore) {
            currentScore = targetScore;
            clearInterval(timer);
        }
        scoreElement.textContent = Math.round(currentScore);
        if (scoreCircle) {
            scoreCircle.style.setProperty('--score', currentScore);
        }
    }, interval);
}

// ========================================
// Initialization
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Hide loading screen after 2 seconds
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
    }, 2000);
    
    // Initialize step 1
    initLicenseUpload();
    
    // Initialize step 2
    initReportUpload();
    
    // Initialize step 4 (country selection)
    initCountrySelection();
    
    // Initialize step 4 form
    initDeclarationForm();
    
    // Reset button
    document.getElementById('btn-reset').addEventListener('click', () => {
        location.reload();
    });
    
    // Modal close
    document.getElementById('modal-close').addEventListener('click', closeModal);
    
    // Step 5 navigation
    const step5Prev = document.getElementById('btn-step5-prev');
    const startOver = document.getElementById('btn-start-over');
    
    if (step5Prev) {
        step5Prev.addEventListener('click', prevStep);
    }
    
    if (startOver) {
        startOver.addEventListener('click', () => {
            location.reload();
        });
    }
    
    // Export buttons (placeholders)
    document.getElementById('btn-export-word')?.addEventListener('click', () => {
        showToast('Word导出功能开发中...', 'info');
    });
    
    document.getElementById('btn-export-pdf')?.addEventListener('click', () => {
        showToast('PDF导出功能开发中...', 'info');
    });
    
    document.getElementById('btn-export-report')?.addEventListener('click', () => {
        showToast('文本报告导出功能开发中...', 'info');
    });
    
    document.getElementById('btn-export-declaration')?.addEventListener('click', () => {
        showToast('报关单导出功能开发中...', 'info');
    });
});
