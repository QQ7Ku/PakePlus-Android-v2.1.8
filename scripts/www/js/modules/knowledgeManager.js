/**
 * 知识库管理模块
 * 支持动态添加、删除、更新知识条目
 * 提供导入导出功能
 */

export class KnowledgeManager {
    constructor(localDatabase, options = {}) {
        this.db = localDatabase;
        this.maxQAPairs = 1000; // 最大知识条目数
        this.autoSaveKey = 'asean_car_kb_custom'; // localStorage key
        
        // 是否自动加载自定义知识（默认 true）
        const autoLoad = options.autoLoad !== false;
        
        // 加载用户自定义知识
        if (autoLoad) {
            this.loadCustomKnowledge();
        }
    }

    /**
     * 添加新的知识条目
     * @param {Object} qaPair - 知识条目
     * @param {string} qaPair.category - 分类 (price/condition/process/recommendation/policy/asean)
     * @param {string[]} qaPair.keywords - 关键词数组
     * @param {string[]} qaPair.questions - 问题变体数组
     * @param {string} qaPair.answer - 答案内容
     * @param {string[]} [qaPair.relatedModels] - 相关车型
     * @param {string[]} [qaPair.relatedTopics] - 相关主题
     * @returns {Object} 添加结果
     */
    addKnowledge(qaPair) {
        // 验证必填字段
        const validation = this.validateQAPair(qaPair);
        if (!validation.valid) {
            return { success: false, error: validation.error };
        }

        // 检查是否已达上限
        if (this.db.qaPairs.length >= this.maxQAPairs) {
            return { success: false, error: `知识库已达上限(${this.maxQAPairs}条)` };
        }

        // 生成唯一ID
        const id = this.generateId(qaPair.category);
        
        // 构建完整条目
        const newEntry = {
            id,
            category: qaPair.category,
            keywords: [...new Set(qaPair.keywords.map(k => k.toLowerCase()))],
            questions: qaPair.questions.filter(q => q.trim()),
            answer: qaPair.answer.trim(),
            relatedModels: qaPair.relatedModels || [],
            relatedTopics: qaPair.relatedTopics || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            source: 'custom' // 标记为用户添加
        };

        // 检查重复
        const duplicate = this.findDuplicate(newEntry);
        if (duplicate) {
            return { 
                success: false, 
                error: `与现有条目重复: ${duplicate.id}`,
                duplicate: duplicate
            };
        }

        // 添加到知识库
        this.db.qaPairs.push(newEntry);
        
        // 重建搜索索引
        this.db.searchIndex = this.db.buildSearchIndex();
        
        // 保存到本地存储
        this.saveCustomKnowledge();
        
        // 更新元数据
        this.updateMetadata();

        console.log(`[KnowledgeManager] 添加知识条目: ${id}`);
        
        return {
            success: true,
            id: id,
            total: this.db.qaPairs.length
        };
    }

    /**
     * 批量添加知识条目
     * @param {Object[]} qaPairs - 知识条目数组
     * @returns {Object} 批量添加结果
     */
    batchAddKnowledge(qaPairs) {
        const results = {
            success: [],
            failed: [],
            total: qaPairs.length
        };

        for (const qaPair of qaPairs) {
            const result = this.addKnowledge(qaPair);
            if (result.success) {
                results.success.push(result.id);
            } else {
                results.failed.push({
                    qaPair,
                    error: result.error
                });
            }
        }

        return results;
    }

    /**
     * 从JSON文件导入知识
     * @param {string} jsonContent - JSON文件内容
     * @returns {Object} 导入结果
     */
    importFromJSON(jsonContent) {
        try {
            const data = JSON.parse(jsonContent);
            
            // 支持两种格式：完整知识库或仅qa_pairs数组
            const qaPairs = data.qa_pairs || data;
            
            if (!Array.isArray(qaPairs)) {
                return { success: false, error: '无效的JSON格式：期望数组或包含qa_pairs的对象' };
            }

            return this.batchAddKnowledge(qaPairs);
        } catch (error) {
            return { success: false, error: `JSON解析错误: ${error.message}` };
        }
    }

    /**
     * 从CSV导入知识（简化格式）
     * CSV格式: category,keywords,questions,answer
     * @param {string} csvContent - CSV内容
     * @returns {Object} 导入结果
     */
    importFromCSV(csvContent) {
        const lines = csvContent.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const qaPairs = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length < 4) continue;
            
            const row = {};
            headers.forEach((h, idx) => {
                row[h] = values[idx] || '';
            });
            
            qaPairs.push({
                category: row.category || 'general',
                keywords: row.keywords ? row.keywords.split(';').map(k => k.trim()) : [],
                questions: row.questions ? row.questions.split(';').map(q => q.trim()) : [],
                answer: row.answer || ''
            });
        }
        
        return this.batchAddKnowledge(qaPairs);
    }

    /**
     * 删除知识条目
     * @param {string} id - 条目ID
     * @returns {Object} 删除结果
     */
    deleteKnowledge(id) {
        const index = this.db.qaPairs.findIndex(qa => qa.id === id);
        
        if (index === -1) {
            return { success: false, error: '条目不存在' };
        }

        // 只允许删除自定义条目
        const entry = this.db.qaPairs[index];
        if (entry.source !== 'custom') {
            return { success: false, error: '只能删除自定义条目' };
        }

        this.db.qaPairs.splice(index, 1);
        this.db.searchIndex = this.db.buildSearchIndex();
        this.saveCustomKnowledge();
        this.updateMetadata();

        return { success: true, id };
    }

    /**
     * 更新知识条目
     * @param {string} id - 条目ID
     * @param {Object} updates - 更新内容
     * @returns {Object} 更新结果
     */
    updateKnowledge(id, updates) {
        const index = this.db.qaPairs.findIndex(qa => qa.id === id);
        
        if (index === -1) {
            return { success: false, error: '条目不存在' };
        }

        const entry = this.db.qaPairs[index];
        
        // 只允许更新自定义条目
        if (entry.source !== 'custom') {
            return { success: false, error: '只能更新自定义条目' };
        }

        // 应用更新
        const allowedFields = ['keywords', 'questions', 'answer', 'relatedModels', 'relatedTopics'];
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                entry[field] = updates[field];
            }
        });
        
        entry.updatedAt = new Date().toISOString();
        
        this.db.searchIndex = this.db.buildSearchIndex();
        this.saveCustomKnowledge();

        return { success: true, id };
    }

    /**
     * 获取所有自定义条目
     * @returns {Object[]} 自定义条目列表
     */
    getCustomKnowledge() {
        return this.db.qaPairs.filter(qa => qa.source === 'custom');
    }

    /**
     * 导出为JSON
     * @param {boolean} onlyCustom - 仅导出自定义条目
     * @returns {string} JSON字符串
     */
    exportToJSON(onlyCustom = true) {
        const qaPairs = onlyCustom 
            ? this.getCustomKnowledge()
            : this.db.qaPairs;
        
        const exportData = {
            metadata: {
                version: '2.0',
                exportDate: new Date().toISOString(),
                totalQAPairs: qaPairs.length,
                exportedBy: 'knowledgeManager'
            },
            qa_pairs: qaPairs
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    /**
     * 搜索知识条目
     * @param {string} query - 搜索关键词
     * @returns {Object[]} 匹配的条目
     */
    searchKnowledge(query) {
        const lowerQuery = query.toLowerCase();
        
        return this.db.qaPairs.filter(qa => {
            // 搜索ID
            if (qa.id.toLowerCase().includes(lowerQuery)) return true;
            
            // 搜索关键词
            if (qa.keywords.some(k => k.toLowerCase().includes(lowerQuery))) return true;
            
            // 搜索问题
            if (qa.questions.some(q => q.toLowerCase().includes(lowerQuery))) return true;
            
            // 搜索答案（前100字符）
            if (qa.answer.toLowerCase().includes(lowerQuery)) return true;
            
            return false;
        });
    }

    /**
     * 获取分类列表
     * @returns {string[]} 分类数组
     */
    getCategories() {
        return [...new Set(this.db.qaPairs.map(qa => qa.category))];
    }

    /**
     * 验证知识条目
     */
    validateQAPair(qaPair) {
        if (!qaPair) {
            return { valid: false, error: '条目不能为空' };
        }

        // 检查分类
        const validCategories = ['price', 'condition', 'process', 'recommendation', 'policy', 'asean', 'general'];
        if (!qaPair.category || !validCategories.includes(qaPair.category)) {
            return { valid: false, error: `无效的分类，必须是: ${validCategories.join(', ')}` };
        }

        // 检查关键词
        if (!Array.isArray(qaPair.keywords) || qaPair.keywords.length === 0) {
            return { valid: false, error: '至少需要1个关键词' };
        }

        // 检查问题
        if (!Array.isArray(qaPair.questions) || qaPair.questions.length === 0) {
            return { valid: false, error: '至少需要1个问题' };
        }

        // 检查答案
        if (!qaPair.answer || qaPair.answer.trim().length < 10) {
            return { valid: false, error: '答案至少需要10个字符' };
        }

        return { valid: true };
    }

    /**
     * 查找重复条目
     */
    findDuplicate(newEntry) {
        // 检查关键词重叠度
        for (const qa of this.db.qaPairs) {
            const commonKeywords = qa.keywords.filter(k => 
                newEntry.keywords.includes(k)
            );
            
            // 如果关键词重叠超过80%，认为是重复
            const overlapRatio = commonKeywords.length / Math.max(qa.keywords.length, newEntry.keywords.length);
            if (overlapRatio > 0.8) {
                return qa;
            }
            
            // 检查问题是否完全相同
            const commonQuestions = qa.questions.filter(q => 
                newEntry.questions.includes(q)
            );
            if (commonQuestions.length > 0) {
                return qa;
            }
        }
        
        return null;
    }

    /**
     * 生成唯一ID
     */
    generateId(category) {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 4);
        const count = this.db.qaPairs.length + 1;
        return `${category}_${timestamp}_${random}_${count}`;
    }

    /**
     * 解析CSV行（处理引号）
     */
    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        values.push(current.trim());
        return values;
    }

    /**
     * 保存自定义知识到localStorage
     */
    saveCustomKnowledge() {
        try {
            const customEntries = this.getCustomKnowledge();
            localStorage.setItem(this.autoSaveKey, JSON.stringify(customEntries));
            console.log(`[KnowledgeManager] 保存了 ${customEntries.length} 条自定义知识`);
        } catch (error) {
            console.error('[KnowledgeManager] 保存失败:', error);
        }
    }

    /**
     * 从localStorage加载自定义知识
     * @param {boolean} skipRebuildIndex - 是否跳过重建索引（由调用方统一重建）
     */
    loadCustomKnowledge(skipRebuildIndex = false) {
        try {
            const saved = localStorage.getItem(this.autoSaveKey);
            if (saved) {
                const customEntries = JSON.parse(saved);
                if (Array.isArray(customEntries)) {
                    let addedCount = 0;
                    // 合并到知识库
                    customEntries.forEach(entry => {
                        // 检查是否已存在
                        const exists = this.db.qaPairs.some(qa => qa.id === entry.id);
                        if (!exists) {
                            this.db.qaPairs.push(entry);
                            addedCount++;
                        }
                    });
                    
                    // 只在需要时重建索引
                    if (addedCount > 0 && !skipRebuildIndex) {
                        this.db.searchIndex = this.db.buildSearchIndex();
                    }
                    this.updateMetadata();
                    
                    console.log(`[KnowledgeManager] 加载了 ${addedCount}/${customEntries.length} 条自定义知识`);
                    return addedCount;
                }
            }
            return 0;
        } catch (error) {
            console.error('[KnowledgeManager] 加载失败:', error);
            return 0;
        }
    }

    /**
     * 更新元数据
     */
    updateMetadata() {
        // 这里可以更新版本号、最后更新时间等
        console.log(`[KnowledgeManager] 知识库更新: ${this.db.qaPairs.length} 条`);
    }

    /**
     * 清空所有自定义知识
     */
    clearCustomKnowledge() {
        const customIds = this.getCustomKnowledge().map(qa => qa.id);
        customIds.forEach(id => {
            const index = this.db.qaPairs.findIndex(qa => qa.id === id);
            if (index !== -1) {
                this.db.qaPairs.splice(index, 1);
            }
        });
        
        this.db.searchIndex = this.db.buildSearchIndex();
        localStorage.removeItem(this.autoSaveKey);
        this.updateMetadata();
        
        return { success: true, cleared: customIds.length };
    }
}

export default KnowledgeManager;
