/**
 * ASEAN NEV Insight - Market Search Engine
 * 市场搜索引擎 - 模拟搜索并返回Power BI风格数据
 */

import { wait } from '../utils/helpers.js';

/**
 * 市场搜索引擎
 */
export class MarketSearchEngine {
  /**
   * @param {Object} options - 配置选项
   * @param {number} options.delay - 搜索延迟（毫秒）
   * @param {Function} options.randomGenerator - 随机数生成器
   * @param {Function} options.timeProvider - 时间提供器
   */
  constructor(options = {}) {
    this.delay = options.delay ?? 2000;
    this.randomGenerator = options.randomGenerator || Math.random;
    this.timeProvider = options.timeProvider || Date;
  }

  /**
   * 搜索市场数据
   * @param {Object} params - 搜索参数
   * @param {string} params.brand - 品牌
   * @param {string} params.model - 车型
   * @param {string} params.period - 时间周期 (12m/6m/3m)
   * @param {string} params.country - 国家代码
   * @returns {Promise<Object>} 搜索结果
   */
  async search(params) {
    // 模拟搜索延迟
    if (this.delay > 0) {
      await wait(this.delay);
    }

    return this.generateSearchResult(params);
  }

  /**
   * 生成搜索结果
   * @param {Object} params - 搜索参数
   * @returns {Object} 搜索结果
   */
  generateSearchResult(params) {
    const { brand, model, period = '12m', country } = params;
    const months = this.parsePeriod(period);
    
    // 基础价格（根据车型）
    const basePrice = this.getBasePrice(brand, model, country);
    
    // 生成月度数据
    const monthlyData = this.generateMonthlyData(months, basePrice);
    
    // 计算汇总统计
    const statistics = this.calculateStatistics(monthlyData);
    
    // 生成价格分布
    const priceDistribution = this.generatePriceDistribution(basePrice);
    
    // 生成地区对比（如果是全部国家）
    const countryComparison = country === 'all' ? 
      this.generateCountryComparison(brand, model) : null;

    return {
      brand,
      model,
      country,
      period,
      searchTime: new Date(this.timeProvider.now()).toISOString(),
      summary: statistics,
      monthlyData,
      priceDistribution,
      countryComparison,
      trends: {
        price: this.calculatePriceTrend(monthlyData),
        volume: this.calculateVolumeTrend(monthlyData)
      }
    };
  }

  /**
   * 解析时间周期
   * @param {string} period - 周期字符串
   * @returns {number} 月数
   */
  parsePeriod(period) {
    const map = { '3m': 3, '6m': 6, '12m': 12, '1y': 12 };
    return map[period] || 12;
  }

  /**
   * 获取基础价格
   * @param {string} brand - 品牌
   * @param {string} model - 车型
   * @param {string} country - 国家
   * @returns {number} 基础价格
   */
  getBasePrice(brand, model, country) {
    // 基础价格表（包含所有新车型）
    const prices = {
      'byd-atto3': { th: 1200000, vn: 850000000, id: 450000000, my: 168000, sg: 185000 },
      'byd-seal': { th: 1600000, vn: 1150000000, id: 650000000, my: 198000, sg: 280000 },
      'byd-dolphin': { th: 799000, vn: 550000000, id: 299000000, my: 98000, sg: 145000 },
      'byd-m6': { th: 1450000, id: 429000000, my: 158000 },
      'byd-qin-2019': { th: 950000, vn: 680000000, id: 380000000, my: 125000, sg: 155000 },
      'byd-qin-plus': { th: 1150000, vn: 820000000, id: 450000000, my: 148000, sg: 175000 },
      'byd-han': { th: 1850000, vn: 1350000000, id: 750000000, my: 228000, sg: 285000 },
      'byd-tang': { th: 1750000, vn: 1250000000, id: 680000000, my: 218000, sg: 265000 },
      'byd-song-plus': { th: 1350000, vn: 950000000, id: 520000000, my: 175000, sg: 205000 },
      'byd-yuan-plus': { th: 1050000, vn: 750000000, id: 410000000, my: 138000, sg: 165000 },
      'byd-e2': { th: 850000, vn: 600000000, id: 320000000, my: 108000, sg: 135000 },
      'byd-e6': { th: 1350000, vn: 950000000, id: 480000000, my: 165000, sg: 195000 },
      'tesla-model3': { th: 1750000, vn: 1250000000, my: 218000, sg: 185000 },
      'tesla-modely': { th: 1950000, vn: 1450000000, my: 248000, sg: 115000 },
      'mg-zsev': { th: 950000, vn: 680000000, id: 398000000, my: 118000, sg: 158000 },
      'mg-mg4': { th: 1050000, my: 128000, sg: 168000 },
      'mg-ep': { th: 890000, my: 108000 }
    };
    
    const key = `${brand}-${model}`;
    const countryPrices = prices[key] || { th: 1000000 };
    return countryPrices[country] || countryPrices.th || 1000000;
  }

  /**
   * 生成月度数据
   * @param {number} months - 月数
   * @param {number} basePrice - 基础价格
   * @returns {Array} 月度数据
   */
  generateMonthlyData(months, basePrice) {
    const data = [];
    const now = new Date(this.timeProvider.now());
    
    let currentPrice = basePrice;
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      
      // 随机波动
      const priceChange = (this.randomGenerator() - 0.5) * 0.08;
      currentPrice = currentPrice * (1 + priceChange);
      
      // 销量（与价格负相关）
      const baseVolume = 100 + Math.floor(this.randomGenerator() * 200);
      const volume = Math.floor(baseVolume * (1 - priceChange));
      
      // 最高/最低价格
      const priceRange = currentPrice * 0.15;
      const maxPrice = currentPrice + priceRange * this.randomGenerator();
      const minPrice = currentPrice - priceRange * this.randomGenerator();
      
      // 计算环比变化
      const prevPrice = data.length > 0 ? data[data.length - 1].avgPrice : currentPrice;
      const changePercent = ((currentPrice - prevPrice) / prevPrice * 100);
      
      data.push({
        month: date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' }),
        year: date.getFullYear(),
        monthNum: date.getMonth() + 1,
        volume,
        avgPrice: Math.round(currentPrice),
        maxPrice: Math.round(maxPrice),
        minPrice: Math.round(minPrice),
        changePercent: parseFloat(changePercent.toFixed(1)),
        totalValue: Math.round(currentPrice * volume)
      });
    }
    
    return data;
  }

  /**
   * 计算统计数据
   * @param {Array} monthlyData - 月度数据
   * @returns {Object} 统计数据
   */
  calculateStatistics(monthlyData) {
    const totalVolume = monthlyData.reduce((sum, d) => sum + d.volume, 0);
    const totalValue = monthlyData.reduce((sum, d) => sum + d.totalValue, 0);
    const avgPrice = totalValue / totalVolume;
    
    const prices = monthlyData.map(d => d.avgPrice);
    const maxPrice = Math.max(...monthlyData.map(d => d.maxPrice));
    const minPrice = Math.min(...monthlyData.map(d => d.minPrice));
    
    const volumes = monthlyData.map(d => d.volume);
    const maxVolume = Math.max(...volumes);
    const minVolume = Math.min(...volumes);
    
    // 计算趋势（防止除零）
    const firstMonth = monthlyData[0];
    const lastMonth = monthlyData[monthlyData.length - 1];
    const priceTrend = firstMonth.avgPrice !== 0 
      ? ((lastMonth.avgPrice - firstMonth.avgPrice) / firstMonth.avgPrice * 100) 
      : 0;
    const volumeTrend = firstMonth.volume !== 0 
      ? ((lastMonth.volume - firstMonth.volume) / firstMonth.volume * 100) 
      : 0;
    
    return {
      totalVolume,
      totalValue,
      avgPrice: Math.round(avgPrice),
      maxPrice,
      minPrice,
      priceRange: `${this.formatPrice(minPrice)} - ${this.formatPrice(maxPrice)}`,
      maxVolume,
      minVolume,
      avgMonthlyVolume: Math.round(totalVolume / monthlyData.length),
      priceTrend: parseFloat(priceTrend.toFixed(1)),
      volumeTrend: parseFloat(volumeTrend.toFixed(1))
    };
  }

  /**
   * 生成价格分布
   * @param {number} basePrice - 基础价格
   * @returns {Array} 价格分布区间
   */
  generatePriceDistribution(basePrice) {
    const ranges = [
      { min: 0.7, max: 0.8, label: '低价区' },
      { min: 0.8, max: 0.9, label: '中低价区' },
      { min: 0.9, max: 1.0, label: '均价区' },
      { min: 1.0, max: 1.1, label: '中高价区' },
      { min: 1.1, max: 1.3, label: '高价区' }
    ];
    
    return ranges.map(r => ({
      label: r.label,
      range: `${this.formatPrice(basePrice * r.min)} - ${this.formatPrice(basePrice * r.max)}`,
      count: Math.floor(this.randomGenerator() * 500) + 100,
      percentage: Math.floor(this.randomGenerator() * 30) + 10
    }));
  }

  /**
   * 生成国家对比
   * @param {string} brand - 品牌
   * @param {string} model - 车型
   * @returns {Array} 国家对比数据
   */
  generateCountryComparison(brand, model) {
    const countries = [
      { code: 'th', name: '泰国', flag: '🇹🇭' },
      { code: 'vn', name: '越南', flag: '🇻🇳' },
      { code: 'id', name: '印尼', flag: '🇮🇩' },
      { code: 'my', name: '马来西亚', flag: '🇲🇾' },
      { code: 'sg', name: '新加坡', flag: '🇸🇬' }
    ];
    
    return countries.map(c => {
      const basePrice = this.getBasePrice(brand, model, c.code);
      const volume = Math.floor(this.randomGenerator() * 1000) + 500;
      
      return {
        ...c,
        avgPrice: Math.round(basePrice * (0.9 + this.randomGenerator() * 0.2)),
        volume,
        marketShare: Math.floor(this.randomGenerator() * 30) + 10
      };
    });
  }

  /**
   * 计算价格趋势
   * @param {Array} monthlyData - 月度数据
   * @returns {string} 趋势 (up/down/stable)
   */
  calculatePriceTrend(monthlyData) {
    const first = monthlyData[0].avgPrice;
    const last = monthlyData[monthlyData.length - 1].avgPrice;
    const change = (last - first) / first;
    
    if (change > 0.05) return 'up';
    if (change < -0.05) return 'down';
    return 'stable';
  }

  /**
   * 计算销量趋势
   * @param {Array} monthlyData - 月度数据
   * @returns {string} 趋势
   */
  calculateVolumeTrend(monthlyData) {
    const first = monthlyData[0].volume;
    const last = monthlyData[monthlyData.length - 1].volume;
    const change = (last - first) / first;
    
    if (change > 0.1) return 'up';
    if (change < -0.1) return 'down';
    return 'stable';
  }

  /**
   * 格式化价格
   * @param {number} price - 价格
   * @returns {string} 格式化后的价格
   */
  formatPrice(price) {
    if (price >= 1000000) {
      return (price / 1000000).toFixed(2) + 'M';
    }
    if (price >= 1000) {
      return (price / 1000).toFixed(0) + 'K';
    }
    return price.toString();
  }

  /**
   * 生成近期单车成交数据
   * @param {string} brand - 品牌
   * @param {string} model - 车型
   * @param {string} country - 国家代码
   * @param {number} days - 天数（7或30）
   * @returns {Object} 近期成交数据
   */
  generateRecentDeals(brand, model, country, days = 7) {
    const basePrice = this.getBasePrice(brand, model, country) || 1000000;
    const deals = [];
    const now = new Date(this.timeProvider.now());
    
    // 生成成交记录
    const dealCount = days === 7 ? 8 + Math.floor(this.randomGenerator() * 7) : 25 + Math.floor(this.randomGenerator() * 20);
    
    for (let i = 0; i < dealCount; i++) {
      const daysAgo = Math.floor(this.randomGenerator() * days);
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      
      // 价格浮动 ±8%
      const priceVariation = (this.randomGenerator() - 0.5) * 0.16;
      const dealPrice = Math.round(basePrice * (1 + priceVariation));
      
      // 里程 1-15万公里
      const mileage = Math.round(this.randomGenerator() * 15 * 10) / 10;
      
      // 年份 2019-2024
      const year = 2019 + Math.floor(this.randomGenerator() * 6);
      
      deals.push({
        id: `deal_${i}`,
        date: date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
        fullDate: date.toISOString().split('T')[0],
        price: dealPrice,
        mileage: mileage,
        year: year,
        condition: this.getRandomCondition(),
        location: this.getRandomLocation()
      });
    }
    
    // 按日期排序（最新的在前）
    deals.sort((a, b) => new Date(b.fullDate) - new Date(a.fullDate));
    
    // 计算统计
    const prices = deals.map(d => d.price);
    const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    
    // 计算价格变化（与前一天相比）
    const priceChange = days > 1 && deals.length > 1 
      ? ((deals[0].price - deals[deals.length - 1].price) / deals[deals.length - 1].price * 100)
      : 0;
    
    // 生成每日统计用于图表
    const dailyStats = this.generateDailyStats(deals, days, now);
    
    return {
      deals: deals.slice(0, 10), // 只返回最近10条详情
      totalCount: dealCount,
      avgPrice,
      maxPrice,
      minPrice,
      priceChange: parseFloat(priceChange.toFixed(1)),
      dailyStats
    };
  }

  /**
   * 获取随机车况
   */
  getRandomCondition() {
    const conditions = ['优秀', '良好', '一般', '较差'];
    const weights = [0.2, 0.5, 0.25, 0.05];
    const rand = this.randomGenerator();
    let cumulative = 0;
    
    for (let i = 0; i < conditions.length; i++) {
      cumulative += weights[i];
      if (rand <= cumulative) return conditions[i];
    }
    return conditions[0];
  }

  /**
   * 获取随机地点
   */
  getRandomLocation() {
    const locations = ['曼谷', '清迈', '普吉', '芭提雅', '合艾', '孔敬', '乌隆他尼'];
    return locations[Math.floor(this.randomGenerator() * locations.length)];
  }

  /**
   * 生成每日统计数据
   */
  generateDailyStats(deals, days, now) {
    const stats = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayDeals = deals.filter(d => d.fullDate === dateStr);
      
      if (dayDeals.length > 0) {
        const prices = dayDeals.map(d => d.price);
        stats.push({
          date: date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
          avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
          volume: dayDeals.length
        });
      } else {
        stats.push({
          date: date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
          avgPrice: null,
          volume: 0
        });
      }
    }
    
    return stats;
  }
}
