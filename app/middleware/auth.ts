export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()

  if (!user.value?.id) {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user?.id) {
      return
    }
    return navigateTo('/auth')
  }
})
