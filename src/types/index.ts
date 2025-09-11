export interface TableSettings {
  start_mark: string;
  end_mark: string;
  headers: boolean;
  separator?: string;
  split_format?: string;
  numeric?: number[];
}

export interface SectionSettings {
  title: string;
  start_mark: string;
  end_mark: string;
  tables?: TableSettings[];
}

export interface ParsedTable {
  settings: TableSettings;
  headers?: string[];
  rows: string[][];
  preText?: string;
  postText?: string;
}

export interface ParsedSection {
  title: string;
  content?: string;
  tables: ParsedTable[];
}

export interface ParsedDocument {
  title: string;
  sections: ParsedSection[];
}