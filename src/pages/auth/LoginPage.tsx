import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TrendingUp, Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react'
import { AuthAside } from '../../components/layout/AuthAside'

export function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: wire up auth
    navigate('/dashboard')
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
            className="absolute top-24 left-8 w-64 h-64 rounded-full pointer-events-none"
            style={{
              background: '#6366f1',
              opacity: 0.05,
              filter: 'blur(60px)',
            }}
          />
          <div
            className="absolute bottom-16 right-8 w-64 h-64 rounded-full pointer-events-none"
            style={{
              background: '#06b6d4',
              opacity: 0.05,
              filter: 'blur(60px)',
            }}
          />

          <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-9">
            {/* Header */}
            <div className="text-center mb-8">
              {/* Placeholder logo */}
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                <TrendingUp size={26} className="text-white" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-gray-500">
                Sign in to your StockSense account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                  htmlFor="email"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
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
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    className="text-sm font-medium text-gray-700"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <span
                    className="text-xs text-gray-400"
                    title="Password recovery is not available in this preview"
                  >
                    Need help signing in?
                  </span>
                </div>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-semibold py-2.5 rounded-lg text-sm transition-all shadow-sm shadow-indigo-200"
              >
                Sign in
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
