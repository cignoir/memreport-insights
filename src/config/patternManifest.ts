/**
 * Pattern file manifest loader for optimized file existence checking
 */
export class PatternManifest {
  private static manifestCache: Map<string, Set<string>> = new Map();

  /**
   * Load and cache manifest for a pattern folder
   */
  private static async loadManifest(patternFolder: string): Promise<Set<string>> {
    const cacheKey = patternFolder;
    if (this.manifestCache.has(cacheKey)) {
      return this.manifestCache.get(cacheKey)!;
    }

    try {
      const baseUrl = import.meta.env.BASE_URL || '/';
      const manifestPath = import.meta.env.DEV
        ? `/src/config/parse_patterns/${patternFolder}_manifest.txt`
        : `${baseUrl}config/parse_patterns/${patternFolder}_manifest.txt`;

      const response = await fetch(manifestPath);
      if (!response.ok) {
        // If manifest not found, return empty set
        console.warn(`Pattern manifest not found for ${patternFolder}, using fallback mode`);
        this.manifestCache.set(cacheKey, new Set());
        return new Set();
      }

      const manifestText = await response.text();
      const files = new Set(
        manifestText
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
      );

      this.manifestCache.set(cacheKey, files);
      return files;
    } catch (error) {
      console.warn(`Failed to load pattern manifest for ${patternFolder}:`, error);
      // Return empty set as fallback
      const emptySet = new Set<string>();
      this.manifestCache.set(cacheKey, emptySet);
      return emptySet;
    }
  }

  /**
   * Check if a pattern file exists without making HTTP request
   */
  static async patternExists(patternFolder: string, patternId: string): Promise<boolean> {
    const manifest = await this.loadManifest(patternFolder);
    return manifest.has(`${patternId}.json`);
  }

  /**
   * Get all available patterns for a folder
   */
  static async getAvailablePatterns(patternFolder: string): Promise<string[]> {
    const manifest = await this.loadManifest(patternFolder);
    return Array.from(manifest).map(filename => filename.replace('.json', ''));
  }
}