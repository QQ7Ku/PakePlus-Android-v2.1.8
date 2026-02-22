# Used Car AI Chatbot - Agent Documentation

## Project Overview

AI-powered chatbot for used car valuation and consultation with dual-mode architecture.

## PakePlus Desktop Packaging

本项目支持使用 [PakePlus](https://github.com/pake-plus/pake-plus) 打包为桌面应用。

### 快速打包

```bash
# 安装 PakePlus
npm install -g pakeplus

# 准备图标 (assets/icon.png, icon.ico, icon.icns)

# 打包所有平台
npm run build

# 或指定平台
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

### 配置文件

- `pakeplus.json` - 简化配置
- `pakeplus.config.js` - 完整配置
- `PAKEPLUS_README.md` - 详细打包指南

### 输出格式

- **Windows**: `.exe` (安装程序 + 便携版)
- **macOS**: `.dmg` + `.zip`
- **Linux**: `.AppImage` + `.deb` + `.rpm` + `.snap`

## Architecture

### Dual Mode System

**Local Mode (知识库模式)**
- Uses predefined knowledge base and templates
- Fast response (~1200ms)
- No external API dependencies
- Fallback when cloud mode unavailable

**Cloud Mode (大模型模式)**
- Calls Zhipu AI API (智谱AI)
- Rich, contextual responses
- Slower response (~8500ms)
- Requires API key configuration

## Tech Stack

- **Frontend**: Vanilla JS + Tailwind CSS
- **Server**: Python HTTP Server (port 8888)
- **LLM API**: Zhipu AI (open.bigmodel.cn/api/paas/v4)
- **Storage**: localStorage for settings

## Key Modules

### chatEngine.js
Main processing pipeline with 5 steps:
1. Intent Recognition
2. Entity Extraction
3. Knowledge Retrieval
4. Reasoning
5. Response Generation

### llmService.js
Zhipu AI integration:
- `testZhipuConnection()` - API key validation
- `chatWithZhipu()` - Chat completion
- `generateChatPrompt()` - System prompt builder

### settingsManager.js
Configuration persistence:
- API key storage (zhipuApiKey)
- Model selection (zhipuModel)
- Mode toggle (local/cloud)

### main.js
UI controller with tech panel display showing different code for each mode.

## Settings

Settings are saved to localStorage:
- `zhipuApiKey` - Zhipu AI API key
- `zhipuModel` - Selected model (glm-4, glm-4-flash, etc.)
- `chatMode` - 'local' or 'cloud'

## Cache Busting

Using `?v=2` version parameter on module imports to ensure fresh loads.

## Testing Results

| Mode | Response Time | Character Count | Token Usage |
|------|---------------|-----------------|-------------|
| Local | ~1246ms | ~213 chars | N/A |
| Cloud | ~8532ms | ~489 chars | 259/299 |

## File Structure

```
used-car-ai-chatbot/
├── index.html              # Main UI
├── css/
│   └── styles.css          # Tailwind + custom styles
├── js/
│   ├── main.js             # App controller
│   └── modules/
│       ├── chatEngine.js   # Core chat logic
│       ├── llmService.js   # LLM API integration
│       ├── settingsManager.js  # Config persistence
│       ├── intentRecognizer.js
│       ├── entityExtractor.js
│       ├── knowledgeBase.js
│       └── responseGenerator.js
└── data/
    └── car_knowledge.json  # Knowledge base
```

## Development Notes

- Cloud mode properly calls Zhipu AI API, not just UI switch
- Technical panel shows different code based on mode
- Settings persist across sessions
- Graceful fallback to local mode if API fails
