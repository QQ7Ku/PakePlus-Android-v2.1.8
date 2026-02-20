/**
 * 混合AI服务 - 本地数据库 + 智谱AI大模型
 * 优先使用本地数据库，必要时调用大模型总结
 */

import { LocalDatabase } from './localDatabase.js';

// 常量配置
const CONFIG = {
    DEFAULT_CONFIDENCE_THRESHOLD: 0.6,
    MAX_RECOMMENDATIONS: 3,
    MAX_LOCAL_MATCHES: 3
};

export class HybridAIService {
    constructor(zhipuService) {
        this.localDB = new LocalDatabase();
        this.zhipuService = zhipuService;
        this.confidenceThreshold = CONFIG.DEFAULT_CONFIDENCE_THRESHOLD;
        this.useAIEnhancement = true;
    }

    /**
     * 设置是否使用AI增强
     */
    setAIEnhancement(enabled) {
        this.useAIEnhancement = enabled;
    }

    /**
     * 设置置信度阈值
     */
    setConfidenceThreshold(threshold) {
        if (typeof threshold === 'number' && threshold >= 0 && threshold <= 1) {
            this.confidenceThreshold = threshold;
        }
    }

    /**
     * 处理用户消息（混合模式）
     */
    async processMessage(userMessage, context = {}) {
        const startTime = performance.now();
        
        // 1. 首先在本地数据库搜索
        const localResult = this.localDB.getBestAnswer(userMessage);
        
        // 检测语言并添加到context
        const detectedLanguage = localResult.language || this.detectLanguage(userMessage);
        context.language = detectedLanguage;
        
        // 2. 如果本地匹配度高，直接返回本地答案
        if (localResult.found && localResult.confidence >= this.confidenceThreshold) {
            const processingTime = Math.round(performance.now() - startTime);
            
            return {
                success: true,
                answer: localResult.answer,
                source: 'local',
                confidence: localResult.confidence,
                processingTime: processingTime,
                matchedId: localResult.matchedId,
                category: localResult.category,
                recommendations: this.localDB.getRecommendations(localResult.matchedId, CONFIG.MAX_RECOMMENDATIONS),
                isEnhanced: false,
                language: detectedLanguage
            };
        }

        // 3. 如果本地匹配度低或没找到，使用AI增强
        if (this.useAIEnhancement && this.zhipuService && this.zhipuService.hasApiKey()) {
            const result = await this.getAIEnhancedAnswer(userMessage, localResult, context, startTime);
            result.language = detectedLanguage;
            return result;
        }

        // 4. 如果没有AI服务，返回本地最佳匹配（即使置信度低）
        const processingTime = Math.round(performance.now() - startTime);
        
        return {
            success: localResult.found,
            answer: localResult.answer,
            source: 'local',
            confidence: localResult.confidence,
            processingTime: processingTime,
            matchedId: localResult.matchedId,
            recommendations: localResult.matchedId ? 
                this.localDB.getRecommendations(localResult.matchedId, CONFIG.MAX_RECOMMENDATIONS) : [],
            isEnhanced: false
        };
    }

    /**
     * 获取AI增强的答案
     */
    async getAIEnhancedAnswer(userMessage, localResult, context, startTime) {
        // 构建增强提示词
        const enhancedPrompt = this.buildEnhancedPrompt(userMessage, localResult, context);
        
        try {
            // 调用智谱AI
            const aiResult = await this.zhipuService.sendMessage(enhancedPrompt, {
                ...context,
                skipHistory: true // 不保存增强查询到历史
            });

            const processingTime = Math.round(performance.now() - startTime);

            if (aiResult.success) {
                return {
                    success: true,
                    answer: aiResult.message,
                    source: 'hybrid',
                    confidence: 0.95, // AI生成的答案置信度较高
                    processingTime: processingTime,
                    localMatch: localResult.found ? {
                        id: localResult.matchedId,
                        confidence: localResult.confidence,
                        category: localResult.category
                    } : null,
                    recommendations: localResult.matchedId ? 
                        this.localDB.getRecommendations(localResult.matchedId, CONFIG.MAX_RECOMMENDATIONS) : [],
                    isEnhanced: true,
                    model: aiResult.model,
                    language: context.language || 'zh'
                };
            } else {
                // AI调用失败，回退到本地答案
                return {
                    success: localResult.found,
                    answer: localResult.answer || aiResult.message,
                    source: 'local_fallback',
                    confidence: localResult.confidence || 0,
                    processingTime: processingTime,
                    error: aiResult.error,
                    isEnhanced: false,
                    language: context.language || 'zh'
                };
            }
        } catch (error) {
            // 出错时回退到本地答案
            const processingTime = Math.round(performance.now() - startTime);
            return {
                success: localResult.found,
                answer: localResult.answer || '抱歉，服务暂时不可用。',
                source: 'local_fallback',
                confidence: localResult.confidence || 0,
                processingTime: processingTime,
                error: error.message,
                isEnhanced: false,
                language: context.language || 'zh'
            };
        }
    }

    /**
     * 检测语言 - 支持所有东盟主要语言
     */
    detectLanguage(text) {
        if (!text || typeof text !== 'string') return 'zh';
        
        const lowerText = text.toLowerCase();
        
        // 泰语检测
        const thaiRegex = /[\u0E00-\u0E7F]/;
        if (thaiRegex.test(text)) {
            return 'th';
        }
        
        // 越南语检测
        const vietnameseRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
        if (vietnameseRegex.test(text)) {
            return 'vi';
        }
        
        // 马来语检测
        const malayWords = ['kereta', 'harga', 'jual', 'beli', 'tangan', 'second', 'murah', 'mahal', 'puspakom', 'jpj'];
        if (malayWords.some(word => lowerText.includes(word))) {
            return 'ms';
        }
        
        // 印尼语检测
        const indonesianWords = ['mobil', 'harga', 'jual', 'beli', 'bekas', 'bpkb', 'stnk'];
        if (indonesianWords.some(word => lowerText.includes(word))) {
            return 'id';
        }
        
        // 菲律宾语检测
        const tagalogWords = ['kamusta', 'magkano', 'presyo', 'kotse', 'sasakyan', 'bili', 'benta'];
        if (tagalogWords.some(word => lowerText.includes(word))) {
            return 'ph';
        }
        
        // 缅甸语检测
        const myanmarRegex = /[\u1000-\u109F]/;
        if (myanmarRegex.test(text)) {
            return 'my';
        }
        
        // 高棉语检测
        const khmerRegex = /[\u1780-\u17FF]/;
        if (khmerRegex.test(text)) {
            return 'kh';
        }
        
        // 老挝语检测
        const laoRegex = /[\u0E80-\u0EFF]/;
        if (laoRegex.test(text)) {
            return 'lo';
        }
        
        return 'zh';
    }

    /**
     * 构建增强提示词
     */
    buildEnhancedPrompt(userMessage, localResult, context) {
        // 检测用户语言
        const userLanguage = this.detectLanguage(userMessage);
        
        let prompt = `用户问题：${userMessage}\n\n`;
        
        // 添加上下文信息
        if (context.country) {
            prompt += `当前国家/地区：${context.country}\n`;
        }
        
        prompt += `用户使用语言：${userLanguage}\n\n`;

        // 语言特定指令
        const languageInstructions = {
            'th': {
                header: '**重要：用户使用的是泰语，你必须使用泰语回复。**\n\n',
                expert: 'คุณเป็นผู้เชี่ยวชาญรถยนต์มือสองในอาเซียน กรุณาตอบคำถามเป็นภาษาไทย\n\n',
                reply: 'กรุณาตอบคำถามตามข้อมูลอ้างอิงด้านบน โดยใช้ภาษาไทยที่สุภาพและเป็นมืออาชีพ\nโปรดให้คำตอบที่ชัดเจน มีโครงสร้างที่ดี และใช้ภาษาไทยเท่านั้น\n',
                general: 'กรุณาตอบคำถามในฐานะผู้เชี่ยวชาญรถยนต์มือสอง โดยใช้ภาษาไทยที่สุภาพและเป็นมืออาชีพ\nโปรดให้คำตอบที่ชัดเจน มีโครงสร้างที่ดี และใช้ภาษาไทยเท่านั้น\n'
            },
            'ms': {
                header: '**重要：用户使用的是马来语，你必须使用马来语回复。**\n\n',
                expert: 'Anda pakar kereta terpakai ASEAN. Sila jawab dalam Bahasa Melayu.\n\n',
                reply: 'Sila jawab berdasarkan maklumat rujukan di atas, menggunakan Bahasa Melayu yang sopan dan profesional.\nBerikan jawapan yang jelas, berstruktur baik, dan hanya dalam Bahasa Melayu.\n',
                general: 'Sila jawab sebagai pakar kereta terpakai, menggunakan Bahasa Melayu yang sopan dan profesional.\nBerikan jawapan yang jelas, berstruktur baik, dan hanya dalam Bahasa Melayu.\n'
            },
            'id': {
                header: '**重要：用户使用的是印尼语，你必须使用印尼语回复。**\n\n',
                expert: 'Anda ahli mobil bekas ASEAN. Sila jawab dalam Bahasa Indonesia.\n\n',
                reply: 'Silakan jawab berdasarkan informasi referensi di atas, menggunakan Bahasa Indonesia yang sopan dan profesional.\nBerikan jawaban yang jelas, terstruktur baik, dan hanya dalam Bahasa Indonesia.\n',
                general: 'Silakan jawab sebagai ahli mobil bekas, menggunakan Bahasa Indonesia yang sopan dan profesional.\nBerikan jawaban yang jelas, terstruktur baik, dan hanya dalam Bahasa Indonesia.\n'
            },
            'vi': {
                header: '**重要：用户使用的是越南语，你必须使用越南语回复。**\n\n',
                expert: 'Bạn là chuyên gia xe ô tô đã qua sử dụng ASEAN. Vui lòng trả lờ bằng tiếng Việt.\n\n',
                reply: 'Vui lòng trả lờ dựa trên thông tin tham khảo ở trên, sử dụng tiếng Việt lịch sự và chuyên nghiệp.\nHãy đưa ra câu trả lờ rõ ràng, có cấu trúc tốt, và chỉ bằng tiếng Việt.\n',
                general: 'Vui lòng trả lờ với tư cách chuyên gia xe ô tô đã qua sử dụng, sử dụng tiếng Việt lịch sự và chuyên nghiệp.\nHãy đưa ra câu trả lờ rõ ràng, có cấu trúc tốt, và chỉ bằng tiếng Việt.\n'
            },
            'ph': {
                header: '**重要：用户使用的是菲律宾语，你必须使用菲律宾语回复。**\n\n',
                expert: 'Ikaw ang eksperto sa second-hand car ng ASEAN. Pakisagot sa Tagalog/Filipino.\n\n',
                reply: 'Mangyaring sumagot batay sa impormasyon sa itaas, gamit ang magalang at propesyonal na Tagalog.\nMagbigay ng malinaw, mahusay na istruktura, at purong Tagalog na sagot.\n',
                general: 'Mangyaring sumagot bilang eksperto sa second-hand car, gamit ang magalang at propesyonal na Tagalog.\nMagbigay ng malinaw, mahusay na istruktura, at purong Tagalog na sagot.\n'
            },
            'my': {
                header: '**重要：用户使用的是缅甸语，你必须使用缅甸语回复。**\n\n',
                expert: 'သင်သည် အာဆီယံ အသုံးပြုထားသော ကားအကျွမ်းကျင်သူ ဖြစ်သည်။ မြန်မာဘာသာဖြင့် ဖြေကြားပါ။\n\n',
                reply: 'အထက်ဖော်ပြထားသော ရည်ညွှန်းချက်များအရ မြန်မာဘာသာဖြင့် လေးစားစွာနှင့် အကျွမ်းကျင်စွာ ဖြေကြားပါ။\nရှင်းလင်းသော၊ ကောင်းမွန်သော အသွင်အပြင်ဖြင့်၊ မြန်မာဘာသာသာလျှင် အသုံးပြုပါ။\n',
                general: 'အသုံးပြုထားသော ကားအကျွမ်းကျင်သူအဖြစ် မြန်မာဘာသာဖြင့် လေးစားစွာနှင့် အကျွမ်းကျင်စွာ ဖြေကြားပါ။\nရှင်းလင်းသော၊ ကောင်းမွန်သော အသွင်အပြင်ဖြင့်၊ မြန်မာဘာသာသာလျှင် အသုံးပြုပါ။\n'
            },
            'kh': {
                header: '**重要：用户使用的是高棉语，你必须使用高棉语回复。**\n\n',
                expert: 'អ្នកគឺជាអ្នកជំនាញរថយន្តប្រើប្រាស់របស់អាស៊ាន។ សូមឆ្លើយតបជាភាសាខ្មែរ។\n\n',
                reply: 'សូមឆ្លើយតបដោយផ្អែកលើព័ត៌មានយោងខាងលើ ដោយប្រើភាសាខ្មែរដែលសមរម្យនិងវិជ្ជាជីវៈ។\nផ្តល់ចម្លើយដែលច្បាស់លាស់ មានរចនាសម្ព័ន្ធល្អ និងជាភាសាខ្មែរតែប៉ុណ្ណោះ។\n',
                general: 'សូមឆ្លើយតបជាអ្នកជំនាញរថយន្តប្រើប្រាស់ ដោយប្រើភាសាខ្មែរដែលសមរម្យនិងវិជ្ជាជីវៈ។\nផ្តល់ចម្លើយដែលច្បាស់លាស់ មានរចនាសម្ព័ន្ធល្អ និងជាភាសាខ្មែរតែប៉ុណ្ណោះ។\n'
            },
            'lo': {
                header: '**重要：用户使用的是老挝语，你必须使用老挝语回复。**\n\n',
                expert: 'ທ່ານເປັນຜູ້ຊ່ຽວຊານລົດມືສອງອາຊຽນ. ກະລຸນາຕອບເປັນພາສາລາວ.\n\n',
                reply: 'ກະລຸນາຕອບຕາມຂໍ້ມູນອ້າງອີງຂ້າງເທິງ ໂດຍໃຊ້ພາສາລາວທີ່ສຸພາບ ແລະ ມືອາຊີບ.\nໃຫ້ຄຳຕອບທີ່ຊັດເຈນ, ມີໂຄງສ້າງດີ, ແລະ ເປັນພາສາລາວເທົ່ານັ້ນ.\n',
                general: 'ກະລຸນາຕອບເປັນຜູ້ຊ່ຽວຊານລົດມືສອງ ໂດຍໃຊ້ພາສາລາວທີ່ສຸພາບ ແລະ ມືອາຊີບ.\nໃຫ້ຄຳຕອບທີ່ຊັດເຈນ, ມີໂຄງສ້າງດີ, ແລະ ເປັນພາສາລາວເທົ່ານັ້ນ.\n'
            },
            'zh': {
                header: '**重要：请使用中文回复用户的问题。**\n\n',
                expert: '',
                reply: '请基于以上参考信息，结合你的知识，给出一个完整、专业、易懂的中文回答。\n回答要求：\n1. 使用中文回复\n2. 语言亲切专业\n3. 结构清晰，使用适当的分段和列表\n4. 如有必要，说明价格仅供参考，实际以车况为准\n',
                general: '请作为二手车专家，使用中文回答用户的问题。\n回答要求：\n1. 使用中文回复\n2. 语言亲切专业\n3. 结构清晰，使用适当的分段和列表\n4. 如果涉及价格，请给出合理的价格区间\n'
            }
        };
        
        const lang = languageInstructions[userLanguage] || languageInstructions['zh'];
        prompt += lang.header;
        if (lang.expert) prompt += lang.expert;

        // 如果有本地匹配结果（即使置信度不高），作为参考
        if (localResult.found && localResult.allMatches) {
            prompt += '以下是从知识库中找到的相关信息，供你参考：\n\n';
            
            localResult.allMatches.slice(0, CONFIG.MAX_LOCAL_MATCHES).forEach((match, index) => {
                prompt += `参考${index + 1}：\n`;
                prompt += `${match.answer}\n\n`;
            });
            
            prompt += lang.reply;
        } else {
            // 完全没有本地匹配
            prompt += lang.general;
        }

        return prompt;
    }

    /**
     * 纯本地模式处理
     */
    processLocalOnly(userMessage) {
        const startTime = performance.now();
        const result = this.localDB.getBestAnswer(userMessage);
        const processingTime = Math.round(performance.now() - startTime);

        return {
            success: result.found,
            answer: result.answer,
            source: 'local',
            confidence: result.confidence,
            processingTime: processingTime,
            matchedId: result.matchedId,
            category: result.category,
            recommendations: result.matchedId ? 
                this.localDB.getRecommendations(result.matchedId, CONFIG.MAX_RECOMMENDATIONS) : [],
            isEnhanced: false,
            language: result.language
        };
    }

    /**
     * 获取本地数据库统计
     */
    getLocalDBStats() {
        return this.localDB.getStats();
    }

    /**
     * 搜索本地数据库（用于调试）
     */
    searchLocalDB(query, topK = 5) {
        return this.localDB.search(query, topK);
    }
}

export default HybridAIService;
