export default defineNuxtRouteMiddleware(async () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // Resolve user ID — useSupabaseUser() can be null during SSR/hydration
  let userId = user.value?.id
  if (!userId) {
    const { data: { session } } = await supabase.auth.getSession()
    userId = session?.user?.id
  }

  if (!userId) return navigateTo('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (profile?.role !== 'candidate') {
    return navigateTo('/recruiter/dashboard')
  }
})
