# RAPID ANTI-SLOP AUDIT CHECKLIST

Run this diagnostic checklist before delivering any frontend screen, component, or page.

---

## The 12-Point Anti-Slop Diagnostic

| Check | Inspection Question | Pass Criteria | Fail / Remediate |
|:---:|---|---|---|
| **1** | **Color Palette** | Does the palette use generic blue-to-purple / purple-to-cyan gradients or radial glow orbs? | Derived from subject/brand; purposeful elevation. | **FAIL:** Replace with brand-derived palette and purposeful surface contrast. |
| **2** | **Surface Rule** | Are thick visible borders (`border-2`) combined with rounded corners (`rounded-xl`) on cards? | Clean hairline borders with subtle radius, or unbordered tonal surfaces. | **FAIL:** Remove thick border or use crisp architectural lines. |
| **3** | **Card Soup** | Is every section chopped into identical 3-column rounded boxes? | Dynamic layout: asymmetric columns, lists with drawers, editorial splits. | **FAIL:** Break the grid; use varied editorial hierarchy. |
| **4** | **Glassmorphism** | Is `backdrop-blur` applied across navbar, cards, sidebar, and modals simultaneously? | Max 1–2 glass accents across the entire page. | **FAIL:** Make standard cards solid; restrict glass to primary floating controls. |
| **5** | **Pill Geometry** | Is `rounded-full` / `9999px` applied uniformly to every button, tag, badge, and input? | Varied radii reflecting structural hierarchy. | **FAIL:** Use rectangular stability for inputs/cards; reserve pills for badges or CTAs. |
| **6** | **Sequence Numbering** | Are `01 / 02 / 03` or `[ 01 ]` labels applied to unordered items? | Numbering used *only* for chronological or stepped processes. | **FAIL:** Delete decorative number tags from non-sequential items. |
| **7** | **Eyebrow Clutter** | Does every heading have a tracked-out uppercase monospace eyebrow? | Clean typographic scale and hierarchy. | **FAIL:** Remove repetitive eyebrows; let headline size and spacing do the work. |
| **8** | **Arrow Addiction** | Is the `↗` (diagonal arrow) appended to internal links or action buttons? | `↗` used *strictly* for external links opening in a new tab. | **FAIL:** Remove `↗` from internal navigation and button labels. |
| **9** | **Content Honesty** | Are there fake stats (`99.9% Uptime`, `10k+ Users`) or generic marketing fluff? | Specific, authentic, subject-grounded copy. | **FAIL:** Replace with real project details, architectural specs, or authentic quotes. |
| **10** | **Motion Quality** | Does every section use an identical `fade-and-slide up` scroll trigger? | Orchestrated signature moments, continuous states, custom easing. | **FAIL:** Remove generic scroll triggers; choreograph a signature milestone. |
| **11** | **Purpose Test** | Can any border, divider, badge, or decorative gradient be removed without loss? | Every visual element communicates structural or functional meaning. | **FAIL:** Delete the unnecessary element. Simplify the surface. |
| **12** | **Typography Bounds** | Are body paragraph line lengths exceeding 75–80 characters? | Comfortable reading measure (< 75ch), line-height 1.5–1.7. | **FAIL:** Set `max-w-prose` or `max-width: 65ch` on all text blocks. |

---

## Verdict Standard

- **12/12 PASS:** Pristine award-caliber craft. Ready for delivery.
- **1–2 FAILS:** Minor remediation required. Fix before final showcase.
- **3+ FAILS:** Significant design slop detected. Refactor layout and typography before proceeding.
