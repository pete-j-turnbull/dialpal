# Environment Variables Quick Reference

A complete reference for all environment variables and secrets needed for the Maiden application.

## Local Development (.env.local)

```bash
# === REQUIRED ===

# Clerk - Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...    # From Clerk dashboard
CLERK_SECRET_KEY=sk_test_...                     # From Clerk dashboard
CLERK_DOMAIN=your-app.clerk.accounts.dev         # Your Clerk instance domain
CLERK_WEBHOOK_SECRET=whsec_...                   # From webhook creation

# Convex - Backend
NEXT_PUBLIC_CONVEX_URL=https://your-app.convex.cloud  # From Convex dashboard
CONVEX_DEPLOY_KEY=prod:...                            # From Convex settings

# === OPTIONAL ===

# Trigger.dev - Background Jobs
TRIGGER_PROJECT_REF=proj_...     # From Trigger.dev project
TRIGGER_SECRET_KEY=tr_dev_...    # Development API key

# Teller - Banking Integration
NEXT_PUBLIC_TELLER_APPLICATION_ID=app_...  # From Teller dashboard
TELLER_CERT_BASE64=...                     # Base64 encoded certificate
TELLER_KEY_BASE64=...                      # Base64 encoded private key
TELLER_WEBHOOK_SECRET=...                  # From Teller webhook setup

# Note: Starling Bank tokens are stored per-user in Convex, not in env vars
```

## GitHub Configuration

### Environment Setup

Create two environments in your repository:

1. `preview` - For preview deployments on any branch
2. `production` - For releases and manual deployments

### Secrets (Per Environment)

Add these as **secrets** in each GitHub environment:

| Secret Name          | Where to Find                             | Example                       |
| -------------------- | ----------------------------------------- | ----------------------------- |
| `CONVEX_DEPLOY_KEY`  | Convex Dashboard → Settings → Deploy Key  | `prod:abc123...`              |
| `VERCEL_TOKEN`       | Vercel → Account Settings → Tokens        | `abcd1234...`                 |
| `TRIGGER_SECRET_KEY` | Trigger.dev → Project Settings → API Keys | `tr_dev_...` or `tr_prod_...` |

### Variables (Per Environment)

Add these as **variables** (not secrets) in each GitHub environment:

| Variable Name       | Where to Find                        | Example       |
| ------------------- | ------------------------------------ | ------------- |
| `VERCEL_ORG_ID`     | `.vercel/project.json` → `orgId`     | `team_abc123` |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` → `projectId` | `prj_xyz789`  |

### Optional: Cloudflare R2

If using Cloudflare R2 for file storage, add these secrets:

| Secret Name            | Where to Find                       |
| ---------------------- | ----------------------------------- |
| `R2_SECRET_ACCESS_KEY` | Cloudflare → R2 → Manage API tokens |
| `R2_ACCOUNT_ID`        | Cloudflare dashboard URL            |
| `R2_ACCESS_KEY_ID`     | Cloudflare → R2 → Manage API tokens |

## Service URLs & Formats

### Clerk

- **Test keys**: Start with `pk_test_` and `sk_test_`
- **Live keys**: Start with `pk_live_` and `sk_live_`
- **Domain format**: `your-app-name.clerk.accounts.dev`
- **Webhook endpoint**: `https://your-convex-url.convex.site/clerk-webhook`

### Convex

- **URL format**: `https://project-name.convex.cloud`
- **Deploy key format**: `prod:base64-string`
- **Dashboard**: Access via `npx convex dashboard`

### Vercel

- **Project linking**: Run `npx vercel link` to generate `.vercel/project.json`
- **Token scope**: Needs deployment permissions

### Trigger.dev

- **Project ref format**: `proj_random-string`
- **Secret key format**: `tr_dev_...` or `tr_prod_...`
- **Version**: Use v3 (latest)

## Quick Setup Checklist

### 1. Initial Setup

- [ ] Clone repository
- [ ] Run `pnpm install`
- [ ] Create accounts on all required services

### 2. Service Configuration

- [ ] Create Clerk application and enable organizations
- [ ] Initialize Convex project with `npx convex dev`
- [ ] Link Vercel project with `npx vercel link`
- [ ] Configure Clerk JWT template for Convex
- [ ] Set up Clerk webhook to Convex

### 3. Local Environment

- [ ] Create `.env.local` file
- [ ] Add all required environment variables
- [ ] Test with `pnpm dev`

### 4. GitHub Setup

- [ ] Create development and production environments
- [ ] Add all secrets to each environment
- [ ] Add all variables to each environment
- [ ] Test manual workflow trigger

### 5. Verification

- [ ] Sign up/in works via Clerk
- [ ] Convex functions are accessible
- [ ] GitHub Actions workflows run successfully
- [ ] Deployments complete without errors

## Common Values to Replace

When setting up, replace these placeholder values:

- `your-app` → Your actual app name
- `your-app.clerk.accounts.dev` → Your Clerk domain
- `your-app.convex.cloud` → Your Convex URL
- `pk_test_...` → Your actual Clerk publishable key
- `sk_test_...` → Your actual Clerk secret key
- `whsec_...` → Your actual webhook secret
- `prod:...` → Your actual Convex deploy key
- `proj_...` → Your actual Trigger.dev project ref
- `tr_dev_...` → Your actual Trigger.dev secret key
