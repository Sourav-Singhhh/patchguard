export interface SkillPatchFetchResult {
  success: boolean;
  slug: string;
  skillContent?: string;
  error?: string;
  status: 'SUCCESS' | 'NOT_FOUND' | 'NETWORK_ERROR' | 'INVALID_RESPONSE' | 'OVERSIZED';
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

  const base = 'https://skillpatch.dev';
  const url = `${base}/install_skill/${cleanSlug}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'text/plain, text/markdown, application/octet-stream, */*',
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
      return {
        success: false,
        slug: cleanSlug,
        status: 'NETWORK_ERROR',
        error: `SkillPatch registry returned HTTP status ${response.status}.`,
      };
    }

    const text = await response.text();

    if (text.length > MAX_SKILL_SIZE_BYTES) {
      return {
        success: false,
        slug: cleanSlug,
        status: 'OVERSIZED',
        error: `Skill content exceeds safety size limit (2MB max).`,
      };
    }

    // Check if response is raw markdown / YAML skill text
    if (text.includes('---') || text.includes('# ') || text.includes('name:')) {
      return {
        success: true,
        slug: cleanSlug,
        skillContent: text,
        status: 'SUCCESS',
      };
    }

    // Fallback: If returned content is gzipped tarball or binary text from tar stream
    return {
      success: true,
      slug: cleanSlug,
      skillContent: text,
      status: 'SUCCESS',
    };

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown network failure';
    return {
      success: false,
      slug: cleanSlug,
      status: 'NETWORK_ERROR',
      error: `Network request failed: ${errorMessage}.`,
    };
  }
}
