import { BaseEngineReader } from './baseEngineReader';
import { PatternManifest } from './patternManifest';
import {
  ParsePattern,
  ParsePatternCollection,
  ResolvedEngineConfig,
  ResolvedSectionConfig,
  TableParsePattern
} from '../types/configTypes';
import { SectionSettings, TableSettings } from '../types';

export class ConfigResolver {
  private static parsePatternCache: ParsePatternCollection = {};

  /**
   * Determine parse_pattern subfolder based on version
   */
  private static getPatternFolder(version: string): string {
    return version.startsWith('4.') ? 'ue4' : 'ue5';
  }

  static async loadEngineConfig(version: string): Promise<ResolvedEngineConfig> {
    // UE4.27 uses parse_patterns/ue4/ue427.json
    if (version === '4.27') {
      return await this.loadUE427Config();
    }

    // Other versions load configuration from BaseEngine.ini
    const baseEngineContent = await this.loadBaseEngineFile(version);
    const engineConfig = BaseEngineReader.parseEngineConfig(baseEngineContent, version);

    // Parallel loading of pattern files for better performance
    const patternPromises = engineConfig.sections.map(async (section) => {
      const parsePattern = section.parsePatternId
        ? await this.loadParsePattern(section.parsePatternId, version)
        : null;

      return {
        name: section.name,
        startPattern: section.startPattern,
        endPattern: section.endPattern,
        tables: parsePattern?.tables || []
      };
    });

    const resolvedSections = await Promise.all(patternPromises);

    return {
      version: engineConfig.version,
      description: engineConfig.description,
      sections: resolvedSections
    };
  }

  /**
   * Load UE4.27 specific configuration (uses parse_patterns/ue4/ue427.json)
   */
  private static async loadUE427Config(): Promise<ResolvedEngineConfig> {
    try {
      // Use different paths for development vs production
      const baseUrl = import.meta.env.BASE_URL || '/';
      const configPath = import.meta.env.DEV
        ? '/src/config/parse_patterns/ue4/ue427.json'
        : `${baseUrl}config/parse_patterns/ue4/ue427.json`;

      const response = await fetch(configPath);
      if (!response.ok) {
        throw new Error(`Failed to load UE4.27 config: ${response.statusText}`);
      }

      const config: {
        version: string;
        description: string;
        sections: SectionSettings[];
      } = await response.json();

      // Convert old format to new format
      const resolvedSections: ResolvedSectionConfig[] = config.sections.map(section => ({
        name: section.title,
        startPattern: section.start_mark,
        endPattern: section.end_mark,
        tables: section.tables?.map(table => this.convertTableSettings(table)) || []
      }));

      return {
        version: config.version,
        description: config.description,
        sections: resolvedSections
      };
    } catch (error) {
      throw new Error(`Failed to load UE4.27 config: ${error}`);
    }
  }

  /**
   * Convert old format TableSettings to new format TableParsePattern
   */
  private static convertTableSettings(tableSettings: TableSettings): TableParsePattern {
    return {
      name: tableSettings.start_mark, // Use pattern as name
      startPattern: tableSettings.start_mark,
      endPattern: tableSettings.end_mark,
      headers: tableSettings.headers,
      separator: tableSettings.separator || '',
      splitFormat: tableSettings.split_format,
      numericColumns: tableSettings.numeric || []
    };
  }

  private static async loadBaseEngineFile(version: string): Promise<string> {
    const versionMap: { [key: string]: string } = {
      '5.3': 'BaseEngine_5.6.1.ini',  // UE5.3 uses same config as 5.6
      '5.6': 'BaseEngine_5.6.1.ini'
    };

    const filename = versionMap[version];
    if (!filename) {
      throw new Error(`Unsupported engine version: ${version}`);
    }

    try {
      // Use different paths for development vs production
      const baseUrl = import.meta.env.BASE_URL || '/';
      const configPath = import.meta.env.DEV
        ? `/src/config/engine_settings/${filename}`
        : `${baseUrl}config/engine_settings/${filename}`;

      const response = await fetch(configPath);
      if (!response.ok) {
        throw new Error(`Failed to load BaseEngine file: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      throw new Error(`Failed to load BaseEngine file for version ${version}: ${error}`);
    }
  }

  private static async loadParsePattern(patternId: string, version: string): Promise<ParsePattern | null> {
    const cacheKey = `${version}:${patternId}`;
    if (this.parsePatternCache[cacheKey]) {
      return this.parsePatternCache[cacheKey];
    }

    const patternFolder = this.getPatternFolder(version);

    // Check if pattern exists before making HTTP request
    const exists = await PatternManifest.patternExists(patternFolder, patternId);
    if (!exists) {
      // Pattern doesn't exist, cache null result and return
      this.parsePatternCache[cacheKey] = null;
      return null;
    }

    try {
      // Use different paths for development vs production
      const baseUrl = import.meta.env.BASE_URL || '/';
      const configPath = import.meta.env.DEV
        ? `/src/config/parse_patterns/${patternFolder}/${patternId}.json`
        : `${baseUrl}config/parse_patterns/${patternFolder}/${patternId}.json`;

      const response = await fetch(configPath);
      if (!response.ok) {
        // This should rarely happen now that we check manifest first
        this.parsePatternCache[cacheKey] = null;
        return null;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && !contentType.includes('application/json')) {
        return null;
      }

      const responseText = await response.text();
      if (responseText.trim().startsWith('<!doctype') || responseText.trim().startsWith('<html')) {
        return null;
      }

      try {
        const pattern: ParsePattern = JSON.parse(responseText);
        this.parsePatternCache[cacheKey] = pattern;
        return pattern;
      } catch (parseError) {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  static async validateConfig(version: string): Promise<string[]> {
    try {
      if (version === '4.27') {
        const resolvedConfig = await this.loadUE427Config();
        // Basic validation
        const errors: string[] = [];
        if (!resolvedConfig.version) {
          errors.push('Version is required');
        }
        if (!resolvedConfig.sections || resolvedConfig.sections.length === 0) {
          errors.push('At least one section is required');
        }
        return errors;
      }

      const baseEngineContent = await this.loadBaseEngineFile(version);
      const engineConfig = BaseEngineReader.parseEngineConfig(baseEngineContent, version);
      return BaseEngineReader.validateEngineConfig(engineConfig);
    } catch (error) {
      return [`Failed to load or validate config: ${error}`];
    }
  }


  static clearCache(): void {
    this.parsePatternCache = {};
  }
}