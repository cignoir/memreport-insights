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

  // Early return after all hooks to follow Rules of Hooks
  if (!table.rows || table.rows.length === 0) {
    return null;
  }

  // Generate dummy headers if not present
  const headers = useMemo(() => {
    if (table.headers && table.headers.length > 0) {
      return table.headers;
    }
    // Create dummy headers based on the number of columns
    const columnCount = table.rows[0]?.length || 0;
    return Array.from({ length: columnCount }, (_, i) => `Column ${i + 1}`);
  }, [table.headers, table.rows]);

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
      // Same column clicked - cycle through asc -> desc -> none
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      // Different column clicked - start with asc
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
        const aVal = (a[sortColumn] || '').toString().trim();
        const bVal = (b[sortColumn] || '').toString().trim();

        const isNumericColumn = numericColumns.includes(sortColumn);

        let comparison = 0;
        if (isNumericColumn) {
          // Extract numeric values - more robust extraction
          const extractNumber = (str: string): number => {
            // Remove all non-numeric characters except dots, commas, and negative signs
            const cleaned = str.replace(/[^\d.,-]/g, '');

            // Handle comma-separated thousands and convert to number
            const numStr = cleaned.replace(/,/g, '');
            const num = parseFloat(numStr);

            return isNaN(num) ? 0 : num;
          };

          const aNum = extractNumber(aVal);
          const bNum = extractNumber(bVal);

          // Numeric comparison
          comparison = aNum - bNum;

          // If numbers are equal, fallback to string comparison
          if (comparison === 0) {
            comparison = aVal.localeCompare(bVal);
          }
        } else {
          // String comparison
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
    <div className="border border-stone-300 dark:border-stone-600 rounded-xl overflow-hidden shadow-sm transition-colors duration-200">
      {/* Pre-table text */}
      {table.preText && (
        <div className="px-6 py-4 bg-stone-50 dark:bg-stone-700 border-b border-stone-100 dark:border-stone-600 transition-colors duration-200">
          <pre className="whitespace-pre-wrap text-sm text-stone-700 dark:text-stone-300 font-mono leading-relaxed">{table.preText}</pre>
        </div>
      )}

      {/* Collapsible table */}
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-6 py-4 text-left bg-stone-100 dark:bg-stone-700 hover:bg-stone-150 dark:hover:bg-stone-600 transition-all duration-200 flex items-center justify-between border-b border-stone-200 dark:border-stone-600"
        >
          <div className="flex items-center gap-3">
            <span className="font-semibold text-stone-900 dark:text-stone-100">
              Table Details ({isLargeTable ? `${displayedRows.length} / ${allProcessedRows.length}` : `${allProcessedRows.length}`} items)
            </span>
            {globalFilter.trim() && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setGlobalFilter('');
                }}
                className="inline-flex items-center text-xs bg-stone-200 dark:bg-stone-600 hover:bg-stone-300 dark:hover:bg-stone-500 text-stone-700 dark:text-stone-200 px-3 py-1.5 rounded-full transition-colors"
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
            className={`w-5 h-5 transition-transform duration-200 text-stone-400 dark:text-stone-300 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isExpanded && (
          <div className="bg-white dark:bg-stone-800 transition-colors duration-200">
            {/* Global Filter */}
            <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-700 transition-colors duration-200">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search entire table..."
                  value={globalFilter}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-500 dark:placeholder-stone-400 rounded-xl focus:border-stone-300 dark:focus:border-stone-500 focus:ring-2 focus:ring-stone-100 dark:focus:ring-stone-600 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
              {/* Headers */}
              {headers && headers.length > 0 && (
                <thead className="bg-stone-200 dark:bg-stone-600 sticky top-0 transition-colors duration-200">
                  <tr>
                    {headers.map((header, index) => (
                      <th
                        key={index}
                        className="px-4 py-3 text-left text-xs font-semibold text-stone-800 dark:text-stone-200 border-b-2 border-stone-300 dark:border-stone-500 whitespace-nowrap transition-colors duration-200"
                        style={{ minWidth: '100px' }}
                      >
                        <button
                          onClick={() => handleSort(index)}
                          className="group flex items-center gap-2 hover:text-stone-950 dark:hover:text-stone-50 transition-colors w-full"
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
                  <tr key={rowIndex} className={`border-b border-stone-200 dark:border-stone-700 transition-colors ${
                    rowIndex % 2 === 0 ? 'bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700' : 'bg-stone-50/40 dark:bg-stone-700/50 hover:bg-stone-50 dark:hover:bg-stone-700'
                  }`}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={`px-4 py-3 text-xs whitespace-nowrap transition-colors duration-200 ${
                          numericColumns.includes(cellIndex)
                            ? 'text-right font-mono text-stone-700 dark:text-stone-300'
                            : 'text-left text-stone-600 dark:text-stone-400'
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
                    <td colSpan={headers?.length || displayedRows[0]?.length || 1} className="text-center py-8 bg-stone-50/30 dark:bg-stone-700/30 transition-colors duration-200">
                      <button
                        onClick={loadMore}
                        disabled={isLoading}
                        className="inline-flex items-center px-6 py-3 bg-stone-700 dark:bg-stone-600 hover:bg-stone-800 dark:hover:bg-stone-500 disabled:bg-stone-400 dark:disabled:bg-stone-600 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
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
        <div className="px-6 py-4 bg-stone-50 dark:bg-stone-700 border-t border-stone-100 dark:border-stone-600 transition-colors duration-200">
          <pre className="whitespace-pre-wrap text-sm text-stone-700 dark:text-stone-300 font-mono leading-relaxed">{table.postText}</pre>
        </div>
      )}
    </div>
  );
});

export default TableDisplay;