<script setup lang="ts">
definePageMeta({ middleware: 'candidate' })

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const { profile, fetchProfile } = useProfile()
const { fetchCandidateApplications } = useApplications()

const activeTab = ref('profile')
const applications = ref<any[]>([])
const appsLoading = ref(false)
const initialized = ref(false)

const init = async () => {
  if (initialized.value) return
  initialized.value = true
  await fetchProfile()
  await loadApplications()
}

onMounted(async () => {
  // Try immediately; if user not hydrated yet, session fallback handles it
  await init()
})

// Fallback: if user hydrates after mount, re-init
watch(() => user.value?.id, async (id) => {
  if (id && !initialized.value) await init()
})

const loadApplications = async () => {
  appsLoading.value = true
  const { data } = await fetchCandidateApplications()
  applications.value = data ?? []
  appsLoading.value = false
}

const statusConfig: Record<string, { label: string; color: any; class: string }> = {
  applied:      { label: 'Applied',      color: 'neutral', class: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200' },
  reviewing:    { label: 'Reviewing',    color: 'neutral', class: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  interviewing: { label: 'Interviewing', color: 'neutral', class: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200' },
  rejected:     { label: 'Rejected',     color: 'neutral', class: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200' },
  hired:        { label: 'Hired',        color: 'neutral', class: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
}

const tabs = [
  { label: 'My Profile', value: 'profile', icon: 'i-heroicons-user-circle' },
  { label: 'My Applications', value: 'applications', icon: 'i-heroicons-briefcase' },
]
</script>

<template>
  <div class="bg-slate-50 min-h-screen">
    <!-- Header -->
    <div class="bg-white border-b border-slate-200">
      <UContainer class="max-w-7xl bg-white">
        <div class="py-10 flex items-center gap-4 bg-white">
          <div class="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 text-xl font-bold shrink-0">
            {{ (profile?.full_name ?? user?.email ?? 'U')[0]?.toUpperCase() }}
          </div>
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-slate-900">
              {{ profile?.full_name || 'Your Dashboard' }}
            </h1>
            <p class="text-slate-600 text-sm">{{ user?.email }}</p>
          </div>
          <UBadge color="neutral" variant="soft" class="ml-auto bg-slate-100 text-slate-700 ring-1 ring-slate-200">Candidate</UBadge>
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

    <UContainer class="max-w-7xl bg-slate-50">
      <div class="py-12 bg-slate-50">
        <!-- PROFILE TAB -->
        <div v-if="activeTab === 'profile'">
          <CandidateProfileForm />
        </div>

        <!-- APPLICATIONS TAB -->
        <div v-else-if="activeTab === 'applications'">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-slate-900">
              My Applications
              <UBadge class="ml-2 bg-slate-100 text-slate-700 ring-1 ring-slate-200" color="neutral" variant="soft">{{ applications.length }}</UBadge>
            </h2>
          </div>

          <div v-if="appsLoading" class="space-y-4">
            <UCard
              v-for="i in 4"
              :key="i"
              class="animate-pulse border border-slate-200 shadow-sm rounded-xl bg-white"
              :ui="{ root: 'bg-white border border-slate-200 rounded-xl shadow-sm', body: 'bg-white' }"
            >
              <div class="flex items-center gap-4">
                <USkeleton class="w-10 h-10 rounded-lg" />
                <div class="flex-1 space-y-2">
                  <USkeleton class="h-4 w-1/2" />
                  <USkeleton class="h-3 w-1/3" />
                </div>
                <USkeleton class="h-6 w-20 rounded-full" />
              </div>
            </UCard>
          </div>

          <div v-else-if="applications.length" class="space-y-3">
            <UCard
              v-for="app in applications"
              :key="app.id"
              class="border border-slate-200 shadow-sm rounded-xl bg-white hover:border-slate-300 transition-colors"
              :ui="{ root: 'bg-white border border-slate-200 rounded-xl shadow-sm', body: 'bg-white' }"
            >
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                  <UIcon name="i-heroicons-building-office-2" class="text-slate-600" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <NuxtLink
                      :to="`/jobs/${app.jobs?.id}`"
                      class="font-semibold tracking-tight text-slate-900 hover:text-slate-700 transition-colors"
                    >
                      {{ app.jobs?.title }}
                    </NuxtLink>
                  </div>
                  <p class="text-sm text-slate-500">
                    {{ app.jobs?.companies?.name ?? 'Company' }}
                    <span v-if="app.jobs?.location" class="mx-1">·</span>
                    {{ app.jobs?.location }}
                  </p>
                  <p class="text-xs text-slate-400 mt-1">
                    Applied {{ new Date(app.created_at).toLocaleDateString() }}
                  </p>
                </div>
                <div class="shrink-0 flex flex-col items-end gap-2">
                  <UBadge
                    :color="statusConfig[app.status]?.color ?? 'neutral'"
                    variant="soft"
                    :class="statusConfig[app.status]?.class"
                  >
                    {{ statusConfig[app.status]?.label ?? app.status }}
                  </UBadge>
                  <UBadge variant="soft" color="neutral" size="xs" class="bg-slate-100 text-slate-700 ring-1 ring-slate-200">{{ app.jobs?.type }}</UBadge>
                </div>
              </div>
            </UCard>
          </div>

          <div v-else class="text-center py-20">
            <div class="mx-auto mb-4 w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
              <UIcon name="i-heroicons-briefcase" class="text-xl text-slate-400" />
            </div>
            <h3 class="text-lg font-semibold tracking-tight text-slate-700 mb-2">No applications yet</h3>
            <p class="text-slate-400 mb-6">Start browsing jobs and apply to positions that match your skills.</p>
            <UButton to="/jobs" color="primary" icon="i-heroicons-magnifying-glass" class="bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-600 active:bg-indigo-600">Browse Jobs</UButton>
          </div>
        </div>
      </div>
    </UContainer>
  </div>
</template>
