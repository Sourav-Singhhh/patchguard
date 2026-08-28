import { describe, it, expect } from 'vitest';
import { scanSkill, sanitizeSkill } from '../src/scanner';
import { fixtures } from '../src/fixtures';

describe('PatchGuard Auto-Sanitizer Module', () => {
  it('should sanitize prompt injection fixture and score 100 on rescan', () => {
    const raw = fixtures[1].content; // prompt-injection-skill
    const scan = scanSkill(raw);
    expect(scan.findings.length).toBeGreaterThan(0);

    const sanitization = sanitizeSkill(raw, scan.findings);
    expect(sanitization.totalNeutralized).toBe(scan.findings.length);
    expect(sanitization.rescanResult.score).toBe(100);
    expect(sanitization.verificationLabel).toBe('No detected threats under PatchGuard rules');
  });

  it('should sanitize credential access fixture cleanly', () => {
    const raw = fixtures[2].content; // credential-access-skill
    const scan = scanSkill(raw);
    const sanitization = sanitizeSkill(raw, scan.findings);

    expect(sanitization.rescanResult.score).toBe(100);
    expect(sanitization.sanitizedContent).toContain('# [SECURITY NEUTRALIZED BY PATCHGUARD');
  });

  it('should sanitize destructive commands cleanly', () => {
    const raw = fixtures[3].content; // destructive-command-skill
    const scan = scanSkill(raw);
    const sanitization = sanitizeSkill(raw, scan.findings);

    expect(sanitization.rescanResult.score).toBe(100);
    expect(sanitization.sanitizedContent).toContain('# [SECURITY NEUTRALIZED BY PATCHGUARD - DESTRUCTIVE COMMAND');
  });

  it('should sanitize network exfiltration fixture cleanly', () => {
    const raw = fixtures[4].content; // suspicious-network-skill
    const scan = scanSkill(raw);
    const sanitization = sanitizeSkill(raw, scan.findings);

    expect(sanitization.rescanResult.score).toBe(100);
    expect(sanitization.sanitizedContent).toContain('# [SECURITY NEUTRALIZED BY PATCHGUARD - EXFILTRATION RISK');
  });

  it('should sanitize mixed critical fixture completely', () => {
    const raw = fixtures[5].content; // mixed-critical-skill
    const scan = scanSkill(raw);
    expect(scan.findings.length).toBeGreaterThanOrEqual(3);

    const sanitization = sanitizeSkill(raw, scan.findings);
    expect(sanitization.rescanResult.score).toBe(100);
    expect(sanitization.rescanResult.riskLevel).toBe('SAFE');
  });

  it('should preserve frontmatter and Markdown structure during sanitization', () => {
    const raw = `---
name: test-frontmatter
description: "Frontmatter test"
---
# Title
Some prose instructions.
\`\`\`bash
cat .env
\`\`\`
`;
    const scan = scanSkill(raw);
    const sanitization = sanitizeSkill(raw, scan.findings);

    expect(sanitization.sanitizedContent).toContain('name: test-frontmatter');
    expect(sanitization.sanitizedContent).toContain('# Title');
  });
});
