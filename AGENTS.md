# Repository Guidelines

## Project Structure & Module Organization

This is a Quasar + Vue 3 frontend (`kh-agency-crm-front`).

- `src/pages/`: route-level screens (for example `src/pages/dashboard/`, `src/pages/boards/`).
- `src/components/`: reusable UI pieces (shared, dashboard, boards).
- `src/layouts/`: app shell layouts (`MainLayout.vue`, `DashboardLayout.vue`).
- `src/stores/`: Pinia stores (`auth`, `user`, `project`, `board`, etc.).
- `src/router/`: router setup and route definitions.
- `src/composables/`, `src/utils/`, `src/constants/`: reusable logic and helpers.
- `src/css/` and `public/`: global styles and static assets.
- Build/deploy config lives in `quasar.config.js`, `docker-compose.yml`, and `.gitlab-ci.yml`.

## Build, Test, and Development Commands

- `npm install`: install dependencies.
- `npm run dev`: start local dev server via Quasar (`quasar dev`).
- `npm run build`: production build (`quasar build`).
- `npm run lint`: run ESLint on `src*/**/*.{js,cjs,mjs,vue}`.
- `npm run format`: apply Prettier across JS/Vue/SCSS/HTML/MD/JSON.
- `npm test`: currently a placeholder (always exits successfully); do not treat as real coverage.

## Coding Style & Naming Conventions

- Follow `.editorconfig`: UTF-8, LF, 2-space indentation, trim trailing whitespace.
- Prettier rules: no semicolons, single quotes, `printWidth: 100`.
- ESLint uses Quasar + Vue essential rules; fix lint issues before opening a PR.
- Vue SFCs, layouts, and pages use PascalCase filenames (example: `BoardDetailPage.vue`).
- Keep store/composable/helper filenames descriptive and consistent (`useXxx.js`, domain-based store names).

## Testing Guidelines

- There is no configured automated test framework yet.
- Minimum requirement: run `npm run lint` and validate impacted flows manually in `npm run dev`.
- For UI-heavy changes, verify key pages you touched (dashboard, boards, auth/settings if affected).
- If you add tests later, place them near related modules or under a dedicated `tests/` directory.

# Commit & Pull Request Guidelines

- Recent history favors short, imperative commit subjects (example: `add board archive sidebar...`).
- Use focused commits per feature/fix; avoid mixing refactors with behavior changes.
- PRs should include:
  - clear summary and scope,
  - linked issue/task ID (if available),
  - screenshots or short recordings for UI changes,
  - notes on config/env updates (for example `.env.local` usage),
  - confirmation that lint/build pass locally.
