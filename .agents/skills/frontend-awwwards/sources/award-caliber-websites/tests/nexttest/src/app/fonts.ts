import { Archivo } from 'next/font/google';
import localFont from 'next/font/local';

// Google families: next/font/google self-hosts them at build time.
export const display = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-display', display: 'swap' });

// Fontshare (or licensed files): download with `font.mjs ... --next`, which prints this block.
export const text = localFont({
  src: [
    { path: '../fonts/satoshi-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/satoshi-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-text',
  display: 'swap',
});
