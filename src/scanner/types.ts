export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type RuleCategory = 
  | 'prompt_injection'
  | 'credential_access'
  | 'destructive_command'
  | 'network_exfiltration'
  | 'suspicious_file_access';

export interface Finding {
  id: string;
  ruleId: string;
  severity: Severity;
  category: RuleCategory;
  title: string;
  lineContent: string;
  lineNumber: number;
  explanation: string;
  whyItMatters: string;
  remediation: string;
}

export interface Rule {
  id: string;
  name: string;
  category: RuleCategory;
  severity: Severity;
  description: string;
  detect: (line: string, lineNumber: number, fullText: string) => Finding | null;
}

export interface ScanResult {
  score: number; // 0 - 100
  riskLevel: 'SAFE' | 'LOW RISK' | 'MODERATE RISK' | 'HIGH RISK' | 'CRITICAL RISK';
  findings: Finding[];
  counts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  totalLinesScanned: number;
  rulesTriggeredCount: number;
  categoriesDetected: RuleCategory[];
  scanDurationMs: number;
  scoreBreakdown: {
    baseScore: number;
    deductions: {
      severity: Severity;
      count: number;
      pointsLost: number;
    }[];
  };
}

export interface ParsedSkill {
  raw: string;
  lines: string[];
  frontmatter?: Record<string, string>;
  codeBlocks: {
    language: string;
    code: string;
    startLine: number;
    endLine: number;
  }[];
}

export interface RemediationEntry {
  findingId: string;
  ruleId: string;
  lineNumber: number;
  originalLine: string;
  sanitizedLine: string;
  actionTaken: string;
  status: 'neutralized' | 'requires_manual_review';
}

export interface SanitizationResult {
  sanitizedContent: string;
  remediations: RemediationEntry[];
  totalNeutralized: number;
  requiresManualReviewCount: number;
  rescanResult: ScanResult;
  verificationLabel: string;
}
