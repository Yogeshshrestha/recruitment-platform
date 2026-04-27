# TalentBridge — Recruitment Platform

A fully functional, production-ready recruitment platform built with **Nuxt 4**, **Supabase**, **Nuxt UI v4**, and **Tailwind CSS v4**.

---

## Tech Stack

- **Frontend**: Nuxt 4 (Composition API, `<script setup>`)
- **Backend/DB**: Supabase (PostgreSQL + Auth + Storage)
- **UI**: Nuxt UI v4 + Tailwind CSS v4
- **Icons**: Heroicons + Lucide (via Iconify)

---

## Features

| Role | Features |
|---|---|
| **Candidate** | Browse & search jobs, apply with cover letter, upload resume, track application status |
| **Recruiter** | Post jobs, manage company profile, view all applicants (ATS), update application status, download resumes |
| **Public** | Home page with featured jobs, full job board with search/filter/pagination, job detail page |

---

## ⚠️ Required Manual Setup (Do this before running)

### 1. Run the SQL Schema in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** → **New query**
4. Paste the full contents of `supabase/schema.sql`
5. Click **Run**

This creates all tables (`profiles`, `companies`, `jobs`, `applications`), Row Level Security policies, storage buckets, and an auto-profile-creation trigger.

### 2. Configure Supabase Auth

1. Go to **Authentication** → **Providers** → **Email**
2. Ensure Email auth is enabled (it is by default)
3. Optionally disable "Confirm email" for faster local testing

### 3. Set Auth Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   - `http://localhost:3000/auth/confirm` (development)
   - `https://your-domain.com/auth/confirm` (production)

### 4. Storage Buckets (auto-created by SQL, but verify)

The SQL schema creates three buckets automatically. Verify they exist at:
**Storage** → Buckets:
- `avatars` (public)
- `logos` (public)
- `resumes` (private)

If they don't appear, create them manually.

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

The app runs at `http://localhost:3000`.

---

## Environment Variables

The `.env` file is pre-configured with your Supabase credentials:

```
SUPABASE_URL=https://oyqxnkbiaaenjkzmyfeb.supabase.co
SUPABASE_KEY=sb_publishable_...
```

---

## Project Structure

```
app/
  app.config.ts          # Nuxt UI color theme (primary: indigo)
  app.vue                # Root component with UApp wrapper
  layouts/
    default.vue          # Main layout with role-aware navbar
    auth.vue             # Minimal layout for auth pages
  pages/
    index.vue            # Home page
    jobs/
      index.vue          # Job board with search & filters
      [id].vue           # Job detail + Apply Now
    auth/
      index.vue          # Login / Register with role selector
      confirm.vue        # Auth callback handler
    candidate/
      dashboard.vue      # Profile, resume upload, my applications
    recruiter/
      dashboard.vue      # Company profile, post jobs, active jobs
      jobs/[id]/
        applicants.vue   # ATS: view & manage applicants
  composables/
    useProfile.ts        # Profile CRUD + file uploads
    useJobs.ts           # Jobs CRUD + company management
    useApplications.ts   # Application submission & tracking
  middleware/
    candidate.ts         # Guards /candidate/* routes
    recruiter.ts         # Guards /recruiter/* routes
  types/
    database.types.ts    # Supabase TypeScript types
server/
  api/
    jobs/index.get.ts    # GET /api/jobs
    jobs/[id].get.ts     # GET /api/jobs/:id
    applications/
      index.post.ts      # POST /api/applications
      [id].patch.ts      # PATCH /api/applications/:id
supabase/
  schema.sql             # Full database schema + RLS + storage
```

---

## Application Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Home page |
| `/jobs` | Public | Job board |
| `/jobs/:id` | Public | Job details |
| `/auth` | Public | Login / Register |
| `/auth/confirm` | Public | Auth callback |
| `/candidate/dashboard` | Candidate only | Profile + applications |
| `/recruiter/dashboard` | Recruiter only | Company + jobs |
| `/recruiter/jobs/:id/applicants` | Recruiter only | ATS view |
