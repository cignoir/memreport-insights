import React, { useState, useEffect, useCallback } from 'react';
import { ParsedDocument } from '../types';

interface TableOfContentsProps {
  report: ParsedDocument;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ report }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [filterText, setFilterText] = useState<string>('');

  // Update active section based on scroll position with throttling
  const updateActiveSection = useCallback(() => {
    const sections = report.sections.filter(section => section.title);
    const scrollPosition = window.scrollY + 100; // Add offset

    let currentActive = '';
    for (const section of sections) {
      const element = document.getElementById(`section-${section.title}`);
      if (element) {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;

        if (scrollPosition >= elementTop) {
          currentActive = section.title;
        }
      }
    }

    setActiveSection(currentActive);
  }, [report.sections]);

  useEffect(() => {
    let ticking = false;
    const throttledUpdate = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateActiveSection();
          ticking = false;
        });
        ticking = true;
      }
    };

    updateActiveSection();
    window.addEventListener('scroll', throttledUpdate);
    return () => window.removeEventListener('scroll', throttledUpdate);
  }, [updateActiveSection]);

  const scrollToSection = (sectionTitle: string) => {
    const element = document.getElementById(`section-${sectionTitle}`);
    if (element) {
      const elementTop = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementTop - 80, // Header offset
        behavior: 'smooth'
      });
    }
    // Close menu after section selection
    setIsOpen(false);
  };

  const visibleSections = report.sections.filter(section => section.title);
  const filteredSections = visibleSections.filter(section =>
    section.title.toLowerCase().includes(filterText.toLowerCase())
  );

  if (visibleSections.length === 0) {
    return null;
  }

  return (
    <>
      {/* Hamburger menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 w-10 h-10 bg-stone-800 hover:bg-stone-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50"
        aria-label={isOpen ? "Close table of contents" : "Open table of contents"}
      >
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Slide-out menu */}
      <div
        className={`fixed top-0 left-0 h-full w-[480px] lg:w-[600px] bg-white border-r border-stone-300 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Filter input */}
          <div className="px-4 pt-16 pb-4 border-b border-stone-200 bg-stone-50 flex-shrink-0">
            <div className="relative">
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Search sections..."
                className="w-full px-10 py-2.5 pr-10 bg-white border border-stone-200 rounded-lg focus:border-stone-400 focus:ring-2 focus:ring-stone-100 focus:outline-none text-sm"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {filterText && (
                <button
                  onClick={() => setFilterText('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="mt-2 text-xs text-stone-500">
              {filteredSections.length} / {visibleSections.length} sections
            </div>
          </div>
          
          {/* Scrollable navigation */}
          <div className="flex-1 overflow-y-auto">
            <nav className="p-4">
              {filteredSections.map((section, index) => (
                <button
                  key={index}
                  onClick={() => scrollToSection(section.title)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 flex items-center mb-1 ${
                    activeSection === section.title
                      ? 'bg-stone-800 text-white shadow-sm'
                      : 'hover:bg-stone-100 text-stone-700'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mr-3 flex-shrink-0 ${
                    activeSection === section.title ? 'bg-white' : 'bg-stone-400'
                  }`} />
                  <span className="truncate">{section.title}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default TableOfContents;