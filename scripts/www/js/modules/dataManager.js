/**
 * ASEAN NEV Insight - Data Manager
 * 数据管理模块 - 支持依赖注入，便于测试
 */

import { COUNTRIES, EV_MODELS, APP_CONFIG } from '../config/constants.js';
import { storage, generateTrendData, deepClone } from '../utils/helpers.js';

export class DataManager {
  /**
   * @param {Object} options - 配置选项
   * @param {Object} options.countries - 国家数据，默认为 COUNTRIES
   * @param {Object} options.models - 车型数据，默认为 EV_MODELS
   * @param {Object} options.storage - 存储适配器，默认为内置 storage
   * @param {Function} options.randomGenerator - 随机数生成器，默认为 Math.random
   * @param {Function} options.timeProvider - 时间提供器，默认为 Date
   */
  constructor(options = {}) {
    this.countries = options.countries || COUNTRIES;
    this.models = options.models || EV_MODELS;
    this.storage = options.storage || storage;
    this.randomGenerator = options.randomGenerator || Math.random;
    this.timeProvider = options.timeProvider || Date;
    this.cache = new Map();
    this.currentCountry = 'th';
  }

  /**
   * 初始化数据
   */
  async init() {
    // 加载保存的设置
    this.currentCountry = this.storage.get('selectedCountry', 'th');
    
    // 生成市场数据
    this.generateMarketData();
    
    return this;
  }

  /**
   * 生成市场数据（纯本地数据，无需网络）
   */
  generateMarketData() {
    // 为每个国家生成趋势数据
    Object.keys(this.countries).forEach(code => {
      const country = this.countries[code];
      const basePrice = country.marketData.avgPrice;
      
      // 生成本地趋势数据
      country.marketData.trends = {
        '30d': generateTrendData(30, basePrice, 0.03, {
          randomGenerator: this.randomGenerator,
          timeProvider: this.timeProvider
        }),
        '90d': generateTrendData(90, basePrice, 0.05, {
          randomGenerator: this.randomGenerator,
          timeProvider: this.timeProvider
        }),
        '1y': generateTrendData(365, basePrice, 0.08, {
          randomGenerator: this.randomGenerator,
          timeProvider: this.timeProvider
        })
      };
      
      // 确保数据有效
      if (!country.marketData.trends['30d'] || country.marketData.trends['30d'].length === 0) {
        country.marketData.trends['30d'] = this.generateDefaultTrend(basePrice, 30);
      }
    });

    // 生成热门车型排行
    this.generateHotModels();
  }

  /**
   * 生成默认趋势数据（备用）
   */
  generateDefaultTrend(basePrice, days) {
    const data = [];
    const now = new this.timeProvider();
    for (let i = days; i >= 0; i--) {
      const date = new this.timeProvider(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(basePrice * (0.95 + this.randomGenerator() * 0.1))
      });
    }
    return data;
  }

  /**
   * 生成热门车型数据
   */
  generateHotModels() {
    this.hotModels = [];
    let rank = 1;
    const rand = this.randomGenerator;
    
    Object.entries(this.models).forEach(([brand, data]) => {
      Object.entries(data.models).forEach(([modelId, model]) => {
        const prices = Object.values(model.basePrices);
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        
        this.hotModels.push({
          rank: rank++,
          brand: data.brand,
          model: model.name,
          category: model.category,
          avgPrice: Math.round(avgPrice),
          change: (rand() * 10 - 3).toFixed(1),
          volume: Math.floor(rand() * 500) + 50,
          trend: rand() > 0.4 ? 'up' : 'down'
        });
      });
    });

    // 按成交量排序
    this.hotModels.sort((a, b) => b.volume - a.volume);
    this.hotModels.forEach((m, i) => m.rank = i + 1);
  }

  /**
   * 获取所有国家
   */
  getCountries() {
    return deepClone(this.countries);
  }

  /**
   * 获取国家列表
   */
  getCountryList() {
    return Object.values(this.countries).map(c => ({
      code: c.code,
      name: c.name,
      flag: c.flag
    }));
  }

  /**
   * 获取单个国家
   */
  getCountry(code) {
    return deepClone(this.countries[code]);
  }

  /**
   * 获取所有品牌
   */
  getBrands() {
    return Object.values(this.models).map(b => ({
      id: b.brand.toLowerCase(),
      name: b.brand,
      logo: b.logo,
      country: b.country
    }));
  }

  /**
   * 获取品牌下的车型
   */
  getModelsByBrand(brandId) {
    // 支持大小写不敏感的品牌ID查找
    const upperBrandId = brandId.toUpperCase();
    const brand = this.models[upperBrandId];
    if (!brand) {
      console.warn(`Brand not found: ${brandId}`);
      return [];
    }
    
    return Object.values(brand.models).map(m => ({
      id: m.id,
      name: m.name,
      category: m.category,
      battery: m.battery,
      range: m.range
    }));
  }

  /**
   * 获取车型详情
   */
  getModel(brandId, modelId) {
    const brand = this.models[brandId.toUpperCase()];
    if (!brand) return null;
    
    const model = brand.models[modelId];
    if (!model) return null;
    
    return {
      brand: brand.brand,
      ...deepClone(model)
    };
  }

  /**
   * 获取车型基础价格
   */
  getBasePrice(brandId, modelId, countryCode) {
    const model = this.getModel(brandId, modelId);
    if (!model) return null;
    
    return model.basePrices[countryCode] || model.basePrices.th || 0;
  }

  /**
   * 获取折旧率
   */
  getRetentionRates(brandId, modelId) {
    const model = this.getModel(brandId, modelId);
    return model ? model.retention : { y1: 0.85, y2: 0.75, y3: 0.65 };
  }

  /**
   * 获取热门车型
   */
  getHotModels(limit = 10) {
    return deepClone(this.hotModels.slice(0, limit || APP_CONFIG.HOT_MODELS_LIMIT));
  }

  /**
   * 获取市场趋势
   */
  getMarketTrend(countryCode, period = '30d') {
    const country = this.countries[countryCode];
    if (!country) return [];
    
    return country.marketData.trends?.[period] || [];
  }

  /**
   * 获取品牌份额数据
   */
  getBrandShare() {
    const shares = [
      { name: 'BYD', value: 35 },
      { name: 'Tesla', value: 28 },
      { name: 'MG', value: 18 },
      { name: 'VinFast', value: 8 },
      { name: '其他', value: 11 }
    ];
    return shares;
  }

  /**
   * 获取东盟价格对比
   */
  getAseanPriceComparison(modelId) {
    const data = [];
    
    Object.entries(this.countries).forEach(([code, country]) => {
      let price = null;
      
      // 查找该车型在各国的价格
      Object.values(this.models).forEach(brand => {
        const model = brand.models[modelId];
        if (model && model.basePrices[code]) {
          price = model.basePrices[code];
        }
      });
      
      if (price) {
        data.push({
          country: country.name,
          flag: country.flag,
          code: code,
          price: price,
          currency: country.currency.code
        });
      }
    });
    
    return data;
  }

  /**
   * 搜索车型
   */
  searchModels(keyword) {
    if (!keyword) return [];
    
    const results = [];
    const lowerKeyword = keyword.toLowerCase();
    
    Object.entries(this.models).forEach(([brandId, brand]) => {
      Object.entries(brand.models).forEach(([modelId, model]) => {
        if (model.name.toLowerCase().includes(lowerKeyword) ||
            brand.brand.toLowerCase().includes(lowerKeyword)) {
          results.push({
            brand: brand.brand,
            model: model.name,
            brandId: brandId.toLowerCase(),
            modelId: modelId
          });
        }
      });
    });
    
    return results;
  }

  /**
   * 设置当前国家
   */
  setCurrentCountry(code) {
    this.currentCountry = code;
    this.storage.set('selectedCountry', code);
  }

  /**
   * 获取当前国家
   */
  getCurrentCountry() {
    return this.currentCountry;
  }

  /**
   * 获取统计数据
   */
  getStats(countryCode = null) {
    const code = countryCode || this.currentCountry;
    const country = this.countries[code];
    
    if (!country) return null;
    
    const hotModel = this.hotModels[0];
    const rand = this.randomGenerator;
    
    return {
      avgPrice: country.marketData.avgPrice,
      volume: country.marketData.volume,
      evRatio: country.marketData.evRatio,
      hotModel: hotModel ? `${hotModel.brand} ${hotModel.model}` : '-',
      priceChange: (rand() * 8 - 2).toFixed(1),
      volumeChange: (rand() * 20 - 5).toFixed(1),
      evChange: (rand() * 6 - 1).toFixed(1)
    };
  }
}
