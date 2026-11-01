# Cinematic portfolio motion

The home page follows the "Portfolio motion kit" flow: a framed hero, an About statement, a pinned 3D experience carousel, an education timeline, pinned horizontal project panels, and a framed contact CTA. Every section is a sticky layer: once read, it holds while the next slides over and dims it. All content comes from `src/data/`.

## Architecture

| Layer | Owner | Files |
| --- | --- | --- |
| Page shell | Liquid-glass nav (tracks the section under it, switches tone over paper sections), in-page link travel, hash routing for case studies, viewer scroll lock | `src/components/flow/FlowExperience.tsx` |
| Smooth scrolling | One Lenis instance on GSAP's ticker (touch keeps native momentum; reduced motion disables it) | `src/lib/portfolioScroll.ts` |
| Choreography | GSAP ScrollTrigger, one setup function per section, run through `useFlowMotion` only when motion is allowed | `src/components/flow/*.tsx`, `useFlowMotion.ts` |
| Stacking | `[data-stack]` layers stick at `--stick` (viewport height minus layer height); sticking is lifted during ScrollTrigger refreshes so offsets stay true | `FlowExperience.tsx`, `.stack` in `Flow.module.css` |
| Project detail | Full-screen case study: particle sphere in the project's tint, oversized title, the panel image flying in and back, then Overview / Features / Engineering / Source chapters and a next-project link | `ProjectDetail.tsx`, `ParticleField.tsx`, `src/lib/sharedElement.ts` |
| Styles | One CSS module with the kit's tokens; light and dark follow `data-theme` | `src/components/flow/Flow.module.css` |
| Content | Projects, experience, skills, profile | `src/data/*.ts` |

## Sections

A companion robot, Bit (`Companion.tsx`), stays bottom-right throughout: it hops and shows a line for each section, its eyes follow the pointer, and clicking it moves to the next section.


- **Home** (`#home`): the original cover layout inside the violet frame; the portrait follows the pointer and reveals the illustrated version under a hover lens; a glow trails the pointer, a dot field lights up beneath it and the orbit rings drift against it; the layers part on scroll.
- **About** (`#about`): a draggable lanyard ID badge (damped pendulum) beside the statement, bio and skills.
- **Experience** (`#experience`): pinned carousel of the five work and leadership roles with a marquee drifting behind; snaps to each card.
- **Education** (`#education`): sticky heading beside three qualification cards that tilt into place while a rail draws down.
- **Projects** (`#projects`): pinned horizontal travel through project-tinted panels, each cover framed as a browser window; each panel opens its case study.
- **Contact** (`#contact`): frame grows into place, metallic star spins in, headline rises.

Pinned sections land at the start of their sequence; other links land at the top of their layer. `#project-<slug>` opens that case study over Projects. Reduced motion removes pins and scroll animation: the carousel and panels become horizontally scrollable rows.

## Legacy scene system

The previous stacked-frame components (`src/components/scenes`, `PortfolioExperience`, `SplitProjectPortal`, `useSceneMotion`, `useSceneNavigation`) are no longer rendered. Their id-based rules in `globals.css` are scoped to `.portfolio-shell` so they cannot affect the new sections.

## Verification (Chromium headless, 2026-11-01)

- Typecheck, lint and production build pass.
- 1440 × 900 light and dark, 390 × 844 mobile, reduced motion; no horizontal overflow.
- Nav links land on the expected offsets with correct hashes; open/close via panel, case-study button, Escape and back/forward; rapid open/close ×3; direct `#project-…` and `#experience` links. No leftover flight clone, hidden source or scroll lock.
