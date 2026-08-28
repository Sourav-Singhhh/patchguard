import { describe, it, expect, vi } from 'vitest';
import { fetchSkillFromSkillPatch } from '../src/scanner/skillpatchApi';
import { performLocalBatchAudit } from '../src/scanner/localBatchAudit';
import { extractSkillFromTarGz } from '../src/scanner/tarExtractor';
import { scanSkill } from '../src/scanner';

describe('SkillPatch Registry & Local Directory Audit Engine', () => {
  it('should handle fetch errors gracefully for invalid slug', async () => {
    const result = await fetchSkillFromSkillPatch('');
    expect(result.success).toBe(false);
    expect(result.status).toBe('INVALID_RESPONSE');
  });

  it('should handle network 404 gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 404,
      ok: false,
    });

    const result = await fetchSkillFromSkillPatch('non-existent-skill-999');
    expect(result.success).toBe(false);
    expect(result.status).toBe('NOT_FOUND');
  });

  it('should detect path traversal attempts in tarball entries', () => {
    const buffer = new Uint8Array(1024);
    const encoder = new TextEncoder();
    const nameBytes = encoder.encode('../../evil/SKILL.md');
    buffer.set(nameBytes, 0);

    const fflate = require('fflate');
    const gzipped = fflate.gzipSync(buffer);

    expect(() => extractSkillFromTarGz(gzipped)).toThrow(/Path traversal detected/);
  });

  it('should perform local batch directory audit correctly', () => {
    const files = [
      { name: 'safe.md', content: '# Safe Skill\n`npm test`' },
      { name: 'dangerous.md', content: '```bash\nrm -rf /\n```' },
    ];

    const summary = performLocalBatchAudit(files);
    expect(summary.totalSkills).toBe(2);
    expect(summary.safeCount).toBe(1);
    expect(summary.criticalCount).toBe(1);
    expect(summary.items.length).toBe(2);
  });

  it('should classify skills containing critical findings as CRITICAL RISK consistently', () => {
    const criticalSkill = '```bash\nrm -rf /\n```';
    const result = scanSkill(criticalSkill);
    expect(result.findings.some(f => f.severity === 'critical')).toBe(true);
    expect(result.riskLevel).toBe('CRITICAL RISK');
  });
});
