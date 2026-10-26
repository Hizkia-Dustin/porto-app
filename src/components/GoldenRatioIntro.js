"use client";

import { useEffect, useRef, useState } from "react";
import "./GoldenRatioIntro.css";

/** A short opening on each page mount, including refresh. */
export default function GoldenRatioIntro({ children }) {
  const [dismissed, setDismissed] = useState(false);
  const content = useRef(null);
  const skip = useRef(null);

  useEffect(() => {
    if (dismissed) {
      // Re-align the chapter after the opening releases its scroll lock.
      if (window.location.hash !== "#work") return;
      const frame = requestAnimationFrame(() => {
        content.current?.querySelector('nav a[href="#work"]')?.click();
      });
      return () => cancelAnimationFrame(frame);
    }
    const page = content.current;
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    const previousGutter = html.style.scrollbarGutter;

    if (page) page.inert = true;
    html.style.scrollbarGutter = "stable";
    html.style.overflow = "hidden";

    const finish = () => {
      setDismissed(true);
      if (page) page.inert = false;
      html.style.overflow = previousOverflow;
      html.style.scrollbarGutter = previousGutter;
      window.dispatchEvent(new Event("resize"));
    };

    const timer = window.setTimeout(finish, 3400);
    const onKey = (event) => { if (event.key === "Escape") finish(); };
    window.addEventListener("keydown", onKey);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
      if (page) page.inert = false;
      html.style.overflow = previousOverflow;
      html.style.scrollbarGutter = previousGutter;
      window.dispatchEvent(new Event("resize"));
    };
  }, [dismissed]);

  function dismiss() {
    const restoreFocus = document.activeElement === skip.current;
    setDismissed(true);
    if (content.current) {
      content.current.inert = false;
      if (restoreFocus) {
        content.current.focus({ preventScroll: true });
      }
    }
    const html = document.documentElement;
    html.style.overflow = "";
    html.style.scrollbarGutter = "";
    window.dispatchEvent(new Event("resize"));
  }

  return (
    <>
      {!dismissed && (
        <div
          className="golden-intro-intro"
          data-golden-intro=""
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget) dismiss();
          }}
        >
          <div className="golden-intro-topline">
            <span className="golden-intro-brand">
              Ideas in Motion<span>A personal edition</span>
            </span>
            <span className="golden-intro-index">FORM / FEELING / POSSIBILITY</span>
          </div>

          <div className="golden-intro-composition" aria-hidden="true">
            <svg className="golden-intro-drawing" viewBox="0 0 1000 700" fill="none">
              <g className="golden-intro-guides">
                <path pathLength="1" d="M0 110H1000 M0 590H1000 M110 0V700 M890 0V700" />
                <path pathLength="1" d="M110 110L890 590 M110 590L890 110" />
                <circle cx="710" cy="470" r="180" />
              </g>
              <g className="golden-intro-grid">
                <path pathLength="1" d="M110 110H890V590H110Z" />
                <path pathLength="1" d="M590 110V590" />
                <path pathLength="1" d="M590 410H890" />
                <path pathLength="1" d="M710 410V590" />
                <path pathLength="1" d="M590 470H710" />
                <path pathLength="1" d="M650 410V470" />
              </g>
              <path
                className="golden-intro-spiral"
                pathLength="1"
                d="M110 590 A480 480 0 0 1 590 110 A300 300 0 0 1 890 410 A180 180 0 0 1 710 590 A120 120 0 0 1 590 470 A60 60 0 0 1 650 410 A60 60 0 0 1 710 470"
              />
              <g className="golden-intro-marks">
                <path d="M100 110H120 M110 100V120 M880 590H900 M890 580V600" />
                <circle cx="710" cy="470" r="4" fill="currentColor" stroke="none" />
                <text x="110" y="90">FIG. 00 — THE GEOMETRY OF AN IDEA</text>
                <text x="890" y="622" textAnchor="end">1 : 1.618</text>
              </g>
            </svg>
            <div className="golden-intro-title">
              <span className="golden-intro-kicker">A little curiosity. Infinite possibility.</span>
              <p><span>Ideas in</span><em>motion.</em></p>
            </div>
            <span className="golden-intro-phi">φ</span>
          </div>

          <div className="golden-intro-bottomline">
            <span className="golden-intro-note">ART MEETS TECHNOLOGY</span>
            <span className="golden-intro-sequence">AN IDEA TAKES SHAPE</span>
            <button
              ref={skip}
              type="button"
              onClick={dismiss}
              className="golden-intro-skip"
              aria-label="Skip introduction"
            >
              Enter portfolio <span aria-hidden="true">↗</span>
            </button>
          </div>
          <div className="golden-intro-progress" aria-hidden="true"><span /></div>
        </div>
      )}
      <noscript><style>{'[data-golden-intro] { display: none !important; }'}</style></noscript>
      <div ref={content} tabIndex={-1} className="golden-intro-content">{children}</div>
    </>
  );
}
