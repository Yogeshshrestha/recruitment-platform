<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const supabase = useSupabaseClient()
const route = useRoute()

const status = ref<'loading' | 'success' | 'error'>('loading')
const message = ref('')

onMounted(async () => {
  const code = route.query.code as string | undefined

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      status.value = 'error'
      message.value = error.message
      return
    }
  }

  // Fetch role and redirect
  const user = (await supabase.auth.getUser()).data.user
  if (!user) {
    status.value = 'error'
    message.value = 'Authentication failed. Please try again.'
    return
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  status.value = 'success'
  const destination = profile?.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard'
  await navigateTo(destination)
})
</script>

<template>
  <div class="text-center">
    <div v-if="status === 'loading'" class="space-y-4">
      <UIcon name="i-heroicons-arrow-path" class="text-4xl text-indigo-500 animate-spin" />
      <p class="text-slate-600">Confirming your account...</p>
    </div>
    <div v-else-if="status === 'error'" class="space-y-4">
      <UIcon name="i-heroicons-x-circle" class="text-4xl text-red-500" />
      <p class="text-red-600 font-medium">{{ message || 'Something went wrong.' }}</p>
      <UButton to="/auth" color="primary" variant="soft">Back to sign in</UButton>
    </div>
    <div v-else class="space-y-4">
      <UIcon name="i-heroicons-check-circle" class="text-4xl text-green-500" />
      <p class="text-slate-600">Redirecting...</p>
    </div>
  </div>
</template>
