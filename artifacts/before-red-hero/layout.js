import { Anton, Cormorant_Garamond, IBM_Plex_Mono, Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({ variable: "--font-body", subsets: ["latin"], display: "swap" });
const mono = IBM_Plex_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500", "700"], display: "swap" });
const anton = Anton({ variable: "--font-anton", subsets: ["latin"], weight: "400", display: "swap" });
const coluna = localFont({ src: "../../public/fonts/Coluna.otf", variable: "--font-coluna", display: "swap" });
const colunaRounded = localFont({ src: "../../public/fonts/Coluna_Rounded.otf", variable: "--font-coluna-rounded", display: "swap" });
const cormorant = Cormorant_Garamond({
  variable: "--font-editorial",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});
const strataMagic = localFont({
  src: "../../public/fonts/strata-magic.regular.ttf",
  variable: "--font-strata",
  display: "swap",
});

export const metadata = {
  title: "Hizkia Dustin — The Digital Codex",
  description: "Frontend & Interaction Specialist. Hizkia Dustin’s portfolio of frontend development, interaction design, educational platforms, WebGIS, and institutional information systems.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${inter.variable} ${cormorant.variable} ${strataMagic.variable} ${mono.variable} ${anton.variable} ${coluna.variable} ${colunaRounded.variable}`}>
      <body>{children}</body>
    </html>
  );
}
