import { extractSkillFromTarGz } from './tarExtractor';

export interface SkillPatchFetchResult {
  success: boolean;
  slug: string;
  skillContent?: string;
  error?: string;
  status: 'SUCCESS' | 'NOT_FOUND' | 'NETWORK_ERROR' | 'INVALID_RESPONSE' | 'OVERSIZED' | 'MALFORMED_ARCHIVE';
}

const MAX_SKILL_SIZE_BYTES = 2 * 1024 * 1024; // 2MB safety limit

export async function fetchSkillFromSkillPatch(slug: string): Promise<SkillPatchFetchResult> {
  const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');

  if (!cleanSlug) {
    return {
      success: false,
      slug,
      status: 'INVALID_RESPONSE',
      error: 'Invalid or empty skill slug format.',
    };
  }

  const urlsToTry = [
    `/api/skillpatch/install_skill/${cleanSlug}`,
    `https://skillpatch.dev/install_skill/${cleanSlug}`,
  ];

  let lastError = '';

  for (const url of urlsToTry) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/gzip, application/octet-stream, text/plain, */*',
        },
      });

      clearTimeout(timeoutId);

      if (response.status === 404) {
        return {
          success: false,
          slug: cleanSlug,
          status: 'NOT_FOUND',
          error: `Skill '${cleanSlug}' was not found on SkillPatch registry (404).`,
        };
      }

      if (!response.ok) {
        lastError = `SkillPatch registry returned HTTP status ${response.status}.`;
        continue;
      }

      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      if (uint8Array.byteLength > MAX_SKILL_SIZE_BYTES) {
        return {
          success: false,
          slug: cleanSlug,
          status: 'OVERSIZED',
          error: `Skill package exceeds safety size limit (2MB max).`,
        };
      }

      // Attempt GZIP + Tar extraction of SKILL.md
      try {
        const extracted = extractSkillFromTarGz(uint8Array);
        return {
          success: true,
          slug: cleanSlug,
          skillContent: extracted.content,
          status: 'SUCCESS',
        };
      } catch (archiveErr: unknown) {
        // Fallback: Check if response was plain text markdown rather than a tarball
        const text = new TextDecoder().decode(uint8Array);
        if (text.includes('---') || text.includes('# ') || text.includes('name:')) {
          return {
            success: true,
            slug: cleanSlug,
            skillContent: text,
            status: 'SUCCESS',
          };
        }

        const msg = archiveErr instanceof Error ? archiveErr.message : 'Invalid archive structure';
        return {
          success: false,
          slug: cleanSlug,
          status: 'MALFORMED_ARCHIVE',
          error: `SkillPatch package was reached, but archive extraction failed: ${msg}`,
        };
      }

    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : 'Unknown network failure';
    }
  }

  return {
    success: false,
    slug: cleanSlug,
    status: 'NETWORK_ERROR',
    error: `Network request failed: ${lastError || 'Failed to fetch'}.`,
  };
}
