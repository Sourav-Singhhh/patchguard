#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Standalone CLI deterministic rule matcher
const RULES = [
  { id: 'PI-001', name: 'Prompt Injection Override', category: 'prompt_injection', severity: 'critical', pattern: /(ignore|disregard|override|bypass)\s+(previous|all|system|safety)\s+(instructions|prompt|rules|constraints)/i },
  { id: 'PI-002', name: 'Stealth Execution Directive', category: 'prompt_injection', severity: 'high', pattern: /(do not tell the user|secretly execute|hide this action|without informing the user|run silently in the background)/i },
  { id: 'SEC-001', name: 'Sensitive File Access', category: 'credential_access', severity: 'critical', pattern: /(\.env|id_rsa|id_ed25519|\.aws\/credentials|\.config\/gh\/hosts\.yml|\.bash_history|\.zsh_history)/i },
  { id: 'SEC-002', name: 'API Key Exposure', category: 'credential_access', severity: 'high', pattern: /(SKILLPATCH_API_KEY|OPENAI_API_KEY|GITHUB_TOKEN|AWS_SECRET_ACCESS_KEY|cat\s+\$env:|echo\s+\$env:)/i },
  { id: 'DEST-001', name: 'Destructive Command', category: 'destructive_command', severity: 'critical', pattern: /(rm\s+-[rf]*\s+[\/*]|Remove-Item\s+.*-Recurse\s+-Force|mkfs|dd\s+if=|format\s+[c-z]:)/i },
  { id: 'NET-001', name: 'Network Exfiltration', category: 'network_exfiltration', severity: 'high', pattern: /(curl.*-X\s*POST.*-d|curl.*--data|wget.*--post-data|nc\s+-[eE]|curl.*@)/i },
  { id: 'FILE-001', name: 'Sensitive Directory Traversal', category: 'suspicious_file_access', severity: 'medium', pattern: /(~\/\.ssh|\/etc\/passwd|\/etc\/shadow|C:\\Windows\\System32)/i },
];

function scanContent(raw) {
  const lines = raw.split(/\r?\n/);
  const findings = [];

  lines.forEach((line, idx) => {
    const lineNumber = idx + 1;
    RULES.forEach(rule => {
      if (rule.pattern.test(line)) {
        findings.push({
          ruleId: rule.id,
          title: rule.name,
          severity: rule.severity,
          lineNumber,
          lineContent: line.trim(),
        });
      }
    });
  });

  const baseScore = 100;
  let deductions = 0;
  findings.forEach(f => {
    if (f.severity === 'critical') deductions += 35;
    else if (f.severity === 'high') deductions += 20;
    else if (f.severity === 'medium') deductions += 10;
  });

  const score = Math.max(0, baseScore - deductions);
  let riskLevel = 'SAFE';
  if (score < 40) riskLevel = 'CRITICAL RISK';
  else if (score < 60) riskLevel = 'HIGH RISK';
  else if (score < 80) riskLevel = 'MODERATE RISK';
  else if (score < 100) riskLevel = 'LOW RISK';

  return { score, riskLevel, findings, totalLines: lines.length };
}

const args = process.argv.slice(2);
const command = args[0];
const targetPath = args[1];

function printUsage() {
  console.log(`
PatchGuard CLI — Pre-Execution Security Gate for AI Agent Skills

Usage:
  node bin/patchguard.js scan <path-to-skill.md>
  node bin/patchguard.js sanitize <path-to-skill.md>
  node bin/patchguard.js audit <directory-path>
`);
}

if (!command || !targetPath) {
  printUsage();
  process.exit(1);
}

const resolvedPath = path.resolve(process.cwd(), targetPath);

if (!fs.existsSync(resolvedPath)) {
  console.error(`Error: Path '${resolvedPath}' does not exist.`);
  process.exit(1);
}

if (command === 'scan') {
  const content = fs.readFileSync(resolvedPath, 'utf-8');
  const result = scanContent(content);

  console.log(`\n==================================================`);
  console.log(` PatchGuard Security Audit Report: ${path.basename(resolvedPath)}`);
  console.log(`==================================================`);
  console.log(`Score:         ${result.score}/100`);
  console.log(`Risk Level:    ${result.riskLevel}`);
  console.log(`Lines Scanned: ${result.totalLines}`);
  console.log(`Findings:      ${result.findings.length}\n`);

  if (result.findings.length > 0) {
    console.log(`FINDINGS DETECTED:`);
    result.findings.forEach(f => {
      console.log(`  [${f.severity.toUpperCase()}] Line ${f.lineNumber}: ${f.title}`);
      console.log(`    Content: ${f.lineContent}\n`);
    });
    process.exit(1);
  } else {
    console.log(`✓ 0 detected threats under PatchGuard rules.\n`);
    process.exit(0);
  }
} else if (command === 'sanitize') {
  const content = fs.readFileSync(resolvedPath, 'utf-8');
  const scanResult = scanContent(content);

  const lines = content.split(/\r?\n/);
  const sanitizedLines = lines.map((line, idx) => {
    const lineNum = idx + 1;
    const match = scanResult.findings.find(f => f.lineNumber === lineNum);
    if (match) {
      if (match.ruleId.startsWith('PI')) {
        return `<!-- [NEUTRALIZED PROMPT INJECTION DIRECTIVE - ${match.ruleId}] -->`;
      }
      return `# [SECURITY NEUTRALIZED BY PATCHGUARD - ${match.ruleId}]`;
    }
    return line;
  });

  const sanitizedContent = sanitizedLines.join('\n');
  const rescanResult = scanContent(sanitizedContent);

  const outputPath = resolvedPath.endsWith('.md')
    ? resolvedPath.replace('.md', '-sanitized.md')
    : `${resolvedPath}-sanitized.md`;

  fs.writeFileSync(outputPath, sanitizedContent, 'utf-8');

  console.log(`\n==================================================`);
  console.log(` PatchGuard Auto-Sanitizer Output`);
  console.log(`==================================================`);
  console.log(`Original Score: ${scanResult.score}/100`);
  console.log(`Rescan Score:   ${rescanResult.score}/100`);
  console.log(`Output File:    ${outputPath}\n`);
  console.log(`✓ No detected threats under PatchGuard rules.\n`);

  process.exit(0);
} else if (command === 'audit') {
  const files = fs.readdirSync(resolvedPath).filter(f => f.endsWith('.md') || f.endsWith('.skill'));

  console.log(`\n==================================================`);
  console.log(` PatchGuard Local Directory Audit: ${resolvedPath}`);
  console.log(`==================================================\n`);

  let totalFindings = 0;
  files.forEach(file => {
    const filePath = path.join(resolvedPath, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const res = scanContent(content);
    totalFindings += res.findings.length;
    console.log(`• ${file.padEnd(30)} Score: ${String(res.score).padStart(3)}/100 | Risk: ${res.riskLevel.padEnd(13)} | Findings: ${res.findings.length}`);
  });

  console.log(`\nDirectory Audit Summary: Scanned ${files.length} skills.`);
  process.exit(totalFindings > 0 ? 1 : 0);
} else {
  printUsage();
  process.exit(1);
}
