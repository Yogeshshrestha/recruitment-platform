<template>
  <div class="min-h-screen bg-white flex flex-col">
    <header class="p-6">
      <NuxtLink to="/" class="flex items-center gap-2 w-fit">
        <div class="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center">
          <UIcon name="i-heroicons-briefcase" class="text-slate-700 text-base" />
        </div>
        <span class="font-bold text-slate-900 text-lg">TalentBridge</span>
      </NuxtLink>
    </header>

    <main class="flex-1 flex items-center justify-center px-4 py-12">
      <slot />
    </main>

    <footer class="py-6 text-center">
      <p class="text-sm text-slate-400">© {{ new Date().getFullYear() }} TalentBridge</p>
    </footer>
  </div>
</template>
