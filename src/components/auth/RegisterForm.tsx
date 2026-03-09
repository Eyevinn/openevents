'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'

function PasswordStrengthIndicator({ password }: { password: string }) {
  const getStrength = (pass: string): { score: number; label: string; color: string } => {
    let score = 0
    if (pass.length >= 8) score++
    if (pass.length >= 12) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[a-z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-red-500' }
    if (score <= 4) return { score: 2, label: 'Fair', color: 'bg-yellow-500' }
    if (score <= 5) return { score: 3, label: 'Good', color: 'bg-blue-500' }
    return { score: 4, label: 'Strong', color: 'bg-green-500' }
  }

  const strength = getStrength(password)

  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full ${
              level <= strength.score ? strength.color : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs ${
        strength.score <= 1 ? 'text-red-600' :
        strength.score <= 2 ? 'text-yellow-600' :
        strength.score <= 3 ? 'text-blue-600' :
        'text-green-600'
      }`}>
        {`Password strength: ${strength.label}`}
      </p>
    </div>
  )
}

export function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const password = watch('password', '')

  const onSubmit = async (data: RegisterInput) => {
    if (!acceptedTerms) {
      setError('Please accept the terms and conditions')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.message || 'Registration failed')
        return
      }

      setSuccess(true)
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl bg-white px-4 py-6 shadow-[0px_10px_30px_0px_rgba(0,0,0,0.12)] sm:rounded-3xl sm:px-8 sm:py-10 lg:px-12 lg:py-12">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-600">Check your email</h2>
          <p className="text-[#4a5565]">
            Please check your email inbox and click on the verification link to activate your account.
          </p>
          <p className="text-sm text-[#828283]">The link will expire in 24 hours.</p>
          <button
            onClick={() => router.push('/login')}
            className="h-12 w-full rounded-[10px] border border-[#d1d5dc] bg-white text-base font-semibold text-[#4a5565] transition-colors hover:bg-[#f2f2f4] sm:h-[52px]"
          >
            Go to Log in
          </button>
          <p className="text-sm text-[#4a5565]">
            Didn&apos;t receive the email?{' '}
            <Link href="/verify-email" className="text-[#5c8bd9] hover:underline">
              Resend verification
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white px-4 pb-6 pt-6 shadow-[0px_10px_30px_0px_rgba(0,0,0,0.12)] sm:rounded-3xl sm:px-8 sm:pb-10 sm:pt-10 lg:px-12 lg:pb-12 lg:pt-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-black sm:text-4xl">Create your account</h1>
        <p className="mt-2 text-base text-[#4a5565] sm:text-lg">Join OpenEvents to discover and attend amazing events</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* First / Last name */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-base font-semibold text-black">
              First name <span className="text-red-500">*</span>
            </label>
            <input
              placeholder="John"
              autoComplete="given-name"
              disabled={isLoading}
              className="h-12 w-full rounded-[10px] bg-[#f2f2f4] px-5 text-base placeholder:text-[#828283] focus:outline-none focus:ring-2 focus:ring-[#5c8bd9] disabled:opacity-50"
              {...register('firstName')}
            />
            {errors.firstName && (
              <p className="text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-base font-semibold text-black">
              Last name <span className="text-red-500">*</span>
            </label>
            <input
              placeholder="Doe"
              autoComplete="family-name"
              disabled={isLoading}
              className="h-12 w-full rounded-[10px] bg-[#f2f2f4] px-5 text-base placeholder:text-[#828283] focus:outline-none focus:ring-2 focus:ring-[#5c8bd9] disabled:opacity-50"
              {...register('lastName')}
            />
            {errors.lastName && (
              <p className="text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label className="text-base font-semibold text-black">
            Email address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#828283] pointer-events-none" />
            <input
              type="email"
              placeholder="your@email.com"
              autoComplete="email"
              disabled={isLoading}
              className="h-12 w-full rounded-[10px] bg-[#f2f2f4] pl-12 pr-4 text-base placeholder:text-[#828283] focus:outline-none focus:ring-2 focus:ring-[#5c8bd9] disabled:opacity-50"
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label className="text-base font-semibold text-black">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#828283] pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              autoComplete="new-password"
              disabled={isLoading}
              className="h-12 w-full rounded-[10px] bg-[#f2f2f4] pl-12 pr-12 text-base placeholder:text-[#828283] focus:outline-none focus:ring-2 focus:ring-[#5c8bd9] disabled:opacity-50"
              {...register('password')}
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#828283] hover:text-gray-700 disabled:opacity-50"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={isLoading}
            >
              {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </button>
          </div>
          <PasswordStrengthIndicator password={password} />
          <p className="text-xs text-[#828283]">
            Must be at least 8 characters with uppercase, lowercase, and numbers
          </p>
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm password */}
        <div className="flex flex-col gap-2">
          <label className="text-base font-semibold text-black">
            Confirm password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#828283] pointer-events-none" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              autoComplete="new-password"
              disabled={isLoading}
              className="h-12 w-full rounded-[10px] bg-[#f2f2f4] pl-12 pr-12 text-base placeholder:text-[#828283] focus:outline-none focus:ring-2 focus:ring-[#5c8bd9] disabled:opacity-50"
              {...register('confirmPassword')}
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#828283] hover:text-gray-700 disabled:opacity-50"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              disabled={isLoading}
            >
              {showConfirmPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms */}
        <label className="flex cursor-pointer items-start gap-2">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="h-[18px] w-[18px] cursor-pointer rounded accent-[#5c8bd9]"
          />
          <span className="text-sm font-medium text-[#4a5565]">
            <span className="text-red-500">*</span>{' '}
            I agree to the{' '}
            <Link href="/terms" className="text-[#5c8bd9] hover:underline">
              Terms and Conditions
            </Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-[#5c8bd9] hover:underline">
              Privacy Policy
            </Link>
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="flex h-12 w-full items-center justify-center rounded-[10px] bg-[#5c8bd9] text-base font-semibold text-white shadow-[0px_4px_6px_0px_rgba(0,0,0,0.1),0px_2px_4px_0px_rgba(0,0,0,0.1)] transition-colors hover:bg-[#4a7ac8] disabled:cursor-not-allowed disabled:opacity-50 sm:h-[52px] sm:text-lg"
        >
          {isLoading ? (
            <svg
              className="h-5 w-5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            'Create account'
          )}
        </button>

        {/* Divider */}
        <div className="border-t border-[#d1d5dc]" />

        {/* Log in link */}
        <p className="text-center text-base text-[#4a5565]">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[#5c8bd9] hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  )
}
