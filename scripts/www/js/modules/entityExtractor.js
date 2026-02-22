/**
 * 实体提取模块
 * 从用户输入中提取关键实体信息
 */

import { ENTITIES, CAR_BRANDS, CAR_MODELS, LOCATIONS } from '../config/constants.js?v=2';

export class EntityExtractor {
    constructor() {
        this.brands = CAR_BRANDS;
        this.models = CAR_MODELS;
        this.locations = LOCATIONS;
        
        // 编译正则表达式
        this.patterns = {
            [ENTITIES.YEAR]: /(20\d{2})\s*年?/g,
            [ENTITIES.MILEAGE]: /(\d+\.?\d*)\s*(万|w)?\s*公里?/gi,
            [ENTITIES.PRICE]: /(\d+\.?\d*)\s*(万|w|元)?/g,
            [ENTITIES.CONDITION]: /(新车|准新|二手|旧车|事故|泡水|火烧)/g
        };
    }

    /**
     * 提取所有实体
     * @param {string} text - 用户输入文本
     * @returns {Object} - 提取的实体 {brand, model, year, mileage, price, location, condition}
     */
    extract(text) {
        const startTime = performance.now();
        
        const entities = {
            [ENTITIES.BRAND]: this._extractBrand(text),
            [ENTITIES.MODEL]: this._extractModel(text),
            [ENTITIES.YEAR]: this._extractYear(text),
            [ENTITIES.MILEAGE]: this._extractMileage(text),
            [ENTITIES.PRICE]: this._extractPrice(text),
            [ENTITIES.LOCATION]: this._extractLocation(text),
            [ENTITIES.CONDITION]: this._extractCondition(text)
        };
        
        // 过滤掉null值
        const validEntities = Object.fromEntries(
            Object.entries(entities).filter(([_, value]) => value !== null)
        );
        
        const latency = performance.now() - startTime;
        
        return {
            entities: validEntities,
            allEntities: entities,
            entityCount: Object.keys(validEntities).length,
            latency: Math.round(latency),
            rawText: text
        };
    }

    /**
     * 提取品牌
     */
    _extractBrand(text) {
        for (const brand of this.brands) {
            if (text.includes(brand)) {
                return {
                    value: brand,
                    type: ENTITIES.BRAND,
                    confidence: 1.0,
                    method: 'dictionary'
                };
            }
        }
        
        // 尝试模糊匹配
        for (const brand of this.brands) {
            if (this._fuzzyMatch(text, brand)) {
                return {
                    value: brand,
                    type: ENTITIES.BRAND,
                    confidence: 0.7,
                    method: 'fuzzy'
                };
            }
        }
        
        return null;
    }

    /**
     * 提取车型
     */
    _extractModel(text) {
        // 先确定品牌，再匹配该品牌下的车型
        let detectedBrand = null;
        for (const brand of this.brands) {
            if (text.includes(brand)) {
                detectedBrand = brand;
                break;
            }
        }
        
        // 如果检测到品牌，优先匹配该品牌的车型
        if (detectedBrand && this.models[detectedBrand]) {
            for (const model of this.models[detectedBrand]) {
                if (text.includes(model)) {
                    return {
                        value: model,
                        type: ENTITIES.MODEL,
                        brand: detectedBrand,
                        confidence: 1.0,
                        method: 'brand_specific'
                    };
                }
            }
        }
        
        // 通用车型匹配
        const genericModels = ['SUV', '轿车', '跑车', 'MPV', '两厢', '三厢'];
        for (const model of genericModels) {
            if (text.includes(model)) {
                return {
                    value: model,
                    type: ENTITIES.MODEL,
                    confidence: 0.8,
                    method: 'generic'
                };
            }
        }
        
        return null;
    }

    /**
     * 提取年份
     */
    _extractYear(text) {
        const match = text.match(this.patterns[ENTITIES.YEAR]);
        if (match) {
            const year = parseInt(match[0].replace(/年/g, ''));
            const currentYear = new Date().getFullYear();
            
            // 验证年份合理性
            if (year >= 2000 && year <= currentYear + 1) {
                return {
                    value: year,
                    type: ENTITIES.YEAR,
                    confidence: 1.0,
                    method: 'regex',
                    raw: match[0]
                };
            }
        }
        
        return null;
    }

    /**
     * 提取里程
     */
    _extractMileage(text) {
        const matches = [...text.matchAll(this.patterns[ENTITIES.MILEAGE])];
        
        for (const match of matches) {
            let value = parseFloat(match[1]);
            const unit = match[2];
            
            // 处理"万"单位
            if (unit === '万' || unit === 'w') {
                value *= 10000;
            }
            
            // 验证合理性（0-100万公里）
            if (value >= 0 && value <= 1000000) {
                return {
                    value: value,
                    displayValue: value >= 10000 ? `${(value/10000).toFixed(1)}万公里` : `${value}公里`,
                    type: ENTITIES.MILEAGE,
                    confidence: 1.0,
                    method: 'regex',
                    raw: match[0]
                };
            }
        }
        
        return null;
    }

    /**
     * 提取价格
     */
    _extractPrice(text) {
        const matches = [...text.matchAll(this.patterns[ENTITIES.PRICE])];
        
        for (const match of matches) {
            let value = parseFloat(match[1]);
            const unit = match[2];
            
            // 处理单位
            if (unit === '万' || unit === 'w') {
                value *= 10000;
            }
            
            // 验证合理性（1000元-1000万）
            if (value >= 1000 && value <= 10000000) {
                return {
                    value: value,
                    displayValue: value >= 10000 ? `${(value/10000).toFixed(1)}万` : `${value}元`,
                    type: ENTITIES.PRICE,
                    confidence: 0.9,
                    method: 'regex',
                    raw: match[0]
                };
            }
        }
        
        return null;
    }

    /**
     * 提取地区
     */
    _extractLocation(text) {
        for (const location of this.locations) {
            if (text.includes(location)) {
                return {
                    value: location,
                    type: ENTITIES.LOCATION,
                    confidence: 1.0,
                    method: 'dictionary'
                };
            }
        }
        
        return null;
    }

    /**
     * 提取车况
     */
    _extractCondition(text) {
        const match = text.match(this.patterns[ENTITIES.CONDITION]);
        if (match) {
            const conditionMap = {
                '新车': 'new',
                '准新': 'like_new',
                '二手': 'used',
                '旧车': 'old',
                '事故': 'accident',
                '泡水': 'flood',
                '火烧': 'fire'
            };
            
            return {
                value: conditionMap[match[0]] || match[0],
                displayValue: match[0],
                type: ENTITIES.CONDITION,
                confidence: 1.0,
                method: 'regex',
                raw: match[0]
            };
        }
        
        return null;
    }

    /**
     * 模糊匹配
     */
    _fuzzyMatch(text, keyword) {
        // 简化的模糊匹配
        if (keyword.length < 2) return false;
        
        // 检查是否包含关键词的大部分字符
        let matchCount = 0;
        for (const char of keyword) {
            if (text.includes(char)) {
                matchCount++;
            }
        }
        
        return matchCount / keyword.length >= 0.7;
    }

    /**
     * 检查实体完整性
     */
    checkCompleteness(entities, requiredEntities = []) {
        const missing = [];
        
        for (const entity of requiredEntities) {
            if (!entities[entity]) {
                missing.push(entity);
            }
        }
        
        return {
            isComplete: missing.length === 0,
            missing: missing,
            completeness: ((requiredEntities.length - missing.length) / requiredEntities.length * 100).toFixed(0)
        };
    }

    /**
     * 生成实体展示HTML
     */
    generateEntityTags(entities) {
        const entityConfig = {
            [ENTITIES.BRAND]: { icon: 'fa-car', color: 'blue', label: '品牌' },
            [ENTITIES.MODEL]: { icon: 'fa-tag', color: 'pink', label: '车型' },
            [ENTITIES.YEAR]: { icon: 'fa-calendar', color: 'green', label: '年份' },
            [ENTITIES.MILEAGE]: { icon: 'fa-tachometer-alt', color: 'yellow', label: '里程' },
            [ENTITIES.PRICE]: { icon: 'fa-yen-sign', color: 'indigo', label: '价格' },
            [ENTITIES.LOCATION]: { icon: 'fa-map-marker-alt', color: 'red', label: '地区' },
            [ENTITIES.CONDITION]: { icon: 'fa-info-circle', color: 'gray', label: '车况' }
        };
        
        return Object.entries(entities).map(([type, data]) => {
            const config = entityConfig[type] || { icon: 'fa-circle', color: 'gray', label: type };
            const displayValue = data.displayValue || data.value;
            
            return `<span class="entity-tag ${config.color}">
                <i class="fas ${config.icon}"></i>
                ${config.label}: ${displayValue}
            </span>`;
        }).join('');
    }

    /**
     * 批量测试实体提取
     */
    batchTest(testCases) {
        const results = [];
        
        for (const testCase of testCases) {
            const result = this.extract(testCase.text);
            
            // 检查是否提取到预期的实体
            const expectedEntities = testCase.expectedEntities || {};
            const accuracy = this._calculateEntityAccuracy(result.entities, expectedEntities);
            
            results.push({
                input: testCase.text,
                extracted: result.entities,
                expected: expectedEntities,
                accuracy: accuracy,
                latency: result.latency
            });
        }
        
        const avgAccuracy = (results.reduce((sum, r) => sum + r.accuracy, 0) / results.length).toFixed(2);
        const avgLatency = (results.reduce((sum, r) => sum + r.latency, 0) / results.length).toFixed(2);
        
        return {
            results,
            summary: {
                total: results.length,
                avgAccuracy: `${avgAccuracy}%`,
                avgLatency: `${avgLatency}ms`
            }
        };
    }

    /**
     * 计算实体提取准确率
     */
    _calculateEntityAccuracy(extracted, expected) {
        const expectedKeys = Object.keys(expected);
        if (expectedKeys.length === 0) return 100;
        
        let correct = 0;
        for (const key of expectedKeys) {
            if (extracted[key] && extracted[key].value === expected[key]) {
                correct++;
            }
        }
        
        return (correct / expectedKeys.length * 100);
    }
}

export default EntityExtractor;
