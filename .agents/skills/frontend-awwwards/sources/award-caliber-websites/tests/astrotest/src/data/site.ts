// SINGLE SOURCE OF CONTENT. Every visible string and project lives here so the owner can swap
// in real material without touching markup. Mark anything invented with `placeholder: true`.
export type Project = {
  slug: string;
  title: string;
  client: string;
  year: number;
  role: string[];
  summary: string; // one sentence, what changed for whom
  cover: { src?: string; alt: string; seed: number }; // no src → procedural cover from the palette
  body: { heading: string; text: string }[];
  placeholder?: boolean;
};

export const site = {
  name: 'Name Surname',
  role: 'Designer & developer',
  url: 'https://example.com',
  description: 'One plain sentence about what this person makes and for whom.',
  email: 'hello@example.com',
  location: 'City, Country',
  socials: [
    { label: 'GitHub', href: 'https://github.com/' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/' },
  ],
  // Palette used by procedural GL covers: [deep, mid, light/accent]. Keep in sync with tokens.css.
  glPalette: ['#101010', '#6b6b6b', '#f2f2f2'] as [string, string, string],
};

export const projects: Project[] = [
  {
    slug: 'first-project',
    title: 'First Project',
    client: 'Client',
    year: 2026,
    role: ['Art direction', 'Development'],
    summary: 'What was made, for whom, and what changed because of it.',
    cover: { alt: 'Generative cover for First Project', seed: 1.3 },
    body: [{ heading: 'Context', text: 'Replace with the real story.' }],
    placeholder: true,
  },
  {
    slug: 'second-project',
    title: 'Second Project',
    client: 'Client',
    year: 2025,
    role: ['Interaction design'],
    summary: 'What was made, for whom, and what changed because of it.',
    cover: { alt: 'Generative cover for Second Project', seed: 4.7 },
    body: [{ heading: 'Context', text: 'Replace with the real story.' }],
    placeholder: true,
  },
];
