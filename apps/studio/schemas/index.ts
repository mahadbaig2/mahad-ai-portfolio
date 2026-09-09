import { blockContent } from './blockContent';
import { project } from './project';
import { caseStudy } from './caseStudy';
import { article } from './article';
import { experience } from './experience';
import { education } from './education';
import { skill } from './skill';
import { faq } from './faq';
import { architectureDecision } from './architectureDecision';
import { personalStory } from './personalStory';
import { styleExample } from './styleExample';
import { siteSettings } from './siteSettings';

export const schemaTypes = [
  // Common & Objects
  blockContent,

  // Documents
  project,
  caseStudy,
  article,
  experience,
  education,
  skill,
  faq,
  architectureDecision,
  personalStory,
  styleExample,
  siteSettings,
];
