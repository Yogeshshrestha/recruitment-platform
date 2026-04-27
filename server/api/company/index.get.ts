import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const { data, error } = await client
    .from('companies')
    .select('*')
    .eq('recruiter_id', user.id)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
