<script setup lang="ts">
const emit = defineEmits<{
  'saved': [company: any]
}>()

const toast = useToast()
const { fetchCompany, upsertCompany } = useJobs()

const saving = ref(false)
const company = ref<any>(null)

const form = reactive({
  name: '',
  description: '',
  website: '',
  location: '',
})

onMounted(async () => {
  const { data } = await fetchCompany()
  if (data) {
    company.value = data
    form.name = data.name ?? ''
    form.description = data.description ?? ''
    form.website = data.website ?? ''
    form.location = data.location ?? ''
  }
})

const save = async () => {
  if (!form.name.trim()) {
    toast.add({ title: 'Company name is required', color: 'error' })
    return
  }
  saving.value = true
  const { data, error } = await upsertCompany(form)
  saving.value = false

  if (error) {
    toast.add({ title: 'Failed to save', description: error.message, color: 'error' })
  } else {
    company.value = data
    emit('saved', data)
    toast.add({ title: 'Company profile saved!', color: 'success' })
  }
}
</script>

<template>
  <div class="max-w-2xl">
    <UCard
      class="border border-slate-200 shadow-sm rounded-xl bg-white"
      :ui="{ root: 'bg-white border border-slate-200 rounded-xl shadow-sm', header: 'bg-white', body: 'bg-white' }"
    >
      <template #header>
        <h2 class="font-semibold text-slate-900">Company Profile</h2>
        <p class="text-sm text-slate-500 mt-1">This information will be shown on all your job postings.</p>
      </template>

      <form class="space-y-4" @submit.prevent="save">
        <UFormField label="Company Name *" name="name">
          <UInput
            v-model="form.name"
            placeholder="Acme Corp"
            class="w-full"
            :ui="{ base: 'bg-white ring-1 ring-slate-200 focus:bg-slate-50 focus:ring-slate-300 shadow-none' }"
          />
        </UFormField>

        <UFormField label="Description" name="description">
          <UTextarea
            v-model="form.description"
            placeholder="Tell candidates about your company culture, mission and what makes you unique..."
            :rows="4"
            class="w-full"
            :ui="{ base: 'bg-white text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-200 focus:bg-white focus:ring-slate-300 shadow-none' }"
          />
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Website" name="website">
            <UInput
              v-model="form.website"
              placeholder="https://acmecorp.com"
              class="w-full"
              :ui="{ base: 'bg-white ring-1 ring-slate-200 focus:bg-slate-50 focus:ring-slate-300 shadow-none' }"
            />
          </UFormField>

          <UFormField label="Location" name="location">
            <UInput
              v-model="form.location"
              placeholder="San Francisco, CA"
              class="w-full"
              :ui="{ base: 'bg-white ring-1 ring-slate-200 focus:bg-slate-50 focus:ring-slate-300 shadow-none' }"
            />
          </UFormField>
        </div>

        <div class="flex justify-end pt-2">
          <UButton type="submit" color="primary" :loading="saving" icon="i-heroicons-check" class="bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-600 active:bg-indigo-600">
            Save Company Profile
          </UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>
