import { scanSkill } from './index';
import type { ScanResult } from './index';

export interface LocalAuditItem {
  fileName: string;
  content: string;
  result: ScanResult;
}

export interface LocalAuditSummary {
  totalSkills: number;
  safeCount: number;
  warningCount: number;
  criticalCount: number;
  items: LocalAuditItem[];
}

export function performLocalBatchAudit(files: { name: string; content: string }[]): LocalAuditSummary {
  const items: LocalAuditItem[] = files.map(file => {
    const result = scanSkill(file.content);
    return {
      fileName: file.name,
      content: file.content,
      result,
    };
  });

  let safeCount = 0;
  let warningCount = 0;
  let criticalCount = 0;

  items.forEach(item => {
    if (item.result.riskLevel === 'SAFE') {
      safeCount++;
    } else if (item.result.riskLevel === 'CRITICAL RISK') {
      criticalCount++;
    } else {
      warningCount++;
    }
  });

  return {
    totalSkills: items.length,
    safeCount,
    warningCount,
    criticalCount,
    items,
  };
}
