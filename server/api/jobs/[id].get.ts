import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, message: 'Job ID is required' })
  }

  const { data, error } = await client
    .from('jobs')
    .select('*, companies(id, name, logo_url, location, description, website)')
    .eq('id', id)
    .single()

  if (error) {
    throw createError({ statusCode: error.code === 'PGRST116' ? 404 : 500, message: error.message })
  }

  return data
})
