import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const query = getQuery(event)

  const {
    search = '',
    category = '',
    type = '',
    page = '1',
    limit = '12',
  } = query as Record<string, string>

  const pageNum = Math.max(1, parseInt(page))
  const pageSize = Math.min(50, parseInt(limit))
  const from = (pageNum - 1) * pageSize
  const to = from + pageSize - 1

  let q = client
    .from('jobs')
    .select('id, title, description, location, salary_range, type, category, status, created_at, companies(id, name, logo_url, location)', { count: 'exact' })
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (search) q = q.ilike('title', `%${search}%`)
  if (category) q = q.eq('category', category)
  if (type) q = q.eq('type', type)

  const { data, count, error } = await q

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return { jobs: data ?? [], total: count ?? 0 }
})
