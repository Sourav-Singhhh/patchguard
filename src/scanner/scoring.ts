import type { Finding, Rule, ScanResult, Severity, RuleCategory } from './types';
import { parseSkill } from './parser';

export function calculateScore(findings: Finding[]): ScanResult['scoreBreakdown'] & { finalScore: number; riskLevel: ScanResult['riskLevel'] } {
  const baseScore = 100;
  
  const counts: Record<Severity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };

  findings.forEach(f => {
    counts[f.severity]++;
  });

  // Deductions per severity instance
  const deductionPerInstance: Record<Severity, number> = {
    critical: 35,
    high: 20,
    medium: 10,
    low: 5,
    info: 0,
  };

  const deductions = (Object.keys(counts) as Severity[]).map(sev => {
    const count = counts[sev];
    const pointsLost = count * deductionPerInstance[sev];
    return {
      severity: sev,
      count,
      pointsLost,
    };
  });

  const totalPointsLost = deductions.reduce((acc, curr) => acc + curr.pointsLost, 0);
  const finalScore = Math.max(0, baseScore - totalPointsLost);

  let riskLevel: ScanResult['riskLevel'] = 'SAFE';
  if (counts.critical > 0 || finalScore < 40) {
    riskLevel = 'CRITICAL RISK';
  } else if (counts.high > 0 || finalScore < 60) {
    riskLevel = 'HIGH RISK';
  } else if (counts.medium > 0 || finalScore < 80) {
    riskLevel = 'MODERATE RISK';
  } else if (counts.low > 0 || finalScore < 100) {
    riskLevel = 'LOW RISK';
  }

  return {
    baseScore,
    deductions,
    finalScore,
    riskLevel,
  };
}

export function scanSkillContent(rawContent: string, rules: Rule[]): ScanResult {
  const startTime = performance.now();
  const parsed = parseSkill(rawContent);
  const findings: Finding[] = [];

  // Iterate line by line statically
  parsed.lines.forEach((line, index) => {
    const lineNumber = index + 1;
    rules.forEach(rule => {
      const finding = rule.detect(line, lineNumber, rawContent);
      if (finding) {
        // Prevent duplicate findings on exact line and rule
        const exists = findings.some(f => f.ruleId === rule.id && f.lineNumber === lineNumber);
        if (!exists) {
          findings.push(finding);
        }
      }
    });
  });

  const duration = performance.now() - startTime;
  const scoreInfo = calculateScore(findings);

  const categorySet = new Set<RuleCategory>();
  const triggeredRuleIds = new Set<string>();

  const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };

  findings.forEach(f => {
    counts[f.severity]++;
    categorySet.add(f.category);
    triggeredRuleIds.add(f.ruleId);
  });

  return {
    score: scoreInfo.finalScore,
    riskLevel: scoreInfo.riskLevel,
    findings,
    counts,
    totalLinesScanned: parsed.lines.length,
    rulesTriggeredCount: triggeredRuleIds.size,
    categoriesDetected: Array.from(categorySet),
    scanDurationMs: Math.round(duration * 100) / 100,
    scoreBreakdown: {
      baseScore: scoreInfo.baseScore,
      deductions: scoreInfo.deductions,
    },
  };
}
