<template>
  <UCard class="animate-pulse border border-slate-200 shadow-sm rounded-xl">
    <div class="space-y-3">
      <div class="flex items-start gap-3">
        <USkeleton class="w-10 h-10 rounded-lg shrink-0" />
        <div class="flex-1 space-y-2">
          <USkeleton class="h-4 w-3/4" />
          <USkeleton class="h-3 w-1/2" />
        </div>
      </div>
      <USkeleton class="h-3 w-full" />
      <USkeleton class="h-3 w-2/3" />
      <div class="flex gap-2 pt-2">
        <USkeleton class="h-6 w-16 rounded-full" />
        <USkeleton class="h-6 w-20 rounded-full" />
      </div>
    </div>
  </UCard>
</template>
