import { defineNuxtRouteMiddleware, navigateTo, useCookie } from '#imports'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const token = useCookie('auth_token')
  const authStore = useAuthStore()

  // If user is already logged in and visits /login, redirect to home
  if (to.path === '/login') {
    if (token.value || authStore.isAuthenticated) {
      return navigateTo('/')
    }
    return
  }

  // Initialize auth session
  if (!authStore.isAuthenticated) {
    await authStore.initAuth()
  }

  // Only redirect to login if unauthenticated AND no token cookie exists
  if (!authStore.isAuthenticated && !token.value) {
    return navigateTo('/login')
  }

  // Admin-only page restriction
  if (to.path.startsWith('/users') && authStore.currentUser && !authStore.isAdmin) {
    return navigateTo('/')
  }
})
