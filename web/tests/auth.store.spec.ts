import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '../src/stores/auth.store'
import { UserRole } from '../src/types'

describe('auth store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('sets authentication state and evaluates roles', () => {
    const store = useAuthStore()

    store.setAuth('token', {
      id: 'user-1',
      email: 'admin@fixhome.test',
      fullName: 'FixHome Admin',
      role: UserRole.ADMIN,
    })

    expect(store.isAuthenticated).toBe(true)
    expect(store.hasRole(UserRole.ADMIN)).toBe(true)
    expect(store.hasAnyRole([UserRole.SERVICE_MANAGER, UserRole.ADMIN])).toBe(true)
    expect(localStorage.getItem('access_token')).toBe('token')
  })

  it('clears authentication state on logout', () => {
    const store = useAuthStore()
    store.setAuth('token', {
      id: 'user-1',
      email: 'customer@fixhome.test',
      fullName: 'FixHome Customer',
      role: UserRole.CUSTOMER,
    })

    store.logout()

    expect(store.isAuthenticated).toBe(false)
    expect(store.user).toBeNull()
    expect(localStorage.getItem('access_token')).toBeNull()
  })
})
