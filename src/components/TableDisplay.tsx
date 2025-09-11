import React, { useState, useMemo, useCallback } from 'react';
import { ParsedTable } from '../types';

type SortDirection = 'asc' | 'desc' | null;

interface TableDisplayProps {
  table: ParsedTable;
}


const TableDisplay: React.FC<TableDisplayProps> = React.memo(({ table }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [displayCount, setDisplayCount] = useState(50);
  const [isLoading, setIsLoading] = useState(false);

  if (!table.rows || table.rows.length === 0) {
    return null;
  }

  const formatCellValue = useCallback((value: string, colIndex: number): string => {
    if (table.settings.numeric?.includes(colIndex)) {
      // Process formats like "Used 1234.56MB"
      const numMatch = value.match(/(\d+(?:\.\d+)?)/);
      if (numMatch) {
        const numValue = parseFloat(numMatch[1]);
        if (!isNaN(numValue)) {
          // Format numeric part while preserving original label and unit
          return value.replace(numMatch[1], numValue.toLocaleString());
        }
      }
    }
    return value;
  }, [table.settings.numeric]);

  const numericColumns = useMemo(() => table.settings.numeric || [], [table.settings.numeric]);

  // Sort functionality
  const handleSort = useCallback((columnIndex: number) => {
    if (sortColumn === columnIndex) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(columnIndex);
      setSortDirection('asc');
    }
    setDisplayCount(50); // Reset display count when sort changes
  }, [sortColumn, sortDirection]);

  // Global filter functionality
  const handleFilterChange = useCallback((value: string) => {
    setGlobalFilter(value);
    setDisplayCount(50); // Reset display count when filter changes
  }, []);

  // Progressive loading
  const loadMore = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setDisplayCount(prev => prev + 100);
      setIsLoading(false);
    }, 10);
  }, []);

  // Filtered and sorted data (all items)
  const allProcessedRows = useMemo(() => {
    let filteredRows = table.rows;

    // Apply global filter
    if (globalFilter.trim()) {
      const filterLower = globalFilter.toLowerCase();
      filteredRows = filteredRows.filter(row => 
        row.some(cell => cell?.toLowerCase().includes(filterLower))
      );
    }

    // Apply sort
    if (sortColumn !== null && sortDirection) {
      filteredRows = [...filteredRows].sort((a, b) => {
        const aVal = a[sortColumn] || '';
        const bVal = b[sortColumn] || '';
        
        const isNumericColumn = numericColumns.includes(sortColumn);
        
        let comparison = 0;
        if (isNumericColumn) {
          const aNum = parseFloat(aVal.replace(/[^\d.-]/g, '')) || 0;
          const bNum = parseFloat(bVal.replace(/[^\d.-]/g, '')) || 0;
          comparison = aNum - bNum;
        } else {
          comparison = aVal.localeCompare(bVal);
        }
        
        return sortDirection === 'desc' ? -comparison : comparison;
      });
    }

    return filteredRows;
  }, [table.rows, globalFilter, sortColumn, sortDirection, numericColumns]);

  // Display data (progressive loading)
  const displayedRows = useMemo(() => {
    return allProcessedRows.slice(0, displayCount);
  }, [allProcessedRows, displayCount]);

  // Determine if this is a large table
  const isLargeTable = allProcessedRows.length > 100;

  return (
    <div className="border border-stone-300 rounded-xl overflow-hidden shadow-sm">
      {/* Pre-table text */}
      {table.preText && (
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-100">
          <pre className="whitespace-pre-wrap text-sm text-stone-700 font-mono leading-relaxed">{table.preText}</pre>
        </div>
      )}

      {/* Collapsible table */}
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-6 py-4 text-left bg-stone-100 hover:bg-stone-150 transition-all duration-200 flex items-center justify-between border-b border-stone-200"
        >
          <div className="flex items-center gap-3">
            <span className="font-semibold text-stone-900">
              Table Details ({isLargeTable ? `${displayedRows.length} / ${allProcessedRows.length}` : `${allProcessedRows.length}`} items)
            </span>
            {globalFilter.trim() && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setGlobalFilter('');
                }}
                className="inline-flex items-center text-xs bg-stone-200 hover:bg-stone-300 text-stone-700 px-3 py-1.5 rounded-full transition-colors"
                title="Clear filter"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear
              </button>
            )}
          </div>
          <svg
            className={`w-5 h-5 transition-transform duration-200 text-stone-400 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isExpanded && (
          <div className="bg-white">
            {/* Global Filter */}
            <div className="px-6 py-4 border-b border-stone-100">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search entire table..."
                  value={globalFilter}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:border-stone-300 focus:ring-2 focus:ring-stone-100 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
              {/* Headers */}
              {table.headers && (
                <thead className="bg-stone-200 sticky top-0">
                  <tr>
                    {table.headers.map((header, index) => (
                      <th
                        key={index}
                        className="px-4 py-3 text-left text-xs font-semibold text-stone-800 border-b-2 border-stone-300 whitespace-nowrap"
                        style={{ minWidth: '100px' }}
                      >
                        <button
                          onClick={() => handleSort(index)}
                          className="group flex items-center gap-2 hover:text-stone-950 transition-colors w-full"
                        >
                          <span className="truncate">{header}</span>
                          <div className="flex flex-col opacity-70 group-hover:opacity-100 transition-opacity">
                            <svg 
                              className={`w-3 h-3 ${sortColumn === index && sortDirection === 'asc' ? 'text-stone-900' : 'text-stone-500'}`}
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                            >
                              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            <svg 
                              className={`w-3 h-3 -mt-0.5 ${sortColumn === index && sortDirection === 'desc' ? 'text-stone-900' : 'text-stone-500'}`}
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                            >
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
              )}

              {/* Body */}
              <tbody>
                {displayedRows.map((row, rowIndex) => (
                  <tr key={rowIndex} className={`border-b border-stone-200 transition-colors ${
                    rowIndex % 2 === 0 ? 'bg-white hover:bg-stone-50' : 'bg-stone-50/40 hover:bg-stone-50'
                  }`}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={`px-4 py-3 text-xs whitespace-nowrap ${
                          numericColumns.includes(cellIndex) 
                            ? 'text-right font-mono text-stone-700' 
                            : 'text-left text-stone-600'
                        }`}
                        style={{ minWidth: '100px' }}
                        title={cell}
                      >
                        <span className="block truncate">
                          {formatCellValue(cell, cellIndex)}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
                
                {/* Progressive loading button */}
                {isLargeTable && displayCount < allProcessedRows.length && (
                  <tr>
                    <td colSpan={table.headers?.length || displayedRows[0]?.length || 1} className="text-center py-8 bg-stone-50/30">
                      <button
                        onClick={loadMore}
                        disabled={isLoading}
                        className="inline-flex items-center px-6 py-3 bg-stone-700 hover:bg-stone-800 disabled:bg-stone-400 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-stone-300 border-t-white mr-2"></div>
                            Loading...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            Load More ({displayCount} / {allProcessedRows.length})
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Post-table text */}
      {table.postText && (
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-100">
          <pre className="whitespace-pre-wrap text-sm text-stone-700 font-mono leading-relaxed">{table.postText}</pre>
        </div>
      )}
    </div>
  );
});

export default TableDisplay;