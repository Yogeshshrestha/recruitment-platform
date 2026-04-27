<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()
const route = useRoute()
const toast = useToast()

const tab = ref<'login' | 'register'>((route.query.tab as string) === 'register' ? 'register' : 'login')
const loading = ref(false)
const authInputUi = {
  base: 'bg-white text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-200 focus:bg-white focus:ring-slate-300 shadow-none',
  leadingIcon: 'text-slate-400'
}

// Redirect if already logged in
watchEffect(async () => {
  if (user.value?.id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.value.id)
      .single()
    if (profile?.role === 'recruiter') {
      router.replace('/recruiter/dashboard')
    } else {
      router.replace('/candidate/dashboard')
    }
  }
})

// Login form
const loginForm = reactive({ email: '', password: '' })

const handleLogin = async () => {
  if (!loginForm.email || !loginForm.password) {
    toast.add({ title: 'Please fill in all fields', color: 'error' })
    return
  }
  loading.value = true
  const { error } = await supabase.auth.signInWithPassword({
    email: loginForm.email,
    password: loginForm.password,
  })
  loading.value = false
  if (error) {
    if (error.message.toLowerCase().includes('email') && error.message.toLowerCase().includes('confirm')) {
      toast.add({ title: 'Sign in failed', description: 'Invalid email or password.', color: 'error' })
    } else {
      toast.add({ title: 'Sign in failed', description: error.message, color: 'error' })
    }
  } else {
    toast.add({ title: 'Welcome back!', color: 'success' })
  }
}

// Register form
const registerForm = reactive({
  full_name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'candidate' as 'candidate' | 'recruiter',
})

const handleRegister = async () => {
  if (!registerForm.full_name || !registerForm.email || !registerForm.password) {
    toast.add({ title: 'Please fill in all fields', color: 'error' })
    return
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    toast.add({ title: 'Passwords do not match', color: 'error' })
    return
  }
  if (registerForm.password.length < 8) {
    toast.add({ title: 'Password must be at least 8 characters', color: 'error' })
    return
  }
  loading.value = true
  const { error: signUpError } = await supabase.auth.signUp({
    email: registerForm.email,
    password: registerForm.password,
    options: {
      data: {
        full_name: registerForm.full_name,
        role: registerForm.role,
      },
    },
  })

  if (signUpError) {
    loading.value = false
    toast.add({ title: 'Registration failed', description: signUpError.message, color: 'error' })
    return
  }

  // Auto sign-in immediately after registration (works when email confirmation is disabled)
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: registerForm.email,
    password: registerForm.password,
  })
  loading.value = false

  if (signInError) {
    toast.add({ title: 'Account created!', description: 'Please sign in to continue.', color: 'success' })
    tab.value = 'login'
    loginForm.email = registerForm.email
  } else {
    toast.add({ title: 'Account created!', description: 'Welcome to TalentBridge.', color: 'success' })
  }
}
</script>

<template>
  <div class="w-full max-w-md bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-slate-900">
        {{ tab === 'login' ? 'Welcome back' : 'Create an account' }}
      </h1>
      <p class="text-slate-500 mt-1">
        {{ tab === 'login' ? 'Sign in to your TalentBridge account' : 'Join thousands of professionals' }}
      </p>
    </div>

    <!-- Tab toggle -->
    <div class="flex rounded-xl bg-white border border-slate-200 p-1 mb-6">
      <button
        class="flex-1 py-2 text-sm font-medium rounded-lg"
        :class="tab === 'login' ? 'bg-white text-slate-900 border border-slate-200' : 'text-slate-500'"
        @click="tab = 'login'"
      >
        Sign in
      </button>
      <button
        class="flex-1 py-2 text-sm font-medium rounded-lg"
        :class="tab === 'register' ? 'bg-white text-slate-900 border border-slate-200' : 'text-slate-500'"
        @click="tab = 'register'"
      >
        Register
      </button>
    </div>

    <UCard
      class="shadow-sm border border-slate-200 bg-white rounded-xl"
      :ui="{
        root: 'bg-white border border-slate-200 shadow-sm rounded-xl',
        body: 'bg-white'
      }"
    >
      <!-- LOGIN FORM -->
      <form v-if="tab === 'login'" class="space-y-4" @submit.prevent="handleLogin">
        <UFormField label="Email address" name="email">
          <UInput
            v-model="loginForm.email"
            type="email"
            placeholder="you@example.com"
            icon="i-heroicons-envelope"
            autocomplete="email"
            class="w-full"
            :ui="authInputUi"
          />
        </UFormField>

        <UFormField label="Password" name="password">
          <UInput
            v-model="loginForm.password"
            type="password"
            placeholder="••••••••"
            icon="i-heroicons-lock-closed"
            autocomplete="current-password"
            class="w-full"
            :ui="authInputUi"
          />
        </UFormField>

        <UButton type="submit" color="primary" block :loading="loading" class="mt-2">
          Sign in
        </UButton>
      </form>

      <!-- REGISTER FORM -->
      <form v-else class="space-y-4" @submit.prevent="handleRegister">
        <!-- Role selector -->
        <div>
          <p class="text-sm font-medium text-slate-700 mb-2">I am a...</p>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              class="flex flex-col items-center gap-2 p-4 rounded-xl border-2"
              :class="registerForm.role === 'candidate'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 text-slate-600'"
              @click="registerForm.role = 'candidate'"
            >
              <UIcon name="i-heroicons-user-circle" class="text-2xl" />
              <span class="text-sm font-medium">Candidate</span>
              <span class="text-xs text-slate-400">Looking for work</span>
            </button>
            <button
              type="button"
              class="flex flex-col items-center gap-2 p-4 rounded-xl border-2"
              :class="registerForm.role === 'recruiter'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 text-slate-600'"
              @click="registerForm.role = 'recruiter'"
            >
              <UIcon name="i-heroicons-building-office" class="text-2xl" />
              <span class="text-sm font-medium">Recruiter</span>
              <span class="text-xs text-slate-400">Hiring talent</span>
            </button>
          </div>
        </div>

        <UFormField label="Full name" name="full_name">
          <UInput
            v-model="registerForm.full_name"
            placeholder="Jane Smith"
            icon="i-heroicons-user"
            autocomplete="name"
            class="w-full"
            :ui="authInputUi"
          />
        </UFormField>

        <UFormField label="Email address" name="email">
          <UInput
            v-model="registerForm.email"
            type="email"
            placeholder="you@example.com"
            icon="i-heroicons-envelope"
            autocomplete="email"
            class="w-full"
            :ui="authInputUi"
          />
        </UFormField>

        <UFormField label="Password" name="password">
          <UInput
            v-model="registerForm.password"
            type="password"
            placeholder="Min. 8 characters"
            icon="i-heroicons-lock-closed"
            autocomplete="new-password"
            class="w-full"
            :ui="authInputUi"
          />
        </UFormField>

        <UFormField label="Confirm password" name="confirmPassword">
          <UInput
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="Re-enter password"
            icon="i-heroicons-lock-closed"
            autocomplete="new-password"
            class="w-full"
            :ui="authInputUi"
          />
        </UFormField>

        <UButton type="submit" color="primary" block :loading="loading" class="mt-2">
          Create account
        </UButton>
      </form>
    </UCard>

    <p class="text-center text-sm text-slate-500 mt-4">
      <template v-if="tab === 'login'">
        No account yet?
        <button class="text-indigo-600 font-medium" @click="tab = 'register'">Register</button>
      </template>
      <template v-else>
        Already have an account?
        <button class="text-indigo-600 font-medium" @click="tab = 'login'">Sign in</button>
      </template>
    </p>
  </div>
</template>
