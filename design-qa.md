# Design QA

## Target

Projects carousel reference: a focused vertical centre card with angled preview cards on the left and right.

## Verification status

final result: blocked

## Reason

The project has an existing local development server, but browser automation is unavailable in this environment (`agent-browser` is not installed). A side-by-side visual comparison against the supplied reference could not be completed.

## Implemented changes

- Rebuilt the project deck as a narrow portrait-focused centre card.
- Added perspective-based left and right preview cards with hover motion.
- Kept supplied project flyers uncropped using `object-contain`.
- Added the project summary beneath the flyer inside the focused card.

## Non-visual validation

`npm run build` passes.
