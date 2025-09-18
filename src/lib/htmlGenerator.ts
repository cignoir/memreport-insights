import { ParsedDocument, ParsedSection, ParsedTable } from '../types';

export class HtmlGenerator {
  private document: ParsedDocument;
  private tableCounter: number = 0;

  constructor(document: ParsedDocument) {
    this.document = document;
  }

  generate(): string {
    const sections = this.document.sections
      .map(section => this.generateSection(section))
      .join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(this.document.title)} - Memreport Insights</title>
  <style>
    /* Reset and base styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: rgb(245, 245, 244); /* stone-100 */
      color: rgb(41, 37, 36); /* stone-800 */
      line-height: 1.5;
    }

    .container {
      max-width: 100%;
      margin: 0 auto;
      padding: 3rem 1.5rem;
    }

    /* Header */
    .header {
      background: white;
      border: 1px solid rgb(214, 211, 209); /* stone-300 */
      border-radius: 1rem;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      overflow: hidden;
      margin-bottom: 2rem;
    }

    .header-content {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .header-info {
      flex: 1;
      min-width: 0;
    }

    .header-title {
      font-size: 1.5rem;
      font-weight: 500;
      color: rgb(28, 25, 23); /* stone-900 */
      margin-bottom: 0.5rem;
      word-break: break-all;
    }

    .header-subtitle {
      font-size: 0.875rem;
      color: rgb(87, 83, 78); /* stone-600 */
    }

    /* Section */
    .section {
      background: white;
      border: 1px solid rgb(214, 211, 209); /* stone-300 */
      border-radius: 1rem;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      overflow: hidden;
      margin-bottom: 1.5rem;
    }

    .section-header {
      padding: 2rem;
      border-bottom: 1px solid rgb(168, 162, 158); /* stone-200 */
      background: rgb(245, 245, 244); /* stone-100 */
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 500;
      color: rgb(28, 25, 23); /* stone-900 */
    }

    .section-content {
      padding: 2rem;
    }

    .section-text {
      background: rgb(250, 250, 249); /* stone-50 */
      border: 1px solid rgb(245, 245, 244); /* stone-100 */
      border-radius: 0.75rem;
      padding: 1.5rem;
      font-family: "SF Mono", "Monaco", "Cascadia Code", monospace;
      font-size: 0.875rem;
      color: rgb(68, 64, 60); /* stone-700 */
      white-space: pre-wrap;
      line-height: 1.6;
      overflow-x: auto;
    }

    /* Table container */
    .table-container {
      border: 1px solid rgb(214, 211, 209); /* stone-300 */
      border-radius: 0.75rem;
      overflow: hidden;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      margin-bottom: 1.5rem;
    }

    .table-pre-text, .table-post-text {
      padding: 1.5rem;
      background: rgb(250, 250, 249); /* stone-50 */
      border-bottom: 1px solid rgb(245, 245, 244); /* stone-100 */
      font-family: "SF Mono", "Monaco", "Cascadia Code", monospace;
      font-size: 0.875rem;
      color: rgb(68, 64, 60); /* stone-700 */
      white-space: pre-wrap;
      line-height: 1.6;
    }

    .table-post-text {
      border-bottom: none;
      border-top: 1px solid rgb(245, 245, 244); /* stone-100 */
    }

    .table-header {
      padding: 1.5rem;
      background: rgb(245, 245, 244); /* stone-100 */
      border-bottom: 1px solid rgb(168, 162, 158); /* stone-200 */
    }

    .table-title {
      font-weight: 600;
      color: rgb(28, 25, 23); /* stone-900 */
    }

    .table-info {
      font-size: 0.875rem;
      color: rgb(87, 83, 78); /* stone-600 */
      margin-top: 0.25rem;
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
      color: rgb(41, 37, 36); /* stone-800 */
      background: rgb(168, 162, 158); /* stone-200 */
      border-bottom: 2px solid rgb(214, 211, 209); /* stone-300 */
      white-space: nowrap;
      min-width: 100px;
    }

    td {
      padding: 0.75rem 1rem;
      font-size: 0.75rem;
      border-bottom: 1px solid rgb(168, 162, 158); /* stone-200 */
      white-space: nowrap;
      min-width: 100px;
    }

    /* Alternating row colors */
    tbody tr:nth-child(even) {
      background: rgb(250, 250, 249, 0.4); /* stone-50 with opacity */
    }

    tbody tr:nth-child(odd) {
      background: white;
    }

    tbody tr:hover {
      background: rgb(250, 250, 249); /* stone-50 */
    }

    /* Numeric columns */
    .numeric {
      text-align: right;
      font-family: "SF Mono", "Monaco", "Cascadia Code", monospace;
      color: rgb(68, 64, 60); /* stone-700 */
    }

    /* Responsive design */
    @media (min-width: 1024px) {
      .header-content {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }

      .container {
        padding-left: 1.5rem;
        padding-right: 1.5rem;
      }
    }

    /* Interactive elements */
    .filter-container {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid rgb(245, 245, 244); /* stone-100 */
      background: white;
    }

    .filter-input {
      width: 100%;
      padding: 0.625rem 1rem 0.625rem 2.5rem;
      font-size: 0.875rem;
      border: 1px solid rgb(168, 162, 158); /* stone-200 */
      border-radius: 0.75rem;
      background: white;
      transition: all 0.2s;
    }

    .filter-input:focus {
      border-color: rgb(214, 211, 209); /* stone-300 */
      outline: 2px solid rgb(245, 245, 244); /* stone-100 */
      outline-offset: 0;
    }

    .filter-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      width: 1rem;
      height: 1rem;
      color: rgb(120, 113, 108); /* stone-400 */
    }

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
      color: rgb(41, 37, 36); /* stone-800 */
      transition: color 0.2s;
    }

    .sort-button:hover {
      color: rgb(28, 25, 23); /* stone-900 */
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
      color: rgb(120, 113, 108); /* stone-400 */
    }

    .sort-icon.active {
      width: 1rem;
      height: 1rem;
      color: rgb(37, 99, 235); /* blue-600 */
    }

    .sort-icon.small {
      width: 0.625rem;
      height: 0.625rem;
      margin-top: -0.125rem;
    }

    .sort-label {
      font-size: 0.625rem;
      font-weight: 500;
      color: rgb(37, 99, 235); /* blue-600 */
    }

    .load-more-container {
      text-align: center;
      padding: 1.5rem;
      background: rgb(250, 250, 249, 0.3); /* stone-50 with opacity */
    }

    .load-more-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: rgb(68, 64, 60); /* stone-700 */
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
      background: rgb(41, 37, 36); /* stone-800 */
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }

    .load-more-button:disabled {
      background: rgb(168, 162, 158); /* stone-200 */
      color: rgb(120, 113, 108); /* stone-400 */
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

    .table-row {
      transition: background-color 0.2s;
    }

    .table-row.hidden {
      display: none;
    }

    .table-summary {
      padding: 0.5rem 1.5rem;
      background: rgb(250, 250, 249); /* stone-50 */
      border-bottom: 1px solid rgb(245, 245, 244); /* stone-100 */
      font-size: 0.75rem;
      color: rgb(87, 83, 78); /* stone-600 */
    }

    /* Print styles */
    @media print {
      body {
        background: white;
      }

      .section, .table-container {
        box-shadow: none;
        border: 1px solid #ccc;
        break-inside: avoid;
      }

      .table-wrapper {
        overflow: visible;
      }

      .filter-container, .load-more-container {
        display: none;
      }

      .table-row.hidden {
        display: table-row;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <div class="header-info">
          <h1 class="header-title">${this.escapeHtml(this.document.title)}</h1>
          <p class="header-subtitle">${this.document.sections.length} sections • Analysis complete</p>
        </div>
      </div>
    </div>

    <!-- Sections -->
    ${sections}
  </div>

  <script>
    // Table management class
    class TableManager {
      constructor(tableElement) {
        this.table = tableElement;
        this.tableId = tableElement.getAttribute('data-table-id');
        this.tbody = tableElement.querySelector('tbody');
        this.allRows = Array.from(this.tbody.querySelectorAll('tr'));
        this.displayedRows = 50; // Initial display count
        this.sortColumn = null;
        this.sortDirection = null;
        this.filterValue = '';
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
        const filterInput = this.table.closest('.table-container').querySelector('.filter-input');
        if (filterInput) {
          filterInput.addEventListener('input', (e) => {
            this.filterValue = e.target.value.toLowerCase();
            this.displayedRows = 50; // Reset when filter changes
            this.updateDisplay();
          });
        }
      }
      
      setupLoadMore() {
        const loadMoreBtn = this.table.closest('.table-container').querySelector('.load-more-button');
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
        
        this.displayedRows = 50; // Reset when sort changes
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
          const aVal = a.cells[this.sortColumn]?.textContent || '';
          const bVal = b.cells[this.sortColumn]?.textContent || '';
          
          const isNumericColumn = this.numericColumns.includes(this.sortColumn);
          
          let comparison = 0;
          if (isNumericColumn) {
            // Extract numeric values - more robust extraction
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
            comparison = aVal.localeCompare(bVal);
          }
          
          return this.sortDirection === 'desc' ? -comparison : comparison;
        });
      }
      
      formatNumber(value) {
        const numMatch = value.match(/(\\d+(?:\\.\\d+)?)/);
        if (numMatch) {
          const numValue = parseFloat(numMatch[1]);
          if (!isNaN(numValue)) {
            return value.replace(numMatch[1], numValue.toLocaleString());
          }
        }
        return value;
      }
      
      updateDisplay() {
        // Apply filters and sorting
        let processedRows = this.filterRows(this.allRows);
        processedRows = this.sortRows(processedRows);
        
        // Apply numeric formatting
        processedRows.forEach(row => {
          Array.from(row.cells).forEach((cell, index) => {
            if (this.numericColumns.includes(index)) {
              const originalText = cell.getAttribute('data-original') || cell.textContent;
              if (!cell.getAttribute('data-original')) {
                cell.setAttribute('data-original', originalText);
              }
              cell.textContent = this.formatNumber(originalText);
            }
          });
        });
        
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
        
        // Update summary
        this.updateSummary(processedRows.length);
        
        // Update load more button
        this.updateLoadMoreButton(processedRows.length);
      }
      
      updateSummary(totalFiltered) {
        const summary = this.table.closest('.table-container').querySelector('.table-summary');
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
        const loadMoreContainer = this.table.closest('.table-container').querySelector('.load-more-container');
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
        const loadMoreBtn = this.table.closest('.table-container').querySelector('.load-more-button');
        if (loadMoreBtn) {
          // Loading state
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
      // Initialize all tables
      const tables = document.querySelectorAll('table[data-table-id]');
      tables.forEach(table => {
        new TableManager(table);
      });
    });
  </script>
</body>
</html>`;
  }

  private generateSection(section: ParsedSection): string {
    let html = '<div class="section">';
    
    if (section.title) {
      html += `
        <div class="section-header">
          <h2 class="section-title">${this.escapeHtml(section.title)}</h2>
        </div>`;
    }

    html += '<div class="section-content">';

    if (section.content && section.tables.length === 0) {
      html += `<div class="section-text">${this.escapeHtml(section.content)}</div>`;
    }

    if (section.tables.length > 0) {
      html += '<div class="tables-wrapper">';
      html += section.tables.map(table => this.generateTable(table)).join('\n');
      html += '</div>';
    }

    html += '</div>';
    html += '</div>';
    return html;
  }

  private generateTable(table: ParsedTable): string {
    if (!table.rows || table.rows.length === 0) {
      return '';
    }

    const isLargeTable = table.rows.length > 100;
    const tableId = `table-${this.tableCounter++}`;
    const numericColumns = JSON.stringify(table.settings.numeric || []);

    let html = '<div class="table-container">';

    // Pre-table text
    if (table.preText) {
      html += `<div class="table-pre-text">${this.escapeHtml(table.preText)}</div>`;
    }

    // Table header with info
    html += `
      <div class="table-header">
        <div class="table-title">Table Details (${table.rows.length} items)</div>
      </div>`;

    // Filter
    html += `
      <div class="filter-container">
        <div style="position: relative;">
          <svg class="filter-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input type="text" class="filter-input" placeholder="Search entire table...">
        </div>
      </div>`;

    // Table summary
    html += `<div class="table-summary">${table.rows.length} items</div>`;

    // Table wrapper
    html += '<div class="table-wrapper">';
    html += `<table data-table-id="${tableId}" data-numeric-columns='${numericColumns}'>`;

    // Headers - Generate dummy headers if not present
    const headers = table.headers && table.headers.length > 0
      ? table.headers
      : Array.from({ length: table.rows[0]?.length || 0 }, (_, i) => `Column ${i + 1}`);

    if (headers.length > 0) {
      html += '<thead><tr>';
      headers.forEach(header => {
        html += `<th>
          <button class="sort-button">
            <span>${this.escapeHtml(header)}</span>
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
      html += '</tr></thead>';
    }

    // Body
    html += '<tbody>';
    table.rows.forEach(row => {
      html += '<tr class="table-row">';
      row.forEach((cell, index) => {
        const isNumeric = table.settings.numeric?.includes(index);
        const className = isNumeric ? 'numeric' : '';
        const formattedValue = this.escapeHtml(cell);
        html += `<td class="${className}" title="${this.escapeHtml(cell)}">${formattedValue}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody>';

    html += '</table>';
    html += '</div>'; // table-wrapper

    // Load more button for large tables
    if (isLargeTable) {
      html += `
        <div class="load-more-container" style="display: none;">
          <button class="load-more-button">
            <svg style="width: 1rem; height: 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
            Load More
          </button>
        </div>`;
    }

    // Post-table text
    if (table.postText) {
      html += `<div class="table-post-text">${this.escapeHtml(table.postText)}</div>`;
    }

    html += '</div>'; // table-container

    return html;
  }


  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}