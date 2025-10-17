# Repository Guidelines

## Project Structure & Module Organization
The extension follows the Plasmo default layout. All TypeScript sources live in `src/`, with entry points like `background.ts`, `popup.tsx`, and `options.tsx`. Detection logic is grouped under `src/targets` (data structures in `structure/`) while shared helpers reside in `src/utils`. Browser-facing content scripts belong in `src/contents`. Built artifacts land in `build/` (per browser target) and static icons or manifests sit in `assets/`. Avoid editing `node_modules/`; use Yarn to add dependencies.

## Build, Test, and Development Commands
- `yarn dev` starts the Plasmo development server and writes hot-reload bundles into `build/chrome-mv3-dev`.
- `yarn build` produces a production-ready bundle in `build/`.
- `yarn package` zips the latest build for publishing.
- `yarn test` runs Vitest across the project; append `--watch` during active development.
- `yarn log-object` or `yarn itemize` regenerate detector structure logs for debugging—clean artifacts with `yarn clean-log`.

## Coding Style & Naming Conventions
Code is TypeScript-first with React components. Use 2-space indentation, trailing commas, and double quotes so Prettier 3 and the import-sort plugin keep files consistent. Keep React components and hooks in PascalCase files (`PopupPanel.tsx`, `useDetector.ts`). Utility modules stay camelCase (`scoreDetections.ts`). Prefer explicit exports and sorted import groups; run `npx prettier --write src` before opening a PR.

## Testing Guidelines
Vitest is the primary test runner. Co-locate tests next to the implementation using `*.test.ts` or `*.test.tsx`. Focus on covering detection heuristics in `src/targets` and content script messaging flows. Snapshot tests should live with UI components and be updated intentionally. When adding new detectors, include regression tests that exercise both AI-positive and negative samples.

## Commit & Pull Request Guidelines
Commit history favors short, imperative subjects (“Add detections”, “Migrate things”). Keep messages under 72 characters and expand rationale in the body when needed. Every PR should describe the feature or fix, list manual testing steps, and link related issues. Attach before/after screenshots for UI work and mention any adjustments to permissions or manifest settings. Request at least one review before merging; re-run `yarn build` locally if the change touches build tooling.

## Security & Configuration Tips
Host permissions are declared in `package.json` under `manifest`. Limit new permissions to the smallest scope and document the reasoning in PRs. Store API keys or secrets outside the repo; Plasmo environment variables should be injected via the build pipeline rather than committed.
