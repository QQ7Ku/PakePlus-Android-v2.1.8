/**
 * 智谱AI服务模块
 */

// 常量定义
const CONFIG = {
    MAX_HISTORY_LENGTH: 10,
    MAX_MESSAGE_LENGTH: 2000,
    API_TIMEOUT: 30000, // 30秒超时
    MIN_API_KEY_LENGTH: 20
};

export class ZhipuAIService {
    constructor() {
        this.apiKey = '';
        this.apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
        this.model = 'glm-4-flash';
        this.conversationHistory = [];
        this.maxHistoryLength = CONFIG.MAX_HISTORY_LENGTH;
        this.isProcessing = false;
    }

    setApiKey(key) {
        if (!key || typeof key !== 'string') {
            throw new Error('API Key不能为空');
        }
        const cleanKey = key.trim();
        if (cleanKey.length < CONFIG.MIN_API_KEY_LENGTH) {
            throw new Error('API Key格式不正确');
        }
        this.apiKey = cleanKey;
    }

    hasApiKey() {
        return !!this.apiKey && this.apiKey.length >= CONFIG.MIN_API_KEY_LENGTH;
    }

    validateInput(message) {
        if (!message || typeof message !== 'string') {
            return { valid: false, error: '消息不能为空' };
        }
        const cleanMessage = message.trim();
        if (cleanMessage.length === 0) {
            return { valid: false, error: '消息不能为空' };
        }
        if (cleanMessage.length > CONFIG.MAX_MESSAGE_LENGTH) {
            return { valid: false, error: `消息长度不能超过${CONFIG.MAX_MESSAGE_LENGTH}字符` };
        }
        return { valid: true, message: cleanMessage };
    }

    async sendMessage(userMessage, context = {}) {
        if (this.isProcessing) {
            return { success: false, error: '请等待当前对话完成' };
        }

        const validation = this.validateInput(userMessage);
        if (!validation.valid) {
            return { success: false, error: validation.error };
        }

        if (!this.hasApiKey()) {
            return { success: false, error: 'API Key未设置' };
        }

        this.isProcessing = true;
        
        // 创建AbortController用于超时控制
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);

        try {
            const messages = this.buildMessages(validation.message, context);
            
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    max_tokens: 2048,
                    temperature: 0.7
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            const aiMessage = data.choices?.[0]?.message?.content;

            if (!aiMessage) {
                throw new Error('API返回数据格式错误');
            }

            // 保存到历史（除非跳过）
            if (!context.skipHistory) {
                this.addToHistory('user', validation.message);
                this.addToHistory('assistant', aiMessage);
            }

            return {
                success: true,
                message: aiMessage,
                usage: data.usage,
                model: data.model
            };

        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                return {
                    success: false,
                    error: '请求超时，请稍后重试',
                    message: '请求超时，请稍后重试'
                };
            }
            
            return {
                success: false,
                error: error.message,
                message: this.getErrorMessage(error.message)
            };
        } finally {
            this.isProcessing = false;
        }
    }

    buildMessages(userMessage, context) {
        const messages = [{
            role: 'system',
            content: '你是一位专业的二手车顾问，擅长车辆估价、车况评估、交易流程咨询。回答要专业、简洁、实用。'
        }];

        if (context.country) {
            messages.push({
                role: 'system',
                content: `当前国家：${context.country}`
            });
        }

        // 添加历史对话
        if (!context.skipHistory) {
            messages.push(...this.conversationHistory.slice(-CONFIG.MAX_HISTORY_LENGTH));
        }

        messages.push({ role: 'user', content: userMessage });
        return messages;
    }

    addToHistory(role, content) {
        this.conversationHistory.push({ role, content });
        // 保持历史记录在合理范围内
        const maxRecords = this.maxHistoryLength * 2;
        if (this.conversationHistory.length > maxRecords) {
            this.conversationHistory = this.conversationHistory.slice(-maxRecords);
        }
    }

    getErrorMessage(errorMsg) {
        if (!errorMsg) return '服务暂时不可用';
        if (errorMsg.includes('401')) return 'API Key无效，请检查设置';
        if (errorMsg.includes('429')) return '请求过于频繁，请稍后再试';
        if (errorMsg.includes('500')) return '服务暂时不可用，请稍后再试';
        if (errorMsg.includes('503')) return '服务繁忙，请稍后再试';
        if (errorMsg.includes('timeout') || errorMsg.includes('超时')) return '请求超时，请检查网络连接';
        return '服务暂时不可用，请稍后再试';
    }

    clearHistory() {
        this.conversationHistory = [];
    }
}

export default ZhipuAIService;
