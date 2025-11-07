# 🧠 Memreport Insights

<div align="center">
<img src="https://github.com/user-attachments/assets/fab58f2b-a237-4f63-802d-4c9b78b28f8d" width="200">

**Transform Unreal Engine memory reports into beautiful, interactive visualizations**

[![npm version](https://img.shields.io/npm/v/memreport-insights.svg)](https://www.npmjs.com/package/memreport-insights)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-Powered-646CFF.svg)](https://vitejs.dev/)

</div>

---

## 🚀 Quick Start

### 🌐 **Try the Online Demo**
**No installation required!**

[**🔗 Live Demo**](https://cignoir.github.io/memreport-insights/)

Try it instantly with our sample UE5.6 memreport file. Perfect for exploring the features before installing locally.

### ⚡ **Install Locally with NPX**
**Get started in seconds!**
*(Requires Node.js 18+)*

```bash
npx memreport-insights
```

Upload your `.memreport` file and instantly see beautiful, interactive analysis instead of scrolling through thousands of lines of raw text.

---

## 📸 Screenshots

<img width="1024" height="329" alt="intro" src="https://github.com/user-attachments/assets/f3530173-175c-4159-99b8-0c57333dc67b" />

---

## 🎯 Key Features

### 🔒 **Privacy-Focused Architecture**
- **Zero Server Processing**: Files are analyzed entirely in your browser
- **No Data Collection**: Your memory reports stay on your machine
- **Offline Capable**: Works without internet after initial load

### 🎨 **Modern Developer Experience**
- **Instant Start**: `npx memreport-insights` and you're ready
- **Mobile Responsive**: Analyze reports on any device
- **Dark/Light Themes**: Built-in theme support for long analysis sessions
- **Export Options**: Save analysis as HTML for team sharing

### 🏗️ **Multi-Version Support**
- **UE 4.27**: Full support with complete section parsing
- **UE 5.1-5.6**: Latest Unreal Engine 5 features supported
- **Auto-Detection**: Automatically detects and adapts to your UE version

### ⚡ **Performance Optimized**
- **Large File Handling**: Efficiently processes multi-MB memory reports
- **Lazy Loading**: Only renders visible data for smooth scrolling
- **Smart Caching**: Instant re-analysis of previously loaded files

---

## 📦 Installation & Usage

### Option 1: NPX (Recommended)
```bash
# Start immediately - no installation needed
npx memreport-insights

# Custom port and options
npx memreport-insights --port 8080 --no-open
```

### Option 2: Local Development
```bash
# Clone and install
git clone https://github.com/cignoir/memreport-insights.git
cd memreport-insights
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Option 3: Global Install
```bash
npm install -g memreport-insights
memreport-insights
```

---

## 🔧 Advanced Usage

### Command Line Options
```bash
npx memreport-insights [options]

Options:
  -p, --port <port>     Server port (default: 8173)
  -h, --host <host>     Server host (default: localhost)
  --no-open            Don't auto-open browser
  --help               Show help message
  --version            Show version
```

### Environment Variables
```bash
# Custom configuration
MEMREPORT_PORT=8080
MEMREPORT_HOST=0.0.0.0
MEMREPORT_THEME=dark
```

---

## 🔄 Supported Unreal Engine Versions

| Version | Status | Features | Notes |
|---------|--------|----------|-------|
| **UE 4.27** | ✅ **Full Support** | Complete parsing, all sections | Stable and tested |
| **UE 5.0** | ❌ Not Supported | - | Configuration pending |
| **UE 5.1** | ✅ **Full Support** | All UE5.1 features | Recommended |
| **UE 5.2** | ✅ **Full Support** | Enhanced memory tracking | Recommended |
| **UE 5.3** | ✅ **Full Support** | Nanite/Lumen analysis | Latest features |
| **UE 5.4** | 🟡 **Partial Support** | Core functionality | Some features pending |
| **UE 5.5** | ✅ **Full Support** | World Partition support | Latest stable |
| **UE 5.6** | ✅ **Full Support** | Chaos Physics analysis | Cutting edge |

---

## 🛠️ Tech Stack

<div align="center">

| Frontend | Build Tools | Quality |
|----------|-------------|---------|
| ![React](https://img.shields.io/badge/React-18+-61dafb?style=for-the-badge&logo=react) | ![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?style=for-the-badge&logo=vite) | ![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=for-the-badge&logo=typescript) |
| ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss) | ![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js) | ![ESLint](https://img.shields.io/badge/ESLint-Configured-4B32C3?style=for-the-badge&logo=eslint) |

</div>

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**TL;DR**: You can use, modify, and distribute this tool freely, even for commercial projects. Just keep the original license notice.
