# TalentBridge Project Guide

This guide explains what the project does, how it works end-to-end, and how to demonstrate it clearly.

## 1) What This Project Is

TalentBridge is a full-stack recruitment platform with two user roles:

- `Candidate`: browse jobs, update profile, upload resume, apply to jobs, track application status
- `Recruiter`: manage company profile, post jobs, view applicants, update applicant status in ATS

Built with:

- Nuxt 4 (`app/` pages + composables + middleware)
- Supabase (PostgreSQL + Auth + Storage + RLS)
- Nuxt UI + Tailwind CSS (clean light UI)

## 2) Core User Flows

### Public Flow

- Visit `/` for landing page and featured jobs
- Click `Find a Job` to go to `/jobs`
- Click `Hire Talent` to go to `/candidates` (candidate directory)

### Candidate Flow

1. Register/login from `/auth` as `candidate`
2. Open `/candidate/dashboard`
3. Save profile details (name, bio, skills)
4. Upload resume
5. Browse `/jobs`, open a job detail page
6. Click `Apply Now` -> submit application
7. Track application statuses in dashboard

### Recruiter Flow

1. Register/login from `/auth` as `recruiter`
2. Open `/recruiter/dashboard`
3. Complete company profile
4. Post a new job
5. Open applicants page: `/recruiter/jobs/:id/applicants`
6. View candidate profile + cover letter
7. Move status (`applied`, `reviewing`, `interviewing`, `rejected`, `hired`)

## 3) Important Routes

- Public:
  - `/`
  - `/jobs`
  - `/jobs/:id`
  - `/candidates`
  - `/auth`
- Candidate:
  - `/candidate/dashboard`
- Recruiter:
  - `/recruiter/dashboard`
  - `/recruiter/jobs/:id/applicants`
- Shared:
  - `/profile`

## 4) How Access Control Works

Role-based middleware controls protected pages:

- `app/middleware/auth.global.ts`: blocks non-public routes when unauthenticated
- `app/middleware/candidate.ts`: candidate-only routes
- `app/middleware/recruiter.ts`: recruiter-only routes
- `app/middleware/auth.ts`: named auth middleware

Session hydration is handled with `supabase.auth.getSession()` fallback in key paths to avoid false redirects or "Not authenticated" race conditions.

## 5) Data Model (Supabase)

Main tables:

- `profiles`: role + personal details
- `companies`: recruiter company record
- `jobs`: posted jobs
- `applications`: candidate applications per job

Other important setup:

- Trigger auto-creates a profile row after signup
- RLS policies enforce row-level authorization
- Storage buckets:
  - `avatars` (public)
  - `logos` (public)
  - `resumes` (private)

Schema source: `supabase/schema.sql`

## 6) API and Composables

Server API (`server/api/`):

- `jobs/index.get.ts`, `jobs/[id].get.ts`
- `applications/index.post.ts`, `applications/[id].patch.ts`
- `profile/index.get.ts`, `profile/index.post.ts`
- `company/index.get.ts`, `company/index.post.ts`

Client composables (`app/composables/`):

- `useJobs.ts`: fetch/create/update jobs + company operations
- `useProfile.ts`: profile CRUD + avatar/resume upload
- `useApplications.ts`: apply/check/fetch/update applications

## 7) UI Behavior Notes

- Light theme is intentionally enforced across cards/forms/buttons
- Hover styles are tuned to avoid dark overlays
- Pages include loading skeletons and clear empty states
- Toast notifications provide success/error feedback

## 8) Demo Script (5-10 minutes)

Use this script for quick demos:

1. Open `/` and explain product value + CTAs
2. Show `/jobs` filtering and open one job detail
3. Login as Candidate -> `/candidate/dashboard`
4. Save profile and upload resume
5. Apply to a job from `/jobs/:id`
6. Login as Recruiter -> `/recruiter/dashboard`
7. Open ATS page (`/recruiter/jobs/:id/applicants`) and show received application
8. Change status to `interviewing`
9. Return to candidate dashboard and show status update
10. Show `/candidates` talent directory and skill filtering

## 9) Local Run Instructions

1. Install dependencies:

```bash
npm install
```

2. Ensure `.env` contains valid Supabase values:

- `SUPABASE_URL`
- `SUPABASE_KEY`

3. Run schema in Supabase SQL editor:

- `supabase/schema.sql`

4. Start app:

```bash
npm run dev
```

5. Open local URL (usually `http://localhost:3000`).

## 10) Common Troubleshooting

- **"Not authenticated" right after login**  
  Usually hydration timing. Refresh once and ensure session fallback is used in composables/middleware.

- **Applied but no applicant visible in ATS**  
  Check RLS policies and confirm recruiter owns the job. Also verify `applications` row exists for that `job_id`.

- **Profile not loading**  
  Confirm profile row exists in `profiles`; trigger should create it at signup.

- **Resume download failing**  
  Confirm `resumes` bucket exists and storage policies are applied.

---

For setup-specific details, also refer to `README.md`.
