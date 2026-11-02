# ANTI-AI-SLOP ENFORCEMENT SYSTEM

Synthesizing rules, tell catalogs, and remediation protocols from:
- `sources/anti-slop` (The core antislop governance framework)
- `sources/design-slop` (Gaurav Tiwari's non-negotiable surface rules)
- `sources/ui-anti-slop` (Victor Benazzi's Codex anti-slop visual contracts)
- `sources/anthropic-frontend` (Anthropic's calibration of model defaults)
- `sources/taste-skill` (Leonxlnx's taste & tell catalog)

---

## 1. What is "Design Slop"?

> **Design Slop** is visual output that looks superficially competent or "modern" at first glance, but falls apart upon inspection because it lacks hierarchy, real content, brand context, restraint, or genuine product thinking.

AI is not the problem. **Unedited, generic, decorative, repetitive defaults are the problem.**

---

## 2. The Comprehensive Catalog of AI Slop Tells

| Cliché Pattern (Tell) | Why It Reads as Slop | What to Do Instead (The Fix) |
|---|---|---|
| **Generic Blue-Purple Gradient** (`#3b82f6` to `#8b5cf6` or `#a855f7`) | The most over-represented default color scheme in LLM training data. Signals zero brand identity. | Derive palette from the subject matter, brand identity, or physical materials. Use gradients strictly for functional elevation. |
| **SaaS Card Soup** | Splitting every piece of content into identical 3-column rounded boxes with identical padding and shadows. | Use varied editorial layouts: asymmetric split screens, list rows with expanding drawers, lead story + sub-items, full-bleed media. |
| **Non-Negotiable Surface Violation** | Combining thick visible borders (`border: 2px solid`) with rounded cards (`rounded-xl` or `rounded-2xl`). | Either use sharp architectural edges (`rounded-none` or `rounded-xs`) with hairline borders, OR use rounded surfaces with subtle tonal contrast without heavy stroke borders. |
| **Excessive Glassmorphism** | `backdrop-blur` applied simultaneously to the navbar, cards, sidebar, modal, and footer. | Glass is an accent, not a personality. Dose cap: at most 1–2 elements across the entire page. Let background textures breathe. |
| **Universal Pill Shapes** | Every button, tag, badge, input, and modal given `border-radius: 9999px`. | Differentiate visual verbs. A primary CTA might be rounded or pill-shaped; inputs and cards should maintain structural rectangular stability. |
| **Fake Sequence Numbering** | Prepending `01 / 02 / 03` or `[ 01 ]` to items that are NOT steps, chronological dates, or ordered sequences. | Only use numbering if the content represents a real step-by-step workflow, chapter index, or timeline. Otherwise, remove it. |
| **The "Anthropic Aesthetic Trap"** | Defaulting to warm cream `#F4F1EA`, high-contrast serif display, and terracotta `#D97757` on every non-briefed project. | Recognize this as Claude's training mirror. Step outside the warm-cream-and-clay default unless explicitly requested. |
| **Tracked-Out Eyebrows Everywhere** | An uppercase, widely-tracked monospace label above *every single* heading (`WORKSPACE // ARCHIVE`). | Use typographic hierarchy, size contrast, and spatial grouping rather than relying on repetitive micro-labels. |
| **Gratuitous Diagonal Arrows (`↗`)** | Appending an external arrow icon (`↗` or Lucide `ArrowUpRight`) to every button and internal page link. | Only use `↗` when a link opens a new tab or genuinely navigates to an external domain. Internal actions use labels or directional cues. |
| **Fake Stats & Empty Metrics** | Hardcoding `99.9% Reliable`, `10,000+ Active Users`, `500+ Components` without data backing. | Write real, specific product facts. If metrics don't exist, highlight specific case study achievements, architectural specs, or testimonials. |
| **Repetitive Fade-and-Slide Up** | Setting every single paragraph, image, and heading to `gsap.from({ y: 50, opacity: 0 })` on scroll. | Choreograph motion selectively. Animate section milestones, pin dynamic stages, or let typography breathe with simple clean reveals. |

---

## 3. The Purpose Test (Rule R-01)

Before writing any CSS property, component wrapper, or animation trigger, answer:
1. **Why does this exist?** (What information does it communicate?)
2. **What happens if it is removed?** (If the answer is "nothing breaks and the page looks cleaner", **delete it immediately**).
3. **Is this a deliberate choice or a training default?**

---

## 4. The Visual Contract Protocol

Before implementing any frontend, declare an explicit **Visual Contract**:

```markdown
### Visual Contract
- **Surface Type:** [Portfolio | Editorial | SaaS | E-commerce | Interactive Experience]
- **Target Audience:** [e.g., Creative Directors, Senior Engineers, Luxury Buyers]
- **Creative Concept:** [e.g., Industrial brutalism meets Swiss precision, Tectonic minimalism]
- **Primary Typography:** [Display: Syne / Body: Geist Mono]
- **Base Color Palette:** [Dominant: #0a0a0a, Secondary: #f4f4f4, Accent: #e20b3a]
- **Spatial Density:** [High / Medium / Spacious]
- **Signature Motion Moment:** [e.g., Smooth 3D wireframe tunnel zoom into pure black cosmic void]
- **Anti-Slop Prohibitions:** [No blue-purple gradients, no card soup, no gratuitous 01/02 tags, no rounded card borders]
```
