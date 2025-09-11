import { useState } from 'react';
import FileUpload from './components/FileUpload';
import ReportDisplay from './components/ReportDisplay';
import { ParsedDocument } from './types';

function App() {
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
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 
              className="text-4xl font-light text-stone-800 mb-4 tracking-tight cursor-pointer hover:bg-gradient-to-r hover:from-purple-500 hover:via-pink-500 hover:via-cyan-500 hover:to-blue-500 hover:bg-clip-text hover:text-transparent transition-all duration-300 pb-2"
              onClick={handleReset}
            >
              Memreport Insights
            </h1>
            <p className="text-lg text-stone-600 font-light max-w-2xl mx-auto leading-relaxed">
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
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-stone-300 border-t-stone-600"></div>
            </div>
            <p className="text-stone-600 font-light">Analyzing file...</p>
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
      <footer className="border-t border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-stone-500 text-sm font-light">
            &copy; 2025 cignoir
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;