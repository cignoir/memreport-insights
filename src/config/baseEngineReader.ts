import { SectionDefinition, EngineConfig } from '../types/configTypes';

/**
 * Read BaseEngine.ini format files and extract section definitions
 */
export class BaseEngineReader {

  /**
   * Parse BaseEngine.ini content and generate EngineConfig
   * UE5 only processes [MemReportCommands] format (UE4.27 uses separate versions/ue427.json)
   */
  static parseEngineConfig(content: string, version: string): EngineConfig {
    const lines = content.split('\n');
    const sections: SectionDefinition[] = [];

    // Check for UE5 format
    if (content.includes('[MemReportCommands]')) {
      return this.parseUE5EngineConfig(content, version);
    }

    // Legacy [MemReportSections] format
    let inMemReportSection = false;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Check for section start
      if (trimmedLine === '[MemReportSections]') {
        inMemReportSection = true;
        continue;
      }

      // End MemReportSections on another section start or empty line
      if (trimmedLine.startsWith('[') && trimmedLine !== '[MemReportSections]') {
        inMemReportSection = false;
        continue;
      }

      // Skip comment lines or empty lines
      if (trimmedLine.startsWith(';') || trimmedLine === '') {
        continue;
      }

      // Process configuration lines within MemReportSections
      if (inMemReportSection && trimmedLine.includes('=')) {
        const sectionDef = this.parseSectionLine(trimmedLine);
        if (sectionDef) {
          sections.push(sectionDef);
        }
      }
    }

    return {
      version,
      description: `Unreal Engine ${version} configuration`,
      sections
    };
  }


  /**
   * Parse UE5 [MemReportCommands] format
   */
  private static parseUE5EngineConfig(content: string, version: string): EngineConfig {
    const lines = content.split('\n');
    const sections: SectionDefinition[] = [];

    let inMemReportSection = false;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Check for section start (use only MemReportFullCommands)
      if (trimmedLine === '[MemReportFullCommands]') {
        inMemReportSection = true;
        continue;
      }

      // End MemReportFullCommands on another section start
      if (trimmedLine.startsWith('[') && trimmedLine !== '[MemReportFullCommands]') {
        inMemReportSection = false;
        continue;
      }

      // Skip comment lines or empty lines
      if (trimmedLine.startsWith(';') || trimmedLine === '') {
        continue;
      }

      // Process command lines within MemReportCommands
      if (inMemReportSection && trimmedLine.startsWith('+Cmd=')) {
        const command = trimmedLine.substring(5).replace(/"/g, ''); // Remove +Cmd=" and quotes
        const sectionDef = this.parseCommandToSection(command);
        if (sectionDef) {
          sections.push(sectionDef);
        }
      }
    }

    return {
      version,
      description: `Unreal Engine ${version} configuration`,
      sections
    };
  }


  /**
   * Generate section definition from UE5+ command
   */
  private static parseCommandToSection(command: string): SectionDefinition | null {
    // Generate safe filename from command name
    const safeCommandName = this.generateSafeFileName(command);

    return {
      name: command,
      startPattern: `MemReport: Begin command "${command}"`,
      endPattern: `MemReport: End command "${command}"`,
      parsePatternId: safeCommandName
    };
  }



  /**
   * Generate safe filename from command name
   */
  private static generateSafeFileName(command: string): string {
    // Replace characters not allowed in filenames
    return command
      .replace(/[<>:"/\\|?*]/g, '_')  // Replace Windows/Linux invalid characters with '_'
      .replace(/\s+/g, '_')           // Replace spaces with '_'
      .replace(/\.+/g, '_')           // Replace dots with '_'
      .toLowerCase();                 // Convert to lowercase
  }

  /**
   * Parse section definition line
   * Format: SectionName=StartPattern|EndPattern|ParsePatternId
   */
  private static parseSectionLine(line: string): SectionDefinition | null {
    const [name, value] = line.split('=', 2);
    if (!name || !value) {
      return null;
    }

    const parts = value.split('|');
    if (parts.length < 2) {
      return null;
    }

    const [startPattern, endPattern, parsePatternId] = parts;

    return {
      name: name.trim(),
      startPattern: startPattern.trim(),
      endPattern: endPattern.trim(),
      parsePatternId: parsePatternId?.trim() || undefined
    };
  }

  /**
   * Validate section definitions
   */
  static validateEngineConfig(config: EngineConfig): string[] {
    const errors: string[] = [];

    if (!config.version) {
      errors.push('Version is required');
    }

    if (!config.sections || config.sections.length === 0) {
      errors.push('At least one section is required');
    }

    // Check for duplicate section names
    const sectionNames = new Set<string>();
    for (const section of config.sections) {
      if (!section.name) {
        errors.push('Section name is required');
        continue;
      }

      if (sectionNames.has(section.name)) {
        errors.push(`Duplicate section name: ${section.name}`);
      }
      sectionNames.add(section.name);

      if (!section.startPattern) {
        errors.push(`Start pattern is required for section: ${section.name}`);
      }

      if (!section.endPattern) {
        errors.push(`End pattern is required for section: ${section.name}`);
      }
    }

    return errors;
  }

}