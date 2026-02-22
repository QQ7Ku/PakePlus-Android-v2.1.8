/**
 * 意图识别模块
 * 基于规则+关键词匹配的意图分类器
 */

import { INTENTS, INTENT_KEYWORDS, CONFIG } from '../config/constants.js?v=2';

export class IntentRecognizer {
    constructor() {
        this.intentKeywords = INTENT_KEYWORDS;
        this.confidenceThreshold = CONFIG.CONFIDENCE_THRESHOLD;
    }

    /**
     * 识别用户输入的意图
     * @param {string} text - 用户输入文本
     * @returns {Object} - 识别结果 {intent, confidence, matchedKeywords}
     */
    recognize(text) {
        const startTime = performance.now();
        const normalizedText = this._normalizeText(text);
        
        // 计算各意图的匹配分数
        const scores = this._calculateScores(normalizedText);
        
        // 找出最高分的意图
        const bestMatch = this._findBestMatch(scores);
        
        // 计算置信度
        const confidence = this._calculateConfidence(bestMatch, scores);
        
        const latency = performance.now() - startTime;
        
        return {
            intent: bestMatch.intent,
            confidence: confidence,
            matchedKeywords: bestMatch.matchedKeywords,
            allScores: scores,
            latency: Math.round(latency),
            rawText: text,
            normalizedText: normalizedText
        };
    }

    /**
     * 标准化文本
     */
    _normalizeText(text) {
        return text
            .toLowerCase()
            .replace(/[，。？！,.?!]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * 计算各意图的匹配分数
     */
    _calculateScores(text) {
        const scores = {};
        
        for (const [intent, keywords] of Object.entries(this.intentKeywords)) {
            let score = 0;
            const matchedKeywords = [];
            
            for (const keyword of keywords) {
                // 完全匹配
                if (text.includes(keyword.toLowerCase())) {
                    score += 1.0;
                    matchedKeywords.push({ keyword, weight: 1.0 });
                } 
                // 模糊匹配（关键词长度>2才进行）
                else if (keyword.length > 2) {
                    const similarity = this._calculateSimilarity(text, keyword);
                    if (similarity > 0.7) {
                        score += similarity * 0.5;
                        matchedKeywords.push({ keyword, weight: similarity * 0.5 });
                    }
                }
            }
            
            // 归一化分数
            scores[intent] = {
                score: score,
                matchedKeywords: matchedKeywords,
                keywordCount: keywords.length
            };
        }
        
        return scores;
    }

    /**
     * 计算字符串相似度（简单的编辑距离归一化）
     */
    _calculateSimilarity(text, keyword) {
        // 简化的相似度计算：检查是否包含关键词的子串
        const keywordLower = keyword.toLowerCase();
        
        // 检查2-gram匹配
        let matchCount = 0;
        for (let i = 0; i < keywordLower.length - 1; i++) {
            const bigram = keywordLower.substring(i, i + 2);
            if (text.includes(bigram)) {
                matchCount++;
            }
        }
        
        return matchCount / (keywordLower.length - 1);
    }

    /**
     * 找出最佳匹配的意图
     */
    _findBestMatch(scores) {
        let bestIntent = INTENTS.UNKNOWN;
        let bestScore = 0;
        let bestKeywords = [];
        
        for (const [intent, data] of Object.entries(scores)) {
            if (data.score > bestScore) {
                bestScore = data.score;
                bestIntent = intent;
                bestKeywords = data.matchedKeywords;
            }
        }
        
        return {
            intent: bestIntent,
            score: bestScore,
            matchedKeywords: bestKeywords
        };
    }

    /**
     * 计算置信度
     */
    _calculateConfidence(bestMatch, allScores) {
        if (bestMatch.score === 0) {
            return 0;
        }
        
        // 计算总分
        const totalScore = Object.values(allScores).reduce((sum, data) => sum + data.score, 0);
        
        // 基础置信度 = 最佳匹配分数 / 总分
        let confidence = bestMatch.score / totalScore;
        
        // 根据匹配关键词数量调整
        if (bestMatch.matchedKeywords.length >= 2) {
            confidence = Math.min(confidence * 1.2, 1.0);
        }
        
        // 根据分数差距调整
        const sortedScores = Object.entries(allScores)
            .sort((a, b) => b[1].score - a[1].score);
        
        if (sortedScores.length >= 2) {
            const gap = sortedScores[0][1].score - sortedScores[1][1].score;
            if (gap > 1) {
                confidence = Math.min(confidence * 1.1, 1.0);
            }
        }
        
        return Math.min(confidence, 1.0);
    }

    /**
     * 获取意图描述
     */
    getIntentDescription(intent) {
        const descriptions = {
            [INTENTS.VALUATION]: '用户想要评估车辆价格',
            [INTENTS.QUERY]: '用户想要查询车辆信息',
            [INTENTS.COMPARE]: '用户想要对比不同车型',
            [INTENTS.RECOMMEND]: '用户想要购车建议',
            [INTENTS.PROCESS]: '用户想要了解交易流程',
            [INTENTS.POLICY]: '用户想要了解相关政策',
            [INTENTS.GREETING]: '用户打招呼',
            [INTENTS.GOODBYE]: '用户结束对话',
            [INTENTS.UNKNOWN]: '意图不明确'
        };
        
        return descriptions[intent] || '未知意图';
    }

    /**
     * 获取置信度等级
     */
    getConfidenceLevel(confidence) {
        if (confidence >= this.confidenceThreshold.HIGH) {
            return { level: 'high', label: '高', color: '#10b981' };
        } else if (confidence >= this.confidenceThreshold.MEDIUM) {
            return { level: 'medium', label: '中', color: '#f59e0b' };
        } else {
            return { level: 'low', label: '低', color: '#ef4444' };
        }
    }

    /**
     * 批量测试意图识别
     */
    batchTest(testCases) {
        const results = [];
        
        for (const testCase of testCases) {
            const result = this.recognize(testCase.text);
            results.push({
                input: testCase.text,
                expected: testCase.expectedIntent,
                actual: result.intent,
                confidence: result.confidence,
                correct: result.intent === testCase.expectedIntent,
                latency: result.latency
            });
        }
        
        // 计算准确率
        const correctCount = results.filter(r => r.correct).length;
        const accuracy = (correctCount / results.length * 100).toFixed(2);
        const avgLatency = (results.reduce((sum, r) => sum + r.latency, 0) / results.length).toFixed(2);
        
        return {
            results,
            summary: {
                total: results.length,
                correct: correctCount,
                accuracy: `${accuracy}%`,
                avgLatency: `${avgLatency}ms`
            }
        };
    }
}

export default IntentRecognizer;
