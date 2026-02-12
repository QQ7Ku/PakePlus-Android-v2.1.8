/**
 * ASEAN NEV Insight - Language Manager
 * 语言管理模块
 * 
 * 管理应用的多语言支持，包括翻译、语言切换、本地存储等功能
 */

import { LANGUAGES, TRANSLATIONS } from '../config/constants.js';
import { storage } from '../utils/helpers.js';

export class LanguageManager {
  /**
   * @param {Object} options - 配置选项
   * @param {Object} options.translations - 翻译数据（用于依赖注入测试）
   * @param {Array} options.languages - 语言列表（用于依赖注入测试）
   * @param {Object} options.storage - 存储接口（用于依赖注入测试）
   * @param {string} options.defaultLang - 默认语言代码
   */
  constructor(options = {}) {
    // 支持依赖注入，便于测试
    this.languages = options.languages || LANGUAGES;
    this.translations = options.translations || TRANSLATIONS;
    this.storage = options.storage || storage;
    this.defaultLang = options.defaultLang || 'zh';
    
    this.currentLang = this.defaultLang;
    this.listeners = [];
  }

  /**
   * 初始化语言管理器
   * @returns {LanguageManager}
   */
  init() {
    const savedLang = this.storage.get('selectedLanguage', this.defaultLang);
    this.currentLang = this.translations[savedLang] ? savedLang : this.defaultLang;
    this.applyLanguage();
    return this;
  }

  /**
   * 设置当前语言
   * @param {string} langCode - 语言代码
   * @returns {boolean} 是否成功切换
   */
  setLanguage(langCode) {
    if (!this.translations[langCode]) {
      console.warn(`Language '${langCode}' not supported`);
      return false;
    }
    
    if (this.currentLang === langCode) {
      return true; // 已经是该语言
    }
    
    this.currentLang = langCode;
    this.storage.set('selectedLanguage', langCode);
    this.applyLanguage();
    
    // 通知所有监听者
    this._notifyListeners(langCode);
    
    return true;
  }

  /**
   * 获取当前语言代码
   * @returns {string}
   */
  getCurrentLanguage() {
    return this.currentLang;
  }

  /**
   * 获取支持的语言列表
   * @returns {Array}
   */
  getLanguageList() {
    // 兼容数组和对象格式
    return Array.isArray(this.languages) 
      ? this.languages 
      : Object.values(this.languages);
  }

  /**
   * 获取翻译文本
   * @param {string} key - 翻译键
   * @param {string|null} fallback - 回退文本
   * @returns {string}
   */
  t(key, fallback = null) {
    const translation = this.translations[this.currentLang];
    if (!translation) return fallback || key;
    
    return translation[key] || fallback || key;
  }

  /**
   * 批量翻译（性能优化）
   * @param {Array<string>} keys - 翻译键数组
   * @returns {Object}
   */
  translateBatch(keys) {
    const result = {};
    keys.forEach(key => {
      result[key] = this.t(key);
    });
    return result;
  }

  /**
   * 应用当前语言到页面
   */
  applyLanguage() {
    const elements = this._getTranslatableElements();
    const currentTranslations = this.translations[this.currentLang];
    
    if (!currentTranslations) return;

    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        const translation = currentTranslations[key];
        if (translation && translation !== key) {
          el.textContent = translation;
        }
      }
      
      // 处理 placeholder 属性
      const placeholderKey = el.getAttribute('data-i18n-placeholder');
      if (placeholderKey) {
        const placeholderTranslation = currentTranslations[placeholderKey];
        if (placeholderTranslation && placeholderTranslation !== placeholderKey) {
          el.placeholder = placeholderTranslation;
        }
      }
    });
    
    // 更新 HTML lang 属性
    this._updateHtmlLangAttribute();
  }

  /**
   * 添加语言变化监听
   * @param {Function} callback - 回调函数，接收语言代码
   * @returns {Function} 取消订阅函数
   */
  onLanguageChange(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function');
    }
    
    this.listeners.push(callback);
    
    // 返回取消订阅函数
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * 检测浏览器语言偏好
   * @returns {string} 语言代码
   */
  detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0];
    
    return this.translations[langCode] ? langCode : this.defaultLang;
  }

  /**
   * 预加载翻译数据（异步加载场景）
   * @param {string} langCode - 语言代码
   * @returns {Promise<boolean>}
   */
  async preloadTranslations(langCode) {
    if (this.translations[langCode]) {
      return true; // 已加载
    }
    
    // 这里可以实现异步加载翻译文件
    // 例如：从服务器加载 /locales/${langCode}.json
    console.warn(`Preload not implemented for language: ${langCode}`);
    return false;
  }

  /**
   * 私有方法：获取所有可翻译元素
   * 注意：不缓存结果，避免内存泄漏和DOM过期问题
   * @returns {NodeList}
   */
  _getTranslatableElements() {
    return document.querySelectorAll('[data-i18n]');
  }

  /**
   * 私有方法：更新 HTML lang 属性
   */
  _updateHtmlLangAttribute() {
    const langMap = {
      'zh': 'zh-CN',
      'en': 'en-US',
      'th': 'th-TH',
      'vi': 'vi-VN',
      'id': 'id-ID',
      'my': 'ms-MY',
      'sg': 'en-SG'
    };
    
    document.documentElement.lang = langMap[this.currentLang] || this.currentLang;
  }

  /**
   * 私有方法：通知所有监听者
   * @param {string} langCode
   */
  _notifyListeners(langCode) {
    this.listeners.forEach(callback => {
      try {
        callback(langCode);
      } catch (error) {
        console.error('Language change listener error:', error);
      }
    });
  }
}
