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
    <div id={section.title ? `section-${section.title}` : undefined} className="bg-white rounded-2xl border border-stone-300 shadow-md overflow-hidden scroll-mt-20">
      {/* Section Title */}
      {section.title && (
        <div className="px-8 py-6 border-b border-stone-200 bg-stone-100">
          <h2 className="text-xl font-medium text-stone-900">{section.title}</h2>
        </div>
      )}

      <div className="p-8">
        {/* Section Content (when no tables) */}
        {section.content && section.tables.length === 0 && (
          <div className="bg-stone-50 rounded-xl p-6 border border-stone-100">
            <pre className="whitespace-pre-wrap text-sm text-stone-700 font-mono leading-relaxed">
              {section.content}
            </pre>
          </div>
        )}

        {/* Tables */}
        {section.tables.length > 0 && (
          <div className="space-y-6">
            {section.tables.map((table, index) => (
              <TableDisplay key={index} table={table} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionDisplay;