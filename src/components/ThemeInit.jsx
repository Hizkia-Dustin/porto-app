"use client";

export default function ThemeInit() {
  return <script
    type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
    suppressHydrationWarning
    dangerouslySetInnerHTML={{ __html: `try{document.documentElement.dataset.theme=localStorage.getItem('hz-theme')==='light'?'light':'dark'}catch{}` }}
  />;
}
