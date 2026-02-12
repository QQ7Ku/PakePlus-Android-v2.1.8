/**
 * ASEAN NEV Insight - Main Entry
 * 主入口文件 - 重构版本
 * 
 * 重构要点：
 * 1. 使用 LanguageSwitcher 组件处理语言切换 UI
 * 2. 通过事件驱动模式降低组件耦合
 * 3. 简化 switchLanguage 方法
 */

import { DataManager } from './modules/dataManager.js';
import { UIManager } from './modules/uiManager.js';
import { CurrencyManager } from './modules/currencyManager.js';
import { LanguageManager } from './modules/languageManager.js';
import { AIValuationEngine } from './modules/aiValuationEngine.js';
import { AIMarketPredictor } from './modules/aiMarketPredictor.js';
import { MarketSearchEngine } from './modules/marketSearchEngine.js';
import { ChartManager } from './modules/chartManager.js';
import { LanguageSwitcher } from './components/languageSwitcher.js';
import { wait } from './utils/helpers.js';
import { APP_CONFIG } from './config/constants.js';

/**
 * ASEAN NEV 应用主类
 */
class ASEANNEVApp {
  constructor() {
    // 初始化管理器
    this.dataManager = new DataManager();
    this.currencyManager = new CurrencyManager();
    this.languageManager = new LanguageManager();
    this.aiValuationEngine = new AIValuationEngine();
    this.aiMarketPredictor = new AIMarketPredictor();
    this.marketSearchEngine = new MarketSearchEngine();
    this.chartManager = new ChartManager();
    
    // UI 管理器（延迟初始化）
    this.uiManager = null;
    
    // 语言切换组件（延迟初始化）
    this.languageSwitcher = null;
    
    // 应用状态
    this.state = {
      isInitialized: false,
      isLoading: true,
      isOnline: true,
      currentTab: 'dashboard',
      currentPeriod: '30d'
    };
  }

  /**
   * 初始化应用
   */
  async init() {
    try {
      console.log('ASEAN NEV Insight - Initializing...');
      
      // 初始化核心管理器（先初始化数据相关）
      await this.dataManager.init();
      this.currencyManager.init();
      this.languageManager.init();
      
      // 初始化 UI 管理器
      this.uiManager = new UIManager(this);
      
      // 初始化语言切换组件
      this.initLanguageSwitcher();
      
      // 将语言切换组件注入 UIManager
      this.uiManager.setLanguageSwitcher(this.languageSwitcher);
      
      // 初始化 UI（此时 languageSwitcher 已设置）
      this.uiManager.init();
      
      // 显示加载动画
      await this.simulateLoading();
      
      // 初始化其他模块
      this.aiValuationEngine.init(this.dataManager);
      this.chartManager.init();
      
      // 初始化表单
      this.uiManager.populateBrandSelect();
      this.uiManager.populateYearSelect();
      this.uiManager.populateCountrySelect();
      this.uiManager.populateSearchForm();
      
      // 初始化网络监听
      this.initNetworkWatch();
      
      // 更新显示
      this.updateDisplay();
      
      // 隐藏加载屏
      this.uiManager.hideLoading();
      
      // 延迟渲染仪表板
      await wait(APP_CONFIG.DELAY.INITIALIZATION);
      await this.renderDashboard();
      
      // 调整图表大小
      await wait(APP_CONFIG.DELAY.CHART_RESIZE);
      this.chartManager.resizeAll();
      
      this.state.isInitialized = true;
      console.log('ASEAN NEV Insight - Ready!');
      
    } catch (error) {
      console.error('Initialization failed:', error);
      this.uiManager?.showToast('App initialization failed', 'error');
    }
  }

  /**
   * 初始化语言切换组件
   * 将 UI 逻辑与业务逻辑分离
   */
  initLanguageSwitcher() {
    this.languageSwitcher = new LanguageSwitcher({
      languageManager: this.languageManager,
      // 语言切换后的回调（用于刷新仪表板）
      onLanguageChange: async (langCode) => {
        await this.renderDashboard();
        // 重新填充搜索表单以更新翻译
        this.uiManager.populateSearchForm();
      },
      // Toast 通知回调
      showToast: (message, type) => {
        this.uiManager.showToast(message, type);
      }
    });
  }

  /**
   * 模拟加载过程
   */
  async simulateLoading() {
    const steps = [
      { progress: 15, status: 'Loading data...', delay: 200 },
      { progress: 35, status: 'Initializing AI...', delay: 300 },
      { progress: 55, status: 'Loading charts...', delay: 250 },
      { progress: 75, status: 'Preparing UI...', delay: 200 },
      { progress: 90, status: 'Almost ready...', delay: 150 },
      { progress: 100, status: 'Ready!', delay: 100 }
    ];
    
    for (const step of steps) {
      await wait(step.delay);
      this.uiManager.updateLoading(step.progress, step.status);
    }
  }

  /**
   * 初始化网络状态监听
   */
  initNetworkWatch() {
    window.addEventListener('online', () => {
      this.state.isOnline = true;
      this.uiManager.showOfflineIndicator(false);
      this.uiManager.showToast('Back online', 'success');
    });
    
    window.addEventListener('offline', () => {
      this.state.isOnline = false;
      this.uiManager.showOfflineIndicator(true);
      this.uiManager.showToast('Offline mode', 'warning');
    });
  }

  /**
   * 渲染仪表板
   */
  async renderDashboard() {
    try {
      const countryCode = this.dataManager.getCurrentCountry();
      const stats = this.dataManager.getStats(countryCode);
      this.uiManager.updateKPI(stats, countryCode);
      
      const trendData = this.dataManager.getMarketTrend(countryCode, this.state.currentPeriod);
      if (trendData?.length > 0) {
        setTimeout(() => this.chartManager.renderPriceTrend('priceTrendChart', trendData), 100);
      }
      
      const brandShare = this.dataManager.getBrandShare();
      if (brandShare?.length > 0) {
        setTimeout(() => this.chartManager.renderBrandShare('brandShareChart', brandShare), 150);
      }
      
      const hotModels = this.dataManager.getHotModels(10);
      if (hotModels?.length > 0) {
        this.uiManager.renderHotModels(hotModels, countryCode);
      }
      
      const comparisonData = this.dataManager.getAseanPriceComparison('atto3');
      if (comparisonData?.length > 0) {
        // 传入语言管理器用于国家名称翻译
        setTimeout(() => this.chartManager.renderAseanComparison('aseanMapChart', comparisonData, this.languageManager), 200);
      }
      
      const insights = await this.aiMarketPredictor.getMarketInsights(countryCode);
      if (insights?.length > 0) {
        this.uiManager.renderAIInsights(insights);
      }
    } catch (error) {
      console.error('Dashboard error:', error);
    }
  }

  /**
   * 更新显示
   */
  updateDisplay() {
    const countryCode = this.dataManager.getCurrentCountry();
    const country = this.dataManager.getCountry(countryCode);
    this.uiManager.updateCountryDisplay(country);
    
    const currency = country.currency;
    this.uiManager.updateCurrencyDisplay(currency.code, currency.symbol, currency.code);
  }

  /**
   * 切换国家
   * @param {string} countryCode - 国家代码
   */
  async switchCountry(countryCode) {
    const country = this.dataManager.getCountry(countryCode);
    if (!country) return;
    
    // 显示切换中的加载状态
    this.uiManager.showCountrySwitchLoading(countryCode);
    
    try {
      this.dataManager.setCurrentCountry(countryCode);
      this.updateDisplay();
      
      // 并行刷新数据
      await Promise.all([
        this.renderDashboard(),
        this.delay(300) // 最小加载时间，确保动画流畅
      ]);
      
      this.uiManager.hideCountrySwitchLoading();
      
      // 显示切换成功动画和提示
      const t = this.languageManager?.t?.bind(this.languageManager);
      let message;
      if (t) {
        message = t('country.switched', 'Switched to {country}').replace('{country}', country.name);
      } else {
        message = `Switched to ${country.name}`;
      }
      this.uiManager.showToast(message, 'success');
      
      // 触发切换成功动画
      this.uiManager.animateCountrySwitch(countryCode);
      
    } catch (error) {
      console.error('Country switch failed:', error);
      this.uiManager.hideCountrySwitchLoading();
      const t = this.languageManager?.t?.bind(this.languageManager);
      const errorMsg = t ? t('country.switchFailed', 'Failed to switch country') : 'Failed to switch country';
      this.uiManager.showToast(errorMsg, 'error');
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 切换货币
   * @param {string} currencyCode - 货币代码
   */
  async switchCurrency(currencyCode) {
    this.currencyManager.setCurrency(currencyCode);
    this.updateDisplay();
    await this.renderDashboard();
  }

  /**
   * 切换语言
   * 委托给 LanguageSwitcher 组件处理
   * 
   * @param {string} langCode - 语言代码
   * @returns {boolean} 切换是否成功
   */
  async switchLanguage(langCode) {
    // 如果 LanguageSwitcher 已初始化，使用它处理
    if (this.languageSwitcher) {
      return await this.languageSwitcher.switchLanguage(langCode);
    }
    
    // 降级方案：直接使用 LanguageManager
    const result = this.languageManager.setLanguage(langCode);
    if (result) {
      await this.renderDashboard();
      const message = this.languageManager.getSwitchSuccessMessage(langCode);
      this.uiManager.showToast(message, 'success');
    }
    return result;
  }

  /**
   * 时间段变化处理
   * @param {string} period - 时间段
   */
  onPeriodChange(period) {
    this.state.currentPeriod = period;
    const countryCode = this.dataManager.getCurrentCountry();
    const trendData = this.dataManager.getMarketTrend(countryCode, period);
    this.chartManager.renderPriceTrend('priceTrendChart', trendData);
  }

  /**
   * 标签页切换处理
   * @param {string} tab - 标签页 ID
   */
  onTabChange(tab) {
    this.state.currentTab = tab;
    if (tab === 'dashboard') {
      this.renderDashboard();
    }
  }

  /**
   * 执行估价
   * @param {Object} params - 估价参数
   */
  async performValuation(params) {
    try {
      this.uiManager.showValuationLoading();
      
      const result = await this.aiValuationEngine.calculate(
        params.model,
        params.country,
        params.year,
        params.mileage,
        {
          batteryHealth: params.batteryHealth,
          condition: params.condition
        }
      );
      
      this.uiManager.showValuationResult(result, params.country);
      this.saveValuationHistory(params, result);
      
    } catch (error) {
      console.error('Valuation error:', error);
      this.uiManager.showToast('Valuation failed', 'error');
    }
  }

  /**
   * 搜索市场数据
   * @param {Object} params - 搜索参数
   */
  async searchMarketData(params) {
    try {
      this.uiManager.showSearchLoading();
      
      const results = await this.marketSearchEngine.search(params);
      
      this.uiManager.hideSearchLoading();
      this.uiManager.showSearchResults(results, this.currencyManager);
      
    } catch (error) {
      console.error('Search error:', error);
      this.uiManager.hideSearchLoading();
      this.uiManager.showToast('Search failed', 'error');
    }
  }

  /**
   * 保存估价历史
   * @param {Object} params - 估价参数
   * @param {Object} result - 估价结果
   */
  saveValuationHistory(params, result) {
    try {
      const history = JSON.parse(localStorage.getItem('valuationHistory') || '[]');
      history.unshift({
        params,
        result,
        timestamp: new Date().getTime()
      });
      localStorage.setItem('valuationHistory', JSON.stringify(history.slice(0, APP_CONFIG.MAX_VALUATION_HISTORY)));
    } catch (e) {
      console.warn('Save history failed:', e);
    }
  }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
  window.app = new ASEANNEVApp();
  window.app.init();
});

export { ASEANNEVApp };
