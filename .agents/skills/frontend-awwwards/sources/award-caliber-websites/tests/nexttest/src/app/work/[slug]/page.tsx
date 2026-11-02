import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { projects, site } from '@/data/site';

export const dynamicParams = false;
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({ params }: PageProps<'/work/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  return p ? { title: p.title, description: `${p.title} (${p.year}): a case study page used to validate page transitions and the enter animation.` } : {};
}

export default async function Work({ params }: PageProps<'/work/[slug]'>) {
  const { slug } = await params;
  const i = projects.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  const p = projects[i];
  const next = projects[(i + 1) % projects.length];
  return (
    <article style={{ padding: '18vh var(--gutter)', display: 'grid', gap: '8vh' }}>
      <h1 data-split="lines" data-intro style={{ fontSize: 'var(--t-xl)', lineHeight: 0.9 }}>{p.title}</h1>
      {p.cover.src ? (
        <figure data-gl data-gl-instant style={{ aspectRatio: '16 / 9' }}>
          <Image src={p.cover.src} alt={p.cover.alt} width={1600} height={1067} loading="eager" fetchPriority="high" sizes="100vw" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </figure>
      ) : (
        <figure data-gl="procedural" data-gl-instant data-seed={p.cover.seed} data-colors={site.glPalette.join(',')} style={{ aspectRatio: '16 / 9' }}>
          <div className="gl-fallback" role="img" aria-label={p.cover.alt} />
        </figure>
      )}
      <p data-split="lines" style={{ maxWidth: '40ch', fontSize: 'var(--t-m)' }}>
        The case page enters behind the curtain, plays its own intro, and reverts cleanly when you leave it again.
      </p>
      <Link href={`/work/${next.slug}/`} style={{ fontSize: 'var(--t-l)' }}>Next project: {next.title}</Link>
    </article>
  );
}
