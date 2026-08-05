import { defineNuxtRouteMiddleware, navigateTo, useCookie } from '#imports'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  // Ensure auth session is initialized
  if (!authStore.isAuthenticated) {
    await authStore.initAuth()
  }

  const token = useCookie('auth_token')
  const isAuth = authStore.isAuthenticated || !!token.value

  // If user is at /login and has an active session, redirect to home
  if (to.path === '/login') {
    if (isAuth) {
      return navigateTo('/')
    }
    return
  }

  // If user is unauthenticated and tries to visit protected page, redirect to /login
  if (!isAuth) {
    return navigateTo('/login')
  }

  // Admin-only page restriction
  if (to.path.startsWith('/users') && authStore.currentUser && !authStore.isAdmin) {
    return navigateTo('/')
  }
})
