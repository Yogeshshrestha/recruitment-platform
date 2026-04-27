<script setup lang="ts">
definePageMeta({ middleware: 'recruiter' })

const user = useSupabaseUser()
const toast = useToast()
const { fetchRecruiterJobs, updateJobStatus, fetchCompany } = useJobs()

const activeTab = ref('jobs')
const jobModalOpen = ref(false)
const closingJobId = ref<string | null>(null)

const company = ref<any>(null)
const jobs = ref<any[]>([])
const jobsLoading = ref(false)

onMounted(async () => {
  await loadCompany()
  await loadJobs()
})

const loadCompany = async () => {
  const { data } = await fetchCompany()
  if (data) company.value = data
}

const loadJobs = async () => {
  jobsLoading.value = true
  const { data } = await fetchRecruiterJobs()
  jobs.value = data ?? []
  jobsLoading.value = false
}

const onCompanySaved = (savedCompany: any) => {
  company.value = savedCompany
}

const onJobPosted = async () => {
  jobModalOpen.value = false
  await loadJobs()
}

const toggleJobStatus = async (job: any) => {
  closingJobId.value = job.id
  const newStatus = job.status === 'open' ? 'closed' : 'open'
  const { error } = await updateJobStatus(job.id, newStatus)
  closingJobId.value = null
  if (error) {
    toast.add({ title: 'Failed to update status', color: 'error' })
  } else {
    const idx = jobs.value.findIndex(j => j.id === job.id)
    if (idx !== -1) jobs.value[idx].status = newStatus
    toast.add({ title: `Job ${newStatus === 'open' ? 'reopened' : 'closed'}`, color: 'success' })
  }
}

const tabs = [
  { label: 'My Jobs', value: 'jobs', icon: 'i-heroicons-briefcase' },
  { label: 'Company Profile', value: 'company', icon: 'i-heroicons-building-office-2' },
]

const openJobs = computed(() => jobs.value.filter(j => j.status === 'open').length)
</script>

<template>
  <div class="bg-slate-50 min-h-screen">
    <!-- Header -->
    <div class="bg-white border-b border-slate-200">
      <UContainer class="max-w-7xl">
        <div class="py-10 flex items-center gap-4">
          <div class="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 text-xl font-bold shrink-0">
            {{ (company?.name ?? user?.email ?? 'R')[0]?.toUpperCase() }}
          </div>
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-slate-900">{{ company?.name ?? 'Recruiter Dashboard' }}</h1>
            <p class="text-slate-600 text-sm">{{ user?.email }}</p>
          </div>
          <div class="ml-auto flex items-center gap-3">
            <UBadge color="neutral" variant="soft" class="bg-slate-100 text-slate-700 ring-1 ring-slate-200">Recruiter</UBadge>
            <UButton
              color="primary"
              icon="i-heroicons-plus"
              class="bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-600 active:bg-indigo-600"
              @click="jobModalOpen = true"
            >
              Post a Job
            </UButton>
          </div>
        </div>

        <!-- Stats row -->
        <div class="grid grid-cols-3 gap-4 pb-4">
          <div class="text-center p-4 bg-white border border-slate-200 shadow-sm rounded-xl">
            <div class="text-2xl font-semibold tracking-tight text-slate-900">{{ jobs.length }}</div>
            <div class="text-xs text-slate-500 mt-1">Total Jobs</div>
          </div>
          <div class="text-center p-4 bg-white border border-slate-200 shadow-sm rounded-xl">
            <div class="text-2xl font-semibold tracking-tight text-slate-900">{{ openJobs }}</div>
            <div class="text-xs text-slate-500 mt-1">Open Jobs</div>
          </div>
          <div class="text-center p-4 bg-white border border-slate-200 shadow-sm rounded-xl">
            <div class="text-2xl font-semibold tracking-tight text-slate-900">{{ jobs.length }}</div>
            <div class="text-xs text-slate-500 mt-1">Job Posts</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex gap-0 border-b border-slate-200 -mb-px">
          <button
            v-for="t in tabs"
            :key="t.value"
            class="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors"
            :class="activeTab === t.value
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'"
            @click="activeTab = t.value"
          >
            <UIcon :name="t.icon" class="text-base" />
            {{ t.label }}
          </button>
        </div>
      </UContainer>
    </div>

    <UContainer class="max-w-7xl">
      <div class="py-12">
        <!-- JOBS TAB -->
        <div v-if="activeTab === 'jobs'">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-slate-900">
              Active Job Posts
              <UBadge class="ml-2 bg-slate-100 text-slate-700 ring-1 ring-slate-200" color="neutral" variant="soft">{{ jobs.length }}</UBadge>
            </h2>
            <UButton color="primary" icon="i-heroicons-plus" size="sm" class="bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-600 active:bg-indigo-600" @click="jobModalOpen = true">
              Post New Job
            </UButton>
          </div>

          <div v-if="jobsLoading" class="space-y-4">
            <UCard
              v-for="i in 3"
              :key="i"
              class="animate-pulse border border-slate-200 shadow-sm rounded-xl bg-white"
              :ui="{ root: 'bg-white border border-slate-200 rounded-xl shadow-sm', body: 'bg-white' }"
            >
              <div class="flex items-center justify-between gap-4">
                <div class="flex-1 space-y-2">
                  <USkeleton class="h-5 w-2/5" />
                  <USkeleton class="h-3 w-1/3" />
                </div>
                <USkeleton class="h-8 w-24 rounded-lg" />
                <USkeleton class="h-8 w-28 rounded-lg" />
              </div>
            </UCard>
          </div>

          <div v-else-if="jobs.length" class="space-y-3">
            <UCard
              v-for="job in jobs"
              :key="job.id"
              class="border border-slate-200 shadow-sm rounded-xl bg-white hover:border-slate-300 transition-colors"
              :ui="{ root: 'bg-white border border-slate-200 rounded-xl shadow-sm', body: 'bg-white' }"
            >
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h3 class="font-semibold text-slate-900">{{ job.title }}</h3>
                    <UBadge :color="job.status === 'open' ? 'neutral' : 'neutral'" variant="soft" size="sm" :class="job.status === 'open' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'">
                      {{ job.status === 'open' ? 'Open' : 'Closed' }}
                    </UBadge>
                  </div>
                  <div class="flex items-center gap-3 mt-1 text-sm text-slate-500 flex-wrap">
                    <span v-if="job.location" class="flex items-center gap-1">
                      <UIcon name="i-heroicons-map-pin" class="text-xs" /> {{ job.location }}
                    </span>
                    <span class="capitalize">{{ job.type }}</span>
                    <span v-if="job.category">· {{ job.category }}</span>
                    <span>· {{ new Date(job.created_at).toLocaleDateString() }}</span>
                  </div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <UButton
                    :to="`/recruiter/jobs/${job.id}/applicants`"
                    variant="outline"
                    color="neutral"
                    size="sm"
                    icon="i-heroicons-users"
                    class="border-slate-200 text-slate-700 bg-white hover:bg-white active:bg-white"
                  >
                    Applicants
                  </UButton>
                  <UButton
                    variant="outline"
                    color="neutral"
                    size="sm"
                    :loading="closingJobId === job.id"
                    :icon="job.status === 'open' ? 'i-heroicons-x-circle' : 'i-heroicons-check-circle'"
                    class="border-slate-200 text-slate-700 bg-white hover:bg-white active:bg-white"
                    @click="toggleJobStatus(job)"
                  >
                    {{ job.status === 'open' ? 'Close' : 'Reopen' }}
                  </UButton>
                </div>
              </div>
            </UCard>
          </div>

          <div v-else class="text-center py-20">
            <div class="mx-auto mb-4 w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
              <UIcon name="i-heroicons-briefcase" class="text-xl text-slate-400" />
            </div>
            <h3 class="text-lg font-semibold tracking-tight text-slate-700 mb-2">No jobs posted yet</h3>
            <p class="text-slate-400 mb-6">Create your first job posting to start finding candidates.</p>
            <UButton color="primary" icon="i-heroicons-plus" class="bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-600 active:bg-indigo-600" @click="jobModalOpen = true">Post Your First Job</UButton>
          </div>
        </div>

        <!-- COMPANY TAB -->
        <div v-else-if="activeTab === 'company'">
          <CompanyProfileForm @saved="onCompanySaved" />
        </div>
      </div>
    </UContainer>

    <!-- Post Job Modal -->
    <JobPostForm
      v-model:open="jobModalOpen"
      :company-id="company?.id"
      @posted="onJobPosted"
    />
  </div>
</template>
