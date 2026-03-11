# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vue 3 + Quasar Framework CRM application for kh-agency. Single-page application with role-based access control, featuring project management, content planning, and user management.

## Commands

```bash
npm run dev       # Development server with hot-reload
npm run build     # Production build (output: dist/spa)
npm run lint      # ESLint check
npm run format    # Prettier formatting
```

## Technology Stack

- **Framework:** Vue 3 (Composition API with `<script setup>`) + Quasar v2
- **Build:** Vite via @quasar/app-vite
- **Routing:** Vue Router v4 (history mode)
- **State:** Pinia v3
- **HTTP:** Axios with JWT token interceptors
- **i18n:** Vue-i18n v11
- **Styling:** SCSS with CSS variables for theming

## Architecture

### Routing (`/src/router/routes.js`)

Route guards:
- `isAuthorised()` — redirects to `/login` if no auth token
- `isAdmin()` — redirects to `/` if not admin
- `isNotAdmin()` — admin → `/dashboard`, SMM → `/` (IndexPage), designer/editor/operator → `/boards`

Routes: `/` (SMM home), `/calendar`, `/login`, `/dashboard` (admin), `/boards`, `/boards/:id`, `/profile`

### State Management (`/src/stores/`)

- `auth.js` - JWT tokens, refresh logic, localStorage persistence
- `user.js` - Current user & users list CRUD; role getters: `isAdmin`, `isSMM`, `canCreateBoard`, `canDeleteBoard`, `canManageList`
- `project.js` - Projects CRUD
- `content-plan.js` - Content plans with date/status filtering
- `board.js` - Boards/cards state (TODO: replace mock data with API)
- `theme.js` - Dark/light theme toggle

### API Layer (`/src/boot/axios.js`)

- Base URL from `VITE_API_URL` in `.env`
- Content-Type: `application/ld+json` (default), `application/merge-patch+json` (PATCH)
- Auto token refresh on 401 responses

### Component Organization

- `/src/layouts/` - Page wrappers (MainLayout, DashboardLayout)
- `/src/pages/` - Route-mounted components, including `boards/` (BoardsListPage, BoardDetailPage)
- `/src/components/` - Reusable UI, including `boards/` (BoardColumn, BoardCardItem, CardDialog)
- `/src/composables/` - Vue 3 composition functions for reusable logic
- `/src/constants/cardStatus.js` - `CARD_STATUS`, `CARD_STATUS_OPTIONS`, `CARD_STATUS_COLORS`, `LIST_COLORS`, `CARD_COLORS`

### Boards Feature (Trello-style Kanban)

- Dark gradient background (`linear-gradient(135deg, #0f0c29, #302b63, #24243e)`) on all board pages
- Liquid glass styling for columns/cards/buttons: `rgba(255,255,255,0.06)` + `backdrop-filter: blur(16px)`
- `CardDialog` — card editor with status badge, rich-text description (q-editor view/edit modes), list selector, read-only CardLog sidebar
- CRUD permissions: Admin — full CRUD on boards and lists; SMM — full CRUD on lists; others — read-only on lists

### Styling (`/src/css/`)

- `app.scss` - Global styles
- `dashboard.scss` - Dashboard-specific styles
- `quasar.variables.scss` - Quasar CSS variables
- Theme CSS variables: `--bg-primary`, `--bg-secondary`, `--text-primary`, etc.

### Types (`/src/types/dashboard.ts`)

- `StatusType` - 'NOT_PUBLISHED', 'PUBLISHED', 'CANCELED', 'RESCHEDULED'
- `User`, `Project`, `ContentPlan` - Core domain interfaces
- `ApiResponse<T>` - Generic response wrapper with `member`, `totalItems`

## Key Patterns

- API calls in store actions return Promises
- Composables manage loading/error states with reactive refs
- Routes use lazy loading: `() => import('path/to/component.vue')`
- Mobile views use `show-mobile-only` class with MobileCard components
- PDF export via jspdf, drag-drop via vuedraggable

## Rules

- Always use Context7 MCP when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.
