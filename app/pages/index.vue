<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()

// Resolve current user ID with session fallback
const resolveUserId = async (): Promise<string | null> => {
  if (user.value?.id) return user.value.id
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id ?? null
}

// Resolve role from profile or metadata
const resolveRole = async (): Promise<string | null> => {
  const uid = await resolveUserId()
  if (!uid) return null
  const { data } = await supabase.from('profiles').select('role').eq('id', uid).single()
  return (data?.role as string | null) ?? (user.value?.user_metadata?.role as string | null) ?? null
}

const handleHireTalent = () => {
  navigateTo('/candidates')
}

const handlePostJob = async () => {
  const uid = await resolveUserId()
  if (!uid) {
    navigateTo('/auth?tab=register')
    return
  }
  const role = await resolveRole()
  if (role === 'recruiter') {
    navigateTo('/recruiter/dashboard')
    return
  }
  // Logged in but as a candidate
  toast.add({
    title: 'Recruiter account required',
    description: 'You are signed in as a candidate. Create a recruiter account to post jobs.',
    color: 'warning',
  })
}

const { fetchJobs } = useJobs()

const { data: featuredData, pending } = await useAsyncData<any[]>('featured-jobs', async () => {
  const result = await fetchJobs({ limit: 6, page: 1 })
  return result.data ?? []
})

const featuredJobs = computed<any[]>(() => featuredData.value ?? [])

const stats = [
  { label: 'Open Positions', value: '1,200+', icon: 'i-heroicons-briefcase' },
  { label: 'Companies Hiring', value: '350+', icon: 'i-heroicons-building-office-2' },
  { label: 'Candidates Placed', value: '8,000+', icon: 'i-heroicons-users' },
  { label: 'Success Rate', value: '94%', icon: 'i-heroicons-chart-bar' },
]

const categories = [
  { label: 'Engineering', icon: 'i-heroicons-code-bracket', count: 342 },
  { label: 'Design', icon: 'i-heroicons-paint-brush', count: 128 },
  { label: 'Product', icon: 'i-heroicons-light-bulb', count: 97 },
  { label: 'Marketing', icon: 'i-heroicons-megaphone', count: 184 },
  { label: 'Sales', icon: 'i-heroicons-currency-dollar', count: 215 },
  { label: 'Finance', icon: 'i-heroicons-calculator', count: 89 },
]
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="bg-white border-b border-slate-200">
      <UContainer class="max-w-7xl">
        <div class="py-20 md:py-24 text-center max-w-3xl mx-auto">
          <UBadge color="neutral" variant="soft" size="sm" class="mb-5 bg-slate-100 text-slate-700 ring-1 ring-slate-200">
            Curated opportunities for modern teams
          </UBadge>
          <h1 class="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight mb-6">
            Find your dream job or
            <span class="text-indigo-600">hire top talent</span>
          </h1>
          <p class="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed">
            TalentBridge connects ambitious professionals with forward-thinking companies.
            Browse thousands of curated opportunities across every industry.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <UButton
              to="/jobs"
              size="xl"
              color="primary"
              class="bg-indigo-600 text-white border border-indigo-600"
            >
              Find a Job
            </UButton>
            <UButton
              size="xl"
              variant="outline"
              color="neutral"
              class="border-slate-200 text-slate-700 bg-white hover:bg-white active:bg-white hover:text-slate-700"
              @click="handleHireTalent"
            >
              Hire Talent
            </UButton>
          </div>
          <p class="text-sm text-slate-400 mt-6">
            Join 50,000+ professionals already on TalentBridge
          </p>
        </div>
      </UContainer>
    </section>

    <!-- Stats -->
    <section class="bg-slate-50 border-b border-slate-200 py-14">
      <UContainer class="max-w-7xl">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="text-center bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
          >
            <UIcon :name="stat.icon" class="text-slate-400 text-lg mb-2" />
            <div class="text-2xl font-semibold tracking-tight text-slate-900">{{ stat.value }}</div>
            <div class="text-slate-500 text-sm mt-1">{{ stat.label }}</div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Job Categories -->
    <section class="py-16 bg-slate-50">
      <UContainer class="max-w-7xl">
        <div class="text-center mb-10">
          <h2 class="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Browse by Category</h2>
          <p class="text-slate-600 mt-2">Explore opportunities across every field</p>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <NuxtLink
            v-for="cat in categories"
            :key="cat.label"
            :to="`/jobs?category=${cat.label}`"
            class="bg-white rounded-xl p-5 text-center border border-slate-200 shadow-sm group"
          >
            <UIcon :name="cat.icon" class="text-xl text-slate-500 mb-3" />
            <p class="text-sm font-semibold text-slate-900 tracking-tight">{{ cat.label }}</p>
            <p class="text-xs text-slate-400 mt-1">{{ cat.count }} jobs</p>
          </NuxtLink>
        </div>
      </UContainer>
    </section>

    <!-- Featured Jobs -->
    <section class="py-16 bg-white border-y border-slate-200">
      <UContainer class="max-w-7xl">
        <div class="flex items-center justify-between mb-10">
          <div>
            <h2 class="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Featured Jobs</h2>
            <p class="text-slate-600 mt-1">Hand-picked opportunities for you</p>
          </div>
          <UButton to="/jobs" variant="outline" color="neutral" class="border-slate-200 text-slate-700 bg-white hover:bg-white active:bg-white" trailing-icon="i-heroicons-arrow-right">
            View all jobs
          </UButton>
        </div>

        <!-- Loading skeletons -->
        <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard v-for="i in 6" :key="i" />
        </div>

        <!-- Job cards -->
        <div v-else-if="featuredJobs.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <JobCard v-for="job in featuredJobs" :key="job.id" :job="job" />
        </div>

        <!-- Empty state -->
        <div v-else class="text-center py-16">
          <div class="mx-auto mb-4 w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
            <UIcon name="i-heroicons-briefcase" class="text-xl text-slate-400" />
          </div>
          <p class="text-lg font-semibold tracking-tight text-slate-700">No jobs yet</p>
          <p class="text-sm text-slate-400">Check back soon for new opportunities.</p>
        </div>
      </UContainer>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-white">
      <UContainer class="max-w-7xl">
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <UCard class="border border-slate-200 shadow-sm rounded-xl bg-white">
            <h2 class="text-3xl font-bold tracking-tight text-slate-900 mb-4">Ready to find your next hire?</h2>
            <p class="text-slate-600 mb-6 text-lg">
              Post a job today and reach thousands of qualified candidates actively looking for their next opportunity.
            </p>
            <UButton
              size="lg"
              color="primary"
              class="bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-600 active:bg-indigo-600"
              @click="handlePostJob"
            >
              Post a Job — It's Free
            </UButton>
          </UCard>
          <UCard class="border border-slate-200 shadow-sm rounded-xl bg-white">
            <h2 class="text-3xl font-bold tracking-tight text-slate-900 mb-4">Searching for a new role?</h2>
            <p class="text-slate-600 mb-6 text-lg">
              Create your profile, upload your resume, and let companies come to you.
            </p>
            <UButton
              to="/jobs"
              size="lg"
              variant="outline"
              color="neutral"
              class="border-slate-200 text-slate-700 bg-white hover:bg-white active:bg-white"
            >
              Browse Jobs Now
            </UButton>
          </UCard>
        </div>
      </UContainer>
    </section>
  </div>
</template>
