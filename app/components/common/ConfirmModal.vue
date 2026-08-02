<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
        <div 
          class="card-base w-full max-w-md p-6 space-y-4 shadow-xl transform transition-all animate-in fade-in zoom-in-95 duration-200"
          @click.stop
        >
          <div class="flex items-start gap-4">
            <div 
              class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              :class="variant === 'danger' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'"
            >
              <component :is="variant === 'danger' ? AlertTriangle : CheckCircle2" class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-900">{{ title }}</h3>
              <p class="text-sm text-slate-600 mt-1 leading-relaxed">{{ message }}</p>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button 
              type="button" 
              class="btn-secondary text-sm py-2 px-4"
              @click="$emit('cancel')"
            >
              {{ cancelText }}
            </button>
            <button 
              type="button" 
              :class="variant === 'danger' ? 'btn-danger' : 'btn-primary'"
              class="text-sm py-2 px-4"
              @click="$emit('confirm')"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { AlertTriangle, CheckCircle2 } from 'lucide-vue-next'

withDefaults(defineProps<{
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'primary' | 'danger'
}>(), {
  confirmText: 'Ya, Lanjutkan',
  cancelText: 'Batal',
  variant: 'primary'
})

defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
