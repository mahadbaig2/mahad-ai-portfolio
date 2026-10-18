import { sanityFetch, isSanityConfigured } from './client';
import {
  projectsQuery,
  featuredProjectsQuery,
  projectBySlugQuery,
  caseStudyByProjectSlugQuery,
  articlesQuery,
  articleBySlugQuery,
  experiencesQuery,
  educationsQuery,
  skillsQuery,
  siteSettingsQuery,
  travelJourneysQuery,
  travelJourneyBySlugQuery,
  faqsQuery,
} from './queries';
import { PROJECTS, ARTICLES, type Project, type Article } from '@/lib/data';

export interface CmsProject extends Project {
  heroImage?: any;
  cardImage?: any;
  architectureDiagram?: any;
  overview?: string;
  subtitle?: string;
  shortOutcome?: string;
  category?: string;
  secondaryCategories?: string[];
  origin?: string;
  maturityStatus?: string;
  timeline?: string;
  clientOrOrg?: string;
  featuredRank?: number;
  featured?: boolean;
  stack?: string[];
  keyDecisions?: string[];
  targetUsers?: string;
  responsibilities?: string[];
  constraints?: string[];
  productApproach?: string;
  designProcess?: string;
  engineeringApproach?: string;
  tradeOffs?: string[];
  failures?: string[];
  completedCapabilities?: string[];
  plannedCapabilities?: string[];
  lessonsLearned?: string[];
  suggestedQuestions?: string[];
}

export interface CmsCaseStudy {
  _id?: string;
  title: string;
  slug: string;
  summary: string;
  contextAndProblem?: any;
  engineeringApproach?: any;
  quantitativeResults?: { metric: string; result: string; baseline?: string; methodology?: string }[];
  tradeOffsAndFailures?: any;
  lessonsLearned?: string[];
}

export interface CmsArticle {
  slug: string;
  title: string;
  publishedAt: string;
  readingTime: string;
  summary: string;
  topics: string[];
  content?: string[];
  body?: any;
  canonicalUrl?: string;
  articleType?: string;
  featured?: boolean;
  featuredRank?: number;
  keyTakeaway?: string;
  sources?: { title: string; url: string }[];
  heroImage?: any;
}

export interface CmsExperience {
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  location?: string;
  summary: string;
  highlights: string[];
  technologies?: string[];
  sortOrder?: number;
  featuredRole?: boolean;
  shortOutcome?: string;
}

export interface CmsEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationYear?: string;
  recordType?: string;
  status?: string;
  completionLabel?: string;
  credentialUrl?: string;
  highlights?: string[];
}

export interface CmsSkill {
  name: string;
  category: string;
  proficiency: string;
  description?: string;
  featured?: boolean;
  sortOrder?: number;
}

export interface CmsTravelJourney {
  _id?: string;
  title: string;
  slug: string;
  subtitle?: string;
  summary?: string;
  heroImage?: any;
  featured?: boolean;
  featuredRank?: number;
  journeyStatus?: string;
  origin?: string;
  destination?: string;
  region?: string;
  country?: string;
  startDate?: string;
  endDate?: string;
  yearLabel?: string;
  transportMode?: string;
  motorcycle?: string;
  elevation?: string;
  distance?: string;
  routeSummary?: string;
  story?: any;
  challenges?: string[];
  reflection?: string;
  gallery?: {
    asset: any;
    alt?: string;
    caption?: string;
    location?: string;
    orientation?: string;
    featured?: boolean;
  }[];
}

export interface CmsSiteSettings {
  authorName: string;
  targetRole: string;
  heroEyebrow?: string;
  heroHeadline?: string;
  heroSupportingText?: string;
  headline: string;
  shortBio: string;
  location: string;
  availabilityStatus?: string;
  availabilityLabel?: string;
  roleInterests?: string[];
  email: string;
  linkedinUrl: string;
  githubUrl: string;
  mediumUrl: string;
  resumePdfUrl?: string;
  avatar?: any;
  touringPhoto?: any;
  personalHighlight?: string;
  homepageProofPoints?: { label: string; value: string; context: string }[];
  careerNarrative?: string;
  travelIntro?: string;
  assistantIntro?: string;
}

// Verified Default Fallback Site Settings
export const DEFAULT_SITE_SETTINGS: CmsSiteSettings = {
  authorName: 'Mirza Mahad Baig',
  targetRole: 'AI Product Engineer',
  heroEyebrow: 'DOSSIER_REF: 001-AI // ISLAMABAD, PAKISTAN [33.6844° N, 73.0479° E]',
  heroHeadline: 'I DESIGN PRODUCTS.\nI ENGINEER INTELLIGENCE.',
  heroSupportingText:
    'I’m Mirza Mahad Baig, an AI Product Engineer with nearly six years of product design and UI/UX experience, practical AI engineering expertise, and hands-on full-stack experience. I turn complex ideas into understandable, working AI products.',
  headline:
    'AI Product Engineer with ~6 years product design and UI/UX experience, practical AI engineering expertise, and hands-on full-stack experience.',
  shortBio:
    'I bridge the gap between product strategy, UI/UX systems design, and production AI engineering. With 500+ production SaaS screens designed and real-world RAG, LangGraph, and ML routing systems built, I turn ambiguous product requirements into grounded, demonstrable software.',
  location: 'Islamabad, Pakistan',
  availabilityStatus: 'OPEN TO AI PRODUCT ENGINEERING AND APPLIED AI OPPORTUNITIES',
  availabilityLabel: 'SYS_STATUS: ACTIVE',
  roleInterests: [
    'AI Product Engineer',
    'Founding Product Engineer',
    'Staff / Lead Product Designer (AI Systems)',
    'Applied AI Engineer',
  ],
  email: 'mahadmirza681@gmail.com',
  linkedinUrl: 'https://linkedin.com/in/mahadbaig',
  githubUrl: 'https://github.com/mahadbaig2',
  mediumUrl: 'https://medium.com/@mirza.mahad',
  resumePdfUrl: undefined,
  personalHighlight:
    'Rode to Khunjerab Pass, one of the world’s highest paved international border crossings, on my motorcycle.',
  homepageProofPoints: [
    {
      label: 'PRODUCT DESIGN',
      value: '~6 Years',
      context: 'Product design, UI/UX, systems thinking, user flows, and enterprise discovery.',
    },
    {
      label: 'ENTERPRISE SCALE',
      value: '500+ Screens',
      context: 'Designed for Busyfile across B2B multi-tenant firm portals, operations, and compliance.',
    },
    {
      label: 'AI SYSTEMS',
      value: 'RAG & ML',
      context: 'In-process ONNX routing, LangGraph state machines, Qdrant vectors, and strictly cited RAG.',
    },
    {
      label: 'FULL-STACK',
      value: 'Production Native',
      context: 'Next.js 15, TypeScript, Python, FastAPI, PostgreSQL, and strict Dockerized architecture.',
    },
  ],
};

// Verified Default Fallback Experience (Strictly matches Mahad-Career-Education-Skills-Sanity-Content.md)
export const DEFAULT_EXPERIENCES: CmsExperience[] = [
  {
    company: 'Techomatrix',
    role: 'AI Engineer',
    startDate: '2026-03',
    endDate: '2026-07',
    isCurrent: false,
    location: 'Karachi, Pakistan',
    summary:
      'Built AI-powered application features and automation workflows by connecting LLMs, APIs, databases, and third-party platforms. Worked across prompt design, Python services, FastAPI endpoints, and n8n workflows.',
    highlights: [
      'Built end-to-end n8n automations integrating LLMs, REST APIs, and SaaS platforms.',
      'Developed and maintained AI features using Python, FastAPI, and hosted LLM APIs.',
      'Designed prompt workflows for extraction, summarization, content generation, and decision support.',
      'Connected AI services with operational databases and external applications.',
    ],
    technologies: ['Python', 'FastAPI', 'n8n', 'REST APIs', 'Groq', 'PostgreSQL', 'Prompt Engineering'],
    sortOrder: 1,
    featuredRole: true,
    shortOutcome: 'Engineered production AI endpoints and n8n LLM workflows',
  },
  {
    company: 'Independent / Freelance',
    role: 'Visual and Product Designer',
    startDate: '2019-09',
    isCurrent: true,
    location: 'Global / Remote',
    summary:
      'Works directly with founders and startup teams across fintech, healthcare, Web3, and SaaS. Leads projects from product discovery and requirements definition through UI/UX design, prototyping, and developer handoff.',
    highlights: [
      'Delivered digital product and visual design work for international clients across multiple industries.',
      'Helped founders translate early ideas into structured requirements and MVP scope.',
      'Designed responsive interfaces, user flows, and design systems for web and mobile products.',
    ],
    technologies: ['Figma', 'Product Strategy', 'UI/UX Design', 'Design Systems', 'User Flows'],
    sortOrder: 2,
    featuredRole: true,
    shortOutcome: 'Delivered dozens of product interfaces and design systems for global founders',
  },
  {
    company: 'Datawire (Mayatax)',
    role: 'Senior Product Designer',
    startDate: '2024-09',
    endDate: '2026-03',
    isCurrent: false,
    location: 'Houston, USA / Remote',
    summary:
      'Led product strategy and UI/UX for enterprise fintech platforms serving US accounting and taxation firms. Designed scalable compliance, bookkeeping, and entity-service workflows.',
    highlights: [
      'Led Busyfile product design from initial B2C formation flows to a white-label B2B SaaS platform.',
      'Designed more than 500 screens across client, firm-admin, internal-operations, and super-admin experiences.',
      'Supported more than 20 business, taxation, bookkeeping, and compliance services.',
      'Built reusable design-system patterns and detailed specifications for engineering handoff.',
    ],
    technologies: ['Figma', 'Enterprise SaaS', 'Design Systems', 'User Research', 'Product Strategy'],
    sortOrder: 3,
    featuredRole: true,
    shortOutcome: 'Designed 500+ production SaaS screens for Busyfile multi-tenant tax platform',
  },
  {
    company: 'Slidey LLC',
    role: 'Design Executive',
    startDate: '2024-03',
    endDate: '2024-09',
    isCurrent: false,
    location: 'Karachi, Pakistan',
    summary:
      'Created interface and visual-design work for web, mobile, and executive communication projects, balancing usability with clear visual storytelling.',
    highlights: [
      'Designed user interfaces for web and mobile experiences.',
      'Produced B2B presentations and executive communication materials.',
      'Maintained consistent brand and visual quality across client deliverables.',
    ],
    technologies: ['Figma', 'UI Design', 'Visual Design', 'Presentation Design'],
    sortOrder: 4,
    featuredRole: false,
    shortOutcome: 'Executed interface design and executive B2B visual assets',
  },
  {
    company: 'KreativeFolks',
    role: 'Creative Design Specialist',
    startDate: '2023-07',
    endDate: '2024-03',
    isCurrent: false,
    location: 'Karachi, Pakistan',
    summary:
      'Worked on SaaS product interfaces, brand systems, and marketing experiences for fintech and healthcare clients. Planned and designed the AurusBooks fintech SaaS MVP.',
    highlights: [
      'Planned and designed the AurusBooks fintech SaaS MVP from a detailed product brief.',
      'Simplified complex financial workflows for small and medium-sized businesses.',
      'Delivered product, brand, and marketing design across fintech and healthcare accounts.',
    ],
    technologies: ['Figma', 'UI/UX Design', 'SaaS Design', 'User Flows', 'Wireframing'],
    sortOrder: 5,
    featuredRole: false,
    shortOutcome: 'Designed AurusBooks fintech SaaS MVP from concept to handoff',
  },
  {
    company: 'Scalease',
    role: 'Brand Designer',
    startDate: '2022-07',
    endDate: '2022-09',
    isCurrent: false,
    location: 'Karachi, Pakistan',
    summary:
      'Developed brand identities, social content, and web-design assets for small businesses and early-stage companies.',
    highlights: [
      'Created practical identity systems for small-business clients.',
      'Extended brand direction across social-media and website touchpoints.',
    ],
    technologies: ['Figma', 'Brand Identity', 'Web Design'],
    sortOrder: 6,
    featuredRole: false,
    shortOutcome: 'Established brand identities and digital visual assets',
  },
];

// Verified Default Fallback Skills
export const DEFAULT_SKILLS: CmsSkill[] = [
  {
    name: 'Product Design & UI/UX',
    category: 'product_design',
    proficiency: 'expert',
    description: 'Enterprise design systems, complex SaaS topology, user research, wireframing, and Figma execution.',
    featured: true,
    sortOrder: 1,
  },
  {
    name: 'RAG & Vector Retrieval',
    category: 'ai_ml',
    proficiency: 'expert',
    description: 'Heading-aware semantic chunking, cosine retrieval in Qdrant, and dual-layer PostgreSQL verification.',
    featured: true,
    sortOrder: 2,
  },
  {
    name: 'In-Process ML Routing',
    category: 'ai_ml',
    proficiency: 'expert',
    description: 'Custom MiniLM/logistic classifiers exported to ONNX Runtime (<5ms latency on CPU).',
    featured: true,
    sortOrder: 3,
  },
  {
    name: 'Agent State Orchestration',
    category: 'ai_ml',
    proficiency: 'expert',
    description: 'LangGraph state machines, conditional edges, bounded retrieval retry, and deterministic safety overrides.',
    featured: true,
    sortOrder: 4,
  },
  {
    name: 'Full-Stack Engineering',
    category: 'frontend',
    proficiency: 'expert',
    description: 'Next.js 15 App Router, React 19, TypeScript strict mode, and Tailwind CSS neo-brutalist systems.',
    featured: true,
    sortOrder: 5,
  },
  {
    name: 'Backend & Systems',
    category: 'backend',
    proficiency: 'expert',
    description: 'FastAPI, Python 3.11, Pydantic, SQLAlchemy 2.x async, Neon PostgreSQL, and SSE streaming.',
    featured: true,
    sortOrder: 6,
  },
  {
    name: 'Evaluation & LLMOps',
    category: 'llmops',
    proficiency: 'expert',
    description: 'LangSmith tracing, Hit@K retrieval evaluation, and MLflow experiment tracking.',
    featured: true,
    sortOrder: 7,
  },
];

// Verified Default Fallback Education (Strictly matches Mahad-Career-Education-Skills-Sanity-Content.md)
export const DEFAULT_EDUCATION: CmsEducation[] = [
  {
    institution: 'Karachi Institute of Economics and Technology (KIET)',
    degree: 'Bachelor of Science in Computer Science',
    fieldOfStudy: 'Computer Science',
    graduationYear: '2026',
    recordType: 'degree',
    status: 'ongoing',
    completionLabel: 'Expected 2026',
    highlights: [
      'Focus on software engineering, data structures, algorithms, and artificial intelligence.',
    ],
  },
  {
    institution: 'DeepLearning.AI',
    degree: 'Natural Language Processing Specialization',
    fieldOfStudy: 'Artificial Intelligence & NLP',
    recordType: 'certification',
    status: 'completed',
    completionLabel: 'Completed Certification',
    highlights: [
      'Vector space models, classification, sentiment analysis, attention mechanisms, and Transformers.',
    ],
  },
  {
    institution: 'DeepLearning.AI',
    degree: 'Deep Learning Specialization',
    fieldOfStudy: 'Deep Learning & Neural Networks',
    recordType: 'certification',
    status: 'completed',
    completionLabel: 'Completed Certification',
    highlights: [
      'Neural network architectures, hyperparameter tuning, convolutional networks, and sequence models.',
    ],
  },
];

// Verified Travel Journeys Fallback (Strictly verified facts regarding Khunjerab Pass expedition)
export const DEFAULT_TRAVEL_JOURNEYS: CmsTravelJourney[] = [
  {
    title: 'The Road to Khunjerab',
    slug: 'the-road-to-khunjerab',
    subtitle: 'N-35 Karakoram Highway to the Pakistan-China Border',
    summary:
      'Mahad rode to Khunjerab Pass, one of the world’s highest paved international border crossings, on his motorcycle. An expedition through the high-altitude Karakoram mountains.',
    featured: true,
    featuredRank: 1,
    journeyStatus: 'completed',
    origin: 'Islamabad',
    destination: 'Khunjerab Pass',
    region: 'Karakoram Mountain Range',
    country: 'Pakistan',
    yearLabel: 'Documentary Field Journal',
    transportMode: 'Motorcycle Touring',
    elevation: '4,693 M',
    routeSummary:
      'Traversing the Karakoram Highway (N-35) through northern valleys to the highest paved border crossing in the world.',
    reflection:
      'Long-distance motorcycle touring teaches humility, endurance, and systems awareness. When riding through remote high-altitude terrain with zero connectivity, your preparations, hardware health, and situational judgment are all that exist.',
    challenges: [
      'Thin air and extreme altitude above 4,600 meters',
      'Cold engine starts and rapid temperature drops',
      'Zero cellular network coverage across mountain passes',
      'Unforgiving road conditions and unpredictable mountain weather',
    ],
  },
];

/**
 * Fetch all projects from Sanity with automatic fallback to static dataset.
 */
export async function getProjects(): Promise<CmsProject[]> {
  if (!isSanityConfigured()) {
    return PROJECTS as CmsProject[];
  }

  const cmsProjects = await sanityFetch<any[]>({
    query: projectsQuery,
    tags: ['project'],
    revalidate: 60,
  });

  if (!cmsProjects || cmsProjects.length === 0) {
    return PROJECTS as CmsProject[];
  }

  return cmsProjects.map((p) => ({
    slug: p.slug,
    title: p.title,
    tagline: p.subtitle || p.tagline || '',
    subtitle: p.subtitle,
    shortOutcome: p.shortOutcome,
    category: p.category,
    secondaryCategories: p.secondaryCategories,
    origin: p.origin,
    maturityStatus: p.maturityStatus,
    timeline: p.timeline,
    role: p.role,
    year: p.year,
    featured: p.featured,
    featuredRank: p.featuredRank,
    technologies: p.stack || p.technologies || [],
    summary: p.overview || p.summary || '',
    problem: p.problem || '',
    architecture: p.architecture || '',
    decisions: p.keyDecisions || p.decisions || [],
    metrics: p.metrics || [],
    liveUrl: p.liveUrl,
    githubUrl: p.githubUrl,
    heroImage: p.heroImage,
    cardImage: p.cardImage,
    architectureDiagram: p.architectureDiagram,
    targetUsers: p.targetUsers,
    responsibilities: p.responsibilities,
    constraints: p.constraints,
    productApproach: p.productApproach,
    designProcess: p.designProcess,
    engineeringApproach: p.engineeringApproach,
    tradeOffs: p.tradeOffs,
    failures: p.failures,
    completedCapabilities: p.completedCapabilities,
    plannedCapabilities: p.plannedCapabilities,
    lessonsLearned: p.lessonsLearned,
    suggestedQuestions: p.suggestedQuestions,
  }));
}

/**
 * Fetch featured projects for homepage display.
 */
export async function getFeaturedProjects(): Promise<CmsProject[]> {
  const all = await getProjects();
  const featured = all.filter((p) => p.featured);
  if (featured.length > 0) {
    return featured.sort((a, b) => (a.featuredRank || 99) - (b.featuredRank || 99));
  }
  return all.slice(0, 4);
}

/**
 * Fetch a single project by slug with fallback.
 */
export async function getProject(slug: string): Promise<CmsProject | undefined> {
  if (!isSanityConfigured()) {
    return (PROJECTS as CmsProject[]).find((p) => p.slug === slug);
  }

  const p = await sanityFetch<any>({
    query: projectBySlugQuery,
    params: { slug },
    tags: [`project:${slug}`],
    revalidate: 60,
  });

  if (!p) {
    return (PROJECTS as CmsProject[]).find((proj) => proj.slug === slug);
  }

  return {
    slug: p.slug,
    title: p.title,
    tagline: p.subtitle || p.tagline || '',
    subtitle: p.subtitle,
    shortOutcome: p.shortOutcome,
    category: p.category,
    secondaryCategories: p.secondaryCategories,
    origin: p.origin,
    maturityStatus: p.maturityStatus,
    timeline: p.timeline,
    role: p.role,
    year: p.year,
    featured: p.featured,
    featuredRank: p.featuredRank,
    technologies: p.stack || p.technologies || [],
    summary: p.overview || p.summary || '',
    problem: p.problem || '',
    architecture: p.architecture || '',
    decisions: p.keyDecisions || p.decisions || [],
    metrics: p.metrics || [],
    liveUrl: p.liveUrl,
    githubUrl: p.githubUrl,
    heroImage: p.heroImage,
    cardImage: p.cardImage,
    architectureDiagram: p.architectureDiagram,
    targetUsers: p.targetUsers,
    responsibilities: p.responsibilities,
    constraints: p.constraints,
    productApproach: p.productApproach,
    designProcess: p.designProcess,
    engineeringApproach: p.engineeringApproach,
    tradeOffs: p.tradeOffs,
    failures: p.failures,
    completedCapabilities: p.completedCapabilities,
    plannedCapabilities: p.plannedCapabilities,
    lessonsLearned: p.lessonsLearned,
    suggestedQuestions: p.suggestedQuestions,
  };
}

/**
 * Fetch case study for a project slug with fallback to static project attributes.
 */
export async function getCaseStudy(projectSlug: string): Promise<CmsCaseStudy | undefined> {
  if (isSanityConfigured()) {
    const cs = await sanityFetch<any>({
      query: caseStudyByProjectSlugQuery,
      params: { slug: projectSlug },
      tags: [`caseStudy:${projectSlug}`],
      revalidate: 60,
    });

    if (cs) {
      return {
        _id: cs._id,
        title: cs.title,
        slug: cs.slug,
        summary: cs.summary,
        contextAndProblem: cs.contextAndProblem,
        engineeringApproach: cs.engineeringApproach,
        quantitativeResults: cs.quantitativeResults,
        tradeOffsAndFailures: cs.tradeOffsAndFailures,
        lessonsLearned: cs.lessonsLearned,
      };
    }
  }

  const proj = PROJECTS.find((p) => p.slug === projectSlug);
  if (!proj) return undefined;

  return {
    title: `${proj.title} — Case Study`,
    slug: proj.slug,
    summary: proj.summary,
    contextAndProblem: proj.problem,
    engineeringApproach: proj.architecture,
    quantitativeResults: proj.metrics.map((m) => ({ metric: m.label, result: m.value })),
    tradeOffsAndFailures: null,
    lessonsLearned: proj.decisions,
  };
}

/**
 * Fetch all articles with fallback.
 */
export async function getArticles(): Promise<CmsArticle[]> {
  if (!isSanityConfigured()) {
    return ARTICLES.map((a) => ({
      slug: a.slug,
      title: a.title,
      publishedAt: a.publishedAt,
      readingTime: a.readingTime,
      summary: a.summary,
      topics: a.topics,
      content: a.content,
    }));
  }

  const cmsArticles = await sanityFetch<any[]>({
    query: articlesQuery,
    tags: ['article'],
    revalidate: 60,
  });

  if (!cmsArticles || cmsArticles.length === 0) {
    return ARTICLES.map((a) => ({
      slug: a.slug,
      title: a.title,
      publishedAt: a.publishedAt,
      readingTime: a.readingTime,
      summary: a.summary,
      topics: a.topics,
      content: a.content,
    }));
  }

  return cmsArticles.map((a) => ({
    slug: a.slug,
    title: a.title,
    publishedAt: a.publishedAt
      ? new Date(a.publishedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : 'Recent',
    readingTime: `${a.readingTime || 5} min read`,
    summary: a.excerpt || '',
    topics: a.tags || [],
    canonicalUrl: a.canonicalUrl,
    articleType: a.articleType,
    featured: a.featured,
    featuredRank: a.featuredRank,
    keyTakeaway: a.keyTakeaway,
    heroImage: a.heroImage,
  }));
}

/**
 * Fetch article by slug with fallback.
 */
export async function getArticle(slug: string): Promise<CmsArticle | undefined> {
  if (!isSanityConfigured()) {
    const fallback = ARTICLES.find((a) => a.slug === slug);
    if (!fallback) return undefined;
    return {
      slug: fallback.slug,
      title: fallback.title,
      publishedAt: fallback.publishedAt,
      readingTime: fallback.readingTime,
      summary: fallback.summary,
      topics: fallback.topics,
      content: fallback.content,
    };
  }

  const a = await sanityFetch<any>({
    query: articleBySlugQuery,
    params: { slug },
    tags: [`article:${slug}`],
    revalidate: 60,
  });

  if (!a) {
    const fallback = ARTICLES.find((art) => art.slug === slug);
    if (!fallback) return undefined;
    return {
      slug: fallback.slug,
      title: fallback.title,
      publishedAt: fallback.publishedAt,
      readingTime: fallback.readingTime,
      summary: fallback.summary,
      topics: fallback.topics,
      content: fallback.content,
    };
  }

  return {
    slug: a.slug,
    title: a.title,
    publishedAt: a.publishedAt
      ? new Date(a.publishedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : 'Recent',
    readingTime: `${a.readingTime || 5} min read`,
    summary: a.excerpt || '',
    topics: a.tags || [],
    canonicalUrl: a.canonicalUrl,
    articleType: a.articleType,
    featured: a.featured,
    featuredRank: a.featuredRank,
    keyTakeaway: a.keyTakeaway,
    sources: a.sources,
    heroImage: a.heroImage,
    body: a.body,
  };
}

/**
 * Fetch site settings with fallback.
 */
export async function getSiteSettings(): Promise<CmsSiteSettings> {
  if (!isSanityConfigured()) {
    return DEFAULT_SITE_SETTINGS;
  }

  const settings = await sanityFetch<any>({
    query: siteSettingsQuery,
    tags: ['siteSettings'],
    revalidate: 60,
  });

  if (!settings || !settings.authorName) {
    return DEFAULT_SITE_SETTINGS;
  }

  return {
    authorName: settings.authorName,
    targetRole: settings.targetRole || DEFAULT_SITE_SETTINGS.targetRole,
    heroEyebrow: settings.heroEyebrow || DEFAULT_SITE_SETTINGS.heroEyebrow,
    heroHeadline: settings.heroHeadline || DEFAULT_SITE_SETTINGS.heroHeadline,
    heroSupportingText: settings.heroSupportingText || DEFAULT_SITE_SETTINGS.heroSupportingText,
    headline: settings.headline || DEFAULT_SITE_SETTINGS.headline,
    shortBio: settings.shortBio || DEFAULT_SITE_SETTINGS.shortBio,
    location: settings.location || DEFAULT_SITE_SETTINGS.location,
    availabilityStatus: settings.availabilityStatus || DEFAULT_SITE_SETTINGS.availabilityStatus,
    availabilityLabel: settings.availabilityLabel || DEFAULT_SITE_SETTINGS.availabilityLabel,
    roleInterests: settings.roleInterests || DEFAULT_SITE_SETTINGS.roleInterests,
    email: settings.email || DEFAULT_SITE_SETTINGS.email,
    linkedinUrl: settings.linkedinUrl || DEFAULT_SITE_SETTINGS.linkedinUrl,
    githubUrl: settings.githubUrl || DEFAULT_SITE_SETTINGS.githubUrl,
    mediumUrl: settings.mediumUrl || DEFAULT_SITE_SETTINGS.mediumUrl,
    resumePdfUrl: settings.resumePdfUrl,
    avatar: settings.avatar,
    touringPhoto: settings.touringPhoto,
    personalHighlight: settings.personalHighlight || DEFAULT_SITE_SETTINGS.personalHighlight,
    homepageProofPoints: settings.homepageProofPoints || DEFAULT_SITE_SETTINGS.homepageProofPoints,
    careerNarrative: settings.careerNarrative,
    travelIntro: settings.travelIntro,
    assistantIntro: settings.assistantIntro,
  };
}

/**
 * Fetch work experiences with fallback.
 */
export async function getExperiences(): Promise<CmsExperience[]> {
  if (!isSanityConfigured()) {
    return DEFAULT_EXPERIENCES;
  }

  const exps = await sanityFetch<any[]>({
    query: experiencesQuery,
    tags: ['experience'],
    revalidate: 60,
  });

  if (!exps || exps.length === 0) {
    return DEFAULT_EXPERIENCES;
  }

  return exps;
}

/**
 * Fetch skills with fallback.
 */
export async function getSkills(): Promise<CmsSkill[]> {
  if (!isSanityConfigured()) {
    return DEFAULT_SKILLS;
  }

  const skills = await sanityFetch<any[]>({
    query: skillsQuery,
    tags: ['skill'],
    revalidate: 60,
  });

  if (!skills || skills.length === 0) {
    return DEFAULT_SKILLS;
  }

  return skills;
}

/**
 * Fetch educations with fallback.
 */
export async function getEducation(): Promise<CmsEducation[]> {
  if (!isSanityConfigured()) {
    return DEFAULT_EDUCATION;
  }

  const edus = await sanityFetch<any[]>({
    query: educationsQuery,
    tags: ['education'],
    revalidate: 60,
  });

  if (!edus || edus.length === 0) {
    return DEFAULT_EDUCATION;
  }

  return edus;
}

/**
 * Fetch travel journeys with fallback.
 */
export async function getTravelJourneys(): Promise<CmsTravelJourney[]> {
  if (!isSanityConfigured()) {
    return DEFAULT_TRAVEL_JOURNEYS;
  }

  const journeys = await sanityFetch<any[]>({
    query: travelJourneysQuery,
    tags: ['travelJourney'],
    revalidate: 60,
  });

  if (!journeys || journeys.length === 0) {
    return DEFAULT_TRAVEL_JOURNEYS;
  }

  return journeys;
}

/**
 * Fetch a single travel journey by slug.
 */
export async function getTravelJourney(slug: string): Promise<CmsTravelJourney | undefined> {
  if (!isSanityConfigured()) {
    return DEFAULT_TRAVEL_JOURNEYS.find((j) => j.slug === slug);
  }

  const journey = await sanityFetch<any>({
    query: travelJourneyBySlugQuery,
    params: { slug },
    tags: [`travelJourney:${slug}`],
    revalidate: 60,
  });

  if (!journey) {
    return DEFAULT_TRAVEL_JOURNEYS.find((j) => j.slug === slug);
  }

  return journey;
}
