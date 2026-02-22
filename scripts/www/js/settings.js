/**
 * Settings Panel Functionality
 * Manages knowledge base, API configuration, and batch import
 */

// Comprehensive dictionary of used car domain terms
const CAR_DOMAIN_TERMS = [
    // Financial terms
    '贷款', '过户', '检测', '保险', '分期', '首付', '利率', '审批', '月供', '尾款',
    '全款', '按揭', '抵押', '征信', '流水', '收入证明', '还款', '期限', '费率',
    '金融服务费', 'GPS费', '评估费', '手续费', '购置税', '车船税', '交强险', '商业险',
    '第三者责任险', '车损险', '盗抢险', '不计免赔', '座位险', '划痕险', '玻璃险',
    
    // Vehicle terms
    '车况', '里程', '排量', '发动机', '变速箱', '底盘', '悬挂', '刹车', '轮胎',
    '漆面', '内饰', '外观', '配置', '天窗', '导航', '倒车影像', '雷达', '真皮座椅',
    '电动座椅', '座椅加热', '座椅通风', '空调', '音响', '大灯', 'LED灯', '氙气灯',
    '轮毂', '铝合金轮毂', '备胎', '工具包', '千斤顶', '灭火器', '三角警示牌',
    
    // Transaction terms
    '价格', '报价', '砍价', '议价', '优惠', '折扣', '赠品', '装潢', '保养',
    '质保', '延保', '保修', '三包', '退换', '退款', '定金', '订金', '押金',
    '合同', '协议', '发票', '合格证', '登记证书', '行驶证', '驾驶证', '身份证',
    '居住证', '暂住证', '户口本', '结婚证', '营业执照', '组织机构代码证',
    
    // Process terms
    '看车', '试驾', '验车', '提车', '上牌', '选号', '年检', '年审', '保养',
    '维修', '改装', '加装', '置换', '报废', '注销', '挂失', '补办', '变更',
    '转移', '迁入', '迁出', '提档', '落户', '限购', '摇号', '竞拍', '指标',
    
    // Vehicle types
    '轿车', 'SUV', 'MPV', '跑车', '皮卡', '面包车', '货车', '客车', '新能源车',
    '电动车', '混动车', '插电混动', '油电混合', '纯电动', '增程式', '燃料电池',
    '两厢车', '三厢车', '旅行车', '跨界车', '越野车', '硬派越野', '城市SUV',
    
    // Brand terms (common)
    '大众', '丰田', '本田', '日产', '别克', '福特', '现代', '起亚', '雪佛兰',
    '宝马', '奔驰', '奥迪', '雷克萨斯', '沃尔沃', '凯迪拉克', '捷豹', '路虎',
    '保时捷', '法拉利', '兰博基尼', '玛莎拉蒂', '宾利', '劳斯莱斯', '迈巴赫',
    '比亚迪', '吉利', '长城', '长安', '奇瑞', '荣威', '名爵', '传祺', '红旗',
    '蔚来', '小鹏', '理想', '特斯拉', '威马', '哪吒', '零跑', '极氪', '岚图',
    
    // Condition terms
    '新车', '二手车', '准新车', '试驾车', '展车', '库存车', '运损车', '泡水车',
    '事故车', '火烧车', '调表车', '拼装车', '走私车', '抵押车', '查封车', '锁定车',
    '一手车', '二手车', '三手车', '个人车', '商家车', '4S店', '二手车市场', '车商',
    
    // Document terms
    '大本', '绿本', '登记证书', '行驶证', '购车发票', '购置税发票', '完税证明',
    '交强险保单', '商业险保单', '保养记录', '维修记录', '出险记录', '4S店记录',
    '检测报告', '评估报告', '鉴定报告', '公证', '委托书', '授权书', '承诺书'
];

// Stop words to remove during keyword extraction
const STOP_WORDS = [
    '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也',
    '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', '那',
    '这些', '那些', '这个', '那个', '之', '与', '及', '或', '但', '而', '因为', '所以',
    '如果', '虽然', '然而', '因此', '于是', '而且', '并且', '或者', '还是', '要么',
    '请问', '请问一下', '想', '知道', '咨询', '了解一下', '问下', '问一下', '能否',
    '能不能', '可以', '可不可以', '行吗', '行么', '吗', '呢', '吧', '啊', '呀', '哇',
    '哦', '嗯', '哎', '唉', '哼', '哈', '呵', '嘿', '嗨', '哟', '喽', '嘛', '呗',
    '什么', '怎么', '多少', '几', '谁', '哪', '哪里', '何时', '为什么', '如何',
    '需要', '想要', '打算', '准备', '计划', '希望', '期望', '要求', '必须', '应该',
    '应当', '该', '得', '须', '需', '用', '使用', '采用', '采取', '进行', '开展',
    '实施', '执行', '完成', '实现', '达到', '得到', '获得', '取得', '收到', '受到',
    '关于', '对于', '至于', '有关', '相关', '涉及', '牵涉', '关联', '联系', '关系'
];

// Settings state
let settingsState = {
    apiConfig: {
        zhipuApiKey: '',
        zhipuModel: 'glm-4'
    },
    knowledgeBase: [],
    isSettingsOpen: false
};

// Temporary storage for parsed batch items
let parsedBatchItems = [];

// Initialize settings
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    initializeSettingsPanel();
    renderKnowledgeBase();
    updateSystemInfo();
});

/**
 * Initialize settings panel event listeners
 */
function initializeSettingsPanel() {
    // Toggle API key visibility
    const toggleZhipuKey = document.getElementById('toggleZhipuKey');
    if (toggleZhipuKey) {
        toggleZhipuKey.addEventListener('click', toggleApiKeyVisibility);
    }

    // Test API connection
    const testZhipuBtn = document.getElementById('testZhipuBtn');
    if (testZhipuBtn) {
        testZhipuBtn.addEventListener('click', testApiConnection);
    }

    // Save API config
    const saveZhipuBtn = document.getElementById('saveZhipuBtn');
    if (saveZhipuBtn) {
        saveZhipuBtn.addEventListener('click', saveApiConfig);
    }

    // Export knowledge base
    const exportKbBtn = document.getElementById('exportKbBtn');
    if (exportKbBtn) {
        exportKbBtn.addEventListener('click', exportKnowledgeBase);
    }

    // Batch add button
    const batchAddBtn = document.getElementById('batchAddBtn');
    if (batchAddBtn) {
        batchAddBtn.addEventListener('click', openBatchModal);
    }

    // Close batch modal
    const closeBatchModal = document.getElementById('closeBatchModal');
    if (closeBatchModal) {
        closeBatchModal.addEventListener('click', closeBatchModalFunc);
    }

    // Parse batch button
    const parseBatchBtn = document.getElementById('parseBatchBtn');
    if (parseBatchBtn) {
        parseBatchBtn.addEventListener('click', previewBatchImport);
    }

    // Confirm batch button (direct add from batch modal)
    const confirmBatchBtn = document.getElementById('confirmBatchBtn');
    if (confirmBatchBtn) {
        confirmBatchBtn.addEventListener('click', confirmBatchImport);
    }

    // Close preview modal
    const closePreviewModal = document.getElementById('closePreviewModal');
    if (closePreviewModal) {
        closePreviewModal.addEventListener('click', closePreviewModalFunc);
    }

    // Back to batch button
    const backToBatchBtn = document.getElementById('backToBatchBtn');
    if (backToBatchBtn) {
        backToBatchBtn.addEventListener('click', backToBatchModal);
    }

    // Confirm preview button
    const confirmPreviewBtn = document.getElementById('confirmPreviewBtn');
    if (confirmPreviewBtn) {
        confirmPreviewBtn.addEventListener('click', confirmPreviewImport);
    }

    // Close edit modal
    const closeEditModal = document.getElementById('closeEditModal');
    if (closeEditModal) {
        closeEditModal.addEventListener('click', closeEditModalFunc);
    }

    // Save edit button
    const saveEditBtn = document.getElementById('saveEditBtn');
    if (saveEditBtn) {
        saveEditBtn.addEventListener('click', saveEditKnowledge);
    }

    // Delete knowledge button
    const deleteKnowledgeBtn = document.getElementById('deleteKnowledgeBtn');
    if (deleteKnowledgeBtn) {
        deleteKnowledgeBtn.addEventListener('click', deleteEditKnowledge);
    }

    // Knowledge base search
    const kbSearch = document.getElementById('kbSearch');
    if (kbSearch) {
        kbSearch.addEventListener('input', debounce(searchKnowledgeBase, 300));
    }

    // Close modals on outside click
    window.addEventListener('click', function(e) {
        const batchModal = document.getElementById('batchModal');
        const previewModal = document.getElementById('previewModal');
        const editModal = document.getElementById('editModal');
        
        if (e.target === batchModal) {
            closeBatchModalFunc();
        }
        if (e.target === previewModal) {
            closePreviewModalFunc();
        }
        if (e.target === editModal) {
            closeEditModalFunc();
        }
    });
}

/**
 * Toggle API key visibility
 */
function toggleApiKeyVisibility() {
    const apiKeyInput = document.getElementById('zhipuApiKey');
    const toggleBtn = document.getElementById('toggleZhipuKey');
    
    if (apiKeyInput.type === 'password') {
        apiKeyInput.type = 'text';
        toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        apiKeyInput.type = 'password';
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

/**
 * Test API connection
 */
async function testApiConnection() {
    const apiKey = document.getElementById('zhipuApiKey').value.trim();
    const model = document.getElementById('zhipuModel').value;
    const resultDiv = document.getElementById('zhipuTestResult');
    
    if (!apiKey) {
        showTestResult('请输入API Key', 'error');
        return;
    }
    
    resultDiv.classList.remove('hidden', 'bg-green-100', 'text-green-700', 'bg-red-100', 'text-red-700');
    resultDiv.classList.add('bg-blue-100', 'text-blue-700');
    resultDiv.textContent = '正在测试连接...';
    
    try {
        const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: '你好' }],
                max_tokens: 10
            })
        });
        
        if (response.ok) {
            showTestResult('连接成功！API Key有效', 'success');
        } else {
            const error = await response.json();
            showTestResult(`连接失败：${error.error?.message || '未知错误'}`, 'error');
        }
    } catch (error) {
        showTestResult(`连接失败：${error.message}`, 'error');
    }
}

/**
 * Show test result
 */
function showTestResult(message, type) {
    const resultDiv = document.getElementById('zhipuTestResult');
    resultDiv.classList.remove('hidden', 'bg-green-100', 'text-green-700', 'bg-red-100', 'text-red-700', 'bg-blue-100', 'text-blue-700');
    
    if (type === 'success') {
        resultDiv.classList.add('bg-green-100', 'text-green-700');
    } else if (type === 'error') {
        resultDiv.classList.add('bg-red-100', 'text-red-700');
    }
    
    resultDiv.textContent = message;
}

/**
 * Save API configuration
 */
function saveApiConfig() {
    const apiKey = document.getElementById('zhipuApiKey').value.trim();
    const model = document.getElementById('zhipuModel').value;
    
    settingsState.apiConfig = {
        zhipuApiKey: apiKey,
        zhipuModel: model
    };
    
    saveSettings();
    updateSystemInfo();
    showNotification('API配置已保存', 'success');
}

/**
 * Load API configuration into form
 */
function loadApiConfigIntoForm() {
    const apiKeyInput = document.getElementById('zhipuApiKey');
    const modelSelect = document.getElementById('zhipuModel');
    
    if (apiKeyInput) apiKeyInput.value = settingsState.apiConfig.zhipuApiKey || '';
    if (modelSelect) modelSelect.value = settingsState.apiConfig.zhipuModel || 'glm-4';
}

/**
 * Render knowledge base list
 */
function renderKnowledgeBase() {
    const kbList = document.getElementById('kbList');
    if (!kbList) return;

    if (settingsState.knowledgeBase.length === 0) {
        kbList.innerHTML = `
            <div class="text-center py-8 text-slate-500">
                <i class="fas fa-book-open text-4xl mb-3"></i>
                <p>知识库为空，点击"批量添加"开始构建</p>
            </div>
        `;
        return;
    }

    kbList.innerHTML = settingsState.knowledgeBase.map((item, index) => `
        <div class="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition cursor-pointer" data-index="${index}">
            <div class="flex items-start justify-between">
                <div class="flex-1" onclick="openEditModal(${index})">
                    <div class="flex items-center space-x-2 mb-2">
                        <span class="px-2 py-1 bg-secondary text-white text-xs rounded">${escapeHtml(item.keyword)}</span>
                    </div>
                    <div class="text-sm font-medium text-slate-800 mb-1">${escapeHtml(item.question)}</div>
                    <div class="text-sm text-slate-600 line-clamp-2">${escapeHtml(item.answer)}</div>
                </div>
                <button class="ml-2 text-slate-400 hover:text-danger transition" onclick="deleteKnowledgeItem(${index})" title="删除">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Open batch modal
 */
function openBatchModal() {
    const modal = document.getElementById('batchModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        // Reset form
        const batchInput = document.getElementById('batchInput');
        if (batchInput) batchInput.value = '';
        parsedBatchItems = [];
    }
}

/**
 * Close batch modal
 */
function closeBatchModalFunc() {
    const modal = document.getElementById('batchModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

/**
 * Preview batch import
 */
function previewBatchImport() {
    const batchInput = document.getElementById('batchInput');
    const importText = batchInput.value.trim();

    if (!importText) {
        showNotification('请输入要导入的内容', 'error');
        return;
    }

    // Auto-detect format and parse
    parsedBatchItems = parseImportText(importText);

    if (parsedBatchItems.length === 0) {
        showNotification('未能解析出有效内容，请检查格式', 'error');
        return;
    }

    // Show preview modal
    const previewModal = document.getElementById('previewModal');
    const previewList = document.getElementById('previewList');
    
    if (previewList) {
        previewList.innerHTML = parsedBatchItems.map((item, index) => `
            <div class="bg-slate-50 rounded-lg p-3 border">
                <div class="flex items-center justify-between mb-2">
                    <span class="px-2 py-1 bg-secondary text-white text-xs rounded">${escapeHtml(item.keyword)}</span>
                    <span class="text-xs text-slate-400">#${index + 1}</span>
                </div>
                <div class="text-sm font-medium text-slate-800 mb-1">Q: ${escapeHtml(item.question)}</div>
                <div class="text-sm text-slate-600">A: ${escapeHtml(item.answer.substring(0, 100))}${item.answer.length > 100 ? '...' : ''}</div>
            </div>
        `).join('');
    }
    
    if (previewModal) {
        previewModal.classList.remove('hidden');
        previewModal.classList.add('flex');
    }
    
    // Close batch modal
    closeBatchModalFunc();
}

/**
 * Confirm import from preview modal
 */
function confirmPreviewImport() {
    if (parsedBatchItems.length === 0) {
        showNotification('没有可导入的内容', 'error');
        return;
    }

    // Add to knowledge base
    settingsState.knowledgeBase = [...settingsState.knowledgeBase, ...parsedBatchItems];
    saveSettings();
    renderKnowledgeBase();
    updateSystemInfo();
    
    showNotification(`成功导入 ${parsedBatchItems.length} 条知识`, 'success');
    closePreviewModalFunc();
    parsedBatchItems = [];
}

/**
 * Confirm import directly from batch modal (without preview)
 */
function confirmBatchImport() {
    const batchInput = document.getElementById('batchInput');
    const importText = batchInput.value.trim();

    if (!importText) {
        showNotification('请输入要导入的内容', 'error');
        return;
    }

    const items = parseImportText(importText);

    if (items.length === 0) {
        showNotification('未能解析出有效内容，请检查格式', 'error');
        return;
    }

    // Add to knowledge base
    settingsState.knowledgeBase = [...settingsState.knowledgeBase, ...items];
    saveSettings();
    renderKnowledgeBase();
    updateSystemInfo();
    
    showNotification(`成功导入 ${items.length} 条知识`, 'success');
    closeBatchModalFunc();
}

/**
 * Back to batch modal from preview
 */
function backToBatchModal() {
    closePreviewModalFunc();
    openBatchModal();
}

/**
 * Close preview modal
 */
function closePreviewModalFunc() {
    const modal = document.getElementById('previewModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

/**
 * Parse import text based on format
 * Supports two formats:
 * 1. Pipe-separated: keyword|question|answer
 * 2. Q&A format: Q: question A: answer (auto keyword extraction)
 * @param {string} text - Import text
 * @returns {Array} Parsed items
 */
function parseImportText(text) {
    const items = [];
    const lines = text.split('\n').filter(line => line.trim());

    // Detect format based on first few lines
    const hasPipeFormat = lines.some(line => {
        const parts = line.split('|');
        return parts.length >= 3 && parts[0].trim() && parts[1].trim() && parts[2].trim();
    });

    const hasQAFormat = lines.some(line => /^Q\d*[:：]\s*/i.test(line.trim()));

    if (hasPipeFormat) {
        // Format 1: keyword|question|answer
        for (const line of lines) {
            const parts = line.split('|').map(p => p.trim());
            if (parts.length >= 3 && parts[0] && parts[1] && parts[2]) {
                items.push({
                    keyword: parts[0],
                    question: parts[1],
                    answer: parts.slice(2).join('|')
                });
            }
        }
    } else if (hasQAFormat) {
        // Format 2: Qxxx: question Axxx: answer
        let currentQuestion = '';
        let currentAnswer = '';
        let questionNumber = '';

        for (const line of lines) {
            const trimmedLine = line.trim();
            
            // Match Qxxx: pattern
            const qMatch = trimmedLine.match(/^Q(\d*)[:：]\s*(.+)/i);
            if (qMatch) {
                // Save previous Q&A pair if exists
                if (currentQuestion && currentAnswer) {
                    const keyword = extractKeywordFromQuestion(currentQuestion);
                    items.push({
                        keyword,
                        question: currentQuestion,
                        answer: currentAnswer.trim()
                    });
                }
                questionNumber = qMatch[1] || '';
                currentQuestion = qMatch[2];
                currentAnswer = '';
                continue;
            }

            // Match Axxx: pattern
            const aMatch = trimmedLine.match(/^A(\d*)[:：]\s*(.+)/i);
            if (aMatch && (aMatch[1] === questionNumber || (!aMatch[1] && questionNumber === ''))) {
                currentAnswer = aMatch[2];
                continue;
            }

            // Continue previous answer (multi-line support)
            if (currentAnswer && !trimmedLine.match(/^[QA]\d*[:：]/i)) {
                currentAnswer += '\n' + trimmedLine;
            }
        }

        // Don't forget the last Q&A pair
        if (currentQuestion && currentAnswer) {
            const keyword = extractKeywordFromQuestion(currentQuestion);
            items.push({
                keyword,
                question: currentQuestion,
                answer: currentAnswer.trim()
            });
        }
    } else {
        // Try simple line-based parsing as fallback
        // Assume format: question|answer (auto keyword)
        for (const line of lines) {
            const parts = line.split('|').map(p => p.trim());
            if (parts.length >= 2 && parts[0] && parts[1]) {
                const keyword = extractKeywordFromQuestion(parts[0]);
                items.push({
                    keyword,
                    question: parts[0],
                    answer: parts.slice(1).join('|')
                });
            }
        }
    }

    return items;
}

/**
 * Extract keyword from question using intelligent analysis
 * @param {string} question - The question text
 * @returns {string} Extracted keyword
 */
function extractKeywordFromQuestion(question) {
    if (!question || typeof question !== 'string') {
        return '通用';
    }

    const cleanedQuestion = question.trim();
    if (cleanedQuestion.length === 0) {
        return '通用';
    }

    // Step 1: Try to find domain terms in the question
    const foundTerms = [];
    for (const term of CAR_DOMAIN_TERMS) {
        if (cleanedQuestion.includes(term)) {
            foundTerms.push(term);
        }
    }

    // If we found domain terms, use the longest one (most specific)
    if (foundTerms.length > 0) {
        foundTerms.sort((a, b) => b.length - a.length);
        return foundTerms[0];
    }

    // Step 2: Extract noun phrases
    const nounPhrase = extractNounPhrase(cleanedQuestion);
    if (nounPhrase && nounPhrase.length >= 2) {
        return nounPhrase;
    }

    // Step 3: Remove stop words and get meaningful words
    const words = cleanedQuestion
        .replace(/[？?。.,!！;；:：""''（）()【】\[\]]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length >= 2 && !STOP_WORDS.includes(word));

    if (words.length > 0) {
        // Return first 2 meaningful words joined
        return words.slice(0, 2).join('');
    }

    // Step 4: Fallback to first few characters
    return cleanedQuestion.substring(0, 4) || '通用';
}

/**
 * Extract noun phrase from text
 * Uses pattern matching and dictionary lookup
 * @param {string} text - Input text
 * @returns {string|null} Noun phrase or null
 */
function extractNounPhrase(text) {
    // Common noun patterns in Chinese
    const patterns = [
        // Vehicle + attribute: 车况如何 -> 车况
        /([\u4e00-\u9fa5]{2,4})(?:如何|怎么样|好吗|可以吗)/,
        // How to + verb: 怎么办理 -> 办理
        /(?:怎么|如何|怎样)([\u4e00-\u9fa5]{2,4})/,
        // Want to + verb: 想要买 -> 买车
        /(?:想要|想|要|准备|打算)([\u4e00-\u9fa5]{2,4})/,
        // About + noun: 关于贷款 -> 贷款
        /(?:关于|有关|涉及)([\u4e00-\u9fa5]{2,4})/,
        // Noun + question: 首付多少 -> 首付
        /([\u4e00-\u9fa5]{2,4})(?:多少|几|什么|哪个)/,
        // Can + verb: 能过户吗 -> 过户
        /(?:能|可以|能够)([\u4e00-\u9fa5]{2,4})(?:吗|么)/,
        // Need + verb: 需要检测 -> 检测
        /(?:需要|得|必须|应该)([\u4e00-\u9fa5]{2,4})/,
        // Is there + noun: 有没有保险 -> 保险
        /(?:有没有|是否有|有没)([\u4e00-\u9fa5]{2,4})/,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    // Look for common noun suffixes
    const nounSuffixes = ['车', '费', '险', '款', '证', '照', '税', '金', '期', '率', '额', '本', '单', '号', '牌', '型', '色', '况', '程', '置', '饰', '胎', '灯', '椅', '盘', '箱', '调', '响', '窗', '镜', '门', '盖', '杠', '膜', '垫', '套', '架', '箱', '包', '膜'];
    
    for (const suffix of nounSuffixes) {
        const regex = new RegExp(`([\\u4e00-\\u9fa5]{1,3})${suffix}`);
        const match = text.match(regex);
        if (match && match[0] && match[0].length >= 2) {
            return match[0];
        }
    }

    return null;
}

/**
 * Open edit modal
 */
function openEditModal(index) {
    const item = settingsState.knowledgeBase[index];
    if (!item) return;
    
    const modal = document.getElementById('editModal');
    const editKey = document.getElementById('editKey');
    const editQuestion = document.getElementById('editQuestion');
    const editAnswer = document.getElementById('editAnswer');
    
    if (editKey) editKey.value = item.keyword;
    if (editQuestion) editQuestion.value = item.question;
    if (editAnswer) editAnswer.value = item.answer;
    
    // Store current edit index
    modal.dataset.editIndex = index;
    
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

/**
 * Close edit modal
 */
function closeEditModalFunc() {
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        delete modal.dataset.editIndex;
    }
}

/**
 * Save edited knowledge
 */
function saveEditKnowledge() {
    const modal = document.getElementById('editModal');
    const index = parseInt(modal.dataset.editIndex);
    
    if (isNaN(index) || !settingsState.knowledgeBase[index]) {
        showNotification('编辑项不存在', 'error');
        return;
    }
    
    const keyword = document.getElementById('editKey').value.trim();
    const question = document.getElementById('editQuestion').value.trim();
    const answer = document.getElementById('editAnswer').value.trim();
    
    if (!keyword || !question || !answer) {
        showNotification('请填写所有字段', 'error');
        return;
    }
    
    settingsState.knowledgeBase[index] = { keyword, question, answer };
    saveSettings();
    renderKnowledgeBase();
    closeEditModalFunc();
    showNotification('知识已更新', 'success');
}

/**
 * Delete knowledge from edit modal
 */
function deleteEditKnowledge() {
    const modal = document.getElementById('editModal');
    const index = parseInt(modal.dataset.editIndex);
    
    if (isNaN(index) || !settingsState.knowledgeBase[index]) {
        showNotification('删除项不存在', 'error');
        return;
    }
    
    if (confirm('确定要删除这条知识吗？')) {
        settingsState.knowledgeBase.splice(index, 1);
        saveSettings();
        renderKnowledgeBase();
        updateSystemInfo();
        closeEditModalFunc();
        showNotification('知识已删除', 'success');
    }
}

/**
 * Delete knowledge item directly
 */
function deleteKnowledgeItem(index) {
    if (confirm('确定要删除这条知识吗？')) {
        settingsState.knowledgeBase.splice(index, 1);
        saveSettings();
        renderKnowledgeBase();
        updateSystemInfo();
        showNotification('知识已删除', 'success');
    }
}

/**
 * Search knowledge base
 */
function searchKnowledgeBase() {
    const searchInput = document.getElementById('kbSearch');
    const query = searchInput.value.trim().toLowerCase();
    const kbList = document.getElementById('kbList');
    
    if (!query) {
        renderKnowledgeBase();
        return;
    }
    
    const filtered = settingsState.knowledgeBase.filter(item => {
        return item.keyword.toLowerCase().includes(query) ||
               item.question.toLowerCase().includes(query) ||
               item.answer.toLowerCase().includes(query);
    });
    
    if (filtered.length === 0) {
        kbList.innerHTML = `
            <div class="text-center py-8 text-slate-500">
                <i class="fas fa-search text-4xl mb-3"></i>
                <p>未找到匹配的知识</p>
            </div>
        `;
        return;
    }
    
    kbList.innerHTML = filtered.map((item, index) => {
        const originalIndex = settingsState.knowledgeBase.indexOf(item);
        return `
        <div class="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition cursor-pointer" data-index="${originalIndex}">
            <div class="flex items-start justify-between">
                <div class="flex-1" onclick="openEditModal(${originalIndex})">
                    <div class="flex items-center space-x-2 mb-2">
                        <span class="px-2 py-1 bg-secondary text-white text-xs rounded">${escapeHtml(item.keyword)}</span>
                    </div>
                    <div class="text-sm font-medium text-slate-800 mb-1">${escapeHtml(item.question)}</div>
                    <div class="text-sm text-slate-600 line-clamp-2">${escapeHtml(item.answer)}</div>
                </div>
                <button class="ml-2 text-slate-400 hover:text-danger transition" onclick="deleteKnowledgeItem(${originalIndex})" title="删除">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `}).join('');
}

/**
 * Export knowledge base to file
 */
function exportKnowledgeBase() {
    if (settingsState.knowledgeBase.length === 0) {
        showNotification('知识库为空，无法导出', 'error');
        return;
    }

    const exportData = {
        exportDate: new Date().toISOString(),
        totalItems: settingsState.knowledgeBase.length,
        knowledgeBase: settingsState.knowledgeBase
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knowledge-base-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('知识库已导出', 'success');
}

/**
 * Update system info display
 */
function updateSystemInfo() {
    const kbCount = document.getElementById('kbCount');
    const apiStatus = document.getElementById('apiStatus');
    
    if (kbCount) {
        kbCount.textContent = settingsState.knowledgeBase.length;
    }
    
    if (apiStatus) {
        if (settingsState.apiConfig.zhipuApiKey) {
            apiStatus.textContent = '已配置';
            apiStatus.classList.remove('text-slate-400');
            apiStatus.classList.add('text-green-600');
        } else {
            apiStatus.textContent = '未配置';
            apiStatus.classList.remove('text-green-600');
            apiStatus.classList.add('text-slate-400');
        }
    }
}

/**
 * Load settings from localStorage
 */
function loadSettings() {
    try {
        const savedSettings = localStorage.getItem('chatbotSettings');
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            settingsState.apiConfig = { ...settingsState.apiConfig, ...parsed.apiConfig };
            settingsState.knowledgeBase = parsed.knowledgeBase || [];
        }
        loadApiConfigIntoForm();
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

/**
 * Save settings to localStorage
 */
function saveSettings() {
    try {
        localStorage.setItem('chatbotSettings', JSON.stringify(settingsState));
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

/**
 * Get API configuration
 */
function getApiConfig() {
    return settingsState.apiConfig;
}

/**
 * Get knowledge base
 */
function getKnowledgeBase() {
    return settingsState.knowledgeBase;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    // Create notification container if not exists
    let container = document.getElementById('notificationContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = 'fixed top-4 right-4 z-50 space-y-2';
        document.body.appendChild(container);
    }

    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    notification.className = `${bgColor} text-white px-4 py-2 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
    notification.innerHTML = `
        <div class="flex items-center space-x-2">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${escapeHtml(message)}</span>
        </div>
    `;

    container.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 10);

    // Remove after delay
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Export functions for use in other modules
window.settingsPanel = {
    getApiConfig,
    getKnowledgeBase,
    extractKeywordFromQuestion,
    extractNounPhrase,
    openEditModal,
    deleteKnowledgeItem
};
