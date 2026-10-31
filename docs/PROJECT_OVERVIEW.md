# SmartSchool Frontend: Project Overview

This file is the single "catch-up" document for this repo: what SmartSchool is, how the frontend
is structured, what has actually been built (as opposed to only planned), why each decision was
made, and what is still missing. Read this before touching the code after a break.

The backend has its own equivalent doc at `smartschool-backend/docs/PROJECT_OVERVIEW.md`, read
that too if you need the full picture, since almost every screen here is a thin layer over an API
described there.

---

## 1. What SmartSchool is

A multi-tenant School Management SaaS. This frontend is the one app used by four kinds of people,
routed to different areas of the same codebase based on role:

- **Platform admin**, `/platform`, manages Accounts (customers) and the Organizations (schools)
  under them. Never touches a school's day-to-day data.
- **School admin**, `/:organizationId/admin/*`, everything about running one school: students,
  staff, classes, attendance, homework, notices, fees, exams, PTM, leave requests.
- **Teacher**, `/:organizationId/teacher/*`, their own dashboard, PTM slots.
- **Parent**, `/:organizationId/parent/*`, their children's homework, fees, results, leave
  requests, PTM booking, notices.

`:organizationId` in the URL is the tenant boundary, every API call the frontend makes for a
school-scoped screen is scoped to that id.

## 2. Stack

- **Vite 6 + React 18 + TypeScript**
- **`@tanstack/react-query` v5**, the data layer (migrated from v3; see §6 for what the migration
  did and didn't change)
- **`react-router-dom` v6**
- **Tailwind 3** + Radix primitives (`@radix-ui/react-dialog`, `-alert-dialog`, `-avatar`,
  `-popover`, `-switch`, `-select`, `-tabs`, `-slot`, `-label`), Headless UI was fully removed;
  every modal/select/tab in the app is now built on the one primitive library, via shared
  `shared/ui/kit/{dialog,select,tabs,form,input,textarea}.tsx` wrappers
- **`react-hook-form` + `zod`**, every real form in the app (see §6)
- **`i18next`** (English + Hindi), most (not all) copy is translated via `t()`
- **`socket.io-client`**, real-time notification push, mirrors the backend's Socket.IO server
- **`axios`**: one shared client (`src/shared/api/api-client.ts`)
- **`highcharts`**, dashboard charts
- **`vitest` + React Testing Library**, test setup (see §7)

## 3. Folder structure: Feature-Sliced Design

The app follows [Feature-Sliced Design](https://feature-sliced.design), the same layout as the CultureX `apps/creators` app.
A layer imports only from layers below it, and only through a slice's public `index.ts`; ESLint enforces both
(`no-restricted-imports` in `eslint.config.js`).

```
src/
  main.tsx                      boot: query client, error boundary, styles
  app/                          app.tsx, router/ (route tree, guards, shared-pages), layout/, styles/, i18n
  pages/                        one folder per screen, grouped by role: admin/ teacher/ parent/ auth/ support/
  widgets/                      big page blocks: header, sidebar, footer, billing-banner, mobile-notice, module-gate
  features/                     user actions reused by several pages: section-picker, marks-entry, letterhead,
                                export-dialog, notice-modal, support-dialog, theme, academic-filter
  entities/                     one slice per domain: student, exam, fee, attendance, academics, session, ...
  shared/                       no business logic: ui/ (kit primitives, data-table, date pickers, form-fields),
                                api/ (the one axios client + query client), lib/ (helpers, hooks, API routes),
                                config/, types/ (API envelope, paging, roles, permissions)
  test/                         vitest + RTL setup and helpers
```

Inside a widget, feature or entity, files sit in segments by role:

```
features/support-dialog/
  index.ts                      public API: the only thing other layers import
  ui/support-dialog.tsx         view
  model/support-dialog-controller.ts   state, queries, handlers
entities/fee/
  index.ts                      public API
  api/fees-service.ts           axios calls + react-query hooks (named exports)
  model/types.ts                the domain's TypeScript types
```

### Pages: view + controller + schema

```
pages/admin/fees/
  index.ts              default export of the page, used by the router
  fees.tsx              JSX only: reads everything from the controller hook
  fees-controller.ts    all state, react-query hooks (from entities) and handlers
  fees.schema.ts        zod schemas and form defaults
  tabs/ components/     pieces used only by this page
```

A piece needed by two pages becomes a feature (for example `features/letterhead`, used by School settings
and certificate issue); pages never import from each other.

## 4. Multi-tenancy on the frontend

`:organizationId` lives in the route path for every tenant-scoped screen, read via `useParams()`
in each feature's controller and passed into that feature's service hooks, which build the request
URL with it (e.g. `${APIS_ROUTES.FEE_SERVICE}/${organizationId}/...`). There is no global
`TenantProvider` yet (see §6), each controller independently reads `organizationId` from the URL.
Route guards in `app/router/route-guards.tsx` block access to a role/tenant combination the logged-in
user doesn't actually have membership in.

## 5. Feature-by-feature: what's built, why, and how

### Auth

Login, forgot password, an organization picker (for a user with memberships in more than one
school), and, built this project, previously entirely missing, a **set-password** page
(`pages/auth/set-password/`) for invited users: reads `?token=` from the URL, mirrors Login's
visual style, posts to the backend's `set-user-password` endpoint. Before this existed, the
invite-email flow was broken end-to-end because there was nowhere for the emailed link to go.

### Students

Full CRUD, a 2-step create wizard (basic details → parent link), CSV bulk import, search/filter/
pagination. Enrollment history (transfer, withdraw) and the year-end **promotion workflow** UI
were added this project, the backend for these existed with no frontend consumer at all until
then.

### Attendance

Daily marking screen: pick academic year → class → section → date, mark each student
present/absent/late/excused with an optional reason, bulk "mark all present/absent", save. A
same-day **CSV export** button exports the currently-displayed roster + statuses.

**Attendance Report tab** (built this session), the page now has two tabs, "Mark Attendance" and
"Attendance Report". The report tab reuses the same academic-year/class/section pickers but swaps
the single date field for a from/to range, and shows a per-student present/absent/late/excused/%
table for that section over the range, with its own CSV export. This closes the gap where the only
attendance view was one day at a time, a teacher or admin can now actually answer "who's below X%
this term" instead of eyeballing daily screens one at a time. Backed by a new
`GET .../section-report` endpoint (see the backend doc).

Separately, the admin student-detail page's attendance card, previously a lifetime summary with
no way to narrow it, now has its own from/to date filter and a scrollable day-by-day log
(date/status/reason) beneath the summary tiles, using the existing per-student history endpoint's
`from`/`to` query params, which the frontend simply hadn't been passing before.

### Homework

Teacher creates homework with attachments and a due date; parent/student side lists and views it.

### Notices

Publish/list/attachments, including AI-assisted content generation on the create form.

### Notifications

A bell icon (below the profile section in the sidebar) opens a **shadcn/Radix `Sheet`** sliding in
from the right, listing in-app notifications with read/unread state and mark-all-read. Backed by
`notification-context.tsx`, which holds the list + unread count and subscribes to the backend's
Socket.IO channel for live push, a new notification appears in the bell the instant the backend
creates it, no polling or refresh needed. This was built and fully tested (RTL) as its own
feature phase before leave-requests began.

### Leave requests

Parent submits a leave request for their child (with optional attachment) → teacher/admin
approves or rejects with a note → parent sees the decision, both sides notified. A real
**authorization-ordering bug** was found and fixed during a code review of this feature (an
authorization check that ran after a side effect instead of before it), worth knowing if you're
auditing similar flows elsewhere.

### PTM (Parent-Teacher Meetings)

Teacher creates an event and generates bookable slots; parent picks a child and books a slot,
capacity-enforced; both sides can see their agenda.

### Fees

Admin: fee heads → fee structures (with installments) → assign to students → record payments →
reverse a payment → **grant a concession** (built this project, a form + a "concessions granted"
history table, using the same `useRef(crypto.randomUUID())` idempotency-key pattern as recording a
payment, so a double-click never double-charges or double-discounts) → payment ledger with a
**CSV export** button (added this project). Parent: view their child's fee summary, installments,
concessions and balance.

### Exams & Results

Admin: grading schemes → exams → exam subjects → marks entry (theory/practical, mark absent) →
verify → publish (locks marks, computes results), plus a **marks-sheet CSV export** button
(added this project). Parent: view published results per child, with a **"Download report
card"** link (added this project) that fetches a real generated PDF from the backend and saves it
, not just an on-screen table.

### Platform Console

Built this project, entirely new: `/platform`, a non-tenant area, guarded by
`user.isPlatformAdmin`, where the platform admin creates Accounts (customers), adds Organizations
(schools) to an account, and suspends/reactivates an account (which cascades to every school under
it on the backend). This is the actual "I sell to a school, create their tenant, hand it over"
workflow described by the product owner.

### Dashboards

Role-scoped stat/chart screens (Highcharts) for admin/teacher/parent, largely pre-existing;
export buttons were **not** added here (the CSV export work targeted list/report screens, not the
dashboard charts themselves, see gap list, §8).

## 6. Known, deliberately-deferred debt

**`react-query` v3 → `@tanstack/react-query` v5, migrated.** Every one of the 49 files that used
to import from `react-query` now imports from `@tanstack/react-query`, and every `useQuery`/
`useMutation` call was converted from v3's positional-argument form to v5's single object-argument
form (`{queryKey, queryFn, ...}` / `{mutationFn, ...}`), `cacheTime` renamed to `gcTime`,
`invalidateQueries(key)` calls updated to `invalidateQueries({queryKey: key})`, and every
`.isLoading` read on a **mutation** result renamed to `.isPending` (queries keep `.isLoading`, v5
retains it there as an alias). Two real v3→v5 API removals were fixed in the same pass: `useQuery`
no longer exposes `.remove()` (the handful of call sites that used it to force a refetch after a
mutation now call `.refetch()` instead, which was already the pattern used elsewhere in the same
files). **What this migration deliberately did _not_ do**: turn caching on. Every query still runs
with `gcTime: 0`, exactly as before, flipping that on safely needs tenant-scoped query keys and a
`TenantProvider` done at the same time (see the bullet below), not as a side effect of a version
bump. Verified via a full `tsc -b` across the whole app (not just the changed files, the compiler
checks every hook's return type against every place it's used, which is what caught both `.remove()`
call sites and all 54 mutation `.isLoading` reads), a clean production build, and the existing test
suite still green.

**`react-hook-form` + `zod`, done.** Every real `<form>` in the app (16 of them, auth, every
admin CRUD modal, the 2-step student wizard shared across two separate controllers, the notice
composer with its nested audience-targeting object, homework/leave-request file uploads, the
profile edit/change-password cards) now uses `useForm` + `zodResolver` + a shared
`components/ui/form.tsx` (`Form`/`FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormMessage`,
the standard pattern for this combination) instead of hand-rolled `useState` + manual
`if (!x) toast.error(...)` checks. Every text/date/textarea input also now goes through shared
`components/ui/input.tsx` / `textarea.tsx` primitives instead of a repeated `inputClass` string per
file.

`pages/admin/settings/profile/profile.tsx`'s "Edit profile" and "Change password" cards were
initially skipped in this pass because they weren't wired to any submit handler at all (no
`onSubmit`, uncontrolled `defaultValue` inputs, one button was `type="button"` with no `onClick`)
, converting fake fields to real validation would have implied they saved when they didn't. Fixed
properly instead: two new self-service backend endpoints were built (`PATCH /auth/v1/user/profile`
and `PUT /auth/v1/user/change-password`), both authenticated-self-only, no tenant/permission gate
, deliberately **not** reusing the admin `updateUserDetails` endpoint, which requires a tenant
`canUpdate` permission a plain parent/teacher editing their own name would never hold, and which
also accepts `role`/`permissions` fields with no place for those on a self-service form. Verified
live end-to-end against a real running server with a throwaway user (created, signed in for a real
token, profile updated, wrong-current-password rejected with 403, weak-new-password rejected by
the shared `strongPassword` zod rule, correct change accepted, confirmed the _current_ session
survives, only other sessions are revoked, unlike the emailed-token reset flow which kills
everything, confirmed old password stops working and new one signs in), 8/8 checks passed, test
user cleaned up afterward.

Real bugs the conversion surfaced and fixed in passing: `pages/auth/login/login-controller.ts` had
an `error` state that was only ever reset to `""` and never actually set on failure, the error
banner in the JSX never rendered anything (dead code; `useError`'s toast was already covering it).
`IStudentFormData.parentName`/`phoneNumber` were typed optional even though the UI always requires
them (`required` HTML attribute, non-optional in practice), corrected to match reality.

**Package hygiene, done.** Removed genuinely dead packages: `crypto-js` (0 real usages, only a
never-applied cipher constant), the entire legacy `src/services/` folder (a second axios client +
duplicate student CRUD, 0 imports anywhere), `@types/react-router-dom` (stale v5 types on a v6
app), `@types/lodash` (only the two specific `lodash.debounce`/`lodash.get` sub-packages are
actually used). `react-error-boundary` was installed but unused, instead of deleting a good,
well-known package, wired it up as a real top-level `ErrorBoundary` (previously an uncaught render
error showed a blank white screen). Also caught and fixed a real latent bug: the existing
`sheet.tsx`/`alert-dialog.tsx` already used `animate-in`/`fade-in-0` utility classes, but the
plugin that defines them (`tailwindcss-animate`) was never installed, so those animations had
silently been no-ops the whole time.

**Cache config, done.** `main.tsx` now sets `staleTime: 5min` / `gcTime: 10min` once, at the
`QueryClient` instance level, not per-query. Getting there required removing 24 per-file
`gcTime: 0` overrides that were silently defeating any global config, which in turn exposed 4 real
bugs: `GET_ALL_USER`, `GET_NOTICE_LIST`, `GET_STUDENT_PROFILE` and `GET_PARENT_DETAILS` query keys
were missing `organizationId` and their own filter params, harmless when caching was off, a
genuine stale/cross-tenant risk once it was on. Fixed by including them in the key.

**`TenantProvider`, done.** `context/tenant-context.tsx`, mounted by `ProtectedRoute` (in
`routes-controller.tsx`), inside the `:organizationId` route segment. It reads the id from the
route, confirms it's actually one of the user's real memberships (`useGetAllOrganizations`, the
same query the org-picker page already used), and redirects to `/not-access` if not, platform
admins bypass this, since `resolveTenant()` on the backend already grants them explicit, audited
access to any named tenant. Exposes `useTenant()` (`{organizationId, organization, organizations}`)
for new code; existing `useParams()` calls across ~50 files were left alone since they already read
the same route param correctly, this closes a real gap (an admin at School A typing School B's id
into the address bar rendered the shell anyway, with the backend's 403s as the only actual guard,
not a clean redirect), not a cosmetic one. **Consolidated into the route guard** rather than added
alongside it, per explicit direction: `ProtectedRoute` used to only check role from a cookie; it
now checks role _and_ wraps children in `TenantProvider` for the real tenant check. Found and fixed
a second, related real bug while in there: `PublicRoute`'s already-logged-in redirect went to
`/${role}/dashboard` with no `:organizationId` at all, a route that matches nothing, so it 404'd
into `/not-access` (this was called out in the original architecture plan and never actually
fixed), now reads the `organizationId` cookie set at login and redirects properly, or to
`/organization` (the picker) if no tenant was chosen yet. Covered by 4 new tests
(`tenant-context.test.tsx`): loading state, valid membership, invalid membership → redirect,
platform-admin bypass, all passing, full suite now 22/22, `tsc -b` and build both clean.

**`@/` path alias, done.** Added to both `vite.config.ts` (`resolve.alias`) and `tsconfig.app.json`
(`paths`), then every existing relative import of two or more `../` segments was codemodded to
`@/...` (147 files, 437 import specifiers), same-directory (`./foo`) and one-level-up (`../foo`)
imports were deliberately left alone, since those are already short and clearly co-located; the
alias only replaces the deep, hard-to-read chains like `../../../../types`. Verified via `tsc -b`
(catches a wrong resolution immediately, since `moduleResolution: "bundler"` requires the path to
actually exist), a clean production build, and the test suite (`vitest` shares `vite.config.ts`, so
the alias resolves identically in tests), all green, no manual edits needed on top of the codemod.

## 7. Testing

`vitest` + React Testing Library, set up via `src/test/setup.ts` and `vite.config.ts`'s `test`
block (`jsdom` environment). Test coverage exists specifically for the **notification** feature
(context + bell + Sheet), 16 passing tests across 3 files. Per explicit product decision, no test
coverage was added for LeaveRequest or the fee-concessions/report-card/CSV-export work, those were
verified live against a running backend instead (see the backend doc's verification notes). If you
add tests for a new feature, follow the notification tests as the reference pattern for this repo.

## 8. What's NOT built yet (honest gap list, as of this doc)

Mirrors the backend doc's gap list, frontend-side specifics:

- **Student self-service portal**, no student login/dashboard; everything routes through a parent
  or staff account.
- **Accountant / Staff roles in the "Add User" screen**, the roles exist on the backend, but the
  admin UI to create such a user doesn't expose them.
- **Parent self-service guardian management**, no parent-facing UI to add/edit a second guardian.
- **No scheduled/automated exports**, every CSV export button is user-triggered and client-side;
  nothing is emailed or generated on a schedule.
- **Payment gateway UI**, no card/UPI checkout flow; blocked on the backend having real gateway
  credentials.

## 9. Where to look next

If you're picking this up cold: read `src/shared/api/api-client.ts` (the one thing every screen goes
through), then `pages/admin/fees/` with `entities/fee/` end-to-end as a representative example of the
view + controller + entity service pattern, including the idempotency-key pattern used for every
money-affecting mutation.
