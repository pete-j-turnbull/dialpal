# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `pnpm dev` - Start all development servers (Next.js, Convex, Trigger.dev, render engine)
- `pnpm build` - Build the Next.js application
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint to check code quality

### Backend Development
- `pnpm dev:next` - Start Next.js development server with Turbopack
- `pnpm dev:convex` - Start Convex development server
- `pnpm dev:trigger` - Start Trigger.dev development server
- `pnpm dev:render-engine` - Start render engine (CDN + server)

### Deployment
- `pnpm deploy:convex` - Deploy Convex backend
- `pnpm deploy:vercel` - Deploy to Vercel
- `pnpm deploy:trigger` - Deploy Trigger.dev tasks
- `pnpm deploy:render-engine` - Deploy render engine

### Storybook
- `pnpm dev:storybook` - Start Storybook development server

## High-Level Architecture

### Stack Overview
This is a multi-tenant SaaS application for video content creation and thought leadership with the following core technologies:

- **Frontend**: Next.js 15 with App Router, React 19, TypeScript, Tailwind CSS
- **Backend**: Convex (real-time database and serverless functions)
- **Authentication**: Clerk (multi-tenant with organizations)
- **Background Jobs**: Trigger.dev for long-running tasks
- **Video Processing**: Remotion for video composition, custom render engine
- **State Management**: Nuqs for URL state, React hooks for local state
- **AI Integration**: Anthropic Claude, OpenAI, ElevenLabs for voice synthesis

### Core Architecture Patterns

#### Multi-Tenant Structure
- Organizations are the primary tenant boundary
- Users belong to organizations via memberships
- All data is scoped to organizations
- URL structure: `/orgs/[slug]/...` for tenant-specific routes

#### Convex Backend Architecture
- **Modules**: Feature-based organization in `convex/modules/`
- **Schema**: Centralized in `convex/schema.ts` with type-safe table definitions
- **Functions**: Three types - `query` (read), `mutation` (write), `action` (external APIs)
- **Security**: Public functions in main directories, internal functions in `convex/private/`

#### Frontend Architecture
- **App Router**: File-based routing with nested layouts
- **Route Groups**: `(authenticated)` for protected routes, `(flows)` for feature flows
- **Components**: Shadcn/ui components in `src/components/ui/`
- **Features**: Self-contained features in `src/features/`

### Key Flows and Features

#### Thought Leadership Flow
Primary content creation flow located in `src/app/(authenticated)/orgs/[slug]/(flows)/thought-leadership/`:
- Template-based video creation
- Scene editing with duration controls
- Media replacement functionality
- Face sync notices and settings
- Real-time preview with Remotion

#### Video Processing Pipeline
- **Composition**: Remotion components for video rendering
- **Render Engine**: Custom server for video processing at `packages/render-engine/`
- **Background Jobs**: Trigger.dev tasks for long-running video operations
- **Storage**: Convex file storage for media assets

#### Content Management
- **Insights**: AI-generated content pillars and strategy
- **Product Datasets**: Searchable content libraries
- **Avatars**: User avatar management for video personalization
- **Rendered Videos**: Processed video storage and playback

### Important Development Guidelines

#### Convex Function Patterns
- Always use new function syntax: `export const func = query({ args: {}, handler: async (ctx, args) => {} })`
- Internal functions use `internalQuery`, `internalMutation`, `internalAction`
- Always include argument validators using `v` from `convex/values`
- Use `ctx.runQuery`, `ctx.runMutation`, `ctx.runAction` for cross-function calls

#### Trigger.dev Task Patterns
- Use `task()` function from `@trigger.dev/sdk` (NOT deprecated `defineJob`)
- Always export tasks, even subtasks
- Tasks located in `convex/**/trigger/` directories
- Configuration in `trigger.config.ts` with ffmpeg extension

#### Frontend Patterns
- Use App Router with `layout.tsx` for shared layouts
- Server components by default, add `'use client'` only when needed
- Clerk authentication with organization-based routing
- Nuqs for URL state management
- Tailwind CSS with custom design system

#### Code Organization
- **Modular Architecture**: Features organized in modules with clear boundaries
- **Type Safety**: Strict TypeScript throughout, generated types from Convex
- **Reusable Components**: Shadcn/ui components with custom extensions
- **Consistent Patterns**: Standard patterns for queries, mutations, and UI components

### Testing
- **Vitest**: Unit testing framework
- **Storybook**: Component development and testing
- **Playwright**: E2E testing (configured but check for current tests)

### Key Environment Variables
- Convex deployment URL and auth
- Clerk authentication keys
- Trigger.dev project configuration
- AI service API keys (Claude, OpenAI, ElevenLabs)
- Storage and CDN configuration

### Performance Considerations
- Convex provides real-time subscriptions and automatic caching
- Next.js with Turbopack for fast development
- Remotion for efficient video rendering
- Background job processing for heavy operations