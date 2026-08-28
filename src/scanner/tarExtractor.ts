import { gunzipSync } from 'fflate';

export interface ExtractedSkill {
  fileName: string;
  content: string;
}

export function extractSkillFromTarGz(buffer: Uint8Array): ExtractedSkill {
  // Decompress GZIP
  let decompressed: Uint8Array;
  try {
    decompressed = gunzipSync(buffer);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown decompression failure';
    throw new Error(`Failed to decompress GZIP package: ${msg}`);
  }

  // Parse USTAR tar entries (512-byte blocks)
  let offset = 0;
  while (offset + 512 <= decompressed.length) {
    const header = decompressed.subarray(offset, offset + 512);
    
    // Check for empty block (end of archive)
    let isZeroBlock = true;
    for (let i = 0; i < 512; i++) {
      if (header[i] !== 0) {
        isZeroBlock = false;
        break;
      }
    }
    if (isZeroBlock) break;

    // Extract filename (bytes 0-99)
    let fileNameEnd = 100;
    for (let i = 0; i < 100; i++) {
      if (header[i] === 0) {
        fileNameEnd = i;
        break;
      }
    }
    const fileName = new TextDecoder().decode(header.subarray(0, fileNameEnd)).trim();

    // Prevent Path Traversal in archive entry names
    if (fileName.includes('..') || fileName.startsWith('/') || fileName.startsWith('\\')) {
      throw new Error(`Security Violation: Path traversal detected in archive entry '${fileName}'`);
    }

    // Extract size (bytes 124-135, octal string)
    const sizeStr = new TextDecoder().decode(header.subarray(124, 136)).trim();
    const size = parseInt(sizeStr, 8) || 0;

    const dataStart = offset + 512;
    const dataEnd = dataStart + size;

    if (dataEnd > decompressed.length) {
      throw new Error(`Malformed archive: Entry '${fileName}' extends past archive boundaries.`);
    }

    // Check if this file is SKILL.md (e.g. "implement/SKILL.md" or "SKILL.md")
    if (fileName.endsWith('SKILL.md') || fileName.endsWith('.md')) {
      const fileContentBytes = decompressed.subarray(dataStart, dataEnd);
      const content = new TextDecoder('utf-8').decode(fileContentBytes);

      return {
        fileName,
        content,
      };
    }

    // Jump to next 512-byte block boundary
    const padding = (512 - (size % 512)) % 512;
    offset = dataEnd + padding;
  }

  throw new Error("SkillPackage reached, but archive did not contain a valid SKILL.md file.");
}
