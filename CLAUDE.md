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

- Route guards: `isAuthorised()` checks auth token, `isAdmin()` verifies admin role
- Routes: `/` (main), `/calendar`, `/login`, `/dashboard` (admin-only)

### State Management (`/src/stores/`)

- `auth.js` - JWT tokens, refresh logic, localStorage persistence
- `user.js` - Current user & users list CRUD
- `project.js` - Projects CRUD
- `content-plan.js` - Content plans with date/status filtering
- `theme.js` - Dark/light theme toggle

### API Layer (`/src/boot/axios.js`)

- Base URL: `https://api.khsystem.uz/api` (via `.env`)
- Content-Type: `application/ld+json` (default), `application/merge-patch+json` (PATCH)
- Auto token refresh on 401 responses

### Component Organization

- `/src/layouts/` - Page wrappers (MainLayout, DashboardLayout)
- `/src/pages/` - Route-mounted components
- `/src/components/` - Reusable UI, with `/dashboard/` and `/dashboard/shared/` subdirs
- `/src/composables/` - Vue 3 composition functions for reusable logic

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
