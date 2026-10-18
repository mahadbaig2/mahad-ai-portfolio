"""Voice output formatter for ElevenLabs spoken audio turns.
Milestone 13P.3 - P13P.3.10, P13P.3.11, P13P.3.12 [A]

Removes markdown syntax, raw URLs, and technical citation markup from generated answers
so that spoken delivery sounds natural and fluent without modifying factual claims.
"""

import re

# Regex patterns for stripping markdown and technical tokens
_RE_MARKDOWN_LINKS = re.compile(r"\[([^\]]+)\]\([^\)]+\)")
_RE_FULLWIDTH_CITATIONS = re.compile(r"【[^】]+】")
_RE_RAW_URLS = re.compile(r"(?:https?://|www\.)\S+")
_RE_CHUNK_AND_NUMERIC_CITATIONS = re.compile(
    r"(?:\(\s*see\s+sources?\s*\[[^\]]+\]\s*\)|\(\s*sources?:\s*\[[^\]]+\]\s*\)|\[(?:chunk_[a-zA-Z0-9_\-]+|[0-9a-fA-F\-]{36}|\d+|source:[^\]]+)\]|\[\[\d+\]\])",
    re.IGNORECASE,
)
_RE_MARKDOWN_HEADERS = re.compile(r"^\s*#{1,6}\s*", re.MULTILINE)
_RE_MARKDOWN_EMPHASIS = re.compile(r"(\*\*|__|\*|_|~~|`)(.*?)\1")
_RE_BULLET_POINTS = re.compile(r"^\s*[\*\-\•]\s+", re.MULTILINE)
_RE_NUMBERED_LIST = re.compile(r"^\s*\d+\.\s+", re.MULTILINE)
_RE_BLOCKQUOTES = re.compile(r"^\s*>\s*", re.MULTILINE)
_RE_SOURCES_TRAILING_LABEL = re.compile(r"^\s*(?:Sources?|References?)\s*:\s*$", re.IGNORECASE)
_RE_MULTIPLE_WHITESPACE = re.compile(r"[ \t]+")
_RE_MULTIPLE_NEWLINES = re.compile(r"\n{2,}")


def format_voice_output(text: str) -> str:
    """Transform grounded assistant text into clean, natural spoken prose.
    Milestone 13P.13 - P13P.13.2, P13P.13.3 [A].

    - Removes markdown syntax (bold, italics, headers, code fences, blockquotes).
    - Replaces markdown links with their human-readable anchor labels for natural attribution.
    - Strips raw URLs, web addresses, and numeric/chunk citation brackets.
    - Removes trailing source metadata headers that shouldn't be read aloud.
    - Converts lists and bullets into clean pauses or spoken clauses.
    - Normalizes whitespace and punctuation for fluent speech synthesis.
    """
    if not text or not text.strip():
        return ""

    out = text

    # 1. Convert markdown links [Label](url) -> Label (natural attribution without URLs)
    out = _RE_MARKDOWN_LINKS.sub(r"\1", out)

    # 2. Normalize fullwidth brackets and strip bracketed numeric, UUID, and chunk citations
    out = _RE_FULLWIDTH_CITATIONS.sub("", out)
    out = _RE_CHUNK_AND_NUMERIC_CITATIONS.sub("", out)

    # 3. Strip raw URLs and web addresses (P13P.13.3: never read raw URLs aloud)
    out = _RE_RAW_URLS.sub("", out)

    # 4. Remove markdown headers (### Heading -> Heading)
    out = _RE_MARKDOWN_HEADERS.sub("", out)

    # 5. Remove bold, italic, strikethrough, backticks
    # Run twice to handle nested formatting like `**bold**` or `*italic*`
    out = _RE_MARKDOWN_EMPHASIS.sub(r"\2", out)
    out = _RE_MARKDOWN_EMPHASIS.sub(r"\2", out)

    # 6. Convert bullet lists and blockquotes into readable pauses
    out = _RE_BLOCKQUOTES.sub("", out)
    out = _RE_BULLET_POINTS.sub("", out)
    out = _RE_NUMBERED_LIST.sub("", out)

    # 7. Clean up leftover markdown artifacts (e.g. isolated brackets, pipes, or hashes)
    out = re.sub(r"[#*_~`|]", "", out)

    # 8. Filter out lines that are solely trailing source labels like "Sources:"
    raw_lines = [line.strip() for line in out.splitlines()]
    filtered_lines = [
        line for line in raw_lines
        if line and not _RE_SOURCES_TRAILING_LABEL.match(line)
    ]
    cleaned_text = ". ".join(filtered_lines)

    # 9. Clean double periods or spaces created by joining
    cleaned_text = re.sub(r"\.{2,}", ".", cleaned_text)
    cleaned_text = re.sub(r"\s+([,\.\?!])", r"\1", cleaned_text)
    cleaned_text = _RE_MULTIPLE_WHITESPACE.sub(" ", cleaned_text).strip()

    return cleaned_text
