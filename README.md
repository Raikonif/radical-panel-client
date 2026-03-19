# Radical Panel Client

Internal editorial panel for managing bilingual content in Supabase. The app is focused on three content domains:

- Clinical cases with structured metadata and image attachments
- Videos with localized title/description metadata
- Podcasts with localized title/body/slug content

Editors sign in with Supabase email OTP, review content in a dashboard, and create, update, or delete records from modal-based CRUD flows. The UI supports Spanish and English, and content entries can generate the complementary translation automatically during save.

## Current purpose

This project is the client application for a content operations workspace. Its main job is to let an authenticated editor:

- See operational counts and recent changes in a dashboard
- Manage cases, videos, and podcasts from a single interface
- Edit content in Spanish or English and switch the viewing language in-place
- Upload media assets through an external upload API
- Persist records in Supabase
- Generate the alternate language version with DeepL-backed translation helpers

## Tech stack

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form + Zod
- Tailwind CSS v4
- Supabase JS
- Sonner for toast feedback

## General architecture

### 1. App shell and routing

- `src/app/App.tsx` mounts the provider tree and router.
- `src/app/providers/AppProviders.tsx` wires React Query, UI language, theme, auth, and global toasts.
- `src/app/router.tsx` defines a protected application shell and lazy-loaded routes for `dashboard`, `cases`, `videos`, and `podcasts`.
- `src/components/layout/AppShell.tsx` owns the navigation, prefetch behavior, session controls, and responsive shell layout.

### 2. Authentication

- `src/features/auth/AuthProvider.tsx` handles Supabase session restoration, OTP login, verification, and sign-out.
- Protected routes require a valid Supabase user before rendering the panel.
- Supabase client setup lives in `src/lib/supabase/client.ts`.

### 3. Data layer

- `src/features/content/api.ts` is the main client-side data access layer.
- It reads and writes directly to Supabase tables for:
  - `cases`
  - `cases_translations`
  - `images_cases`
  - `videos`
  - `videos_translations`
  - `podcasts`
  - `podcasts_translations`
- `src/features/content/queries.ts` defines TanStack Query keys, query options, and prefetch helpers.
- Feature-level mutations keep the dashboard and list views in sync after CRUD operations.

### 4. Feature modules

- `src/pages/dashboard/DashboardPage.tsx` shows counts and recent records across all content types.
- `src/pages/cases/CasesPage.tsx` manages clinical cases, including images and structured medical fields.
- `src/pages/videos/VideosPage.tsx` manages video records and localized metadata.
- `src/pages/podcasts/PodcastsPage.tsx` manages podcast records, publication status, and localized copy.
- Editors work inside reusable panel/modal patterns built from `src/components/workspace/*` and `src/components/ui/*`.

### 5. Translation flow

- `src/features/content/auto-translation.ts` saves the editor-authored record first, then attempts to create or update the opposite-language translation.
- `src/features/translation/api.ts` contains the DeepL integration used by the client-side translation flow.
- Translation currently supports `es` and `en` content variants.

### 6. Media upload flow

- `src/features/content/upload.ts` sends files to an external upload endpoint and converts the returned object key into a public asset URL.
- Case, video, and podcast editors use this upload helper before persisting the final record metadata.

### 7. Localization and theming

- `src/features/i18n/*` provides UI copy and the interface language switcher.
- `src/features/theme/*` provides theme state and theme switching.
- UI language is separate from content language:
  - UI language changes labels and messages in the app
  - Content language changes which translation of a case, video, or podcast is being viewed or edited

## Supabase and external services

The client depends on:

- Supabase Auth for email OTP login
- Supabase database tables for content storage
- An upload API for media files
- DeepL for automatic complementary translations

The repository also includes Supabase Edge Functions under `supabase/functions/` for translation and case deletion support, but the current frontend data flow is centered on the client-side API modules in `src/features/*`.

## Environment variables

Copy `.env.example` to `.env` and configure:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_UPLOAD_API_BASE_URL=
VITE_UPLOAD_PUBLIC_BASE_URL=
VITE_DEEPL_API_KEY=
VITE_DEEPL_API_URL=
```

## Development

```bash
pnpm install
pnpm dev
```

Other scripts:

```bash
pnpm build
pnpm lint
pnpm test
pnpm preview
```
