/**
 * Debug Helper - ASEAN NEV Platform
 * 用于诊断问题的调试工具
 */

export function checkElements() {
  const elements = {
    // 图表容器
    'priceTrendChart': document.getElementById('priceTrendChart'),
    'brandShareChart': document.getElementById('brandShareChart'),
    'aseanMapChart': document.getElementById('aseanMapChart'),
    // AI洞察
    'aiInsightContent': document.getElementById('aiInsightContent'),
    // 搜索AI建议
    'searchAiContent': document.getElementById('searchAiContent'),
  };
  
  console.log('=== Element Check ===');
  Object.entries(elements).forEach(([name, el]) => {
    if (el) {
      const rect = el.getBoundingClientRect();
      console.log(`✅ ${name}: found, size: ${rect.width}x${rect.height}, visible: ${rect.width > 0 && rect.height > 0}`);
    } else {
      console.log(`❌ ${name}: NOT FOUND`);
    }
  });
  return elements;
}

export function checkLibraries() {
  console.log('=== Library Check ===');
  const libs = {
    'echarts': typeof echarts !== 'undefined',
    'tailwind': typeof tailwind !== 'undefined',
  };
  
  Object.entries(libs).forEach(([name, loaded]) => {
    console.log(`${loaded ? '✅' : '❌'} ${name}: ${loaded ? 'loaded' : 'NOT LOADED'}`);
  });
  return libs;
}

export function checkData(dataManager) {
  console.log('=== Data Check ===');
  
  if (!dataManager) {
    console.log('❌ dataManager not provided');
    return;
  }
  
  const countryCode = dataManager.getCurrentCountry?.() || 'th';
  console.log(`Current country: ${countryCode}`);
  
  const trendData = dataManager.getMarketTrend?.(countryCode, '30d');
  console.log(`📊 Trend data: ${trendData?.length || 0} items`);
  
  const brandShare = dataManager.getBrandShare?.();
  console.log(`📊 Brand share: ${brandShare?.length || 0} items`);
  
  const aseanData = dataManager.getAseanPriceComparison?.('atto3');
  console.log(`📊 ASEAN comparison: ${aseanData?.length || 0} items`);
  
  return {
    trendData,
    brandShare,
    aseanData
  };
}

export function runFullDiagnostics(app) {
  console.log('%c🔍 ASEAN NEV Platform Diagnostics', 'font-size: 16px; font-weight: bold; color: #0d9488;');
  console.log('=====================================');
  
  checkLibraries();
  checkElements();
  
  if (app?.dataManager) {
    checkData(app.dataManager);
  } else {
    console.log('❌ app.dataManager not available');
  }
  
  console.log('=====================================');
}

// 暴露到全局以便调试
if (typeof window !== 'undefined') {
  window.NEVDebug = {
    checkElements,
    checkLibraries,
    checkData,
    runFullDiagnostics
  };
}
