import type { StructureResolver, StructureBuilder, ListItemBuilder } from 'sanity/structure';

export const deskStructure: StructureResolver = (S: StructureBuilder) =>
  S.list()
    .title('Content Studio')
    .items([
      // Singleton: Site Settings
      S.listItem()
        .title('Site Settings & Profile')
        .id('siteSettingsListItem')
        .child(
          S.editor()
            .id('siteSettings')
            .schemaType('siteSettings')
            .documentId('siteSettings')
            .title('Site Settings & Profile')
        ),

      S.divider(),

      // Work & Editorial
      S.listItem()
        .title('Work & Editorial')
        .child(
          S.list()
            .title('Work & Editorial')
            .items([
              S.documentTypeListItem('project').title('Projects'),
              S.documentTypeListItem('caseStudy').title('Case Studies'),
              S.documentTypeListItem('article').title('Articles & Notes'),
            ])
        ),

      // Career & Background
      S.listItem()
        .title('Career & Background')
        .child(
          S.list()
            .title('Career & Background')
            .items([
              S.documentTypeListItem('experience').title('Experience'),
              S.documentTypeListItem('education').title('Education & Certifications'),
              S.documentTypeListItem('skill').title('Skills & Competencies'),
            ])
        ),

      // Knowledge Base & RAG Index
      S.listItem()
        .title('Knowledge Base & RAG')
        .child(
          S.list()
            .title('Knowledge Base & Assistant Sources')
            .items([
              S.documentTypeListItem('architectureDecision').title('Architecture Decision Records (ADRs)'),
              S.documentTypeListItem('faq').title('FAQs'),
              S.documentTypeListItem('styleExample').title('Voice & Style Exemplars'),
              S.documentTypeListItem('personalStory').title('Personal Stories & Narrative'),
            ])
        ),

      S.divider(),

      // Remaining document types (fallback for any unlisted items)
      ...S.documentTypeListItems().filter(
        (listItem: ListItemBuilder) =>
          ![
            'siteSettings',
            'project',
            'caseStudy',
            'article',
            'experience',
            'education',
            'skill',
            'architectureDecision',
            'faq',
            'styleExample',
            'personalStory',
          ].includes(listItem.getId() || '')
      ),
    ]);
