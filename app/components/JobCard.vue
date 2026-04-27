<script setup lang="ts">
defineProps<{
  job: {
    id: string
    title: string
    description?: string | null
    location?: string | null
    type: string
    salary_range?: string | null
    category?: string | null
    created_at: string
    companies?: { name: string; logo_url?: string | null } | null
  }
}>()
</script>

<template>
  <NuxtLink :to="`/jobs/${job.id}`" class="group">
    <UCard
      class="h-full border border-slate-200 shadow-sm hover:border-slate-300 transition-colors cursor-pointer rounded-xl bg-white"
      :ui="{ root: 'bg-white border border-slate-200 rounded-xl shadow-sm', body: 'bg-white' }"
    >
      <div class="flex flex-col h-full gap-4">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
            <UIcon name="i-heroicons-building-office-2" class="text-slate-600" />
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="font-semibold text-slate-900 tracking-tight line-clamp-1">
              {{ job.title }}
            </h3>
            <p class="text-sm text-slate-500 line-clamp-1 mt-0.5">{{ job.companies?.name ?? 'Company' }}</p>
          </div>
        </div>

        <p class="text-sm text-slate-600 leading-6 line-clamp-2">
          {{ job.description?.replace(/<[^>]+>/g, '').slice(0, 120) }}...
        </p>

        <div class="flex flex-wrap gap-2 mt-auto">
          <UBadge v-if="job.location" variant="soft" color="neutral" size="sm" class="text-slate-600 bg-slate-100 ring-1 ring-slate-200">
            <UIcon name="i-heroicons-map-pin" class="mr-1 text-xs" />{{ job.location }}
          </UBadge>
          <UBadge variant="soft" color="neutral" size="sm" class="text-slate-700 bg-slate-100 ring-1 ring-slate-200">{{ job.type }}</UBadge>
          <UBadge v-if="job.salary_range" variant="soft" color="neutral" size="sm" class="text-slate-700 bg-slate-100 ring-1 ring-slate-200">
            {{ job.salary_range }}
          </UBadge>
        </div>

        <div class="flex items-center justify-between pt-3 border-t border-slate-200">
          <span class="text-xs text-slate-400">
            {{ new Date(job.created_at).toLocaleDateString() }}
          </span>
          <span class="text-xs text-slate-500 font-medium group-hover:text-slate-700">View details</span>
        </div>
      </div>
    </UCard>
  </NuxtLink>
</template>
