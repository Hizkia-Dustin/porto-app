// Same Project shape as references/content.md, so the generated examples type-check against it.
export type Project = {
  slug: string;
  title: string;
  client: string;
  year: number;
  role: string[];
  summary: string;
  cover: { src?: string; alt: string; seed: number }; // no src → procedural cover from the palette
  body: { heading: string; text: string }[];
  placeholder?: boolean;
};

export const site = {
  name: 'Engine Test',
  role: 'Adapter validation build',
  url: 'https://engine-test.dev',
  description: 'A validation build for the Next.js adapter of the motion engine, covering transitions, reveals and WebGL planes.',
  email: 'hello@engine-test.dev',
  glPalette: ['#101010', '#6b6b6b', '#f2f2f2'] as [string, string, string],
};

// One image cover and one procedural cover, so both branches of the case page are built.
export const projects: Project[] = [
  {
    slug: 'harbor-lights',
    title: 'Harbor Lights',
    client: 'Ferry operator',
    year: 2026,
    role: ['Art direction', 'Development'],
    summary: 'A timetable site rebuilt around the tide.',
    cover: { src: '/img/a.jpg', alt: 'A valley under low clouds', seed: 1.3 },
    body: [{ heading: 'Context', text: 'Fixture content for the page transition test.' }],
    placeholder: true,
  },
  {
    slug: 'small-rooms',
    title: 'Atlas of Small Rooms',
    client: 'Architecture studio',
    year: 2025,
    role: ['Interaction design'],
    summary: 'An archive of small interiors, browsable by room.',
    cover: { alt: 'Generative cover for Atlas of Small Rooms', seed: 4.7 },
    body: [{ heading: 'Context', text: 'Fixture content for the procedural cover.' }],
    placeholder: true,
  },
];
