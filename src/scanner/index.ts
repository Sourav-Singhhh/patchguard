import { scanSkillContent } from './scoring';
import { rules } from './rules';
import type { ScanResult } from './types';

export function scanSkill(content: string): ScanResult {
  return scanSkillContent(content, rules);
}

export * from './types';
export { parseSkill } from './parser';
export { rules } from './rules';
export { sanitizeSkill } from './sanitizer';
