import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

const VALID_STATUSES = ['applied', 'reviewing', 'interviewing', 'rejected', 'hired']

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const client = await serverSupabaseClient(event)
  const applicationId = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { status } = body

  if (!status || !VALID_STATUSES.includes(status)) {
    throw createError({ statusCode: 400, message: 'Invalid status value' })
  }

  // Verify the recruiter owns the job this application belongs to
  const { data: application } = await client
    .from('applications')
    .select('id, job_id')
    .eq('id', applicationId)
    .single()

  if (!application) {
    throw createError({ statusCode: 404, message: 'Application not found' })
  }

  const { data: job } = await client
    .from('jobs')
    .select('recruiter_id')
    .eq('id', application.job_id)
    .single()

  if (!job || job.recruiter_id !== user.id) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  const { data, error } = await client
    .from('applications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', applicationId)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
