<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-2">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-2xl shadow-lg border text-sm font-semibold transition-all duration-200"
          :class="{
            'bg-emerald-600 text-white border-emerald-500': toast.type === 'success',
            'bg-red-600 text-white border-red-500': toast.type === 'error',
            'bg-amber-500 text-white border-amber-400': toast.type === 'warning',
            'bg-blue-600 text-white border-blue-500': toast.type === 'info'
          }"
        >
          <div class="flex items-center gap-2.5">
            <CheckCircle2 v-if="toast.type === 'success'" class="w-5 h-5 shrink-0" />
            <AlertCircle v-else-if="toast.type === 'error'" class="w-5 h-5 shrink-0" />
            <AlertTriangle v-else-if="toast.type === 'warning'" class="w-5 h-5 shrink-0" />
            <Info v-else class="w-5 h-5 shrink-0" />
            <span>{{ toast.message }}</span>
          </div>

          <button 
            @click="removeToast(toast.id)"
            class="p-1 hover:bg-white/20 rounded-lg transition"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-vue-next'

const { toasts, removeToast } = useToast()
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>
