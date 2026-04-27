<script setup lang="ts">
const emit = defineEmits<{
  'saved': []
}>()

const toast = useToast()
const { profile, loading, fetchProfile, updateProfile, uploadResume } = useProfile()

const saving = ref(false)
const resumeUploading = ref(false)
const resumeFile = ref<File | null>(null)

const form = reactive({
  full_name: '',
  bio: '',
  skills: '',
})

const inputUi = {
  base: 'bg-white text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-200 focus:bg-white focus:ring-slate-300 shadow-none',
}

const textareaUi = {
  base: 'bg-white text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-200 focus:bg-white focus:ring-slate-300 shadow-none',
}

const populateForm = () => {
  if (!profile.value) return
  form.full_name = profile.value.full_name ?? ''
  form.bio = profile.value.bio ?? ''
  form.skills = (profile.value.skills ?? []).join(', ')
}

onMounted(async () => {
  await fetchProfile()
  populateForm()
})

// Re-populate if profile loads after mount (hydration delay)
watch(profile, (p) => {
  if (p && !form.full_name && !form.bio && !form.skills) populateForm()
})

const saveProfile = async () => {
  saving.value = true
  const skillsArray = form.skills.split(',').map(s => s.trim()).filter(Boolean)
  const { error } = await updateProfile({
    full_name: form.full_name,
    bio: form.bio,
    skills: skillsArray,
  })
  saving.value = false

  if (error) {
    toast.add({ title: 'Failed to save', description: error.message, color: 'error' })
  } else {
    emit('saved')
    toast.add({ title: 'Profile saved!', color: 'success' })
  }
}

const handleResumeUpload = async () => {
  if (!resumeFile.value) return
  resumeUploading.value = true
  const { error } = await uploadResume(resumeFile.value)
  resumeUploading.value = false
  if (error) {
    toast.add({ title: 'Upload failed', description: error.message, color: 'error' })
  } else {
    toast.add({ title: 'Resume uploaded!', color: 'success' })
    resumeFile.value = null
  }
}
</script>

<template>
  <div v-if="loading" class="space-y-4 animate-pulse max-w-xl">
    <USkeleton class="h-10 w-full rounded-lg" />
    <USkeleton class="h-24 w-full rounded-lg" />
    <USkeleton class="h-10 w-full rounded-lg" />
  </div>

  <div v-else class="grid md:grid-cols-3 gap-6 max-w-4xl">
    <!-- Profile form -->
    <div class="md:col-span-2">
      <UCard
        class="border border-slate-200 shadow-sm bg-white rounded-xl"
        :ui="{ root: 'bg-white border border-slate-200 rounded-xl shadow-sm', header: 'bg-white', body: 'bg-white' }"
      >
        <template #header>
          <h2 class="font-semibold text-slate-900">Personal Information</h2>
        </template>

        <form class="space-y-4" @submit.prevent="saveProfile">
          <UFormField label="Full Name" name="full_name">
            <UInput v-model="form.full_name" placeholder="Jane Smith" class="w-full" :ui="inputUi" />
          </UFormField>

          <UFormField label="Bio"  name="bio">
            <UTextarea
              v-model="form.bio"
              placeholder="Tell recruiters about yourself, your experience and what you're looking for..."
              :rows="4"
              class="w-full"
              :ui="textareaUi"
            />
          </UFormField>

          <UFormField label="Skills" name="skills" hint="Comma-separated, e.g. Vue.js, TypeScript, Python">
            <UInput
              v-model="form.skills"
              placeholder="Vue.js, TypeScript, Node.js..."
              class="w-full"
              :ui="inputUi"
            />
          </UFormField>

          <!-- Skills preview -->
          <div v-if="form.skills" class="flex flex-wrap gap-2">
            <UBadge
              v-for="skill in form.skills.split(',').map(s => s.trim()).filter(Boolean)"
              :key="skill"
              variant="soft"
              color="neutral"
              size="sm"
              class="bg-slate-100 text-slate-700 ring-1 ring-slate-200"
            >
              {{ skill }}
            </UBadge>
          </div>

          <div class="flex justify-end pt-2">
            <UButton type="submit" color="primary" :loading="saving" icon="i-heroicons-check" class="bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-600 active:bg-indigo-600">
              Save Profile
            </UButton>
          </div>
        </form>
      </UCard>
    </div>

    <!-- Resume upload + completeness -->
    <div class="space-y-4">
      <UCard
        class="border border-slate-200 shadow-sm rounded-xl bg-white"
        :ui="{ root: 'bg-white border border-slate-200 rounded-xl shadow-sm', header: 'bg-white', body: 'bg-white' }"
      >
        <template #header>
          <h2 class="font-semibold text-slate-900">Resume / CV</h2>
        </template>

        <div class="space-y-4">
          <div
            v-if="profile?.resume_url"
            class="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg"
          >
            <UIcon name="i-heroicons-document-check" class="text-slate-600 text-xl shrink-0" />
            <div class="min-w-0">
              <p class="text-sm font-medium text-slate-700">Resume on file</p>
              <p class="text-xs text-slate-500 truncate">{{ profile.resume_url.split('/').pop() }}</p>
            </div>
          </div>

          <div v-else class="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <p class="text-sm text-slate-700 font-medium">No resume uploaded</p>
            <p class="text-xs text-slate-500 mt-1">Upload your resume to apply for jobs faster.</p>
          </div>

          <UFileUpload
            v-model="resumeFile"
            accept=".pdf,.doc,.docx"
            label="Upload Resume"
            description="PDF, DOC, or DOCX • Max 5MB"
            icon="i-heroicons-document-arrow-up"
            class="w-full"
            :ui="{
              base: 'bg-white border border-slate-200 text-slate-700',
              label: 'text-slate-900',
              description: 'text-slate-500'
            }"
          />

          <UButton
            v-if="resumeFile"
            color="primary"
            block
            :loading="resumeUploading"
            icon="i-heroicons-cloud-arrow-up"
            class="bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-600 active:bg-indigo-600"
            @click="handleResumeUpload"
          >
            Upload Resume
          </UButton>
        </div>
      </UCard>

      <!-- Profile completeness -->
      <UCard
        class="border border-slate-200 shadow-sm rounded-xl bg-white"
        :ui="{ root: 'bg-white border border-slate-200 rounded-xl shadow-sm', body: 'bg-white' }"
      >
        <h3 class="font-semibold text-slate-900 mb-3 text-sm">Profile Completeness</h3>
        <div class="space-y-2">
          <div class="flex items-center text-sm" :class="profile?.full_name ? 'text-green-600' : 'text-slate-400'">
            <UIcon :name="profile?.full_name ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'" class="mr-2" />
            Full name
          </div>
          <div class="flex items-center text-sm" :class="profile?.bio ? 'text-green-600' : 'text-slate-400'">
            <UIcon :name="profile?.bio ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'" class="mr-2" />
            Bio
          </div>
          <div class="flex items-center text-sm" :class="profile?.skills?.length ? 'text-green-600' : 'text-slate-400'">
            <UIcon :name="profile?.skills?.length ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'" class="mr-2" />
            Skills
          </div>
          <div class="flex items-center text-sm" :class="profile?.resume_url ? 'text-green-600' : 'text-slate-400'">
            <UIcon :name="profile?.resume_url ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'" class="mr-2" />
            Resume
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
