# 语言切换功能重构摘要

## 重构目标
重新搭建 `asean-nev-platform` 项目的语言切换功能，解决代码分散、紧耦合、重复代码等问题。

## 重构内容

### 1. 新增文件

#### `js/components/dropdownRenderer.js`
通用下拉菜单渲染器，消除国家、货币、语言三个下拉菜单的重复代码。

**主要功能：**
- `renderDropdownMenu()` - 通用下拉菜单渲染
- `createDropdownItem()` - 创建标准菜单项 HTML
- `renderCountryDropdown()` - 国家选择专用渲染
- `renderCurrencyDropdown()` - 货币选择专用渲染
- `updateDropdownSelection()` - 更新选中状态
- `clearDropdown()` - 清空菜单

#### `js/components/languageSwitcher.js`
语言切换组件，专门处理语言切换的 UI 逻辑。

**主要功能：**
- 依赖注入支持（便于测试）
- 观察者模式（语言变化事件）
- 本地化 Toast 消息
- 自动更新下拉菜单选中状态

#### `js/components/index.js`
组件导出索引文件。

### 2. 重构文件

#### `js/modules/languageManager.js`
**改进：**
- 添加依赖注入支持（translations, languages, storage）
- 添加翻译缓存（`_translatableElements`, `_lastTranslationKeys`）
- 添加批量翻译方法 `translateBatch()`
- 添加预加载支持 `preloadTranslations()`
- 改进错误处理
- 完善 JSDoc 注释

#### `js/modules/uiManager.js`
**改进：**
- 使用通用渲染函数 `renderCountryDropdown`, `renderCurrencyDropdown`
- 移除语言切换逻辑（委托给 LanguageSwitcher）
- 添加 `setLanguageSwitcher()` 方法用于依赖注入
- 使用事件委托替代单独绑定事件

#### `js/main.js`
**改进：**
- 使用 `LanguageSwitcher` 组件处理语言切换 UI
- 简化 `switchLanguage()` 方法
- 通过回调函数实现组件间通信（降低耦合）

## 架构变化

### 重构前
```
main.js
  └── switchLanguage() ──► 硬编码 Toast 消息

uiManager.js
  └── initDropdowns() ──► 重复代码 x3（国家、货币、语言）

languageManager.js
  └── 基础功能
```

### 重构后
```
main.js
  └── LanguageSwitcher ──► LanguageManager
       └── onLanguageChange 回调

uiManager.js
  └── dropdownRenderer ──► 通用渲染函数
       └── renderCountryDropdown()
       └── renderCurrencyDropdown()

languageManager.js
  └── 增强功能（缓存、依赖注入、批量翻译）
```

## 解决的问题

| 问题 | 解决方案 |
|------|----------|
| 代码分散 | LanguageSwitcher 组件集中处理语言切换 UI |
| 紧耦合 | 使用观察者模式和依赖注入降低耦合 |
| 重复代码 | dropdownRenderer.js 提供通用渲染函数 |
| 缺少缓存 | 添加 `_translatableElements` 和 `_lastTranslationKeys` 缓存 |
| 硬编码 | `getSwitchSuccessMessage()` 方法支持本地化消息 |

## 使用方法

### 语言切换
```javascript
// 应用内切换语言
await app.switchLanguage('en');
```

### 获取翻译
```javascript
// 获取单个翻译
const text = languageManager.t('nav.dashboard');

// 批量翻译
const texts = languageManager.translateBatch([
  'nav.dashboard',
  'kpi.avgPrice',
  'chart.priceTrend'
]);
```

### 监听语言变化
```javascript
const unsubscribe = languageManager.onLanguageChange((langCode) => {
  console.log('Language changed to:', langCode);
});

// 取消监听
unsubscribe();
```

## 测试

由于使用了依赖注入，现在可以更容易地进行单元测试：

```javascript
// 测试 LanguageManager
const mockStorage = {
  get: (key, defaultValue) => defaultValue,
  set: () => {}
};

const manager = new LanguageManager({
  storage: mockStorage,
  defaultLang: 'en'
});
```

## 注意事项

1. **语言列表格式兼容**：`getLanguageList()` 同时支持数组和对象格式
2. **事件委托**：下拉菜单使用事件委托，避免重复绑定
3. **异步支持**：`switchLanguage` 和相关回调支持 async/await
4. **降级方案**：如果 LanguageSwitcher 未初始化，main.js 会回退到直接使用 LanguageManager
