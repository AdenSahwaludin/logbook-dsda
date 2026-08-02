<template>
  <div class="animate-pulse space-y-4">
    <!-- Card Skeleton -->
    <div v-if="type === 'card'" class="card-base p-5 space-y-3">
      <div class="h-4 bg-slate-200 rounded-md w-1/3"></div>
      <div class="h-8 bg-slate-200 rounded-lg w-1/2"></div>
      <div class="h-3 bg-slate-200 rounded-md w-2/3"></div>
    </div>

    <!-- Table / List Skeleton -->
    <div v-else-if="type === 'list'" class="space-y-3">
      <div v-for="i in count" :key="i" class="card-base p-4 flex items-center justify-between">
        <div class="space-y-2 flex-1 pr-4">
          <div class="h-4 bg-slate-200 rounded w-1/4"></div>
          <div class="h-3 bg-slate-200 rounded w-3/4"></div>
        </div>
        <div class="h-10 w-24 bg-slate-200 rounded-xl"></div>
      </div>
    </div>

    <!-- Form Skeleton -->
    <div v-else-if="type === 'form'" class="card-base p-6 space-y-5">
      <div class="space-y-2" v-for="i in count" :key="i">
        <div class="h-3 bg-slate-200 rounded w-1/4"></div>
        <div class="h-11 bg-slate-200 rounded-xl w-full"></div>
      </div>
    </div>

    <!-- Default generic block skeleton -->
    <div v-else class="space-y-3">
      <div class="h-4 bg-slate-200 rounded w-3/4"></div>
      <div class="h-4 bg-slate-200 rounded w-1/2"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  type?: 'card' | 'list' | 'form' | 'default'
  count?: number
}>(), {
  type: 'default',
  count: 3
})
</script>
