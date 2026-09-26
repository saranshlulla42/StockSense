import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { authApi, isApiError, type ApiError, type UserResponse } from '../api/client'

// -------------------------------------------------------------------------
// Types
// -------------------------------------------------------------------------

interface AuthState {
  user: UserResponse | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  login: (identifier: string, password: string) => Promise<void>
  signup: (
    full_name: string,
    email: string,
    password: string,
  ) => Promise<{ email: string; demo_otp?: string }>
  verifyOtp: (email: string, otp: string) => Promise<void>
  resendOtp: (email: string) => Promise<void>
  logout: () => void
}

// -------------------------------------------------------------------------
// Context
// -------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | null>(null)

const TOKEN_KEY = 'stocksense_token'

// -------------------------------------------------------------------------
// Provider
// -------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true, // true on first mount — we check localStorage
  })

  // On mount, restore session from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY)
    if (!savedToken) {
      setState((s) => ({ ...s, isLoading: false }))
      return
    }

    // Validate the token by hitting /me
    authApi
      .me()
      .then((user) => {
        setState({
          user,
          token: savedToken,
          isAuthenticated: true,
          isLoading: false,
        })
      })
      .catch(() => {
        // Token is expired or invalid — clear it
        localStorage.removeItem(TOKEN_KEY)
        setState({ user: null, token: null, isAuthenticated: false, isLoading: false })
      })
  }, [])

  // ------------------------------------------------------------------
  const login = useCallback(async (identifier: string, password: string) => {
    const data = await authApi.login({ identifier, password })
    localStorage.setItem(TOKEN_KEY, data.access_token)
    setState({
      user: data.user,
      token: data.access_token,
      isAuthenticated: true,
      isLoading: false,
    })
  }, [])

  // ------------------------------------------------------------------
  const signup = useCallback(
    async (full_name: string, email: string, password: string) => {
      const data = await authApi.signup({ full_name, email, password })
      return { email: data.email, demo_otp: data.demo_otp }
    },
    [],
  )

  // ------------------------------------------------------------------
  const verifyOtp = useCallback(async (email: string, otp: string) => {
    const data = await authApi.verifyOtp({ email, otp })
    localStorage.setItem(TOKEN_KEY, data.access_token)
    setState({
      user: data.user,
      token: data.access_token,
      isAuthenticated: true,
      isLoading: false,
    })
  }, [])

  // ------------------------------------------------------------------
  const resendOtp = useCallback(async (email: string) => {
    await authApi.resendOtp({ email })
  }, [])

  // ------------------------------------------------------------------
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false })
  }, [])

  return (
    <AuthContext.Provider
      value={{ ...state, login, signup, verifyOtp, resendOtp, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// -------------------------------------------------------------------------
// Hook
// -------------------------------------------------------------------------

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

// -------------------------------------------------------------------------
// Re-exports so pages only need to import from this one file
// -------------------------------------------------------------------------
export { isApiError }
export type { ApiError }
