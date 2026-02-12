/**
 * ASEAN NEV Insight - Chart Manager
 * 图表管理模块（ECharts）
 */

import { CHART_COLORS } from '../config/constants.js';

export class ChartManager {
  constructor() {
    this.charts = new Map();
    this.resizeObserver = null;
  }

  /**
   * 初始化
   * @param {Object} options - 配置选项
   * @param {Object} options.window - window 对象，默认为全局 window
   * @param {Object} options.echartsLib - echarts 库，默认为全局 echarts
   */
  init(options = {}) {
    this.win = options.window || window;
    this.echartsLib = options.echartsLib || (typeof echarts !== 'undefined' ? echarts : null);
    
    // 监听窗口大小变化
    this._resizeHandler = () => {
      this.charts.forEach(chart => chart.resize());
    };
    this.win.addEventListener('resize', this._resizeHandler);
    
    return this;
  }

  /**
   * 调整所有图表大小
   */
  resizeAll() {
    this.charts.forEach(chart => {
      try {
        chart.resize();
      } catch (e) {
        console.warn('Chart resize failed:', e);
      }
    });
  }

  /**
   * 获取或创建图表实例
   */
  getChart(containerId) {
    if (this.charts.has(containerId)) {
      return this.charts.get(containerId);
    }
    
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`[ChartManager] Container not found: ${containerId}`);
      return null;
    }
    
    console.log(`[ChartManager] Creating chart for: ${containerId}, size: ${container.clientWidth}x${container.clientHeight}`);
    
    if (!this.echartsLib) {
      throw new Error('ECharts library not available');
    }
    const chart = this.echartsLib.init(container);
    this.charts.set(containerId, chart);
    return chart;
  }

  /**
   * 渲染价格趋势图
   */
  renderPriceTrend(containerId, data, options = {}) {
    console.log(`[ChartManager] renderPriceTrend called for ${containerId} with ${data?.length} data points`);
    const chart = this.getChart(containerId);
    if (!chart) {
      console.warn(`[ChartManager] Chart container ${containerId} not found`);
      return;
    }
    
    if (!data || data.length === 0) {
      console.warn(`[ChartManager] No data for chart ${containerId}`);
      return;
    }

    const { title = '', color = CHART_COLORS.primary } = options;

    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: { color: '#1e293b' },
        formatter: (params) => {
          const p = params[0];
          return `<div style="font-weight:600">${p.axisValue}</div>
                  <div style="color:${color}">● ${p.value.toLocaleString()}</div>`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.map(d => d.date.slice(5)), // MM-DD
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#64748b' }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#64748b', formatter: v => (v / 10000).toFixed(0) + '万' },
        splitLine: { lineStyle: { color: '#f1f5f9' } }
      },
      series: [{
        name: '价格',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { color: color, width: 3 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: color + '40' },
            { offset: 1, color: color + '00' }
          ])
        },
        data: data.map(d => d.value)
      }]
    };

    chart.setOption(option);
  }

  /**
   * 渲染品牌份额图
   */
  renderBrandShare(containerId, data) {
    const chart = this.getChart(containerId);
    if (!chart) {
      console.warn(`Chart container ${containerId} not found`);
      return;
    }
    
    if (!data || data.length === 0) {
      console.warn(`No data for chart ${containerId}`);
      return;
    }

    const option = {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        formatter: '{b}: {c}%'
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        textStyle: { color: '#64748b' }
      },
      series: [{
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: data.map((item, i) => ({
          ...item,
          itemStyle: { color: CHART_COLORS.colors[i % CHART_COLORS.colors.length] }
        }))
      }]
    };

    chart.setOption(option);
  }

  /**
   * 渲染东盟价格对比图
   */
  renderAseanComparison(containerId, data, languageManager) {
    const chart = this.getChart(containerId);
    if (!chart) {
      console.warn(`Chart container ${containerId} not found`);
      return;
    }
    
    if (!data || data.length === 0) {
      console.warn(`No data for chart ${containerId}`);
      return;
    }

    // 使用语言管理器翻译国家名称
    const translatedData = data.map(d => ({
      ...d,
      countryName: languageManager?.t(`country.${d.code}`) || d.country
    }));

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        formatter: (params) => {
          const p = params[0];
          const item = translatedData[p.dataIndex];
          return `<div style="font-weight:600">${item.flag} ${item.countryName}</div>
                  <div style="color:${CHART_COLORS.primary}">● ${item.currency} ${p.value.toLocaleString()}</div>`;
        }
      },
      grid: {
        left: '3%',
        right: '8%',
        bottom: '3%',
        top: '5%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        axisLabel: { color: '#64748b' },
        splitLine: { lineStyle: { color: '#f1f5f9' } }
      },
      yAxis: {
        type: 'category',
        data: translatedData.map(d => d.countryName),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#64748b' }
      },
      series: [{
        type: 'bar',
        barWidth: '60%',
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: CHART_COLORS.primary },
            { offset: 1, color: '#5eead4' }
          ])
        },
        data: translatedData.map(d => d.price)
      }]
    };

    chart.setOption(option);
  }

  /**
   * 渲染预测图表
   */
  renderPrediction(containerId, historical, predictions) {
    const chart = this.getChart(containerId);
    if (!chart) return;

    const allData = [...historical, ...predictions];
    const lastHistorical = historical[historical.length - 1];

    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        formatter: (params) => {
          const p = params[0];
          const isPrediction = p.dataIndex >= historical.length;
          return `<div style="font-weight:600">${p.axisValue}</div>
                  <div style="color:${isPrediction ? CHART_COLORS.accent : CHART_COLORS.primary}">
                    ● ${isPrediction ? '预测' : '实际'}: ${p.value.toLocaleString()}
                  </div>`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: allData.map(d => d.date.slice(5)),
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#64748b' }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#64748b', formatter: v => (v / 10000).toFixed(0) + '万' },
        splitLine: { lineStyle: { color: '#f1f5f9' } }
      },
      series: [
        {
          name: '历史价格',
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: { color: CHART_COLORS.primary, width: 3 },
          data: [
            ...historical.map(d => d.value),
            ...predictions.map(() => null)
          ]
        },
        {
          name: '预测价格',
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: { color: CHART_COLORS.accent, width: 3, type: 'dashed' },
          data: [
            ...Array(historical.length - 1).fill(null),
            lastHistorical.value,
            ...predictions.map(d => d.value)
          ],
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: CHART_COLORS.accent + '30' },
              { offset: 1, color: CHART_COLORS.accent + '00' }
            ])
          }
        }
      ]
    };

    chart.setOption(option);
  }

  /**
   * 销毁图表
   */
  dispose(containerId) {
    if (this.charts.has(containerId)) {
      this.charts.get(containerId).dispose();
      this.charts.delete(containerId);
    }
  }

  /**
   * 渲染搜索销量趋势图
   * @param {string} containerId - 容器ID
   * @param {Array} data - 月度数据
   */
  renderSearchVolumeChart(containerId, data) {
    const chart = this.getChart(containerId);
    if (!chart) return;

    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        formatter: (params) => {
          const p = params[0];
          return `<div style="font-weight:600">${p.axisValue}</div>
                  <div style="color:${CHART_COLORS.primary}">● 销量: ${p.value} 辆</div>`;
        }
      },
      grid: {
        left: '3%', right: '4%', bottom: '3%', top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(d => d.month),
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#64748b', rotate: 45 }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#64748b' },
        splitLine: { lineStyle: { color: '#f1f5f9' } }
      },
      series: [{
        type: 'bar',
        barWidth: '60%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: new this.echartsLib.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: CHART_COLORS.primary },
            { offset: 1, color: '#5eead4' }
          ])
        },
        data: data.map(d => d.volume)
      }]
    };

    chart.setOption(option);
  }

  /**
   * 渲染搜索价格趋势图
   * @param {string} containerId - 容器ID
   * @param {Array} data - 月度数据
   */
  renderSearchPriceChart(containerId, data) {
    const chart = this.getChart(containerId);
    if (!chart) return;

    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        formatter: (params) => {
          const p = params[0];
          return `<div style="font-weight:600">${p.axisValue}</div>
                  <div style="color:${CHART_COLORS.accent}">● 均价: ${(p.value / 10000).toFixed(1)}万</div>`;
        }
      },
      grid: {
        left: '3%', right: '4%', bottom: '3%', top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(d => d.month),
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#64748b', rotate: 45 }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { 
          color: '#64748b',
          formatter: v => (v / 10000).toFixed(0) + '万'
        },
        splitLine: { lineStyle: { color: '#f1f5f9' } }
      },
      series: [{
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: CHART_COLORS.accent, width: 3 },
        itemStyle: { color: CHART_COLORS.accent, borderWidth: 2, borderColor: '#fff' },
        areaStyle: {
          color: new this.echartsLib.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: CHART_COLORS.accent + '40' },
            { offset: 1, color: CHART_COLORS.accent + '00' }
          ])
        },
        data: data.map(d => d.avgPrice)
      }]
    };

    chart.setOption(option);
  }

  /**
   * 渲染价格分布图
   * @param {string} containerId - 容器ID
   * @param {Array} data - 价格分布数据
   */
  renderPriceDistribution(containerId, data) {
    const chart = this.getChart(containerId);
    if (!chart) return;

    const option = {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        formatter: '{b}: {c}辆 ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        textStyle: { color: '#64748b' }
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false },
        data: data.map((item, i) => ({
          name: item.label,
          value: item.count,
          itemStyle: { color: CHART_COLORS.colors[i % CHART_COLORS.colors.length] }
        }))
      }]
    };

    chart.setOption(option);
  }

  /**
   * 渲染近期价格趋势图
   * @param {string} containerId - 容器ID
   * @param {Array} dailyStats - 每日统计数据
   */
  renderRecentPriceChart(containerId, dailyStats) {
    const chart = this.getChart(containerId);
    if (!chart) {
      console.warn(`Chart container ${containerId} not found`);
      return;
    }

    if (!dailyStats || dailyStats.length === 0) {
      console.warn(`No data for chart ${containerId}`);
      return;
    }

    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        formatter: (params) => {
          const p = params[0];
          const data = dailyStats[p.dataIndex];
          return `<div style="font-weight:600">${p.axisValue}</div>
                  <div style="color:${CHART_COLORS.primary}">● 均价: ${(p.value / 10000).toFixed(1)}万</div>
                  ${data && data.volume ? `<div style="color:#64748b">成交量: ${data.volume}辆</div>` : ''}`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dailyStats.map(d => d.date),
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#64748b', fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { 
          color: '#64748b',
          fontSize: 11,
          formatter: v => (v / 10000).toFixed(0) + '万'
        },
        splitLine: { lineStyle: { color: '#f1f5f9' } }
      },
      series: [{
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: CHART_COLORS.primary, width: 3 },
        itemStyle: { 
          color: CHART_COLORS.primary, 
          borderWidth: 2, 
          borderColor: '#fff' 
        },
        areaStyle: {
          color: new this.echartsLib.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: CHART_COLORS.primary + '40' },
            { offset: 1, color: CHART_COLORS.primary + '00' }
          ])
        },
        data: dailyStats.map(d => d.avgPrice)
      }]
    };

    chart.setOption(option, true);
  }

  /**
   * 销毁所有图表
   */
  disposeAll() {
    this.charts.forEach(chart => chart.dispose());
    this.charts.clear();
  }

  /**
   * 清理资源（移除事件监听）
   */
  destroy() {
    if (this.win && this._resizeHandler) {
      this.win.removeEventListener('resize', this._resizeHandler);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    this.disposeAll();
    this.charts.clear();
    this._resizeHandler = null;
    this.win = null;
    this.echartsLib = null;
  }
}
