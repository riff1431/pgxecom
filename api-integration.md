---
applyTo: "src/**/*.{ts,tsx}"
---

# API Integration Guide For AI Agents

This document defines how AI should integrate new APIs in this project.
Follow these rules exactly unless the user explicitly asks otherwise.

## 1. Core Principles

- Use TypeScript strictly. Do not use `any`.
- Keep a single responsibility per function/hook.
- Use TanStack Query for server state.
- Use Axios from `src/lib/api.ts`.
- Keep server-only and client-only code separated.

## 2. File Placement Rules

- API response/request types go in `src/types` with kebab-case file names.
- API hooks go under `src/lib/api/<domain>/`.
- Hook/function names use camelCase and start with `use` for hooks.
- Export shared types from `src/types/index.ts` when reused.

## 3. Axios Rules

- Import Axios instance as:

```ts
import { api as instance } from "@/lib/api";
```

- Prefer `instance.get/post/put/delete` with explicit response generic.
- Do not create ad-hoc Axios instances in feature files.
- Base URL, timeout, and auth header are managed centrally in `src/lib/api.ts`.

## 4. TanStack Query Rules

### Query hooks (GET)

- Add `"use client"` at top of hook files.
- Use `useQuery`.
- Include params in query key.
- Return `response.data` only.
- Provide optional `enabled` flag.

Template:

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

Template:

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

## 5. Query Params Rules

- Do not send empty params.
- Exclude: `undefined`, `null`, empty string, whitespace-only string.
- Keep sanitizer close to hook when endpoint-specific.

Template:

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

Use as:

```ts
params: cleanParams(params)
```

## 6. Search And Debounce Rules

- Debounce user input in UI components, not in API hook internals.
- Use `useDebounceValue` from `usehooks-ts` with 600ms delay.
- Update query params only when debounced value changes.
- Reset page to `1` on search/filter changes.

## 7. Auth + Cookie Rules

- Client cookie reads/writes use `src/lib/cookie-client.ts`.
- Do not throw at module top-level for client helpers.
- Guard browser-only operations with `typeof window !== "undefined"`.
- Server auth checks use `src/lib/auth.ts` (`next/headers`).
- Never import `next/headers` into client-executed modules.

## 8. HOC + Route Guard Rules

- Use `withPrivateRoute` for authenticated sections.
- Use `withPublicRoute` for public pages that should redirect authenticated users.
- Use `withLayout` to wrap route groups with layout components.
- Apply guards at route-group layout level when possible.

Reference:

- `src/helpers/with-route-guard.tsx`
- `src/app/(private)/layout.tsx`
- `src/app/(public)/layout.tsx`

## 9. Error Handling Rules

- Handle request failures with `axios.isAxiosError<T>()`.
- Prefer API-provided `message` or first validation message if available.
- Show user feedback (toast) in UI event handlers.
- Do not swallow errors silently.

## 10. Integration Checklist (Required)

When integrating a new API, AI must complete all steps:

1. Add/Update request and response types in `src/types`.
2. Create/update hook in `src/lib/api/<domain>/`.
3. Add params cleaner if endpoint has optional filters.
4. Wire hook into page/component with loading and empty states.
5. Add debounce for search inputs where needed.
6. Reset pagination when filters/search change.
7. Ensure no server/client boundary violations.
8. Run diagnostics and fix all type errors in changed files.
9. Remove temporary `console.log` before finalizing.

## 11. Do And Do Not

Do:

- Keep query keys deterministic.
- Keep hooks reusable and UI-agnostic.
- Keep transformations explicit and typed.

Do not:

- Send empty query params.
- Mix mock data contract with live API contract.
- Access browser globals without guards.
- Import server-only modules in client hooks/components.