/**
 * ASEAN NEV Insight - Currency Manager
 * 货币管理模块
 */

import { COUNTRIES } from '../config/constants.js';
import { storage } from '../utils/helpers.js';

export class CurrencyManager {
  constructor() {
    this.currencies = this.extractCurrencies();
    this.currentCurrency = null; // null means use country's native currency
    this.baseCurrency = 'USD';
  }

  /**
   * 初始化
   */
  init() {
    this.currentCurrency = storage.get('selectedCurrency', null);
    return this;
  }

  /**
   * 从国家数据提取货币配置
   */
  extractCurrencies() {
    const currencies = {};
    Object.entries(COUNTRIES).forEach(([code, country]) => {
      currencies[code] = country.currency;
    });
    return currencies;
  }

  /**
   * 格式化金额
   * @param {number} amount - 金额
   * @param {string} countryCode - 国家代码
   * @param {Object} options - 选项
   * @returns {string} 格式化后的金额
   */
  format(amount, countryCode, options = {}) {
    // 验证输入
    if (typeof amount !== 'number' || isNaN(amount)) {
      return '-';
    }
    
    const { short = false, showBoth = false } = options;
    
    // 获取货币配置
    let currency;
    if (this.currentCurrency) {
      // 查找货币代码对应的国家
      const entry = Object.entries(this.currencies).find(([_, c]) => c.code === this.currentCurrency);
      currency = entry ? entry[1] : this.currencies[countryCode];
    } else {
      currency = this.currencies[countryCode];
    }
    
    if (!currency) return amount;
    
    // 转换汇率
    let convertedAmount = amount;
    if (this.currentCurrency && this.currentCurrency !== currency.code) {
      const targetCurrency = Object.values(this.currencies).find(c => c.code === this.currentCurrency);
      if (targetCurrency) {
        convertedAmount = this.convert(amount, currency.rate, targetCurrency.rate);
      }
    }
    
    // 格式化
    if (short && convertedAmount >= 1000000) {
      return `${currency.symbol}${(convertedAmount / 1000000).toFixed(1)}M`;
    }
    if (short && convertedAmount >= 1000) {
      return `${currency.symbol}${(convertedAmount / 1000).toFixed(0)}K`;
    }
    
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      maximumFractionDigits: 0
    }).format(convertedAmount);
    
    // 如果需要显示两种货币
    if (showBoth && this.currentCurrency && this.currentCurrency !== currency.code) {
      const nativeFormatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: this.currencies[countryCode].code,
        maximumFractionDigits: 0
      }).format(amount);
      return `${formatted} <span class="text-gray-400">(${nativeFormatted})</span>`;
    }
    
    return formatted;
  }

  /**
   * 转换汇率
   */
  convert(amount, fromRate, toRate) {
    const usdAmount = amount * fromRate;
    return usdAmount / toRate;
  }

  /**
   * 设置当前货币
   */
  setCurrency(currencyCode) {
    this.currentCurrency = currencyCode;
    storage.set('selectedCurrency', currencyCode);
  }

  /**
   * 获取当前货币
   */
  getCurrentCurrency() {
    return this.currentCurrency;
  }

  /**
   * 获取货币列表
   */
  getCurrencyList() {
    return Object.entries(this.currencies).map(([code, currency]) => ({
      code,
      ...currency
    }));
  }

  /**
   * 获取货币符号
   */
  getSymbol(countryCode) {
    const currency = this.currencies[countryCode];
    return currency ? currency.symbol : '';
  }

  /**
   * 获取货币代码
   */
  getCode(countryCode) {
    const currency = this.currencies[countryCode];
    return currency ? currency.code : '';
  }
}
