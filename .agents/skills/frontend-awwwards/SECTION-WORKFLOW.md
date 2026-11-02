# Frontend Awwwards --- Section-by-Section Workflow

**Purpose:** Build high-quality, award-caliber websites one section at a
time without unexpectedly redesigning, refactoring, or modifying
completed parts of the website.

**Default operating rule: ONE USER REQUEST = ONE SECTION SCOPE.**

This document is the execution workflow for the `frontend-awwwards`
master skill. Follow it whenever the user asks to create, improve,
critique, or animate a specific website section.

------------------------------------------------------------------------

## 1. Non-negotiable scope protection

### 1.1 Work only on the requested section

When the user asks for a section such as Hero, About, Services,
Features, Portfolio, Pricing, Testimonials, FAQ, or Contact:

-   Implement or modify only that requested section.
-   Do not redesign the entire page or website.
-   Do not change completed sections.
-   Do not modify the navbar, header, footer, routing, or page shell
    unless explicitly requested.
-   Do not perform unrelated refactoring or cleanup.
-   Do not change global typography, colors, spacing tokens, CSS resets,
    or shared design tokens merely to make the requested section easier.
-   Do not replace existing components just because a different approach
    is preferred.
-   Do not treat permission to inspect the whole page as permission to
    edit the whole page.

The agent may inspect surrounding sections to understand visual context
and transitions. Inspection is not authorization to modify them.

### 1.2 Completed sections are protected

A section becomes **LOCKED** when the user accepts it, says it is
finished, or explicitly asks to move on.

For every LOCKED section:

-   Preserve its source code, styles, content, layout, interactions, and
    responsive behavior.
-   Do not make opportunistic improvements.
-   Do not change it to match a new section unless the user approves the
    exact change.
-   If a new section needs a shared change that could affect a locked
    section, stop and request approval first.
-   If an accidental change is detected, revert that unrelated change
    before reporting completion.

### 1.3 Shared files and dependencies

A section may depend on shared files such as global CSS, design tokens,
fonts, layout wrappers, navigation, animation providers, or shared
components.

Before editing a shared dependency:

1.  Identify the exact file or component.
2.  Explain why the requested section cannot be completed safely without
    the change.
3.  Identify which other sections may be affected.
4.  Propose the smallest isolated alternative.
5.  Ask for explicit approval before changing anything outside the
    requested section.

Prefer section-scoped classes, CSS modules, local components, and local
animation timelines over global changes.

### 1.4 No silent scope expansion

If a problem is found outside the requested section:

-   Record it in the final notes as an out-of-scope observation.
-   Do not fix it.
-   Do not use it as a reason to redesign other sections.
-   Ask separately if the user wants a future task for that issue.

------------------------------------------------------------------------

## 2. Section lifecycle

Use this lifecycle for each section:

`NOT STARTED → DISCOVERY → PLANNED → BUILDING → REVIEW → REFINEMENT → ACCEPTANCE → LOCKED`

Do not skip the scope and approval gates.

### Stage 0 --- Identify the request

Determine:

-   Which page is being worked on.
-   The exact section name or location.
-   Whether the user wants to create, critique, refine, animate, or
    rebuild it.
-   Any explicit visual references, content, assets, or technical
    constraints.
-   Whether the section is new or already exists.

If the target section is ambiguous, ask one concise clarification before
editing.

Do not ask unnecessary questions when the target and intent are already
clear.

### Stage 1 --- Discover the existing project

Inspect only what is needed to understand the target section:

-   Framework and build setup.
-   Route or page containing the section.
-   Existing section component and its styles.
-   Assets used by the section.
-   Relevant shared components and dependencies.
-   Existing animation libraries and patterns.
-   Nearby sections for visual context.
-   Existing responsive conventions.

Do not edit during discovery.

Establish the exact files likely to change. If the project uses Git,
inspect the working tree and preserve pre-existing user changes. Never
overwrite or discard unrelated uncommitted work.

### Stage 2 --- Define the section boundary

Create an internal scope statement before implementation.

Example:

``` text
TASK: Build the About section.

IN SCOPE:
- About section component
- About section styles
- About section-specific assets
- About section-specific interactions and animations
- Responsive behavior of the About section

OUT OF SCOPE:
- Navbar
- Hero section
- Services section
- Testimonials section
- Footer
- Global typography and color tokens
- Routing and unrelated components
```

If a shared dependency must change, stop at the approval gate described
in Section 1.3.

### Stage 3 --- Establish creative direction

Before coding, define a compact creative direction for the requested
section:

-   Purpose: what the section must communicate.
-   Visual concept: the distinctive idea behind its composition.
-   Hierarchy: primary message, supporting information, and call to
    action.
-   Layout: grid, editorial composition, asymmetry, whitespace, or other
    justified structure.
-   Typography: roles, scale, line length, and hierarchy.
-   Color: use the existing design system unless the user authorizes a
    broader change.
-   Imagery: subject, crop, aspect ratio, and visual treatment.
-   Interaction: what responds to hover, click, scroll, or user input.
-   Motion: why animation helps communicate the section's purpose.
-   Responsive behavior: how the composition adapts at smaller widths.

Consult the relevant local references from the master skill's `sources/`
directory. Use Taste and Awwwards references for creative direction,
GSAP and Lenis references for motion where appropriate, and anti-slop
references as quality controls.

References are inspiration and technical guidance, not permission to
copy protected assets, branding, or complete designs.

### Stage 4 --- Plan before implementation

Prepare a concise implementation plan:

1.  Components to create or edit.
2.  Stylesheets or modules to create or edit.
3.  Assets required.
4.  Interactions and animations required.
5.  Responsive changes required.
6.  Tests and visual checks to perform.

Prefer isolated implementation:

-   Use a dedicated section component.
-   Use locally scoped styles or CSS modules.
-   Use section-specific class names.
-   Keep animation selectors inside the section root.
-   Clean up GSAP timelines, ScrollTriggers, event listeners, and
    observers on unmount.
-   Respect `prefers-reduced-motion`.
-   Avoid introducing new dependencies if existing project tools are
    sufficient.

Do not begin unrelated refactoring.

### Stage 5 --- Implement only the requested section

Build the section to the agreed direction.

Quality expectations:

-   Distinctive visual composition rather than a generic template.
-   Clear content hierarchy and readable typography.
-   Intentional spacing and alignment.
-   Purposeful imagery and visual details.
-   Functional interactions, not decorative controls that do nothing.
-   Motion that supports storytelling and usability.
-   Responsive behavior for desktop, tablet, and mobile.
-   Accessible semantics, keyboard interaction, and visible focus
    states.
-   No fabricated statistics, fake testimonials, or meaningless
    placeholder content unless explicitly requested for a prototype.

Do not add animation simply to make the page look busy. Do not use
gradients, glass effects, rounded cards, or other popular styles by
default; use them only when they serve the concept.

### Stage 6 --- Section-only visual and functional review

Review the requested section, not the entire website.

Check:

**Visual quality**
- Does the composition have a clear focal point?
- Is the visual hierarchy immediately understandable?
- Are typography, spacing, alignment, and contrast deliberate?
- Does it have a distinctive art direction?
- Does it avoid generic AI-generated design patterns?

**Interaction**
- Do buttons and links work?
- Are hover and focus states intentional?
- Are scroll interactions stable?
- Do animations start and end correctly?
- Are there layout shifts, clipping, or overlapping elements?

**Responsive behavior**
- Does the section work on desktop, tablet, and mobile?
- Does text remain readable?
- Do images crop appropriately?
- Do grids and columns adapt correctly?
- Are touch targets usable?
- Is horizontal overflow avoided unless intentionally designed?

**Accessibility**
- Are semantic elements used correctly?
- Are images given appropriate alternative text?
- Can interactive elements be reached and used by keyboard?
- Is focus visible?
- Is motion reduced when the user requests reduced motion?

**Engineering**
- Are there console errors?
- Are there missing assets?
- Are there React warnings or hydration issues?
- Are animations and event listeners cleaned up?
- Is the implementation consistent with the existing stack?

Use browser screenshots at relevant viewport sizes when browser tooling
is available. Do not claim that a visual or functional test passed if it
was not actually run.

### Stage 7 --- Critique and refine

Act as a demanding creative director and senior frontend reviewer.

For every issue found, report:

-   Exact element or component.
-   What is wrong.
-   Why it matters.
-   Severity: Critical, High, Medium, or Low.
-   Specific proposed fix.

Fix issues only inside the current section scope.

If a proposed fix requires changing a protected section or shared
dependency, request approval first.

Repeat the section review after refinement. Do not chase arbitrary
perfection by making unrelated changes.

### Stage 8 --- Acceptance and lock

When the section meets the agreed requirements:

1.  Summarize what was implemented.
2.  List the exact files changed.
3.  Report tests and viewport checks actually performed.
4.  List any known limitations.
5.  Identify any out-of-scope issues without fixing them.
6.  Ask whether the user accepts the section if acceptance is not
    already clear.

Once accepted, mark it **LOCKED** in the project task notes or the
user's chosen progress tracker.

Do not edit a LOCKED section in later section tasks unless the user
explicitly names it and authorizes the change.

### Stage 9 --- Move to the next section

When the user requests the next section:

-   Start a new section lifecycle.
-   Inspect the existing page for context only.
-   Treat all previously accepted sections as LOCKED.
-   Reuse the established design language without rewriting previous
    sections.
-   Keep the new section's implementation isolated.
-   Ask before making any shared change that may affect completed
    sections.

------------------------------------------------------------------------

## 3. Operating modes

Interpret the user's request using these modes.

| Mode | Behavior | May edit code? |
|---|---|---|
| `BUILD SECTION` | Create the named section only | Yes, in scope |
| `CRITIQUE SECTION` | Review and report issues for the named section | No |
| `REFINE SECTION` | Improve the named section only | Yes, in scope |
| `ANIMATE SECTION` | Add or improve motion in the named section only | Yes, in scope |
| `LOCK SECTION` | Mark the accepted section as protected | No |
| `AUDIT WEBSITE` | Inspect the whole website and report findings | No, unless separately approved |
| `REDESIGN WEBSITE` | Redesign broader areas explicitly named by the user | Yes, within the expressly approved scope |

If the user asks only for an audit or critique, do not implement fixes
unless they explicitly authorize implementation.

If the user says "make it better" while discussing a specific section,
interpret that as `REFINE SECTION`, not `REDESIGN WEBSITE`.

------------------------------------------------------------------------

## 4. Section progress tracker

Maintain a simple progress record when the project has multiple
sections. Do not invent completion status.

Example:

| Section | Status | Notes |
|---|---|---|
| Navbar | LOCKED | Accepted by user |
| Hero | LOCKED | Accepted by user |
| About | IN PROGRESS | Visual refinement |
| Services | NOT STARTED | Awaiting request |
| Portfolio | NOT STARTED | Awaiting request |
| Testimonials | NOT STARTED | Awaiting request |
| Contact | NOT STARTED | Awaiting request |
| Footer | NOT STARTED | Awaiting request |

Status definitions:

-   `NOT STARTED`: no work has begun.
-   `IN PROGRESS`: currently being implemented or reviewed.
-   `REVIEW`: awaiting user feedback.
-   `LOCKED`: accepted and protected from future edits.

Only mark a section LOCKED when the user accepts it or explicitly asks
to lock it.

Store this tracker in a project-level progress file only if useful and
permitted. Do not create or modify extra files without a reason.

------------------------------------------------------------------------

## 5. Required final report for every section task

Use this compact format:

``` text
SECTION: [Section name]
MODE: [BUILD / CRITIQUE / REFINE / ANIMATE]
STATUS: [REVIEW / LOCKED / IN PROGRESS]

SCOPE:
- [What was allowed to change]

FILES CHANGED:
- [Exact file paths]

IMPLEMENTED:
- [Summary of changes]

QUALITY REVIEW:
- Visual:
- Motion:
- Responsive:
- Accessibility:
- Engineering:
- Anti-slop:

TESTS:
- [Only tests actually performed]

OUT-OF-SCOPE OBSERVATIONS:
- [Report only; do not fix]

PROTECTED SECTIONS:
- [Confirm previously locked sections were not modified]
```

Do not claim "no unrelated files changed" unless the diff or equivalent
inspection was checked.

------------------------------------------------------------------------

## 6. Copy-and-use user prompt templates

### Build a new section

``` text
Apply the frontend-awwwards skill.

BUILD SECTION: [SECTION NAME]

Create only this section.
Inspect surrounding sections for context, but do not modify them.
Follow the section-by-section workflow.
Use distinctive Awwwards-level art direction and purposeful motion.
Apply the anti-slop quality gate.
Review this section on desktop, tablet, and mobile.
Do not change shared files without asking me first.
```

### Critique without changing code

``` text
Apply the frontend-awwwards skill.

CRITIQUE SECTION: [SECTION NAME]

Inspect and critically evaluate only this section.
Do not edit any files.
Provide exact issues, severity, and specific fixes.
Do not modify any other section.
```

### Refine a section

``` text
Apply the frontend-awwwards skill.

REFINE SECTION: [SECTION NAME]

Improve only this section based on the identified issues.
Preserve all accepted sections and existing functionality.
Do not change global styles or shared components without approval.
Report the exact files changed.
```

### Add GSAP or parallax to one section

``` text
Apply the frontend-awwwards skill.

ANIMATE SECTION: [SECTION NAME]

Add purposeful GSAP / ScrollTrigger / parallax motion to this section only.
Use existing project dependencies where possible.
Keep animation scoped to the section.
Clean up timelines and ScrollTriggers.
Respect prefers-reduced-motion.
Do not alter other sections or global scroll behavior without approval.
Test the animation on desktop and mobile.
```

### Lock a completed section

``` text
Apply the frontend-awwwards skill.

LOCK SECTION: [SECTION NAME]

Treat this section as completed and protected.
Do not modify its code, styling, content, animation, or responsive behavior
during future section tasks unless I explicitly authorize changes.
```

### Full website audit --- report only

``` text
Apply the frontend-awwwards skill.

AUDIT WEBSITE — REPORT ONLY.

Inspect all sections and report issues by section.
Do not edit, refactor, or redesign anything.
Separate critical issues from optional improvements.
Wait for my explicit approval before implementing any changes.
```

------------------------------------------------------------------------

## 7. Final priority rule

When instructions conflict, follow this order:

1.  The user's latest explicit scope and permission.
2.  This Section Scope Lock workflow.
3.  The master `frontend-awwwards/SKILL.md`.
4.  Individual source references and design recommendations.

A source skill may recommend a full-page redesign, global refactor, or
broad visual cleanup. That recommendation never overrides the user's
section-level scope.

**Final rule: Build boldly inside the requested section. Be conservative
everywhere else. Never sacrifice completed work for an unrequested
improvement.**
