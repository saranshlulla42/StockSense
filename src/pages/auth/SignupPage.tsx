import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  TrendingUp,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  RefreshCw,
} from 'lucide-react'
import { AuthAside } from '../../components/layout/AuthAside'
import { useAuth, isApiError } from '../../context/AuthContext'
import { Modal } from '../../components/ui/Modal'

// ---------------------------------------------------------------------------
// OTP Verification Modal
// ---------------------------------------------------------------------------

interface OtpModalProps {
  email: string
  open: boolean
  onVerified: () => void
}

function OtpModal({ email, open, onVerified }: OtpModalProps) {
  const { verifyOtp, resendOtp } = useAuth()
  const [otp, setOtp] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendMsg, setResendMsg] = useState<string | null>(null)

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsVerifying(true)
    try {
      await verifyOtp(email, otp.trim())
      onVerified()
    } catch (err) {
      setError(
        isApiError(err)
          ? err.message
          : 'Could not verify OTP. Please try again.',
      )
    } finally {
      setIsVerifying(false)
    }
  }

  async function handleResend() {
    setError(null)
    setResendMsg(null)
    setIsResending(true)
    try {
      await resendOtp(email)
      setResendMsg('A new OTP has been sent to your email.')
    } catch (err) {
      setError(
        isApiError(err) ? err.message : 'Could not resend OTP.',
      )
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Modal open={open} onClose={() => { }} title="Verify your email" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-gray-600 leading-relaxed">
          We sent a 6-digit code to{' '}
          <span className="font-semibold text-gray-800">{email}</span>. Enter
          it below to activate your account.
        </p>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
            <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {resendMsg && (
          <div className="flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
            <CheckCircle2 size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{resendMsg}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Verification code
            </label>
            <div className="relative">
              <KeyRound
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ''))
                  setError(null)
                }}
                placeholder="123456"
                autoFocus
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm tracking-widest text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isVerifying || otp.length < 6}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Verifying…
              </>
            ) : (
              'Verify and sign in'
            )}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={isResending ? 'animate-spin' : ''} aria-hidden="true" />
          {isResending ? 'Resending…' : "Didn't receive it? Resend code"}
        </button>
      </div>
    </Modal>
  )
}

// ---------------------------------------------------------------------------
// SignupPage
// ---------------------------------------------------------------------------

export function SignupPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signup, isAuthenticated } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [otpEmail, setOtpEmail] = useState<string | null>(null)

  // If redirected from login due to unverified email, show OTP modal immediately
  useEffect(() => {
    const state = location.state as { pendingEmail?: string; fromLogin?: boolean } | null
    if (state?.pendingEmail && state?.fromLogin) {
      setOtpEmail(state.pendingEmail)
    }
  }, [location.state])

  // If already logged in, skip to dashboard
  if (isAuthenticated) {
    navigate('/dashboard', { replace: true })
    return null
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await signup(form.name, form.email, form.password)
      setOtpEmail(result.email)
    } catch (err) {
      setError(
        isApiError(err)
          ? err.message
          : 'Something went wrong. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  function handleOtpVerified() {
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
            <TrendingUp size={18} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">
            StockSense
          </span>
        </Link>
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>
      </nav>

      {/* Card */}
      <div className="relative mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <AuthAside />
        <div className="mx-auto w-full max-w-md">
          {/* Decorative blobs */}
          <div
            className="absolute top-24 right-8 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: '#6366f1', opacity: 0.05, filter: 'blur(60px)' }}
            aria-hidden="true"
          />
          <div
            className="absolute bottom-16 left-8 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: '#8b5cf6', opacity: 0.05, filter: 'blur(60px)' }}
            aria-hidden="true"
          />

          <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-9">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                <TrendingUp size={26} className="text-white" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">
                Create your account
              </h1>
              <p className="text-sm text-gray-500">
                Start managing inventory smarter, today
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error banner */}
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              {/* Full name */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                  htmlFor="name"
                >
                  Full name
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Jane Smith"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                  htmlFor="email"
                >
                  Work email
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 8 characters"
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {/* Password strength bar */}
                {form.password.length > 0 && (
                  <div className="mt-2 flex gap-1" aria-hidden="true">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-1 rounded-full transition-colors ${form.password.length >= (i + 1) * 2
                          ? form.password.length >= 8
                            ? 'bg-emerald-400'
                            : 'bg-amber-400'
                          : 'bg-gray-200'
                          }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Terms */}
              <p className="text-xs text-gray-400 leading-relaxed">
                By creating an account, you agree to our{' '}
                <a href="#" className="text-indigo-600 hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-indigo-600 hover:underline">
                  Privacy Policy
                </a>
                .
              </p>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-all shadow-sm shadow-indigo-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Creating account…
                  </>
                ) : (
                  "Create account — it's free"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {otpEmail && (
        <OtpModal
          email={otpEmail}
          open={!!otpEmail}
          onVerified={handleOtpVerified}
        />
      )}
    </div>
  )
}
