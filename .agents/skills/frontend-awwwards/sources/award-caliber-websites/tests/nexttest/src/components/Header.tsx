'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { site } from '@/data/site';

const nav = [{ href: '/work/harbor-lights/', label: 'Work' }];

export function Header() {
  const path = usePathname();
  return (
    <header className="frame">
      <Link href="/">{site.name}</Link>
      <nav aria-label="Main">
        {nav.map((n) => (
          <Link key={n.href} href={n.href} aria-current={path.startsWith(n.href) ? 'page' : undefined}>{n.label}</Link>
        ))}
      </nav>
    </header>
  );
}
