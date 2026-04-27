export interface Company {
  id: string
  recruiter_id: string
  name: string
  description: string | null
  logo_url: string | null
  website: string | null
  location: string | null
}

export interface Job {
  id: string
  company_id: string | null
  recruiter_id: string
  title: string
  description: string
  location: string | null
  salary_range: string | null
  type: string
  category: string | null
  status: 'open' | 'closed'
  created_at: string
  companies?: Company | null
}

export const JOB_CATEGORIES = [
  'Engineering', 'Design', 'Product', 'Marketing', 'Sales',
  'Finance', 'HR', 'Operations', 'Legal', 'Other',
]

export const JOB_TYPES = [
  { label: 'Full-time', value: 'full-time' },
  { label: 'Part-time', value: 'part-time' },
  { label: 'Contract', value: 'contract' },
  { label: 'Remote', value: 'remote' },
  { label: 'Hybrid', value: 'hybrid' },
]

export const useJobs = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // Resolves the current user ID safely — handles SSR/hydration delay
  const resolveUserId = async (): Promise<string | null> => {
    if (user.value?.id) return user.value.id
    const { data: { session } } = await supabase.auth.getSession()
    return session?.user?.id ?? null
  }

  const fetchJobs = async (params?: {
    search?: string
    category?: string
    type?: string
    page?: number
    limit?: number
  }) => {
    const { search, category, type, page = 1, limit = 12 } = params ?? {}
    let query = supabase
      .from('jobs')
      .select('*, companies(id, name, logo_url, location)', { count: 'exact' })
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (search) query = query.ilike('title', `%${search}%`)
    if (category) query = query.eq('category', category)
    if (type) query = query.eq('type', type)

    return query
  }

  const fetchJob = async (id: string) => {
    return supabase
      .from('jobs')
      .select('*, companies(id, name, logo_url, location, description, website)')
      .eq('id', id)
      .single()
  }

  const fetchRecruiterJobs = async () => {
    const userId = await resolveUserId()
    if (!userId) return { data: null, error: new Error('Not authenticated') }
    return supabase
      .from('jobs')
      .select('*, companies(name, logo_url)')
      .eq('recruiter_id', userId)
      .order('created_at', { ascending: false })
  }

  const createJob = async (jobData: Omit<Job, 'id' | 'recruiter_id' | 'created_at' | 'companies'>) => {
    const userId = await resolveUserId()
    if (!userId) return { data: null, error: new Error('Not authenticated') }
    return supabase
      .from('jobs')
      .insert({ ...jobData, recruiter_id: userId })
      .select()
      .single()
  }

  const updateJobStatus = async (id: string, status: 'open' | 'closed') => {
    const userId = await resolveUserId()
    if (!userId) return { data: null, error: new Error('Not authenticated') }
    return supabase
      .from('jobs')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('recruiter_id', userId)
      .select()
      .single()
  }

  const fetchCompany = async () => {
    const userId = await resolveUserId()
    if (!userId) return { data: null, error: new Error('Not authenticated') }
    return supabase
      .from('companies')
      .select('*')
      .eq('recruiter_id', userId)
      .maybeSingle()
  }

  const upsertCompany = async (companyData: Partial<Company>) => {
    const userId = await resolveUserId()
    if (!userId) return { data: null, error: new Error('Not authenticated') }
    const existing = await fetchCompany()
    if (existing.data?.id) {
      return supabase
        .from('companies')
        .update({ ...companyData, updated_at: new Date().toISOString() })
        .eq('id', existing.data.id)
        .select()
        .single()
    }
    return supabase
      .from('companies')
      .insert({ ...companyData, recruiter_id: userId })
      .select()
      .single()
  }

  return { fetchJobs, fetchJob, fetchRecruiterJobs, createJob, updateJobStatus, fetchCompany, upsertCompany }
}
