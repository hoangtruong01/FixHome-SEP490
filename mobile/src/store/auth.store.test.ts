import { UserRole, type UserInfo } from '../types'
import { useAuthStore } from './auth.store'

const customer: UserInfo = {
  id: 'customer-1',
  email: 'customer@fixhome.test',
  fullName: 'FixHome Customer',
  role: UserRole.CUSTOMER,
}

describe('auth store', () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: true,
    })
  })

  it('sets an authenticated user', () => {
    useAuthStore.getState().setAuth('token', customer)

    expect(useAuthStore.getState()).toMatchObject({
      token: 'token',
      user: customer,
      isAuthenticated: true,
      isLoading: false,
    })
  })

  it('clears user data on logout', () => {
    useAuthStore.getState().setAuth('token', customer)
    useAuthStore.getState().logout()

    expect(useAuthStore.getState()).toMatchObject({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
  })
})
