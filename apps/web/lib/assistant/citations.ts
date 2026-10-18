/**
 * Shared citation utilities for compact floating widget and full chat page.
 * Milestone 13P.5 - P13P.5.6 [A]
 */

export interface CompactCitationChip {
  index: number;
  chunk_id: string;
  title: string;
  url: string;
  heading?: string | null;
}

/**
 * Format markdown text replacing raw UUIDs and chunk tags with clickable numeric links.
 */
export function formatMessageContentWithCitations(
  content: string,
  citations?: string[],
  citationDetails?: any[]
): string {
  if (!content) return content;
  let formatted = content;

  // 1. Normalize fullwidth citation brackets into standard brackets
  formatted = formatted.replace(/【([0-9a-fA-F-]{36})】/g, "[$1]");

  // 2. Map chunk UUIDs to clean indexed links
  if (citationDetails && citationDetails.length > 0) {
    for (const item of citationDetails) {
      if (!item.chunk_id) continue;
      const escaped = item.chunk_id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(`[\\\[【]${escaped}[\\\]】]?`, "gi");
      const titleAttr = item.title ? ` "${item.title.replace(/"/g, "'")}"` : "";
      formatted = formatted.replace(
        pattern,
        `[[${item.index}]](${item.url || "/about"}${titleAttr})`
      );

      // Also map bare numeric brackets e.g. [1] to [[1]](url) if not already linked
      const numPattern = new RegExp(`(?<!\\[)\\[${item.index}\\](?!\\]|\\()`, "g");
      formatted = formatted.replace(
        numPattern,
        `[[${item.index}]](${item.url || "/about"}${titleAttr})`
      );
    }
  } else if (citations && citations.length > 0) {
    citations.forEach((cid, idx) => {
      const escaped = cid.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(`[\\\[【]${escaped}[\\\]】]?`, "gi");
      const isCaseStudy =
        cid.includes("case") || cid.includes("talk") || cid.includes("portfolio");
      const targetUrl = isCaseStudy ? "/work/talk-to-mahad" : "/about";
      formatted = formatted.replace(pattern, `[[${idx + 1}]](${targetUrl})`);

      const numPattern = new RegExp(`(?<!\\[)\\[${idx + 1}\\](?!\\]|\\()`, "g");
      formatted = formatted.replace(numPattern, `[[${idx + 1}]](${targetUrl})`);
    });
  }

  // 3. Purge any remaining raw UUID brackets
  formatted = formatted.replace(
    /[\[【][0-9a-fA-F]{8}(-[0-9a-fA-F]{0,4})*[\]】]?/g,
    ""
  );

  // 4. Clean up accidental double spaces
  formatted = formatted.replace(/  +/g, " ");

  return formatted;
}

/**
 * Extract clean, compact citation metadata chips for compact widget and voice turns.
 */
export function extractCompactCitations(
  citations?: string[],
  citationDetails?: any[]
): CompactCitationChip[] {
  if (citationDetails && citationDetails.length > 0) {
    return citationDetails.map((c, i) => ({
      index: c.index || i + 1,
      chunk_id: c.chunk_id || `chunk_${i + 1}`,
      title: c.title || "Portfolio Source",
      url: c.url || "/about",
      heading: c.heading || null,
    }));
  }

  if (citations && citations.length > 0) {
    return citations.map((cid, i) => {
      const isCaseStudy =
        cid.includes("case") || cid.includes("talk") || cid.includes("portfolio");
      return {
        index: i + 1,
        chunk_id: cid,
        title: isCaseStudy ? "Talk to Mahad Case Study" : "Portfolio Source",
        url: isCaseStudy ? "/work/talk-to-mahad" : "/about",
        heading: null,
      };
    });
  }

  return [];
}
