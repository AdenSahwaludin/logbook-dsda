import { defineNuxtRouteMiddleware, navigateTo } from '#imports'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  // Always allow access to /login page
  if (to.path === '/login') {
    return
  }

  const authStore = useAuthStore()

  // Initialize auth if not already initialized
  if (!authStore.isAuthenticated) {
    await authStore.initAuth()
  }

  // If still unauthenticated, redirect immediately to login
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  // Admin-only page restriction
  if (to.path.startsWith('/users') && !authStore.isAdmin) {
    return navigateTo('/')
  }
})
