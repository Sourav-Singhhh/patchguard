import type { ParsedSkill } from './types';

export function parseSkill(rawContent: string): ParsedSkill {
  const lines = rawContent.split(/\r?\n/);
  const codeBlocks: ParsedSkill['codeBlocks'] = [];
  
  let inCodeBlock = false;
  let currentLang = '';
  let startLine = 0;
  let currentCodeLines: string[] = [];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        currentLang = trimmed.slice(3).trim();
        startLine = lineNumber;
        currentCodeLines = [];
      } else {
        inCodeBlock = false;
        codeBlocks.push({
          language: currentLang || 'bash',
          code: currentCodeLines.join('\n'),
          startLine,
          endLine: lineNumber,
        });
      }
    } else if (inCodeBlock) {
      currentCodeLines.push(line);
    }
  });

  return {
    raw: rawContent,
    lines,
    codeBlocks,
  };
}
