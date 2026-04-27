<script setup lang="ts">
type ApplicationStatus = 'applied' | 'reviewing' | 'interviewing' | 'rejected' | 'hired'

defineProps<{
  applicants: any[]
  updatingId: string | null
  downloadingId: string | null
}>()

const emit = defineEmits<{
  'change-status': [application: any, status: ApplicationStatus]
  'download-resume': [application: any]
  'view-profile': [applicant: any]
}>()

const statusConfig: Record<ApplicationStatus, { label: string; color: string; class: string }> = {
  applied:      { label: 'Applied',      color: 'neutral', class: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200' },
  reviewing:    { label: 'Reviewing',    color: 'neutral', class: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  interviewing: { label: 'Interviewing', color: 'neutral', class: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200' },
  rejected:     { label: 'Rejected',     color: 'neutral', class: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200' },
  hired:        { label: 'Hired',        color: 'neutral', class: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
}

const statusOptions = [
  { label: 'Applied',      value: 'applied' },
  { label: 'Reviewing',    value: 'reviewing' },
  { label: 'Interviewing', value: 'interviewing' },
  { label: 'Rejected',     value: 'rejected' },
  { label: 'Hired',        value: 'hired' },
]
</script>

<template>
  <!-- Desktop table -->
  <div class="hidden md:block">
    <UCard
      :ui="{ root: 'bg-white border border-slate-200 rounded-xl shadow-sm', body: '!p-0 bg-white' }"
      class="border border-slate-200 shadow-sm rounded-xl bg-white"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50/70">
              <th class="text-left py-3 px-4 font-medium text-slate-600">Candidate</th>
              <th class="text-left py-3 px-4 font-medium text-slate-600">Skills</th>
              <th class="text-left py-3 px-4 font-medium text-slate-600">Applied</th>
              <th class="text-left py-3 px-4 font-medium text-slate-600">Status</th>
              <th class="text-left py-3 px-4 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="app in applicants"
              :key="app.id"
              class="hover:bg-slate-50/70 transition-colors"
            >
              <td class="py-4 px-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 text-sm font-bold shrink-0">
                    {{ (app.profiles?.full_name ?? '?')[0]?.toUpperCase() }}
                  </div>
                  <div>
                    <p class="font-medium text-slate-900">
                      {{ app.profiles?.full_name ?? 'Anonymous' }}
                    </p>
                    <p class="text-xs text-slate-400 line-clamp-1 max-w-xs">
                      {{ app.profiles?.bio ?? 'No bio' }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="py-4 px-4">
                <div class="flex flex-wrap gap-1 max-w-xs">
                  <UBadge
                    v-for="skill in (app.profiles?.skills ?? []).slice(0, 3)"
                    :key="skill"
                    variant="soft"
                    color="neutral"
                    size="xs"
                    class="bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                  >
                    {{ skill }}
                  </UBadge>
                  <span v-if="(app.profiles?.skills ?? []).length > 3" class="text-xs text-slate-400">
                    +{{ app.profiles.skills.length - 3 }}
                  </span>
                </div>
              </td>
              <td class="py-4 px-4 text-slate-500">
                {{ new Date(app.created_at).toLocaleDateString() }}
              </td>
              <td class="py-4 px-4">
                <USelect
                  :model-value="app.status"
                  :items="statusOptions"
                  size="sm"
                  class="w-36"
                  :loading="updatingId === app.id"
                  @update:model-value="(val: any) => emit('change-status', app, val)"
                />
              </td>
              <td class="py-4 px-4">
                <div class="flex items-center gap-2">
                  <UButton
                    variant="outline"
                    color="neutral"
                    size="xs"
                    icon="i-heroicons-user"
                    class="border-slate-200 text-slate-700"
                    @click="emit('view-profile', app)"
                  >
                    Profile
                  </UButton>
                  <UButton
                    variant="outline"
                    color="neutral"
                    size="xs"
                    icon="i-heroicons-document-arrow-down"
                    class="border-slate-200 text-slate-700"
                    :loading="downloadingId === app.id"
                    @click="emit('download-resume', app)"
                  >
                    Resume
                  </UButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </div>

  <!-- Mobile cards -->
  <div class="md:hidden space-y-3">
    <UCard
      v-for="app in applicants"
      :key="app.id"
      class="border border-slate-200 shadow-sm rounded-xl bg-white"
      :ui="{ root: 'bg-white border border-slate-200 rounded-xl shadow-sm', body: 'bg-white' }"
    >
      <div class="space-y-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold shrink-0">
            {{ (app.profiles?.full_name ?? '?')[0]?.toUpperCase() }}
          </div>
          <div>
            <p class="font-medium text-slate-900">{{ app.profiles?.full_name ?? 'Anonymous' }}</p>
            <p class="text-xs text-slate-400">Applied {{ new Date(app.created_at).toLocaleDateString() }}</p>
          </div>
          <UBadge
            class="ml-auto"
            :color="(statusConfig[app.status as ApplicationStatus]?.color as any) ?? 'neutral'"
            variant="soft"
            size="sm"
            :class="statusConfig[app.status as ApplicationStatus]?.class"
          >
            {{ statusConfig[app.status as ApplicationStatus]?.label ?? app.status }}
          </UBadge>
        </div>

        <div v-if="(app.profiles?.skills ?? []).length" class="flex flex-wrap gap-1">
          <UBadge
            v-for="skill in (app.profiles?.skills ?? []).slice(0, 4)"
            :key="skill"
            variant="soft"
            color="neutral"
            size="xs"
            class="bg-slate-100 text-slate-700 ring-1 ring-slate-200"
          >
            {{ skill }}
          </UBadge>
        </div>

        <div class="flex items-center gap-2">
          <USelect
            :model-value="app.status"
            :items="statusOptions"
            size="sm"
            class="flex-1"
            @update:model-value="(val: any) => emit('change-status', app, val)"
          />
          <UButton
            variant="outline"
            color="neutral"
            size="sm"
            icon="i-heroicons-document-arrow-down"
            class="border-slate-200 text-slate-700"
            :loading="downloadingId === app.id"
            @click="emit('download-resume', app)"
          />
          <UButton
            variant="outline"
            color="neutral"
            size="sm"
            icon="i-heroicons-user"
            class="border-slate-200 text-slate-700"
            @click="emit('view-profile', app)"
          />
        </div>
      </div>
    </UCard>
  </div>
</template>
