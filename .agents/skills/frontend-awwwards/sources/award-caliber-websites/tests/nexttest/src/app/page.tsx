import Image from 'next/image';
import Link from 'next/link';
import { projects, site } from '@/data/site';
import { Marquee } from '@/components/Marquee';

export default function Home() {
  return (
    <>
      <section style={{ minHeight: '100svh', display: 'grid', alignContent: 'end', padding: 'var(--gutter)' }}>
        <h1 data-split="chars" data-intro style={{ fontFamily: 'var(--f-display)', fontSize: 'var(--t-mega)', lineHeight: 0.85, letterSpacing: '-0.04em' }}>{site.name}</h1>
        <p data-split="lines" data-intro data-delay="0.3" style={{ maxWidth: '36ch', fontSize: 'var(--t-m)' }}>
          This page checks that reveals, the loader, the curtain and WebGL planes work inside the Next.js App Router.
        </p>
      </section>
      <Marquee text="Selected work and experiments, 2024 to 2026." />
      <section style={{ padding: '20vh var(--gutter)', display: 'grid', gap: '10vh' }}>
        <h2 data-split="lines" style={{ fontSize: 'var(--t-xl)' }}>Selected work</h2>
        {projects.map((p) => (
          <Link key={p.slug} href={`/work/${p.slug}/`} data-cursor="Open" style={{ display: 'grid', gap: '1rem', maxWidth: '60rem' }}>
            {p.cover.src ? (
              <figure data-gl style={{ aspectRatio: '3 / 2', overflow: 'clip' }}>
                <Image src={p.cover.src} alt={p.cover.alt} width={1600} height={1067} sizes="(max-width: 768px) 100vw, 60rem" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </figure>
            ) : (
              <figure data-gl="procedural" data-seed={p.cover.seed} data-colors={site.glPalette.join(',')} style={{ aspectRatio: '3 / 2', overflow: 'clip' }}>
                <div className="gl-fallback" role="img" aria-label={p.cover.alt} />
              </figure>
            )}
            <span style={{ fontSize: 'var(--t-l)' }}>{p.title}, {p.year}</span>
          </Link>
        ))}
        <figure data-gl="procedural" data-seed="2.4" data-colors="#101010,#6b6b6b,#f2f2f2" style={{ aspectRatio: '16 / 9' }}>
          <div className="gl-fallback" role="img" aria-label="Generative cover in the site palette" />
        </figure>
        <p data-reveal="up" style={{ maxWidth: '50ch' }}>
          Write to <a href={`mailto:${site.email}`} style={{ textDecoration: 'underline' }}>{site.email}</a> for anything else. External links and mail links skip the page transition.
        </p>
      </section>
    </>
  );
}
