# PakePlus 打包指南

本文档介绍如何使用 PakePlus 将二手车AI智能客服系统打包为桌面应用。

## 什么是 PakePlus？

[PakePlus](https://github.com/pake-plus/pake-plus) 是一个轻量级的工具，可以将任何网页应用打包成桌面应用（Windows、macOS、Linux），基于 Tauri 构建。

## 快速开始

### 1. 安装 PakePlus

```bash
# 全局安装
npm install -g pakeplus

# 或使用 npx
npx pakeplus --version
```

### 2. 准备图标文件

在 `assets/` 目录下放置以下图标文件：

```
assets/
├── icon.png          # 主图标 (512x512 或 1024x1024)
├── icon.ico          # Windows 图标 (256x256)
├── icon.icns         # macOS 图标 (512x512)
└── tray-icon.png     # 托盘图标 (32x32 或 64x64)
```

**图标生成工具推荐：**
- [IconKitchen](https://icon.kitchen/) - 在线图标生成
- [Favicon.io](https://favicon.io/) - 快速生成多平台图标
- [RealFaviconGenerator](https://realfavicongenerator.net/) - 完整的图标方案

### 3. 配置应用

编辑 `pakeplus.config.js` 文件，修改以下配置：

```javascript
module.exports = {
  app: {
    name: 'your-app-name',
    title: '你的应用名称',
    description: '应用描述',
    version: '1.0.0',
    author: '你的名字',
  },
  // ... 其他配置
};
```

### 4. 打包应用

```bash
# 打包所有平台
npm run build

# 仅打包 Windows
npm run build:win

# 仅打包 macOS
npm run build:mac

# 仅打包 Linux
npm run build:linux
```

打包完成后，安装包将位于 `dist/` 目录。

## 配置文件说明

### pakeplus.json (简化配置)

适合快速配置，包含最常用的选项：

- 应用基本信息
- 窗口尺寸
- 图标路径
- 平台特定设置

### pakeplus.config.js (完整配置)

提供更详细的配置选项：

- 窗口行为控制
- 系统托盘菜单
- 快捷键绑定
- 菜单栏配置
- 平台特定构建设置
- 自动更新配置

## 平台特定说明

### Windows

- 输出格式: `.exe` (安装程序) 和 `.exe` (便携版)
- 需要: Windows 10/11
- 安装程序支持自定义安装路径

### macOS

- 输出格式: `.dmg` 和 `.zip`
- 需要: macOS 10.13+
- 签名和公证需要 Apple Developer 账号
- 未签名的应用需要在系统偏好设置中允许运行

### Linux

- 输出格式: `.AppImage`, `.deb`, `.rpm`, `.snap`
- 支持: Ubuntu 18.04+, Fedora 30+, 其他主流发行版
- AppImage 无需安装，直接运行

## 高级配置

### 自定义快捷键

在 `pakeplus.config.js` 中添加：

```javascript
shortcuts: [
  { key: 'Ctrl+Shift+A', action: 'executeJavaScript', code: 'alert("Hello!")' },
  { key: 'F12', action: 'toggleDevTools' },
]
```

### 系统托盘

```javascript
tray: {
  show: true,
  icon: 'assets/tray-icon.png',
  menu: [
    { label: '显示', action: 'show' },
    { label: '退出', action: 'quit' },
  ],
}
```

### 自动更新

```javascript
autoUpdate: {
  enabled: true,
  provider: 'github',
  owner: 'your-username',
  repo: 'your-repo',
}
```

## 常见问题

### Q: 打包失败怎么办？

1. 确保已安装 Node.js 16+
2. 检查图标文件是否存在且格式正确
3. 查看 `dist/` 目录下的日志文件
4. 尝试清理缓存: `pakeplus clean`

### Q: 如何调试打包后的应用？

1. 在配置中启用开发者工具:
   ```javascript
   devtools: { enabled: true }
   ```
2. 使用快捷键 `Ctrl+Shift+I` 打开 DevTools

### Q: 应用启动后白屏？

1. 检查 `main` 配置的入口文件路径是否正确
2. 确保所有资源文件都包含在 `build.files` 中
3. 检查控制台是否有错误信息

### Q: 如何减小安装包体积？

1. 在 `build.ignore` 中排除不需要的文件
2. 使用 `compression: 'maximum'` 启用最大压缩
3. 移除源代码映射: `removeSourceMaps: true`

## 发布到 GitHub Releases

配置自动发布:

```javascript
build: {
  publish: {
    provider: 'github',
    owner: 'your-username',
    repo: 'used-car-ai-chatbot',
    releaseType: 'release',
  },
}
```

设置 GitHub Token 环境变量后运行:

```bash
export GH_TOKEN=your_github_token
npm run build
```

## 参考链接

- [PakePlus GitHub](https://github.com/pake-plus/pake-plus)
- [Tauri 文档](https://tauri.app/)
- [Electron Builder 文档](https://www.electron.build/)

## 许可证

MIT License
