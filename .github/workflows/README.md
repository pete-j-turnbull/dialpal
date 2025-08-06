# Deployment Workflows

This directory contains GitHub Actions workflows for deploying to Convex, Vercel, and Trigger.dev.

## Workflows

### Reusable Workflows (Templates)

#### Convex

- **`deploy-convex.yml`**: Basic reusable workflow for deploying Convex
- **`deploy-convex-template.yml`**: Reusable workflow that uses custom actions (prune-repo, install-deps)

#### Vercel

- **`_deploy-vercel.yaml`**: Reusable workflow for deploying to Vercel

#### Trigger.dev

- **`_deploy-trigger.yaml`**: Reusable workflow for deploying Trigger.dev jobs

### Deployment Triggers

#### Convex

- **`deploy-convex-dev.yml`**: Automatically deploys to development when changes are pushed to the `main` branch
- **`deploy-convex-prod.yml`**: Deploys to production via manual trigger or when a release is published

#### Vercel

- **`deploy-vercel-dev.yml`**: Automatically deploys to development when changes are pushed to the `main` branch
- **`deploy-vercel-prod.yml`**: Deploys to production via manual trigger or when a release is published

#### Trigger.dev

- **`deploy-trigger-dev.yml`**: Automatically deploys to development when changes are pushed to the `main` branch
- **`deploy-trigger-prod.yml`**: Deploys to production via manual trigger or when a release is published

## Setup

### 1. Convex Setup

#### Add Convex Deploy Key

You need to add your Convex deploy key as a GitHub secret:

1. Go to your GitHub repository settings
2. Navigate to Secrets and Variables > Actions
3. Click "New repository secret"
4. Name: `CONVEX_DEPLOY_KEY`
5. Value: Your Convex deploy key (get it from `npx convex dashboard` or your Convex dashboard)

### 2. Vercel Setup

#### Add Vercel Secrets

You need to add three Vercel-related secrets:

1. **VERCEL_TOKEN**

   - Go to https://vercel.com/account/tokens
   - Create a new token with appropriate scope
   - Add as GitHub secret

2. **VERCEL_ORG_ID**

   - Run `npx vercel link` in your project
   - Find the org ID in `.vercel/project.json`
   - Add as GitHub secret

3. **VERCEL_PROJECT_ID**
   - Run `npx vercel link` in your project
   - Find the project ID in `.vercel/project.json`
   - Add as GitHub secret

### 3. Trigger.dev Setup

#### Add Trigger.dev Access Token

You need to add your Trigger.dev access token as a GitHub secret:

1. Go to your GitHub repository settings
2. Navigate to Secrets and Variables > Actions
3. Click "New repository secret"
4. Name: `TRIGGER_ACCESS_TOKEN`
5. Value: Your Trigger.dev access token (get it from https://cloud.trigger.dev/profile)

### 4. Deployment Environments

The workflows support two environments:

- **development**: Default Convex deployment (triggered on push to main)
- **production**: Production deployment (manual trigger or on release)

## Usage

### Automatic Deployments

- **Development**: Push changes to the `main` branch that affect relevant files:
  - Convex: Changes to `convex/` directory
  - Vercel: Changes to `src/`, `public/`, or config files
  - Trigger.dev: Changes to `src/` or `trigger.config.ts`
- **Production**: Create a new release in GitHub

### Manual Deployments

To manually deploy to production:

1. Go to Actions tab in your repository
2. Select the production deployment workflow for your service:
   - "Deploy Convex - Production"
   - "Deploy Vercel - Production"
   - "Deploy Trigger.dev - Production"
3. Click "Run workflow"

## Custom Actions

The repository includes custom actions in `.github/actions/`:

- **`prune-repo`**: Removes unnecessary files before deployment
- **`install-deps`**: Sets up pnpm and installs dependencies

## Monitoring Deployments

You can monitor deployment status in:

- GitHub Actions tab for workflow runs
- Service-specific dashboards:
  - Convex: https://dashboard.convex.dev
  - Vercel: https://vercel.com/dashboard
  - Trigger.dev: https://cloud.trigger.dev
