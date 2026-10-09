# Release and rollback runbook (Vercel Hobby)

Last updated 9 Oct 2026. Plan: Vercel **Hobby**, public GitHub repo, no Speed Insights Plus.
Times in this runbook are ICT (UTC+7).

---

## 1. Environments
| Env | Trigger | URL | Who sees it | Analytics |
|---|---|---|---|---|
| Local | `cd app && npm run dev` / `npm run build && npm start` | localhost:3000 | Developer | Off |
| Preview | Any push to a non-`main` branch / PR | `portfolio-git-<branch>-<scope>.vercel.app` and a per-commit URL (Vercel bot comment on the PR) | Vercel-authenticated users (Standard Protection), or anyone with a shareable link | Off |
| Production | Merge to `main` | `NEXT_PUBLIC_SITE_URL`, or `https://$VERCEL_PROJECT_PRODUCTION_URL` when that is unset (C-25) | Public, indexable | On (page views + Speed Insights RES) |

### 1.1 Site URL (metadataBase, canonical, sitemap, robots, JSON-LD, OG)

The same resolver (`configuredSiteUrl` / `getSiteUrl` in `lib/site.ts`) is used everywhere, including `validate:content`:

1. `NEXT_PUBLIC_SITE_URL` when it is set (custom domain). No trailing slash.
2. Otherwise `https://${VERCEL_PROJECT_PRODUCTION_URL}`. Vercel injects that system variable on every deployment, so a dashboard import needs no env setup.
3. Production (`VERCEL_ENV=production`) fails the content gate and the build only when both are unset.
4. Local and CI (`VERCEL_ENV` is not `production`) fall back to `https://$VERCEL_URL`, then `http://localhost:3000`.

See `.env.example`.

## 2. Preview → production flow
```
feature branch ──push──► PR to main
   │                          │
   │                ┌─────────┴──────────────────────────────┐
   │                │ GitHub Actions ci.yml (local build):    │
   │                │  lint · typecheck · build · e2e · a11y · lighthouse
   │                │ Vercel preview build ─► preview URL     │
   │                │  └─ preview-e2e.yml (deployment_status):│
   │                │     Playwright + axe + Lighthouse on the│
   │                │     real preview (bypass header)        │
   │                └─────────┬──────────────────────────────┘
   │                          ▼
   │             Human review of the preview (PO for content/design)
   │                          ▼
   │             All required checks green ─► squash-merge to main
   │                          ▼
   │             Vercel production build (VERCEL_ENV=production:
   │             placeholder/permission gate fails the build if content is incomplete)
   │                          ▼
   │             Deployment Checks (if available on Hobby) ─► domain assigned ─► LIVE
   └─ a failed production build or check leaves the previous production live
```

### 2.1 Required checks on `main` (GitHub branch protection, free on public repos)
- Require PR; require status checks: `lint`, `typecheck`, `build`, `e2e`, `a11y`, `lighthouse`, `preview-e2e`, and `Vercel` (preview deployment).
- Require branches to be up to date; linear history; no force-push; no deletion.

### 2.2 Release checklist (each merge to main)
1. PR preview reviewed; all checks green.
2. Squash-merge. Watch the production deployment in Vercel → Deployments (or `vercel list --prod`).
3. When it is **Ready** and assigned: run the verification in §4.
4. Note the new production deployment URL/ID in the PR (it is the rollback target for the *next* release).

### 2.3 Staged release (optional, risky changes)
1. Settings → Environments → Production: turn **off** auto-assign custom domains.
2. Merge. The production build is created but not assigned to the domain.
3. Test the deployment's own URL (§4 checks).
4. `vercel promote <deployment-url>` (or dashboard → Promote). Instant, no rebuild.
5. Turn auto-assignment back on.
Do **not** promote a *preview* deployment: that rebuilds with production env vars and isn't the tested artifact.

## 3. Rollback (incident)

### 3.0 When to roll back
Production is broken or wrong in a way users notice (blank page, broken nav/contact, wrong or unpermitted content, private data exposed, Lighthouse/a11y regression that blocks a recruiter or client). **Rollback first, debug second.**

### 3.1 Hobby limitation (read first)
- Hobby can Instant-Rollback **only to the immediately previous production deployment**. There is no "choose another deployment" list (that is Pro/Enterprise).
- If the previous deployment is *also* bad, Instant Rollback can't reach further back. Use §3.4 (git revert) instead.
- Only one rollback at a time per project.
- After a rollback Vercel **turns off auto-assignment of production domains**. New merges to `main` will build but **will not go live** until someone promotes a deployment (§3.5). Don't forget this step.
- The rolled-back deployment keeps its *original* build-time env vars. Env var changes made since then are not applied.

### 3.2 Option A: Instant Rollback in the dashboard (fastest, ~seconds)
1. Vercel → project `portfolio` → Overview → Production Deployment tile → **Instant Rollback**.
   (Or Deployments tab, filter by `main`, ⋮ next to the previous production deployment → Instant Rollback.)
2. Check the dialog: current deployment, target (the previous one), the domains listed (apex + `www`).
3. **Confirm Rollback.**
4. Verify (§4). Post comms (§5).

### 3.3 Option B: CLI
Needs a logged-in Vercel CLI linked to the project (not set up on the shared box yet; see ops/README.md).
```bash
vercel list --prod                       # identify current and previous production deployments
vercel rollback                          # Hobby: rolls back to the previous production deployment
# or: vercel rollback <previous-deployment-url-or-id>
vercel rollback status                   # wait until complete
```

### 3.4 Option C: git revert (always available; required when the previous deploy is also bad)
```bash
git switch main && git pull
git revert <bad-commit-sha>              # squash-merge = one commit per PR
git switch -c fix/revert-<short-sha>
git push -u origin fix/revert-<short-sha>  # open PR → preview + CI → merge
```
- This produces a **new** production build of known-good code (takes a full build, a few minutes).
- If production is in a rolled-back state, the merged revert will **not** go live automatically: promote it (§3.5).
- Emergency only (PO approval): an admin may merge the revert PR before slow checks finish. Never push directly to `main` or force-push.

### 3.5 Undo the rollback / restore auto-assignment
After the fix (revert or forward fix) has a **Ready** production deployment that passed §4 on its own URL:
- Dashboard: Overview → **Undo Rollback** → pick the fixed deployment → Confirm, or
- CLI: `vercel promote <fixed-deployment-url-or-id>`

Either way, auto-assignment is re-enabled. Confirm in Settings → Environments → Production that auto-assign is on.

### 3.6 Bad content only (typo, wrong project, permission issue)
Same as above: roll back if it is harmful (unpermitted client work, private data), otherwise forward-fix with a `content/*` PR. If private data was exposed, also: remove it in git, rotate anything that leaked, and ask search engines to drop cached copies (Search Console → Removals).

## 4. Verification (after release, rollback, or promote)
Run against the production domain (and the deployment URL when testing before promotion):
1. `curl -sI https://<domain>/` → `200`, and the deployment shown in Vercel → Overview is the expected one (commit SHA matches).
2. `curl -sI https://<domain>/th` → `308` to `/`; `curl -sI https://<domain>/work` → `308` to `/#work`; an unknown path → `404` (Thai page).
3. `curl -s https://<domain>/robots.txt` allows crawling and lists the sitemap; `curl -s https://<domain>/sitemap.xml` lists `/` and `/work/<slug>`.
4. Manual smoke at 360 px and 1440 px: hero, nav (collapsed <1030 px), work filter, open/close a project dialog, Back closes it, contact `mailto:` opens with the Thai subject, copy-email works, resume PDF downloads.
5. No `[PLACEHOLDER:` text: `curl -s https://<domain>/ | grep -c 'PLACEHOLDER'` → `0`.
6. Optional: PageSpeed Insights (mobile) on the domain, all four categories ≥ 90 (AC-PERF-01).
7. Vercel → Logs / Observability: no new errors (expected none; the site is static).

## 5. Communication
| When | Who | Channel | Message template |
|---|---|---|---|
| Rollback started | PO + Maintainer | Team chat | "Rolling back production (`<domain>`) from `<bad-deploy>` to `<previous-deploy>` because `<symptom>`. ETA < 5 min." |
| Rollback verified | PO + Maintainer | Team chat | "Rollback done at HH:MM ICT, §4 checks pass. Auto-assign is OFF until the fix is promoted. Fix: PR #`<n>`." |
| Fix promoted | PO + Maintainer | Team chat + PR | "Fixed deployment `<id>` promoted at HH:MM ICT; auto-assign back ON. Root cause: `<one line>`." |
| Within 1 day | Maintainer | docs/ incident note | What happened, impact window (ICT), detection, fix, follow-up (a test that would have caught it). |

## 6. Quick reference
| Need | Action |
|---|---|
| Undo last release now | Dashboard → Instant Rollback (§3.2) |
| Previous release also bad | `git revert` PR (§3.4), then promote (§3.5) |
| New merges don't go live | You are in a rolled-back state: promote (§3.5) |
| Ship a tested staged build | Auto-assign off → merge → test → `vercel promote` (§2.3) |
| Show a protected preview to someone | Vercel → deployment → Share (shareable link) |
