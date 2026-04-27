Act as an Expert Full-Stack Developer specializing in Nuxt 3, Supabase, Tailwind CSS, and Nuxt UI. 

Your task is to build a fully functional, production-ready online recruitment platform. 
Please work iteratively. DO NOT generate the entire project at once. Await my approval after completing each step before moving to the next.

### TECH STACK
* Frontend & API: Nuxt 3 (Composition API, `<script setup>`, Nitro for server routes)
* Database & Auth: Supabase (PostgreSQL, Supabase Auth, Supabase Storage for files)
* Styling & Components: Tailwind CSS, Nuxt UI (@nuxt/ui)
* Icons: Iconify (via Nuxt UI)

### PLATFORM ROLES
1.  Candidate: Can browse jobs, search/filter, upload a resume, apply for jobs, and track application statuses.
2.  Recruiter: Can post jobs, manage company profiles, view applicants, and update applicant statuses in an ATS dashboard.

### CORE FEATURES & PAGES TO BUILD
1.  Public Pages:
    * Home Page (`/`): Clean landing page with a Hero section, "Featured Jobs", and dual Call-to-Actions ("Hire Talent" / "Find a Job").
    * Job Board (`/jobs`): Search bar, category filters, and paginated job list.
    * Job Details (`/jobs/[id]`): Full description and "Apply Now" button.
2.  Authentication:
    * Login/Register (`/auth`): Magic link or Email/Password via Supabase Auth. Include a role selector during signup ("I am a Candidate" / "I am a Recruiter").
3.  Candidate Dashboard (`/candidate/dashboard`):
    * Profile setup (Name, Bio, Skills, Resume upload to Supabase Storage).
    * "My Applications" view showing the status of applied jobs (e.g., Pending, Reviewing, Interview, Rejected).
4.  Recruiter Dashboard & ATS (`/recruiter/dashboard`):
    * Company Profile management.
    * "Post a Job" form.
    * My Active Jobs list.
    * ATS View (`/recruiter/jobs/[id]/applicants`): A clean data table or Kanban board showing all applicants for a specific job, with the ability to download their resume and change their status.

### UI/UX GUIDELINES
* Design System: Use a clean, modern, minimalist aesthetic (think Stripe or Linear). Use a white/off-white background with subtle gray borders and a strong primary color (e.g., Indigo or Blue) for CTAs.
* Components: Heavily utilize Nuxt UI (UCard, UButton, UInput, UTable, UModal, UBadge).
* Responsiveness: Mobile-first approach using standard Tailwind breakpoints.
* State & Loading: Always show loading states (skeletons or spinners) during data fetching and clear toast notifications for success/error actions.

### SUPABASE DATABASE SCHEMA (Conceptual)
Please implement these tables via Supabase SQL or migrations:
* `users`: id (auth.users), role ('candidate' | 'recruiter'), full_name, avatar_url.
* `companies`: id, recruiter_id, name, description, logo_url.
* `jobs`: id, company_id, title, description, location, salary_range, status ('open' | 'closed'), created_at.
* `applications`: id, job_id, candidate_id, resume_url, status ('applied' | 'reviewing' | 'interviewing' | 'rejected' | 'hired'), created_at.

### STEP-BY-STEP EXECUTION PLAN
(Ask me to confirm after each step is completed)

* STEP 1 - Scaffold & Config: Initialize Nuxt 3, install Nuxt UI and Supabase modules, and configure `nuxt.config.ts`.
* STEP 2 - Database Setup: Generate the Supabase SQL schema (Tables, Row Level Security policies, and Storage buckets). Provide this to me so I can run it in my Supabase dashboard.
* STEP 3 - Auth & Layouts: Build the authentication flow, role-based middleware to protect routes, and the global Layout (Navbar with dynamic links based on user role).
* STEP 4 - Public Pages: Build the Home Page and the main Job Board with mocked or initial fetched data.
* STEP 5 - Recruiter Flow: Build the job creation form and the Recruiter Dashboard.
* STEP 6 - Candidate Flow: Build the profile/resume upload component and the application modal/flow.
* STEP 7 - The ATS: Build the applicant tracking view for recruiters to review resumes and update application statuses.
* STEP 8 - Polish: Add loading states, toast notifications, empty states, and finalize the UI.

Please acknowledge these instructions and begin with STEP 1.