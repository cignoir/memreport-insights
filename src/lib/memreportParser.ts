import { TableSettings, ParsedDocument, ParsedSection, ParsedTable } from '../types';
import { ResolvedSectionConfig } from '../types/configTypes';


export class MemreportParser {
  private text: string;
  private title: string;
  private settings: ResolvedSectionConfig[];

  constructor(content: string, title: string, settings: ResolvedSectionConfig[]) {
    this.text = content.replace(/\r\n/g, '\n');
    this.title = title;
    this.settings = settings;
  }

  async parse(): Promise<ParsedDocument> {
    const sections: ParsedSection[] = [];

    // Process sections in chunks to avoid blocking
    for (const sectionSettings of this.settings) {
      const section = this.parseSection(sectionSettings);
      if (section !== null) {
        sections.push(section);
        // Yield control back to browser every few sections
        if (sections.length % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
    }

    return {
      title: this.title,
      sections
    };
  }


  private parseSection(settings: ResolvedSectionConfig): ParsedSection | null {
    const sectionPattern = `${settings.startPattern}.+?${settings.endPattern}$`;
    const regex = new RegExp(sectionPattern, 'ms');
    const match = regex.exec(this.text);

    if (!match) {
      return null;
    }

    const sectionText = match[0];
    const tables: ParsedTable[] = [];

    if (settings.tables) {
      settings.tables.forEach((tableSettings, index) => {
        const table = this.parseTable(
          sectionText,
          tableSettings,
          index === 0,
          index === settings.tables.length - 1
        );
        if (table) {
          tables.push(table);
        }
      });
    }

    return {
      title: settings.name,
      content: tables.length === 0 ? this.removeCommandLog(sectionText) : undefined,
      tables
    };
  }

  private parseTable(
    text: string,
    settings: import('../types/configTypes').TableParsePattern,
    isFirst: boolean,
    isLast: boolean
  ): ParsedTable | null {
    const tablePattern = `(?<pre>.*?)(?<table>${settings.startPattern}.*)(?<post>${settings.endPattern})`;
    const regex = new RegExp(tablePattern, 'ms');
    const match = regex.exec(text);

    if (!match || !match.groups) {
      return null;
    }

    const preText = isFirst ? this.removeCommandLog(match.groups.pre).trim() : undefined;
    const postText = isLast ? this.removeCommandLog(match.groups.post).trim() : undefined;
    const tableText = match.groups.table;

    const lines = tableText.split('\n')
      .map(line => this.splitColumns(line.trim(), settings))
      .filter((line): line is string[] => line !== null && line.length > 0);

    if (lines.length === 0) {
      return null;
    }

    let headers: string[] | undefined;
    let rows = lines;

    if (settings.headers && lines.length > 0) {
      headers = lines[0];
      rows = lines.slice(1);
    }

    // Original order is preserved - no automatic sorting

    return {
      settings: {
        start_mark: settings.startPattern,
        end_mark: settings.endPattern,
        headers: settings.headers,
        separator: settings.separator,
        split_format: settings.splitFormat,
        numeric_columns: settings.numericColumns
      } as TableSettings,
      headers,
      rows,
      preText,
      postText
    };
  }

  private splitColumns(row: string, settings: import('../types/configTypes').TableParsePattern): string[] | null {
    if (!row.trim()) {
      return null;
    }

    if (settings.splitFormat) {
      const regex = new RegExp(settings.splitFormat);
      const match = regex.exec(row);
      if (match) {
        // Handle potentially undefined capture groups
        let result = match.slice(1).map(s => (s || '').trim());

        // Special handling for Platform Memory Stats: separate comma-delimited values while preserving labels
        if (result.length === 2 && result[1] && result[1].includes(',')) {
          const label = result[0];
          const values = result[1].split(',').map(s => s.trim());

          // Return as labeled values (e.g., preserve as "Used 1234MB")
          return [label, ...values];
        }

        return result;
      }
      return null;
    } else if (settings.separator) {
      return row.split(new RegExp(settings.separator)).map(s => s.trim());
    }

    return [row];
  }

  private removeCommandLog(text: string): string {
    return text.replace(/^MemReport: .+? command.+$/gm, '');
  }
}