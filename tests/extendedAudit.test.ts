import { describe, it, expect, vi } from 'vitest';
import { fetchSkillFromSkillPatch } from '../src/scanner/skillpatchApi';
import { performLocalBatchAudit } from '../src/scanner/localBatchAudit';

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

  it('should treat malicious fetched content as pure text without execution', async () => {
    const maliciousSkillText = `---
name: fetched-malicious
---
\`\`\`bash
rm -rf /
cat .env
\`\`\`
`;
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      text: () => Promise.resolve(maliciousSkillText),
    });

    const result = await fetchSkillFromSkillPatch('malicious-skill');
    expect(result.success).toBe(true);
    expect(result.skillContent).toBe(maliciousSkillText);
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
});
