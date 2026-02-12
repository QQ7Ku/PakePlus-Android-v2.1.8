/**
 * Language Switcher Component
 * 语言切换组件
 * 
 * 专门处理语言切换的 UI 逻辑，降低与 UIManager 的耦合
 */

import { renderDropdownMenu, createDropdownItem } from './dropdownRenderer.js';
import { escapeHtml } from '../utils/helpers.js';

export class LanguageSwitcher {
  constructor(options = {}) {
    // 依赖注入，便于测试
    this.languageManager = options.languageManager;
    this.uiManager = options.uiManager;
    this.onLanguageChange = options.onLanguageChange;
    this.showToast = options.showToast;

    // DOM 元素缓存
    this.elements = {
      menu: null,
      currentLabel: null
    };

    // 取消订阅函数
    this.unsubscribe = null;
  }

  /**
   * 初始化组件
   * @param {Object} elements - DOM 元素配置
   * @param {HTMLElement} elements.menu - 语言菜单容器
   * @param {HTMLElement} elements.currentLabel - 当前语言显示元素
   */
  init(elements) {
    this.elements.menu = elements?.menu;
    this.elements.currentLabel = elements?.currentLabel || elements?.currentDisplay;

    if (!this.languageManager) {
      console.warn('LanguageManager not provided');
      return this;
    }

    // 渲染语言下拉菜单
    this.renderLanguageMenu();

    // 订阅语言变化事件
    this.unsubscribe = this.languageManager.onLanguageChange?.((langCode) => {
      this.handleLanguageChange(langCode);
    });

    // 初始化显示
    this.updateCurrentLanguageDisplay();

    return this;
  }

  /**
   * 渲染语言选择菜单
   */
  renderLanguageMenu() {
    if (!this.elements.menu) return;

    const languages = this.languageManager.getLanguageList();
    const currentLang = this.languageManager.getCurrentLanguage();

    renderDropdownMenu(
      this.elements.menu,
      languages,
      (lang) => this.createLanguageItem(lang, currentLang),
      (langCode) => this.switchLanguage(langCode)
    );
  }

  /**
   * 创建语言菜单项
   * @param {Object} lang - 语言对象
   * @param {string} currentLang - 当前语言代码
   * @returns {string} HTML 字符串
   */
  createLanguageItem(lang, currentLang) {
    return createDropdownItem({
      value: lang.code,
      icon: lang.flag,
      label: lang.name,
      active: lang.code === currentLang
    });
  }

  /**
   * 切换语言
   * @param {string} langCode - 语言代码
   */
  async switchLanguage(langCode) {
    if (!this.languageManager) return false;

    try {
      const result = this.languageManager.setLanguage(langCode);
      
      if (result) {
        // 更新下拉菜单选中状态
        this.updateSelection(langCode);
        
        // 显示切换成功提示（本地化消息）
        if (this.showToast) {
          const message = this.getSwitchSuccessMessage(langCode);
          this.showToast(message, 'success');
        }

        // 触发外部回调
        if (this.onLanguageChange) {
          await this.onLanguageChange(langCode);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Language switch failed:', error);
      if (this.showToast) {
        this.showToast('Failed to switch language', 'error');
      }
      return false;
    }
  }

  /**
   * 获取切换成功的提示消息（本地化）
   * @param {string} langCode - 语言代码
   * @returns {string} 本地化消息
   */
  getSwitchSuccessMessage(langCode) {
    const t = this.languageManager?.t?.bind(this.languageManager);
    if (!t) return `Language switched`;

    // 获取当前语言下的"语言切换"消息
    const currentLang = this.languageManager.getCurrentLanguage();
    const langName = this.getLanguageName(langCode);
    
    // 优先使用翻译键，如果没有则使用硬编码模板
    return t('toast.languageSwitched', `Language switched to ${langName}`);
  }

  /**
   * 获取语言名称
   * @param {string} langCode - 语言代码
   * @returns {string} 语言名称
   */
  getLanguageName(langCode) {
    if (!this.languageManager) return langCode;
    
    const languages = this.languageManager.getLanguageList();
    const lang = languages.find(l => l.code === langCode);
    return lang?.name || langCode;
  }

  /**
   * 处理语言变化事件
   * @param {string} langCode - 新语言代码
   */
  handleLanguageChange(langCode) {
    this.updateCurrentLanguageDisplay();
    this.updateSelection(langCode);
  }

  /**
   * 更新当前语言显示
   */
  updateCurrentLanguageDisplay() {
    if (!this.elements.currentLabel) return;

    const currentLang = this.languageManager.getCurrentLanguage();
    const langName = this.getLanguageName(currentLang);
    
    this.elements.currentLabel.textContent = langName;
  }

  /**
   * 更新下拉菜单选中状态
   * @param {string} langCode - 当前语言代码
   */
  updateSelection(langCode) {
    if (!this.elements.menu) return;

    this.elements.menu.querySelectorAll('.dropdown-item').forEach(item => {
      item.classList.toggle('active', item.dataset.value === langCode);
    });
  }

  /**
   * 销毁组件，清理事件监听
   */
  destroy() {
    // 取消语言变化订阅
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    
    // 清理下拉菜单事件委托
    if (this.elements.menu && this.elements.menu._dropdownClickHandler) {
      this.elements.menu.removeEventListener('click', this.elements.menu._dropdownClickHandler);
      delete this.elements.menu._dropdownClickHandler;
    }
    
    // 清空元素引用
    this.elements = {
      menu: null,
      currentLabel: null
    };
  }
}
