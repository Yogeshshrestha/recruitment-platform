export type ApplicationStatus = 'applied' | 'reviewing' | 'interviewing' | 'rejected' | 'hired'

export interface Application {
  id: string
  job_id: string
  candidate_id: string
  resume_url: string | null
  cover_letter: string | null
  status: ApplicationStatus
  created_at: string
  jobs?: {
    id: string
    title: string
    location: string | null
    type: string
    companies?: { name: string; logo_url: string | null }
  }
  profiles?: {
    full_name: string | null
    avatar_url: string | null
    bio: string | null
    skills: string[]
  }
}

export const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string }> = {
  applied:      { label: 'Applied',      color: 'info' },
  reviewing:    { label: 'Reviewing',    color: 'warning' },
  interviewing: { label: 'Interviewing', color: 'primary' },
  rejected:     { label: 'Rejected',     color: 'error' },
  hired:        { label: 'Hired',        color: 'success' },
}

export const useApplications = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // Resolves current user ID safely — handles SSR/hydration delay
  const resolveUserId = async (): Promise<string | null> => {
    if (user.value?.id) return user.value.id
    const { data: { session } } = await supabase.auth.getSession()
    return session?.user?.id ?? null
  }

  const apply = async (jobId: string, coverLetter?: string, resumePath?: string) => {
    const userId = await resolveUserId()
    if (!userId) return { data: null, error: new Error('Not authenticated') }
    return supabase
      .from('applications')
      .insert({
        job_id: jobId,
        candidate_id: userId,
        cover_letter: coverLetter || null,
        resume_url: resumePath || null,
        status: 'applied',
      })
      .select()
      .single()
  }

  const checkApplied = async (jobId: string): Promise<boolean> => {
    const userId = await resolveUserId()
    if (!userId) return false
    const { data } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('candidate_id', userId)
      .maybeSingle()
    return !!data
  }

  const fetchCandidateApplications = async () => {
    const userId = await resolveUserId()
    if (!userId) return { data: null, error: new Error('Not authenticated') }
    return supabase
      .from('applications')
      .select(`
        *,
        jobs (
          id, title, location, type,
          companies ( name, logo_url )
        )
      `)
      .eq('candidate_id', userId)
      .order('created_at', { ascending: false })
  }

  const fetchJobApplicants = async (jobId: string) => {
    const userId = await resolveUserId()
    if (!userId) return { data: null, error: new Error('Not authenticated') }

    // Fetch applications first (no cross-schema FK join needed)
    const { data: apps, error } = await supabase
      .from('applications')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })

    if (error) return { data: null, error }
    if (!apps || apps.length === 0) return { data: [], error: null }

    // Fetch profiles for all applicants in a single query
    const candidateIds = apps.map((a: any) => a.candidate_id)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, bio, skills')
      .in('id', candidateIds)

    const profileMap: Record<string, any> = {}
    for (const p of profiles ?? []) profileMap[p.id] = p

    const enriched = apps.map((app: any) => ({
      ...app,
      profiles: profileMap[app.candidate_id] ?? null,
    }))

    return { data: enriched, error: null }
  }

  const updateStatus = async (applicationId: string, status: ApplicationStatus) => {
    const userId = await resolveUserId()
    if (!userId) return { data: null, error: new Error('Not authenticated') }
    return supabase
      .from('applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', applicationId)
      .select()
      .single()
  }

  const getResumeUrl = async (resumePath: string) => {
    const { data } = await supabase.storage
      .from('resumes')
      .createSignedUrl(resumePath, 3600)
    return data?.signedUrl
  }

  return { apply, checkApplied, fetchCandidateApplications, fetchJobApplicants, updateStatus, getResumeUrl }
}
