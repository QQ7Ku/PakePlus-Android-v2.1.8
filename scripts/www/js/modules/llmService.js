/**
 * 大模型服务模块
 * 支持智谱AI等大模型API调用
 */

export class LLMService {
    constructor() {
        this.baseUrl = 'https://open.bigmodel.cn/api/paas/v4';
    }

    /**
     * 测试智谱AI连接
     */
    async testZhipuConnection(apiKey, model = 'glm-4') {
        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'user', content: '你好' }
                    ],
                    max_tokens: 10
                })
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    model: data.model || model,
                    message: '连接成功'
                };
            } else {
                const error = await response.json();
                return {
                    success: false,
                    error: error.error?.message || `HTTP ${response.status}`
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 调用智谱AI进行对话
     */
    async chatWithZhipu(apiKey, model, messages, options = {}) {
        const {
            maxTokens = 2048,
            temperature = 0.7,
            topP = 0.7,
            stream = false,
            onStream
        } = options;

        const requestBody = {
            model: model,
            messages: messages,
            max_tokens: maxTokens,
            temperature: temperature,
            top_p: topP,
            stream: stream
        };

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || `HTTP ${response.status}`);
            }

            if (stream && onStream) {
                return this.handleStreamResponse(response, onStream);
            } else {
                const data = await response.json();
                return {
                    success: true,
                    content: data.choices[0]?.message?.content || '',
                    usage: data.usage,
                    model: data.model
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 处理流式响应
     */
    async handleStreamResponse(response, onStream) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices[0]?.delta?.content || '';
                            fullContent += content;
                            
                            if (onStream) {
                                onStream({
                                    content: fullContent,
                                    delta: content,
                                    done: false
                                });
                            }
                        } catch (e) {
                            // 忽略解析错误
                        }
                    }
                }
            }

            if (onStream) {
                onStream({
                    content: fullContent,
                    delta: '',
                    done: true
                });
            }

            return {
                success: true,
                content: fullContent
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 生成二手车估价相关的提示词
     * @param {Object} entities - 实体对象
     * @param {Object} entities.brand - 品牌实体 {value, type, ...}
     * @param {Object} entities.model - 车型实体 {value, type, ...}
     * @param {Object} entities.year - 年份实体
     * @param {Object} entities.mileage - 里程实体
     * @param {Object} entities.location - 地区实体
     * @param {Object} entities.condition - 车况实体
     * @returns {string} 提示词
     */
    generateValuationPrompt(entities) {
        // 提取实体值（实体对象格式为 {value, type, ...}）
        const brandValue = entities.brand?.value || '未提供';
        const modelValue = entities.model?.value || '未提供';
        const yearValue = entities.year?.value;
        const mileageValue = entities.mileage?.displayValue || entities.mileage?.value;
        const locationValue = entities.location?.value;
        const conditionValue = entities.condition?.displayValue || entities.condition?.value;
        
        let prompt = `作为二手车专家，请为以下车辆提供估价建议：\n\n`;
        prompt += `- 品牌：${brandValue}\n`;
        prompt += `- 车型：${modelValue}\n`;
        if (yearValue) prompt += `- 年份：${yearValue}\n`;
        if (mileageValue) prompt += `- 里程：${mileageValue}\n`;
        if (locationValue) prompt += `- 地区：${locationValue}\n`;
        if (conditionValue) prompt += `- 车况：${conditionValue}\n`;
        
        prompt += `\n请提供：\n1. 当前市场估价区间\n2. 影响价格的主要因素\n3. 购买建议\n`;
        
        return prompt;
    }

    /**
     * 生成通用对话提示词
     * @param {string} userMessage - 用户当前消息
     * @param {Object} context - 上下文信息
     * @param {Array} context.history - 历史对话记录 [{role, content}, ...]
     * @returns {Array} messages - 符合智谱AI API格式的消息数组
     */
    generateChatPrompt(userMessage, context = {}) {
        const systemPrompt = `你是二手车AI助手，专门帮助用户解答二手车相关的问题，包括：
1. 车辆估价和市场行情分析
2. 车况检查和鉴别方法
3. 交易流程和手续办理
4. 购车建议和注意事项
5. 相关政策解读

请用专业、友好的语气回答，如果用户问题不明确，主动询问更多信息。`;

        // 构建消息数组：system + 历史对话 + 当前用户消息
        const messages = [
            { role: 'system', content: systemPrompt }
        ];
        
        // 添加历史对话记录（如果存在）
        if (context.history && context.history.length > 0) {
            messages.push(...context.history);
        }
        
        // 添加当前用户消息
        messages.push({ role: 'user', content: userMessage });

        return messages;
    }

    /**
     * 检查API Key格式
     */
    validateApiKey(apiKey) {
        // 智谱AI Key通常以特定前缀开头
        if (!apiKey || apiKey.length < 10) {
            return { valid: false, message: 'API Key格式不正确' };
        }
        return { valid: true };
    }

    /**
     * 获取模型列表
     */
    getAvailableModels() {
        return [
            { id: 'glm-4', name: 'GLM-4', description: '旗舰模型，综合能力最强' },
            { id: 'glm-4-flash', name: 'GLM-4-Flash', description: '极速模型，响应最快' },
            { id: 'glm-4-air', name: 'GLM-4-Air', description: '轻量模型，性价比高' }
        ];
    }
}

export default LLMService;
