export type ShowcaseItem = { title: string; slug?: string; line: string; kind: 'Production systems' | 'Side projects & playground'; image: string };

// Placeholder entries carry no unverified outcomes or production claims.
export const SHOWCASE: ShowcaseItem[] = [
  { title: 'Busyfile', slug: 'busyfile', line: 'A white-label accounting platform spanning client, firm and operations workflows.', kind: 'Production systems', image: '01' },
  { title: 'Aurus Books', slug: 'aurus-books', line: 'An accounting SaaS MVP design.', kind: 'Side projects & playground', image: '02' },
  { title: 'LISPINE', slug: 'lispine-healthcare-website', line: 'A clearer digital experience for spine-care patients.', kind: 'Production systems', image: '03' },
  { title: 'AQL', slug: 'aql-enterprise-ai-workspace', line: 'An enterprise AI workspace concept.', kind: 'Side projects & playground', image: '04' },
  { title: 'CardioScan AI', slug: 'cardioscan-ai', line: 'An applied AI product case study.', kind: 'Side projects & playground', image: '05' },
  { title: 'Verdict AI', slug: 'verdict-ai', line: 'A legal AI product case study.', kind: 'Side projects & playground', image: '06' },
  { title: 'Legal AI', slug: 'legal-ai', line: 'A retrieval-based assistant for understanding contracts.', kind: 'Side projects & playground', image: '12' },
  { title: 'Talk to Mahad', slug: 'talk-to-mahad', line: 'An inspectable assistant designed for grounded answers.', kind: 'Side projects & playground', image: '07' },
  { title: 'Evzino', slug: 'evzino', line: 'A connected fitness experience for members and coaches.', kind: 'Side projects & playground', image: '08' },
  { title: 'Freqtrade', slug: 'freqtrade', line: 'Strategy testing, paper trading and automation.', kind: 'Side projects & playground', image: '09' },
  { title: 'Marketing OS', slug: 'marketing-os', line: 'Growth intelligence and an AI ad lab across products.', kind: 'Side projects & playground', image: '10' },
  { title: 'Alder Legal', slug: 'alder-legal', line: 'A mock-data demonstration of a legal operations pilot.', kind: 'Side projects & playground', image: '11' },
];
