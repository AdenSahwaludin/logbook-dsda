import { defineNuxtRouteMiddleware, navigateTo, useCookie } from '#imports'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  // Always allow access to /login page
  if (to.path === '/login') {
    return
  }

  const authStore = useAuthStore()

  // Initialize auth session
  if (!authStore.isAuthenticated) {
    await authStore.initAuth()
  }

  // Check token cookie
  const token = useCookie('dsda_token')

  // Only redirect to login if unauthenticated AND no token cookie exists
  if (!authStore.isAuthenticated && !token.value) {
    return navigateTo('/login')
  }

  // Admin-only page restriction
  if (to.path.startsWith('/users') && authStore.currentUser && !authStore.isAdmin) {
    return navigateTo('/')
  }
})
