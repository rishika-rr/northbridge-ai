const MARKER = /\[(\d+)\](?!\()/g;

export const SOURCE_ANCHOR_PREFIX = "#source-";

/**
 * Turn the answer's `[n]` citation markers into links to the matching source
 * card (`[n](#source-n)`), so they can be rendered as citation chips that are
 * visibly distinct from the generated text (UI-005). Markers that are already
 * links are left alone.
 */
export function linkCitations(markdown: string): string {
  return markdown.replace(MARKER, (_match, number: string) => `[${number}](${SOURCE_ANCHOR_PREFIX}${number})`);
}

/** The citation number a link points at, or null for ordinary links. */
export function citationNumber(href: string | undefined): number | null {
  if (!href || !href.startsWith(SOURCE_ANCHOR_PREFIX)) return null;
  const number = Number(href.slice(SOURCE_ANCHOR_PREFIX.length));
  return Number.isInteger(number) && number > 0 ? number : null;
}

export function sourceElementId(citation: number): string {
  return `source-${citation}`;
}
