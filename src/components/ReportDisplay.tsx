import React, { useState } from 'react';
import { ParsedDocument } from '../types';
import SectionDisplay from './SectionDisplay';
import TableOfContents from './TableOfContents';
import { HtmlGenerator } from '../lib/htmlGenerator';

interface ReportDisplayProps {
  report: ParsedDocument;
  onReset: () => void;
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({ report }) => {
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [fileName, setFileName] = useState(() =>
    report.title.replace(/\.memreport$/, '') + '.html'
  );

  const handleDownloadClick = () => {
    setShowDownloadDialog(true);
  };

  const handleDownloadConfirm = () => {
    try {
      const generator = new HtmlGenerator(report);
      const htmlContent = generator.generate();
      
      // Add .html extension if not included
      const finalFileName = fileName.trim().toLowerCase().endsWith('.html') 
        ? fileName.trim() 
        : fileName.trim() + '.html';
      
      // Create Blob and download
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setShowDownloadDialog(false);
    } catch (error) {
      console.error('HTML generation error:', error);
      alert('An error occurred while generating the HTML file.');
    }
  };

  return (
    <>
      <div className="w-full max-w-none space-y-8">
        {/* Header with controls */}
        <div className="bg-white rounded-2xl border border-stone-300 shadow-md overflow-hidden">
          <div className="px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-medium text-stone-900 truncate mb-2">
                  {report.title}
                </h1>
                <p className="text-sm text-stone-600">
                  {report.sections.length} sections • Analysis complete
                </p>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <button
                  onClick={handleDownloadClick}
                  className="inline-flex items-center px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download HTML
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {report.sections.map((section, index) => (
            <SectionDisplay key={index} section={section} />
          ))}
        </div>
      </div>

      {/* Table of Contents */}
      <TableOfContents report={report} />

      {/* Download Dialog */}
      {showDownloadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-300 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-8 py-6 border-b border-stone-200 bg-stone-100">
              <h3 className="text-lg font-medium text-stone-900">Download HTML File</h3>
            </div>
            
            <div className="p-8">
              <div className="mb-6">
                <label htmlFor="filename" className="block text-sm font-medium text-stone-700 mb-2">
                  File Name
                </label>
                <input
                  id="filename"
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && fileName.trim()) {
                      handleDownloadConfirm();
                    }
                  }}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-stone-300 focus:ring-2 focus:ring-stone-100 focus:outline-none transition-all duration-200"
                  placeholder="Enter file name"
                  autoFocus
                />
                <p className="text-xs text-stone-500 mt-2">
                  .html extension will be added automatically
                </p>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDownloadDialog(false)}
                  className="px-6 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 text-sm font-medium rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDownloadConfirm}
                  disabled={!fileName.trim()}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 disabled:text-stone-500 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportDisplay;