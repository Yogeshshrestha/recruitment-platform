export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()

  // Routes that don't require authentication
  const publicRoutes = ['/', '/jobs', '/auth', '/auth/confirm']
  const isPublicRoute = publicRoutes.includes(to.path) || to.path.startsWith('/jobs/')

  // useSupabaseUser() can be briefly empty during client hydration;
  // check session directly before redirecting.
  if (!isPublicRoute && !user.value?.id) {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user?.id) {
      return
    }
    return navigateTo('/auth')
  }

  // If user is logged in and tries to access /auth, redirect them to the right dashboard
  // (role-specific redirect handled by auth page itself after login)
})
