import React from 'react';
import { ParsedSection } from '../types';
import TableDisplay from './TableDisplay';

interface SectionDisplayProps {
  section: ParsedSection;
}

const SectionDisplay: React.FC<SectionDisplayProps> = ({ section }) => {
  if (section.tables.length === 0 && !section.content) {
    return null;
  }

  return (
    <div id={section.title ? `section-${section.title}` : undefined} className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-300 dark:border-stone-600 shadow-md overflow-hidden scroll-mt-20 transition-colors duration-200">
      {/* Section Title */}
      {section.title && (
        <div className="px-8 py-6 border-b border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-700 transition-colors duration-200">
          <h2 className="text-xl font-medium text-stone-900 dark:text-stone-100">{section.title}</h2>
        </div>
      )}

      <div className="p-8">
        {/* Section Content (when no tables) */}
        {section.content && section.tables.length === 0 && (
          <div className="bg-stone-50 dark:bg-stone-700 rounded-xl p-6 border border-stone-100 dark:border-stone-600 transition-colors duration-200">
            <pre className="whitespace-pre-wrap text-sm text-stone-700 dark:text-stone-300 font-mono leading-relaxed">
              {section.content}
            </pre>
          </div>
        )}

        {/* Tables */}
        {section.tables.length > 0 && (
          <div className="space-y-6">
            {section.tables.map((table, index) => (
              <TableDisplay key={index} table={table} sectionTitle={section.title} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionDisplay;