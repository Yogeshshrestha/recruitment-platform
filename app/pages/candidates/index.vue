<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Candidate search/filter state
const searchQuery = ref('')
const searchSkill = ref('')
const loading = ref(true)
const candidates = ref<any[]>([])

const { data: allCandidates } = await useAsyncData('candidates-list', async () => {
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, bio, skills, avatar_url')
    .eq('role', 'candidate')
    .not('full_name', 'is', null)
    .neq('full_name', '')
    .order('updated_at', { ascending: false })
  return data ?? []
})

candidates.value = allCandidates.value ?? []
loading.value = false

const filteredCandidates = computed(() => {
  let result = candidates.value
  const q = searchQuery.value.trim().toLowerCase()
  const s = searchSkill.value.trim().toLowerCase()
  if (q) {
    result = result.filter(c =>
      c.full_name?.toLowerCase().includes(q) ||
      c.bio?.toLowerCase().includes(q)
    )
  }
  if (s) {
    result = result.filter(c =>
      (c.skills ?? []).some((sk: string) => sk.toLowerCase().includes(s))
    )
  }
  return result
})

// Collect all unique skills from all candidates for the skill filter suggestions
const allSkills = computed(() => {
  const set = new Set<string>()
  for (const c of candidates.value) {
    for (const sk of c.skills ?? []) set.add(sk)
  }
  return Array.from(set).sort()
})

const inputUi = {
  base: 'bg-white text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-200 focus:bg-white focus:ring-slate-300 shadow-none',
}

useHead({ title: 'Talent Directory — TalentBridge' })
</script>

<template>
  <div class="bg-slate-50 min-h-screen">
    <!-- Header -->
    <div class="bg-white border-b border-slate-200">
      <UContainer class="max-w-7xl">
        <div class="py-12 text-center max-w-2xl mx-auto">
          <UBadge color="neutral" variant="soft" size="sm" class="mb-4 bg-slate-100 text-slate-700 ring-1 ring-slate-200">
            Talent Directory
          </UBadge>
          <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-3">
            Discover top candidates
          </h1>
          <p class="text-slate-500 text-lg">
            Browse professionals ready for their next opportunity. Filter by skills or keywords.
          </p>
        </div>
      </UContainer>
    </div>

    <UContainer class="max-w-7xl py-10">
      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-3 mb-8">
        <UInput
          v-model="searchQuery"
          placeholder="Search by name or bio..."
          icon="i-heroicons-magnifying-glass"
          class="flex-1"
          :ui="inputUi"
        />
        <UInput
          v-model="searchSkill"
          placeholder="Filter by skill (e.g. Vue.js)"
          icon="i-heroicons-tag"
          class="flex-1 max-w-xs"
          :ui="inputUi"
        />
        <UButton
          v-if="searchQuery || searchSkill"
          variant="ghost"
          color="neutral"
          size="sm"
          icon="i-heroicons-x-mark"
          class="text-slate-500 shrink-0"
          @click="searchQuery = ''; searchSkill = ''"
        >
          Clear
        </UButton>
      </div>

      <!-- Skills quick-filter chips -->
      <div v-if="allSkills.length" class="flex flex-wrap gap-2 mb-8">
        <button
          v-for="skill in allSkills.slice(0, 20)"
          :key="skill"
          class="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
          :class="searchSkill === skill
            ? 'bg-indigo-600 text-white border-indigo-600'
            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'"
          @click="searchSkill = searchSkill === skill ? '' : skill"
        >
          {{ skill }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <UCard
          v-for="i in 9"
          :key="i"
          class="animate-pulse border border-slate-200 shadow-sm rounded-xl bg-white"
          :ui="{ root: 'bg-white', body: 'bg-white' }"
        >
          <div class="flex items-center gap-4 mb-4">
            <USkeleton class="w-12 h-12 rounded-full" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-1/2" />
              <USkeleton class="h-3 w-3/4" />
            </div>
          </div>
          <div class="flex gap-2 flex-wrap">
            <USkeleton v-for="j in 3" :key="j" class="h-5 w-16 rounded-full" />
          </div>
        </UCard>
      </div>

      <!-- Candidate grid -->
      <div v-else-if="filteredCandidates.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <UCard
          v-for="candidate in filteredCandidates"
          :key="candidate.id"
          class="border border-slate-200 shadow-sm rounded-xl bg-white hover:border-slate-300 hover:shadow transition-all"
          :ui="{ root: 'bg-white border border-slate-200 rounded-xl shadow-sm', body: 'bg-white' }"
        >
          <div class="flex items-start gap-4">
            <!-- Avatar -->
            <div
              class="w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-lg"
              :style="{
                background: `hsl(${(candidate.full_name?.charCodeAt(0) ?? 0) * 7 % 360}, 55%, 55%)`
              }"
            >
              {{ (candidate.full_name ?? '?')[0]?.toUpperCase() }}
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-slate-900 tracking-tight truncate">
                {{ candidate.full_name }}
              </h3>
              <p v-if="candidate.bio" class="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {{ candidate.bio }}
              </p>
              <p v-else class="text-sm text-slate-400 mt-1 italic">No bio yet</p>
            </div>
          </div>

          <!-- Skills -->
          <div v-if="candidate.skills?.length" class="mt-4 flex flex-wrap gap-1.5">
            <UBadge
              v-for="skill in (candidate.skills as string[]).slice(0, 5)"
              :key="skill"
              variant="soft"
              color="neutral"
              size="xs"
              class="bg-slate-100 text-slate-600 ring-1 ring-slate-200"
            >
              {{ skill }}
            </UBadge>
            <UBadge
              v-if="(candidate.skills as string[]).length > 5"
              variant="soft"
              color="neutral"
              size="xs"
              class="bg-slate-100 text-slate-400"
            >
              +{{ (candidate.skills as string[]).length - 5 }}
            </UBadge>
          </div>
          <div v-else class="mt-4">
            <p class="text-xs text-slate-400">No skills listed</p>
          </div>
        </UCard>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-24">
        <div class="mx-auto mb-4 w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
          <UIcon name="i-heroicons-users" class="text-2xl text-slate-400" />
        </div>
        <h3 class="text-lg font-semibold tracking-tight text-slate-700 mb-2">No candidates found</h3>
        <p class="text-slate-400 mb-6">
          {{ searchQuery || searchSkill ? 'Try adjusting your filters.' : 'No candidate profiles have been created yet.' }}
        </p>
        <UButton
          v-if="searchQuery || searchSkill"
          variant="outline"
          color="neutral"
          class="border-slate-200 text-slate-700 bg-white hover:bg-white"
          @click="searchQuery = ''; searchSkill = ''"
        >
          Clear filters
        </UButton>
      </div>

      <!-- Result count -->
      <p v-if="!loading && filteredCandidates.length" class="text-center text-sm text-slate-400 mt-8">
        Showing {{ filteredCandidates.length }} candidate{{ filteredCandidates.length !== 1 ? 's' : '' }}
        <template v-if="searchQuery || searchSkill"> matching your filters</template>
      </p>
    </UContainer>
  </div>
</template>
