<script setup lang="ts">
const props = defineProps<{
  open: boolean
  job: { id: string; title: string; companies?: { name: string } | null } | null
}>()

const emit = defineEmits<{
  'update:open': [val: boolean]
  'submitted': []
}>()

const { apply } = useApplications()
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const toast = useToast()

const coverLetter = ref('')
const applying = ref(false)

// Resolves current user ID accounting for SSR/hydration delay
const resolveUserId = async (): Promise<string | null> => {
  if (user.value?.id) return user.value.id
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id ?? null
}

const submitApplication = async () => {
  if (!props.job) return
  const userId = await resolveUserId()
  if (!userId) {
    toast.add({ title: 'Not signed in', description: 'Please sign in to apply.', color: 'error' })
    return
  }
  applying.value = true

  const { data: profile } = await supabase
    .from('profiles')
    .select('resume_url')
    .eq('id', userId)
    .single()

  const { error } = await apply(props.job.id, coverLetter.value, profile?.resume_url ?? undefined)
  applying.value = false

  if (error) {
    toast.add({ title: 'Failed to apply', description: error.message, color: 'error' })
  } else {
    emit('update:open', false)
    emit('submitted')
    coverLetter.value = ''
    toast.add({ title: 'Application submitted!', description: 'Good luck!', color: 'success' })
  }
}
</script>

<template>
  <UModal
    :open="open"
    title="Apply for this position"
    :description="`${job?.title} at ${job?.companies?.name ?? 'Company'}`"
    :ui="{
      content: 'bg-white border border-slate-200',
      header: 'bg-white',
      body: 'bg-white',
      footer: 'bg-white'
    }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <div class="space-y-4">
        <UAlert
          color="neutral"
          variant="soft"
          icon="i-heroicons-information-circle"
          title="Your saved resume will be attached"
          description="Make sure your profile resume is up to date in your dashboard."
          class="bg-slate-50 ring-1 ring-slate-200 text-slate-700"
        />
        <UFormField label="Cover Letter (optional)" name="coverLetter">
          <UTextarea
            v-model="coverLetter"
            placeholder="Tell the hiring team why you're a great fit for this role..."
            :rows="6"
            class="w-full"
            :ui="{ base: 'bg-white text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-200 focus:bg-white focus:ring-slate-300 shadow-none' }"
          />
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton variant="outline" color="neutral" class="border-slate-200 text-slate-700 bg-white hover:bg-white active:bg-white" @click="emit('update:open', false)">Cancel</UButton>
        <UButton color="primary" :loading="applying" icon="i-heroicons-paper-airplane" class="bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-600 active:bg-indigo-600" @click="submitApplication">
          Submit Application
        </UButton>
      </div>
    </template>
  </UModal>
</template>
