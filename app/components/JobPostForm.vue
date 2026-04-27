<script setup lang="ts">
const props = defineProps<{
  open: boolean
  companyId?: string | null
}>()

const emit = defineEmits<{
  'update:open': [val: boolean]
  'posted': []
}>()

const toast = useToast()
const { createJob } = useJobs()

const posting = ref(false)

const JOB_CATEGORIES = [
  'Engineering', 'Design', 'Product', 'Marketing', 'Sales',
  'Finance', 'HR', 'Operations', 'Legal', 'Other',
]

const JOB_TYPES = [
  { label: 'Full-time', value: 'full-time' },
  { label: 'Part-time', value: 'part-time' },
  { label: 'Contract', value: 'contract' },
  { label: 'Remote', value: 'remote' },
  { label: 'Hybrid', value: 'hybrid' },
]

const categoryItems = JOB_CATEGORIES.map(c => ({ label: c, value: c }))

const form = reactive({
  title: '',
  description: '',
  location: '',
  salary_range: '',
  type: 'full-time',
  category: 'Engineering',
})

const resetForm = () => {
  Object.assign(form, { title: '', description: '', location: '', salary_range: '', type: 'full-time', category: 'Engineering' })
}

const postJob = async () => {
  if (!form.title.trim() || !form.description.trim()) {
    toast.add({ title: 'Title and description are required', color: 'error' })
    return
  }
  posting.value = true
  const { error } = await createJob({
    title: form.title,
    description: form.description,
    location: form.location,
    salary_range: form.salary_range,
    type: form.type,
    category: form.category,
    status: 'open',
    company_id: props.companyId ?? null,
  })
  posting.value = false

  if (error) {
    toast.add({ title: 'Failed to post job', description: error.message, color: 'error' })
  } else {
    emit('update:open', false)
    emit('posted')
    resetForm()
    toast.add({ title: 'Job posted!', description: 'Your job is now live.', color: 'success' })
  }
}
</script>

<template>
  <UModal
    :open="open"
    title="Post a New Job"
    description="Fill in the job details below. Your posting will go live immediately."
    :ui="{ width: 'sm:max-w-2xl' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <form class="space-y-4" @submit.prevent="postJob">
        <UFormField label="Job Title *" name="title">
          <UInput
            v-model="form.title"
            placeholder="Senior Frontend Engineer"
            class="w-full"
            :ui="{ base: 'bg-white ring-1 ring-slate-200 focus:bg-slate-50 focus:ring-slate-300 shadow-none' }"
          />
        </UFormField>

        <UFormField label="Job Description *" name="description" hint="You can use basic HTML for formatting">
          <UTextarea
            v-model="form.description"
            placeholder="Describe the role, responsibilities, requirements, and what you offer..."
            :rows="8"
            class="w-full"
            :ui="{ base: 'bg-white text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-200 focus:bg-white focus:ring-slate-300 shadow-none' }"
          />
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Location" name="location">
            <UInput
              v-model="form.location"
              placeholder="New York, NY or Remote"
              class="w-full"
              :ui="{ base: 'bg-white ring-1 ring-slate-200 focus:bg-slate-50 focus:ring-slate-300 shadow-none' }"
            />
          </UFormField>

          <UFormField label="Salary Range" name="salary_range">
            <UInput
              v-model="form.salary_range"
              placeholder="$80k - $120k / year"
              class="w-full"
              :ui="{ base: 'bg-white ring-1 ring-slate-200 focus:bg-slate-50 focus:ring-slate-300 shadow-none' }"
            />
          </UFormField>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Job Type" name="type">
            <USelect
              v-model="form.type"
              :items="JOB_TYPES"
              class="w-full"
              :ui="{
                base: 'bg-white text-slate-900 ring-1 ring-slate-200 focus:ring-slate-300',
                content: 'bg-white border border-slate-200',
                item: 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[highlighted]:bg-slate-100 data-[highlighted]:text-slate-900'
              }"
            />
          </UFormField>

          <UFormField label="Category" name="category">
            <USelect
              v-model="form.category"
              :items="categoryItems"
              class="w-full"
              :ui="{
                base: 'bg-white text-slate-900 ring-1 ring-slate-200 focus:ring-slate-300',
                content: 'bg-white border border-slate-200',
                item: 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[highlighted]:bg-slate-100 data-[highlighted]:text-slate-900'
              }"
            />
          </UFormField>
        </div>
      </form>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton variant="outline" color="neutral" class="border-slate-200 text-slate-700 bg-white hover:bg-white active:bg-white" @click="emit('update:open', false)">Cancel</UButton>
        <UButton color="primary" :loading="posting" icon="i-heroicons-paper-airplane" class="bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-600 active:bg-indigo-600" @click="postJob">
          Post Job
        </UButton>
      </div>
    </template>
  </UModal>
</template>
