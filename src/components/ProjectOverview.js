import Image from "next/image";

const projects = [
  {
    number: "01",
    title: "Ideas in Motion",
    category: "Creative development",
    image: "landscape",
    description: "A meeting of art and technology. An interactive portfolio that turns a scroll into a visual story.",
    overview: "Layered artwork, glowing outlines, and particles connect the opening scene to the maker’s story. The experience follows the scroll in both directions, with a static version for reduced motion.",
    tools: "Next.js / Three.js / GSAP",
  },
  {
    number: "02",
    title: "Golden Ratio Intro",
    category: "Motion & interaction",
    image: "parchment-orbit",
    description: "A little geometry, a little curiosity. An opening sequence built around proportion and typography.",
    overview: "An animated geometric drawing introduces the portfolio before giving way to the main experience. A skip control and keyboard support let visitors move straight to the content.",
    tools: "React / SVG / CSS animation",
  },
  {
    number: "03",
    title: "Flying Duo 3D",
    category: "Character exploration",
    image: "parchment-sculpture",
    description: "Two characters, one shared world. An exploration of floating poses, sculptural form, and digital craft.",
    overview: "A pair of character studies developed from visual references, with a Blender scene and rigged GLB exports prepared for further exploration in 3D.",
    tools: "Blender / Character rigging / GLB",
  },
];

export default function ProjectOverview() {
  return (
    <section className="work-section" id="work" data-copy="work" aria-labelledby="work-title">
      <div className="work-topline">
        <p className="eyebrow"><span className="small-line" /> 03 — Selected work</p>
        <span className="work-edition">A collection of explorations / 2026</span>
      </div>

      <div className="work-heading">
        <h2 id="work-title" tabIndex={-1}>Ideas made<br /><em>tangible.</em></h2>
        <div className="work-introduction">
          <svg className="work-asterisk" viewBox="0 0 36 36" fill="none" aria-hidden="true"><path d="M18 2v32M2 18h32M6.7 6.7l22.6 22.6M6.7 29.3L29.3 6.7" stroke="currentColor" strokeWidth="1.5" /></svg>
          <p>From the first spark to something you can explore. A selection of work across design, motion, and technology.</p>
          <span className="work-total">Three projects. Different possibilities.</span>
        </div>
      </div>

      <div className="work-grid">
        {projects.map((project) => (
          <article className={`work-project work-project-${project.number}`} key={project.number}>
            <div className="work-image">
              <Image
                src={`/assets/web/${project.image}.webp`}
                alt=""
                fill
                unoptimized
                sizes="(max-width: 700px) 88vw, (max-width: 1000px) 44vw, 30vw"
              />
              <span className="work-image-number">{project.number}</span>
              <span className="work-image-note">Placeholder artwork</span>
            </div>
            <div className="work-project-meta"><span>{project.category}</span><span>2026</span></div>
            <h3>{project.title}</h3>
            <p className="work-description">{project.description}</p>
            <details className="work-details">
              <summary>
                <span>Project overview<span className="sr-only">: {project.title}</span></span>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M12 5v14" stroke="currentColor" strokeWidth="1.2" /></svg>
              </summary>
              <div className="work-details-content">
                <p>{project.overview}</p>
                <p className="work-tools"><span>Made with</span>{project.tools}</p>
              </div>
            </details>
          </article>
        ))}
      </div>

      <footer className="work-footer">
        <span>Curiosity, put into practice.</span>
        <a href="#intro" className="text-link">Back to the beginning <span aria-hidden="true">↗</span></a>
        <span className="chapter-count">03 / 03</span>
      </footer>
    </section>
  );
}
