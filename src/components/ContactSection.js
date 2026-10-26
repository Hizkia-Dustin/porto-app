import Image from "next/image";

// Replace these demo destinations with the owner's details before publishing.
const email = "hello@example.com";
const socialLinks = [
  { label: "GitHub", href: "https://example.com/github" },
  { label: "LinkedIn", href: "https://example.com/linkedin" },
];

export default function ContactSection() {
  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-title">
      <div className="contact-topline">
        <p className="eyebrow"><span className="small-line" /> 04 — A new conversation</p>
        <span className="contact-edition">The next chapter starts with you.</span>
      </div>
      <div className="contact-composition">
        <div className="contact-copy" data-contact-reveal>
          <h2 id="contact-title" tabIndex={-1}>Your next<br />idea, <em>in motion.</em></h2>
          <p className="contact-description">A thought on paper. A possibility worth exploring.<br /> Let’s turn it into something we can put into the world.</p>
          <a className="contact-email" href={`mailto:${email}`}>
            <span>Let’s talk<span className="contact-address">{email}</span></span>
            <span className="contact-arrow" aria-hidden="true">↗</span>
          </a>
          <nav className="contact-socials" aria-label="Social profiles">
            {socialLinks.map(({ label, href }) => <a key={label} href={href} target="_blank" rel="noopener noreferrer">{label} <span aria-hidden="true">↗</span></a>)}
          </nav>
        </div>
        <div className="contact-art" aria-hidden="true">
          <div className="contact-orbit" />
          <Image className="contact-paper" src="/assets/web/parchment-orbit.webp" alt="" width={600} height={450} unoptimized />
          <Image className="contact-maker" src="/assets/web/seated-maker.webp" alt="" width={1086} height={1448} unoptimized sizes="(max-width: 700px) 70vw, 40vw" />
          <span className="contact-art-caption">FIG. 04 / AN IDEA YET TO BE MADE</span>
        </div>
      </div>
      <footer className="contact-footer">
        <span>Every ending, a beginning.</span>
        <a href="#intro" className="text-link">Back to the beginning <span aria-hidden="true">↗</span></a>
        <span className="chapter-count">04 / 04</span>
      </footer>
    </section>
  );
}
