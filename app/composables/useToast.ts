import { ref } from 'vue'

export interface ToastItem {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

const toasts = ref<ToastItem[]>([])

export function useToast() {
  function showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success', duration = 3500) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    const newToast: ToastItem = { id, message, type, duration }
    toasts.value.push(newToast)

    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  function removeToast(id: string) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  return {
    toasts,
    showToast,
    removeToast,
    success: (msg: string) => showToast(msg, 'success'),
    error: (msg: string) => showToast(msg, 'error'),
    info: (msg: string) => showToast(msg, 'info'),
    warning: (msg: string) => showToast(msg, 'warning')
  }
}
