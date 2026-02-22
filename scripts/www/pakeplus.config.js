/**
 * PakePlus Configuration
 * 二手车AI智能客服系统 - 桌面应用打包配置
 * 
 * PakePlus: https://github.com/pake-plus/pake-plus
 * 安装: npm install -g pakeplus
 * 打包: pakeplus build
 */

module.exports = {
  // 应用基本信息
  app: {
    name: 'used-car-ai-chatbot',
    title: '二手车AI智能客服系统',
    description: '二手车智能客服工作流展示 - AI思考过程可视化',
    version: '1.0.0',
    author: 'AI Developer',
    copyright: 'Copyright © 2024 AI Developer',
    
    // 入口文件
    main: 'index.html',
    
    // 应用图标 (请准备以下格式的图标文件)
    icon: {
      png: 'assets/icon.png',      // 512x512 或 1024x1024
      ico: 'assets/icon.ico',      // Windows (256x256)
      icns: 'assets/icon.icns',    // macOS (512x512)
    },
  },

  // 窗口配置
  window: {
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    
    // 窗口行为
    resizable: true,
    maximizable: true,
    minimizable: true,
    fullscreenable: true,
    closable: true,
    
    // 初始状态
    fullscreen: false,
    maximized: false,
    alwaysOnTop: false,
    
    // 外观
    transparent: false,
    frame: true,           // 显示原生标题栏
    titleBarStyle: 'default',
    
    // 背景色 (与主题色一致)
    backgroundColor: '#f8fafc',
    themeColor: '#1e3a5f',
    
    // 启动位置
    center: true,
  },

  // 浏览器引擎配置
  browser: {
    // 用户代理
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    
    // 启用功能
    enableGPU: true,
    enableWebGL: true,
    enableMediaStream: true,
    enableSpeechAPI: false,
    enableRemoteModule: false,
    
    // 安全设置
    webSecurity: true,
    allowRunningInsecureContent: false,
    experimentalFeatures: false,
    
    // 缩放
    zoomFactor: 1.0,
    zoomable: true,
  },

  // 开发者工具
  devtools: {
    enabled: false,        // 生产环境关闭
    openOnStart: false,
  },

  // 系统托盘
  tray: {
    show: true,
    icon: 'assets/tray-icon.png',
    tooltip: '二手车AI智能客服系统',
    
    // 右键菜单
    menu: [
      { label: '显示主窗口', action: 'show' },
      { label: '隐藏主窗口', action: 'hide' },
      { type: 'separator' },
      { label: '设置', action: 'navigate', path: 'settings.html' },
      { type: 'separator' },
      { label: '退出', action: 'quit' },
    ],
    
    // 点击行为
    clickToShow: true,     // 左键点击显示窗口
    doubleClickToShow: true,
  },

  // 通知
  notifications: {
    enabled: true,
    defaultIcon: 'assets/icon.png',
  },

  // 快捷键
  shortcuts: [
    { key: 'Ctrl+Shift+I', action: 'toggleDevTools' },
    { key: 'Ctrl+R', action: 'reload' },
    { key: 'F5', action: 'reload' },
    { key: 'Ctrl+Shift+R', action: 'forceReload' },
    { key: 'F11', action: 'toggleFullscreen' },
    { key: 'Ctrl+Q', action: 'quit' },
    { key: 'Ctrl+W', action: 'hide' },
    { key: 'Ctrl+M', action: 'minimize' },
    { key: 'Ctrl+Shift+M', action: 'maximize' },
    
    // 应用特定快捷键
    { key: 'Ctrl+1', action: 'navigate', path: 'index.html', description: '主页' },
    { key: 'Ctrl+2', action: 'navigate', path: 'demo.html', description: '技术展示' },
    { key: 'Ctrl+3', action: 'navigate', path: 'settings.html', description: '设置' },
    { key: 'Ctrl+L', action: 'executeJavaScript', code: "document.getElementById('localModeBtn')?.click()", description: '切换到本地模式' },
    { key: 'Ctrl+Shift+C', action: 'executeJavaScript', code: "document.getElementById('cloudModeBtn')?.click()", description: '切换到云端模式' },
  ],

  // 菜单栏 (macOS/Linux)
  menu: {
    enabled: true,
    items: [
      {
        label: '应用',
        submenu: [
          { label: '关于', action: 'about' },
          { type: 'separator' },
          { label: '设置', action: 'navigate', path: 'settings.html', accelerator: 'Ctrl+,' },
          { type: 'separator' },
          { label: '隐藏', action: 'hide', accelerator: 'Ctrl+H' },
          { label: '隐藏其他', action: 'hideOthers', accelerator: 'Ctrl+Shift+H' },
          { label: '显示全部', action: 'showAll' },
          { type: 'separator' },
          { label: '退出', action: 'quit', accelerator: 'Ctrl+Q' },
        ],
      },
      {
        label: '视图',
        submenu: [
          { label: '主页', action: 'navigate', path: 'index.html', accelerator: 'Ctrl+1' },
          { label: '技术展示', action: 'navigate', path: 'demo.html', accelerator: 'Ctrl+2' },
          { label: '设置', action: 'navigate', path: 'settings.html', accelerator: 'Ctrl+3' },
          { type: 'separator' },
          { label: '刷新', action: 'reload', accelerator: 'Ctrl+R' },
          { label: '强制刷新', action: 'forceReload', accelerator: 'Ctrl+Shift+R' },
          { type: 'separator' },
          { label: '全屏', action: 'toggleFullscreen', accelerator: 'F11' },
          { label: '开发者工具', action: 'toggleDevTools', accelerator: 'Ctrl+Shift+I' },
        ],
      },
      {
        label: '模式',
        submenu: [
          { label: '本地模式', action: 'executeJavaScript', code: "localStorage.setItem('chatMode', 'local'); location.reload();" },
          { label: '云端模式', action: 'executeJavaScript', code: "localStorage.setItem('chatMode', 'cloud'); location.reload();" },
        ],
      },
      {
        label: '窗口',
        submenu: [
          { label: '最小化', action: 'minimize', accelerator: 'Ctrl+M' },
          { label: '最大化', action: 'maximize', accelerator: 'Ctrl+Shift+M' },
          { label: '关闭', action: 'close', accelerator: 'Ctrl+W' },
        ],
      },
      {
        label: '帮助',
        submenu: [
          { label: '使用文档', action: 'openExternal', url: 'https://github.com/used-car-ai-chatbot/docs' },
          { type: 'separator' },
          { label: '检查更新', action: 'checkUpdate' },
          { type: 'separator' },
          { label: '反馈问题', action: 'openExternal', url: 'https://github.com/used-car-ai-chatbot/issues' },
        ],
      },
    ],
  },

  // 平台特定配置
  platforms: {
    // Windows
    win32: {
      target: ['nsis', 'portable'],
      icon: 'assets/icon.ico',
      publisher: 'AI Developer',
      
      // 安装程序配置
      nsis: {
        oneClick: false,           // 显示安装向导
        allowToChangeInstallationDirectory: true,
        createDesktopShortcut: true,
        createStartMenuShortcut: true,
        shortcutName: '二手车AI智能客服系统',
        uninstallDisplayName: '二手车AI智能客服系统',
        license: 'LICENSE.txt',     // 许可协议文件
        artifactName: 'UsedCarAI-Setup-${version}.exe',
      },
      
      // 便携版配置
      portable: {
        artifactName: 'UsedCarAI-Portable-${version}.exe',
      },
      
      // 文件关联
      fileAssociations: [],
      
      // 协议处理
      protocols: [
        {
          name: '二手车AI客服协议',
          schemes: ['usedcar-ai'],
        },
      ],
    },

    // macOS
    darwin: {
      target: ['dmg', 'zip'],
      icon: 'assets/icon.icns',
      bundleIdentifier: 'com.ai.used-car-chatbot',
      category: 'public.app-category.productivity',
      
      // DMG 配置
      dmg: {
        title: '二手车AI智能客服系统 ${version}',
        artifactName: 'UsedCarAI-${version}.dmg',
        backgroundColor: '#f8fafc',
        window: {
          width: 540,
          height: 380,
        },
        contents: [
          { x: 130, y: 220, type: 'file' },
          { x: 410, y: 220, type: 'link', path: '/Applications' },
        ],
      },
      
      // 签名和公证 (需要 Apple Developer 账号)
      identity: null,
      hardenedRuntime: true,
      gatekeeperAssess: false,
      entitlements: 'build/entitlements.mac.plist',
      entitlementsInherit: 'build/entitlements.mac.plist',
    },

    // Linux
    linux: {
      target: ['AppImage', 'deb', 'rpm', 'snap'],
      icon: 'assets/icon.png',
      category: 'Office',
      maintainer: 'AI Developer',
      vendor: 'AI Developer',
      synopsis: '二手车智能客服工作流展示系统',
      
      // AppImage 配置
      appImage: {
        artifactName: 'UsedCarAI-${version}.AppImage',
      },
      
      // Debian 包配置
      deb: {
        artifactName: 'usedcar-ai_${version}_amd64.deb',
        depends: ['libgtk-3-0', 'libnotify4', 'libnss3', 'libxss1', 'libxtst6', 'xdg-utils', 'libatspi2.0-0', 'libuuid1'],
      },
      
      // RPM 包配置
      rpm: {
        artifactName: 'usedcar-ai-${version}.x86_64.rpm',
      },
      
      // Snap 配置
      snap: {
        artifactName: 'usedcar-ai_${version}_amd64.snap',
        grade: 'stable',
        confinement: 'strict',
        plugs: ['home', 'network', 'network-bind', 'desktop', 'desktop-legacy', 'wayland', 'x11'],
      },
    },
  },

  // 构建配置
  build: {
    outputDir: 'dist',
    
    // ASAR 打包
    asar: true,
    asarUnpack: [
      'node_modules/**/*',
      '**/*.node',
    ],
    
    // 压缩
    compression: 'maximum',
    
    // 优化
    removeSourceMaps: true,
    minify: true,
    
    // 包含的文件
    files: [
      'index.html',
      'demo.html',
      'settings.html',
      'css/**/*',
      'js/**/*',
      'data/**/*',
      'assets/**/*',
      'package.json',
    ],
    
    // 排除的文件
    ignore: [
      'node_modules',
      'dist',
      'build',
      '.git',
      '.github',
      '*.md',
      '*.log',
      'pakeplus.json',
      'pakeplus.config.js',
    ],
    
    // 额外资源
    extraResources: [
      {
        from: 'data/',
        to: 'data/',
      },
    ],
    
    // 发布配置
    publish: {
      provider: 'github',
      owner: 'your-username',
      repo: 'used-car-ai-chatbot',
      releaseType: 'release',
    },
  },

  // 注入脚本
  inject: {
    // 启动时注入
    start: [
      // 'js/pakeplus-bridge.js',
    ],
    
    // 页面加载前注入
    preload: [],
    
    // 页面加载后注入
    postload: [],
  },

  // 代理配置
  proxy: null,

  // URL 重写规则
  rewrite: [],

  // 请求头
  headers: {},

  // 禁用 CSP (仅开发时使用)
  disableCSP: false,

  // 自动更新
  autoUpdate: {
    enabled: false,
    channel: 'latest',
    checkOnStart: true,
  },

  // 崩溃报告
  crashReporter: {
    enabled: false,
    url: '',
    submitUrl: '',
    uploadToServer: false,
  },

  // 分析统计
  analytics: {
    enabled: false,
  },
};
