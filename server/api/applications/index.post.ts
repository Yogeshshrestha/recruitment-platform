import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const client = await serverSupabaseClient(event)
  const body = await readBody(event)

  const { job_id, cover_letter, resume_url } = body

  if (!job_id) {
    throw createError({ statusCode: 400, message: 'job_id is required' })
  }

  const { data, error } = await client
    .from('applications')
    .insert({
      job_id,
      candidate_id: user.id,
      cover_letter: cover_letter ?? null,
      resume_url: resume_url ?? null,
      status: 'applied',
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw createError({ statusCode: 409, message: 'You have already applied for this job' })
    }
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
