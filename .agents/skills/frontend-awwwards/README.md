# frontend-awwwards — Universal Agent Skill

This folder contains an agent-neutral frontend master skill and its section workflow.

## Files

- `SKILL.md` — central instructions for creative direction, frontend engineering,
  animation, UI/UX critique, anti-slop review, scope protection, and quality control. (Otak utama universal)
- `SECTION-WORKFLOW.md` — detailed section-by-section implementation and review process. (Pengerjaan per section)
- `README.md` — petunjuk penggunaan dan arsitektur skill.
- `ATTRIBUTIONS.md` — licenses, credits, and acknowledgments for all bundled sources.
- `sources/` — 17 complete original GitHub repositories preserved intact.
- `references/` — synthesized deep-dive guides for creative direction, motion, WebGL, engineering, and anti-slop.
- `audits/` — quality gate scoring rubrics (≥ 9/10), Awwwards jury critique, anti-slop checklist, and UX audit tools.
- `examples/` — production-grade reference patterns (GSAP ScrollTrigger, Lenis smooth scroll, Three.js shaders, asymmetric layouts, magnetic buttons, split text).

## Use

Place this folder in the skills directory supported by your AI coding agent (e.g. `.agents/skills/frontend-awwwards/`).
The exact installation path and invocation syntax depend on the host agent.

The instructions are intentionally not tied to Antigravity, Codex, Claude Code,
Cursor, Windsurf, or any one platform. The host agent must support loading
`SKILL.md`-based skills (or an equivalent skill format).

Activation command:
```text
$frontend-awwwards
```

## Section-by-Section Workflow

When working on a specific section (Hero, About, Work, Contact, etc.):
1. Follow `SECTION-WORKFLOW.md`.
2. Default operating rule: **ONE USER REQUEST = ONE SECTION SCOPE**.
3. Protect completed work: treat completed/accepted sections as **LOCKED**.
4. Do not perform unrequested full-site redesigns or opportunistic refactorings.
