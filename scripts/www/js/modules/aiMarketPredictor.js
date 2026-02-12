/**
 * ASEAN NEV Insight - AI Market Predictor
 * AI市场预测模块 - 支持依赖注入，便于测试
 */

import { generatePredictionData, wait } from '../utils/helpers.js';

/**
 * AI市场预测器
 */
export class AIMarketPredictor {
  /**
   * @param {Object} options - 配置选项
   * @param {number} options.delay - 模拟延迟（毫秒），测试时可设为0
   * @param {Function} options.randomGenerator - 随机数生成器，默认为 Math.random
   * @param {Function} options.timeProvider - 时间提供器，默认为 Date
   * @param {Function} options.dataProvider - 数据提供器
   */
  constructor(options = {}) {
    this.delay = options.delay ?? 2000;
    this.randomGenerator = options.randomGenerator || Math.random;
    this.timeProvider = options.timeProvider || Date;
    this.dataProvider = options.dataProvider || null;
    this.cache = new Map();
  }

  /**
   * 预测车型价格走势
   * @param {string} modelId - 车型ID
   * @param {string} countryCode - 国家代码
   * @param {number} months - 预测月数
   * @returns {Promise<Object>} 预测结果
   */
  async predict(modelId, countryCode, months = 3) {
    // 验证输入
    if (!modelId || typeof modelId !== 'string') {
      throw new Error('车型ID不能为空');
    }
    
    // 模拟AI计算延迟（测试时可设为0）
    if (this.delay > 0) {
      await wait(this.delay);
    }
    
    return this.generatePrediction(modelId, countryCode, months);
  }

  /**
   * 生成预测数据（可独立测试）
   * @param {string} modelId - 车型ID
   * @param {string} countryCode - 国家代码
   * @param {number} months - 预测月数
   * @returns {Object} 预测结果
   */
  generatePrediction(modelId, countryCode, months) {
    // 生成历史数据（最近12个月）
    const basePrice = this.getBasePrice(modelId, countryCode) || 1200000;
    const historical = this.generateHistoricalData(basePrice, 12);
    
    // 确定趋势
    const lastPrice = historical[historical.length - 1].value;
    const avgPrice = historical.reduce((a, b) => a + b.value, 0) / historical.length;
    const trend = this.determineTrend(lastPrice, avgPrice);
    
    // 生成预测
    const predictions = this.generatePredictionData(historical, months, trend);
    
    // 合并历史和预测
    const combined = [...historical, ...predictions];
    
    // 计算预测统计数据
    const finalPrice = predictions[predictions.length - 1].value;
    const changePercent = ((finalPrice - lastPrice) / lastPrice * 100);
    
    // 生成影响因素
    const factors = this.generateFactors(countryCode, trend);
    
    // 生成建议
    const recommendation = this.generateRecommendation(trend, changePercent);
    
    return {
      historical,
      predictions,
      combined,
      trend,
      changePercent: parseFloat(changePercent.toFixed(1)),
      currentPrice: Math.round(lastPrice),
      predictedPrice: Math.round(finalPrice),
      confidence: Math.round(75 + this.randomGenerator() * 15),
      factors,
      recommendation,
      timestamp: new Date(this.timeProvider.now()).toISOString()
    };
  }

  /**
   * 获取基础价格（可从数据提供器获取）
   * @param {string} modelId - 车型ID
   * @param {string} countryCode - 国家代码
   * @returns {number|null} 基础价格
   */
  getBasePrice(modelId, countryCode) {
    if (this.dataProvider?.getBasePrice) {
      return this.dataProvider.getBasePrice(modelId, countryCode);
    }
    return null;
  }

  /**
   * 生成历史数据
   * @param {number} basePrice - 基础价格
   * @param {number} months - 月数
   * @returns {Array} 历史数据
   */
  generateHistoricalData(basePrice, months) {
    const data = [];
    let currentValue = basePrice;
    const now = new Date(this.timeProvider.now());
    
    for (let i = months; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      
      const change = (this.randomGenerator() - 0.5) * 0.1;
      currentValue = currentValue * (1 + change);
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(currentValue)
      });
    }
    
    return data;
  }

  /**
   * 确定趋势
   * @param {number} lastPrice - 最新价格
   * @param {number} avgPrice - 平均价格
   * @returns {string} 趋势 (up/down/stable)
   */
  determineTrend(lastPrice, avgPrice) {
    if (lastPrice > avgPrice * 1.02) return 'up';
    if (lastPrice < avgPrice * 0.98) return 'down';
    return 'stable';
  }

  /**
   * 生成预测数据
   * @param {Array} historical - 历史数据
   * @param {number} months - 预测月数
   * @param {string} trend - 趋势
   * @returns {Array} 预测数据
   */
  generatePredictionData(historical, months, trend) {
    const predictions = [];
    let lastValue = historical[historical.length - 1]?.value || 100;
    const trendFactor = trend === 'up' ? 0.02 : trend === 'down' ? -0.02 : 0;
    
    const now = new Date(this.timeProvider.now());
    
    for (let i = 1; i <= months; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() + i);
      
      const change = trendFactor + (this.randomGenerator() - 0.5) * 0.03;
      lastValue = lastValue * (1 + change);
      
      predictions.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(lastValue),
        isPrediction: true
      });
    }
    
    return predictions;
  }

  /**
   * 生成影响因素
   * @param {string} countryCode - 国家代码
   * @param {string} trend - 趋势
   * @returns {Array} 影响因素列表
   */
  generateFactors(countryCode, trend) {
    const allFactors = {
      positive: [
        { text: '政府EV补贴政策延续', weight: 1 },
        { text: '充电基础设施建设加速', weight: 1 },
        { text: '新能源车型选择增多', weight: 0.8 },
        { text: '燃油车使用成本上升', weight: 0.7 },
        { text: '电池技术持续进步', weight: 0.6 },
        { text: '碳中和目标推动', weight: 0.5 }
      ],
      negative: [
        { text: '新车型上市竞争加剧', weight: 1 },
        { text: '全球经济不确定性', weight: 0.9 },
        { text: '电池原材料价格波动', weight: 0.8 },
        { text: '充电设施仍不完善', weight: 0.6 },
        { text: '二手市场认知度低', weight: 0.5 }
      ]
    };
    
    const factors = [];
    const count = trend === 'up' ? 4 : trend === 'down' ? 3 : 2;
    
    // 根据趋势选择因素
    if (trend === 'up') {
      const shuffled = this.shuffleArray([...allFactors.positive]);
      factors.push(...shuffled.slice(0, count).map(f => ({ text: f.text, type: 'positive' })));
    } else if (trend === 'down') {
      const shuffled = this.shuffleArray([...allFactors.negative]);
      factors.push(...shuffled.slice(0, count).map(f => ({ text: f.text, type: 'negative' })));
    } else {
      factors.push(
        { text: allFactors.positive[0].text, type: 'positive' },
        { text: allFactors.negative[0].text, type: 'negative' }
      );
    }
    
    return factors;
  }

  /**
   * 生成建议
   * @param {string} trend - 趋势
   * @param {number} changePercent - 变化百分比
   * @returns {string} 建议文本
   */
  generateRecommendation(trend, changePercent) {
    if (trend === 'up' && changePercent > 5) {
      return '市场呈明显上涨趋势，建议持有至价格峰值再出售，预计可获得更高收益。';
    } else if (trend === 'up') {
      return '市场小幅上涨，如不急用资金可继续观察，或考虑出售获利。';
    } else if (trend === 'down' && changePercent < -5) {
      return '市场面临下行压力，建议尽快出售以避免更大损失。';
    } else if (trend === 'down') {
      return '市场小幅回调，如不急需出售可等待市场回暖。';
    }
    return '市场走势平稳，可根据个人资金需求决定出售时机。';
  }

  /**
   * 数组随机打乱（使用注入的随机数生成器）
   * @param {Array} array - 原数组
   * @returns {Array} 打乱后的数组
   */
  shuffleArray(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.randomGenerator() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * 获取市场洞察
   * @param {string} countryCode - 国家代码
   * @returns {Promise<Array>} 洞察列表
   */
  async getMarketInsights(countryCode) {
    // 模拟异步获取
    if (this.delay > 0) {
      await wait(this.delay / 2);
    }
    
    // 使用翻译键，实际翻译在 renderAIInsights 中处理
    return [
      {
        icon: 'fa-chart-line',
        titleKey: 'ai.insight.priceTrend',
        textKey: 'ai.insight.priceTrend.text'
      },
      {
        icon: 'fa-leaf',
        titleKey: 'ai.insight.policy',
        textKey: 'ai.insight.policy.text'
      },
      {
        icon: 'fa-battery-full',
        titleKey: 'ai.insight.technology',
        textKey: 'ai.insight.technology.text'
      },
      {
        icon: 'fa-charging-station',
        titleKey: 'ai.insight.infrastructure',
        textKey: 'ai.insight.infrastructure.text'
      }
    ];
  }
}
