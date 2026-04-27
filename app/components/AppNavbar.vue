<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()
const toast = useToast()

const profile = useState<{ role: string; full_name: string | null } | null>('nav-profile', () => null)

watch(user, async (u) => {
  if (u?.id) {
    const { data } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', u.id)
      .single()
    profile.value = data
  } else {
    profile.value = null
  }
}, { immediate: true })

const dashboardLink = computed(() => {
  const role = profile.value?.role ?? (user.value?.user_metadata?.role as string | undefined)
  if (!role) return null
  return role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard'
})

const isRecruiter = computed(() => {
  const role = profile.value?.role ?? (user.value?.user_metadata?.role as string | undefined)
  return role === 'recruiter'
})

const signOut = async () => {
  await supabase.auth.signOut()
  profile.value = null
  toast.add({ title: 'Signed out', color: 'neutral' })
  router.push('/')
}

const mobileOpen = ref(false)
</script>

<template>
  <header class="sticky top-0 z-40 backdrop-blur-md bg-white/95 border-b border-slate-200">
    <UContainer class="max-w-7xl">
      <div class="flex items-center justify-between h-16 gap-4">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 shrink-0">
          <div class="w-8 h-8 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center">
            <UIcon name="i-heroicons-briefcase" class="text-slate-700 text-base" />
          </div>
          <span class="font-semibold tracking-tight text-slate-900 text-lg hidden sm:block">TalentBridge</span>
        </NuxtLink>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-1">
          <UButton to="/" variant="ghost" color="neutral" size="sm" class="text-slate-700">Home</UButton>
          <UButton to="/jobs" variant="ghost" color="neutral" size="sm" class="text-slate-700">Browse Jobs</UButton>
          <UButton to="/candidates" variant="ghost" color="neutral" size="sm" class="text-slate-700">Hire Talent</UButton> 
        </nav>

        <!-- Right actions -->
        <div class="flex items-center gap-2">
          <template v-if="user">
            <UButton
              v-if="isRecruiter"
              to="/recruiter/dashboard"
              color="primary"
              size="sm"
              icon="i-heroicons-plus"
              class="hidden sm:flex bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-600 active:bg-indigo-600"
            >
              Create Job
            </UButton>
            <UButton v-if="dashboardLink" :to="dashboardLink" color="primary" size="sm" class="hidden sm:flex">
              Dashboard
            </UButton>
            <UButton
              variant="ghost"
              color="neutral"
              size="sm"
              icon="i-heroicons-arrow-right-on-rectangle"
              class="text-slate-700"
              @click="signOut"
            >
              <span class="hidden sm:inline">Sign out</span>
            </UButton>
          </template>
          <template v-else>
            <UButton to="/auth" variant="ghost" color="neutral" size="sm" class="text-slate-700">Sign in</UButton>
            <UButton to="/auth?tab=register" variant="outline" color="neutral" size="sm" class="border-slate-200 text-slate-700 bg-white hover:bg-white active:bg-white">Get started</UButton>
          </template>

          <!-- Mobile menu toggle -->
          <UButton
            class="md:hidden"
            variant="ghost"
            color="neutral"
            size="sm"
            :icon="mobileOpen ? 'i-heroicons-x-mark' : 'i-heroicons-bars-3'"
            @click="mobileOpen = !mobileOpen"
          />
        </div>
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileOpen" class="md:hidden py-3 border-t border-slate-200 flex flex-col gap-1">
        <UButton to="/" variant="ghost" color="neutral" size="sm" block @click="mobileOpen = false">Home</UButton>
        <UButton to="/jobs" variant="ghost" color="neutral" size="sm" block @click="mobileOpen = false">Browse Jobs</UButton>
        <UButton to="/candidates" variant="ghost" color="neutral" size="sm" block @click="mobileOpen = false">Hire Talent</UButton>
        <UButton v-if="user" to="/profile" variant="ghost" color="neutral" size="sm" block @click="mobileOpen = false">Profile</UButton>
        <UButton
          v-if="isRecruiter"
          to="/recruiter/dashboard"
          variant="ghost"
          color="neutral"
          size="sm"
          block
          @click="mobileOpen = false"
        >
          Create Job
        </UButton>
        <UButton
          v-if="dashboardLink"
          :to="dashboardLink"
          color="primary"
          size="sm"
          block
          @click="mobileOpen = false"
        >
          Dashboard
        </UButton>
      </div>
    </UContainer>
  </header>
</template>
