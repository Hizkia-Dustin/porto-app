"use client";

import { projects } from "../data/projects.mjs";
import Image from "next/image";
import styles from "./WorkSection.module.css";

export default function WorkProjects({ ref, stripRef, active, onSelect }) {
  return (
    <div ref={ref} className={styles.projectGallery} role="region" aria-label="Contoh proyek" inert>
      <div ref={stripRef} className={styles.projectStrip}>
        {projects.map((project, index) => (
          <button
            key={project.id}
            type="button"
            className={styles.projectCard}
            data-active={index === active}
            aria-current={index === active ? "true" : undefined}
            aria-label={`Fokus ${project.title} — ${project.category} (contoh proyek)`}
            onClick={() => onSelect(index)}
            style={{
              "--preview-color": project.color,
              "--card-width": `${Math.max(29, Math.min(39, project.layout.width))}vw`,
              "--card-height": `${project.layout.height}svh`,
              "--card-y": `${project.layout.y * 0.65}svh`,
              "--card-angle": `${project.layout.angle}deg`,
            }}
          >
            <div className={styles.projectPreview} aria-hidden="true">
              <Image src={project.image} alt="" fill sizes="40vw" loading="eager" className={styles.projectImage} />
            </div>
            <div className={styles.projectMeta}>
              <div className={styles.projectTitle}>
                <h3>{project.title}</h3>
                <span>{project.category}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
