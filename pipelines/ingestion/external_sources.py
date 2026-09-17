"""External source configuration for RAG ingestion.

Add any URL or source here to have it automatically indexed.
The external ingestor reads this list and processes each source idempotently.

Supported source types:
  - "github_profile"  : fetches profile, pinned repos, all repo READMEs via GitHub API
  - "medium_rss"      : fetches all articles from a Medium RSS feed (full content)
  - "sanity_cv_pdf"   : fetches the resumePdf from Sanity siteSettings and extracts text
  - "web_page"        : fetches a generic HTML page, strips boilerplate, indexes prose
"""

from typing import Any

EXTERNAL_SOURCES: list[dict[str, Any]] = [
    # GitHub — fetches profile bio, all public repos with descriptions and READMEs
    {
        "type": "github_profile",
        "username": "mahadbaig2",
        "label": "GitHub Profile & Repositories",
    },

    # Medium — all articles via RSS (full article text, not just summaries)
    {
        "type": "medium_rss",
        "url": "https://medium.com/feed/@mirza.mahad",
        "label": "Medium Articles",
    },

    # CV PDF — fetched automatically from Sanity siteSettings.resumePdf
    {
        "type": "sanity_cv_pdf",
        "label": "Curriculum Vitae (PDF)",
    },

    # Add any extra URLs below — they get fetched, cleaned, and indexed.
    # Example:
    # {
    #     "type": "web_page",
    #     "url": "https://example.com/mahad-profile",
    #     "label": "Some External Profile",
    # },
]
