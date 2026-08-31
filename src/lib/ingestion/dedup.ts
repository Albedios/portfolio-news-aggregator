import crypto from 'crypto';

export function normalizeUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    // Strip common tracking query params
    const cleanParams = new URLSearchParams();
    for (const [key, value] of parsed.searchParams.entries()) {
      if (!key.startsWith('utm_') && key !== 'ref' && key !== 'source' && key !== 'fbclid') {
        cleanParams.append(key, value);
      }
    }
    const queryString = cleanParams.toString() ? `?${cleanParams.toString()}` : '';
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}${queryString}`.replace(/\/+$/, '');
  } catch {
    return rawUrl.trim();
  }
}

export function generateContentHash(title: string, cleanContent: string, url: string): string {
  const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
  const snippet = cleanContent.slice(0, 300).toLowerCase().replace(/[^a-z0-9]/g, '');
  const combined = `${normalizedTitle}_${snippet}_${normalizeUrl(url)}`;
  return crypto.createHash('sha256').update(combined).digest('hex');
}
