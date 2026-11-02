import Link from 'next/link';

export default function NotFound() {
  return (
    <section style={{ minHeight: '100svh', display: 'grid', placeContent: 'center', gap: '1rem', textAlign: 'center' }}>
      <h1 data-split="chars" data-intro style={{ fontSize: 'var(--t-mega)', lineHeight: 0.85 }}>404</h1>
      <p>This page does not exist. <Link href="/" style={{ textDecoration: 'underline' }}>Back to the index</Link>.</p>
    </section>
  );
}
