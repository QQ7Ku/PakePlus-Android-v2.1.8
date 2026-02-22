/**
 * 知识库模块
 * 管理FAQ和二手车相关知识
 */

import { KNOWLEDGE_BASE, CAR_BRANDS, CAR_MODELS } from '../config/constants.js?v=2';

export class KnowledgeBase {
    constructor() {
        this.faqData = KNOWLEDGE_BASE;
        this.brands = CAR_BRANDS;
        this.models = CAR_MODELS;
        
        // 构建搜索索引
        this._buildIndex();
    }

    /**
     * 构建搜索索引
     */
    _buildIndex() {
        this.searchIndex = [];
        
        for (const [key, data] of Object.entries(this.faqData)) {
            this.searchIndex.push({
                key: key,
                question: data.question,
                answer: data.answer,
                keywords: this._extractKeywords(data.question + ' ' + data.answer)
            });
        }
    }

    /**
     * 提取关键词
     */
    _extractKeywords(text) {
        // 简单的关键词提取
        return text
            .replace(/[，。？！,.?!、]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length >= 2)
            .map(word => word.toLowerCase());
    }

    /**
     * 搜索知识库
     * @param {string} query - 查询文本
     * @param {number} topK - 返回结果数量
     * @returns {Array} - 匹配结果
     */
    search(query, topK = 3) {
        const startTime = performance.now();
        const normalizedQuery = query.toLowerCase();
        
        // 提取查询中的关键实体（如"泡水车","事故车"等）
        const keyEntities = this._extractKeyEntities(normalizedQuery);
        
        // 计算每个文档的相似度
        const scores = this.searchIndex.map(doc => {
            let similarity = this._calculateSimilarity(normalizedQuery, doc);
            
            // 如果查询包含与文档key匹配的关键实体，大幅提高相似度
            for (const entity of keyEntities) {
                if (doc.key.toLowerCase().includes(entity) || 
                    entity.includes(doc.key.toLowerCase())) {
                    similarity = Math.max(similarity, 0.95);
                    break;
                }
            }
            
            return { ...doc, similarity };
        });
        
        // 排序并返回topK
        const results = scores
            .filter(doc => doc.similarity > 0.1)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, topK);
        
        const latency = performance.now() - startTime;
        
        return {
            results: results.map(r => ({
                question: r.question,
                answer: r.answer,
                similarity: r.similarity,
                key: r.key
            })),
            query: query,
            resultCount: results.length,
            latency: Math.round(latency)
        };
    }

    /**
     * 提取查询中的关键实体
     */
    _extractKeyEntities(query) {
        const entities = [];
        const keyTerms = ['事故车', '泡水车', '调表车', '过户', '贷款', '流程', '手续'];
        
        for (const term of keyTerms) {
            if (query.includes(term)) {
                entities.push(term);
            }
        }
        
        return entities;
    }

    /**
     * 计算相似度
     */
    _calculateSimilarity(query, doc) {
        let score = 0;
        
        // 1. 问题完全匹配或包含
        if (doc.question.toLowerCase().includes(query)) {
            score += 1.0;
        }
        
        // 2. 关键词匹配
        const queryWords = query.split(/\s+/);
        let matchedWordCount = 0;
        for (const word of queryWords) {
            if (word.length < 2) continue;
            
            // 关键词在文档中出现
            if (doc.keywords.includes(word)) {
                score += 0.3;
                matchedWordCount++;
            }
            
            // 关键词在问题中出现
            if (doc.question.toLowerCase().includes(word)) {
                score += 0.5;
                matchedWordCount++;
            }
            
            // 关键词在答案中出现
            if (doc.answer.toLowerCase().includes(word)) {
                score += 0.1;
            }
        }
        
        // 3. 如果所有关键词都匹配，增加额外分数
        if (matchedWordCount === queryWords.filter(w => w.length >= 2).length && matchedWordCount > 0) {
            score += 0.3;
        }
        
        // 4. 编辑距离相似度
        const editDistance = this._levenshteinDistance(query, doc.question.toLowerCase());
        const maxLen = Math.max(query.length, doc.question.length);
        const similarity = 1 - (editDistance / maxLen);
        score += similarity * 0.2;
        
        return Math.min(score, 1.0);
    }

    /**
     * 计算编辑距离
     */
    _levenshteinDistance(str1, str2) {
        const m = str1.length;
        const n = str2.length;
        
        // 创建距离矩阵
        const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
        
        // 初始化边界
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        
        // 填充矩阵
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (str1[i - 1] === str2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    dp[i][j] = Math.min(
                        dp[i - 1][j] + 1,      // 删除
                        dp[i][j - 1] + 1,      // 插入
                        dp[i - 1][j - 1] + 1   // 替换
                    );
                }
            }
        }
        
        return dp[m][n];
    }

    /**
     * 获取特定问题的答案
     */
    getAnswer(key) {
        const item = this.faqData[key];
        if (item) {
            return {
                question: item.question,
                answer: item.answer,
                found: true
            };
        }
        
        return {
            found: false,
            answer: null
        };
    }

    /**
     * 获取车型信息
     */
    getCarInfo(brand, model = null) {
        const brandInfo = this.models[brand];
        
        if (!brandInfo) {
            return {
                found: false,
                message: `未找到品牌 "${brand}" 的信息`
            };
        }
        
        if (model) {
            const hasModel = brandInfo.includes(model);
            return {
                found: hasModel,
                brand: brand,
                model: model,
                allModels: brandInfo,
                message: hasModel ? null : `"${brand}" 下未找到车型 "${model}"`
            };
        }
        
        return {
            found: true,
            brand: brand,
            models: brandInfo,
            modelCount: brandInfo.length
        };
    }

    /**
     * 获取品牌列表
     */
    getBrandList() {
        return {
            count: this.brands.length,
            brands: this.brands
        };
    }

    /**
     * 添加新的FAQ
     */
    addFAQ(key, question, answer) {
        this.faqData[key] = { question, answer };
        this._buildIndex(); // 重建索引
        
        return {
            success: true,
            key: key,
            message: 'FAQ添加成功'
        };
    }

    /**
     * 获取所有FAQ
     */
    getAllFAQ() {
        return Object.entries(this.faqData).map(([key, data]) => ({
            key,
            question: data.question,
            answer: data.answer
        }));
    }

    /**
     * 智能推荐相关问题
     */
    getRelatedQuestions(query, limit = 3) {
        const searchResult = this.search(query, limit);
        
        return searchResult.results.map(r => ({
            question: r.question,
            similarity: r.similarity,
            key: r.key
        }));
    }

    /**
     * 生成知识库统计
     */
    getStats() {
        return {
            faqCount: Object.keys(this.faqData).length,
            brandCount: this.brands.length,
            modelCount: Object.values(this.models).reduce((sum, models) => sum + models.length, 0),
            indexSize: this.searchIndex.length
        };
    }
}

export default KnowledgeBase;
