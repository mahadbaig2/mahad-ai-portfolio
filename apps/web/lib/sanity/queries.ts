import { groq } from 'next-sanity';

/**
 * GROQ query to retrieve all published projects for Work index and Home.
 */
export const projectsQuery = groq`
  *[_type == "project" && (publishStatus == "published" || !defined(publishStatus))] | order(featuredRank asc, year desc, _createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    subtitle,
    shortOutcome,
    clientOrOrg,
    year,
    timeline,
    role,
    category,
    secondaryCategories,
    origin,
    maturityStatus,
    featured,
    featuredRank,
    heroImage,
    cardImage,
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
 * GROQ query to retrieve explicitly featured projects for Homepage.
 */
export const featuredProjectsQuery = groq`
  *[_type == "project" && featured == true && (publishStatus == "published" || !defined(publishStatus))] | order(featuredRank asc, year desc) {
    _id,
    title,
    "slug": slug.current,
    subtitle,
    shortOutcome,
    clientOrOrg,
    year,
    role,
    category,
    origin,
    maturityStatus,
    featured,
    featuredRank,
    heroImage,
    cardImage,
    overview,
    architectureDiagram,
    metrics,
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
    shortOutcome,
    clientOrOrg,
    year,
    timeline,
    role,
    category,
    secondaryCategories,
    origin,
    maturityStatus,
    featured,
    featuredRank,
    heroImage,
    cardImage,
    overview,
    architectureDiagram,
    targetUsers,
    responsibilities,
    constraints,
    productApproach,
    designProcess,
    engineeringApproach,
    metrics,
    keyDecisions,
    tradeOffs,
    failures,
    completedCapabilities,
    plannedCapabilities,
    lessonsLearned,
    suggestedQuestions,
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
  *[_type == "article" && (publishStatus == "published" || !defined(publishStatus))] | order(featuredRank asc, publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    readingTime,
    canonicalUrl,
    articleType,
    featured,
    featuredRank,
    keyTakeaway,
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
    articleType,
    featured,
    featuredRank,
    keyTakeaway,
    sources,
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
  *[_type == "experience" && (publishStatus == "published" || !defined(publishStatus))] | order(sortOrder asc, startDate desc) {
    _id,
    company,
    role,
    employmentType,
    sortOrder,
    featuredRole,
    shortOutcome,
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
    recordType,
    status,
    completionLabel,
    graduationYear,
    credentialUrl,
    highlights
  }
`;

/**
 * GROQ query to retrieve categorized technical skills.
 */
export const skillsQuery = groq`
  *[_type == "skill" && (publishStatus == "published" || !defined(publishStatus))] | order(sortOrder asc, category asc, name asc) {
    _id,
    name,
    category,
    proficiency,
    description,
    featured,
    sortOrder
  }
`;

/**
 * GROQ query to retrieve site-wide settings singleton and verified résumé asset.
 */
export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0] {
    authorName,
    targetRole,
    heroEyebrow,
    heroHeadline,
    heroSupportingText,
    headline,
    shortBio,
    location,
    availabilityStatus,
    availabilityLabel,
    roleInterests,
    avatar,
    touringPhoto,
    personalHighlight,
    homepageProofPoints,
    careerNarrative,
    travelIntro,
    assistantIntro,
    email,
    linkedinUrl,
    githubUrl,
    mediumUrl,
    "resumePdfUrl": resumePdf.asset->url
  }
`;

/**
 * GROQ query to retrieve travel journeys and expeditions.
 */
export const travelJourneysQuery = groq`
  *[_type == "travelJourney" && (publishStatus == "published" || !defined(publishStatus))] | order(featuredRank asc, _createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    subtitle,
    summary,
    heroImage,
    featured,
    featuredRank,
    journeyStatus,
    origin,
    destination,
    region,
    country,
    yearLabel,
    transportMode,
    motorcycle,
    elevation,
    distance,
    routeSummary,
    gallery
  }
`;

/**
 * GROQ query to retrieve a single travel journey by slug.
 */
export const travelJourneyBySlugQuery = groq`
  *[_type == "travelJourney" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    subtitle,
    summary,
    heroImage,
    featured,
    featuredRank,
    journeyStatus,
    origin,
    destination,
    region,
    country,
    startDate,
    endDate,
    yearLabel,
    transportMode,
    motorcycle,
    elevation,
    distance,
    routeSummary,
    story,
    challenges,
    reflection,
    gallery
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

