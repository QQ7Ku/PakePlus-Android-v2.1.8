# 图标文件说明

PakePlus 打包需要以下图标文件：

## 必需文件

| 文件名 | 格式 | 推荐尺寸 | 用途 |
|--------|------|----------|------|
| `icon.png` | PNG | 512x512 或 1024x1024 | 主图标，通用格式 |
| `icon.ico` | ICO | 256x256 | Windows 应用图标 |
| `icon.icns` | ICNS | 512x512 | macOS 应用图标 |
| `tray-icon.png` | PNG | 32x32 或 64x64 | 系统托盘图标 |

## 图标生成工具

### 在线工具 (推荐)

1. **[IconKitchen](https://icon.kitchen/)** ⭐ 推荐
   - 专为应用图标设计
   - 支持导出所有平台格式
   - 提供多种模板和样式

2. **[Favicon.io](https://favicon.io/)**
   - 简单快速
   - 支持从文字/图片生成

3. **[RealFaviconGenerator](https://realfavicongenerator.net/)**
   - 完整的图标方案
   - 支持各种平台优化

### 本地工具

1. **ImageMagick** (命令行)
   ```bash
   # PNG 转 ICO
   convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico
   
   # PNG 转 ICNS (macOS)
   png2icns icon.icns icon.png
   ```

2. **icotools** (Linux)
   ```bash
   icotool -c icon.png -o icon.ico
   ```

## 设计建议

### 颜色方案

本项目使用以下主题色：

- 主色: `#1e3a5f` (深蓝色)
- 辅助色: `#3b82f6` (亮蓝色)
- 强调色: `#10b981` (绿色)

### 图标风格建议

1. **简洁现代** - 使用扁平化设计
2. **识别度高** - 可以结合以下元素：
   - 🤖 机器人/AI 元素
   - 🚗 汽车元素
   - 💬 对话气泡
   - 📊 数据/图表

3. **背景** - 建议使用纯色或渐变背景

### 示例设计

```
┌─────────────────┐
│   🔵 深蓝背景    │
│                 │
│    🤖 机器人    │
│    🚗 汽车      │
│                 │
│   AI二手车客服   │
└─────────────────┘
```

## 快速开始

1. 访问 [IconKitchen](https://icon.kitchen/)
2. 选择背景颜色: `#1e3a5f`
3. 添加图标: 搜索 "robot" 或 "car"
4. 调整大小和位置
5. 下载所有平台图标
6. 解压到 `assets/` 目录

## 验证图标

打包前检查图标文件：

```bash
# Windows
ls assets/*.ico

# macOS/Linux
ls assets/*.icns assets/*.png
```

## 注意事项

1. **尺寸要求** - 不要使用过小的图片放大
2. **透明背景** - PNG 可以保留透明背景
3. **版权** - 使用免费或自有版权的图标素材
4. **多尺寸** - ICO 文件应包含多个分辨率

## 推荐素材网站

- [Flaticon](https://www.flaticon.com/) - 免费矢量图标
- [Iconfont](https://www.iconfont.cn/) - 阿里巴巴矢量图标库
- [Heroicons](https://heroicons.com/) - 开源图标集
- [Lucide](https://lucide.dev/) - 现代图标集
