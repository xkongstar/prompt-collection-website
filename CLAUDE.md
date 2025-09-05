# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (Next.js)
```bash
cd frontend
npm run dev          # Start development server with Turbopack
npm run build        # Build production bundle with Turbopack
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend (Express + TypeScript)
```bash
cd backend
npm run dev          # Start development server with nodemon + ts-node
npm run build        # Compile TypeScript to JavaScript
npm run start        # Start production server
npm run lint         # Run ESLint on TypeScript files
npm test             # Run Jest tests

# Database commands
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database (development)
npm run db:migrate   # Run database migrations (development)
npm run db:studio    # Open Prisma Studio for database inspection
npm run db:seed      # Seed database with test data
```

## Architecture Overview

This is a full-stack prompt collection application with separate frontend and backend services:

### Frontend Architecture
- **Framework**: Next.js 15 with App Router and Turbopack
- **UI**: Radix UI components with Tailwind CSS styling
- **State Management**: Zustand for client state + React Query for server state
- **API Communication**: Axios client in `lib/api.ts`
- **Structure**: 
  - `app/` - Next.js App Router pages and layouts
  - `components/ui/` - Reusable UI components
  - `components/layout/` - Layout-specific components  
  - `lib/stores/` - Zustand state stores
  - `lib/utils.ts` - Shared utility functions

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: SQLite with Prisma ORM (schema defines Users, Prompts, Categories, Tags with proper relationships)
- **Authentication**: JWT-based auth system
- **Structure**:
  - `src/controllers/` - Request handlers for auth, prompts, categories, tags
  - `src/routes/` - Express route definitions
  - `src/middleware/` - Auth middleware, error handling, 404 handler
  - `prisma/schema.prisma` - Database schema with User-Prompt relationships, hierarchical categories, and tagging system

### Key Data Models
- **User**: Authentication and user management
- **Prompt**: Core entity with title, content, description, variables, metadata
- **Category**: Hierarchical categorization (supports parent-child relationships)
- **Tag**: Many-to-many tagging system via PromptTag junction table
- **PromptVersion**: Version history tracking for prompts

### Development Environment
The project uses separate frontend/backend development servers. Database is SQLite for development (file at `backend/prisma/dev.db`). Docker configurations exist but standard npm commands work for local development.

### API Endpoints Structure
- `/api/auth/*` - User registration, login, profile
- `/api/prompts/*` - CRUD operations for prompts
- `/api/categories/*` - Category management
- `/api/tags/*` - Tag management

All routes follow RESTful conventions with proper error handling and authentication middleware.