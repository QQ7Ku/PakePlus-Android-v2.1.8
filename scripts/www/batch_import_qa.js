/**
 * 批量导入Q/A到知识库
 * 从结构化文本提取并导入
 */

import { LocalDatabase } from './js/modules/localDatabase.js';
import { KnowledgeManager } from './js/modules/knowledgeManager.js';
import { KnowledgeExtractor } from './js/modules/knowledgeExtractor.js';

// 批量导入类
export class BatchImporter {
    constructor() {
        this.localDB = new LocalDatabase();
        this.manager = new KnowledgeManager(this.localDB);
        this.extractor = new KnowledgeExtractor();
        this.results = {
            success: [],
            failed: [],
            total: 0
        };
    }

    /**
     * 从结构化文本解析Q/A列表
     * 支持格式：
     * Q1: 问题
     * A1: 答案
     * 
     * Q2: 问题
     * A2: 答案
     */
    parseStructuredText(text) {
        const qaList = [];
        
        // 匹配 Q数字: 或 Q: 格式
        const pattern = /(?:Q(\d+)[:：]|Q[:：])\s*(.+?)(?:\n|\r)(?:A\1[:：]|A[:：])\s*(.+?)(?=(?:\n|\r)(?:Q|$))/gis;
        
        let match;
        while ((match = pattern.exec(text)) !== null) {
            const question = match[2].trim();
            const answer = match[3].trim();
            
            if (question && answer) {
                qaList.push({ question, answer });
            }
        }
        
        // 如果没有匹配到编号格式，尝试简单Q/A格式
        if (qaList.length === 0) {
            const simplePattern = /Q[:：]\s*(.+?)(?:\n|\r)A[:：]\s*(.+?)(?=(?:\n|\r)Q[:：]|$)/gis;
            while ((match = simplePattern.exec(text)) !== null) {
                qaList.push({
                    question: match[1].trim(),
                    answer: match[2].trim()
                });
            }
        }
        
        return qaList;
    }

    /**
     * 批量导入Q/A列表
     */
    async importBatch(qaList, category = 'general') {
        this.results = { success: [], failed: [], total: qaList.length };
        
        for (let i = 0; i < qaList.length; i++) {
            const { question, answer } = qaList[i];
            
            try {
                // 使用提取器自动提取结构化数据
                const extracted = this.extractor.extract(question, answer);
                
                if (extracted.success) {
                    // 增强数据
                    const data = this.extractor.enhance(extracted.data);
                    
                    // 如果指定了分类，覆盖自动识别的分类
                    if (category !== 'auto') {
                        data.category = category;
                    }
                    
                    // 添加到知识库
                    const result = this.manager.addKnowledge(data);
                    
                    if (result.success) {
                        this.results.success.push({
                            id: result.id,
                            question: question.substring(0, 50) + '...'
                        });
                    } else {
                        this.results.failed.push({
                            question: question.substring(0, 50) + '...',
                            error: result.error
                        });
                    }
                } else {
                    this.results.failed.push({
                        question: question.substring(0, 50) + '...',
                        error: extracted.error
                    });
                }
                
                // 每10条输出一次进度
                if ((i + 1) % 10 === 0) {
                    console.log(`已处理 ${i + 1}/${qaList.length} 条`);
                }
                
            } catch (error) {
                this.results.failed.push({
                    question: question.substring(0, 50) + '...',
                    error: error.message
                });
            }
        }
        
        return this.results;
    }

    /**
     * 从文件导入
     */
    async importFromFile(fileContent, category = 'general') {
        const qaList = this.parseStructuredText(fileContent);
        console.log(`解析到 ${qaList.length} 条Q/A`);
        
        if (qaList.length === 0) {
            return { error: '未解析到有效的Q/A数据' };
        }
        
        return await this.importBatch(qaList, category);
    }

    /**
     * 导出导入结果报告
     */
    exportReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total: this.results.total,
                success: this.results.success.length,
                failed: this.results.failed.length,
                successRate: ((this.results.success.length / this.results.total) * 100).toFixed(2) + '%'
            },
            details: this.results
        };
        
        return JSON.stringify(report, null, 2);
    }
}

// 使用示例
async function main() {
    const importer = new BatchImporter();
    
    // 示例：从文件导入
    // const fs = require('fs');
    // const content = fs.readFileSync('asean_qa_1000.txt', 'utf8');
    // const result = await importer.importFromFile(content, 'auto');
    // console.log(importer.exportReport());
}

export default BatchImporter;
