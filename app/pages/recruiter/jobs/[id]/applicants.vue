<script setup lang="ts">
definePageMeta({ middleware: 'recruiter' })

const route = useRoute()
const jobId = route.params.id as string
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()

const { fetchJobApplicants, updateStatus, getResumeUrl } = useApplications()

type ApplicationStatus = 'applied' | 'reviewing' | 'interviewing' | 'rejected' | 'hired'

const job = ref<any>(null)
const applicants = ref<any[]>([])
const loading = ref(true)
const updatingId = ref<string | null>(null)
const selectedApplicant = ref<any>(null)
const profileOpen = ref(false)
const downloadingId = ref<string | null>(null)
const initialized = ref(false)

const statusConfig: Record<ApplicationStatus, { label: string; color: string }> = {
  applied:      { label: 'Applied',      color: 'info' },
  reviewing:    { label: 'Reviewing',    color: 'warning' },
  interviewing: { label: 'Interviewing', color: 'primary' },
  rejected:     { label: 'Rejected',     color: 'error' },
  hired:        { label: 'Hired',        color: 'success' },
}

// Ensure we have a session before querying
const resolveSession = async () => {
  if (user.value?.id) return user.value.id
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id ?? null
}

const init = async () => {
  if (initialized.value) return
  const userId = await resolveSession()
  if (!userId) return
  initialized.value = true

  const { data: jobData } = await supabase
    .from('jobs')
    .select('*, companies(name)')
    .eq('id', jobId)
    .single()
  job.value = jobData

  await loadApplicants()
}

onMounted(init)

// Retry if session hydrates after mount
watch(() => user.value?.id, async (id) => {
  if (id && !initialized.value) await init()
})

const loadApplicants = async () => {
  loading.value = true
  const { data } = await fetchJobApplicants(jobId)
  applicants.value = data ?? []
  loading.value = false
}

const changeStatus = async (application: any, status: ApplicationStatus) => {
  updatingId.value = application.id
  const { error } = await updateStatus(application.id, status)
  updatingId.value = null

  if (error) {
    toast.add({ title: 'Failed to update status', color: 'error' })
  } else {
    const idx = applicants.value.findIndex(a => a.id === application.id)
    if (idx !== -1) applicants.value[idx].status = status
    toast.add({ title: 'Status updated', color: 'success' })
  }
}

const downloadResume = async (application: any) => {
  if (!application.resume_url) {
    toast.add({ title: 'No resume on file', description: 'This candidate has not uploaded a resume.', color: 'warning' })
    return
  }
  downloadingId.value = application.id
  const url = await getResumeUrl(application.resume_url)
  downloadingId.value = null

  if (!url) {
    toast.add({ title: 'Could not access resume', color: 'error' })
    return
  }
  window.open(url, '_blank')
}

const viewProfile = (applicant: any) => {
  selectedApplicant.value = applicant
  profileOpen.value = true
}

const filteredStatus = ref('')
const searchName = ref('')

const filteredApplicants = computed(() => {
  let result = applicants.value
  if (filteredStatus.value) result = result.filter(a => a.status === filteredStatus.value)
  if (searchName.value) {
    const q = searchName.value.toLowerCase()
    result = result.filter(a => a.profiles?.full_name?.toLowerCase().includes(q))
  }
  return result
})

const countByStatus = computed(() => {
  const counts: Record<string, number> = {}
  for (const app of applicants.value) {
    counts[app.status] = (counts[app.status] ?? 0) + 1
  }
  return counts
})
</script>

<template>
  <div class="bg-slate-50 min-h-screen">
    <!-- Header -->
    <div class="bg-white border-b border-slate-200">
      <UContainer>
        <div class="py-6">
          <div class="flex items-center gap-3 mb-4">
            <UButton
              to="/recruiter/dashboard"
              variant="ghost"
              color="neutral"
              icon="i-heroicons-arrow-left"
              size="sm"
            >
              Back to Dashboard
            </UButton>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold text-slate-900">
                {{ job?.title ?? 'Loading...' }}
              </h1>
              <p class="text-slate-500 text-sm mt-1">
                {{ job?.companies?.name ?? 'Company' }}
                <span v-if="job?.location"> · {{ job.location }}</span>
              </p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <UBadge :color="job?.status === 'open' ? 'success' : 'neutral'" variant="soft">
                {{ job?.status ?? '...' }}
              </UBadge>
              <UBadge color="primary" variant="soft">
                {{ applicants.length }} applicant{{ applicants.length !== 1 ? 's' : '' }}
              </UBadge>
            </div>
          </div>
        </div>
      </UContainer>
    </div>

    <UContainer>
      <div class="py-8">
        <!-- Pipeline summary -->
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          <button
            v-for="(cfg, status) in statusConfig"
            :key="status"
            class="p-4 rounded-xl border-2 text-center transition-all"
            :class="filteredStatus === status
              ? 'border-indigo-600 bg-indigo-50'
              : 'border-slate-200 bg-white hover:border-slate-300'"
            @click="filteredStatus = filteredStatus === status ? '' : status"
          >
            <div class="text-2xl font-bold text-slate-800">{{ countByStatus[status] ?? 0 }}</div>
            <div class="text-xs text-slate-500 mt-1">{{ cfg.label }}</div>
          </button>
        </div>

        <!-- Filters -->
        <div class="flex gap-3 mb-6">
          <UInput
            v-model="searchName"
            placeholder="Search by name..."
            icon="i-heroicons-magnifying-glass"
            class="flex-1 max-w-xs"
          />
          <UButton
            v-if="filteredStatus || searchName"
            variant="ghost"
            color="neutral"
            size="sm"
            @click="filteredStatus = ''; searchName = ''"
          >
            Clear filters
          </UButton>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="space-y-4">
          <UCard
            v-for="i in 5"
            :key="i"
            class="animate-pulse border border-slate-200 shadow-sm rounded-xl bg-white"
            :ui="{ root: 'bg-white border border-slate-200 rounded-xl shadow-sm', body: 'bg-white' }"
          >
            <div class="flex items-center gap-4">
              <USkeleton class="w-10 h-10 rounded-full" />
              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-1/3" />
                <USkeleton class="h-3 w-1/2" />
              </div>
              <USkeleton class="h-8 w-28 rounded-lg" />
              <USkeleton class="h-8 w-28 rounded-lg" />
            </div>
          </UCard>
        </div>

        <!-- Applicant Table Component -->
        <ApplicantTable
          v-else-if="filteredApplicants.length"
          :applicants="filteredApplicants"
          :updating-id="updatingId"
          :downloading-id="downloadingId"
          @change-status="changeStatus"
          @download-resume="downloadResume"
          @view-profile="viewProfile"
        />

        <!-- Empty state -->
        <div v-else class="text-center py-20">
          <UIcon name="i-heroicons-users" class="text-5xl text-slate-300 mb-4" />
          <h3 class="text-lg font-semibold text-slate-700 mb-2">
            {{ applicants.length ? 'No results match your filter' : 'No applicants yet' }}
          </h3>
          <p class="text-slate-400">
            {{ applicants.length ? 'Try clearing your filters.' : 'Share your job posting to attract candidates.' }}
          </p>
        </div>
      </div>
    </UContainer>

    <!-- Applicant Profile Modal -->
    <UModal
      v-model:open="profileOpen"
      :title="selectedApplicant?.profiles?.full_name ?? 'Candidate Profile'"
      :ui="{ content: 'sm:max-w-lg' }"
    >
      <template #body>
        <div v-if="selectedApplicant" class="space-y-5">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
              {{ (selectedApplicant.profiles?.full_name ?? '?')[0]?.toUpperCase() }}
            </div>
            <div>
              <h3 class="font-bold text-slate-900 text-lg">{{ selectedApplicant.profiles?.full_name ?? 'Anonymous' }}</h3>
              <UBadge
                :color="(statusConfig[selectedApplicant.status as ApplicationStatus]?.color as any) ?? 'neutral'"
                variant="soft"
              >
                {{ statusConfig[selectedApplicant.status as ApplicationStatus]?.label ?? selectedApplicant.status }}
              </UBadge>
            </div>
          </div>

          <div v-if="selectedApplicant.profiles?.bio">
            <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">About</h4>
            <p class="text-slate-700 text-sm leading-relaxed">{{ selectedApplicant.profiles.bio }}</p>
          </div>

          <div v-if="selectedApplicant.profiles?.skills?.length">
            <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Skills</h4>
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="skill in selectedApplicant.profiles.skills"
                :key="skill"
                variant="soft"
                color="primary"
              >
                {{ skill }}
              </UBadge>
            </div>
          </div>

          <div v-if="selectedApplicant.cover_letter">
            <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Cover Letter</h4>
            <p class="text-slate-700 text-sm leading-relaxed bg-slate-50 p-3 rounded-lg">
              {{ selectedApplicant.cover_letter }}
            </p>
          </div>

          <div class="text-xs text-slate-400">
            Applied on {{ new Date(selectedApplicant.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }}
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-between">
          <UButton
            variant="soft"
            color="neutral"
            icon="i-heroicons-document-arrow-down"
            :loading="downloadingId === selectedApplicant?.id"
            @click="downloadResume(selectedApplicant)"
          >
            Download Resume
          </UButton>
          <div class="flex gap-2">
            <UButton
              variant="soft"
              color="error"
              size="sm"
              @click="changeStatus(selectedApplicant, 'rejected'); profileOpen = false"
            >
              Reject
            </UButton>
            <UButton
              color="primary"
              size="sm"
              @click="changeStatus(selectedApplicant, 'interviewing'); profileOpen = false"
            >
              Move to Interview
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
