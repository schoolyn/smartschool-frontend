# Frontend deployment — Vercel

Vercel auto-detects Vite projects — no S3/CloudFront/IAM setup needed.

## 1. Connect the repo (Vercel dashboard)

1. **Add New → Project** → import `smartschool-frontend` from GitHub.
2. Vercel auto-detects the Vite preset — build command (`vite build`) and
   output directory (`dist`) need no changes.
3. **`vercel.json`** in this repo already adds the SPA-fallback rewrite
   (`/(.*) → /index.html`) that CloudFront needed custom error pages for —
   without it, refreshing any route other than `/` (e.g.
   `/some-org-id/admin/students`) 404s, since there's no such file in `dist/`
   and React Router only ever sees `/` otherwise.
4. **Environment Variables** (Project Settings → Environment Variables), for
   the Production environment:
   ```
   VITE_API_URL=https://<your deployed backend URL>
   ```
   (see `smartschool-backend/deploy/DEPLOYMENT.md` for that URL once the
   backend is deployed — do that one first). This is baked into the built JS
   at build time (Vite's own behavior), so a change here needs a redeploy to
   take effect, not just a restart.
5. **Deploy**. Vercel gives you a free `*.vercel.app` URL immediately.

## 2. Tell the backend about this URL

Once deployed, add this site's real URL to the backend's `FRONTEND_URL` and
`CORS_ORIGINS` env vars (Render dashboard → backend service → Environment) —
otherwise every API call from this app gets blocked by CORS in the browser,
the exact failure mode already hit and fixed locally for `smartschool-website`.

## 3. Custom domain

Project Settings → Domains → add `app.schoolyn.in` → follow the DNS record
Vercel shows (account-specific, follow what's actually displayed). HTTPS is
automatic once DNS propagates.

## 4. Redeploys

Every push to `main` (once connected in step 1) deploys automatically — no
separate deploy job to maintain. `.github/workflows/ci.yml`'s `test`/`build`
job still runs as a quality gate on every push/PR, but doesn't control
Vercel's own deploy; set **Project Settings → Git → Ignored Build Step** if
you ever want Vercel to skip deploying when only non-app files changed.
