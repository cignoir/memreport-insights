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
      {/* Version Compatibility Card */}
      <div className="bg-white rounded-2xl border border-stone-300 shadow-md overflow-hidden">
        <div className="px-8 py-6 border-b border-stone-200">
          <h2 className="text-xl font-medium text-stone-900 text-center">Supported Versions</h2>
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
                <div className="text-sm font-medium text-stone-700">{version}</div>
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
            ? 'border-stone-400 bg-stone-50/50 shadow-lg' 
            : 'border-stone-300 hover:border-stone-400 hover:bg-stone-50/30'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="px-8 py-16 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-stone-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          
          <h3 className="text-xl font-light text-stone-800 mb-2">
            Upload File
          </h3>
          <p className="text-stone-500 mb-8 font-light">
            Drag & drop a .memreport file or select from the button below
          </p>
          
          <label className="inline-flex items-center px-8 py-3 bg-stone-800 hover:bg-stone-700 text-white text-sm font-medium rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md">
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
          
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-6">
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mr-3">
              <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;