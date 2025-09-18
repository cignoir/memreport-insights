import React, { useCallback, useState } from 'react';
import { MemreportParser } from '../lib/memreportParser';
import { ConfigResolver } from '../config/configResolver';
import { detectUEVersion } from '../config/configLoader';
import { ParsedDocument } from '../types';

interface FileUploadProps {
  onReportParsed: (report: ParsedDocument) => void;
  onProcessingStart: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onReportParsed, onProcessingStart }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detect if running in CLI mode (localhost) vs Web demo mode (GitHub Pages)
  const isCliMode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  const processFile = useCallback(async (file: File) => {

    // Check file extension
    if (!file.name.endsWith('.memreport')) {
      setError('Please select a .memreport file.');
      return;
    }

    setError(null);
    onProcessingStart();

    try {
      const content = await file.text();

      // Detect UE version and load configuration
      const detectedVersion = detectUEVersion(content);
      const resolvedConfig = await ConfigResolver.loadEngineConfig(detectedVersion);

      // Yield to browser to update UI before heavy parsing
      await new Promise(resolve => setTimeout(resolve, 0));

      const parser = new MemreportParser(content, file.name, resolvedConfig.sections);
      const parsedReport = await parser.parse();

      onReportParsed(parsedReport);
    } catch (err) {
      setError('An error occurred while processing the file.');
      console.error('Parse error:', err);
    }
  }, [onReportParsed, onProcessingStart]);

  const processSampleFile = useCallback(async () => {
    setError(null);
    onProcessingStart();

    try {
      // Fetch the sample file from public directory
      const baseUrl = import.meta.env.BASE_URL || '/';
      const sampleUrl = `${baseUrl}sample/demo.memreport`;
      const response = await fetch(sampleUrl);
      if (!response.ok) {
        throw new Error('Failed to load sample file');
      }

      const content = await response.text();
      const fileName = 'UE5.6_Sample.memreport';

      // Detect UE version and load configuration
      const detectedVersion = detectUEVersion(content);
      const resolvedConfig = await ConfigResolver.loadEngineConfig(detectedVersion);

      // Yield to browser to update UI before heavy parsing
      await new Promise(resolve => setTimeout(resolve, 0));

      const parser = new MemreportParser(content, fileName, resolvedConfig.sections);
      const parsedReport = await parser.parse();

      onReportParsed(parsedReport);
    } catch (err) {
      setError('An error occurred while loading the sample file.');
      console.error('Sample load error:', err);
    }
  }, [onReportParsed, onProcessingStart]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* CLI Information Card - Only show in web demo mode */}
      {!isCliMode && (
        <div className="bg-gradient-to-r from-stone-600 to-stone-700 dark:from-stone-700 dark:to-stone-800 rounded-2xl shadow-md overflow-hidden transition-colors duration-200 mb-8">
          <div className="px-8 py-6">
            <div className="text-center">
              <h2 className="text-xl font-medium text-white mb-3">Try the CLI Version</h2>
              <p className="text-stone-200 dark:text-stone-300 mb-4 font-light">
                For production use, install the CLI tool locally with NPX
              </p>
              <div className="bg-stone-800 dark:bg-stone-900 rounded-lg px-6 py-4 mb-4">
                <code className="text-green-400 font-mono text-sm">npx memreport-insights</code>
              </div>
              <p className="text-stone-300 dark:text-stone-400 text-sm">
                No installation required • Works with any .memreport file • Blazing fast
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Version Compatibility Card */}
      <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-300 dark:border-stone-600 shadow-md overflow-hidden transition-colors duration-200">
        <div className="px-8 py-6 border-b border-stone-200 dark:border-stone-700">
          <h2 className="text-xl font-medium text-stone-900 dark:text-stone-100 text-center">Supported Versions</h2>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-5 gap-4 text-center">
            {[
              { version: 'UE 4.27', status: 'supported' },
              { version: 'UE 5.0', status: 'unsupported' },
              { version: 'UE 5.1', status: 'supported' },
              { version: 'UE 5.2', status: 'supported' },
              { version: 'UE 5.3', status: 'supported' },
              { version: 'UE 5.4', status: 'partial' },
              { version: 'UE 5.5', status: 'supported' },
              { version: 'UE 5.6', status: 'supported' }
            ].map(({ version, status }) => (
              <div key={version} className="space-y-3">
                <div className="text-sm font-medium text-stone-700 dark:text-stone-300">{version}</div>
                <div className="flex justify-center">
                  {status === 'supported' ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    </div>
                  ) : status === 'partial' ? (
                    <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* File Upload Area */}
      <div
        className={`
          relative rounded-2xl border-2 border-dashed transition-all duration-200
          ${isDragOver
            ? 'border-stone-400 dark:border-stone-500 bg-stone-50/50 dark:bg-stone-800/50 shadow-lg'
            : 'border-stone-300 dark:border-stone-600 hover:border-stone-400 dark:hover:border-stone-500 hover:bg-stone-50/30 dark:hover:bg-stone-800/30'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="px-8 py-16 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-stone-100 dark:bg-stone-700 flex items-center justify-center transition-colors duration-200">
              <svg className="w-8 h-8 text-stone-500 dark:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          
          <h3 className="text-xl font-light text-stone-800 dark:text-stone-200 mb-2">
            Upload File
          </h3>
          <p className="text-stone-500 dark:text-stone-400 mb-8 font-light">
            {isCliMode
              ? 'Drag & drop your .memreport file or select one to analyze'
              : 'Drag & drop your .memreport file, select one, or try with our sample file'
            }
          </p>

          {isCliMode ? (
            // CLI Mode - Only show file selection
            <label className="inline-flex items-center px-8 py-3 bg-stone-800 dark:bg-stone-700 hover:bg-stone-700 dark:hover:bg-stone-600 text-white text-sm font-medium rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Select File
              <input
                type="file"
                accept=".memreport"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          ) : (
            // Web Demo Mode - Show file selection AND sample option
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <label className="inline-flex items-center px-8 py-3 bg-stone-800 dark:bg-stone-700 hover:bg-stone-700 dark:hover:bg-stone-600 text-white text-sm font-medium rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Select File
                <input
                  type="file"
                  accept=".memreport"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              <div className="flex items-center">
                <div className="border-t border-stone-300 dark:border-stone-600 w-8 mx-3 sm:hidden"></div>
                <span className="text-stone-400 dark:text-stone-500 text-sm font-light px-3 hidden sm:block">or</span>
                <div className="border-t border-stone-300 dark:border-stone-600 w-8 mx-3 sm:hidden"></div>
              </div>

              <button
                onClick={processSampleFile}
                className="inline-flex items-center px-8 py-3 bg-stone-600 hover:bg-stone-800 dark:bg-stone-400 dark:hover:bg-stone-300 text-white dark:text-stone-900 text-sm font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Try with Sample
              </button>
            </div>
          )}
          
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-xl p-6 transition-colors duration-200">
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-800/50 flex items-center justify-center mr-3">
              <svg className="w-3 h-3 text-red-500 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;