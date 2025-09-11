// Type definitions for the new configuration system

export interface SectionDefinition {
  name: string;
  startPattern: string;
  endPattern: string;
  parsePatternId?: string; // Pattern ID within parse_patterns
}

export interface EngineConfig {
  version: string;
  description: string;
  sections: SectionDefinition[];
}

export interface ParsePattern {
  id: string;
  description: string;
  tables: TableParsePattern[];
}

export interface TableParsePattern {
  name?: string;
  startPattern: string;
  endPattern: string;
  headers: boolean;
  separator: string;
  splitFormat?: string;
  numericColumns: number[];
}


export interface ParsePatternCollection {
  [patternId: string]: ParsePattern;
}

// Integrated configuration used at runtime
export interface ResolvedSectionConfig {
  name: string;
  startPattern: string;
  endPattern: string;
  tables: TableParsePattern[];
}

export interface ResolvedEngineConfig {
  version: string;
  description: string;
  sections: ResolvedSectionConfig[];
}