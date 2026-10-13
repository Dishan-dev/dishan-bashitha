# Cinematic portfolio refinement

The existing portfolio keeps its content, images, purple identity, section navigation, technology filters, and case studies. Desktop sections now fit inside the viewport without page scrolling. Projects uses a height-aware stage beside its details, with a horizontal index below. Mobile and very short viewports retain native vertical reading flow.

## Presentation and motion

| Area | Changes |
| --- | --- |
| Projects | Height-aware spatial stage beside the project description and actions; stable image proportions; horizontal project index. Four popular skill chips plus a native technology selector keep desktop filters to one row. Mobile retains expandable skill chips and scrolling. |
| Project transitions | Persistent Anime.js cards rotate through a shared CSS perspective scene. Mouse tilt is restrained; opening a case study retains the star curtain and brief particle-ring transition. Phones use a single flat card with swipe/buttons instead of the desktop orbit. |
| Section navigation | Five authored GSAP connections: portrait iris into About, perspective card expansion into Projects, a hinged fold into Skills, a growing timeline rule into Experience, and an orbital tunnel into Contact. Returning across a connection plays its exact timeline backwards. Purple rings, rules, and the portal star connect the visual language. The transparent header and section dock move with their page; reduced motion switches immediately. |
| Home | Existing masked text sequence and portrait interaction retained. Pointer movement now uses Motion values rather than React state updates on every movement. Shorter loading intro; Explore My Work now opens Projects. |
| About | Responsive two-column composition, more generous reading space, existing heading/portrait reveals, restrained portrait parallax, and magnetic resume link. |
| Skills | Heading beside a two-column tool matrix, sized to the desktop viewport; existing staggered reveals and restrained hover depth. |
| Experience | Work / Leadership / Education selectors lead into a selectable timeline and a generous detail panel, with animated selection indicators, directional detail reveals, a quiet year watermark, and previous/next controls. Every entry fits the desktop viewport; mobile stacks the timeline and details. |
| Contact | Viewport-sized desktop columns, readable links, existing headline/closing motion, and subtle magnetic links. Native scrolling remains on mobile. |

## Architecture and files

- `src/lib/motion.ts`: shared easing, scene duration, reveal timing, stagger, and scrub tokens.
- `src/hooks/useSceneMotion.ts`: scoped ScrollTrigger observers, reversible parallax and camera movement, timeline progress, magnetic interactions, responsive/reduced-motion cleanup, and content-size refresh.
- `src/hooks/useSceneNavigation.ts`: hash navigation, direct section/project destinations, history restoration, transition cooldown, and timer cleanup.
- `src/components/motion/FrameTransition.tsx` and `FrameTransition.module.css`: scoped page transitions, including the header and controls. Stable keyed frames preserve the departing page's selection until it leaves; animation styles and decorative geometry are cleaned up on completion/interruption.
- `src/lib/sceneTransitions.ts`: deterministic connection selection and five reversible timelines. Direct jumps use the later chapter's connection, and returning across the same pair reverses it. There is no random effect selection.
- `src/components/portfolio/Scene.tsx`: shared motion integration and correct frame height.
- `src/components/portfolio/PortfolioExperience.tsx`: transition direction, native touch scrolling, shorter loader, and Projects entry action.
- `src/components/portfolio/SceneNavigator.tsx`: compact section dock and existing mobile navigation.
- `src/components/projects/SplitProjectPortal.tsx`: spacious composition, filter presentation, adjacent navigation controls, and project hash/history restoration.
- `src/components/projects/ProjectOrbitDeck.tsx`: responsive card poses, flat mobile/reduced-motion fallback, image loading, and simplified overlays.
- `src/components/projects/ProjectShowcase.module.css`: consolidated gallery styling, responsive spacing, image proportions, details, filters, and portal styles.
- `src/components/scenes/{IntroScene,AboutScene,SkillsScene,ExperienceScene,ContactScene}.tsx`: section-specific enhancements described above.
- `src/app/globals.css`: scene layouts, header, dock, timeline progress, and responsive rules.

The existing `ProjectPortalTransition.tsx`, `ProjectViewer.tsx`, and `WorkScene.tsx` from the preceding animation work remain part of the experience.

## Dependencies and tradeoffs

No additional dependencies were installed for this refinement. It reuses GSAP/ScrollTrigger, Motion, and Anime.js already installed in the project. Anime.js was added in the preceding project-animation iteration.

Desktop uses bounded scene navigation; only mobile and very short viewports use native page scrolling. ScrollTrigger observes compact-screen scrolling without pinning or adding a competing Lenis loop. Section connections last 1.2 seconds and combine clip-path reveals with perspective transforms; compact screens reduce the rotation. The case-study portal retains its separate transition into project content. Desktop project camera scaling is disabled so the stage uses all allocated space. Project depth uses CSS rather than an additional WebGL scene.

Implementation consulted the official [GSAP ScrollTrigger documentation](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) for custom scrollers and scrubbed progress, and [gsap.matchMedia documentation](https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29/) for responsive cleanup.

## Latest viewport-fit verification

- All five revised connections checked forwards and backwards at 1366 x 768, including intermediate screenshots: distinct geometry, matching reverse playback, one settled frame, no leftover ornaments/transforms, and no desktop surface overflow.
- All five connections checked at 390 x 844, with no horizontal overflow. Reduced-motion switching completed within the 120ms check with no ornament or transform left behind.
- GSAP's official [timeline reverse documentation](https://gsap.com/docs/v3/GSAP/Timeline/reverse%28%29/) informed exact reverse playback.

## Experience and header verification

- The revised Experience timeline's eight entries checked at 1366 x 768, 1920 x 1080, and 1024 x 640: no desktop scrolling or clipped visible text.
- Forward/backward motion checked with the header attached to both page surfaces; selected project state stays intact on the departing page.
- Case-study opening still fills the viewport and hides section navigation.
- Mobile 390 x 844 checked: the header scrolls away with content and no horizontal overflow appears.
- All six sections also checked at 1366 x 768 with reduced motion: one settled frame within 120ms, no surface overflow, and no remaining transition transform.
- Production build (including TypeScript), ESLint, and whitespace checks passed after this revision; no uncaught browser exceptions were observed.

## Previous viewport-fit verification

- All six sections checked at 1920?1080, 1440?900, 1366?768, 1024?720, and 1280?640.
- No desktop page scrollbars or clipped visible text at those sizes. Experience category cards checked separately.
- Each transition inspected during playback and confirmed to finish with one active frame and no leftover overlay.
- Desktop technology selector, case-study opening, mobile native scrolling, and immediate reduced-motion section switching checked.
- No uncaught browser runtime exceptions during these checks.

## Earlier functional verification

- TypeScript, ESLint, and production build passed.
- Headless Chrome screenshots inspected for all six sections at 1440×900 and 390×844, with additional project checks at 1280×720 and 320×740.
- No document horizontal overflow at those tested widths.
- All 16 filter options checked against their visible project counts, including All projects.
- Arrow-key project switching, mouse-driven card transforms, and mobile touch swipe verified.
- Case-study opening, focus containment, Escape closing, and restored focus verified.
- Browser back/forward reopening and direct `#project-learnix` navigation verified.
- Reduced-motion switching produces flat, immediate project poses.
- No uncaught browser runtime exceptions observed during those flows.

Animation scopes, media listeners, ResizeObservers, and timers are cleaned up. Motion values avoid pointer-driven React renders in the hero; gallery pointer updates also avoid React state. Images retain responsive sizing, and distant gallery cards load lazily. Keyboard focus and non-hover controls remain available.

Validation used Chrome desktop/mobile emulation, not physical devices or Safari. No measured 60 FPS guarantee or production Core Web Vitals benchmark is claimed. No deployment was performed.
