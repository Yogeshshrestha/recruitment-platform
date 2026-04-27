<script setup lang="ts">
const { fetchJobs } = useJobs()
const route = useRoute()
const router = useRouter()

const search = ref((route.query.search as string) || '')
const category = ref((route.query.category as string) || '')
const type = ref((route.query.type as string) || '')
const page = ref(Number(route.query.page) || 1)
const limit = 12

const loading = ref(false)
const jobs = ref<any[]>([])
const total = ref(0)

const totalPages = computed(() => Math.ceil(total.value / limit))

const loadJobs = async () => {
  loading.value = true
  const { data, count } = await fetchJobs({
    search: search.value || undefined,
    category: category.value || undefined,
    type: type.value || undefined,
    page: page.value,
    limit,
  })
  jobs.value = data ?? []
  total.value = count ?? 0
  loading.value = false
}

await loadJobs()

const handleSearch = async () => {
  page.value = 1
  await loadJobs()
  router.replace({
    query: {
      ...(search.value && { search: search.value }),
      ...(category.value && { category: category.value }),
      ...(type.value && { type: type.value }),
    },
  })
}

const clearFilters = () => {
  search.value = ''
  category.value = ''
  type.value = ''
  page.value = 1
  loadJobs()
  router.replace({ query: {} })
}

const handlePageChange = async (p: number) => {
  page.value = p
  await loadJobs()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="bg-white border-b border-slate-200">
      <UContainer>
        <div class="py-10">
          <h1 class="text-3xl font-bold text-slate-900 mb-2">Job Board</h1>
          <p class="text-slate-500">{{ total.toLocaleString() }} open positions</p>
        </div>
      </UContainer>
    </div>

    <UContainer>
      <div class="py-8">
        <!-- Search + Filters -->
        <div class="mb-8">
          <JobSearchBar
            v-model:search="search"
            v-model:category="category"
            v-model:type="type"
            @search="handleSearch"
            @clear="clearFilters"
          />
        </div>

        <!-- Loading skeletons -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <SkeletonCard v-for="i in 9" :key="i" />
        </div>

        <!-- Jobs grid -->
        <div v-else-if="jobs.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <JobCard v-for="job in jobs" :key="job.id" :job="job" />
        </div>

        <!-- Empty state -->
        <div v-else class="text-center py-20">
          <UIcon name="i-heroicons-briefcase" class="text-5xl text-slate-300 mb-4" />
          <h3 class="text-lg font-semibold text-slate-700 mb-2">No jobs found</h3>
          <p class="text-slate-400 mb-6">Try adjusting your search or filters.</p>
          <UButton color="primary" variant="soft" @click="clearFilters">Clear filters</UButton>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center mt-10">
          <UPagination
            :model-value="page"
            :page-count="limit"
            :total="total"
            @update:model-value="handlePageChange"
          />
        </div>
      </div>
    </UContainer>
  </div>
</template>
