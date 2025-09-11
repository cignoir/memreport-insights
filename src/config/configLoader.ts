type SupportedVersion = '4.27' | '5.3' | '5.6';

/**
 * Detect UE version from memreport file content
 */
export function detectUEVersion(content: string): SupportedVersion {
  // Detect by UE5 specific features
  const hasLumen = content.includes('Lumen') || content.includes('STAT_Lumen');
  const hasNanite = content.includes('Nanite') || content.includes('STAT_Nanite');
  const hasUE5Features = hasLumen || hasNanite;

  // UE 5.6 detection (check for more UE5-specific and newer features)
  if (hasUE5Features && (
    content.includes('MemReport: Begin command "rhi.dumpresourcememory summary') ||
    content.includes('STATGROUP_NaniteCoarseMeshStreaming') ||
    content.includes('wp.DumpStreamingSources')
  )) {
    return '5.6';
  }

  // UE 5.3 detection (basic UE5 features but fewer new features)
  if (hasUE5Features) {
    return '5.3';
  }

  // UE5 detection by epicapp info (fallback)
  if (content.includes('epicapp=UE_5')) {
    return '5.3'; // Default to 5.3
  }

  // Default is UE 4.27
  return '4.27';
}