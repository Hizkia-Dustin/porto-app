import { IBM_Plex_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});
const bagke = localFont({
  src: "../../public/fonts/BagkeMere-Regular.otf",
  variable: "--font-bagke",
  display: "swap",
});

export const metadata = {
  title: "HZ — UI/UX Enthusiast",
  description: "Hizkia Dustin. UI/UX enthusiast. Learn from everywhere.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${mono.variable} ${bagke.variable}`}>
      <body>{children}</body>
    </html>
  );
}
