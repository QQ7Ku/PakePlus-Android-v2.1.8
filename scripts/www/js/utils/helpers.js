/**
 * ASEAN NEV Insight - Helper Utilities
 * 辅助工具函数
 */

// 常量定义
export const CONSTANTS = {
  DEPRECIATION_PER_10K_KM: 0.02,
  MAX_MILEAGE_DEPRECIATION: 0.3,
  YEARLY_MULTIPLIER: 0.9,
  DEFAULT_DEBOUNCE_DELAY: 300,
  DEFAULT_THROTTLE_LIMIT: 100
};

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 */
export function debounce(func, wait = CONSTANTS.DEFAULT_DEBOUNCE_DELAY) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 限制时间（毫秒）
 */
export function throttle(func, limit = CONSTANTS.DEFAULT_THROTTLE_LIMIT) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 格式化数字（千分位）
 */
export function formatNumber(num, decimals = 0) {
  if (num === null || num === undefined) return '-';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
}

/**
 * 格式化价格
 */
export function formatPrice(amount, currency) {
  if (!amount || !currency) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.code,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * 格式化百分比
 */
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined) return '-';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * 格式化日期
 */
export function formatDate(date, format = 'short') {
  const d = new Date(date);
  const options = format === 'short' 
    ? { month: 'short', day: 'numeric' }
    : { year: 'numeric', month: 'long', day: 'numeric' };
  return d.toLocaleDateString('zh-CN', options);
}

/**
 * 计算年份折旧
 * @param {number} year - 车辆年份
 * @param {Object} retentionRates - 保值率配置
 * @param {Object} options - 选项
 * @param {Function} options.now - 时间提供器，默认为 Date.now
 */
export function calculateYearDepreciation(year, retentionRates, options = {}) {
  const { now = Date.now } = options;
  const currentYear = new Date(now()).getFullYear();
  const age = currentYear - year;
  
  if (age <= 0) return 1;
  if (age === 1) return retentionRates.y1;
  if (age === 2) return retentionRates.y2;
  if (age >= 3) return retentionRates.y3 * Math.pow(CONSTANTS.YEARLY_MULTIPLIER, age - 3);
  
  return 1;
}

/**
 * 计算里程折旧
 * @param {number} mileage - 里程（万公里）
 */
export function calculateMileageDepreciation(mileage) {
  const depreciation = Math.min(
    mileage * CONSTANTS.DEPRECIATION_PER_10K_KM, 
    CONSTANTS.MAX_MILEAGE_DEPRECIATION
  );
  return 1 - depreciation;
}

/**
 * 生成随机数（范围）
 */
export function random(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * 生成随机整数
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 生成趋势数据
 * @param {number} days - 天数
 * @param {number} baseValue - 基础值
 * @param {number} volatility - 波动率
 * @param {Object} options - 选项
 * @param {Function} options.randomGenerator - 随机数生成器
 * @param {Function} options.timeProvider - 时间提供器
 */
export function generateTrendData(days, baseValue, volatility = 0.05, options = {}) {
  const { randomGenerator = Math.random, timeProvider = Date } = options;
  const data = [];
  let currentValue = baseValue;
  const now = new Date(timeProvider.now());
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const change = (randomGenerator() - 0.5) * volatility;
    currentValue = currentValue * (1 + change);
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(currentValue)
    });
  }
  
  return data;
}

/**
 * 生成预测数据
 * @param {Array} historical - 历史数据
 * @param {number} months - 预测月数
 * @param {string} trend - 趋势方向
 * @param {Object} options - 选项
 * @param {Function} options.randomGenerator - 随机数生成器
 * @param {Function} options.timeProvider - 时间提供器
 */
export function generatePredictionData(historical, months, trend = 'up', options = {}) {
  const { randomGenerator = Math.random, timeProvider = Date } = options;
  const predictions = [];
  let lastValue = historical[historical.length - 1]?.value || 100;
  const trendFactor = trend === 'up' ? 0.02 : trend === 'down' ? -0.02 : 0;
  
  const now = new Date(timeProvider.now());
  
  for (let i = 1; i <= months; i++) {
    const date = new Date(now);
    date.setMonth(date.getMonth() + i);
    
    const change = trendFactor + (randomGenerator() - 0.5) * 0.03;
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
 * 本地存储操作
 */
export const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },
  
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  },
  
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  }
};

/**
 * 检测移动设备
 */
export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * 检测网络状态
 */
export function isOnline() {
  return navigator.onLine;
}

/**
 * 监听网络变化
 */
export function watchNetwork(callback) {
  window.addEventListener('online', () => callback(true));
  window.addEventListener('offline', () => callback(false));
}

/**
 * 深拷贝
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 数组去重
 */
export function uniqueArray(arr, key) {
  if (key) {
    const seen = new Set();
    return arr.filter(item => {
      const val = item[key];
      if (seen.has(val)) return false;
      seen.add(val);
      return true;
    });
  }
  return [...new Set(arr)];
}

/**
 * 按属性排序
 */
export function sortBy(arr, key, desc = false) {
  return [...arr].sort((a, b) => {
    const valA = a[key];
    const valB = b[key];
    if (valA < valB) return desc ? 1 : -1;
    if (valA > valB) return desc ? -1 : 1;
    return 0;
  });
}

/**
 * 分组
 */
export function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const group = item[key];
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});
}

/**
 * 滚动到元素
 */
export function scrollToElement(selector, offset = 80) {
  const element = document.querySelector(selector);
  if (element) {
    const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

/**
 * 截断文本
 */
export function truncate(str, length = 50, suffix = '...') {
  if (!str || str.length <= length) return str;
  return str.substring(0, length).trim() + suffix;
}

/**
 * 等待函数
 * @param {number} ms - 等待毫秒数
 */
export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * HTML 转义函数 - 防止 XSS
 * @param {string} text - 要转义的文本
 * @returns {string} 转义后的 HTML
 */
export function escapeHtml(text) {
  if (typeof text !== 'string') return String(text);
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '`': '&#96;',
    '/': '&#47;'
  };
  return text.replace(/[&<>"'`/]/g, char => htmlEscapes[char]);
}

/**
 * 顺序执行异步任务
 */
export async function sequence(tasks) {
  const results = [];
  for (const task of tasks) {
    results.push(await task());
  }
  return results;
}

/**
 * 并行执行异步任务
 */
export function parallel(tasks) {
  return Promise.all(tasks.map(t => t()));
}
