# Setup Checklist

A quick checklist to get Maiden running. Check off each item as you complete it.

## 🚀 Quick Start (Development)

### 1. Prerequisites

- [ ] Node.js 20+ installed
- [ ] pnpm installed (`npm install -g pnpm@10.6.5`)
- [ ] GitHub account
- [ ] Accounts created on: Clerk, Convex, Vercel

### 2. Clone & Install

```bash
git clone https://github.com/yourusername/maiden.git
cd maiden
pnpm install
```

### 3. Clerk Setup (~10 min)

- [ ] Create new Clerk application at [clerk.com](https://clerk.com)
- [ ] Enable Organizations feature
- [ ] Copy these values:
  - [ ] Publishable Key: `pk_test_...`
  - [ ] Secret Key: `sk_test_...`
  - [ ] Domain: `your-app.clerk.accounts.dev`

### 4. Convex Setup (~10 min)

- [ ] Run `npx convex dev` in project root
- [ ] Create/select project when prompted
- [ ] Copy these values:
  - [ ] Deployment URL: `https://your-app.convex.cloud`
  - [ ] Deploy Key: from dashboard → Settings

### 5. Clerk ↔️ Convex Integration (~5 min)

- [ ] In Convex dashboard → Settings → Authentication → Add Clerk
- [ ] In Clerk dashboard → JWT Templates → New → Select "Convex"
- [ ] Copy JWKS URL from Clerk to Convex
- [ ] In Clerk → Webhooks → Add endpoint:
  - [ ] URL: `https://your-app.convex.site/clerk-webhook`
  - [ ] Select all user/org events
  - [ ] Copy webhook secret: `whsec_...`

### 6. Vercel Setup (~5 min)

- [ ] Run `npx vercel link`
- [ ] Create token at [vercel.com/account/tokens](https://vercel.com/account/tokens)
- [ ] Note the org/project IDs from `.vercel/project.json`

### 7. Create Local Environment (~5 min)

- [ ] Create `.env.local` file in project root
- [ ] Add all required variables (see ENV_REFERENCE.md)
- [ ] Test with `pnpm dev`
- [ ] Verify you can sign in/up

## 🏭 Production Setup

### 8. GitHub Environments (~10 min)

- [ ] Go to repo → Settings → Environments
- [ ] Create `preview` environment
- [ ] Create `production` environment (with protection rules)

### 9. Add GitHub Secrets (Per Environment)

For both `preview` and `production`:

- [ ] `CONVEX_DEPLOY_KEY`
- [ ] `VERCEL_TOKEN`
- [ ] `TRIGGER_SECRET_KEY` (if using)

### 10. Add GitHub Variables (Per Environment)

For both `preview` and `production`:

- [ ] `VERCEL_ORG_ID`
- [ ] `VERCEL_PROJECT_ID`

### 11. Test Deployment

- [ ] Push to main branch
- [ ] Check Actions tab for workflow status
- [ ] Verify all deployments succeed

## ✅ Verification

### Everything Working?

- [ ] Local dev server runs without errors
- [ ] Can create account and sign in
- [ ] Convex functions are accessible
- [ ] GitHub Actions deploy successfully
- [ ] Production URLs are accessible

### Common Issues?

- Check webhook URLs are correct
- Verify all environment variables are set
- Ensure JWT template name is "convex"
- Review GitHub Actions logs for errors

## 📚 Need Help?

1. Check the detailed README.md
2. Review ENV_REFERENCE.md for variable details
3. Look at service-specific docs:
   - [Clerk Docs](https://clerk.com/docs)
   - [Convex Docs](https://docs.convex.dev)
   - [Vercel Docs](https://vercel.com/docs)
