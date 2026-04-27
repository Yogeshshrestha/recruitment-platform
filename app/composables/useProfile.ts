export interface Profile {
  id: string
  role: 'candidate' | 'recruiter'
  full_name: string | null
  bio: string | null
  skills: string[]
  avatar_url: string | null
  resume_url: string | null
  updated_at: string
}

export const useProfile = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const profile = useState<Profile | null>('user-profile', () => null)
  const loading = ref(false)

  // Resolves current user ID accounting for SSR/hydration delay
  const resolveUserId = async (): Promise<string | null> => {
    if (user.value?.id) return user.value.id
    const { data: { session } } = await supabase.auth.getSession()
    return session?.user?.id ?? null
  }

  const fetchProfile = async () => {
    const userId = await resolveUserId()
    if (!userId) return
    loading.value = true
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error && error.code === 'PGRST116') {
      // Profile row missing — create it
      const { data: created } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          role: (user.value?.user_metadata?.role as 'candidate' | 'recruiter') ?? 'candidate',
          full_name: (user.value?.user_metadata?.full_name as string) ?? '',
        })
        .select('*')
        .single()
      if (created) profile.value = created as Profile
    } else if (data) {
      profile.value = data as Profile
    }
    loading.value = false
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    const userId = await resolveUserId()
    if (!userId) return { data: null, error: new Error('Not authenticated') }
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()
    if (data) profile.value = data as Profile
    return { data, error }
  }

  const uploadAvatar = async (file: File) => {
    const userId = await resolveUserId()
    if (!userId) return { data: null, error: new Error('Not authenticated') }
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })
    if (uploadError) return { data: null, error: uploadError }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    return updateProfile({ avatar_url: publicUrl })
  }

  const uploadResume = async (file: File) => {
    const userId = await resolveUserId()
    if (!userId) return { data: null, error: new Error('Not authenticated') }
    const ext = file.name.split('.').pop()
    const path = `${userId}/resume.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(path, file, { upsert: true })
    if (uploadError) return { data: null, error: uploadError }
    return updateProfile({ resume_url: `${userId}/resume.${ext}` })
  }

  const clearProfile = () => { profile.value = null }

  return { profile, loading, fetchProfile, updateProfile, uploadAvatar, uploadResume, clearProfile }
}
