/**
 * 二手车AI智能客服系统 - 主入口
 */

import { ChatEngine } from './modules/chatEngine.js?v=2';
import { SCENE_EXAMPLES, CONFIG } from './config/constants.js?v=2';

// 调试开关 - 生产环境设置为 false
const DEBUG = false;

/**
 * 日志输出工具
 * @param {...any} args - 日志参数
 */
function log(...args) {
    if (DEBUG) console.log(...args);
}

/**
 * 错误日志输出
 * @param {...any} args - 错误参数
 */
function logError(...args) {
    if (DEBUG) console.error(...args);
}

// 全局状态
const state = {
    mode: 'local', // 'local' 或 'cloud'
    messages: [],
    isProcessing: false,
    currentThinkingSteps: []
};

// 初始化聊天引擎
const chatEngine = new ChatEngine({
    mode: state.mode,
    onThinkingUpdate: updateThinkingPanel,
    onResponse: handleResponse
});

// DOM元素引用
let chatMessages, messageInput, sendBtn, thinkingSteps, 
    localModeBtn, cloudModeBtn, sceneBtns, clearChatBtn,
    responseTimeEl, confidenceEl, stepCountEl,
    showTechBtn, showWorkflowBtn, techPanel, workflowPanel;

/**
 * 初始化应用
 */
function init() {
    // 获取DOM元素
    chatMessages = document.getElementById('chatMessages');
    messageInput = document.getElementById('messageInput');
    sendBtn = document.getElementById('sendBtn');
    thinkingSteps = document.getElementById('thinkingSteps');
    localModeBtn = document.getElementById('localModeBtn');
    cloudModeBtn = document.getElementById('cloudModeBtn');
    sceneBtns = document.querySelectorAll('.scene-btn');
    clearChatBtn = document.getElementById('clearChat');
    responseTimeEl = document.getElementById('responseTime');
    confidenceEl = document.getElementById('confidence');
    stepCountEl = document.getElementById('stepCount');
    showTechBtn = document.getElementById('showTechBtn');
    showWorkflowBtn = document.getElementById('showWorkflowBtn');
    techPanel = document.getElementById('techPanel');
    workflowPanel = document.getElementById('workflowPanel');
    
    // 绑定事件
    bindEvents();
    
    // 初始化工作流面板
    initWorkflowPanel();
    
    log('[AI Chatbot] 初始化完成');
}

/**
 * 绑定事件
 */
function bindEvents() {
    // 发送消息
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    // 模式切换
    localModeBtn.addEventListener('click', () => switchMode('local'));
    cloudModeBtn.addEventListener('click', () => switchMode('cloud'));
    
    // 场景选择
    sceneBtns.forEach(btn => {
        btn.addEventListener('click', () => selectScene(btn.dataset.scene));
    });
    
    // 清空对话
    clearChatBtn.addEventListener('click', clearChat);
    
    // 面板切换
    showTechBtn.addEventListener('click', () => switchPanel('tech'));
    showWorkflowBtn.addEventListener('click', () => switchPanel('workflow'));
}

/**
 * 发送消息
 */
async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || state.isProcessing) return;
    
    // 检查是否是设置命令
    if (text === '设置' || text === 'setting' || text === 'settings') {
        messageInput.value = '';
        window.location.href = 'settings.html';
        return;
    }
    
    // 添加用户消息
    addMessage(text, 'user');
    messageInput.value = '';
    
    // 显示思考中状态
    state.isProcessing = true;
    showThinkingStatus('思考中...');
    
    // 清空思考步骤
    clearThinkingSteps();
    
    try {
        // 处理消息
        const result = await chatEngine.processMessage(text);
        
        // 添加AI回复
        addMessage(result.text, 'ai');
        
        // 更新性能指标
        updateMetrics(result);
        
        // 更新技术面板代码
        updateTechPanel(result);
        
        // 高亮工作流
        highlightWorkflow(result.thinkingSteps);
        
    } catch (error) {
        logError('[ChatEngine] 处理消息失败:', error);
        addMessage('抱歉，处理您的消息时出错了，请稍后再试。', 'ai');
    } finally {
        state.isProcessing = false;
        showThinkingStatus('等待输入');
    }
}

/**
 * 添加消息到对话区域
 */
function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex items-start space-x-3 message-enter';
    
    if (type === 'user') {
        messageDiv.innerHTML = `
            <div class="flex-1 flex justify-end">
                <div class="message-bubble user">
                    <p class="text-sm">${escapeHtml(text)}</p>
                </div>
            </div>
            <div class="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                <i class="fas fa-user text-slate-600 text-sm"></i>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                <i class="fas fa-robot text-white text-sm"></i>
            </div>
            <div class="message-bubble ai">
                <p class="text-sm whitespace-pre-line">${escapeHtml(text)}</p>
            </div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // 保存到历史
    state.messages.push({ text, type, time: Date.now() });
}

/**
 * 更新思考面板
 */
function updateThinkingPanel(steps) {
    state.currentThinkingSteps = steps;
    
    if (steps.length === 0) return;
    
    // 清空容器（保留第一个提示）
    if (steps.length === 1) {
        thinkingSteps.innerHTML = '';
    }
    
    // 渲染最新的步骤
    const step = steps[steps.length - 1];
    const stepHtml = createThinkingStepHtml(step, steps.length);
    
    // 如果是新步骤，添加动画
    thinkingSteps.insertAdjacentHTML('beforeend', stepHtml);
    
    // 滚动到底部
    thinkingSteps.scrollTop = thinkingSteps.scrollHeight;
}

/**
 * 创建思考步骤HTML
 */
function createThinkingStepHtml(step, index) {
    const confidenceBar = step.confidence ? `
        <div class="confidence-bar">
            <div class="confidence-bar-fill ${step.confidence >= 0.8 ? 'high' : step.confidence >= 0.5 ? 'medium' : 'low'}" 
                 style="width: ${step.confidence * 100}%"></div>
        </div>
    ` : '';
    
    return `
        <div class="thinking-card ${step.step} thinking-step" style="animation-delay: ${index * 0.1}s">
            <div class="thinking-card-header">
                <div class="thinking-card-title">
                    <i class="fas ${step.icon}"></i>
                    ${step.title}
                </div>
                <span class="thinking-card-time">${step.latency || 0}ms</span>
            </div>
            <div class="thinking-card-content">
                ${step.content}
            </div>
            ${confidenceBar}
            <div class="thinking-card-detail">
                ${step.detail.replace(/\n/g, '<br>')}
            </div>
        </div>
    `;
}

/**
 * 清空思考步骤
 */
function clearThinkingSteps() {
    thinkingSteps.innerHTML = `
        <div class="text-center text-slate-400 py-8">
            <i class="fas fa-lightbulb text-4xl mb-3 animate-pulse"></i>
            <p class="text-sm">正在分析您的消息...</p>
        </div>
    `;
}

/**
 * 更新性能指标
 */
function updateMetrics(result) {
    responseTimeEl.textContent = `${result.latency}ms`;
    confidenceEl.textContent = `${(result.confidence * 100).toFixed(0)}%`;
    stepCountEl.textContent = result.thinkingSteps.length;
}

/**
 * 更新技术面板
 */
function updateTechPanel(result) {
    // 更新意图识别代码
    const intentCode = document.getElementById('intentCode');
    if (intentCode) {
        intentCode.textContent = `// 意图识别结果
const result = {
  intent: "${result.intent}",
  confidence: ${result.confidence.toFixed(3)},
  latency: ${result.latency}ms
};

// 分类逻辑
if (confidence > 0.8) {
  return directResponse(result);
} else if (confidence > 0.5) {
  return confirmIntent(result);
} else {
  return askClarification();
}`;
    }
    
    // 更新实体提取代码
    const entityCode = document.getElementById('entityCode');
    if (entityCode && result.entities) {
        const entityStr = JSON.stringify(result.entities, null, 2);
        entityCode.textContent = `// 提取的实体
const entities = ${entityStr};

// 完整性检查
const required = ['brand', 'model'];
const missing = required.filter(e => !entities[e]);

if (missing.length > 0) {
  return askForMissingInfo(missing);
}`;
    }
    
    // 更新知识检索代码
    const knowledgeCode = document.getElementById('knowledgeCode');
    if (knowledgeCode) {
        const knowledgeStep = result.thinkingSteps.find(s => s.step === 'knowledge');
        if (knowledgeStep) {
            knowledgeCode.textContent = `// 知识检索结果
const searchResult = {
  query: "${result.text || ''}",
  results: ${knowledgeStep.content.includes('找到') ? '1' : '0'},
  latency: ${knowledgeStep.latency || 0}ms
};

// 向量相似度匹配
const similarity = ${knowledgeStep.content.includes('相似度') ? 
    knowledgeStep.content.match(/相似度[:\s]+(\d+\.?\d*)%/)?.[1] || '0' : '0'};

if (similarity > 0.8) {
  return knowledgeResult.bestMatch;
} else if (similarity > 0.5) {
  return knowledgeResult.topResults;
} else {
  return fallbackResponse();
}`;
        }
    }
    
    // 更新响应生成代码
    const responseCode = document.getElementById('responseCode');
    if (responseCode) {
        const responseStep = result.thinkingSteps.find(s => s.step === 'response');
        if (responseStep) {
            // 根据模式显示不同的代码
            if (state.mode === 'cloud') {
                responseCode.textContent = `// 大模型API调用
const request = {
  model: "${result.model || 'glm-4'}",
  messages: [
    { role: 'system', content: '你是二手车AI助手...' },
    { role: 'user', content: userMessage }
  ],
  temperature: 0.7,
  max_tokens: 2048
};

// 调用智谱AI API
const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${'*'.repeat(8)}...'
  },
  body: JSON.stringify(request)
});

// 解析响应
const result = await response.json();
return {
  text: result.choices[0].message.content,
  model: result.model,
  usage: result.usage
};`;
            } else {
                responseCode.textContent = `// 响应生成
const response = {
  type: "${result.intent}",
  length: ${responseStep.detail?.match(/\d+/)?.[0] || '0'},
  latency: ${responseStep.latency || 0}ms
};

// 模板选择
const template = selectTemplate(intent);

// 内容填充
const content = fillTemplate(template, entities);

return {
  text: content,
  confidence: ${result.confidence.toFixed(3)}
};`;
            }
        }
    }
}

/**
 * 切换模式
 */
function switchMode(mode) {
    state.mode = mode;
    chatEngine.setMode(mode);
    
    if (mode === 'local') {
        localModeBtn.classList.add('bg-accent', 'text-white');
        localModeBtn.classList.remove('text-slate-400');
        cloudModeBtn.classList.remove('bg-secondary', 'text-white');
        cloudModeBtn.classList.add('text-slate-400');
    } else {
        cloudModeBtn.classList.add('bg-secondary', 'text-white');
        cloudModeBtn.classList.remove('text-slate-400');
        localModeBtn.classList.remove('bg-accent', 'text-white');
        localModeBtn.classList.add('text-slate-400');
    }
    
    // 添加系统消息
    addMessage(`已切换到${mode === 'local' ? '本地' : '云端'}模式`, 'system');
}

/**
 * 选择场景
 */
function selectScene(scene) {
    // 更新按钮状态
    sceneBtns.forEach(btn => {
        if (btn.dataset.scene === scene) {
            btn.classList.add('bg-blue-100', 'text-blue-700');
            btn.classList.remove('bg-slate-100', 'text-slate-600');
        } else {
            btn.classList.remove('bg-blue-100', 'text-blue-700');
            btn.classList.add('bg-slate-100', 'text-slate-600');
        }
    });
    
    // 获取示例问题
    const examples = SCENE_EXAMPLES[scene]?.examples;
    if (examples && examples.length > 0) {
        // 随机选择一个示例
        const example = examples[Math.floor(Math.random() * examples.length)];
        messageInput.value = example;
        messageInput.focus();
    }
}

/**
 * 清空对话
 */
function clearChat() {
    if (confirm('确定要清空对话历史吗？')) {
        chatMessages.innerHTML = `
            <div class="flex items-start space-x-3">
                <div class="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-robot text-white text-sm"></i>
                </div>
                <div class="bg-blue-50 rounded-lg p-3 max-w-[85%]">
                    <p class="text-sm text-slate-700">对话已清空。我是您的二手车AI助手，请问有什么可以帮您？</p>
                </div>
            </div>
        `;
        state.messages = [];
        chatEngine.clearState();
        clearThinkingSteps();
    }
}

/**
 * 显示思考状态
 */
function showThinkingStatus(status) {
    const statusEl = document.getElementById('thinkingStatus');
    if (statusEl) {
        statusEl.textContent = status;
        statusEl.className = status === '思考中...' 
            ? 'px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded animate-pulse'
            : 'px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded';
    }
}

/**
 * 切换面板
 */
function switchPanel(panel) {
    if (panel === 'tech') {
        techPanel.classList.remove('hidden');
        workflowPanel.classList.add('hidden');
        showTechBtn.classList.add('bg-secondary', 'text-white');
        showTechBtn.classList.remove('text-slate-600');
        showWorkflowBtn.classList.remove('bg-secondary', 'text-white');
        showWorkflowBtn.classList.add('text-slate-600');
    } else {
        techPanel.classList.add('hidden');
        workflowPanel.classList.remove('hidden');
        showWorkflowBtn.classList.add('bg-secondary', 'text-white');
        showWorkflowBtn.classList.remove('text-slate-600');
        showTechBtn.classList.remove('bg-secondary', 'text-white');
        showTechBtn.classList.add('text-slate-600');
    }
}

/**
 * 初始化工作流面板
 */
function initWorkflowPanel() {
    const workflowSteps = [
        { id: 'input', title: '用户输入', desc: '接收并预处理用户消息', icon: 'fa-keyboard' },
        { id: 'intent', title: '意图识别', desc: '分析用户意图类型', icon: 'fa-bullseye' },
        { id: 'entity', title: '实体提取', desc: '提取关键信息实体', icon: 'fa-search' },
        { id: 'knowledge', title: '知识检索', desc: '查询相关知识库', icon: 'fa-database' },
        { id: 'reasoning', title: '推理决策', desc: '逻辑推理和决策', icon: 'fa-brain' },
        { id: 'response', title: '响应生成', desc: '生成自然语言回复', icon: 'fa-comment-dots' }
    ];
    
    const html = workflowSteps.map((step, index) => `
        <div class="workflow-step" data-step="${step.id}">
            <div class="workflow-step-icon pending">
                <i class="fas ${step.icon}"></i>
            </div>
            <div class="workflow-step-content">
                <div class="workflow-step-title">${index + 1}. ${step.title}</div>
                <div class="workflow-step-desc">${step.desc}</div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('workflowDiagram').innerHTML = html;
}

/**
 * 高亮工作流
 */
function highlightWorkflow(steps) {
    // 重置所有步骤
    document.querySelectorAll('.workflow-step').forEach(el => {
        const icon = el.querySelector('.workflow-step-icon');
        icon.className = 'workflow-step-icon pending';
    });
    
    // 高亮已完成的步骤
    steps.forEach((step, index) => {
        const stepEl = document.querySelector(`.workflow-step[data-step="${step.step}"]`);
        if (stepEl) {
            const icon = stepEl.querySelector('.workflow-step-icon');
            icon.className = index === steps.length - 1 
                ? 'workflow-step-icon processing'
                : 'workflow-step-icon completed';
        }
    });
}

/**
 * 处理响应
 */
function handleResponse(response) {
    log('[ChatEngine] 响应:', response);
}

/**
 * HTML转义
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 初始化
document.addEventListener('DOMContentLoaded', init);
