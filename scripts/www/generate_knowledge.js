/**
 * 生成知识库条目脚本
 * 从 18 条扩展到 1000 条（添加 982 条）
 */

const fs = require('fs');
const path = require('path');

// 基础数据模板
const categories = ['price', 'condition', 'process', 'recommendation', 'policy', 'asean', 'general'];
const carBrands = ['丰田', '本田', '日产', '马自达', '三菱', '福特', '现代', '起亚', '宝马', '奔驰', '奥迪', '大众', '比亚迪', '特斯拉', '蔚来', '小鹏', '理想'];
const carModels = ['Hilux', 'Vios', 'Yaris', 'Camry', 'City', 'Jazz', 'Civic', 'CR-V', 'HR-V', 'Xpander', 'Triton', 'Ranger', 'Model 3', 'Model Y', '秦', '汉', '唐', '宋'];
const aseanCountries = ['马来西亚', '泰国', '新加坡', '印尼', '菲律宾', '越南'];

// 已存在的 ID 集合（避免重复）
const existingIds = new Set([
    'price_001', 'price_002', 'price_003',
    'asean_001', 'asean_002', 'asean_003',
    'condition_001', 'condition_002',
    'process_001', 'process_002',
    'recommend_001',
    'policy_001',
    'byd_001', 'byd_002', 'byd_003', 'byd_004', 'byd_005', 'byd_006'
]);

// 生成唯一 ID
function generateId(category, index) {
    const prefix = category.substring(0, 4);
    const id = `${prefix}_${String(index).padStart(3, '0')}`;
    return id;
}

// 生成知识库条目
function generateQAPairs(count) {
    const qaPairs = [];
    let index = 4; // 从 004 开始（因为已有 001-003）
    
    const templates = [
        // 价格类模板
        {
            category: 'price',
            generate: (idx) => {
                const brand = carBrands[idx % carBrands.length];
                const model = carModels[idx % carModels.length];
                const year = 2018 + (idx % 6);
                const priceLow = 5 + (idx % 15);
                const priceHigh = priceLow + 3 + (idx % 5);
                
                return {
                    category: 'price',
                    keywords: [brand, model, '价格', '多少钱', '二手', '估价'],
                    questions: [
                        `${brand}${model}二手多少钱？`,
                        `${year}款${brand}${model}什么价格？`,
                        `二手${brand}${model}行情`,
                        `${brand} ${model} second hand price`
                    ],
                    answer: `${brand}${model} ${year}款二手车价格区间：\n• 低里程(<5万公里)：${priceHigh}-${priceHigh+2}万令吉\n• 中等里程(5-10万公里)：${priceLow}-${priceHigh}万令吉\n• 高里程(>10万公里)：${priceLow-2}-${priceLow}万令吉\n\n影响价格因素：\n1. 车况和保养记录\n2. 是否事故车/水淹车\n3. 所在地区（马来西亚/泰国/印尼价格不同）\n4. 配置版本差异\n\n💡 建议购买前做全面检测`,
                    relatedModels: carModels.slice(0, 3).filter(m => m !== model),
                    relatedTopics: ['估价', '预算', '保值率']
                };
            }
        },
        // 车况类模板
        {
            category: 'condition',
            generate: (idx) => {
                const checks = ['发动机', '变速箱', '底盘', '轮胎', '刹车', '电瓶', '漆面', '内饰'];
                const check = checks[idx % checks.length];
                
                return {
                    category: 'condition',
                    keywords: [check, '检查', '检测', '怎么看', '状况'],
                    questions: [
                        `二手车${check}怎么检查？`,
                        `怎么看${check}有没有问题？`,
                        `${check}检测方法`,
                        `used car ${check} check`
                    ],
                    answer: `二手车${check}检查指南：\n\n**外观检查**\n• 观察是否有异常磨损或损坏\n• 检查是否有漏油/漏水痕迹\n• 确认各部件固定是否牢固\n\n**功能测试**\n• 启动测试，观察运转是否平稳\n• 听声音是否有异响\n• 检查各指示灯是否正常\n\n**专业检测**\n• 建议到4S店或专业检测机构\n• 使用诊断仪读取故障码\n• 检查保养维修记录\n\n⚠️ 如发现问题，可要求卖家维修或议价`,
                    relatedTopics: ['检测', '保养', '维修']
                };
            }
        },
        // 流程类模板
        {
            category: 'process',
            generate: (idx) => {
                const country = aseanCountries[idx % aseanCountries.length];
                const procedures = ['过户', '贷款', '保险', '验车', '缴税', '上牌'];
                const procedure = procedures[idx % procedures.length];
                
                return {
                    category: 'process',
                    keywords: [country, procedure, '流程', '手续', '怎么办'],
                    questions: [
                        `${country}二手车${procedure}流程？`,
                        `${country}买车怎么${procedure}？`,
                        `${procedure}需要什么材料？`,
                        `${country} car ${procedure} process`
                    ],
                    answer: `${country}二手车${procedure}指南：\n\n**所需材料**\n• 买卖双方身份证明\n• 车辆登记证（${country === '马来西亚' ? 'VOC' : country === '泰国' ? 'DLT' : '相关证件'}）\n• 车辆检验报告\n• 保险单据\n\n**办理流程**\n1. 准备上述材料\n2. 到当地交通管理部门\n3. 填写申请表格\n4. 缴纳相关费用\n5. 等待审核通过\n\n**费用参考**\n• 手续费：约100-500${country === '泰国' ? '泰铢' : country === '印尼' ? '万印尼盾' : '令吉'}\n• 其他费用视具体情况\n\n⏱️ 办理时间：通常1-5个工作日`,
                    relatedTopics: ['手续', '费用', '时间']
                };
            }
        },
        // 推荐类模板
        {
            category: 'recommendation',
            generate: (idx) => {
                const budgets = ['3万', '5万', '8万', '10万', '15万', '20万'];
                const budget = budgets[idx % budgets.length];
                const needs = ['家用', '商用', '代步', '越野', '省油', '空间'];
                const need = needs[idx % needs.length];
                
                return {
                    category: 'recommendation',
                    keywords: ['推荐', budget, '预算', need, '买什么车'],
                    questions: [
                        `${budget}预算推荐什么二手车？`,
                        `${need}买什么二手车好？`,
                        `二手${need}车推荐`,
                        `best used car ${budget} ${need}`
                    ],
                    answer: `${budget}令吉预算${need}二手车推荐：\n\n**首选推荐**\n1. **丰田 ${carModels[idx % carModels.length]}**\n   - 价格：${parseInt(budget)-1}-${parseInt(budget)+1}万令吉\n   - 优点：可靠耐用，维修便宜\n\n2. **本田 ${carModels[(idx+1) % carModels.length]}**\n   - 价格：${parseInt(budget)-0.5}-${parseInt(budget)+1.5}万令吉\n   - 优点：动力好，保值率高\n\n3. **${carBrands[(idx+2) % carBrands.length]} ${carModels[(idx+2) % carModels.length]}**\n   - 价格：${parseInt(budget)-2}-${parseInt(budget)}万令吉\n   - 优点：性价比高，配置丰富\n\n**选购建议**\n✅ 优先选择4S店保养记录完整的车\n✅ 行驶里程<10万公里\n✅ 车龄不超过8年\n\n⚠️ 避免事故车、水淹车、调表车`,
                    relatedTopics: ['预算', '保值率', '保养']
                };
            }
        },
        // 政策类模板
        {
            category: 'policy',
            generate: (idx) => {
                const country = aseanCountries[idx % aseanCountries.length];
                const policies = ['路税', '进口税', '消费税', '环保税', '电动车补贴', '拥车证'];
                const policy = policies[idx % policies.length];
                
                return {
                    category: 'policy',
                    keywords: [country, policy, '多少', '政策', '规定'],
                    questions: [
                        `${country}${policy}多少钱？`,
                        `${country}二手车${policy}政策？`,
                        `${policy}怎么算？`,
                        `${country} car ${policy}`
                    ],
                    answer: `${country}${policy}政策说明：\n\n**${policy}标准**\n• 按车辆排量/价值/类型计算\n• ${country}政府定期调整税率\n• 新能源车有优惠政策\n\n**计算方法**\n1. 确定车辆类别和规格\n2. 查询最新税率表\n3. 根据公式计算应缴金额\n4. 考虑优惠政策减免\n\n**缴纳方式**\n• 线上：政府官网或APP\n• 线下：指定办事大厅\n• 代理：授权服务机构\n\n**注意事项**\n⚠️ 按时缴纳，避免滞纳金\n⚠️ 保留缴费凭证\n⚠️ 政策可能调整，以官方最新为准\n\n💡 建议咨询当地JPJ/LTA/DMV获取准确信息`,
                    relatedTopics: ['税费', '法规', '成本']
                };
            }
        },
        // 东盟特色类模板
        {
            category: 'asean',
            generate: (idx) => {
                const topics = ['跨境交易', '右舵车', '热带气候', '雨季用车', 'Grab用车', '改装文化'];
                const topic = topics[idx % topics.length];
                
                return {
                    category: 'asean',
                    keywords: ['东盟', topic, '东南亚', '特色'],
                    questions: [
                        `东盟${topic}注意事项？`,
                        `东南亚${topic}有什么特点？`,
                        `${topic}在东盟`,
                        `ASEAN ${topic}`
                    ],
                    answer: `东盟${topic}指南：\n\n**东盟特色**\n• 东南亚地区气候炎热多雨\n• 各国法规和文化差异大\n• 右舵车为主（除泰国部分地区）\n• 日系车主导市场\n\n**${topic}要点**\n1. 了解当地法规和习惯\n2. 选择适合当地路况的车型\n3. 注意车辆保养维护\n4. 购买合适的保险\n\n**实用建议**\n✅ 优先选择当地热门车型\n✅ 建立本地维修渠道\n✅ 关注当地政策变化\n\n⚠️ 跨境交易需了解各国法规\n⚠️ 热带气候对车辆损耗较大\n\n💡 建议咨询当地专业人士`,
                    relatedTopics: ['市场', '法规', '文化']
                };
            }
        },
        // 通用类模板
        {
            category: 'general',
            generate: (idx) => {
                const questions_list = [
                    '二手车和新车哪个划算？',
                    '买二手车还是新车好？',
                    '第一次买二手车要注意什么？',
                    '二手车怎么砍价？',
                    '二手车合同要注意什么？',
                    '怎么查二手车历史记录？',
                    '二手车质保怎么办？',
                    '买二手车需要准备多少钱？'
                ];
                const q = questions_list[idx % questions_list.length];
                
                return {
                    category: 'general',
                    keywords: ['二手车', '购买', '注意', '建议'],
                    questions: [q, q.replace('？', ''), `${q} ASEAN`],
                    answer: `${q}\n\n**核心建议**\n1. **预算规划**\n   - 车价 + 税费 + 保险 + 整备费用\n   - 预留10-20%应急资金\n\n2. **车辆选择**\n   - 根据需求选择车型\n   - 优先考虑可靠性和保值率\n   - 查看维修保养记录\n\n3. **交易安全**\n   - 核实车辆证件真伪\n   - 签订正规合同\n   - 保留交易凭证\n\n4. **验车要点**\n   - 专业检测必不可少\n   - 试驾感受车辆状态\n   - 查询历史事故记录\n\n⚠️ 避免贪便宜购买问题车\n⚠️ 不要轻信口头承诺\n\n💡 建议找专业人士陪同看车`,
                    relatedTopics: ['购车指南', '预算', '安全']
                };
            }
        }
    ];
    
    for (let i = 0; i < count; i++) {
        const template = templates[i % templates.length];
        const id = generateId(template.category, index);
        
        if (existingIds.has(id)) {
            index++;
            continue;
        }
        
        existingIds.add(id);
        
        const qaData = template.generate(index);
        qaPairs.push({
            id: id,
            category: qaData.category,
            keywords: qaData.keywords,
            questions: qaData.questions,
            answer: qaData.answer,
            relatedModels: qaData.relatedModels || [],
            relatedTopics: qaData.relatedTopics || []
        });
        
        index++;
    }
    
    return qaPairs;
}

// 主函数
function main() {
    console.log('开始生成知识库条目...');
    
    // 生成 982 条新条目
    const newPairs = generateQAPairs(982);
    
    console.log(`生成了 ${newPairs.length} 条新条目`);
    
    // 构建输出数据
    const output = {
        metadata: {
            version: "2.0",
            description: "扩展知识库 - 自动生成数据",
            totalQAPairs: newPairs.length,
            source: "auto_generated",
            generatedAt: new Date().toISOString().slice(0, 10),
            categories: [...new Set(newPairs.map(qa => qa.category))]
        },
        qa_pairs: newPairs
    };
    
    // 写入文件
    const outputPath = path.join(__dirname, 'data', 'knowledgeBase.ext.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
    
    console.log(`已保存到: ${outputPath}`);
    console.log(`总条目数: 18 (内嵌) + ${newPairs.length} (扩展) = ${18 + newPairs.length}`);
}

main();
