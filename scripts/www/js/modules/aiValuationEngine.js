/**
 * ASEAN NEV Insight - AI Valuation Engine
 * AI估价引擎 - 支持依赖注入，便于测试
 */

import { BATTERY_FACTORS, CONDITION_FACTORS } from '../config/constants.js';
import { calculateYearDepreciation, calculateMileageDepreciation, wait } from '../utils/helpers.js';

/**
 * 验证错误类
 */
export class ValidationError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = 'ValidationError';
  }
}

/**
 * AI估价引擎
 */
export class AIValuationEngine {
  /**
   * @param {Object} options - 配置选项
   * @param {Object} options.dataManager - 数据管理器实例
   * @param {number} options.delay - 模拟AI计算延迟（毫秒），测试时可设为0
   * @param {Function} options.randomGenerator - 随机数生成器，默认为 Math.random
   * @param {Function} options.timeProvider - 时间提供器，默认为 Date
   */
  constructor(options = {}) {
    this.dataManager = options.dataManager || null;
    this.delay = options.delay ?? 1500;
    this.randomGenerator = options.randomGenerator || Math.random;
    this.timeProvider = options.timeProvider || Date;
  }

  /**
   * 初始化（兼容旧代码）
   * @param {Object} dataManager - 数据管理器
   * @returns {AIValuationEngine}
   */
  init(dataManager) {
    this.dataManager = dataManager;
    return this;
  }

  /**
   * 执行估价
   * @param {Object} params - 估价参数
   * @param {string} params.brand - 品牌
   * @param {string} params.model - 车型
   * @param {number} params.year - 年份
   * @param {number} params.mileage - 里程（万公里）
   * @param {number} params.batteryHealth - 电池健康度
   * @param {string} params.condition - 车况
   * @param {string} params.country - 国家代码
   * @returns {Promise<Object>} 估价结果
   */
  async calculate(params) {
    // 验证输入
    this.validateParams(params);
    
    // 模拟AI计算延迟（测试时可设为0）
    if (this.delay > 0) {
      await wait(this.delay);
    }
    
    return this.performCalculation(params);
  }

  /**
   * 验证参数
   * @param {Object} params - 参数对象
   */
  validateParams(params) {
    const required = ['brand', 'model', 'year', 'mileage', 'batteryHealth', 'condition', 'country'];
    const missing = required.filter(key => params[key] === undefined || params[key] === null);
    
    if (missing.length > 0) {
      throw new ValidationError('MISSING_PARAMS', `缺少必填参数: ${missing.join(', ')}`);
    }
    
    if (params.mileage < 0 || params.mileage > 100) {
      throw new ValidationError('INVALID_MILEAGE', '里程必须在 0-100 万公里之间');
    }
    
    if (params.batteryHealth < 0 || params.batteryHealth > 100) {
      throw new ValidationError('INVALID_BATTERY', '电池健康度必须在 0-100 之间');
    }
  }

  /**
   * 执行计算（可独立测试）
   * @param {Object} params - 估价参数
   * @returns {Object} 估价结果
   */
  performCalculation(params) {
    const { brand, model, year, mileage, batteryHealth, condition, country } = params;

    // 1. 获取基础价格
    const basePrice = this.dataManager?.getBasePrice(brand, model, country);
    if (!basePrice) {
      throw new ValidationError('MODEL_NOT_FOUND', '无法获取该车型基础价格');
    }

    // 2. 获取折旧率
    const retentionRates = this.dataManager?.getRetentionRates(brand, model) || {
      y1: 0.85, y2: 0.75, y3: 0.65
    };

    // 3. 计算各项因子
    const factors = this.calculateAllFactors({
      year: parseInt(year, 10),
      mileage: parseFloat(mileage),
      batteryHealth: parseInt(batteryHealth, 10),
      condition,
      country,
      brand,
      model,
      retentionRates
    });

    // 4. 综合计算
    const depreciationFactor = factors.yearFactor * factors.mileageFactor * factors.batteryFactor;
    const adjustedPrice = basePrice * depreciationFactor * factors.conditionFactor 
      * factors.marketFactor * factors.policyFactor;

    // 5. 计算可信度
    const confidence = this.calculateConfidence({
      year: parseInt(year, 10),
      mileage: parseFloat(mileage),
      batteryHealth: parseInt(batteryHealth, 10)
    });

    // 6. 计算价格区间
    const range = [
      adjustedPrice * (1 - (1 - confidence) * 0.5),
      adjustedPrice * (1 + (1 - confidence) * 0.5)
    ];

    // 7. 生成AI分析
    const analysis = this.generateAnalysis(params, factors);

    return {
      price: Math.round(adjustedPrice),
      range: range.map(r => Math.round(r)),
      basePrice,
      confidence: Math.round(confidence * 100),
      factors: {
        depreciation: Math.round((1 - depreciationFactor) * 100),
        battery: batteryHealth,
        condition: CONDITION_FACTORS[condition]?.label || '良好',
        market: factors.marketFactor > 1 ? 'up' : factors.marketFactor < 1 ? 'down' : 'stable'
      },
      analysis,
      timestamp: new Date(this.timeProvider.now()).toISOString()
    };
  }

  /**
   * 计算所有因子
   * @param {Object} inputs - 输入参数
   * @returns {Object} 各项因子
   */
  calculateAllFactors(inputs) {
    return {
      yearFactor: calculateYearDepreciation(inputs.year, inputs.retentionRates, {
        now: () => this.timeProvider.now()
      }),
      mileageFactor: calculateMileageDepreciation(inputs.mileage),
      batteryFactor: (BATTERY_FACTORS[inputs.batteryHealth] || BATTERY_FACTORS[80]).factor,
      conditionFactor: (CONDITION_FACTORS[inputs.condition] || CONDITION_FACTORS.good).factor,
      marketFactor: this.calculateMarketFactor(inputs.model, inputs.country),
      policyFactor: this.calculatePolicyFactor(inputs.country, inputs.brand)
    };
  }

  /**
   * 计算市场因子
   * @param {string} model - 车型ID
   * @param {string} country - 国家代码
   * @returns {number} 市场因子
   */
  calculateMarketFactor(model, country) {
    const hotModels = ['atto3', 'model3', 'modely', 'zsev'];
    const baseFactor = 1.0;
    
    // 热门车型加价（使用注入的随机数生成器）
    if (hotModels.includes(model)) {
      return baseFactor * (1 + this.randomGenerator() * 0.05);
    }
    
    // 市场波动（使用注入的随机数生成器）
    const marketVolatility = (this.randomGenerator() - 0.5) * 0.06;
    return baseFactor + marketVolatility;
  }

  /**
   * 计算政策因子
   * @param {string} country - 国家代码
   * @param {string} brand - 品牌
   * @returns {number} 政策因子
   */
  calculatePolicyFactor(country, brand) {
    // 不同国家的政策影响
    const policyFactors = {
      th: 1.02,  // 泰国EV政策友好
      vn: 1.03,  // 越南零关税
      id: 1.01,  // 印尼本地生产优惠
      my: 1.02,  // 马来西亚免税
      sg: 1.00,  // 新加坡VES
      ph: 1.02,  // 菲律宾零关税
      mm: 0.98,  // 缅甸市场不成熟
      kh: 1.01,  // 柬埔寨免税
      la: 0.99,  // 老挝初期
      bn: 1.00   // 文莱小市场
    };
    
    return policyFactors[country] || 1.0;
  }

  /**
   * 计算可信度
   * @param {Object} params - 参数
   * @param {number} params.year - 年份
   * @param {number} params.mileage - 里程
   * @param {number} params.batteryHealth - 电池健康度
   * @returns {number} 可信度 (0-1)
   */
  calculateConfidence({ year, mileage, batteryHealth }) {
    const currentYear = new Date(this.timeProvider.now()).getFullYear();
    const age = currentYear - year;
    
    let confidence = 0.9;
    
    // 年份影响
    if (age > 5) confidence -= 0.1;
    if (age > 8) confidence -= 0.1;
    
    // 里程影响
    if (mileage > 10) confidence -= 0.05;
    if (mileage > 20) confidence -= 0.1;
    
    // 电池健康影响
    if (batteryHealth < 70) confidence -= 0.1;
    
    return Math.max(0.6, confidence);
  }

  /**
   * 生成AI分析
   * @param {Object} params - 估价参数
   * @param {Object} factors - 计算因子
   * @returns {string} 分析文本
   */
  generateAnalysis(params, factors) {
    const { year, condition, batteryHealth } = params;
    const currentYear = new Date(this.timeProvider.now()).getFullYear();
    const age = currentYear - year;
    
    const analyses = [];
    
    // 车况分析
    if (condition === 'excellent') {
      analyses.push('车况优秀，无明显磨损，可获得最佳售价');
    } else if (condition === 'poor') {
      analyses.push('车况一般，建议适当维修后再出售');
    }
    
    // 电池分析
    if (batteryHealth >= 90) {
      analyses.push('电池健康度优秀，对价格影响较小');
    } else if (batteryHealth < 70) {
      analyses.push('电池健康度较低，可能影响买家意愿');
    }
    
    // 年限分析
    if (age <= 1) {
      analyses.push('准新车，保值率高');
    } else if (age >= 5) {
      analyses.push(`车龄${age}年，建议尽快出售以减少进一步折旧`);
    }
    
    // 市场建议
    if (factors.marketFactor > 1.02) {
      analyses.push('当前市场需求旺盛，是出售的好时机');
    } else if (factors.marketFactor < 0.98) {
      analyses.push('市场较冷淡，如不急需可等待更好时机');
    }
    
    return analyses.join('；') || '综合分析显示车辆状态良好，建议按估价范围出售。';
  }
}
