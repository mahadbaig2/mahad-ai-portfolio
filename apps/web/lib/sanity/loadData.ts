import { sanityFetch, isSanityConfigured } from './client';
import {
  projectsQuery,
  projectBySlugQuery,
  caseStudyByProjectSlugQuery,
  articlesQuery,
  articleBySlugQuery,
  experiencesQuery,
  educationsQuery,
  skillsQuery,
  siteSettingsQuery,
  faqsQuery,
} from './queries';
import { PROJECTS, ARTICLES, type Project, type Article } from '@/lib/data';

export interface CmsProject extends Project {
  heroImage?: any;
  architectureDiagram?: any;
  overview?: string;
  subtitle?: string;
  stack?: string[];
  keyDecisions?: string[];
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
}

export interface CmsEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationYear: string;
  highlights?: string[];
}

export interface CmsSkill {
  name: string;
  category: string;
  proficiency: string;
  description?: string;
  featured?: boolean;
}

export interface CmsSiteSettings {
  authorName: string;
  targetRole: string;
  headline: string;
  shortBio: string;
  location: string;
  email: string;
  linkedinUrl: string;
  githubUrl: string;
  mediumUrl: string;
  resumePdfUrl?: string;
  avatar?: any;
}

// Default Fallback Site Settings
export const DEFAULT_SITE_SETTINGS: CmsSiteSettings = {
  authorName: 'Mahad Baig',
  targetRole: 'AI Product Engineer',
  headline:
    'AI Product Engineer specializing in grounded RAG systems, in-process ML query routing, and deterministic agent orchestration on budget-constrained architectures.',
  shortBio:
    "I design and build production-grade AI systems with inspectable architectures, strictly verifiable citations, bounded latency, and zero-dollar operating overhead.",
  location: 'Remote / Karachi, Pakistan',
  email: 'mahadmirza681@gmail.com',
  linkedinUrl: 'https://linkedin.com/in/mahadbaig',
  githubUrl: 'https://github.com/mahadbaig2',
  mediumUrl: 'https://medium.com/@mirza.mahad',
  resumePdfUrl: undefined,
};

// Default Fallback Experience
export const DEFAULT_EXPERIENCES: CmsExperience[] = [
  {
    company: 'Independent AI Product Engineering',
    role: 'AI Product Engineer & Systems Architect',
    startDate: '2024-01',
    isCurrent: true,
    location: 'Remote',
    summary:
      'Designing and deploying demonstrable AI architectures, in-process ONNX query routing, and verifiable retrieval pipelines on capped cloud infrastructure.',
    highlights: [
      'Engineered an in-process ML intent router achieving sub-5ms classification latency on CPU without LLM overhead.',
      'Designed dual-persistence RAG architecture with Neon PostgreSQL and Qdrant vector index.',
      'Configured automated CI regression gates evaluating Hit@K and citation precision.',
    ],
    technologies: ['Next.js 15', 'FastAPI', 'LangGraph', 'Qdrant', 'Neon', 'ONNX Runtime', 'Python'],
  },
  {
    company: 'Enterprise Software & Systems',
    role: 'Software Engineer',
    startDate: '2022-06',
    endDate: '2023-12',
    isCurrent: false,
    location: 'Karachi, Pakistan',
    summary:
      'Built scalable web applications, RESTful APIs, and relational database architectures with high test coverage and strict type safety.',
    highlights: [
      'Developed high-throughput API services handling millions of monthly requests.',
      'Engineered accessible frontend interfaces compliant with WCAG 2.1 AA standards.',
      'Reduced API response times by 35% through query optimization and caching layers.',
    ],
    technologies: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'Tailwind CSS'],
  },
];

// Default Fallback Skills
export const DEFAULT_SKILLS: CmsSkill[] = [
  {
    name: 'RAG & Vector Retrieval',
    category: 'ai_ml',
    proficiency: 'expert',
    description: 'Heading-aware semantic chunking, cosine retrieval, and blue/green collection versioning.',
    featured: true,
  },
  {
    name: 'In-Process ML Routing',
    category: 'ai_ml',
    proficiency: 'expert',
    description: 'Training compact classifiers and serving via ONNX Runtime (<5ms latency).',
    featured: true,
  },
  {
    name: 'Agent State Orchestration',
    category: 'ai_ml',
    proficiency: 'expert',
    description: 'LangGraph conditional execution graphs with bounded retry and recursion controls.',
    featured: true,
  },
  {
    name: 'Full-Stack Architecture',
    category: 'frontend',
    proficiency: 'expert',
    description: 'Next.js App Router, strict TypeScript, React Server Components, and Tailwind CSS.',
    featured: true,
  },
  {
    name: 'Backend & Systems',
    category: 'backend',
    proficiency: 'expert',
    description: 'FastAPI, SQLAlchemy 2.x async, Neon PostgreSQL, and structured JSON telemetry.',
    featured: true,
  },
  {
    name: 'LLMOps & Evaluation',
    category: 'llmops',
    proficiency: 'expert',
    description: 'Automated retrieval metrics (Hit@K, MRR) with LangSmith and MLflow lifecycle tracking.',
    featured: true,
  },
];

// Default Fallback Education
export const DEFAULT_EDUCATION: CmsEducation[] = [
  {
    institution: 'University Computer Science Program',
    degree: 'Bachelor of Science',
    fieldOfStudy: 'Computer Science',
    graduationYear: '2024',
    highlights: [
      'Focus on Distributed Systems, Applied Machine Learning, and Software Architecture.',
      'Graduated with distinction; capstone project on semantic search optimization.',
    ],
  },
];

/**
 * Fetch all projects from Sanity with automatic fallback to static dataset.
 */
export async function getProjects(): Promise<CmsProject[]> {
  if (!isSanityConfigured()) {
    return PROJECTS;
  }

  const cmsProjects = await sanityFetch<any[]>({
    query: projectsQuery,
    tags: ['project'],
    revalidate: 60,
  });

  if (!cmsProjects || cmsProjects.length === 0) {
    return PROJECTS;
  }

  return cmsProjects.map((p) => ({
    slug: p.slug,
    title: p.title,
    tagline: p.subtitle || p.tagline || '',
    role: p.role,
    year: p.year,
    technologies: p.stack || p.technologies || [],
    summary: p.overview || p.summary || '',
    problem: p.problem || '',
    architecture: p.architecture || '',
    decisions: p.keyDecisions || p.decisions || [],
    metrics: p.metrics || [],
    liveUrl: p.liveUrl,
    githubUrl: p.githubUrl,
    heroImage: p.heroImage,
    architectureDiagram: p.architectureDiagram,
  }));
}

/**
 * Fetch a single project by slug with fallback.
 */
export async function getProject(slug: string): Promise<CmsProject | undefined> {
  if (!isSanityConfigured()) {
    return PROJECTS.find((p) => p.slug === slug);
  }

  const p = await sanityFetch<any>({
    query: projectBySlugQuery,
    params: { slug },
    tags: [`project:${slug}`],
    revalidate: 60,
  });

  if (!p) {
    return PROJECTS.find((proj) => proj.slug === slug);
  }

  return {
    slug: p.slug,
    title: p.title,
    tagline: p.subtitle || p.tagline || '',
    role: p.role,
    year: p.year,
    technologies: p.stack || p.technologies || [],
    summary: p.overview || p.summary || '',
    problem: p.problem || '',
    architecture: p.architecture || '',
    decisions: p.keyDecisions || p.decisions || [],
    metrics: p.metrics || [],
    liveUrl: p.liveUrl,
    githubUrl: p.githubUrl,
    heroImage: p.heroImage,
    architectureDiagram: p.architectureDiagram,
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

  // Fallback to static project content
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
    headline: settings.headline || DEFAULT_SITE_SETTINGS.headline,
    shortBio: settings.shortBio || DEFAULT_SITE_SETTINGS.shortBio,
    location: settings.location || DEFAULT_SITE_SETTINGS.location,
    email: settings.email || DEFAULT_SITE_SETTINGS.email,
    linkedinUrl: settings.linkedinUrl || DEFAULT_SITE_SETTINGS.linkedinUrl,
    githubUrl: settings.githubUrl || DEFAULT_SITE_SETTINGS.githubUrl,
    mediumUrl: settings.mediumUrl || DEFAULT_SITE_SETTINGS.mediumUrl,
    resumePdfUrl: settings.resumePdfUrl,
    avatar: settings.avatar,
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
