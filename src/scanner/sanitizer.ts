import type { Finding, RemediationEntry, SanitizationResult } from './types';
import { scanSkill } from './index';

export function sanitizeSkill(rawContent: string, findings: Finding[]): SanitizationResult {
  const lines = rawContent.split(/\r?\n/);
  const remediations: RemediationEntry[] = [];
  
  // Create a map of lineNumber -> Finding[]
  const findingsByLine = new Map<number, Finding[]>();
  findings.forEach(f => {
    const list = findingsByLine.get(f.lineNumber) || [];
    list.push(f);
    findingsByLine.set(f.lineNumber, list);
  });

  const sanitizedLines = lines.map((originalLine, idx) => {
    const lineNumber = idx + 1;
    const lineFindings = findingsByLine.get(lineNumber);

    if (!lineFindings || lineFindings.length === 0) {
      return originalLine;
    }

    let modifiedLine = originalLine;

    lineFindings.forEach(finding => {
      let actionTaken = '';
      let status: RemediationEntry['status'] = 'neutralized';

      switch (finding.ruleId) {
        case 'PI-001':
        case 'PI-002':
          // Prompt Injection Directive: Comment out or prefix directive line
          modifiedLine = `<!-- [NEUTRALIZED PROMPT INJECTION DIRECTIVE - ${finding.ruleId}] -->`;
          actionTaken = 'Removed prompt injection directive and inserted HTML comment note.';
          break;

        case 'DEST-001':
          // Destructive Command: Comment out command in bash
          modifiedLine = `# [SECURITY NEUTRALIZED BY PATCHGUARD - DESTRUCTIVE COMMAND ${finding.ruleId}]`;
          actionTaken = 'Commented out destructive filesystem command.';
          break;

        case 'NET-001':
          // Network Exfiltration: Comment out outbound payload
          modifiedLine = `# [SECURITY NEUTRALIZED BY PATCHGUARD - EXFILTRATION RISK ${finding.ruleId}]`;
          actionTaken = 'Commented out outbound network payload command.';
          break;

        case 'SEC-001':
        case 'SEC-002':
          // Credential Access: Comment out credential file/variable read
          modifiedLine = `# [SECURITY NEUTRALIZED BY PATCHGUARD - CREDENTIAL ACCESS ${finding.ruleId}]`;
          actionTaken = 'Commented out credential access / secret key reference.';
          break;

        case 'FILE-001':
          // Suspicious File Access: Comment out system path reference
          modifiedLine = `# [SECURITY NEUTRALIZED BY PATCHGUARD - SUSPICIOUS FILE ACCESS ${finding.ruleId}]`;
          actionTaken = 'Commented out system directory traversal reference.';
          break;

        default:
          // Unrecognized or complex finding fallback
          modifiedLine = `<!-- [REQUIRES MANUAL REVIEW - ${finding.ruleId}]: ${originalLine} -->`;
          actionTaken = 'Annotated for manual review; automatic neutralization pattern unavailable.';
          status = 'requires_manual_review';
          break;
      }

      remediations.push({
        findingId: finding.id,
        ruleId: finding.ruleId,
        lineNumber,
        originalLine,
        sanitizedLine: modifiedLine,
        actionTaken,
        status,
      });
    });

    return modifiedLine;
  });

  const sanitizedContent = sanitizedLines.join('\n');
  const rescanResult = scanSkill(sanitizedContent);

  const totalNeutralized = remediations.filter(r => r.status === 'neutralized').length;
  const requiresManualReviewCount = remediations.filter(r => r.status === 'requires_manual_review').length;

  let verificationLabel = 'No detected threats under PatchGuard rules';
  if (rescanResult.score < 100) {
    verificationLabel = `Remaining threats detected under PatchGuard rules (${rescanResult.findings.length} finding${rescanResult.findings.length === 1 ? '' : 's'})`;
  }

  return {
    sanitizedContent,
    remediations,
    totalNeutralized,
    requiresManualReviewCount,
    rescanResult,
    verificationLabel,
  };
}
