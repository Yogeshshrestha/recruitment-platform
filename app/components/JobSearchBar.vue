<script setup lang="ts">
const props = defineProps<{
  search: string
  category: string
  type: string
}>()

const emit = defineEmits<{
  'update:search': [val: string]
  'update:category': [val: string]
  'update:type': [val: string]
  'search': []
  'clear': []
}>()

const localSearch = computed({
  get: () => props.search,
  set: (v) => emit('update:search', v),
})
const localCategory = computed({
  get: () => props.category || '__all_categories__',
  set: (v) => emit('update:category', v === '__all_categories__' ? '' : v),
})
const localType = computed({
  get: () => props.type || '__all_types__',
  set: (v) => emit('update:type', v === '__all_types__' ? '' : v),
})

const categoryItems = [
  { label: 'All categories', value: '__all_categories__' },
  ...['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'Finance', 'HR', 'Operations', 'Legal', 'Other']
    .map(c => ({ label: c, value: c })),
]

const typeItems = [
  { label: 'All types', value: '__all_types__' },
  { label: 'Full-time', value: 'full-time' },
  { label: 'Part-time', value: 'part-time' },
  { label: 'Contract', value: 'contract' },
  { label: 'Remote', value: 'remote' },
  { label: 'Hybrid', value: 'hybrid' },
]

const hasFilters = computed(() => props.search || props.category || props.type)
</script>

<template>
  <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
    <div class="flex flex-col md:flex-row gap-3">
      <UInput
        v-model="localSearch"
        placeholder="Search job title, keyword..."
        icon="i-heroicons-magnifying-glass"
        size="lg"
        class="flex-1"
        :ui="{ base: 'bg-white text-slate-900 ring-1 ring-slate-200 focus:bg-slate-50 focus:ring-slate-300 shadow-none' }"
        @keyup.enter="emit('search')"
      />
      <USelect
        v-model="localCategory"
        :items="categoryItems"
        placeholder="Category"
        size="lg"
        class="md:w-48"
        :ui="{
          base: 'bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-white active:bg-white focus:bg-white focus:ring-slate-300 shadow-none',
          placeholder: 'text-slate-900',
          content: 'bg-white text-slate-900 border border-slate-200 shadow-sm',
          item: 'text-slate-800 bg-white hover:bg-slate-100 hover:text-slate-900 data-[highlighted]:bg-slate-100 data-[highlighted]:text-slate-900 data-[state=checked]:text-slate-900',
          itemLabel: 'text-slate-800 group-data-[highlighted]:text-slate-900',
          itemDescription: 'text-slate-500 group-data-[highlighted]:text-slate-700',
          itemLeadingIcon: 'text-slate-500 group-data-[highlighted]:text-slate-700',
          itemTrailingIcon: 'text-slate-700 group-data-[highlighted]:text-slate-900'
        }"
      />
      <USelect
        v-model="localType"
        :items="typeItems"
        placeholder="Type"
        size="lg"
        class="md:w-40"
        :ui="{
          base: 'bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-white active:bg-white focus:bg-white focus:ring-slate-300 shadow-none',
          placeholder: 'text-slate-900',
          content: 'bg-white text-slate-900 border border-slate-200 shadow-sm',
          item: 'text-slate-800 bg-white hover:bg-slate-100 hover:text-slate-900 data-[highlighted]:bg-slate-100 data-[highlighted]:text-slate-900 data-[state=checked]:text-slate-900',
          itemLabel: 'text-slate-800 group-data-[highlighted]:text-slate-900',
          itemDescription: 'text-slate-500 group-data-[highlighted]:text-slate-700',
          itemLeadingIcon: 'text-slate-500 group-data-[highlighted]:text-slate-700',
          itemTrailingIcon: 'text-slate-700 group-data-[highlighted]:text-slate-900'
        }"
      />
      <UButton size="lg" color="primary" icon="i-heroicons-magnifying-glass" class="px-6 bg-indigo-600 text-white border border-indigo-600 hover:bg-indigo-600 active:bg-indigo-600" @click="emit('search')">
        Search
      </UButton>
    </div>

    <div v-if="hasFilters" class="flex items-center gap-2 mt-4 flex-wrap">
      <span class="text-sm text-slate-500">Active filters:</span>
      <UBadge v-if="search" variant="soft" color="neutral" size="sm" class="bg-slate-100 text-slate-700 ring-1 ring-slate-200">
        "{{ search }}"
        <button class="ml-1 hover:text-red-500" @click="emit('update:search', ''); emit('search')">×</button>
      </UBadge>
      <UBadge v-if="category" variant="soft" color="neutral" size="sm" class="bg-slate-100 text-slate-700 ring-1 ring-slate-200">
        {{ category }}
        <button class="ml-1 hover:text-red-500" @click="emit('update:category', ''); emit('search')">×</button>
      </UBadge>
      <UBadge v-if="type" variant="soft" color="neutral" size="sm" class="bg-slate-100 text-slate-700 ring-1 ring-slate-200">
        {{ type }}
        <button class="ml-1 hover:text-red-500" @click="emit('update:type', ''); emit('search')">×</button>
      </UBadge>
      <UButton variant="outline" color="neutral" size="xs" class="border-slate-200 text-slate-700 bg-white hover:bg-white active:bg-white" @click="emit('clear')">Clear all</UButton>
    </div>
  </div>
</template>
