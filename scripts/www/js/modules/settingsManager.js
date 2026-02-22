/**
 * 设置管理模块
 * 管理用户设置和知识库数据
 */

import { KNOWLEDGE_BASE } from '../config/constants.js?v=2';

const STORAGE_KEYS = {
    SETTINGS: 'ai_chatbot_settings',
    KNOWLEDGE_BASE: 'ai_chatbot_knowledge_base'
};

export class SettingsManager {
    constructor() {
        this.settings = null;
        this.knowledgeBase = null;
    }

    /**
     * 获取设置
     * @returns {Object} 设置对象
     */
    getSettings() {
        if (this.settings) return this.settings;
        
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            this.settings = stored ? JSON.parse(stored) : {};
        } catch (e) {
            this.settings = {};
        }
        
        return this.settings;
    }

    /**
     * 保存设置
     * @param {Object} newSettings - 新设置
     * @returns {boolean} 是否保存成功
     */
    saveSettings(newSettings) {
        this.settings = { ...this.getSettings(), ...newSettings };
        
        // 安全警告：API Key 存储在本地
        if (newSettings.zhipuApiKey) {
            console.warn('[Security] API Key 存储在浏览器本地存储中，请勿在公共设备上使用');
        }
        
        try {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * 获取知识库
     */
    getKnowledgeBase() {
        if (this.knowledgeBase) return this.knowledgeBase;
        
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.KNOWLEDGE_BASE);
            if (stored) {
                this.knowledgeBase = JSON.parse(stored);
            } else {
                // 使用默认知识库
                this.knowledgeBase = { ...KNOWLEDGE_BASE };
                this.saveKnowledgeBase();
            }
        } catch (e) {
            this.knowledgeBase = { ...KNOWLEDGE_BASE };
        }
        
        return this.knowledgeBase;
    }

    /**
     * 保存知识库
     */
    saveKnowledgeBase() {
        try {
            localStorage.setItem(STORAGE_KEYS.KNOWLEDGE_BASE, JSON.stringify(this.knowledgeBase));
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * 添加/更新知识
     */
    addKnowledge(key, question, answer) {
        this.getKnowledgeBase();
        this.knowledgeBase[key] = { question, answer };
        return this.saveKnowledgeBase();
    }

    /**
     * 删除知识
     */
    deleteKnowledge(key) {
        this.getKnowledgeBase();
        delete this.knowledgeBase[key];
        return this.saveKnowledgeBase();
    }

    /**
     * 批量添加知识
     */
    batchAddKnowledge(entries) {
        this.getKnowledgeBase();
        
        for (const [key, data] of Object.entries(entries)) {
            this.knowledgeBase[key] = data;
        }
        
        return this.saveKnowledgeBase();
    }

    /**
     * 重置知识库为默认
     */
    resetKnowledgeBase() {
        this.knowledgeBase = { ...KNOWLEDGE_BASE };
        return this.saveKnowledgeBase();
    }

    /**
     * 清除所有设置
     */
    clearAll() {
        this.settings = {};
        this.knowledgeBase = { ...KNOWLEDGE_BASE };
        
        try {
            localStorage.removeItem(STORAGE_KEYS.SETTINGS);
            localStorage.removeItem(STORAGE_KEYS.KNOWLEDGE_BASE);
            this.saveKnowledgeBase();
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * 获取智谱AI配置
     */
    getZhipuConfig() {
        const settings = this.getSettings();
        return {
            apiKey: settings.zhipuApiKey || '',
            model: settings.zhipuModel || 'glm-4'
        };
    }

    /**
     * 检查是否配置了大模型
     */
    hasLLMConfig() {
        const settings = this.getSettings();
        return !!(settings.zhipuApiKey);
    }
}

export default SettingsManager;
