"""Converts Sanity Portable Text AST into structured Markdown sections (P4.1.3 & P4.1.4)."""

from typing import Any

from pipelines.ingestion.contracts import DocumentSection, SectionType


def extract_span_text(children: list[dict[str, Any]], mark_defs: list[dict[str, Any]] | None = None) -> str:
    """Extract plain text and basic markdown formatting from child spans."""
    mark_map: dict[str, dict[str, Any]] = {
        m["_key"]: m for m in (mark_defs or []) if isinstance(m, dict) and "_key" in m
    }

    result: list[str] = []
    for child in children:
        if not isinstance(child, dict):
            continue
        text = child.get("text", "")
        if not text:
            continue

        marks = child.get("marks", [])
        formatted = text

        # Check for inline link annotations
        link_href: str | None = None
        for mark in marks:
            if mark in mark_map:
                def_obj = mark_map[mark]
                if def_obj.get("_type") == "link" and def_obj.get("href"):
                    link_href = def_obj["href"]

        if link_href:
            formatted = f"[{formatted}]({link_href})"

        # Apply decorators
        if "code" in marks:
            formatted = f"`{formatted}`"
        if "strong" in marks:
            formatted = f"**{formatted}**"
        if "em" in marks:
            formatted = f"*{formatted}*"

        result.append(formatted)

    return "".join(result).strip()


def parse_portable_text(
    blocks: list[dict[str, Any]] | None,
    document_title: str | None = None,
) -> list[DocumentSection]:
    """Parse a list of Portable Text blocks into structured DocumentSections."""
    if not blocks or not isinstance(blocks, list):
        return []

    sections: list[DocumentSection] = []
    current_heading: str | None = document_title
    current_level: int = 1 if document_title else 0
    heading_stack: list[tuple[int, str]] = []
    if document_title:
        heading_stack.append((1, document_title))

    current_chunks: list[str] = []
    current_section_type = SectionType.PROSE

    list_counter = 0
    last_list_type: str | None = None

    def flush_section() -> None:
        nonlocal current_chunks, current_section_type
        text_content = "\n\n".join(c for c in current_chunks if c.strip()).strip()
        if text_content:
            sections.append(
                DocumentSection(
                    heading=current_heading,
                    heading_level=current_level,
                    heading_path=[h for _, h in heading_stack],
                    content=text_content,
                    section_type=current_section_type,
                )
            )
        current_chunks = []
        current_section_type = SectionType.PROSE

    for block in blocks:
        if not isinstance(block, dict):
            continue

        block_type = block.get("_type", "")

        # 1. Standard Block (Paragraphs, Headings, Lists, Blockquotes)
        if block_type == "block":
            style = block.get("style", "normal")
            list_item = block.get("listItem")
            level = block.get("level", 1)
            children = block.get("children", [])
            mark_defs = block.get("markDefs", [])
            text = extract_span_text(children, mark_defs)

            if not text:
                continue

            # Check if this is a heading
            if style in ("h1", "h2", "h3", "h4"):
                flush_section()
                h_level = int(style[1])
                current_heading = text
                current_level = h_level

                # Pop headings of equal or deeper level from stack
                while heading_stack and heading_stack[-1][0] >= h_level:
                    heading_stack.pop()
                heading_stack.append((h_level, text))
                last_list_type = None
                continue

            # Check if this is a list item
            if list_item:
                if current_section_type != SectionType.LIST:
                    flush_section()
                    current_section_type = SectionType.LIST

                indent = "  " * max(0, level - 1)
                if list_item == "bullet":
                    formatted_line = f"{indent}- {text}"
                    last_list_type = "bullet"
                elif list_item == "number":
                    if last_list_type != "number":
                        list_counter = 1
                    else:
                        list_counter += 1
                    formatted_line = f"{indent}{list_counter}. {text}"
                    last_list_type = "number"
                else:
                    formatted_line = f"{indent}- {text}"

                current_chunks.append(formatted_line)
                continue
            else:
                last_list_type = None

            # Check if this is a blockquote
            if style == "blockquote":
                flush_section()
                current_section_type = SectionType.QUOTE
                current_chunks.append(f"> {text}")
                flush_section()
                continue

            # Standard prose paragraph
            if current_section_type != SectionType.PROSE:
                flush_section()
                current_section_type = SectionType.PROSE

            current_chunks.append(text)

        # 2. Code Block
        elif block_type in ("code", "codeBlock"):
            flush_section()
            code = block.get("code", "")
            language = block.get("language", "")
            filename = block.get("filename")

            header = language or ""
            if filename:
                header = f"{header}:{filename}" if header else filename

            code_markdown = f"```{header}\n{code}\n```"
            current_section_type = SectionType.CODE
            current_chunks.append(code_markdown)
            flush_section()
            last_list_type = None

        # 3. Image with Caption/Alt
        elif block_type == "image":
            caption = block.get("caption") or block.get("alt") or "Figure"
            current_chunks.append(f"[Image: {caption}]")
            last_list_type = None

        # 4. Callout / Notice
        elif block_type == "callout":
            flush_section()
            tone = (block.get("tone") or "info").capitalize()
            msg = block.get("text") or block.get("content") or ""
            if msg:
                current_section_type = SectionType.CALLOUT
                current_chunks.append(f"> **[{tone}]**: {msg}")
                flush_section()
            last_list_type = None

    flush_section()
    return sections


def portable_text_to_markdown(
    blocks: list[dict[str, Any]] | None,
    document_title: str | None = None,
) -> str:
    """Render portable text blocks into a single cohesive Markdown document."""
    sections = parse_portable_text(blocks, document_title=document_title)
    if not sections:
        return ""

    rendered_parts: list[str] = []
    seen_headings: set[str] = set()

    for sec in sections:
        if sec.heading and sec.heading not in seen_headings and sec.heading != document_title:
            prefix = "#" * max(2, sec.heading_level)
            rendered_parts.append(f"{prefix} {sec.heading}")
            seen_headings.add(sec.heading)
        rendered_parts.append(sec.content)

    return "\n\n".join(rendered_parts)
