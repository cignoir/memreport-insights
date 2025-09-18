import React, { useState, useMemo, useCallback } from 'react';
import { ParsedTable } from '../types';

type SortDirection = 'asc' | 'desc' | null;

interface TableDisplayProps {
  table: ParsedTable;
  sectionTitle?: string;
}


const TableDisplay: React.FC<TableDisplayProps> = React.memo(({ table, sectionTitle }) => {
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

  // Export functions (defined after allProcessedRows)
  const exportToCSV = useCallback(() => {
    const csvRows = [];

    // Add headers
    if (headers && headers.length > 0) {
      csvRows.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','));
    }

    // Add filtered data rows
    allProcessedRows.forEach(row => {
      const csvRow = row.map(cell => {
        const cellStr = cell || '';
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      });
      csvRows.push(csvRow.join(','));
    });

    // Create blob and download
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `table_export_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [headers, allProcessedRows]);

  const exportToHTML = useCallback(() => {
    const tableId = 'exported-table';
    const isLargeTable = allProcessedRows.length > 100;
    const numericColumnsJSON = JSON.stringify(numericColumns);

    // Generate headers HTML
    let headersHtml = '';
    if (headers && headers.length > 0) {
      headersHtml = '<thead><tr>';
      headers.forEach(header => {
        const escapedHeader = header.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        headersHtml += `<th>
          <button class="sort-button">
            <span>${escapedHeader}</span>
            <div class="sort-indicators inactive">
              <svg class="sort-icon small" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd"></path>
              </svg>
              <svg class="sort-icon small" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
              </svg>
            </div>
          </button>
        </th>`;
      });
      headersHtml += '</tr></thead>';
    }

    // Generate rows HTML
    let rowsHtml = '<tbody>';
    allProcessedRows.forEach(row => {
      rowsHtml += '<tr class="table-row">';
      row.forEach((cell, index) => {
        const isNumeric = numericColumns.includes(index);
        const escapedCell = (cell || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        rowsHtml += `<td${isNumeric ? ' class="numeric"' : ''} title="${escapedCell}">${escapedCell}</td>`;
      });
      rowsHtml += '</tr>';
    });
    rowsHtml += '</tbody>';

    let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Table Export - Memreport Insights</title>
    <style>
      /* Base styles */
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        background-color: #f5f5f4;
        color: #292524;
        line-height: 1.5;
        padding: 2rem;
      }

      /* Container */
      .container {
        max-width: 100%;
        margin: 0 auto;
        background: white;
        border: 1px solid #d6d3d1;
        border-radius: 0.75rem;
        overflow: hidden;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      }

      /* Header */
      .table-header {
        padding: 1.5rem;
        background: #f5f5f4;
        border-bottom: 1px solid #a8a29e;
      }
      .table-title {
        font-weight: 600;
        color: #1c1917;
        font-size: 1.125rem;
      }
      .table-info {
        font-size: 0.875rem;
        color: #57534e;
        margin-top: 0.25rem;
      }

      /* Filter */
      .filter-container {
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #f5f5f4;
        background: white;
      }
      .filter-input {
        width: 100%;
        padding: 0.625rem 1rem 0.625rem 2.5rem;
        font-size: 0.875rem;
        border: 1px solid #a8a29e;
        border-radius: 0.75rem;
        background: white;
        transition: all 0.2s;
      }
      .filter-input:focus {
        border-color: #d6d3d1;
        outline: 2px solid #f5f5f4;
        outline-offset: 0;
      }
      .filter-icon {
        position: absolute;
        left: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        width: 1rem;
        height: 1rem;
        color: #78716c;
      }

      /* Summary */
      .table-summary {
        padding: 0.5rem 1.5rem;
        background: #fafaf9;
        border-bottom: 1px solid #f5f5f4;
        font-size: 0.75rem;
        color: #57534e;
      }

      /* Table */
      .table-wrapper {
        background: white;
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th {
        padding: 0.75rem 1rem;
        text-align: left;
        font-size: 0.75rem;
        font-weight: 600;
        color: #292524;
        background: #a8a29e;
        border-bottom: 2px solid #d6d3d1;
        white-space: nowrap;
        min-width: 100px;
      }
      td {
        padding: 0.75rem 1rem;
        font-size: 0.75rem;
        border-bottom: 1px solid #a8a29e;
        white-space: nowrap;
        min-width: 100px;
      }
      tbody tr:nth-child(even) {
        background: rgba(250, 250, 249, 0.4);
      }
      tbody tr:nth-child(odd) {
        background: white;
      }
      tbody tr:hover {
        background: #fafaf9;
      }
      .numeric {
        text-align: right;
        font-family: "SF Mono", Monaco, "Cascadia Code", monospace;
        color: #44403c;
      }

      /* Sort buttons */
      .sort-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        width: 100%;
        background: none;
        border: none;
        text-align: left;
        cursor: pointer;
        font-weight: 600;
        color: #292524;
        transition: color 0.2s;
      }
      .sort-button:hover {
        color: #1c1917;
      }
      .sort-indicators {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }
      .sort-indicators.inactive {
        flex-direction: column;
        opacity: 0.5;
      }
      .sort-button:hover .sort-indicators.inactive {
        opacity: 0.8;
      }
      .sort-icon {
        width: 0.75rem;
        height: 0.75rem;
        color: #78716c;
      }
      .sort-icon.active {
        width: 1rem;
        height: 1rem;
        color: #2563eb;
      }
      .sort-icon.small {
        width: 0.625rem;
        height: 0.625rem;
        margin-top: -0.125rem;
      }
      .sort-label {
        font-size: 0.625rem;
        font-weight: 500;
        color: #2563eb;
      }

      /* Load more */
      .load-more-container {
        text-align: center;
        padding: 1.5rem;
        background: rgba(250, 250, 249, 0.3);
      }
      .load-more-button {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        background: #44403c;
        color: white;
        border: none;
        border-radius: 0.75rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      }
      .load-more-button:hover {
        background: #292524;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      }
      .load-more-button:disabled {
        background: #a8a29e;
        color: #78716c;
        cursor: not-allowed;
      }
      .loading-spinner {
        width: 1rem;
        height: 1rem;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      /* Visibility */
      .table-row {
        transition: background-color 0.2s;
      }
      .table-row.hidden {
        display: none;
      }
    </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="table-header">
      <div class="table-title">${sectionTitle || 'Table Export'}</div>
      <div class="table-info">${allProcessedRows.length} items total${globalFilter.trim() ? ` • Filtered by: "${globalFilter}"` : ''}</div>
    </div>

    <!-- Filter -->
    <div class="filter-container">
      <div style="position: relative;">
        <svg class="filter-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        <input type="text" class="filter-input" placeholder="Search entire table..." value="${globalFilter || ''}">
      </div>
    </div>

    <!-- Summary -->
    <div class="table-summary">${allProcessedRows.length} items</div>

    <!-- Table -->
    <div class="table-wrapper">
      <table data-table-id="${tableId}" data-numeric-columns='${numericColumnsJSON}'>
        ${headersHtml}
        ${rowsHtml}
      </table>
    </div>

    ${isLargeTable ? `
    <!-- Load More -->
    <div class="load-more-container" style="display: none;">
      <button class="load-more-button">
        <svg style="width: 1rem; height: 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
        Load More
      </button>
    </div>` : ''}
  </div>

  <script>
    // Table management class (reused from htmlGenerator.ts)
    class TableManager {
      constructor(tableElement) {
        this.table = tableElement;
        this.tableId = tableElement.getAttribute('data-table-id');
        this.tbody = tableElement.querySelector('tbody');
        this.allRows = Array.from(this.tbody.querySelectorAll('tr'));
        this.displayedRows = 50;
        this.sortColumn = null;
        this.sortDirection = null;
        this.filterValue = document.querySelector('.filter-input')?.value?.toLowerCase() || '';
        this.numericColumns = this.parseNumericColumns();
        this.init();
      }

      parseNumericColumns() {
        const numericAttr = this.table.getAttribute('data-numeric-columns');
        return numericAttr ? JSON.parse(numericAttr) : [];
      }

      init() {
        this.setupSortHeaders();
        this.setupFilter();
        this.setupLoadMore();
        this.updateDisplay();
      }

      setupSortHeaders() {
        const headers = this.table.querySelectorAll('th button.sort-button');
        headers.forEach((button, index) => {
          button.addEventListener('click', () => this.handleSort(index));
        });
      }

      setupFilter() {
        const filterInput = document.querySelector('.filter-input');
        if (filterInput) {
          filterInput.addEventListener('input', (e) => {
            this.filterValue = e.target.value.toLowerCase();
            this.displayedRows = 50;
            this.updateDisplay();
          });
        }
      }

      setupLoadMore() {
        const loadMoreBtn = document.querySelector('.load-more-button');
        if (loadMoreBtn) {
          loadMoreBtn.addEventListener('click', () => this.loadMore());
        }
      }

      handleSort(columnIndex) {
        if (this.sortColumn === columnIndex) {
          if (this.sortDirection === 'asc') {
            this.sortDirection = 'desc';
          } else if (this.sortDirection === 'desc') {
            this.sortColumn = null;
            this.sortDirection = null;
          } else {
            this.sortDirection = 'asc';
          }
        } else {
          this.sortColumn = columnIndex;
          this.sortDirection = 'asc';
        }
        this.displayedRows = 50;
        this.updateSortIcons();
        this.updateDisplay();
      }

      updateSortIcons() {
        const headers = this.table.querySelectorAll('th');
        headers.forEach((header, columnIndex) => {
          const button = header.querySelector('.sort-button');
          const indicators = header.querySelector('.sort-indicators');

          if (button && indicators) {
            if (this.sortColumn === columnIndex && this.sortDirection) {
              // Active state - show single arrow with direction label
              const isAsc = this.sortDirection === 'asc';
              indicators.className = 'sort-indicators';
              indicators.innerHTML = \`
                <svg class="sort-icon active" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="\${isAsc
                    ? 'M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z'
                    : 'M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                  }" clip-rule="evenodd"></path>
                </svg>
                <span class="sort-label">\${isAsc ? 'ASC' : 'DESC'}</span>
              \`;
            } else {
              // Inactive state - show dual arrows
              indicators.className = 'sort-indicators inactive';
              indicators.innerHTML = \`
                <svg class="sort-icon small" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd"></path>
                </svg>
                <svg class="sort-icon small" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              \`;
            }
          }
        });
      }

      filterRows(rows) {
        if (!this.filterValue.trim()) return rows;
        return rows.filter(row => {
          return Array.from(row.cells).some(cell =>
            cell.textContent.toLowerCase().includes(this.filterValue)
          );
        });
      }

      sortRows(rows) {
        if (this.sortColumn === null || this.sortDirection === null) return rows;

        return [...rows].sort((a, b) => {
          const aVal = (a.cells[this.sortColumn]?.textContent || '').toString().trim();
          const bVal = (b.cells[this.sortColumn]?.textContent || '').toString().trim();
          const isNumericColumn = this.numericColumns.includes(this.sortColumn);

          let comparison = 0;
          if (isNumericColumn) {
            // Extract numeric values
            const extractNumber = (str) => {
              const cleaned = str.replace(/[^0-9.,-]/g, '');
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

          return this.sortDirection === 'desc' ? -comparison : comparison;
        });
      }

      updateDisplay() {
        let processedRows = this.filterRows(this.allRows);
        processedRows = this.sortRows(processedRows);

        // Remove all rows from tbody
        this.allRows.forEach(row => {
          if (row.parentNode) {
            row.parentNode.removeChild(row);
          }
        });

        // Add rows back in correct order
        const rowsToShow = processedRows.slice(0, this.displayedRows);
        rowsToShow.forEach(row => {
          row.classList.remove('hidden');
          this.tbody.appendChild(row);
        });

        // Add remaining rows as hidden (for load more functionality)
        processedRows.slice(this.displayedRows).forEach(row => {
          row.classList.add('hidden');
          this.tbody.appendChild(row);
        });

        // Update allRows reference to maintain correct order
        this.allRows = Array.from(this.tbody.querySelectorAll('tr'));

        this.updateSummary(processedRows.length);
        this.updateLoadMoreButton(processedRows.length);
      }

      updateSummary(totalFiltered) {
        const summary = document.querySelector('.table-summary');
        if (summary) {
          const displayed = Math.min(this.displayedRows, totalFiltered);
          const isLargeTable = totalFiltered > 100;

          if (isLargeTable) {
            summary.textContent = \`Showing: \${displayed} / \${totalFiltered} items\`;
          } else {
            summary.textContent = \`\${totalFiltered} items\`;
          }
        }
      }

      updateLoadMoreButton(totalFiltered) {
        const loadMoreContainer = document.querySelector('.load-more-container');
        const loadMoreBtn = loadMoreContainer?.querySelector('.load-more-button');

        if (loadMoreContainer && loadMoreBtn) {
          if (totalFiltered > 100 && this.displayedRows < totalFiltered) {
            loadMoreContainer.style.display = 'block';
            loadMoreBtn.textContent = \`Load More (\${this.displayedRows} / \${totalFiltered})\`;
          } else {
            loadMoreContainer.style.display = 'none';
          }
        }
      }

      loadMore() {
        const loadMoreBtn = document.querySelector('.load-more-button');
        if (loadMoreBtn) {
          loadMoreBtn.innerHTML = '<div class="loading-spinner"></div>Loading...';
          loadMoreBtn.disabled = true;

          setTimeout(() => {
            this.displayedRows += 100;
            this.updateDisplay();
            loadMoreBtn.disabled = false;
          }, 100);
        }
      }
    }

    // Initialize on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', function() {
      const table = document.querySelector('table[data-table-id]');
      if (table) {
        new TableManager(table);
      }
    });
  </script>
</body>
</html>`;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `table_export_${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [headers, allProcessedRows, globalFilter, numericColumns]);

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
        <div className="w-full px-6 py-4 bg-stone-100 dark:bg-stone-700 border-b border-stone-200 dark:border-stone-600 flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
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
            <svg
              className={`w-5 h-5 transition-transform duration-200 text-stone-400 dark:text-stone-300 ml-2 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            {/* CSV Export Button */}
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-3 py-1.5 bg-stone-600 hover:bg-stone-800 dark:bg-stone-400 dark:hover:bg-stone-300 text-white dark:text-stone-900 text-xs font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-lg transform hover:-translate-y-0.5"
              title="Download as CSV"
            >
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV
            </button>

            {/* HTML Export Button */}
            <button
              onClick={exportToHTML}
              className="inline-flex items-center px-3 py-1.5 bg-stone-600 hover:bg-stone-800 dark:bg-stone-400 dark:hover:bg-stone-300 text-white dark:text-stone-900 text-xs font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-lg transform hover:-translate-y-0.5"
              title="Download as HTML"
            >
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              HTML
            </button>
          </div>
        </div>

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
                          <div className="flex items-center">
                            {sortColumn === index ? (
                              // Active sort state - show single arrow with clear direction
                              sortDirection === 'asc' ? (
                                <div className="flex items-center gap-1">
                                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">ASC</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">DESC</span>
                                </div>
                              )
                            ) : (
                              // Inactive state - show neutral sort icon
                              <div className="flex flex-col opacity-50 group-hover:opacity-80 transition-opacity">
                                <svg className="w-3 h-3 text-stone-400 dark:text-stone-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                                <svg className="w-3 h-3 -mt-0.5 text-stone-400 dark:text-stone-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
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