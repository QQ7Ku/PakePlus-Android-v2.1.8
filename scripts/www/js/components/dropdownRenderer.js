/**
 * Dropdown Renderer Component
 * 通用下拉菜单渲染器
 * 
 * 提供可复用的下拉菜单渲染逻辑，消除代码重复
 */

import { escapeHtml } from '../utils/helpers.js';

/**
 * 渲染下拉菜单选项
 * @param {HTMLElement} container - 菜单容器元素
 * @param {Array} items - 菜单项数据数组
 * @param {Function} renderItem - 渲染单个菜单项的函数
 * @param {Function} onSelect - 选择回调函数
 */
export function renderDropdownMenu(container, items, renderItem, onSelect) {
  // 参数类型验证
  if (!container || !Array.isArray(items)) return;
  if (typeof renderItem !== 'function') {
    throw new TypeError('renderItem must be a function');
  }
  if (typeof onSelect !== 'function') {
    throw new TypeError('onSelect must be a function');
  }

  // 清理旧的事件监听器
  if (container._dropdownClickHandler) {
    container.removeEventListener('click', container._dropdownClickHandler);
    delete container._dropdownClickHandler;
  }

  // 安全渲染：使用 createElement 替代 innerHTML
  container.innerHTML = '';
  const fragment = document.createDocumentFragment();
  
  items.forEach((item, index) => {
    const html = renderItem(item, index);
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html.trim();
    
    // 验证：只允许一个根元素
    if (wrapper.children.length !== 1) {
      console.warn('renderItem must return exactly one root element');
      return;
    }
    
    fragment.appendChild(wrapper.firstElementChild);
  });
  
  container.appendChild(fragment);

  // 绑定事件委托
  const clickHandler = (e) => {
    const item = e.target.closest('.dropdown-item');
    if (item && item.dataset.value) {
      e.stopPropagation();
      onSelect(item.dataset.value, item);
    }
  };

  container.addEventListener('click', clickHandler);
  container._dropdownClickHandler = clickHandler;
}

/**
 * 创建标准下拉菜单项 HTML
 * @param {Object} config - 配置对象
 * @param {string} config.value - 选项值
 * @param {string} config.icon - 图标（国旗、货币符号等）
 * @param {string} config.label - 显示文本
 * @param {boolean} config.active - 是否为当前选中项
 * @param {Object} config.dataset - 额外的 data-* 属性
 * @returns {string} HTML 字符串
 */
export function createDropdownItem(config) {
  const { value, icon, label, active = false, dataset = {} } = config;
  
  // 修复XSS：data属性名只允许合法字符（字母、数字、连字符）
  const dataAttrs = Object.entries(dataset)
    .map(([key, val]) => {
      const safeKey = key.replace(/[^a-zA-Z0-9-]/g, '');
      return safeKey ? `data-${safeKey}="${escapeHtml(String(val))}"` : '';
    })
    .filter(Boolean)
    .join(' ');

  return `
    <div class="dropdown-item ${active ? 'active' : ''}" 
         data-value="${escapeHtml(value)}"
         ${dataAttrs}>
      <span>${escapeHtml(icon)}</span>
      <span>${escapeHtml(label)}</span>
    </div>
  `;
}

/**
 * 更新下拉菜单选中状态
 * @param {HTMLElement} container - 菜单容器
 * @param {string} selectedValue - 当前选中的值
 */
export function updateDropdownSelection(container, selectedValue) {
  if (!container) return;

  container.querySelectorAll('.dropdown-item').forEach(item => {
    item.classList.toggle('active', item.dataset.value === selectedValue);
  });
}

/**
 * 清空下拉菜单并移除事件监听
 * @param {HTMLElement} container - 菜单容器
 */
export function clearDropdown(container) {
  if (!container) return;

  const existingHandler = container._dropdownClickHandler;
  if (existingHandler) {
    container.removeEventListener('click', existingHandler);
    delete container._dropdownClickHandler;
  }

  container.innerHTML = '';
}

/**
 * 渲染国家选择下拉菜单
 * @param {HTMLElement} container - 菜单容器
 * @param {Array} countries - 国家列表
 * @param {string} currentCountry - 当前选中国家代码
 * @param {Function} onSelect - 选择回调
 */
export function renderCountryDropdown(container, countries, currentCountry, onSelect) {
  renderDropdownMenu(
    container,
    countries,
    (country) => createDropdownItem({
      value: country.code,
      icon: country.flag,
      label: country.name,
      active: country.code === currentCountry
    }),
    onSelect
  );
}

/**
 * 渲染货币选择下拉菜单
 * @param {HTMLElement} container - 菜单容器
 * @param {Array} currencies - 货币列表
 * @param {string} currentCurrency - 当前选中货币代码
 * @param {Function} onSelect - 选择回调
 * @param {boolean} showLocalOption - 是否显示"本地货币"选项
 */
export function renderCurrencyDropdown(container, currencies, currentCurrency, onSelect, showLocalOption = true) {
  const items = showLocalOption 
    ? [{ code: '', symbol: '💰', name: '本地货币' }, ...currencies]
    : currencies;

  renderDropdownMenu(
    container,
    items,
    (currency) => createDropdownItem({
      value: currency.code,
      icon: currency.symbol,
      label: currency.code ? `${currency.code} - ${currency.name}` : currency.name,
      active: currency.code === currentCurrency || (!currency.code && !currentCurrency)
    }),
    onSelect
  );
}
