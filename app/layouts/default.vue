<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <AppNavbar />

    <!-- Page content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white/80 border-t border-slate-200 mt-auto">
      <UContainer class="max-w-7xl">
        <div class="py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 bg-slate-100 border border-slate-200 rounded flex items-center justify-center">
              <UIcon name="i-heroicons-briefcase" class="text-slate-600 text-xs" />
            </div>
            <span class="text-sm font-semibold tracking-tight text-slate-700">TalentBridge</span>
          </div>
          <p class="text-sm text-slate-500">© {{ new Date().getFullYear() }} TalentBridge. All rights reserved.</p>
          <div class="flex items-center gap-4 text-sm text-slate-500">
            <NuxtLink to="/jobs" class="hover:text-slate-700 transition-colors">Jobs</NuxtLink>
            <NuxtLink to="/auth" class="hover:text-slate-700 transition-colors">Sign In</NuxtLink>
          </div>
        </div>
      </UContainer>
    </footer>
  </div>
</template>
