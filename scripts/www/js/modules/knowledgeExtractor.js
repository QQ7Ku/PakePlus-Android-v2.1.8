/**
 * 知识提取器 - 从Q/A例句自动提取结构化知识
 * 支持多种问答格式识别
 */

export class KnowledgeExtractor {
    constructor() {
        // 分类关键词映射
        this.categoryPatterns = {
            price: {
                keywords: ['价格', '多少钱', '费用', '预算', '报价', '便宜', '贵', '砍价', '优惠', '折扣', '首付', '月供', '贷款', '利息'],
                patterns: [/\d+万/, /\d+元/, /价格/, /费用/, /预算/, /多少钱/]
            },
            condition: {
                keywords: ['车况', '事故', '泡水', '火烧', '调表', '维修', '保养', '检查', '检测', '鉴定', '瑕疵', '问题', '故障', '损坏'],
                patterns: [/车况/, /事故/, /泡水/, /检测/, /维修/, /保养/]
            },
            process: {
                keywords: ['过户', '手续', '流程', '合同', '签约', '付款', '提车', '上牌', '年检', '保险', '贷款', '分期', '定金', '押金'],
                patterns: [/过户/, /手续/, /流程/, /合同/, /签约/, /付款/]
            },
            recommendation: {
                keywords: ['推荐', '建议', '选车', '买车', '适合', '值得', '性价比', '对比', '哪个好', '怎么选', '买什么'],
                patterns: [/推荐/, /建议/, /选车/, /适合/, /值得/]
            },
            policy: {
                keywords: ['政策', '法规', '限制', '排放', '新能源', '电动车', '补贴', '免税', '关税', '进口', '限行', '摇号', '指标'],
                patterns: [/政策/, /法规/, /新能源/, /补贴/, /免税/]
            },
            sales: {
                keywords: ['跟进', '客户', '销售', '沟通', '话术', '微信', '电话', '联系', '接待', '服务', '成交', '逼单', '异议'],
                patterns: [/跟进/, /客户/, /销售/, /沟通/, /话术/, /微信/, /电话/]
            },
            asean: {
                keywords: ['马来西亚', '泰国', '新加坡', '印尼', '越南', '东盟', '进口', '关税', '跨境', '右舵', 'Puspakom', 'JPJ'],
                patterns: [/马来西亚/, /泰国/, /新加坡/, /印尼/, /东盟/, /进口/]
            }
        };

        // 车型品牌关键词
        this.carBrands = [
            '丰田', 'Toyota', '本田', 'Honda', '三菱', 'Mitsubishi', '马自达', 'Mazda',
            '日产', 'Nissan', '福特', 'Ford', '五十铃', 'Isuzu', '铃木', 'Suzuki',
            '现代', 'Hyundai', '起亚', 'Kia', '宝马', 'BMW', '奔驰', 'Mercedes',
            '奥迪', 'Audi', '雷克萨斯', 'Lexus', '沃尔沃', 'Volvo', '保时捷', 'Porsche',
            '比亚迪', 'BYD', '特斯拉', 'Tesla', '蔚来', 'NIO', '小鹏', 'Xpeng',
            '理想', 'Li Auto', '小米', 'Xiaomi', '极氪', 'Zeekr'
        ];

        // 车型关键词
        this.carModels = [
            'Hilux', 'Vios', 'Yaris', 'Camry', 'Corolla', 'Altis', 'City', 'Jazz',
            'Civic', 'Accord', 'CR-V', 'HR-V', 'BR-V', 'Xpander', 'Triton', 'ASX',
            'Outlander', 'CX-5', 'CX-3', 'Almera', 'Sylphy', 'X-Trail', 'Navara',
            'Ranger', 'Everest', 'Focus', 'D-Max', 'MU-X', 'Swift', 'Ertiga', 'Jimny',
            '秦', 'Qin', '唐', 'Tang', '宋', 'Song', '汉', 'Han', '元', 'Yuan',
            '海豚', 'Dolphin', '海豹', 'Seal', 'Atto', 'Model 3', 'Model Y', 'SU7'
        ];

        // 车辆类型
        this.carTypes = ['轿车', 'SUV', 'MPV', '跑车', '皮卡', '面包车', '两厢车', '三厢车', '掀背车', '旅行车'];
    }

    /**
     * 从Q/A例句提取结构化知识
     * @param {string} question - 问题
     * @param {string} answer - 答案
     * @returns {Object} 提取结果
     */
    extract(question, answer) {
        if (!question || !answer) {
            return { success: false, error: '问题和答案不能为空' };
        }

        const q = question.trim();
        const a = answer.trim();

        // 提取分类
        const category = this.extractCategory(q, a);

        // 提取关键词
        const keywords = this.extractKeywords(q, a);

        // 生成问题变体
        const questions = this.generateQuestionVariants(q);

        // 提取相关车型
        const relatedModels = this.extractRelatedModels(q, a);

        // 提取相关主题
        const relatedTopics = this.extractRelatedTopics(q, a, category);

        return {
            success: true,
            data: {
                category,
                keywords: [...new Set(keywords)],
                questions: [...new Set(questions)],
                answer: a,
                relatedModels: [...new Set(relatedModels)],
                relatedTopics: [...new Set(relatedTopics)]
            },
            meta: {
                confidence: this.calculateConfidence(q, a, keywords),
                extractedFields: ['category', 'keywords', 'questions', 'answer', 'relatedModels', 'relatedTopics']
            }
        };
    }

    /**
     * 批量提取
     * @param {Array<{question: string, answer: string}>} qaList - Q/A列表
     */
    extractBatch(qaList) {
        const results = {
            success: [],
            failed: []
        };

        for (const item of qaList) {
            const result = this.extract(item.question, item.answer);
            if (result.success) {
                results.success.push(result.data);
            } else {
                results.failed.push({
                    item,
                    error: result.error
                });
            }
        }

        return results;
    }

    /**
     * 从文本提取分类
     */
    extractCategory(question, answer) {
        const text = (question + ' ' + answer).toLowerCase();
        const scores = {};

        for (const [category, patterns] of Object.entries(this.categoryPatterns)) {
            scores[category] = 0;
            
            // 关键词匹配
            for (const keyword of patterns.keywords) {
                if (text.includes(keyword.toLowerCase())) {
                    scores[category] += 1;
                }
            }
            
            // 正则匹配
            for (const pattern of patterns.patterns) {
                if (pattern.test(text)) {
                    scores[category] += 2;
                }
            }
        }

        // 找出得分最高的分类
        let bestCategory = 'general';
        let maxScore = 0;

        for (const [category, score] of Object.entries(scores)) {
            if (score > maxScore) {
                maxScore = score;
                bestCategory = category;
            }
        }

        return bestCategory;
    }

    /**
     * 提取关键词
     */
    extractKeywords(question, answer) {
        const keywords = new Set();
        const text = question + ' ' + answer;

        // 1. 提取品牌
        for (const brand of this.carBrands) {
            if (text.toLowerCase().includes(brand.toLowerCase())) {
                keywords.add(brand);
            }
        }

        // 2. 提取车型
        for (const model of this.carModels) {
            if (text.toLowerCase().includes(model.toLowerCase())) {
                keywords.add(model);
            }
        }

        // 3. 提取车辆类型
        for (const type of this.carTypes) {
            if (text.includes(type)) {
                keywords.add(type);
            }
        }

        // 4. 从问题中提取核心名词
        const coreWords = this.extractCoreWords(question);
        coreWords.forEach(w => keywords.add(w));

        // 5. 从答案中提取动作关键词
        const actionWords = this.extractActionWords(answer);
        actionWords.forEach(w => keywords.add(w));

        return Array.from(keywords);
    }

    /**
     * 提取核心词
     */
    extractCoreWords(text) {
        const words = [];
        
        // 常见业务关键词
        const businessWords = [
            '微信', '电话', '视频', '图片', '资料', '信息', '报告', '检测',
            '跟进', '联系', '沟通', '接待', '服务', '成交', '签约',
            '首付', '贷款', '分期', '全款', '定金', '押金', '退款',
            '过户', '上牌', '保险', '年检', '维修', '保养'
        ];

        for (const word of businessWords) {
            if (text.includes(word)) {
                words.push(word);
            }
        }

        return words;
    }

    /**
     * 提取动作关键词
     */
    extractActionWords(text) {
        const words = [];
        
        // 动作模式
        const actionPatterns = [
            /发送[了]?(\w+)/g,
            /提供[了]?(\w+)/g,
            /准备[了]?(\w+)/g,
            /拍摄[了]?(\w+)/g,
            /制作[了]?(\w+)/g,
            /询问[了]?(\w+)/g,
            /确认[了]?(\w+)/g
        ];

        for (const pattern of actionPatterns) {
            const matches = text.match(pattern);
            if (matches) {
                matches.forEach(m => words.push(m));
            }
        }

        return words;
    }

    /**
     * 生成问题变体
     */
    generateQuestionVariants(question) {
        const variants = [question];
        
        // 提取核心问题
        const core = question.replace(/[?？]/g, '').trim();
        
        // 常见变体模式
        const patterns = [
            `请问${core}？`,
            `我想问一下${core}`,
            `${core}？`,
            `请问一下${core}`,
            core
        ];

        // 根据问题类型添加特定变体
        if (question.includes('怎么') || question.includes('如何')) {
            variants.push(`${core}的方法`, `${core}的步骤`);
        }
        
        if (question.includes('多少') || question.includes('什么')) {
            variants.push(`请问${core}`);
        }

        return [...new Set([...variants, ...patterns])].slice(0, 5);
    }

    /**
     * 提取相关车型
     */
    extractRelatedModels(question, answer) {
        const models = [];
        const text = question + ' ' + answer;

        // 匹配品牌+车型组合
        for (const brand of this.carBrands) {
            for (const model of this.carModels) {
                const combo1 = brand + ' ' + model;
                const combo2 = brand + model;
                
                if (text.includes(combo1) || text.includes(combo2)) {
                    models.push(`${brand} ${model}`);
                }
            }
        }

        // 单独匹配车型
        for (const model of this.carModels) {
            if (text.includes(model)) {
                models.push(model);
            }
        }

        return [...new Set(models)].slice(0, 5);
    }

    /**
     * 提取相关主题
     */
    extractRelatedTopics(question, answer, category) {
        const topics = [];
        const text = question + ' ' + answer;

        // 根据分类添加相关主题
        const topicMap = {
            price: ['预算', '费用', '贷款', '砍价'],
            condition: ['检测', '保养', '维修', '保险'],
            process: ['手续', '合同', '过户', '上牌'],
            recommendation: ['预算', '需求', '对比', '试驾'],
            policy: ['税费', '补贴', '限行', '环保'],
            sales: ['沟通', '服务', '跟进', '成交'],
            asean: ['进口', '关税', '跨境', '法规']
        };

        const relatedTopics = topicMap[category] || [];
        for (const topic of relatedTopics) {
            if (text.includes(topic)) {
                topics.push(topic);
            }
        }

        return topics.slice(0, 3);
    }

    /**
     * 计算提取置信度
     */
    calculateConfidence(question, answer, keywords) {
        let score = 0.5; // 基础分

        // 问题长度适中
        if (question.length >= 10 && question.length <= 100) {
            score += 0.1;
        }

        // 答案长度适中
        if (answer.length >= 20 && answer.length <= 1000) {
            score += 0.1;
        }

        // 有提取到关键词
        if (keywords.length > 0) {
            score += Math.min(keywords.length * 0.05, 0.2);
        }

        // 包含具体数字或列表（通常表示详细回答）
        if (/\d+/.test(answer) || /[①②③④⑤]/.test(answer) || /\d+\./.test(answer)) {
            score += 0.1;
        }

        return Math.min(score, 1.0);
    }

    /**
     * 解析自然语言Q/A文本
     * 支持格式：
     * Q: 问题 A: 答案
     * Q1: 问题 A1: 答案（带数字编号）
     * Q505: 问题 A505: 答案
     * 问题：xxx 答案：xxx
     * Q：问题 A：答案
     */
    parseQAText(text) {
        const results = [];
        
        // 多种分隔模式（按优先级排序）
        const patterns = [
            // Q数字: 问题 A数字: 答案（如 Q505: xxx A505: xxx）
            /Q(\d+)[:：]\s*(.+?)(?:\r?\n|\r)A\1[:：]\s*([\s\S]+?)(?=(?:\r?\n|\r)Q\d+[:：]|$)/gi,
            // Q: 问题 A: 答案（无数字）
            /Q[:：]\s*(.+?)(?:\r?\n|\r)A[:：]\s*([\s\S]+?)(?=(?:\r?\n|\r)Q[:：]|$)/gi,
            // 问题: xxx 答案: xxx
            /问题[:：]\s*(.+?)(?:\r?\n|\r)答案[:：]\s*([\s\S]+?)(?=(?:\r?\n|\r)问题[:：]|$)/gis,
            // 问: xxx 答: xxx
            /问[:：]\s*(.+?)(?:\r?\n|\r)答[:：]\s*([\s\S]+?)(?=(?:\r?\n|\r)问[:：]|$)/gis
        ];

        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                // 对于带数字的模式，match[2]是问题，match[3]是答案
                // 对于不带数字的模式，match[1]是问题，match[2]是答案
                const question = match[2] ? match[2].trim() : match[1].trim();
                const answer = match[2] ? match[3].trim() : match[2].trim();
                
                if (question && answer) {
                    results.push({ question, answer });
                }
            }
        }

        return results;
    }

    /**
     * 智能补全知识条目
     * 对提取结果进行优化
     */
    enhance(extractedData) {
        const data = { ...extractedData };

        // 如果关键词太少，自动扩展
        if (data.keywords.length < 3) {
            const extended = this.extendKeywords(data.questions[0], data.answer);
            data.keywords = [...new Set([...data.keywords, ...extended])];
        }

        // 优化答案格式
        data.answer = this.formatAnswer(data.answer);

        return data;
    }

    /**
     * 扩展关键词
     */
    extendKeywords(question, answer) {
        const keywords = [];
        const text = question + ' ' + answer;

        // 提取所有2-4字的名词性短语
        const phrases = text.match(/[\u4e00-\u9fa5]{2,4}/g) || [];
        
        for (const phrase of phrases) {
            // 过滤停用词
            if (!this.isStopWord(phrase) && phrase.length >= 2) {
                keywords.push(phrase);
            }
        }

        return [...new Set(keywords)].slice(0, 10);
    }

    /**
     * 格式化答案
     */
    formatAnswer(answer) {
        // 统一列表标记
        let formatted = answer
            .replace(/[•·]/g, '•')
            .replace(/^(\d+)[\.、]/gm, '$1.')
            .replace(/^[①②③④⑤]/gm, (match) => {
                const map = { '①': '1.', '②': '2.', '③': '3.', '④': '4.', '⑤': '5.' };
                return map[match] || match;
            });

        // 确保段落间有空行
        formatted = formatted.replace(/\n{3,}/g, '\n\n');

        return formatted.trim();
    }

    /**
     * 检查是否为停用词
     */
    isStopWord(word) {
        const stopWords = new Set([
            '这个', '那个', '什么', '怎么', '如何', '可以', '需要',
            '进行', '完成', '开始', '结束', '继续', '暂停'
        ]);
        return stopWords.has(word);
    }
}

export default KnowledgeExtractor;
