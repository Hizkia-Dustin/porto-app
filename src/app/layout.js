import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-body", subsets: ["latin"], display: "swap" });
const cormorant = Cormorant_Garamond({
  variable: "--font-editorial", subsets: ["latin"],
  weight: ["400", "500"], style: ["normal", "italic"], display: "swap",
});

export const metadata = {
  title: "Ideas in Motion — A Personal Edition",
  description: "A dialogue between art and technology. Step inside a Renaissance-inspired creative portfolio.",
};

export default function RootLayout({ children }) {
  return <html lang="en" className={`${inter.variable} ${cormorant.variable}`}><body>{children}</body></html>;
}
