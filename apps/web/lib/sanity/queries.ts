import { groq } from 'next-sanity';

/**
 * GROQ query to retrieve all published projects for Work index and Home.
 */
export const projectsQuery = groq`
  *[_type == "project" && (publishStatus == "published" || !defined(publishStatus))] | order(year desc, _createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    subtitle,
    clientOrOrg,
    year,
    role,
    featured,
    heroImage,
    overview,
    architectureDiagram,
    metrics,
    keyDecisions,
    stack,
    liveUrl,
    githubUrl,
    canonicalPath
  }
`;

/**
 * GROQ query to retrieve a single project by its slug.
 */
export const projectBySlugQuery = groq`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    subtitle,
    clientOrOrg,
    year,
    role,
    featured,
    heroImage,
    overview,
    architectureDiagram,
    metrics,
    keyDecisions,
    stack,
    liveUrl,
    githubUrl,
    canonicalPath
  }
`;

/**
 * GROQ query to retrieve the deep case study for a given project slug.
 */
export const caseStudyByProjectSlugQuery = groq`
  *[_type == "caseStudy" && project->slug.current == $slug && (publishStatus == "published" || !defined(publishStatus))][0] {
    _id,
    title,
    "slug": slug.current,
    summary,
    contextAndProblem,
    engineeringApproach,
    quantitativeResults,
    tradeOffsAndFailures,
    lessonsLearned
  }
`;

/**
 * GROQ query to retrieve all published articles.
 */
export const articlesQuery = groq`
  *[_type == "article" && (publishStatus == "published" || !defined(publishStatus))] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    readingTime,
    canonicalUrl,
    tags,
    excerpt,
    heroImage
  }
`;

/**
 * GROQ query to retrieve a full article by its slug.
 */
export const articleBySlugQuery = groq`
  *[_type == "article" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    readingTime,
    canonicalUrl,
    tags,
    excerpt,
    heroImage,
    body
  }
`;

/**
 * GROQ query to retrieve work experience.
 */
export const experiencesQuery = groq`
  *[_type == "experience" && (publishStatus == "published" || !defined(publishStatus))] | order(startDate desc) {
    _id,
    company,
    role,
    employmentType,
    startDate,
    endDate,
    isCurrent,
    location,
    summary,
    highlights,
    technologies
  }
`;

/**
 * GROQ query to retrieve education records.
 */
export const educationsQuery = groq`
  *[_type == "education" && (publishStatus == "published" || !defined(publishStatus))] | order(graduationYear desc) {
    _id,
    institution,
    degree,
    fieldOfStudy,
    graduationYear,
    highlights
  }
`;

/**
 * GROQ query to retrieve categorized technical skills.
 */
export const skillsQuery = groq`
  *[_type == "skill" && (publishStatus == "published" || !defined(publishStatus))] | order(category asc, name asc) {
    _id,
    name,
    category,
    proficiency,
    description,
    featured
  }
`;

/**
 * GROQ query to retrieve site-wide settings singleton and verified résumé asset.
 */
export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0] {
    authorName,
    targetRole,
    headline,
    shortBio,
    location,
    avatar,
    email,
    linkedinUrl,
    githubUrl,
    mediumUrl,
    "resumePdfUrl": resumePdf.asset->url
  }
`;

/**
 * GROQ query to retrieve FAQs.
 */
export const faqsQuery = groq`
  *[_type == "faq" && (publishStatus == "published" || !defined(publishStatus))] | order(priority asc) {
    _id,
    question,
    answer,
    category
  }
`;
