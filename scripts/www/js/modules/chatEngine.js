/**
 * 对话引擎模块
 * 协调意图识别、实体提取、知识检索等模块，生成回复
 */

import { IntentRecognizer } from './intentRecognizer.js?v=2';
import { EntityExtractor } from './entityExtractor.js?v=2';
import { KnowledgeBase } from './knowledgeBase.js?v=2';
import { LLMService } from './llmService.js?v=2';
import { SettingsManager } from './settingsManager.js?v=2';
import { INTENTS, RESPONSE_TEMPLATES, CONFIG } from '../config/constants.js?v=2';

// 估价计算常量
const VALUATION_CONSTANTS = {
    DEPRECIATION_RATE_PER_YEAR: 0.08,  // 每年折旧率
    MAX_DEPRECIATION: 0.5,              // 最大折旧率
    MILEAGE_FACTOR_DENOMINATOR: 200000, // 里程因子分母
    MIN_MILEAGE_FACTOR: 0.7,            // 最小里程因子
    PRICE_VARIANCE: 0.1                 // 价格波动范围
};

export class ChatEngine {
    constructor(options = {}) {
        this.mode = options.mode || 'local'; // 'local' 或 'cloud'
        this.onThinkingUpdate = options.onThinkingUpdate || (() => {});
        this.onResponse = options.onResponse || (() => {});
        
        // 初始化各模块
        this.intentRecognizer = new IntentRecognizer();
        this.entityExtractor = new EntityExtractor();
        this.knowledgeBase = new KnowledgeBase();
        this.llmService = new LLMService();
        this.settingsManager = new SettingsManager();
        
        // 对话状态
        this.conversationState = {
            currentIntent: null,
            missingEntities: [],
            context: {},
            history: []
        };
    }

    /**
     * 处理用户消息
     * @param {string} message - 用户输入
     */
    async processMessage(message) {
        const startTime = performance.now();
        const thinkingSteps = [];
        
        // 步骤1: 意图识别
        const intentResult = this.intentRecognizer.recognize(message);
        thinkingSteps.push({
            step: 'intent',
            title: '意图识别',
            icon: 'fa-bullseye',
            content: `识别到意图: ${intentResult.intent}`,
            detail: this._formatIntentDetail(intentResult),
            latency: intentResult.latency,
            confidence: intentResult.confidence
        });
        
        this.onThinkingUpdate(thinkingSteps);
        await this._delay(CONFIG.THINKING_STEP_DELAY);
        
        // 步骤2: 实体提取（结合历史上下文）
        const entityResult = this._extractEntitiesWithContext(message);
        thinkingSteps.push({
            step: 'entity',
            title: '实体提取',
            icon: 'fa-search',
            content: `提取到 ${entityResult.entityCount} 个实体`,
            detail: this._formatEntityDetail(entityResult),
            latency: entityResult.latency
        });
        
        this.onThinkingUpdate(thinkingSteps);
        await this._delay(CONFIG.THINKING_STEP_DELAY);
        
        // 步骤3: 知识检索
        let knowledgeResult = null;
        if (intentResult.intent === INTENTS.QUERY || intentResult.intent === INTENTS.PROCESS) {
            knowledgeResult = this.knowledgeBase.search(message, 1);
            // 始终显示知识检索步骤，无论是否找到结果
            thinkingSteps.push({
                step: 'knowledge',
                title: '知识检索',
                icon: 'fa-database',
                content: knowledgeResult.resultCount > 0 
                    ? `找到 ${knowledgeResult.resultCount} 条相关知识` 
                    : '未找到匹配知识',
                detail: this._formatKnowledgeDetail(knowledgeResult),
                latency: knowledgeResult.latency
            });
            
            this.onThinkingUpdate(thinkingSteps);
            await this._delay(CONFIG.THINKING_STEP_DELAY);
        }
        
        // 步骤4: 推理决策
        const reasoningResult = this._reasoning(
            intentResult,
            entityResult,
            knowledgeResult
        );
        thinkingSteps.push({
            step: 'reasoning',
            title: '推理决策',
            icon: 'fa-brain',
            content: reasoningResult.summary,
            detail: reasoningResult.detail
        });
        
        this.onThinkingUpdate(thinkingSteps);
        await this._delay(CONFIG.THINKING_STEP_DELAY);
        
        // 步骤5: 生成回复
        const responseStartTime = performance.now();
        const response = await this._generateResponse(
            intentResult,
            entityResult,
            knowledgeResult,
            reasoningResult,
            message
        );
        const responseLatency = Math.round(performance.now() - responseStartTime);
        
        // 云端模式显示不同的内容
        const isCloud = this.mode === 'cloud';
        thinkingSteps.push({
            step: 'response',
            title: isCloud ? '大模型生成' : '响应生成',
            icon: isCloud ? 'fa-cloud' : 'fa-comment-dots',
            content: isCloud 
                ? (response.model ? `智谱AI ${response.model}` : '生成回复内容')
                : '生成回复内容',
            detail: isCloud && response.usage
                ? `回复长度: ${response.text.length} 字符\nToken消耗: 输入${response.usage.prompt_tokens} / 输出${response.usage.completion_tokens}`
                : `回复长度: ${response.text.length} 字符`,
            latency: responseLatency
        });
        
        this.onThinkingUpdate(thinkingSteps);
        
        // 计算总耗时
        const totalLatency = performance.now() - startTime;
        
        // 更新对话状态（包含历史记录）
        this._updateState(intentResult, entityResult, message, response.text);
        
        return {
            text: response.text,
            type: response.type,
            thinkingSteps: thinkingSteps,
            latency: Math.round(totalLatency),
            intent: intentResult.intent,
            entities: entityResult.entities,
            confidence: intentResult.confidence
        };
    }

    /**
     * 推理决策
     */
    _reasoning(intentResult, entityResult, knowledgeResult) {
        const intent = intentResult.intent;
        const entities = entityResult.entities;
        const confidence = intentResult.confidence;
        
        let summary = '';
        let detail = [];
        
        // 根据意图和实体完整性做决策
        switch (intent) {
            case INTENTS.VALUATION:
                const hasBrand = entities.brand;
                const hasModel = entities.model;
                
                if (hasBrand && hasModel) {
                    summary = '信息完整，可直接估价';
                    detail.push('✓ 已识别品牌和车型');
                    detail.push(`✓ 置信度: ${(confidence * 100).toFixed(1)}%`);
                    
                    if (!entities.year) {
                        detail.push('⚠ 缺少年份信息，使用默认值');
                    }
                    if (!entities.mileage) {
                        detail.push('⚠ 缺少里程信息，使用默认值');
                    }
                } else if (hasBrand) {
                    summary = '需要补充车型信息';
                    detail.push('✓ 已识别品牌: ' + entities.brand.value);
                    detail.push('✗ 缺少车型信息');
                    detail.push('→ 将询问具体车型');
                } else {
                    summary = '信息不足，需要引导';
                    detail.push('✗ 未识别到品牌');
                    detail.push('✗ 未识别到车型');
                    detail.push('→ 将引导用户提供车辆信息');
                }
                break;
                
            case INTENTS.QUERY:
            case INTENTS.PROCESS:
                if (knowledgeResult && knowledgeResult.resultCount > 0) {
                    const bestMatch = knowledgeResult.results[0];
                    summary = '知识库匹配成功';
                    detail.push(`✓ 匹配问题: ${bestMatch.question}`);
                    detail.push(`✓ 相似度: ${(bestMatch.similarity * 100).toFixed(1)}%`);
                } else {
                    summary = '知识库未匹配，使用通用回复';
                    detail.push('✗ 未找到匹配知识');
                    detail.push('→ 将提供通用建议');
                }
                break;
                
            case INTENTS.GREETING:
            case INTENTS.GOODBYE:
                summary = '使用预设回复模板';
                detail.push(`✓ 意图明确: ${intent}`);
                detail.push('→ 从模板库随机选择回复');
                break;
                
            default:
                summary = '意图不明确，使用兜底策略';
                detail.push(`✗ 意图: ${intent}`);
                detail.push(`✗ 置信度: ${(confidence * 100).toFixed(1)}%`);
                detail.push('→ 提供引导性回复');
        }
        
        return { summary, detail: detail.join('\n') };
    }

    /**
     * 生成回复
     */
    async _generateResponse(intentResult, entityResult, knowledgeResult, reasoningResult, message) {
        const intent = intentResult.intent;
        const entities = entityResult.entities;
        
        // 云端模式：调用大模型API
        if (this.mode === 'cloud') {
            return await this._generateCloudResponse(message, intentResult, entityResult, knowledgeResult);
        }
        
        // 本地模式：使用知识库和模板
        switch (intent) {
            case INTENTS.GREETING:
                return {
                    text: this._getRandomResponse(RESPONSE_TEMPLATES[INTENTS.GREETING]),
                    type: 'greeting'
                };
                
            case INTENTS.GOODBYE:
                return {
                    text: this._getRandomResponse(RESPONSE_TEMPLATES[INTENTS.GOODBYE]),
                    type: 'goodbye'
                };
                
            case INTENTS.VALUATION:
                return this._generateValuationResponse(entities);
                
            case INTENTS.QUERY:
            case INTENTS.PROCESS:
                if (knowledgeResult && knowledgeResult.results.length > 0) {
                    return {
                        text: knowledgeResult.results[0].answer,
                        type: 'knowledge'
                    };
                }
                return {
                    text: this._getRandomResponse(RESPONSE_TEMPLATES[INTENTS.UNKNOWN]),
                    type: 'unknown'
                };
                
            default:
                return {
                    text: this._getRandomResponse(RESPONSE_TEMPLATES[INTENTS.UNKNOWN]),
                    type: 'unknown'
                };
        }
    }
    
    /**
     * 云端模式：调用大模型生成回复
     */
    async _generateCloudResponse(message, intentResult, entityResult, knowledgeResult) {
        // 获取API配置
        const settings = this.settingsManager.getSettings();
        const apiKey = settings.zhipuApiKey;
        const model = settings.zhipuModel || 'glm-4';
        
        if (!apiKey) {
            return {
                text: '[提示] 云端模式需要配置API Key。请在设置页面配置智谱AI的API Key，或切换到本地模式使用。',
                type: 'error'
            };
        }
        
        // 构建上下文信息
        const context = {
            intent: intentResult.intent,
            entities: entityResult.entities,
            knowledge: knowledgeResult && knowledgeResult.results.length > 0 
                ? knowledgeResult.results[0] 
                : null,
            // 传递历史对话记录用于多轮对话
            history: this.conversationState.history
        };
        
        // 构建提示词
        let prompt = message;
        
        // 如果有相关知识，增强提示词
        if (context.knowledge) {
            prompt = `基于以下知识回答问题：\n\n知识：${context.knowledge.question}\n${context.knowledge.answer}\n\n用户问题：${message}\n\n请根据上述知识回答用户问题，如果知识不足以回答，请补充你的专业知识。`;
        }
        
        // 如果是估价意图，使用专门的提示词
        if (intentResult.intent === INTENTS.VALUATION && entityResult.entities) {
            prompt = this.llmService.generateValuationPrompt(entityResult.entities);
        }
        
        // 调用大模型
        const messages = this.llmService.generateChatPrompt(prompt, context);
        
        const result = await this.llmService.chatWithZhipu(apiKey, model, messages, {
            maxTokens: 2048,
            temperature: 0.7
        });
        
        if (result.success) {
            return {
                text: result.content,
                type: 'cloud',
                model: result.model,
                usage: result.usage
            };
        } else {
            return {
                text: `[错误] 大模型调用失败：${result.error}。已切换到本地模式回复。\n\n${this._generateLocalFallback(intentResult, entityResult, knowledgeResult)}`,
                type: 'error'
            };
        }
    }
    
    /**
     * 生成本地模式兜底回复
     */
    _generateLocalFallback(intentResult, entityResult, knowledgeResult) {
        const intent = intentResult.intent;
        
        if (intent === INTENTS.QUERY || intent === INTENTS.PROCESS) {
            if (knowledgeResult && knowledgeResult.results.length > 0) {
                return knowledgeResult.results[0].answer;
            }
        }
        
        return this._getRandomResponse(RESPONSE_TEMPLATES[INTENTS.UNKNOWN]);
    }

    /**
     * 生成估价回复
     */
    _generateValuationResponse(entities) {
        const brand = entities.brand?.value;
        const model = entities.model?.value;
        const year = entities.year?.value;
        const mileage = entities.mileage?.value;
        
        // 模拟估价计算
        if (brand && model) {
            // 基础价格（模拟数据）
            const basePrices = {
                '特斯拉': { 'Model 3': 250000, 'Model Y': 300000 },
                '比亚迪': { '汉': 220000, '唐': 250000, '海豹': 200000 },
                '宝马': { '3系': 350000, '5系': 500000 },
                '奔驰': { 'C级': 380000, 'E级': 550000 }
            };
            
            const basePrice = basePrices[brand]?.[model] || 200000;
            
            // 计算折旧
            const currentYear = new Date().getFullYear();
            const carYear = year || currentYear;
            const age = currentYear - carYear;
            const depreciation = Math.min(
                age * VALUATION_CONSTANTS.DEPRECIATION_RATE_PER_YEAR,
                VALUATION_CONSTANTS.MAX_DEPRECIATION
            );
            
            // 里程因子
            const carMileage = mileage || 50000;
            const mileageFactor = Math.max(
                VALUATION_CONSTANTS.MIN_MILEAGE_FACTOR,
                1 - (carMileage / VALUATION_CONSTANTS.MILEAGE_FACTOR_DENOMINATOR)
            );
            
            // 计算估价区间
            const minPrice = Math.round(basePrice * (1 - depreciation) * mileageFactor * (1 - VALUATION_CONSTANTS.PRICE_VARIANCE));
            const maxPrice = Math.round(basePrice * (1 - depreciation) * mileageFactor * (1 + VALUATION_CONSTANTS.PRICE_VARIANCE));
            
            let response = `根据市场行情，${brand} ${model}`;
            if (year) response += ` (${year}年)`;
            response += ` 的二手价格区间约为：**${(minPrice/10000).toFixed(1)}万 - ${(maxPrice/10000).toFixed(1)}万元**\n\n`;
            
            response += `[估价详情]\n`;
            response += `- 新车指导价: ${(basePrice/10000).toFixed(1)}万元\n`;
            response += `- 车龄折旧: ${(depreciation*100).toFixed(0)}%\n`;
            if (mileage) {
                response += `- 里程因子: ${(mileageFactor*100).toFixed(0)}%\n`;
            }
            response += `\n[温馨提示]\n`;
            response += `实际成交价受车况、地区、季节等因素影响，建议实地看车后议价。`;
            
            return {
                text: response,
                type: 'valuation',
                data: { minPrice, maxPrice, basePrice }
            };
        }
        
        // 信息不完整
        if (brand) {
            return {
                text: `您想了解${brand}的哪款车型呢？${brand}旗下有：${this.knowledgeBase.getCarInfo(brand).models?.join('、')}等。请告诉我具体车型，我帮您估价。`,
                type: 'incomplete'
            };
        }
        
        return {
            text: '请问您想评估什么品牌和型号的车辆？例如："特斯拉Model 3"、"宝马3系"等。',
            type: 'incomplete'
        };
    }

    /**
     * 格式化意图识别详情
     */
    _formatIntentDetail(result) {
        const lines = [
            `意图: ${result.intent}`,
            `置信度: ${(result.confidence * 100).toFixed(1)}%`,
            `处理时间: ${result.latency}ms`
        ];
        
        if (result.matchedKeywords.length > 0) {
            lines.push(`匹配关键词: ${result.matchedKeywords.map(k => k.keyword).join(', ')}`);
        }
        
        return lines.join('\n');
    }

    /**
     * 格式化实体提取详情
     */
    _formatEntityDetail(result) {
        if (result.entityCount === 0) {
            return '未提取到实体';
        }
        
        return Object.entries(result.entities)
            .map(([type, data]) => {
                const value = data.displayValue || data.value;
                return `- ${type}: ${value}`;
            })
            .join('\n');
    }

    /**
     * 格式化知识检索详情
     */
    _formatKnowledgeDetail(result) {
        if (result.resultCount === 0) {
            return '未找到匹配知识';
        }
        
        return result.results
            .map((r, i) => `${i + 1}. ${r.question} (相似度: ${(r.similarity * 100).toFixed(1)}%)`)
            .join('\n');
    }

    /**
     * 获取随机回复
     */
    _getRandomResponse(templates) {
        if (!templates || templates.length === 0) {
            return '抱歉，我暂时无法回答这个问题。';
        }
        return templates[Math.floor(Math.random() * templates.length)];
    }

    /**
     * 更新对话状态
     * @param {Object} intentResult - 意图识别结果
     * @param {Object} entityResult - 实体提取结果
     * @param {string} userMessage - 用户消息
     * @param {string} aiResponse - AI回复
     */
    _updateState(intentResult, entityResult, userMessage, aiResponse) {
        this.conversationState.currentIntent = intentResult.intent;
        this.conversationState.context = {
            ...this.conversationState.context,
            ...entityResult.entities
        };
        
        // 保存对话历史（最多保留10轮）
        if (userMessage && aiResponse) {
            this.conversationState.history.push(
                { role: 'user', content: userMessage },
                { role: 'assistant', content: aiResponse }
            );
            
            // 限制历史记录长度，保留最近10轮（20条消息）
            const maxHistory = 20;
            if (this.conversationState.history.length > maxHistory) {
                this.conversationState.history = this.conversationState.history.slice(-maxHistory);
            }
        }
    }

    /**
     * 提取实体（结合历史上下文）
     * @param {string} message - 用户消息
     * @returns {Object} 实体提取结果
     */
    _extractEntitiesWithContext(message) {
        // 先提取当前消息中的实体
        const entityResult = this.entityExtractor.extract(message);
        
        // 如果当前没有提取到品牌，但历史上下文中有，则继承品牌信息
        if (!entityResult.entities.brand && this.conversationState.context.brand) {
            const historicalBrand = this.conversationState.context.brand;
            entityResult.entities.brand = {
                ...historicalBrand,
                inherited: true, // 标记为继承自上下文
                method: 'context_inheritance'
            };
            entityResult.entityCount++;
        }
        
        // 如果当前没有提取到车型，但历史上下文中有，则继承车型信息
        if (!entityResult.entities.model && this.conversationState.context.model) {
            const historicalModel = this.conversationState.context.model;
            entityResult.entities.model = {
                ...historicalModel,
                inherited: true,
                method: 'context_inheritance'
            };
            entityResult.entityCount++;
        }
        
        return entityResult;
    }

    /**
     * 延迟函数
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 设置模式
     */
    setMode(mode) {
        this.mode = mode;
    }

    /**
     * 清空对话状态
     */
    clearState() {
        this.conversationState = {
            currentIntent: null,
            missingEntities: [],
            context: {},
            history: []
        };
    }
}

export default ChatEngine;
