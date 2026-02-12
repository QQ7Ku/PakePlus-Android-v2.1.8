/**
 * ASEAN NEV Insight - Constants
 * 常量配置
 */

// ASEAN 10 Countries Configuration
export const COUNTRIES = {
  th: {
    code: 'th',
    name: 'Thailand',
    nameEn: 'Thailand',
    flag: '🇹🇭',
    currency: { code: 'THB', symbol: '฿', name: 'Baht', rate: 0.2 },
    evPolicy: {
      importTax: 0,
      subsidy: { max: 150000, unit: 'THB', desc: 'Up to 150k THB' },
      incentive: 'Tax reduction',
      charging: { stations: 2500, growth: '+35%' }
    },
    hotModels: ['BYD Atto 3', 'BYD Qin Plus DM-i', 'Tesla Model 3', 'MG ZS EV', 'BYD Han EV'],
    marketData: { avgPrice: 1200000, volume: 3500, evRatio: 12.5 }
  },
  vn: {
    code: 'vn',
    name: 'Vietnam',
    nameEn: 'Vietnam',
    flag: '🇻🇳',
    currency: { code: 'VND', symbol: '₫', name: 'Dong', rate: 0.0003 },
    evPolicy: {
      importTax: 0,
      specialConsumptionTax: '2-10%',
      registrationFee: 'Exempt',
      subsidy: { desc: 'Special consumption tax incentive' }
    },
    hotModels: ['VinFast VF8', 'BYD Qin 2019', 'Tesla Model Y', 'BYD Atto 3'],
    marketData: { avgPrice: 850000000, volume: 1800, evRatio: 8.2 }
  },
  id: {
    code: 'id',
    name: 'Indonesia',
    nameEn: 'Indonesia',
    flag: '🇮🇩',
    currency: { code: 'IDR', symbol: 'Rp', name: 'Rupiah', rate: 0.00045 },
    evPolicy: {
      importTax: '0% (CKD)',
      luxuryTax: 'Reduction',
      subsidy: { max: 80000000, unit: 'IDR', desc: 'Up to 80M IDR' },
      localization: 'Local production incentive'
    },
    hotModels: ['Wuling Air EV', 'BYD M6', 'BYD Song Plus DM-i', 'Hyundai Ioniq 5'],
    marketData: { avgPrice: 450000000, volume: 2200, evRatio: 5.8 }
  },
  my: {
    code: 'my',
    name: 'Malaysia',
    nameEn: 'Malaysia',
    flag: '🇲🇾',
    currency: { code: 'MYR', symbol: 'RM', name: 'Ringgit', rate: 1.55 },
    evPolicy: {
      importTax: '0% (CBU until 2025)',
      exciseDuty: 'Exempt',
      roadTax: 'Exempt',
      subsidy: { desc: 'Tax incentives' }
    },
    hotModels: ['Tesla Model 3', 'BYD Seal', 'BYD Yuan Plus', 'MG ZS EV'],
    marketData: { avgPrice: 180000, volume: 1500, evRatio: 3.5 }
  },
  sg: {
    code: 'sg',
    name: 'Singapore',
    nameEn: 'Singapore',
    flag: '🇸🇬',
    currency: { code: 'SGD', symbol: 'S$', name: 'Dollar', rate: 5.2 },
    evPolicy: {
      vesRebate: 'Up to S$25k',
      arfRebate: '45% rebate',
      charging: { stations: 6000, growth: '+50%' },
      coe: 'Category B'
    },
    hotModels: ['Tesla Model 3', 'BYD Han EV', 'BMW iX', 'Mercedes EQS'],
    marketData: { avgPrice: 280000, volume: 800, evRatio: 18.5 }
  },
  ph: {
    code: 'ph',
    name: 'Philippines',
    nameEn: 'Philippines',
    flag: '🇵🇭',
    currency: { code: 'PHP', symbol: '₱', name: 'Peso', rate: 0.13 },
    evPolicy: {
      importTax: '0% (until 2028)',
      exciseTax: 'Exempt',
      tariff: 'Zero tariff',
      subsidy: { desc: 'Tax incentives' }
    },
    hotModels: ['BYD Atto 3', 'BYD Qin Plus DM-i', 'Tesla Model Y', 'Nissan Leaf'],
    marketData: { avgPrice: 1800000, volume: 600, evRatio: 2.8 }
  },
  mm: {
    code: 'mm',
    name: 'Myanmar',
    nameEn: 'Myanmar',
    flag: '🇲🇲',
    currency: { code: 'MMK', symbol: 'K', name: 'Kyat', rate: 0.003 },
    evPolicy: {
      importTax: '5% (preferential)',
      roadmap: '2024-2030',
      charging: { stations: 50 }
    },
    hotModels: ['BYD Atto 3', 'Tesla Model 3', 'Nissan Leaf'],
    marketData: { avgPrice: 45000000, volume: 120, evRatio: 1.2 }
  },
  kh: {
    code: 'kh',
    name: 'Cambodia',
    nameEn: 'Cambodia',
    flag: '🇰🇭',
    currency: { code: 'KHR', symbol: '៛', name: 'Riel', rate: 0.0018 },
    evPolicy: {
      importTax: 'Preferential',
      specialEconomicZone: 'Incentives available',
      charging: { stations: 15 }
    },
    hotModels: ['BYD Atto 3', 'BYD Qin 2019', 'Tesla Model 3', 'MG EP'],
    marketData: { avgPrice: 85000000, volume: 200, evRatio: 2.1 }
  },
  la: {
    code: 'la',
    name: 'Laos',
    nameEn: 'Laos',
    flag: '🇱🇦',
    currency: { code: 'LAK', symbol: '₭', name: 'Kip', rate: 0.0003 },
    evPolicy: {
      importTax: 'Preferential',
      promotion: 'Green vehicle promotion',
      charging: { stations: 10 }
    },
    hotModels: ['BYD Atto 3', 'BYD Tang DM', 'VinFast VF8', 'MG ZS EV'],
    marketData: { avgPrice: 450000000, volume: 80, evRatio: 0.8 }
  },
  bn: {
    code: 'bn',
    name: 'Brunei',
    nameEn: 'Brunei',
    flag: '🇧🇳',
    currency: { code: 'BND', symbol: 'B$', name: 'Dollar', rate: 5.2 },
    evPolicy: {
      importTax: 'Preferential',
      target: '2035 carbon neutral',
      charging: { stations: 5 }
    },
    hotModels: ['Tesla Model 3', 'BYD Atto 3', 'BYD e2', 'MG ZS EV'],
    marketData: { avgPrice: 45000, volume: 50, evRatio: 4.2 }
  }
};

// EV Models Database
export const EV_MODELS = {
  'BYD': {
    brand: 'BYD',
    logo: '🚗',
    country: 'cn',
    models: {
      'atto3': {
        id: 'atto3',
        name: 'Atto 3',
        category: 'SUV',
        battery: 60,
        range: 420,
        basePrices: { th: 1200000, vn: 850000000, id: 450000000, my: 168000, sg: 185000, ph: 1800000, mm: 45000000, kh: 85000000, la: 450000000, bn: 45000 },
        retention: { y1: 0.88, y2: 0.78, y3: 0.68 }
      },
      'seal': {
        id: 'seal',
        name: 'Seal',
        category: 'Sedan',
        battery: 82,
        range: 570,
        basePrices: { th: 1600000, vn: 1150000000, id: 650000000, my: 198000, sg: 280000, ph: 2400000, mm: 65000000, kh: 120000000, la: 650000000, bn: 65000 },
        retention: { y1: 0.85, y2: 0.75, y3: 0.65 }
      },
      'dolphin': {
        id: 'dolphin',
        name: 'Dolphin',
        category: 'Hatchback',
        battery: 45,
        range: 340,
        basePrices: { th: 850000, vn: 600000000, id: 350000000, my: 128000, sg: 165000, ph: 1200000, mm: 35000000, kh: 65000000, la: 350000000, bn: 35000 },
        retention: { y1: 0.86, y2: 0.76, y3: 0.66 }
      },
      'qin-plus': {
        id: 'qin-plus',
        name: 'Qin Plus DM-i',
        category: 'Sedan',
        battery: 18,
        range: 120,
        basePrices: { th: 950000, vn: 680000000, id: 380000000, my: 148000, sg: 175000, ph: 1400000, mm: 38000000, kh: 70000000, la: 380000000, bn: 38000 },
        retention: { y1: 0.87, y2: 0.77, y3: 0.67 }
      },
      'qin-2019': {
        id: 'qin-2019',
        name: 'Qin 2019',
        category: 'Sedan',
        battery: 53,
        range: 400,
        basePrices: { th: 750000, vn: 520000000, id: 280000000, my: 118000, sg: 145000, ph: 1100000, mm: 28000000, kh: 55000000, la: 280000000, bn: 28000 },
        retention: { y1: 0.82, y2: 0.70, y3: 0.58 }
      },
      'han': {
        id: 'han',
        name: 'Han EV',
        category: 'Sedan',
        battery: 77,
        range: 506,
        basePrices: { th: 1400000, vn: 1000000000, id: 550000000, my: 188000, sg: 240000, ph: 2100000, mm: 55000000, kh: 105000000, la: 550000000, bn: 55000 },
        retention: { y1: 0.85, y2: 0.75, y3: 0.65 }
      },
      'tang': {
        id: 'tang',
        name: 'Tang DM',
        category: 'SUV',
        battery: 22,
        range: 100,
        basePrices: { th: 1600000, vn: 1150000000, id: 650000000, my: 208000, sg: 280000, ph: 2400000, mm: 65000000, kh: 120000000, la: 650000000, bn: 65000 },
        retention: { y1: 0.84, y2: 0.74, y3: 0.64 }
      },
      'song-plus': {
        id: 'song-plus',
        name: 'Song Plus DM-i',
        category: 'SUV',
        battery: 19,
        range: 110,
        basePrices: { th: 1100000, vn: 780000000, id: 420000000, my: 158000, sg: 195000, ph: 1650000, mm: 42000000, kh: 78000000, la: 420000000, bn: 42000 },
        retention: { y1: 0.86, y2: 0.76, y3: 0.66 }
      },
      'yuan-plus': {
        id: 'yuan-plus',
        name: 'Yuan Plus',
        category: 'SUV',
        battery: 50,
        range: 380,
        basePrices: { th: 950000, vn: 680000000, id: 360000000, my: 138000, sg: 175000, ph: 1420000, mm: 36000000, kh: 68000000, la: 360000000, bn: 36000 },
        retention: { y1: 0.87, y2: 0.77, y3: 0.67 }
      },
      'm6': {
        id: 'm6',
        name: 'M6',
        category: 'MPV',
        battery: 55,
        range: 350,
        basePrices: { th: 1050000, vn: 720000000, id: 380000000, my: 148000, sg: 185000, ph: 1550000, mm: 38000000, kh: 72000000, la: 380000000, bn: 38000 },
        retention: { y1: 0.83, y2: 0.73, y3: 0.63 }
      },
      'e2': {
        id: 'e2',
        name: 'e2',
        category: 'Hatchback',
        battery: 35,
        range: 280,
        basePrices: { th: 650000, vn: 450000000, id: 240000000, my: 98000, sg: 125000, ph: 980000, mm: 24000000, kh: 45000000, la: 240000000, bn: 24000 },
        retention: { y1: 0.84, y2: 0.72, y3: 0.60 }
      },
      'e6': {
        id: 'e6',
        name: 'e6',
        category: 'MPV',
        battery: 82,
        range: 450,
        basePrices: { th: 1150000, vn: 800000000, id: 420000000, my: 168000, sg: 205000, ph: 1720000, mm: 42000000, kh: 80000000, la: 420000000, bn: 42000 },
        retention: { y1: 0.82, y2: 0.70, y3: 0.58 }
      }
    }
  },
  'Tesla': {
    brand: 'Tesla',
    logo: '⚡',
    country: 'us',
    models: {
      'model3': {
        id: 'model3',
        name: 'Model 3',
        category: 'Sedan',
        battery: 60,
        range: 438,
        basePrices: { th: 1750000, vn: 1250000000, id: 680000000, my: 218000, sg: 320000, ph: 2600000, mm: 68000000, kh: 125000000, la: 680000000, bn: 68000 },
        retention: { y1: 0.88, y2: 0.78, y3: 0.68 }
      },
      'modely': {
        id: 'modely',
        name: 'Model Y',
        category: 'SUV',
        battery: 75,
        range: 505,
        basePrices: { th: 1950000, vn: 1400000000, id: 780000000, my: 248000, sg: 360000, ph: 2900000, mm: 78000000, kh: 140000000, la: 780000000, bn: 78000 },
        retention: { y1: 0.87, y2: 0.77, y3: 0.67 }
      }
    }
  },
  'MG': {
    brand: 'MG',
    logo: '🇬🇧',
    country: 'gb',
    models: {
      'zsev': {
        id: 'zsev',
        name: 'ZS EV',
        category: 'SUV',
        battery: 51,
        range: 320,
        basePrices: { th: 980000, vn: 680000000, id: 360000000, my: 138000, sg: 170000, ph: 1380000, mm: 36000000, kh: 68000000, la: 360000000, bn: 36000 },
        retention: { y1: 0.85, y2: 0.73, y3: 0.61 }
      },
      'mg4': {
        id: 'mg4',
        name: 'MG4',
        category: 'Hatchback',
        battery: 51,
        range: 350,
        basePrices: { th: 920000, vn: 650000000, id: 340000000, my: 128000, sg: 160000, ph: 1280000, mm: 34000000, kh: 65000000, la: 340000000, bn: 34000 },
        retention: { y1: 0.86, y2: 0.74, y3: 0.62 }
      },
      'ep': {
        id: 'ep',
        name: 'EP',
        category: 'Station Wagon',
        battery: 44,
        range: 300,
        basePrices: { th: 880000, vn: 620000000, id: 320000000, my: 118000, sg: 150000, ph: 1180000, mm: 32000000, kh: 62000000, la: 320000000, bn: 32000 },
        retention: { y1: 0.84, y2: 0.72, y3: 0.60 }
      }
    }
  }
};

// I18n translations
export const TRANSLATIONS = {
  zh: {
    'nav.dashboard': '数据看板',
    'nav.valuation': 'AI估价',
    'nav.prediction': '市场预测',
    'nav.policy': '政策分析',
    'kpi.avgPrice': '平均车价',
    'kpi.volume': '月成交量',
    'kpi.evRatio': '新能源占比',
    'kpi.hotModel': '热门车型',
    'kpi.thisMonth': '本月',
    'chart.priceTrend': '价格趋势',
    'chart.brandShare': '品牌份额',
    'chart.aseanMap': '东盟价格对比',
    'chart.aiInsight': 'AI洞察',
    'table.hotModels': '热门车型排行',
    'table.rank': '排名',
    'table.model': '车型',
    'table.brand': '品牌',
    'table.avgPrice': '平均价格',
    'table.change': '涨跌',
    'table.volume': '成交量',
    'btn.calculate': '立即计算',
    'btn.aiPredict': 'AI预测',
    'condition.excellent': '优秀',
    'condition.good': '良好',
    'condition.average': '一般',
    'condition.poor': '较差',
    'condition.excellentDesc': '无事故，保养极佳',
    'condition.goodDesc': '轻微磨损，正常保养',
    'condition.averageDesc': '正常使用痕迹',
    'condition.poorDesc': '需要维修',
    'result.title': '估价结果',
    'result.estimatedPrice': 'AI建议售价',
    'result.aiAnalysis': 'AI分析',
    'result.confidence': '可信度',
    'btn.newValuation': '重新估价',
    'btn.save': '保存结果',
    'valuation.title': 'AI估价',
    'prediction.title': 'AI预测',
    'prediction.run': '运行AI预测',
    'policy.title': '新能源车政策分析',
    'footer.text': '数据仅供参考',
    'offline.message': '已切换到离线模式',
    'search.priceTrend': '价格趋势',
    'search.volumeTrend': '成交量趋势',
    'prediction.selectModel': '选择车型',
    'prediction.selectModelDesc': '选择要预测的车型',
    'prediction.period': '周期',
    'prediction.1month': '1个月',
    'prediction.3months': '3个月',
    'prediction.6months': '6个月',
    'prediction.1year': '1年',
    'search.country': '地区',
    'form.country': '所在国家',
    'form.year': '年份',
    'form.mileage': '里程 (万公里)',
    'form.batteryHealth': '电池健康度',
    'form.condition': '车况',
    'form.selectBrand': '选择品牌',
    'form.selectModel': '先选择品牌',
    'form.selectYear': '选择年份',
    'form.placeholder.mileage': '例如: 3.5',
    'search.quickSearch': '快速搜索车型（如：BYD Atto 3）',
    'form.battery.excellent': '优秀 (90%+)',
    'form.battery.good': '良好 (80-90%)',
    'form.battery.average': '一般 (70-80%)',
    'form.battery.poor': '较差 (60-70%)',
    'btn.next': '下一步',
    'btn.prev': '上一步',
    'btn.calculate': '立即估价',
    'valuation.aiRecommended': 'AI建议售价',
    'valuation.priceRange': '价格区间',
    'valuation.aiConfidence': 'AI置信度',
    'valuation.confidenceValue': '92%',
    'valuation.7dayTrend': '7日价格趋势',
    'valuation.market': '市场',
    'btn.close': '关闭',
    'btn.detailedValuation': '详细估价',
    'nav.search': '车型搜索',
    'ai.insight.priceTrend': '价格走势',
    'ai.insight.priceTrend.text': '新能源二手车价格整体稳中有升，热门车型需求旺盛',
    'ai.insight.policy': '政策环境',
    'ai.insight.policy.text': '各国EV支持政策持续，税收优惠延续至2025年后',
    'ai.insight.technology': '技术发展',
    'ai.insight.technology.text': '电池技术快速迭代，早期EV车型保值率承压',
    'ai.insight.infrastructure': '基础设施',
    'ai.insight.infrastructure.text': '充电网络快速扩张，缓解里程焦虑，促进EV普及',
    'ai.search.marketAdvice': '市场建议',
    'ai.search.priceTrendAdvice': '价格趋势',
    'ai.search.tradingAdvice': '交易建议',
    'ai.search.trendAnalysis': '{months}个月趋势分析可用',
    'ai.search.recommendedPrice': '建议售价：{price}；预计成交时间：{minDays}-{maxDays}天',
    'ai.search.advice.strong': '当前市场对该车型需求旺盛，建议适当提高售价。',
    'ai.search.advice.weak': '当前市场对该车型需求疲软，建议适当降低售价以快速成交。',
    'ai.search.advice.stable': '当前市场对该车型需求稳定，建议在价格区间中位数出售。',
    'days.ago': '天前',
    'country.th': '泰国',
    'country.vn': '越南',
    'country.id': '印尼',
    'country.my': '马来西亚',
    'country.sg': '新加坡',
    'country.ph': '菲律宾',
    'country.mm': '缅甸',
    'country.kh': '柬埔寨',
    'country.la': '老挝',
    'country.bn': '文莱',
    'search.brand': '品牌',
    'search.model': '车型',
    'search.period': '时间周期',
    'search.allCountries': '全部国家',
    'search.selectBrand': '选择品牌',
    'search.selectModel': '先选择品牌',
    'search.period.12m': '近12个月',
    'search.period.6m': '近6个月',
    'search.period.3m': '近3个月',
    'search.loading': '搜索市场数据中...',
    'search.step1': '正在连接数据库...',
    'search.step2': '正在分析市场数据...',
    'search.step3': '正在计算价格趋势...',
    'search.step4': '正在生成洞察报告...',
    'search.pleaseSelect': '请选择品牌和车型',
    'search.results': '搜索结果',
    'search.title': '车型市场搜索',
    'search.subtitle': '搜索特定车型的市场销量和价格数据',
    'search.searchBtn': '搜索市场数据',
    'search.totalVolume': '总销量',
    'search.avgPrice': '平均价格',
    'search.priceRange': '价格区间',
    'search.currentPeriod': '当前周期',
    'search.avgMonthly': '月均销量',
    'search.volumeTrend': '销量趋势',
    'search.priceDistribution': '价格分布',
    'search.detailData': '详细数据',
    'search.export': '导出数据',
    'search.recentDeals': '近期单车成交价',
    'search.last7days': '近7天',
    'search.last30days': '近30天',
    'search.avgDealPrice': '平均成交价',
    'search.dealCount': '成交数量',
    'search.maxDealPrice': '最高成交价',
    'search.minDealPrice': '最低成交价',
    'btn.calculateNow': '立即估价',
    'btn.viewPrediction': '查看预测',
    'units.vehicle': '辆',
    'country.switched': '已切换到 {country}',
    'country.switchFailed': '切换国家失败'
  },
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.search': 'Vehicle Search',
    'nav.valuation': 'AI Valuation',
    'nav.prediction': 'Prediction',
    'nav.policy': 'Policy',
    'kpi.avgPrice': 'Avg Price',
    'kpi.volume': 'Monthly Volume',
    'kpi.evRatio': 'EV Share',
    'kpi.hotModel': 'Hot Model',
    'kpi.thisMonth': 'This Month',
    'chart.priceTrend': 'Price Trend',
    'chart.brandShare': 'Brand Share',
    'chart.aseanMap': 'ASEAN Comparison',
    'chart.aiInsight': 'AI Insights',
    'table.hotModels': 'Top Models',
    'table.rank': 'Rank',
    'table.model': 'Model',
    'table.brand': 'Brand',
    'table.avgPrice': 'Avg Price',
    'table.change': 'Change',
    'table.volume': 'Volume',
    'btn.calculate': 'Calculate Now',
    'btn.aiPredict': 'AI Prediction',
    'condition.excellent': 'Excellent',
    'condition.good': 'Good',
    'condition.average': 'Average',
    'condition.poor': 'Poor',
    'condition.excellentDesc': 'No accidents, excellent maintenance',
    'condition.goodDesc': 'Minor wear, normal maintenance',
    'condition.averageDesc': 'Normal usage traces',
    'condition.poorDesc': 'Needs repair',
    'result.title': 'Valuation Result',
    'result.estimatedPrice': 'AI Recommended Price',
    'result.aiAnalysis': 'AI Analysis',
    'result.confidence': 'Confidence',
    'btn.newValuation': 'New Valuation',
    'btn.save': 'Save Result',
    'valuation.title': 'AI Valuation',
    'prediction.title': 'AI Prediction',
    'prediction.run': 'Run AI Prediction',
    'policy.title': 'EV Policy Analysis',
    'footer.text': 'Data for reference only',
    'offline.message': 'Switched to offline mode',
    'search.priceTrend': 'Price Trend',
    'search.volumeTrend': 'Volume Trend',
    'prediction.selectModel': 'Select Model',
    'prediction.selectModelDesc': 'Select model to predict',
    'prediction.period': 'Period',
    'prediction.1month': '1 Month',
    'prediction.3months': '3 Months',
    'prediction.6months': '6 Months',
    'prediction.1year': '1 Year',
    'search.country': 'Region',
    'form.country': 'Country',
    'form.year': 'Year',
    'form.mileage': 'Mileage (10k km)',
    'form.batteryHealth': 'Battery Health',
    'form.condition': 'Condition',
    'form.selectBrand': 'Select Brand',
    'form.selectModel': 'Select Model',
    'form.selectYear': 'Select Year',
    'form.placeholder.mileage': 'e.g. 3.5',
    'search.quickSearch': 'Quick search (e.g. BYD Atto 3)',
    'form.battery.excellent': 'Excellent (90%+)',
    'form.battery.good': 'Good (80-90%)',
    'form.battery.average': 'Average (70-80%)',
    'form.battery.poor': 'Poor (60-70%)',
    'btn.next': 'Next',
    'btn.prev': 'Previous',
    'btn.calculate': 'Calculate',
    'valuation.aiRecommended': 'AI Recommended Price',
    'valuation.priceRange': 'Price Range',
    'valuation.aiConfidence': 'AI Confidence',
    'valuation.confidenceValue': '92%',
    'valuation.7dayTrend': '7-Day Price Trend',
    'valuation.market': 'Market',
    'btn.close': 'Close',
    'btn.detailedValuation': 'Detailed Valuation',
    'toast.languageSwitched': 'Language switched to {lang}',
    'ai.insight.priceTrend': 'Price Trend',
    'ai.insight.priceTrend.text': 'Used EV prices remain stable with rising demand for popular models',
    'ai.insight.policy': 'Policy Environment',
    'ai.insight.policy.text': 'EV support policies continue across countries, tax incentives extend beyond 2025',
    'ai.insight.technology': 'Technology',
    'ai.insight.technology.text': 'Battery technology evolves rapidly, early EV models face depreciation pressure',
    'ai.insight.infrastructure': 'Infrastructure',
    'ai.insight.infrastructure.text': 'Charging network expands rapidly, easing range anxiety and promoting EV adoption',
    'ai.search.marketAdvice': 'Market Advice',
    'ai.search.priceTrendAdvice': 'Price Trend',
    'ai.search.tradingAdvice': 'Trading Advice',
    'ai.search.trendAnalysis': '{months} months trend analysis available',
    'ai.search.recommendedPrice': 'Recommended: {price}; Est. sale time: {minDays}-{maxDays} days',
    'ai.search.advice.strong': 'Current market demand is strong. Consider higher pricing.',
    'ai.search.advice.weak': 'Current market demand is weak. Consider price reduction.',
    'ai.search.advice.stable': 'Current market demand is stable. Price at mid-range.',
    'days.ago': 'days ago',
    'country.th': 'Thailand',
    'country.vn': 'Vietnam',
    'country.id': 'Indonesia',
    'country.my': 'Malaysia',
    'country.sg': 'Singapore',
    'country.ph': 'Philippines',
    'country.mm': 'Myanmar',
    'country.kh': 'Cambodia',
    'country.la': 'Laos',
    'country.bn': 'Brunei',
    'search.brand': 'Brand',
    'search.model': 'Model',
    'search.period': 'Period',
    'search.allCountries': 'All Countries',
    'search.selectBrand': 'Select Brand',
    'search.selectModel': 'Select Model',
    'search.period.12m': 'Last 12 Months',
    'search.period.6m': 'Last 6 Months',
    'search.period.3m': 'Last 3 Months',
    'search.loading': 'Searching market data...',
    'search.step1': 'Connecting to database...',
    'search.step2': 'Analyzing market data...',
    'search.step3': 'Calculating price trends...',
    'search.step4': 'Generating insights...',
    'search.pleaseSelect': 'Please select brand and model',
    'search.results': 'Search Results',
    'search.title': 'Vehicle Market Search',
    'search.subtitle': 'Search market sales and price data for specific models',
    'search.searchBtn': 'Search Market Data',
    'search.totalVolume': 'Total Volume',
    'search.avgPrice': 'Avg Price',
    'search.priceRange': 'Price Range',
    'search.currentPeriod': 'Current Period',
    'search.avgMonthly': 'Avg Monthly',
    'search.volumeTrend': 'Volume Trend',
    'search.priceDistribution': 'Price Distribution',
    'search.detailData': 'Detailed Data',
    'search.export': 'Export Data',
    'search.recentDeals': 'Recent Deal Prices',
    'search.last7days': 'Last 7 Days',
    'search.last30days': 'Last 30 Days',
    'search.avgDealPrice': 'Avg Deal Price',
    'search.dealCount': 'Deal Count',
    'search.maxDealPrice': 'Max Price',
    'search.minDealPrice': 'Min Price',
    'btn.calculateNow': 'Calculate Now',
    'btn.viewPrediction': 'View Prediction',
    'units.vehicle': 'units',
    'country.switched': 'Switched to {country}',
    'country.switchFailed': 'Failed to switch country'
  }
};

// App configuration
export const APP_CONFIG = {
  MAX_VALUATION_HISTORY: 20,
  DEFAULT_DEBOUNCE_DELAY: 300,
  DEFAULT_TOAST_DURATION: 3000,
  CHART_ANIMATION_DURATION: 300,
  DEFAULT_AI_DELAY: 1500,
  DEFAULT_PREDICTION_DELAY: 2000,
  HOT_MODELS_LIMIT: 10,
  
  // Delay constants for TDD testing
  DELAY: {
    CHART_RENDER: 100,
    CHART_RESIZE: 300,
    UI_UPDATE: 100,
    TAB_SWITCH: 100,
    INITIALIZATION: 500,
    DROPDOWN_FILL: 100,
    SEARCH_AUTO: 100
  }
};

// Chart colors
export const CHART_COLORS = {
  primary: '#14b8a6',
  secondary: '#64748b',
  accent: '#f59e0b',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  colors: ['#14b8a6', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#22c55e', '#f97316', '#06b6d4']
};


// Supported languages
export const LANGUAGES = [
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇬🇧' }
];

// Battery health factors for valuation
export const BATTERY_FACTORS = {
  90: { factor: 0.95, label: 'Excellent' },
  80: { factor: 0.90, label: 'Good' },
  70: { factor: 0.80, label: 'Average' },
  60: { factor: 0.65, label: 'Poor' },
  50: { factor: 0.50, label: 'Very Poor' }
};

// Condition factors for valuation
export const CONDITION_FACTORS = {
  excellent: { factor: 1.05, label: 'Excellent' },
  good: { factor: 1.00, label: 'Good' },
  average: { factor: 0.90, label: 'Average' },
  poor: { factor: 0.75, label: 'Poor' }
};
