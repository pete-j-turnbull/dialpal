# Infrastructure Setup Guide

This guide provides step-by-step instructions for setting up the Maiden application infrastructure for both development and production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Environment Setup](#development-environment-setup)
   - [Clerk Setup](#1-clerk-setup)
   - [Convex Setup](#2-convex-setup)
   - [Vercel Setup](#3-vercel-setup)
   - [Local Environment Variables](#4-local-environment-variables)
3. [Production Environment Setup](#production-environment-setup)
   - [Service Configuration](#service-configuration)
   - [GitHub Environments & Secrets](#github-environments--secrets)
4. [Optional Services](#optional-services)
   - [Trigger.dev](#triggerdev)
   - [Banking Integrations](#banking-integrations)
   - [Cloudflare R2](#cloudflare-r2)
5. [Deployment Workflows](#deployment-workflows)
6. [Verification & Troubleshooting](#verification--troubleshooting)

## Prerequisites

Before starting, ensure you have:

- Node.js 20.x or higher
- pnpm 10.6.5 or higher (`npm install -g pnpm@10.6.5`)
- Git and GitHub account
- Accounts for: Clerk, Convex, Vercel
- Optional: Cloudflare, Trigger.dev accounts

## Development Environment Setup

### 1. Clerk Setup

#### Create Application

1. Sign up/login at [clerk.com](https://clerk.com)
2. Click "Create application"
3. Name it (e.g., "Maiden Dev")
4. Enable authentication methods:
   - ✅ Email
   - ✅ Google OAuth (optional)
   - ✅ Other providers as needed

#### Enable Organizations

1. Go to "Organizations" in sidebar
2. Click "Enable organizations"
3. Configure:
   - ✅ Members can create organizations
   - Default role: `member`
   - Additional role: `admin`

#### Collect Credentials

From your Clerk dashboard:

- **Publishable Key**: `pk_test_...` (in API Keys)
- **Secret Key**: `sk_test_...` (in API Keys)
- **Domain**: `your-app.clerk.accounts.dev`

### 2. Convex Setup

#### Initialize Project

```bash
cd /path/to/maiden
npx convex dev
```

This will:

1. Authenticate via browser
2. Create/select project
3. Generate files in `convex/_generated/`
4. Show your deployment URL

#### Configure Clerk Integration

1. Open Convex dashboard: `npx convex dashboard`
2. Go to Settings → Authentication
3. Add Clerk as provider
4. In Clerk dashboard:
   - Create JWT Template → Select "Convex"
   - Name it "convex"
   - Copy JWKS URL to Convex

#### Collect Credentials

- **Deployment URL**: `https://your-app.convex.cloud`
- **Deploy Key**: Settings → Deploy Key

#### Setup Webhook

1. In Clerk dashboard → Webhooks
2. Add endpoint: `https://your-app.convex.site/clerk-webhook`
3. Select events:
   - All user events
   - All organization events
   - All organizationMembership events
4. Copy the webhook secret (`whsec_...`)

### 3. Vercel Setup

#### Link Project

```bash
npx vercel link
```

This creates `.vercel/project.json` with your IDs.

#### Create API Token

1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Create new token
3. Copy token value

#### Collect Credentials

From `.vercel/project.json`:

- **Org ID**: `orgId` field
- **Project ID**: `projectId` field

### 4. Local Environment Variables

Create `.env.local` in project root:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_DOMAIN=your-app.clerk.accounts.dev
CLERK_WEBHOOK_SECRET=whsec_...

# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-app.convex.cloud
CONVEX_DEPLOY_KEY=prod:...

# Optional services (see below for setup)
# TRIGGER_PROJECT_REF=proj_...
# TRIGGER_SECRET_KEY=tr_...
# NEXT_PUBLIC_TELLER_APPLICATION_ID=app_...
# TELLER_CERT_BASE64=...
# TELLER_KEY_BASE64=...
# TELLER_WEBHOOK_SECRET=...
```

## Production Environment Setup

### Service Configuration

For production, you'll need to:

1. **Clerk Production**

   - Create a new Clerk application for production
   - Use production keys (`pk_live_...`, `sk_live_...`)
   - Configure production webhook URL

2. **Convex Production**

   - Convex uses the same project with different deployments
   - Use the same deploy key for both environments

3. **Vercel Production**
   - Same project, different deployments
   - Production deployments use `--prod` flag

### GitHub Environments & Secrets

#### 1. Create GitHub Environments

In your repository:

1. Go to Settings → Environments
2. Create two environments:
   - `development`
   - `production`

For production environment:

- Enable "Required reviewers"
- Restrict deployment branches to `main`

#### 2. Add Repository Secrets

Go to Settings → Secrets and variables → Actions

Add these repository-wide secrets (shared across environments):

- None required with this simplified approach

#### 3. Add Environment Secrets

For **each environment** (development and production), add:

| Secret Name          | Description                | Example          |
| -------------------- | -------------------------- | ---------------- |
| `CONVEX_DEPLOY_KEY`  | Convex deployment key      | `prod:abc123...` |
| `VERCEL_TOKEN`       | Vercel API token           | `abcd1234...`    |
| `TRIGGER_SECRET_KEY` | Trigger.dev key (optional) | `tr_dev_...`     |

#### 4. Add Environment Variables

For **each environment**, add these as variables (not secrets):

| Variable Name       | Description                 | Example       |
| ------------------- | --------------------------- | ------------- |
| `VERCEL_ORG_ID`     | From `.vercel/project.json` | `team_abc123` |
| `VERCEL_PROJECT_ID` | From `.vercel/project.json` | `prj_xyz789`  |

## Optional Services

### Trigger.dev

For background jobs and scheduled tasks:

1. Create account at [trigger.dev](https://trigger.dev)
2. Create new v3 project
3. Get credentials:
   - Project reference: `proj_...`
   - API keys for dev/prod
4. Add to environment variables and GitHub secrets

### Banking Integrations

#### Starling Bank

1. Create [Starling Developer](https://developer.starlingbank.com) account
2. Create sandbox application
3. Generate:
   - Personal access token
   - Webhook public key
4. Tokens are stored per-user in Convex

#### Teller

1. Sign up at [teller.io](https://teller.io)
2. Create application
3. Download certificates
4. Convert to base64:
   ```bash
   node convex/lib/teller/encode-pem.script.js certificate.pem private_key.pem
   ```
5. Add to environment variables

### Cloudflare R2

For file storage:

1. Create R2 bucket in Cloudflare dashboard
2. Create API token with R2 permissions
3. Generate access keys
4. Add to GitHub secrets:
   - `R2_SECRET_ACCESS_KEY`
   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`

## Deployment Workflows

### Automatic Deployments

The GitHub Actions workflows handle deployments automatically:

**Development** (on push to `main`):

- Convex: Changes to `convex/` directory
- Vercel: Changes to `src/`, `public/`, or configs
- Trigger.dev: Changes to trigger configs

**Production** (on release or manual):

- Create a GitHub release
- Or manually trigger via Actions tab

### Manual Deployment Commands

If needed, you can deploy manually:

```bash
# Convex
npx convex deploy

# Vercel
vercel          # Preview
vercel --prod   # Production

# Trigger.dev
pnpm deploy:trigger --env production
```

## Verification & Troubleshooting

### Post-Setup Checklist

1. **Local Development**

   - [ ] `.env.local` file created with all variables
   - [ ] `pnpm dev` runs without errors
   - [ ] Can sign in/up via Clerk
   - [ ] Convex functions are accessible

2. **GitHub Setup**

   - [ ] Both environments created
   - [ ] All secrets added to each environment
   - [ ] Variables added to each environment
   - [ ] Workflows visible in Actions tab

3. **Service Connections**
   - [ ] Clerk webhook reaching Convex
   - [ ] Convex JWT template configured
   - [ ] Vercel connected to GitHub repo

### Common Issues

**Clerk Authentication Fails**

- Verify JWT template name is "convex"
- Check webhook secret matches
- Ensure Convex URL in Clerk webhook is correct

**Convex Connection Errors**

- Check `NEXT_PUBLIC_CONVEX_URL` format
- Verify deploy key is valid
- Run `npx convex dev` to check connection

**Vercel Deployment Issues**

- Ensure GitHub integration is enabled
- Check environment variables in Vercel dashboard
- Verify build command is `pnpm build`

**GitHub Actions Failures**

- Check secret names match exactly
- Verify environment protection rules
- Review workflow logs for specific errors

### Getting Help

1. Check service-specific documentation:

   - [Clerk Docs](https://clerk.com/docs)
   - [Convex Docs](https://docs.convex.dev)
   - [Vercel Docs](https://vercel.com/docs)

2. Review GitHub Actions logs for detailed error messages

3. Verify all environment variables are set correctly using the ENV_REFERENCE.md file
