"""Structured contact and navigation lookup without LLM calls (P9.2.1).

Resolves direct contact channels, page navigation targets, and greetings
deterministically in sub-millisecond time for both English and Roman Urdu.
"""

import re
from dataclasses import dataclass, field

from apps.api.schemas.router import IntentLabel


@dataclass
class DeterministicResolution:
    """Outcome of a deterministic structured lookup."""

    answer: str
    intent: str
    navigation_target: dict[str, str] | None = None
    suggested_actions: list[dict[str, str]] = field(default_factory=list)


# Authoritative contact constants (aligned with Sanity CMS & site settings)
CONTACT_CHANNELS = {
    "email": "mahadmirza681@gmail.com",
    "linkedin": "https://linkedin.com/in/mahadbaig",
    "github": "https://github.com/mahadbaig2",
    "medium": "https://medium.com/@mirza.mahad",
    "location": "Remote / Karachi, Pakistan",
    "contact_page": "/contact",
    "resume_url": "/contact",
}

# Site page navigation targets
NAVIGATION_PAGES = {
    "work": {
        "title": "Selected Work & Case Studies",
        "url": "/work",
        "description": "Production AI architectures, case studies, and engineering deliverables.",
    },
    "blog": {
        "title": "Articles & Engineering Notes",
        "url": "/blog",
        "description": "Deep-dives into zero-cost cloud ops, in-process ML routing, and RAG evaluation.",
    },
    "about": {
        "title": "About Mahad Baig",
        "url": "/about",
        "description": "Career background, technical competencies, and architectural philosophy.",
    },
    "contact": {
        "title": "Contact & Résumé",
        "url": "/contact",
        "description": "Direct communication channels, profiles, and downloadable résumé.",
    },
    "chat": {
        "title": "Talk to Mahad Assistant",
        "url": "/chat",
        "description": "Grounded AI assistant with inspectable retrieval and in-process ML routing.",
    },
}


def resolve_contact_lookup(query: str, language: str = "en") -> DeterministicResolution:
    """Produce structured contact details for general or channel-specific inquiries."""
    q_lower = query.lower()

    # Specific channel checks
    if "email" in q_lower or "mail" in q_lower:
        if language == "ur":
            answer = (
                f"Mahad ka official email address yeh hai: **[{CONTACT_CHANNELS['email']}](mailto:{CONTACT_CHANNELS['email']})**.\n\n"
                f"Aap unhein direct project inquiries ya hiring ke liye email bhej sakte hain."
            )
        else:
            answer = (
                f"You can reach Mahad directly via email at **[{CONTACT_CHANNELS['email']}](mailto:{CONTACT_CHANNELS['email']})**.\n\n"
                f"He typically responds within 24–48 hours for engineering roles and technical discussions."
            )
        target = NAVIGATION_PAGES["contact"]

    elif "linkedin" in q_lower:
        if language == "ur":
            answer = (
                f"Mahad ka LinkedIn profile yahan available hai: **[linkedin.com/in/mahadbaig]({CONTACT_CHANNELS['linkedin']})**.\n\n"
                f"Professional networking aur work experience ke liye connect karein."
            )
        else:
            answer = (
                f"Mahad's LinkedIn profile is located at **[linkedin.com/in/mahadbaig]({CONTACT_CHANNELS['linkedin']})**.\n\n"
                f"Feel free to connect or send a message regarding AI product engineering opportunities."
            )
        target = NAVIGATION_PAGES["contact"]

    elif "github" in q_lower or "repo" in q_lower or "code" in q_lower:
        if language == "ur":
            answer = (
                f"Mahad ka GitHub profile aur open-source repositories yahan hain: **[github.com/mahadbaig2]({CONTACT_CHANNELS['github']})**.\n\n"
                f"Aap is portfolio ka code, RAG pipelines, aur ML routing models inspect kar sakte hain."
            )
        else:
            answer = (
                f"You can explore Mahad's open-source projects on GitHub at **[github.com/mahadbaig2]({CONTACT_CHANNELS['github']})**.\n\n"
                f"The repository for this portfolio, its ONNX model serving code, and RAG pipelines are publicly verifiable there."
            )
        target = NAVIGATION_PAGES["work"]

    elif "resume" in q_lower or "cv" in q_lower:
        if language == "ur":
            answer = (
                f"Mahad ka updated résumé download karne ke liye unke **[Contact & Résumé Page](/contact)** par visit karein.\n\n"
                f"- **Email**: [{CONTACT_CHANNELS['email']}](mailto:{CONTACT_CHANNELS['email']})\n"
                f"- **Location**: {CONTACT_CHANNELS['location']}"
            )
        else:
            answer = (
                f"You can review and download Mahad's complete professional résumé directly from the **[Contact & Résumé Page](/contact)**.\n\n"
                f"- **Location**: {CONTACT_CHANNELS['location']}\n"
                f"- **Direct Email**: [{CONTACT_CHANNELS['email']}](mailto:{CONTACT_CHANNELS['email']})"
            )
        target = NAVIGATION_PAGES["contact"]

    else:
        # Full structured contact card
        if language == "ur":
            answer = (
                "Aap Mahad Baig se mandarja-zail channels ke zarye direct contact kar sakte hain:\n\n"
                f"- **Email**: [{CONTACT_CHANNELS['email']}](mailto:{CONTACT_CHANNELS['email']})\n"
                f"- **LinkedIn**: [linkedin.com/in/mahadbaig]({CONTACT_CHANNELS['linkedin']})\n"
                f"- **GitHub**: [github.com/mahadbaig2]({CONTACT_CHANNELS['github']})\n"
                f"- **Medium / Articles**: [medium.com/@mirza.mahad]({CONTACT_CHANNELS['medium']})\n"
                f"- **Location**: {CONTACT_CHANNELS['location']}\n\n"
                "Mazeed details aur résumé ke liye **[/contact](/contact)** page visit karein."
            )
        else:
            answer = (
                "You can get in touch with Mahad Baig directly through the following channels:\n\n"
                f"- **Email**: [{CONTACT_CHANNELS['email']}](mailto:{CONTACT_CHANNELS['email']})\n"
                f"- **LinkedIn**: [linkedin.com/in/mahadbaig]({CONTACT_CHANNELS['linkedin']})\n"
                f"- **GitHub**: [github.com/mahadbaig2]({CONTACT_CHANNELS['github']})\n"
                f"- **Medium Articles**: [medium.com/@mirza.mahad]({CONTACT_CHANNELS['medium']})\n"
                f"- **Location**: {CONTACT_CHANNELS['location']}\n\n"
                "Visit the **[/contact](/contact)** page to download his résumé or send an inquiry."
            )
        target = NAVIGATION_PAGES["contact"]

    actions = [
        {"label": "Contact Page", "url": "/contact"},
        {"label": "LinkedIn Profile", "url": CONTACT_CHANNELS["linkedin"]},
        {"label": "GitHub Profile", "url": CONTACT_CHANNELS["github"]},
    ]

    return DeterministicResolution(
        answer=answer,
        intent=IntentLabel.CONTACT_INFO.value,
        navigation_target=target,
        suggested_actions=actions,
    )


# Regex patterns for deterministic lookups with proper word boundaries
_GREETING_PATTERN = re.compile(
    r"\b(hello|hi|hey|salam|assalam(u\s*alaikum)?|good\s+(morning|afternoon|evening)|adaab)\b",
    re.IGNORECASE,
)

_CONTACT_PATTERN = re.compile(
    r"\b(contact|email|e-mail|mail|linkedin|github|resume|cv|hire|hiring|rabta)\b",
    re.IGNORECASE,
)

_NAV_WORK_PATTERN = re.compile(
    r"\b(selected\s+work|case\s+studies|case\s+study|projects|work\s+page|kaam\s+dekhna)\b",
    re.IGNORECASE,
)

_NAV_BLOG_PATTERN = re.compile(
    r"\b(articles|blog|writings?|notes|mazameen|blog\s+posts?)\b",
    re.IGNORECASE,
)

_NAV_ABOUT_PATTERN = re.compile(
    r"\b(about(\s+mahad)?|who\s+is\s+mahad|background|career(\s+history)?|taaruf)\b",
    re.IGNORECASE,
)


def resolve_navigation_lookup(
    query: str, language: str = "en"
) -> DeterministicResolution | None:
    """Detect if query is an explicit request to navigate or locate a portfolio section."""
    # Check if query is seeking page navigation or listing
    has_nav_work = bool(_NAV_WORK_PATTERN.search(query))
    has_nav_blog = bool(_NAV_BLOG_PATTERN.search(query))
    has_nav_about = bool(_NAV_ABOUT_PATTERN.search(query))

    # Match work/projects navigation
    if has_nav_work and not (
        "technolog" in query.lower() or "architecture" in query.lower()
    ):
        target = NAVIGATION_PAGES["work"]
        if language == "ur":
            answer = (
                "Mahad ke tamam production systems aur case studies **[Selected Work](/work)** page par dastyab hain.\n\n"
                "Highlights include:\n"
                "- **Mahad AI Portfolio**: Inspectable RAG, ONNX routing, and budget-constrained architecture.\n"
                "- **CardioScan AI**: Deep learning echocardiography proof-of-concept.\n"
                "- **INDKOM Platform**: High-throughput automated marketing pipeline.\n\n"
                "Aap kisi bhi project par click karke uski deep architecture aur trade-offs parh sakte hain."
            )
        else:
            answer = (
                "You can explore Mahad's engineering projects on the **[Selected Work](/work)** page.\n\n"
                "Featured case studies include:\n"
                "- **Mahad AI Portfolio**: Inspectable RAG system with in-process ML routing on $0 cloud budget.\n"
                "- **CardioScan AI**: Academic proof-of-concept for automated cardiac view interpretation.\n"
                "- **INDKOM Automation Platform**: Multi-channel marketing engine with resilient queueing.\n\n"
                "Click on any project card to inspect system topology, metrics, and key architectural decisions."
            )
        actions = [
            {"label": "View Selected Work", "url": "/work"},
            {"label": "About Mahad", "url": "/about"},
        ]
        return DeterministicResolution(
            answer=answer,
            intent="navigation",
            navigation_target=target,
            suggested_actions=actions,
        )

    # Match blog/articles navigation
    if has_nav_blog:
        target = NAVIGATION_PAGES["blog"]
        if language == "ur":
            answer = (
                "Mahad ke technical articles aur system design deep-dives **[Articles & Notes](/blog)** section mein hain.\n\n"
                "Featured writings:\n"
                "- *Architecting an Intentionally Over-Engineered AI Portfolio on Free-Tier Cloud*\n"
                "- *In-Process ML Routing: Sub-5ms Query Classification Without LLM Overhead*\n"
                "- *Dual Observability: Pairing MLflow with LangSmith for Full-Lifecycle AI Systems*"
            )
        else:
            answer = (
                "Mahad's technical writings and architectural deep-dives are available on the **[Articles & Notes](/blog)** page.\n\n"
                "Featured articles include:\n"
                "- *Architecting an Intentionally Over-Engineered AI Portfolio on Free-Tier Cloud*\n"
                "- *In-Process ML Routing: Sub-5ms Query Classification Without LLM Overhead*\n"
                "- *Dual Observability: Pairing MLflow with LangSmith for Full-Lifecycle AI Systems*"
            )
        actions = [
            {"label": "Browse Articles", "url": "/blog"},
            {"label": "Selected Work", "url": "/work"},
        ]
        return DeterministicResolution(
            answer=answer,
            intent="navigation",
            navigation_target=target,
            suggested_actions=actions,
        )

    # Match about/career navigation
    if has_nav_about:
        target = NAVIGATION_PAGES["about"]
        if language == "ur":
            answer = (
                "Mahad Baig ke career background aur technical competencies ke liye **[About Mahad](/about)** page visit karein.\n\n"
                "Summary:\n"
                "- **Role**: AI Product Engineer specializing in grounded RAG, in-process ML, and verifiable AI systems.\n"
                "- **Focus**: Inspectable architectures, bounded latency, and strict zero-dollar operating overhead.\n"
                "- **Stack**: Next.js, FastAPI, LangGraph, Qdrant, PostgreSQL, PyTorch, and ONNX Runtime."
            )
        else:
            answer = (
                "To learn more about Mahad's background, technical competencies, and philosophy, visit the **[About Mahad](/about)** page.\n\n"
                "Executive Summary:\n"
                "- **Role**: AI Product Engineer & System Architect.\n"
                "- **Specialization**: Grounded RAG pipelines, in-process ML routing, and deterministic agent orchestration.\n"
                "- **Key Technologies**: Next.js, FastAPI, LangGraph, Qdrant, Neon PostgreSQL, PyTorch, and ONNX Runtime."
            )
        actions = [
            {"label": "About Page", "url": "/about"},
            {"label": "Contact Page", "url": "/contact"},
        ]
        return DeterministicResolution(
            answer=answer,
            intent="navigation",
            navigation_target=target,
            suggested_actions=actions,
        )

    return None


def resolve_greeting(query: str, language: str = "en") -> DeterministicResolution:
    """Return friendly, persona-consistent greeting."""
    if language == "ur":
        answer = (
            "Salam! Main Mahad Baig ka AI assistant hoon.\n\n"
            "Main unke AI projects, system architectures, technical articles aur career experience "
            "ke baray mein authenticated hawala-jaat ke sath jawabat de sakta hoon.\n\n"
            "Aap Mahad ke kisi makhsoos project ke baray mein poochna chahte hain ya unke background ke baray mein?"
        )
    else:
        answer = (
            "Hello! I am Mahad Baig's AI Assistant.\n\n"
            "I can answer questions about his AI Product Engineering projects, system architectures, "
            "engineering articles, and career background using verified, cited sources.\n\n"
            "Would you like to explore a specific project (like CardioScan AI or the ML Router) or learn about his technical background?"
        )

    actions = [
        {"label": "Explore Projects", "url": "/work"},
        {"label": "Read Articles", "url": "/blog"},
        {"label": "Contact Mahad", "url": "/contact"},
    ]

    return DeterministicResolution(
        answer=answer,
        intent=IntentLabel.GREETING.value,
        suggested_actions=actions,
    )


def resolve_deterministic_turn(
    query: str,
    intent: str,
    language: str = "en",
) -> DeterministicResolution | None:
    """Top-level resolver for all deterministic non-LLM paths (P9.2.1)."""
    # 1. Contact Info lookup (explicit intent or keyword pattern with word boundaries)
    if intent == IntentLabel.CONTACT_INFO.value or bool(_CONTACT_PATTERN.search(query)):
        return resolve_contact_lookup(query, language=language)

    # 2. Greeting lookup (explicit intent or keyword pattern with word boundaries)
    if intent == IntentLabel.GREETING.value or bool(_GREETING_PATTERN.search(query)):
        return resolve_greeting(query, language=language)

    # 3. Page Navigation lookup
    nav_res = resolve_navigation_lookup(query, language=language)
    if nav_res is not None:
        return nav_res

    return None
