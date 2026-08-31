export function cleanHtmlContent(rawHtml: string): string {
  if (!rawHtml) return '';

  let text = rawHtml;

  // Remove scripts and style elements
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // Convert break tags and paragraph tags to newlines
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<\/li>/gi, '\n');
  text = text.replace(/<\/h[1-6]>/gi, '\n\n');

  // Strip all other HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '�')
    .replace(/&ndash;/g, '�')
    .replace(/&hellip;/g, '�');

  // Normalize excessive whitespaces and empty lines
  text = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n\n');

  return text.trim();
}

export function extractImageUrl(rawContent: string, enclosureUrl?: string): string | undefined {
  if (enclosureUrl && enclosureUrl.match(/\.(jpe?g|png|webp|gif)/i)) {
    return enclosureUrl;
  }

  if (!rawContent) return undefined;

  // Check img src attribute
  const imgMatch = rawContent.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    const src = imgMatch[1];
    if (src.startsWith('http')) return src;
  }

  // Check media:content or media:thumbnail tags
  const mediaMatch = rawContent.match(/url=["']([^"']+\.(?:jpe?g|png|webp|gif)[^"']*)["']/i);
  if (mediaMatch && mediaMatch[1]) {
    return mediaMatch[1];
  }

  return undefined;
}
