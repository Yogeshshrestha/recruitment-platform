import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body = await readBody(event)
  const { id: _id, recruiter_id: _rid, ...updates } = body

  // Check if company already exists for this recruiter
  const { data: existing } = await client
    .from('companies')
    .select('id')
    .eq('recruiter_id', user.id)
    .maybeSingle()

  let data, error

  if (existing?.id) {
    ;({ data, error } = await client
      .from('companies')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single())
  } else {
    ;({ data, error } = await client
      .from('companies')
      .insert({ ...updates, recruiter_id: user.id })
      .select()
      .single())
  }

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
