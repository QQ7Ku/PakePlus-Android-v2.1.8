# ASEAN NEV Insight - 本地数据说明

## 数据生成方式

本项目所有数据均在**本地生成**，无需网络连接即可使用。

## 数据来源

### 1. 车型数据库（本地硬编码）
**文件**: `js/config/constants.js`

包含完整的车型信息：
- 12个品牌（BYD、Tesla、MG、VinFast等）
- 30+ 款车型
- 各国基础价格
- 保值率数据

### 2. 国家配置（本地硬编码）
**文件**: `js/config/constants.js`

包含东盟10国数据：
- 货币配置
- EV政策
- 市场数据

### 3. 市场趋势数据（本地生成）
**生成位置**: `js/modules/dataManager.js - generateMarketData()`

使用算法生成：
```javascript
// 基于基础价格生成趋势
basePrice = 1,200,000 THB
trendData = generateTrendData(30, basePrice, 0.03)
// 生成30天的价格波动数据
```

### 4. 热门车型排行（本地生成）
**生成位置**: `js/modules/dataManager.js - generateHotModels()`

根据车型基础价格和随机因子生成排行。

## 本地数据结构

### 价格趋势数据
```javascript
{
  date: "2024-01-15",  // 日期
  value: 1250000       // 当日平均价格
}
```

### 热门车型数据
```javascript
{
  rank: 1,
  brand: "BYD",
  model: "Atto 3",
  category: "SUV",
  avgPrice: 1200000,
  change: "+5.2%",
  volume: 156,
  trend: "up"
}
```

### 统计数据
```javascript
{
  avgPrice: 1200000,      // 平均车价
  volume: 3500,           // 月成交量
  evRatio: 12.5,          // 新能源占比
  hotModel: "BYD Atto 3", // 热门车型
  priceChange: "+5.2%",   // 价格变化
  volumeChange: "+12.8%", // 成交量变化
  evChange: "+3.5%"       // 新能源占比变化
}
```

## Power BI 数据展示

### 主页面展示内容

1. **KPI 卡片**（4个）
   - 平均车价
   - 月成交量
   - 新能源占比
   - 热门车型

2. **价格趋势图**
   - 近30天/90天/1年价格走势
   - 基于本地生成的趋势数据

3. **品牌份额图**
   - 各品牌市场份额饼图
   - 硬编码数据

4. **热门车型排行表**
   - 前10名热门车型
   - 销量、价格、涨跌

5. **东盟价格对比图**
   - 各国价格对比
   - 基于基础价格数据

6. **AI 市场洞察**
   - 基于本地数据生成的建议

## 离线使用

由于所有数据都在本地生成，应用支持完全离线使用：

1. **首次加载**后所有数据保存在内存中
2. **Service Worker** 缓存静态资源
3. **IndexedDB** 可选用于持久化（当前版本未启用）

## 数据更新

如需更新数据：

### 添加新车型
编辑 `js/config/constants.js`:
```javascript
'BYD': {
  models: {
    'new-model': {
      id: 'new-model',
      name: '新车型',
      category: 'SUV',
      battery: 60,
      range: 420,
      basePrices: { th: 1200000, ... },
      retention: { y1: 0.88, y2: 0.78, y3: 0.68 }
    }
  }
}
```

### 修改价格
编辑 `js/config/constants.js` 中的 `basePrices`。

### 修改国家配置
编辑 `js/config/constants.js` 中的 `COUNTRIES`。

## 调试数据

在浏览器控制台查看本地数据：

```javascript
// 查看所有国家数据
app.dataManager.getCountries()

// 查看当前国家趋势
app.dataManager.getMarketTrend('th', '30d')

// 查看热门车型
app.dataManager.getHotModels(10)

// 查看统计数据
app.dataManager.getStats('th')
```

## 数据流图

```
┌─────────────────────────────────────────┐
│  constants.js                           │
│  ├─ EV_MODELS (车型数据库)               │
│  └─ COUNTRIES (国家配置)                 │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  DataManager                            │
│  ├─ generateMarketData()                │
│  │   └─ 生成价格趋势数据                  │
│  ├─ generateHotModels()                 │
│  │   └─ 生成热门车型排行                  │
│  └─ getStats()                          │
│      └─ 生成统计卡片数据                  │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  UI 展示                                 │
│  ├─ KPI 卡片                             │
│  ├─ 价格趋势图                            │
│  ├─ 品牌份额图                            │
│  ├─ 热门车型表                            │
│  └─ 东盟对比图                            │
└─────────────────────────────────────────┘
```

## 总结

- ✅ 所有数据本地生成
- ✅ 无需网络连接
- ✅ 支持完全离线使用
- ✅ 数据可自定义修改
