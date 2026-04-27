<script setup lang="ts">
type JobDetail = {
  id: string
  title: string
  description: string
  location: string | null
  salary_range: string | null
  type: string
  category: string | null
  status: string
  created_at: string
  companies: {
    id: string
    name: string
    logo_url: string | null
    location: string | null
    description: string | null
    website: string | null
  } | null
}

const route = useRoute()
const supabase = useSupabaseClient()
const { fetchJob } = useJobs()
const { checkApplied } = useApplications()
const user = useSupabaseUser()

const { data: job, pending, error } = await useAsyncData<JobDetail | null>(
  `job-${route.params.id}`,
  () => fetchJob(route.params.id as string).then(r => r.data as JobDetail | null)
)

const alreadyApplied = ref(false)
const applyOpen = ref(false)

// Resolves current user ID accounting for SSR/hydration delay
const resolveUserId = async (): Promise<string | null> => {
  if (user.value?.id) return user.value.id
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id ?? null
}

onMounted(async () => {
  const userId = await resolveUserId()
  if (userId && job.value?.id) {
    alreadyApplied.value = await checkApplied(job.value.id)
  }
})

const handleApply = async () => {
  const userId = await resolveUserId()
  if (!userId) {
    navigateTo('/auth')
    return
  }
  applyOpen.value = true
}

const onApplicationSubmitted = () => {
  alreadyApplied.value = true
}

type BadgeColor = 'primary' | 'warning' | 'info' | 'success' | 'neutral'
const typeColor: Record<string, BadgeColor> = {
  'full-time': 'primary',
  'part-time': 'warning',
  'contract': 'info',
  'remote': 'success',
  'hybrid': 'neutral',
}
</script>

<template>
  <div>
    <UContainer>
      <div class="py-8 max-w-4xl mx-auto">
        <!-- Back -->
        <UButton
          to="/jobs"
          variant="ghost"
          color="neutral"
          icon="i-heroicons-arrow-left"
          class="mb-6"
        >
          Back to jobs
        </UButton>

        <!-- Loading -->
        <div v-if="pending" class="space-y-4">
          <USkeleton class="h-10 w-3/4 rounded" />
          <USkeleton class="h-4 w-1/2 rounded" />
          <USkeleton class="h-64 w-full rounded-xl" />
        </div>

        <!-- Error -->
        <UAlert
          v-else-if="error || !job"
          color="error"
          icon="i-heroicons-exclamation-triangle"
          title="Job not found"
          description="This job may have been removed or is no longer available."
        />

        <div v-else class="space-y-6">
          <!-- Job header card -->
          <UCard
            class="bg-white border border-slate-200 shadow-sm rounded-xl"
            :ui="{ root: 'bg-white border border-slate-200 rounded-xl shadow-sm', body: 'bg-white' }"
          >
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div class="flex items-start gap-4">
                <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shrink-0">
                  <UIcon name="i-heroicons-building-office-2" class="text-indigo-600 text-2xl" />
                </div>
                <div>
                  <h1 class="text-2xl font-bold text-slate-900">{{ job.title }}</h1>
                  <p class="text-slate-600 mt-1 font-medium">{{ job.companies?.name ?? 'Company' }}</p>
                  <div class="flex flex-wrap gap-2 mt-3">
                    <UBadge v-if="job.location" variant="soft" color="neutral" class="bg-slate-100 text-slate-700 ring-1 ring-slate-200">
                      <UIcon name="i-heroicons-map-pin" class="mr-1 text-xs" />{{ job.location }}
                    </UBadge>
                    <UBadge :color="typeColor[job.type] ?? 'primary'" variant="soft" class="ring-1 ring-inset ring-current/15">{{ job.type }}</UBadge>
                    <UBadge v-if="job.category" variant="soft" color="neutral" class="bg-slate-100 text-slate-700 ring-1 ring-slate-200">{{ job.category }}</UBadge>
                  </div>
                </div>
              </div>

              <div class="flex flex-col items-start sm:items-end gap-3 shrink-0">
                <p v-if="job.salary_range" class="text-xl font-bold text-indigo-600">
                  {{ job.salary_range }}
                </p>
                <UButton
                  v-if="alreadyApplied"
                  disabled
                  color="success"
                  variant="soft"
                  icon="i-heroicons-check"
                >
                  Applied
                </UButton>
                <UButton
                  v-else
                  color="primary"
                  size="lg"
                  icon="i-heroicons-paper-airplane"
                  @click="handleApply"
                >
                  Apply Now
                </UButton>
                <p class="text-xs text-slate-400">
                  Posted {{ new Date(job.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }}
                </p>
              </div>
            </div>
          </UCard>

          <div class="grid md:grid-cols-3 gap-6">
            <!-- Main description -->
            <div class="md:col-span-2 space-y-6">
              <UCard
                class="bg-white border border-slate-200 shadow-sm rounded-xl"
                :ui="{ root: 'bg-white border border-slate-200 rounded-xl shadow-sm', body: 'bg-white' }"
              >
                <h2 class="text-lg font-semibold text-slate-900 mb-4">Job Description</h2>
                <!-- eslint-disable-next-line vue/no-v-html -->
                <div
                  class="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap"
                  v-html="job.description"
                />
              </UCard>
            </div>

            <!-- Sidebar -->
            <div class="space-y-4">
              <!-- Company info -->
              <UCard
                v-if="job.companies"
                class="bg-white border border-slate-200 shadow-sm rounded-xl"
                :ui="{ root: 'bg-white border border-slate-200 rounded-xl shadow-sm', body: 'bg-white' }"
              >
                <h3 class="font-semibold text-slate-900 mb-3">About the Company</h3>
                <p class="text-sm text-slate-600 mb-3">{{ job.companies.description ?? 'No description available.' }}</p>
                <div class="space-y-2 text-sm text-slate-500">
                  <div v-if="job.companies.location" class="flex items-center gap-2">
                    <UIcon name="i-heroicons-map-pin" class="text-slate-400 shrink-0" />
                    <span>{{ job.companies.location }}</span>
                  </div>
                  <div v-if="job.companies.website" class="flex items-center gap-2">
                    <UIcon name="i-heroicons-globe-alt" class="text-slate-400 shrink-0" />
                    <a
                      :href="job.companies.website"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-indigo-600 hover:underline truncate"
                    >
                      {{ job.companies.website }}
                    </a>
                  </div>
                </div>
              </UCard>

              <!-- Job details -->
              <UCard
                class="bg-white border border-slate-200 shadow-sm rounded-xl"
                :ui="{ root: 'bg-white border border-slate-200 rounded-xl shadow-sm', body: 'bg-white' }"
              >
                <h3 class="font-semibold text-slate-900 mb-3">Job Details</h3>
                <dl class="space-y-3 text-sm">
                  <div class="flex justify-between">
                    <dt class="text-slate-500">Employment Type</dt>
                    <dd class="font-medium text-slate-800 capitalize">{{ job.type }}</dd>
                  </div>
                  <div v-if="job.salary_range" class="flex justify-between">
                    <dt class="text-slate-500">Salary</dt>
                    <dd class="font-medium text-indigo-600">{{ job.salary_range }}</dd>
                  </div>
                  <div v-if="job.category" class="flex justify-between">
                    <dt class="text-slate-500">Category</dt>
                    <dd class="font-medium text-slate-800">{{ job.category }}</dd>
                  </div>
                  <div v-if="job.location" class="flex justify-between">
                    <dt class="text-slate-500">Location</dt>
                    <dd class="font-medium text-slate-800">{{ job.location }}</dd>
                  </div>
                </dl>
              </UCard>

              <!-- Apply CTA (mobile) -->
              <UCard
                class="bg-white border border-slate-200 shadow-sm rounded-xl"
                :ui="{ root: 'bg-white border border-slate-200 rounded-xl shadow-sm', body: 'bg-white' }"
              >
                <UButton
                  v-if="alreadyApplied"
                  disabled
                  color="success"
                  variant="soft"
                  icon="i-heroicons-check"
                  block
                >
                  Application Submitted
                </UButton>
                <UButton
                  v-else
                  color="primary"
                  block
                  icon="i-heroicons-paper-airplane"
                  @click="handleApply"
                >
                  Apply Now
                </UButton>
                <p v-if="!user" class="text-xs text-slate-400 text-center mt-2">
                  You'll need to sign in first
                </p>
              </UCard>
            </div>
          </div>
        </div>
      </div>
    </UContainer>

    <!-- Apply Modal -->
    <ApplicationModal
      v-model:open="applyOpen"
      :job="job ?? null"
      @submitted="onApplicationSubmitted"
    />
  </div>
</template>
