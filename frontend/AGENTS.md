<!-- BEGIN:nextjs-agent-rules -->
# AGENTS.md

Instructions for AI coding agents working in this repository. Follow these rules exactly unless the user explicitly asks otherwise. **In case of conflict, repository-specific rules (Section 1–3) take precedence over general project rules (Section 4+).**

---

## 1. Core Principles

- Use TypeScript strictly. Do not use `any`.
- Keep a single responsibility per function/hook, kept simple and focused.
- Use TanStack Query (`useQuery`, `useMutation`) for all server state / data operations.
- Use Axios from `src/lib/api.ts` — never create ad-hoc Axios instances in feature files.
- Keep server-only and client-only code separated.

## 2. API Integration (applies to `src/**/*.{ts,tsx}`)

### File placement

- API response/request types go in `src/types` (kebab-case file names, e.g. `user.ts`).
- Export shared types from `src/types/index.ts` when reused.
- API hooks go under `src/lib/api/<domain>/`.
- Hook/function names use camelCase and start with `use` for hooks.

### Axios usage

```ts
import { api as instance } from "@/lib/api";
```

- Prefer `instance.get/post/put/delete` with an explicit response generic.
- Base URL, timeout, and auth header are managed centrally in `src/lib/api.ts`.

### Query hooks (GET)

- Add `"use client"` at top of hook files.
- Use `useQuery`; include params in the query key.
- Return `response.data` only.
- Provide an optional `enabled` flag.

```ts
"use client";

import { useQuery } from "@tanstack/react-query";

import { api as instance } from "@/lib/api";
import type { ExampleQueryParams, ExampleResponse } from "@/types";

export const useGetExample = (params?: ExampleQueryParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["example", params],
    enabled,
    queryFn: async () => {
      const response = await instance.get<ExampleResponse>("/example", {
        params
      });
      return response.data;
    }
  });
};
```

### Mutation hooks (POST/PUT/DELETE)

- Use `useMutation`.
- Type payload and response explicitly.
- Parse/validate important fields before storing in app state.

```ts
"use client";

import { useMutation } from "@tanstack/react-query";

import { api as instance } from "@/lib/api";
import type { CreateExamplePayload, CreateExampleResponse } from "@/types";

export const useCreateExample = () => {
  return useMutation({
    mutationFn: async (payload: CreateExamplePayload) => {
      const response = await instance.post<CreateExampleResponse>("/example", payload);
      return response.data;
    }
  });
};
```

### Query params

- Do not send empty params. Exclude `undefined`, `null`, empty string, whitespace-only string.
- Keep the sanitizer close to the hook when endpoint-specific.

```ts
const cleanParams = <T extends Record<string, unknown>>(params?: T): Partial<T> => {
  if (!params) return {};

  const result: Partial<T> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "") continue;

    result[key as keyof T] = value as T[keyof T];
  }

  return result;
};
```

Use as: `params: cleanParams(params)`

### Search & debounce

- Debounce user input in UI components, not in API hook internals.
- Use `useDebounceValue` from `usehooks-ts` with a 600ms delay.
- Update query params only when the debounced value changes.
- Reset page to `1` on search/filter changes.

### Auth + cookies

- Client cookie reads/writes use `src/lib/cookie-client.ts`.
- Do not throw at module top-level for client helpers.
- Guard browser-only operations with `typeof window !== "undefined"`.
- Server auth checks use `src/lib/auth.ts` (`next/headers`).
- Never import `next/headers` into client-executed modules.

### HOC + route guards

- Use `withPrivateRoute` for authenticated sections.
- Use `withPublicRoute` for public pages that should redirect authenticated users.
- Use `withLayout` to wrap route groups with layout components.
- Apply guards at route-group layout level when possible.
- Reference: `src/helpers/with-route-guard.tsx`, `src/app/(private)/layout.tsx`, `src/app/(public)/layout.tsx`.

### Error handling

- Handle request failures with `axios.isAxiosError<T>()`.
- Prefer the API-provided `message`, or the first validation message if available.
- Show user feedback (toast) in UI event handlers.
- Do not swallow errors silently.

### Integration checklist (required for every new API integration)

1. Add/update request and response types in `src/types`.
2. Create/update hook in `src/lib/api/<domain>/`.
3. Add a params cleaner if the endpoint has optional filters.
4. Wire the hook into the page/component with loading and empty states.
5. Add debounce for search inputs where needed.
6. Reset pagination when filters/search change.
7. Ensure no server/client boundary violations.
8. Run diagnostics and fix all type errors in changed files.
9. Remove temporary `console.log` before finalizing.

### Do / Do not

**Do:** keep query keys deterministic; keep hooks reusable and UI-agnostic; keep transformations explicit and typed.

**Do not:** send empty query params; mix mock data contract with live API contract; access browser globals without guards; import server-only modules in client hooks/components.

---

## 3. Project-Wide Rules (applies to all files)

### General

- Remove unnecessary imports and `console.log` statements before commits.
- Commit messages must follow Conventional Commits (`feat:`, `fix:`, `refactor:`, etc.).
- ESLint and Prettier rules must be fully enforced.
- Prettier settings: `singleQuote: false`, `trailingComma: none`, `printWidth: 100`, import ordering and separation enabled.

### TypeScript

- `any` must not be used.
- All type definitions live under `src/types`, files in kebab-case (e.g. `user.ts`, `site-config.ts`).
- Type/interface names use PascalCase, no `Type` suffix (e.g. `User`, `SiteConfig`). Prefer `const user: User =` over `const user: UserType =`.
- Use `interface` for object shapes; use `type` for unions or advanced type compositions.

### Environment variables

- Managed with `@t3-oss/env-nextjs`.
- `src/env.ts` is the single source of truth across the project.
- Validate with Zod; use the `NEXT_PUBLIC_` prefix for client-exposed vars.

### Functions & hooks

- Custom hooks always start with `use` (e.g. `useUsers`).
- Custom hook files live under `src/hooks`, named in kebab-case (e.g. `use-users.ts`).
- Hook function names are camelCase.
- Functions have a single responsibility, kept simple and focused.

### State management

- Use React Context providers for global state.
- Provider files live under `src/providers`, named PascalCase (e.g. `CounterProvider.tsx`).
- Provider hooks are named in the `useX` form (e.g. `useCounter`).

### Data fetching

- HTTP requests use Axios, through the `get`, `post`, `put`, `del` helpers in `src/lib/api.ts`.
- Use TanStack Query hooks (`useQuery`, `useMutation`) across the project.
- Handle errors with try/catch and user feedback (toasts).

### Components & structure

- All file/folder names are kebab-case (e.g. `locale-switcher`, `query-client.ts`).
- Component files (widgets, layouts) are PascalCase (e.g. `UserList.tsx`).
- UI components are kebab-case (e.g. `button.tsx`).
- Inside components/widgets folders: folder names kebab-case, component files inside PascalCase.
- Prop/variable names are intent-driven (e.g. `onSubmit`, `isLoading`, `variant`).
- Shadcn/UI components under `components/ui` are kept as-is; do not modify them.
- Reusable components go under `src/components`; domain-specific components go under `src/app/<domain>/component/` (e.g. `src/app/user/component/UserList.tsx`).

### Naming conventions

| Item | Convention | Example |
|---|---|---|
| Folders & base files | kebab-case | `locale-switcher` |
| Components (widgets, layouts, pages) | PascalCase | `UserList.tsx` |
| UI components | kebab-case | `button.tsx` |
| Helper/util files | kebab-case | `format-currency.ts` |
| Hook files | kebab-case, `use-` prefix | `use-users.ts` |
| Hook functions | camelCase, `use` prefix | `useUsers` |
| Data files (`src/data`) | kebab-case | `user.ts`, `stack.ts` |
| Icon components | PascalCase, `Icon` suffix | `ReactIcon` |
| Types/interfaces (`src/types`) | PascalCase, no `Type` suffix, kebab-case files | `User` in `user.ts` |
| Constants | SNAKE_CASE | `DEFAULT_LOCALE` |

### Utilities, helpers & constants

- Reusable functions live under `src/utils`.
- Domain-specific/computation-focused functions live under `src/helpers`.
- Constants live under `src/constants`, never inside components.
- Static/mock data lives under `src/data`; variable names may end with `Data` (e.g. `stackData`).

### Styling & design

- Tailwind CSS exclusively; inline styles are forbidden.
- Prefer soft and pastel tones in the design.
- Layout, spacing, and alignment handled with Tailwind utility classes.

### Accessibility (a11y)

- All components must comply with accessibility standards.
- Use appropriate `aria-*` attributes where necessary.
- Wrap meaningful images with semantic `<figure>` elements for proper context/captions.

### Icons

- All icons sourced from `lucide-react`. Do not mix icon libraries.

### Project defaults

- Use Next.js App Router APIs for cookie operations: server-side use `cookies()` (`next/headers`), middleware, or `NextResponse.cookies.set` inside route handlers; client-side use `src/lib/cookie-client.ts` helpers.
- Use `src/lib/date.ts` helpers for date formatting; use `Intl` for number/currency formatting when needed.
- Use `@sindresorhus/slugify` for slug generation.
- General-purpose helper hooks may come from `usehooks-ts` (e.g. `useLocalStorage`, `useMediaQuery`, `useDebounceValue`).

---

## 4. Precedence

If any rule in this file conflicts with another, repository-specific rules (Sections 1–2) take precedence over the general project rules (Section 3).
<!-- END:nextjs-agent-rules -->
