import { formatNumber, escapeHtml } from '../utils/helpers.js';
import { 
  renderCountryDropdown, 
  renderCurrencyDropdown 
} from '../components/dropdownRenderer.js';

/**
 * UIManager 类
 * 管理应用的用户界面交互和渲染
 * 
 * 重构要点：
 * 1. 移除了语言切换相关逻辑（已提取到 LanguageSwitcher 组件）
 * 2. 使用通用下拉菜单渲染函数消除重复代码
 * 3. 通过依赖注入提高可测试性
 */
export class UIManager {
  constructor(app, options = {}) {
    this.app = app;
    this.currentTab = 'dashboard';
    this.elements = {};
    this.lastSearchParams = null;
    
    // 依赖注入用于测试
    this.randomGenerator = options.randomGenerator || (() => Math.random());
    this.timeProvider = options.timeProvider || Date;
    
    // 组件引用（由外部注入）
    this.languageSwitcher = null;
    
    // 事件绑定标志（防止重复绑定）
    this._searchBrandBound = false;
    this._marketSearchFormBound = false;
    this._periodTabsBound = false;
  }

  /**
   * 初始化 UI 管理器
   * @returns {UIManager} 当前实例
   */
  init() {
    this.cacheElements();
    this.bindEvents();
    this.initDropdowns();
    this.bindPredictButton();
    this.bindSearchValuationButton();
    return this;
  }

  /**
   * 注入语言切换组件
   * 通过依赖注入降低耦合
   * 
   * @param {LanguageSwitcher} languageSwitcher - 语言切换组件实例
   * @returns {UIManager} 当前实例
   */
  setLanguageSwitcher(languageSwitcher) {
    this.languageSwitcher = languageSwitcher;
    return this;
  }

  cacheElements() {
    this.elements = {
      loadingScreen: document.getElementById('loadingScreen'),
      loadingPercent: document.getElementById('loadingPercent'),
      loadingBar: document.getElementById('loadingBar'),
      loadingStatus: document.getElementById('loadingStatus'),
      app: document.getElementById('app'),
      mobileMenu: document.getElementById('mobileMenu'),
      mobileMenuToggle: document.getElementById('mobileMenuToggle'),
      toastContainer: document.getElementById('toastContainer'),
      offlineIndicator: document.getElementById('offlineIndicator'),
      navItems: document.querySelectorAll('.nav-item, .mobile-nav-item'),
      tabContents: document.querySelectorAll('.tab-content'),
      navLogo: document.getElementById('navLogo'),
      countryMenu: document.getElementById('countryMenu'),
      currencyMenu: document.getElementById('currencyMenu'),
      languageMenu: document.getElementById('languageMenu'),
      currentCountryFlag: document.getElementById('currentCountryFlag'),
      currentCountryName: document.getElementById('currentCountryName'),
      currentCurrency: document.getElementById('currentCurrency'),
      currentCurrencyCode: document.getElementById('currentCurrencyCode'),
      currentLanguage: document.getElementById('currentLanguage'),
      kpiAvgPrice: document.getElementById('kpiAvgPrice'),
      kpiVolume: document.getElementById('kpiVolume'),
      kpiEvRatio: document.getElementById('kpiEvRatio'),
      kpiHotModel: document.getElementById('kpiHotModel'),
      kpiPriceChange: document.getElementById('kpiPriceChange'),
      kpiVolumeChange: document.getElementById('kpiVolumeChange'),
      kpiEvChange: document.getElementById('kpiEvChange'),
      hotModelsBody: document.getElementById('hotModelsBody'),
      valuationForm: document.getElementById('valuationForm'),
      valBrand: document.getElementById('valBrand'),
      valModel: document.getElementById('valModel'),
      valuationResult: document.getElementById('valuationResult'),
      searchBrand: document.getElementById('searchBrand'),
      searchModel: document.getElementById('searchModel'),
      searchPeriod: document.getElementById('searchPeriod'),
      searchCountry: document.getElementById('searchCountry'),
      marketSearchForm: document.getElementById('marketSearchForm'),
      searchResults: document.getElementById('searchResults'),
      searchTableBody: document.getElementById('searchTableBody'),
      biTotalVolume: document.getElementById('biTotalVolume'),
      biAvgPrice: document.getElementById('biAvgPrice'),
      biPriceRange: document.getElementById('biPriceRange'),
      biAvgMonthly: document.getElementById('biAvgMonthly'),
      searchAiContent: document.getElementById('searchAiContent')
    };
  }

  bindEvents() {
    this.elements.navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const tab = e.currentTarget.dataset.tab;
        this.switchTab(tab);
      });
    });

    this.elements.mobileMenuToggle?.addEventListener('click', () => {
      this.elements.mobileMenu?.classList.toggle('hidden');
    });

    // 绑定logo点击返回主页
    this.elements.navLogo?.addEventListener('click', () => {
      this.switchTab('dashboard');
    });

    document.querySelectorAll('.chart-period').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const period = e.target.dataset.period;
        document.querySelectorAll('.chart-period').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.app.onPeriodChange?.(period);
      });
    });

    // 绑定快速搜索按钮
    const quickSearchBtn = document.getElementById('quickSearchBtn');
    if (quickSearchBtn) {
      quickSearchBtn.addEventListener('click', () => {
        this.switchTab('search');
      });
    }

    // 绑定热门搜索链接
    document.querySelectorAll('.quick-search-hints a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const brand = e.currentTarget.dataset.brand;
        const model = e.currentTarget.dataset.model;
        
        if (brand && model) {
          this.switchTab('search');
          // 延迟执行以确保搜索表单已渲染
          setTimeout(() => {
            if (this.elements.searchBrand) {
              this.elements.searchBrand.value = brand;
              // 触发 change 事件加载车型
              this.elements.searchBrand.dispatchEvent(new Event('change'));
              
              // 等待车型加载完成后选择
              setTimeout(() => {
                if (this.elements.searchModel) {
                  this.elements.searchModel.value = model;
                  // 提交搜索
                  if (this.elements.marketSearchForm) {
                    this.elements.marketSearchForm.dispatchEvent(new Event('submit'));
                  }
                }
              }, 100);
            }
          }, 100);
        }
      });
    });
  }

  /**
   * 初始化下拉菜单
   * 使用通用渲染函数消除重复代码
   */
  initDropdowns() {
    const { dataManager, currencyManager } = this.app;
    
    // 空值检查
    if (!dataManager || !currencyManager) {
      console.warn('[UIManager] Required managers not initialized');
      return;
    }
    
    // 国家选择 - 使用通用渲染函数
    const countries = dataManager.getCountryList();
    if (this.elements.countryMenu) {
      renderCountryDropdown(
        this.elements.countryMenu,
        countries,
        dataManager.getCurrentCountry(),
        async (countryCode) => {
          await this.app.switchCountry(countryCode);
        }
      );
    }

    // 货币选择 - 使用通用渲染函数
    const currencies = currencyManager.getCurrencyList();
    if (this.elements.currencyMenu) {
      renderCurrencyDropdown(
        this.elements.currencyMenu,
        currencies,
        currencyManager.getCurrentCurrency(),
        async (currencyCode) => {
          await this.app.switchCurrency(currencyCode || null);
        },
        true // 显示 "本地货币" 选项
      );
    }

    // 语言选择 - 由 LanguageSwitcher 组件处理
    // UIManager 不再直接处理语言下拉菜单
    if (this.languageSwitcher) {
      this.languageSwitcher.init({
        menu: this.elements.languageMenu,
        currentDisplay: this.elements.currentLanguage
      });
    }
  }

  /**
   * 刷新所有下拉菜单
   * 在状态变化后调用
   */
  refreshDropdowns() {
    const { dataManager, currencyManager } = this.app;
    
    // 刷新国家下拉菜单
    if (this.elements.countryMenu) {
      const countries = dataManager.getCountryList();
      renderCountryDropdown(
        this.elements.countryMenu,
        countries,
        dataManager.getCurrentCountry(),
        async (countryCode) => {
          await this.app.switchCountry(countryCode);
        }
      );
    }

    // 刷新货币下拉菜单
    if (this.elements.currencyMenu) {
      const currencies = currencyManager.getCurrencyList();
      renderCurrencyDropdown(
        this.elements.currencyMenu,
        currencies,
        currencyManager.getCurrentCurrency(),
        async (currencyCode) => {
          await this.app.switchCurrency(currencyCode || null);
        },
        true
      );
    }

    // 语言下拉菜单由 LanguageSwitcher 处理
    if (this.languageSwitcher) {
      this.languageSwitcher.refresh();
    }
  }

  switchTab(tab) {
    this.currentTab = tab;
    this.elements.navItems.forEach(item => {
      item.classList.toggle('active', item.dataset.tab === tab);
    });
    this.elements.tabContents.forEach(content => {
      content.classList.toggle('active', content.id === `${tab}Tab`);
      content.classList.toggle('hidden', content.id !== `${tab}Tab`);
    });
    this.app.onTabChange?.(tab);
    this.elements.mobileMenu?.classList.add('hidden');
  }

  updateLoading(progress, status) {
    this.elements.loadingPercent.textContent = progress.toString().padStart(3, '0');
    this.elements.loadingBar.style.width = `${progress}%`;
    if (status) this.elements.loadingStatus.textContent = status;
  }

  hideLoading() {
    this.elements.loadingScreen?.classList.add('fade-out');
    setTimeout(() => {
      this.elements.loadingScreen?.classList.add('hidden');
      this.elements.app?.classList.remove('hidden');
    }, 600);
  }

  updateCountryDisplay(country) {
    if (this.elements.currentCountryFlag) {
      this.elements.currentCountryFlag.textContent = country.flag;
      // 添加脉冲动画
      this.elements.currentCountryFlag.classList.add('flag-pulse');
      setTimeout(() => {
        this.elements.currentCountryFlag?.classList.remove('flag-pulse');
      }, 600);
    }
    if (this.elements.currentCountryName) {
      this.elements.currentCountryName.textContent = country.name;
      // 添加淡入动画
      this.elements.currentCountryName.style.opacity = '0';
      this.elements.currentCountryName.style.transform = 'translateY(-5px)';
      setTimeout(() => {
        if (this.elements.currentCountryName) {
          this.elements.currentCountryName.style.transition = 'all 0.3s ease';
          this.elements.currentCountryName.style.opacity = '1';
          this.elements.currentCountryName.style.transform = 'translateY(0)';
        }
      }, 50);
    }
  }

  showCountrySwitchLoading(countryCode) {
    // 创建加载遮罩
    const dropdown = document.getElementById('countryDropdown');
    if (!dropdown) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'country-switch-overlay';
    overlay.id = 'countrySwitchOverlay';
    overlay.innerHTML = `
      <div class="country-switch-spinner">
        <div class="spinner-ring"></div>
        <span class="country-switch-flag">${this.getCountryFlag(countryCode)}</span>
      </div>
    `;
    document.body.appendChild(overlay);
    
    // 禁用下拉菜单
    dropdown.style.pointerEvents = 'none';
    dropdown.style.opacity = '0.7';
  }

  hideCountrySwitchLoading() {
    const overlay = document.getElementById('countrySwitchOverlay');
    if (overlay) {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 300);
    }
    
    // 恢复下拉菜单
    const dropdown = document.getElementById('countryDropdown');
    if (dropdown) {
      dropdown.style.pointerEvents = '';
      dropdown.style.opacity = '';
    }
  }

  animateCountrySwitch(countryCode) {
    // 国旗弹跳动画
    const flag = this.elements.currentCountryFlag;
    if (flag) {
      flag.style.animation = 'flagBounce 0.6s ease';
      setTimeout(() => {
        flag.style.animation = '';
      }, 600);
    }
  }

  getCountryFlag(countryCode) {
    const flags = {
      th: '🇹🇭', vn: '🇻🇳', id: '🇮🇩', my: '🇲🇾', sg: '🇸🇬',
      ph: '🇵🇭', mm: '🇲🇲', kh: '🇰🇭', la: '🇱🇦', bn: '🇧🇳'
    };
    return flags[countryCode] || '🌏';
  }

  updateCurrencyDisplay(code, symbol, currencyCode) {
    if (this.elements.currentCurrency) this.elements.currentCurrency.textContent = symbol;
    if (this.elements.currentCurrencyCode) this.elements.currentCurrencyCode.textContent = code;
  }

  updateKPI(stats, countryCode) {
    const cm = this.app.currencyManager;
    if (this.elements.kpiAvgPrice) this.elements.kpiAvgPrice.textContent = cm.format(stats.avgPrice, countryCode, { short: true });
    if (this.elements.kpiVolume) this.elements.kpiVolume.textContent = formatNumber(stats.volume);
    if (this.elements.kpiEvRatio) this.elements.kpiEvRatio.textContent = stats.evRatio + '%';
    if (this.elements.kpiHotModel) this.elements.kpiHotModel.textContent = stats.hotModel;
  }

  renderHotModels(models, countryCode) {
    const cm = this.app.currencyManager;
    if (!this.elements.hotModelsBody) return;
    
    this.elements.hotModelsBody.innerHTML = models.map(m => `
      <tr>
        <td><span class="font-bold ${m.rank <= 3 ? 'text-primary' : ''}">${m.rank}</span></td>
        <td>
          <div class="flex items-center gap-2">
            <span class="font-medium">${escapeHtml(m.model)}</span>
            <span class="text-xs px-2 py-0.5 bg-slate-100 rounded">${escapeHtml(m.category)}</span>
          </div>
        </td>
        <td>${escapeHtml(m.brand)}</td>
        <td class="font-medium">${cm.format(m.avgPrice, countryCode)}</td>
        <td><span class="${parseFloat(m.change) >= 0 ? 'text-green-500' : 'text-red-500'}">${parseFloat(m.change) >= 0 ? '+' : ''}${escapeHtml(m.change)}%</span></td>
        <td>${formatNumber(m.volume)}</td>
      </tr>
    `).join('');
  }

  renderAIInsights(insights) {
    const container = document.getElementById('aiInsightContent');
    if (!container || !insights) return;
    
    // 获取语言管理器进行翻译
    const languageManager = this.app?.languageManager;
    
    container.innerHTML = insights.map(item => {
      // 使用翻译键获取翻译，如果不存在则使用原始值
      const title = languageManager?.t(item.titleKey) || item.title || '';
      const text = languageManager?.t(item.textKey) || item.text || '';
      
      return `
        <div class="ai-insight-item">
          <div class="ai-insight-icon"><i class="fas ${escapeHtml(item.icon)}"></i></div>
          <div class="ai-insight-text">
            <h4>${escapeHtml(title)}</h4>
            <p>${escapeHtml(text)}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  showToast(message, type = 'info', duration = 3000) {
    const safeMessage = escapeHtml(message);
    const toast = document.createElement('div');
    toast.className = `toast ${escapeHtml(type)}`;
    toast.innerHTML = `
      <span class="toast-message">${safeMessage}</span>
      <button class="toast-close"><i class="fas fa-times"></i></button>
    `;
    toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
    this.elements.toastContainer?.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  showOfflineIndicator(show) {
    this.elements.offlineIndicator?.classList.toggle('hidden', !show);
  }

  populateBrandSelect() {
    const brands = this.app.dataManager.getBrands();
    if (this.elements.valBrand) {
      this.elements.valBrand.innerHTML = `
        <option value="">Select Brand</option>
        ${brands.map(b => `<option value="${escapeHtml(b.id)}">${escapeHtml(b.logo)} ${escapeHtml(b.name)}</option>`).join('')}
      `;
    }
  }

  populateYearSelect() {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 15 }, (_, i) => currentYear - i);
    const yearSelect = document.getElementById('valYear');
    if (yearSelect) {
      yearSelect.innerHTML = `
        <option value="">Select Year</option>
        ${years.map(y => `<option value="${y}">${y}</option>`).join('')}
      `;
    }
  }

  populateCountrySelect() {
    const countries = this.app.dataManager.getCountryList();
    const select = document.getElementById('valCountry');
    if (select) {
      select.innerHTML = countries.map(c => 
        `<option value="${escapeHtml(c.code)}" ${c.code === this.app.dataManager.getCurrentCountry() ? 'selected' : ''}>
          ${escapeHtml(c.flag)} ${escapeHtml(c.name)}
        </option>`
      ).join('');
    }
  }

  populateSearchForm() {
    const brands = this.app.dataManager.getBrands();
    const countries = this.app.dataManager.getCountryList();
    const t = this.app.languageManager?.t.bind(this.app.languageManager);
    
    // 重新获取搜索表单元素（确保引用最新）
    this.elements.searchBrand = document.getElementById('searchBrand');
    this.elements.searchModel = document.getElementById('searchModel');
    this.elements.searchPeriod = document.getElementById('searchPeriod');
    this.elements.searchCountry = document.getElementById('searchCountry');
    this.elements.marketSearchForm = document.getElementById('marketSearchForm');
    this.elements.searchResults = document.getElementById('searchResults');
    this.elements.searchTableBody = document.getElementById('searchTableBody');
    this.elements.biTotalVolume = document.getElementById('biTotalVolume');
    this.elements.biAvgPrice = document.getElementById('biAvgPrice');
    this.elements.biPriceRange = document.getElementById('biPriceRange');
    this.elements.biAvgMonthly = document.getElementById('biAvgMonthly');
    this.elements.searchAiContent = document.getElementById('searchAiContent');
    
    // 保存当前选中的值
    const currentBrand = this.elements.searchBrand?.value;
    const currentModel = this.elements.searchModel?.value;
    const currentPeriod = this.elements.searchPeriod?.value || '12m';
    const currentCountry = this.elements.searchCountry?.value || 'all';
    
    // 填充品牌选择
    if (this.elements.searchBrand) {
      this.elements.searchBrand.innerHTML = `
        <option value="">${t ? t('search.selectBrand', 'Select Brand') : 'Select Brand'}</option>
        ${brands.map(b => `<option value="${b.id}">${b.logo} ${b.name}</option>`).join('')}
      `;
      // 恢复之前选中的值
      if (currentBrand) {
        this.elements.searchBrand.value = currentBrand;
      }
    }
    
    // 填充车型选择（如果已选择品牌）
    if (this.elements.searchModel) {
      if (currentBrand) {
        const models = this.app.dataManager.getModelsByBrand(currentBrand);
        this.elements.searchModel.innerHTML = `
          <option value="">${t ? t('search.selectModel', 'Select Model') : 'Select Model'}</option>
          ${models.map(m => `<option value="${escapeHtml(m.id)}">${escapeHtml(m.name)}</option>`).join('')}
        `;
        this.elements.searchModel.disabled = false;
        if (currentModel) {
          this.elements.searchModel.value = currentModel;
        }
      } else {
        this.elements.searchModel.innerHTML = `<option value="">${t ? t('search.selectModel', 'Select Model') : 'Select Model'}</option>`;
        this.elements.searchModel.disabled = true;
      }
    }
    
    // 填充周期选择
    if (this.elements.searchPeriod) {
      this.elements.searchPeriod.innerHTML = `
        <option value="12m" ${currentPeriod === '12m' ? 'selected' : ''}>${t ? t('search.period.12m', 'Last 12 Months') : 'Last 12 Months'}</option>
        <option value="6m" ${currentPeriod === '6m' ? 'selected' : ''}>${t ? t('search.period.6m', 'Last 6 Months') : 'Last 6 Months'}</option>
        <option value="3m" ${currentPeriod === '3m' ? 'selected' : ''}>${t ? t('search.period.3m', 'Last 3 Months') : 'Last 3 Months'}</option>
      `;
    }
    
    // 填充国家选择
    if (this.elements.searchCountry) {
      this.elements.searchCountry.innerHTML = `
        <option value="all">${t ? t('search.allCountries', 'All Countries') : 'All Countries'}</option>
        ${countries.map(c => `<option value="${escapeHtml(c.code)}" ${c.code === currentCountry ? 'selected' : ''}>${escapeHtml(c.flag)} ${escapeHtml(c.name)}</option>`).join('')}
      `;
    }
    
    // 绑定品牌选择事件（只绑定一次）
    if (this.elements.searchBrand && !this._searchBrandBound) {
      this.elements.searchBrand.addEventListener('change', (e) => {
        const models = this.app.dataManager.getModelsByBrand(e.target.value);
        if (this.elements.searchModel) {
          this.elements.searchModel.innerHTML = `
            <option value="">${t ? t('search.selectModel', 'Select Model') : 'Select Model'}</option>
            ${models.map(m => `<option value="${escapeHtml(m.id)}">${escapeHtml(m.name)}</option>`).join('')}
          `;
          this.elements.searchModel.disabled = false;
        }
      });
      this._searchBrandBound = true;
    }
    
    // 绑定表单提交事件（只绑定一次）
    if (this.elements.marketSearchForm && !this._marketSearchFormBound) {
      this.elements.marketSearchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const params = {
          brand: this.elements.searchBrand?.value,
          model: this.elements.searchModel?.value,
          period: this.elements.searchPeriod?.value || '12m',
          country: this.elements.searchCountry?.value || 'all'
        };
        if (!params.brand || !params.model) {
          this.showToast(t ? t('search.pleaseSelect', 'Please select brand and model') : 'Please select brand and model', 'warning');
          return;
        }
        this.lastSearchParams = params;
        this.app.searchMarketData(params);
      });
      this._marketSearchFormBound = true;
    }
  }

  showSearchLoading() {
    const t = this.app.languageManager?.t.bind(this.app.languageManager);
    const overlay = document.createElement('div');
    overlay.className = 'search-loading-overlay';
    overlay.id = 'searchLoadingOverlay';
    
    // 加载状态文本（模拟搜索步骤）
    const steps = [
      t ? t('search.step1', 'Connecting to database...') : 'Connecting to database...',
      t ? t('search.step2', 'Analyzing market data...') : 'Analyzing market data...',
      t ? t('search.step3', 'Calculating price trends...') : 'Calculating price trends...',
      t ? t('search.step4', 'Generating insights...') : 'Generating insights...'
    ];
    
    overlay.innerHTML = `
      <div class="search-loading-content">
        <div class="search-loading-icon">
          <div class="search-loading-spinner">
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <i class="fas fa-search"></i>
          </div>
        </div>
        <div class="search-loading-text">${t ? t('search.loading', 'Searching market data...') : 'Searching market data...'}</div>
        <div class="search-loading-status" id="searchLoadingStatus">${steps[0]}</div>
        <div class="search-loading-bar">
          <div id="searchLoadingProgress" class="search-loading-progress" style="width: 0%"></div>
        </div>
        <div class="search-loading-percentage" id="searchLoadingPercentage">0%</div>
      </div>
    `;
    document.body.appendChild(overlay);
    
    let progress = 0;
    let stepIndex = 0;
    const totalSteps = steps.length;
    
    this._loadingInterval = setInterval(() => {
      // 非线性进度增长，模拟真实加载
      const increment = progress < 30 ? 5 : progress < 60 ? 3 : progress < 85 ? 2 : 1;
      progress = Math.min(progress + increment, 95);
      
      const bar = document.getElementById('searchLoadingProgress');
      const percentage = document.getElementById('searchLoadingPercentage');
      const status = document.getElementById('searchLoadingStatus');
      
      if (bar) bar.style.width = `${progress}%`;
      if (percentage) percentage.textContent = `${progress}%`;
      
      // 更新状态文本
      if (status && progress < 95) {
        const newStepIndex = Math.min(Math.floor((progress / 100) * totalSteps), totalSteps - 1);
        if (newStepIndex !== stepIndex) {
          stepIndex = newStepIndex;
          status.style.opacity = '0';
          setTimeout(() => {
            if (status) {
              status.textContent = steps[stepIndex];
              status.style.opacity = '1';
            }
          }, 200);
        }
      }
      
      if (progress >= 95) clearInterval(this._loadingInterval);
    }, 150);
  }

  hideSearchLoading() {
    if (this._loadingInterval) {
      clearInterval(this._loadingInterval);
      this._loadingInterval = null;
    }
    
    const overlay = document.getElementById('searchLoadingOverlay');
    if (overlay) {
      // 完成动画：快速填满进度条
      const bar = document.getElementById('searchLoadingProgress');
      const percentage = document.getElementById('searchLoadingPercentage');
      if (bar) bar.style.width = '100%';
      if (percentage) percentage.textContent = '100%';
      
      setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 300);
      }, 300);
    }
  }

  hideSearchLoading() {
    const overlay = document.getElementById('searchLoadingOverlay');
    if (overlay) {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 300);
    }
  }

  showSearchResults(results, currencyManager) {
    if (!results) return;
    if (this.elements.searchResults) {
      this.elements.searchResults.classList.remove('hidden');
    }
    
    const countryCode = results.country === 'all' ? 'th' : results.country;
    const { summary, monthlyData, priceDistribution } = results;
    
    if (this.elements.biTotalVolume) this.elements.biTotalVolume.textContent = formatNumber(summary.totalVolume) + ' units';
    if (this.elements.biAvgPrice) this.elements.biAvgPrice.textContent = currencyManager.format(summary.avgPrice, countryCode, { short: true });
    if (this.elements.biPriceRange) this.elements.biPriceRange.textContent = summary.priceRange;
    if (this.elements.biAvgMonthly) this.elements.biAvgMonthly.textContent = formatNumber(summary.avgMonthlyVolume) + ' units';
    
    // 渲染销量趋势和价格趋势图表
    this.renderSearchCharts(monthlyData, currencyManager, countryCode);
    
    // 渲染近期单车成交价
    this.renderRecentDeals(monthlyData, currencyManager, countryCode);
    
    // 渲染价格分布图表
    if (priceDistribution) {
      this.renderPriceDistributionChart(priceDistribution, currencyManager, countryCode);
    }
    
    this.renderSearchTable(monthlyData, currencyManager, countryCode);
    this.generateSearchAiSuggestions(results, currencyManager, countryCode);
    this.bindSearchActionButtons();
    
    this.elements.searchResults?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  renderSearchTable(monthlyData, currencyManager, countryCode) {
    if (!this.elements.searchTableBody) return;
    
    this.elements.searchTableBody.innerHTML = monthlyData.map(row => {
      const changeClass = row.changePercent > 0 ? 'trend-up' : row.changePercent < 0 ? 'trend-down' : 'trend-stable';
      return `
        <tr>
          <td><strong>${escapeHtml(row.month)}</strong></td>
          <td>${formatNumber(row.volume)}</td>
          <td class="font-medium">${currencyManager.format(row.avgPrice, countryCode, { short: true })}</td>
          <td class="text-gray-500">${currencyManager.format(row.maxPrice, countryCode, { short: true })}</td>
          <td class="text-gray-500">${currencyManager.format(row.minPrice, countryCode, { short: true })}</td>
          <td class="${changeClass}">${Math.abs(row.changePercent)}%</td>
          <td>${currencyManager.format(row.totalValue, countryCode, { short: true })}</td>
        </tr>
      `;
    }).join('');
  }

  generateSearchAiSuggestions(results, currencyManager, countryCode) {
    const aiContent = document.getElementById('searchAiContent');
    if (!aiContent || !results) return;
    
    const t = this.app.languageManager?.t.bind(this.app.languageManager);
    const { summary, monthlyData } = results;
    const lastMonth = monthlyData[monthlyData.length - 1];
    
    // 根据销量趋势生成市场建议
    let marketAdviceKey = 'ai.search.advice.stable';
    if (summary.volumeTrend > 10) marketAdviceKey = 'ai.search.advice.strong';
    else if (summary.volumeTrend < -10) marketAdviceKey = 'ai.search.advice.weak';
    
    const marketAdvice = t ? t(marketAdviceKey) : 
      (summary.volumeTrend > 10 ? 'Current market demand is strong. Consider higher pricing.' :
       summary.volumeTrend < -10 ? 'Current market demand is weak. Consider price reduction.' :
       'Current market demand is stable. Price at mid-range.');
    
    const avgDays = 15 + Math.floor(this.randomGenerator() * 10);
    const bestPrice = currencyManager.format(lastMonth.avgPrice, countryCode, { short: true });
    
    // 使用翻译键
    const marketAdviceTitle = t ? t('ai.search.marketAdvice', 'Market Advice') : 'Market Advice';
    const priceTrendTitle = t ? t('ai.search.priceTrendAdvice', 'Price Trend') : 'Price Trend';
    const tradingAdviceTitle = t ? t('ai.search.tradingAdvice', 'Trading Advice') : 'Trading Advice';
    
    // 处理趋势分析文本（带变量替换）
    let trendAnalysisText = `Last ${monthlyData.length} months trend analysis available.`;
    if (t) {
      const trendTemplate = t('ai.search.trendAnalysis', '{months} months trend analysis available');
      trendAnalysisText = trendTemplate.replace('{months}', monthlyData.length);
    }
    
    // 处理交易建议文本（带变量替换）
    let tradingText = `Recommended: ${bestPrice}; Est. sale time: ${avgDays}-${avgDays + 5} days.`;
    if (t) {
      const tradingTemplate = t('ai.search.recommendedPrice', 'Recommended: {price}; Est. sale time: {minDays}-{maxDays} days');
      tradingText = tradingTemplate
        .replace('{price}', bestPrice)
        .replace('{minDays}', avgDays)
        .replace('{maxDays}', avgDays + 5);
    }
    
    aiContent.innerHTML = `
      <div class="bi-ai-item">
        <i class="fas fa-lightbulb text-yellow-500"></i>
        <div class="bi-ai-text">
          <strong>${escapeHtml(marketAdviceTitle)}</strong>
          <p>${escapeHtml(marketAdvice)}</p>
        </div>
      </div>
      <div class="bi-ai-item">
        <i class="fas fa-chart-line text-green-500"></i>
        <div class="bi-ai-text">
          <strong>${escapeHtml(priceTrendTitle)}</strong>
          <p>${escapeHtml(trendAnalysisText)}</p>
        </div>
      </div>
      <div class="bi-ai-item">
        <i class="fas fa-handshake text-blue-500"></i>
        <div class="bi-ai-text">
          <strong>${escapeHtml(tradingAdviceTitle)}</strong>
          <p>${escapeHtml(tradingText)}</p>
        </div>
      </div>
    `;
  }

  /**
   * 渲染搜索结果图表（销量趋势和价格趋势）
   */
  renderSearchCharts(monthlyData, currencyManager, countryCode) {
    const t = this.app.languageManager?.t.bind(this.app.languageManager);
    
    // 销量趋势图表
    const volumeChartDiv = document.getElementById('searchVolumeChart');
    if (volumeChartDiv && typeof echarts !== 'undefined') {
      const chart = echarts.init(volumeChartDiv);
      chart.setOption({
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          textStyle: { color: '#1e293b' },
          formatter: (params) => {
            const p = params[0];
            return `<div style="font-weight:600">${p.name}</div>
                    <div style="color:#14b8a6">● ${p.value.toLocaleString()} ${t ? t('units.vehicle', '辆') : '辆'}</div>`;
          }
        },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
        xAxis: {
          type: 'category',
          data: monthlyData.map(d => d.month),
          axisLine: { lineStyle: { color: '#e2e8f0' } },
          axisLabel: { color: '#64748b', fontSize: 10 }
        },
        yAxis: {
          type: 'value',
          axisLine: { show: false },
          axisLabel: { color: '#64748b', fontSize: 10 },
          splitLine: { lineStyle: { color: '#f1f5f9' } }
        },
        series: [{
          type: 'line',
          data: monthlyData.map(d => d.volume),
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: '#14b8a6', width: 2 },
          itemStyle: { color: '#14b8a6' },
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(20, 184, 166, 0.3)' },
                { offset: 1, color: 'rgba(20, 184, 166, 0.05)' }
              ]
            }
          }
        }]
      });
    }

    // 价格趋势图表
    const priceChartDiv = document.getElementById('searchPriceChart');
    if (priceChartDiv && typeof echarts !== 'undefined') {
      const chart = echarts.init(priceChartDiv);
      chart.setOption({
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          textStyle: { color: '#1e293b' },
          formatter: (params) => {
            const p = params[0];
            return `<div style="font-weight:600">${p.name}</div>
                    <div style="color:#3b82f6">● ${currencyManager.format(p.value, countryCode)}</div>`;
          }
        },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
        xAxis: {
          type: 'category',
          data: monthlyData.map(d => d.month),
          axisLine: { lineStyle: { color: '#e2e8f0' } },
          axisLabel: { color: '#64748b', fontSize: 10 }
        },
        yAxis: {
          type: 'value',
          axisLine: { show: false },
          axisLabel: { 
            color: '#64748b', 
            fontSize: 10,
            formatter: (value) => currencyManager.format(value, countryCode, { short: true })
          },
          splitLine: { lineStyle: { color: '#f1f5f9' } }
        },
        series: [{
          type: 'line',
          data: monthlyData.map(d => d.avgPrice),
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: '#3b82f6', width: 2 },
          itemStyle: { color: '#3b82f6' },
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
              ]
            }
          }
        }]
      });
    }
  }

  /**
   * 渲染近期单车成交价
   */
  renderRecentDeals(monthlyData, currencyManager, countryCode) {
    const lastMonth = monthlyData[monthlyData.length - 1];
    const prevMonth = monthlyData[monthlyData.length - 2] || lastMonth;
    const t = this.app.languageManager?.t.bind(this.app.languageManager);
    const currentLang = this.app.languageManager?.getCurrentLanguage() || 'zh';
    
    // 填充统计数据
    const recentAvgPrice = document.getElementById('recentAvgPrice');
    const recentPriceChange = document.getElementById('recentPriceChange');
    const recentVolume = document.getElementById('recentVolume');
    const recentMaxPrice = document.getElementById('recentMaxPrice');
    const recentMinPrice = document.getElementById('recentMinPrice');
    
    if (recentAvgPrice) {
      recentAvgPrice.textContent = currencyManager.format(lastMonth.avgPrice, countryCode, { short: true });
    }
    if (recentPriceChange) {
      const change = lastMonth.avgPrice - prevMonth.avgPrice;
      const changePercent = prevMonth.avgPrice !== 0 ? (change / prevMonth.avgPrice * 100) : 0;
      const sign = change >= 0 ? '+' : '';
      recentPriceChange.textContent = `${sign}${changePercent.toFixed(1)}%`;
      recentPriceChange.className = `recent-stat-change ${change >= 0 ? 'positive' : 'negative'}`;
    }
    if (recentVolume) {
      recentVolume.textContent = formatNumber(lastMonth.volume);
    }
    if (recentMaxPrice) {
      recentMaxPrice.textContent = currencyManager.format(lastMonth.maxPrice, countryCode, { short: true });
    }
    if (recentMinPrice) {
      recentMinPrice.textContent = currencyManager.format(lastMonth.minPrice, countryCode, { short: true });
    }
    
    // 绑定周期切换按钮事件（只绑定一次）
    if (!this._periodTabsBound) {
      document.querySelectorAll('.period-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
          // 更新按钮状态
          document.querySelectorAll('.period-tab').forEach(t => t.classList.remove('active'));
          e.target.classList.add('active');
          
          // 获取天数并重新渲染图表
          const days = parseInt(e.target.dataset.days) || 7;
          this.renderRecentPriceChart(days, lastMonth.avgPrice, currencyManager, countryCode);
        });
      });
      this._periodTabsBound = true;
    }
    
    // 默认渲染7天数据
    this.renderRecentPriceChart(7, lastMonth.avgPrice, currencyManager, countryCode);
    
    // 生成最近成交记录列表
    const recentDealsList = document.getElementById('recentDealsList');
    if (recentDealsList) {
      const deals = [];
      for (let i = 0; i < 5; i++) {
        const priceVariation = (Math.random() - 0.5) * 0.1;
        deals.push({
          price: Math.round(lastMonth.avgPrice * (1 + priceVariation)),
          daysAgo: i + 1
        });
      }
      
      recentDealsList.innerHTML = deals.map(deal => `
        <div class="recent-deal-item">
          <span class="deal-price">${currencyManager.format(deal.price, countryCode)}</span>
          <span class="deal-time">${deal.daysAgo}${t ? t('days.ago', '天前') : '天前'}</span>
        </div>
      `).join('');
    }
  }

  /**
   * 渲染近期成交价趋势图
   * @param {number} days - 天数（7或30）
   * @param {number} basePrice - 基础价格
   * @param {Object} currencyManager - 货币管理器
   * @param {string} countryCode - 国家代码
   */
  renderRecentPriceChart(days, basePrice, currencyManager, countryCode) {
    const recentChartDiv = document.getElementById('recentPriceChart');
    if (!recentChartDiv || typeof echarts === 'undefined') return;
    
    const currentLang = this.app.languageManager?.getCurrentLanguage() || 'zh';
    const locale = currentLang === 'zh' ? 'zh-CN' : 'en-US';
    const t = this.app.languageManager?.t.bind(this.app.languageManager);
    
    const chart = echarts.getInstanceByDom(recentChartDiv) || echarts.init(recentChartDiv);
    const now = new Date();
    const dayData = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const priceVariation = (Math.random() - 0.5) * 0.05;
      dayData.push({
        day: date.toLocaleDateString(locale, { month: 'short', day: 'numeric' }),
        price: Math.round(basePrice * (1 + priceVariation))
      });
    }
    
    chart.setOption({
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: { color: '#1e293b' },
        formatter: (params) => {
          const p = params[0];
          return `<div style="font-weight:600">${p.name}</div>
                  <div style="color:#14b8a6">● ${currencyManager.format(p.value, countryCode)}</div>`;
        }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        data: dayData.map(d => d.day),
        axisLine: { show: false },
        axisLabel: { color: '#64748b', fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        show: false
      },
      series: [{
        type: 'bar',
        data: dayData.map(d => d.price),
        barWidth: '60%',
        itemStyle: {
          color: '#14b8a6',
          borderRadius: [4, 4, 0, 0]
        }
      }]
    });
  }

  /**
   * 渲染价格分布图表
   */
  renderPriceDistributionChart(priceDistribution, currencyManager, countryCode) {
    const chartDiv = document.getElementById('searchPriceDistChart');
    if (!chartDiv || typeof echarts === 'undefined') return;
    
    const chart = echarts.init(chartDiv);
    const t = this.app.languageManager?.t.bind(this.app.languageManager);
    
    chart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}%'
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        textStyle: { color: '#64748b', fontSize: 11 }
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        data: priceDistribution.map(item => ({
          name: item.range,
          value: item.percentage
        }))
      }]
    });
  }

  bindSearchActionButtons() {
    const valuationBtn = document.getElementById('searchToValuationBtn');
    const predictionBtn = document.getElementById('searchToPredictionBtn');
    
    if (valuationBtn) {
      valuationBtn.onclick = () => this.openValuationModal();
    }
    if (predictionBtn) {
      predictionBtn.onclick = () => {
        this.switchTab('prediction');
      };
    }
  }

  bindPredictButton() {
    const predictBtn = document.getElementById('predictBtn');
    const modalClose = document.getElementById('aiModalClose');
    const modal = document.getElementById('aiPredictModal');
    
    predictBtn?.addEventListener('click', () => this.openAIPredictModal());
    modalClose?.addEventListener('click', () => this.closeAIPredictModal());
    modal?.querySelector('.ai-modal-overlay')?.addEventListener('click', () => this.closeAIPredictModal());
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal?.classList.contains('hidden')) {
        this.closeAIPredictModal();
      }
    });
  }

  async openAIPredictModal() {
    const modal = document.getElementById('aiPredictModal');
    const loading = document.getElementById('aiPredictLoading');
    const result = document.getElementById('aiPredictResult');
    
    if (!modal) return;
    modal.classList.remove('hidden');
    loading.classList.remove('hidden');
    result.classList.add('hidden');
    
    try {
      const countryCode = this.app.dataManager.getCurrentCountry() || 'th';
      const prediction = await this.app.aiMarketPredictor.predict('atto3', countryCode, 3);
      this.renderAIPredictResult(prediction, countryCode);
      loading.classList.add('hidden');
      result.classList.remove('hidden');
    } catch (error) {
      console.error('Prediction error:', error);
      loading.innerHTML = '<p style="color:red">Prediction failed</p>';
    }
  }

  closeAIPredictModal() {
    document.getElementById('aiPredictModal')?.classList.add('hidden');
  }

  renderAIPredictResult(prediction, countryCode) {
    const container = document.getElementById('aiPredictResult');
    if (!container) return;
    
    const country = this.app.dataManager.getCountry(countryCode);
    const symbol = country?.currency?.symbol || '฿';
    const trendClass = prediction.changePercent > 0 ? 'up' : prediction.changePercent < 0 ? 'down' : 'stable';
    const trendIcon = prediction.changePercent > 0 ? 'fa-arrow-trend-up' : prediction.changePercent < 0 ? 'fa-arrow-trend-down' : 'fa-minus';
    
    const formatPrice = (price) => price >= 1000000 ? (price / 1000000).toFixed(2) + 'M' : (price / 1000).toFixed(1) + 'K';
    
    container.innerHTML = `
      <div class="ai-trend-indicator ${trendClass}">
        <i class="fas ${trendIcon}"></i>
        <span>${prediction.changePercent > 0 ? 'Up' : prediction.changePercent < 0 ? 'Down' : 'Stable'} ${Math.abs(prediction.changePercent)}%</span>
      </div>
      <div class="ai-predict-summary">
        <div class="ai-summary-item">
          <div class="ai-summary-label">Current</div>
          <div class="ai-summary-value">${symbol}${formatPrice(prediction.currentPrice)}</div>
        </div>
        <div class="ai-summary-item">
          <div class="ai-summary-label">Predicted</div>
          <div class="ai-summary-value ${trendClass}">${symbol}${formatPrice(prediction.predictedPrice)}</div>
        </div>
        <div class="ai-summary-item">
          <div class="ai-summary-label">Period</div>
          <div class="ai-summary-value">3 months</div>
        </div>
      </div>
      <div class="ai-confidence">
        <span>AI Confidence</span>
        <div class="ai-confidence-bar"><div class="ai-confidence-fill" style="width: ${prediction.confidence}%"></div></div>
        <span>${prediction.confidence}%</span>
      </div>
      <div class="ai-recommendation">
        <div class="ai-recommendation-title"><i class="fas fa-lightbulb text-yellow-500"></i><span>AI Recommendation</span></div>
        <div class="ai-recommendation-text">${escapeHtml(prediction.recommendation)}</div>
      </div>
    `;
  }

  bindSearchValuationButton() {
    const modalClose = document.getElementById('valuationModalClose');
    const modal = document.getElementById('valuationModal');
    
    modalClose?.addEventListener('click', () => this.closeValuationModal());
    modal?.querySelector('.ai-modal-overlay')?.addEventListener('click', () => this.closeValuationModal());
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal?.classList.contains('hidden')) {
        this.closeValuationModal();
      }
    });
  }

  async openValuationModal() {
    const modal = document.getElementById('valuationModal');
    const loading = document.getElementById('valuationModalLoading');
    const result = document.getElementById('valuationModalResult');
    
    if (!modal) return;
    if (!this.lastSearchParams) {
      this.showToast('Please search first', 'warning');
      return;
    }
    
    modal.classList.remove('hidden');
    loading.classList.remove('hidden');
    result.classList.add('hidden');
    
    try {
      const { brand, model, country } = this.lastSearchParams;
      const countryCode = country || 'th';
      const basePrice = this.app.dataManager.getBasePrice?.(brand, model, countryCode) || 1200000;
      const recommendedPrice = Math.round(basePrice * (0.95 + this.randomGenerator() * 0.1));
      
      const priceTrend = [];
      const now = new this.timeProvider();
      for (let i = 6; i >= 0; i--) {
        const date = new this.timeProvider(now);
        date.setDate(date.getDate() - i);
        priceTrend.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          price: Math.round(basePrice * (0.98 + this.randomGenerator() * 0.04))
        });
      }
      
      const brandInfo = this.app.dataManager.getBrands().find(b => b.id === brand);
      const models = this.app.dataManager.getModelsByBrand(brand);
      const modelInfo = models.find(m => m.id === model);
      
      this.renderValuationModalResult({
        modelInfo: { brand: brandInfo?.name || brand, model: modelInfo?.name || model, logo: brandInfo?.logo || '🚗' },
        priceTrend,
        recommendedPrice,
        priceRange: { min: Math.round(recommendedPrice * 0.92), max: Math.round(recommendedPrice * 1.08) },
        countryCode
      });
      
      loading.classList.add('hidden');
      result.classList.remove('hidden');
    } catch (error) {
      console.error('Valuation modal error:', error);
      loading.innerHTML = '<p style="color:red">Valuation failed</p>';
    }
  }

  closeValuationModal() {
    document.getElementById('valuationModal')?.classList.add('hidden');
  }

  renderValuationModalResult(data) {
    const container = document.getElementById('valuationModalResult');
    if (!container) return;
    
    const cm = this.app.currencyManager;
    const t = this.app.languageManager?.t.bind(this.app.languageManager);
    const formatPrice = (price) => cm.format(price, data.countryCode, { short: true });
    
    const marketText = t ? t('valuation.market', 'Market') : 'Market';
    const aiRecommendedText = t ? t('valuation.aiRecommended', 'AI Recommended Price') : 'AI Recommended Price';
    const priceRangeText = t ? t('valuation.priceRange', 'Price Range') : 'Price Range';
    const aiConfidenceText = t ? t('valuation.aiConfidence', 'AI Confidence') : 'AI Confidence';
    const confidenceValue = t ? t('valuation.confidenceValue', '92%') : '92%';
    const trendText = t ? t('valuation.7dayTrend', '7-Day Price Trend') : '7-Day Price Trend';
    const closeText = t ? t('btn.close', 'Close') : 'Close';
    const detailedText = t ? t('btn.detailedValuation', 'Detailed Valuation') : 'Detailed Valuation';
    
    container.innerHTML = `
      <div class="ai-valuation-header">
        <div class="ai-valuation-model">
          <span class="ai-valuation-logo">${data.modelInfo.logo}</span>
          <div class="ai-valuation-name">
            <h4>${escapeHtml(data.modelInfo.brand)} ${escapeHtml(data.modelInfo.model)}</h4>
            <span class="ai-valuation-subtitle">${data.countryCode.toUpperCase()} ${marketText}</span>
          </div>
        </div>
      </div>
      <div class="ai-valuation-price-card">
        <div class="ai-valuation-price-label">${aiRecommendedText}</div>
        <div class="ai-valuation-price-value">${formatPrice(data.recommendedPrice)}</div>
        <div class="ai-valuation-price-range">${priceRangeText}: ${formatPrice(data.priceRange.min)} - ${formatPrice(data.priceRange.max)}</div>
        <div class="ai-valuation-confidence"><i class="fas fa-shield-alt"></i><span>${aiConfidenceText} ${confidenceValue}</span></div>
      </div>
      <div class="ai-valuation-trend-section">
        <div class="ai-valuation-section-title"><i class="fas fa-chart-line"></i><span>${trendText}</span></div>
        <div id="valuationTrendChart" style="height:180px"></div>
      </div>
      <div class="ai-valuation-actions">
        <button class="btn-secondary" onclick="document.getElementById('valuationModalClose').click()">${closeText}</button>
        <button class="btn-primary" onclick="document.getElementById('valuationModalClose').click();window.app.switchTab('valuation')">${detailedText}</button>
      </div>
    `;
    
    setTimeout(() => this.renderValuationChart(data.priceTrend), 100);
  }

  renderValuationChart(data) {
    const chartDiv = document.getElementById('valuationTrendChart');
    if (!chartDiv || typeof echarts === 'undefined') return;
    
    const chart = echarts.init(chartDiv);
    chart.setOption({
      grid: { left: 10, right: 10, top: 10, bottom: 20 },
      xAxis: { type: 'category', data: data.map(d => d.date), axisLine: { lineStyle: { color: '#e2e8f0' } }, axisLabel: { color: '#64748b', fontSize: 10 } },
      yAxis: { type: 'value', show: false },
      series: [{ type: 'line', data: data.map(d => d.price), smooth: true, symbol: 'circle', lineStyle: { color: '#14b8a6', width: 2 }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(20, 184, 166, 0.3)' }, { offset: 1, color: 'rgba(20, 184, 166, 0.05)' }] } } }]
    });
  }
}

export default UIManager;
