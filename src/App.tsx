import { useState } from 'react';
import FileUpload from './components/FileUpload';
import ReportDisplay from './components/ReportDisplay';
import ThemeToggle from './components/ThemeToggle';
import { ParsedDocument } from './types';
import logo from './assets/logo.png';
import { ThemeProvider } from './contexts/ThemeContext';

function AppContent() {
  const [parsedReport, setParsedReport] = useState<ParsedDocument | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleReportParsed = (report: ParsedDocument) => {
    setParsedReport(report);
    setIsProcessing(false);
  };

  const handleProcessingStart = () => {
    setIsProcessing(true);
    setParsedReport(null);
  };

  const handleReset = () => {
    setParsedReport(null);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 transition-colors duration-200">
      <ThemeToggle />

      {/* Header */}
      <header className="bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <img
                src={logo}
                alt="Memreport Insights Logo"
                className="w-16 h-16 mr-4 cursor-pointer hover:scale-110 transition-transform duration-300"
                onClick={handleReset}
              />
              <h1
                className="text-4xl font-light text-stone-800 dark:text-stone-100 tracking-tight cursor-pointer hover:bg-gradient-to-r hover:from-purple-500 hover:via-pink-500 hover:via-cyan-500 hover:to-blue-500 hover:bg-clip-text hover:text-transparent transition-all duration-300 pb-2"
                onClick={handleReset}
              >
                Memreport Insights
              </h1>
            </div>
            <p className="text-lg text-stone-600 dark:text-stone-300 font-light max-w-2xl mx-auto leading-relaxed -mt-2">
              Memory report visualization and analysis tool for Unreal Engine
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-6 py-12">
        {!parsedReport && !isProcessing && (
          <FileUpload
            onReportParsed={handleReportParsed}
            onProcessingStart={handleProcessingStart}
          />
        )}

        {isProcessing && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-stone-300 dark:border-stone-600 border-t-stone-600 dark:border-t-stone-300"></div>
            </div>
            <p className="text-stone-600 dark:text-stone-300 font-light">Analyzing file...</p>
          </div>
        )}

        {parsedReport && (
          <ReportDisplay
            report={parsedReport}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <a
              href="https://github.com/cignoir/memreport-insights"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors duration-200"
              aria-label="View source on GitHub"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
          <p className="text-stone-500 dark:text-stone-400 text-sm font-light">
            &copy; 2025 cignoir
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;