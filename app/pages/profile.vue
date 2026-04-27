<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()

type Profile = {
  id: string
  role: 'candidate' | 'recruiter'
  full_name: string | null
  bio: string | null
  skills: string[] | null
  avatar_url: string | null
  resume_url: string | null
  created_at: string
  updated_at: string
}

const profile = ref<Profile | null>(null)
const loading = ref(true)
const fetchError = ref<string | null>(null)

const form = reactive({
  full_name: '',
  bio: '',
  skillsText: '',
})

const inputUi = {
  base: 'bg-white text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-200 focus:bg-white focus:ring-slate-300 shadow-none',
  leadingIcon: 'text-slate-400',
}

const textareaUi = {
  base: 'bg-white text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-200 focus:bg-white focus:ring-slate-300 shadow-none',
}

const syncFormFromProfile = () => {
  if (!profile.value) return
  form.full_name = profile.value.full_name ?? ''
  form.bio = profile.value.bio ?? ''
  form.skillsText = (profile.value.skills ?? []).join(', ')
}

const fetchProfile = async (userId: string) => {
  loading.value = true
  fetchError.value = null
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    // Profile row missing — auto-create it
    if (error.code === 'PGRST116') {
      const { data: created, error: createErr } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          role: ((user.value?.user_metadata?.role as 'candidate' | 'recruiter' | undefined) ?? 'candidate'),
          full_name: (user.value?.user_metadata?.full_name as string) ?? '',
        })
        .select('*')
        .single()

      if (createErr) {
        fetchError.value = createErr.message
      } else {
        profile.value = created as Profile
        syncFormFromProfile()
      }
    } else {
      fetchError.value = error.message
    }
  } else {
    profile.value = data as Profile
    syncFormFromProfile()
  }
  loading.value = false
}

// Wait for user to be ready, then fetch
watch(() => user.value?.id, (id) => {
  if (id) fetchProfile(id)
}, { immediate: true })

// Also try with getSession fallback if user ref is delayed
onMounted(async () => {
  if (!user.value?.id) {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user?.id) {
      fetchProfile(session.user.id)
    }
  }
})

const saving = ref(false)

const saveProfile = async () => {
  if (!user.value?.id) return
  saving.value = true

  const updates = {
    full_name: form.full_name.trim() || null,
    bio: form.bio.trim() || null,
    skills: form.skillsText.split(',').map(s => s.trim()).filter(Boolean),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.value.id)
    .select('*')
    .single()

  saving.value = false

  if (error) {
    toast.add({ title: 'Failed to update profile', description: error.message, color: 'error' })
  } else {
    profile.value = data as Profile
    syncFormFromProfile()
    toast.add({ title: 'Profile updated successfully', color: 'success' })
  }
}

const roleBadgeColor = computed<'primary' | 'success'>(() =>
  profile.value?.role === 'recruiter' ? 'primary' : 'success'
)
</script>

<template>
  <UContainer class="max-w-3xl py-10">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-semibold tracking-tight text-slate-900">My Profile</h1>
      <p class="text-slate-500 mt-1 text-sm">View and edit your account details.</p>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-4">
      <div class="flex items-center gap-4">
        <USkeleton class="h-16 w-16 rounded-full" />
        <div class="space-y-2 flex-1">
          <USkeleton class="h-5 w-48" />
          <USkeleton class="h-4 w-32" />
        </div>
      </div>
      <USkeleton class="h-10 w-full" />
      <USkeleton class="h-10 w-full" />
      <USkeleton class="h-24 w-full" />
    </div>

    <!-- Error state -->
    <UAlert
      v-else-if="fetchError"
      color="error"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      title="Could not load profile"
      :description="fetchError"
      class="mb-4"
    />

    <!-- Profile content -->
    <template v-else-if="profile">
      <!-- Identity card -->
      <UCard
        class="mb-6 border border-slate-200 bg-white shadow-sm rounded-xl"
        :ui="{ root: 'bg-white', body: 'bg-white' }"
      >
        <div class="flex items-center gap-4">
          <!-- Avatar -->
          <div class="w-14 h-14 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
            <UIcon v-if="!profile.avatar_url" name="i-heroicons-user-circle" class="text-indigo-400 text-3xl" />
            <img v-else :src="profile.avatar_url" :alt="profile.full_name ?? 'Avatar'" class="w-14 h-14 rounded-full object-cover" />
          </div>

          <div class="flex-1 min-w-0">
            <p class="font-semibold text-slate-900 text-base truncate">
              {{ profile.full_name || 'No name set' }}
            </p>
            <p class="text-slate-500 text-sm truncate">{{ user?.email }}</p>
          </div>

          <UBadge
            :color="roleBadgeColor"
            variant="soft"
            class="capitalize shrink-0"
          >
            {{ profile.role }}
          </UBadge>
        </div>

        <!-- Read-only meta -->
        <div class="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div class="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p class="text-slate-400 text-xs mb-1">User ID</p>
            <p class="text-slate-700 font-mono text-xs truncate">{{ profile.id }}</p>
          </div>
          <div class="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p class="text-slate-400 text-xs mb-1">Member since</p>
            <p class="text-slate-700 text-xs">{{ new Date(profile.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
          </div>
          <div class="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p class="text-slate-400 text-xs mb-1">Last updated</p>
            <p class="text-slate-700 text-xs">{{ new Date(profile.updated_at).toLocaleString() }}</p>
          </div>
          <div class="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p class="text-slate-400 text-xs mb-1">Resume</p>
            <p class="text-slate-700 text-xs truncate">{{ profile.resume_url ? 'Uploaded' : 'Not uploaded' }}</p>
          </div>
        </div>

        <!-- Skills display -->
        <div v-if="profile.skills?.length" class="mt-4">
          <p class="text-xs text-slate-400 mb-2">Skills</p>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="skill in profile.skills"
              :key="skill"
              color="neutral"
              variant="soft"
              size="sm"
            >
              {{ skill }}
            </UBadge>
          </div>
        </div>
      </UCard>

      <!-- Edit form -->
      <UCard
        class="border border-slate-200 bg-white shadow-sm rounded-xl"
        :ui="{ root: 'bg-white', body: 'bg-white' }"
      >
        <h2 class="text-base font-semibold text-slate-900 mb-5">Edit Details</h2>

        <div class="space-y-4">
          <UFormField label="Full Name">
            <UInput
              v-model="form.full_name"
              placeholder="Enter your full name"
              class="w-full"
              :ui="inputUi"
            />
          </UFormField>

          <UFormField label="Bio">
            <UTextarea
              v-model="form.bio"
              :rows="4"
              placeholder="Write a short bio about yourself..."
              class="w-full"
              :ui="textareaUi"
            />
          </UFormField>

          <UFormField label="Skills" hint="Separate with commas">
            <UInput
              v-model="form.skillsText"
              placeholder="e.g. Nuxt, TypeScript, Tailwind CSS"
              class="w-full"
              :ui="inputUi"
            />
          </UFormField>

          <div class="flex justify-end gap-2 pt-2">
            <UButton
              variant="outline"
              color="neutral"
              class="border-slate-200 text-slate-700 bg-white hover:bg-white active:bg-white"
              :disabled="saving"
              @click="fetchProfile(user!.id)"
            >
              Discard
            </UButton>
            <UButton
              color="primary"
              :loading="saving"
              icon="i-heroicons-check"
              class="bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-600 active:bg-indigo-600"
              @click="saveProfile"
            >
              Save Changes
            </UButton>
          </div>
        </div>
      </UCard>
    </template>
  </UContainer>
</template>
