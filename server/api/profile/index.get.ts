import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    // If profile is missing, create it from auth metadata.
    if (error.code === 'PGRST116') {
      const { data: created, error: createErrorResponse } = await client
        .from('profiles')
        .insert({
          id: user.id,
          role: (user.user_metadata?.role as 'candidate' | 'recruiter') ?? 'candidate',
          full_name: (user.user_metadata?.full_name as string) ?? '',
        })
        .select('*')
        .single()

      if (createErrorResponse) {
        throw createError({ statusCode: 500, message: createErrorResponse.message })
      }

      return created
    }

    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
