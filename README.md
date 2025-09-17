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

**Get started in seconds with NPX!**
*(Requires Node.js 18+)*

```bash
npx memreport-insights
```

Upload your `.memreport` file and instantly see beautiful, interactive analysis instead of scrolling through thousands of lines of raw text.

---

## 📸 Screenshots


### Interactive table of contents

<img src="https://github.com/user-attachments/assets/0d56eaf9-be60-4608-8cb9-5103459365f7" width="600">

### Sort & analyze memory patterns

<img src="https://github.com/user-attachments/assets/14047552-92b3-4b84-bbd2-f5a72c662e3d" width="600">

---

## ✨ Why Memreport Insights?

### 🤯 Before: Raw Text Hell
- Scrolling through 50,000+ lines of raw text
- No visual hierarchy or organization
- Impossible to spot patterns or trends
- Manual calculation of memory totals
- No way to quickly find specific allocations

### 🎉 After: Beautiful Analysis
- **Interactive Tables**: Sort, filter, and search through memory data
- **Visual Hierarchy**: Clear sections with expandable/collapsible organization
- **Smart Parsing**: Automatic detection of UE4/UE5 versions and formats
- **Instant Search**: Find any allocation, texture, or object in milliseconds
- **Export Ready**: Download formatted HTML reports for sharing
- **Privacy First**: All processing happens in your browser - files never leave your machine

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

## 🎮 How to Generate .memreport Files

### During Gameplay (Recommended):
1. **Launch your game** or **Play in Editor**
2. **Open the console** (usually `^` or `@` key)
3. **Execute the command**:
   ```
   memreport -full
   ```
4. **Find the generated file** at:
   ```
   YourProject/Saved/Profiling/MemReports/
   ```

### File Naming Convention:
Generated files follow this pattern:
```
[ProjectName]-[Platform]-[Timestamp].memreport
```
Example: `MyGame-WindowsEditor-09.16-17.17.22.memreport`

### Alternative Methods:
```
# Basic memory report (less detailed)
memreport
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

## 📁 Project Structure

```
memreport-insights/
├── 📱 src/
│   ├── 🧩 components/         # React Components
│   │   ├── FileUpload.tsx     # Drag & drop interface
│   │   ├── ReportDisplay.tsx  # Main report viewer
│   │   ├── TableDisplay.tsx   # Interactive data tables
│   │   └── TableOfContents.tsx # Navigation sidebar
│   ├── 📚 lib/                # Core Libraries
│   │   ├── memreportParser.ts # .memreport file parser
│   │   └── htmlGenerator.ts   # HTML export generator
│   ├── ⚙️ config/             # Configuration System
│   │   ├── parse_patterns/    # UE version-specific parsers
│   │   ├── engine_settings/   # BaseEngine.ini configurations
│   │   └── *.ts              # Config loaders
│   ├── 🔷 types/              # TypeScript Definitions
│   └── 🎯 App.tsx             # Main Application Component
├── 🚀 bin/                    # NPX executable
├── 📦 dist/                   # Built application
└── 📋 package.json            # Project configuration
```

---

## 🤝 Contributing

We welcome contributions from the Unreal Engine community!

### 🌟 How to Contribute

1. **🍴 Fork** the repository
2. **🌿 Create** a feature branch: `git checkout -b amazing-feature`
3. **💻 Commit** your changes: `git commit -m 'Add amazing feature'`
4. **📤 Push** to the branch: `git push origin amazing-feature`
5. **🔄 Submit** a Pull Request

### 🎯 Areas We Need Help

- 🆕 **New UE Versions**: Help us support the latest Unreal releases
- 🐛 **Bug Reports**: Found an issue? Let us know!
- 📊 **Visualizations**: Ideas for better data presentation
- 🎨 **UI/UX**: Make the interface even more intuitive
- 📖 **Documentation**: Help others learn to use the tool
- 🧪 **Testing**: Test with different project types and sizes

### 📝 Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Update documentation for new features
- Ensure mobile responsiveness
- Test with multiple UE versions when possible
- Add tests for new parsing logic

---

## 📊 Usage Examples

### Memory Hotspot Analysis
```
1. Upload your .memreport file
2. Navigate to "Texture Memory" section
3. Sort by "Size" to find largest textures
4. Use search to find specific asset paths
5. Export filtered results for team review
```

### Performance Regression Investigation
```
1. Compare memory reports before/after changes
2. Use the search function to find specific objects
3. Check "RenderTarget Pool" for GPU memory issues
4. Analyze "StaticMesh" section for geometry bloat
```

### Team Collaboration
```
1. Generate HTML export of your analysis
2. Share the standalone HTML file with your team
3. Include findings in code reviews
4. Archive reports for historical comparison
```

---

## 🎖️ Credits

### 🙏 Special Thanks

- **Unreal Engine Community**: For feedback and feature requests
- **Epic Games**: For creating the .memreport format and documentation
- **Contributors**: Everyone who has submitted PRs, issues, and suggestions

### 🛡️ Built With Love Using

- [React](https://reactjs.org/) - The UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety and developer experience
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vite](https://vitejs.dev/) - Lightning fast build tool
- [ESLint](https://eslint.org/) - Code quality and consistency

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**TL;DR**: You can use, modify, and distribute this tool freely, even for commercial projects. Just keep the original license notice.

---

## 🆘 Support & Community

### 💬 Get Help
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/cignoir/memreport-insights/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/cignoir/memreport-insights/discussions)
- 📖 **Documentation**: [Wiki](https://github.com/cignoir/memreport-insights/wiki)

### 🌐 Connect With Us
- ⭐ **Star** this repo if it helps your workflow
- 🐦 **Follow** us for updates: [@memreport_insights](https://twitter.com/memreport_insights)
- 💼 **LinkedIn**: [Memreport Insights](https://linkedin.com/company/memreport-insights)

---

<div align="center">

**Made with ❤️ for the Unreal Engine community**

*Stop struggling with raw memory reports. Start gaining insights.*

[⭐ Star this repo](https://github.com/cignoir/memreport-insights) • [🚀 Try it now](https://memreport-insights.com) • [📖 Read the docs](https://github.com/cignoir/memreport-insights/wiki)

</div>
