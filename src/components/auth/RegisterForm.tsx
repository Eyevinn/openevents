'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from 'next-intl'

function PasswordStrengthIndicator({ password }: { password: string }) {
  const t = useTranslations('auth.register')

  const getStrength = (pass: string): { score: number; label: string; color: string } => {
    let score = 0
    if (pass.length >= 8) score++
    if (pass.length >= 12) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[a-z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++

    if (score <= 2) return { score: 1, label: t('strengthWeak'), color: 'bg-red-500' }
    if (score <= 4) return { score: 2, label: t('strengthFair'), color: 'bg-yellow-500' }
    if (score <= 5) return { score: 3, label: t('strengthGood'), color: 'bg-blue-500' }
    return { score: 4, label: t('strengthStrong'), color: 'bg-green-500' }
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
        {t('passwordStrengthLabel', { strength: strength.label })}
      </p>
    </div>
  )
}

export function RegisterForm() {
  const router = useRouter()
  const t = useTranslations('auth.register')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'ATTENDEE',
    },
  })

  const role = watch('role', 'ATTENDEE')
  const password = watch('password', '')

  const onSubmit = async (data: RegisterInput) => {
    if (!acceptedTerms) {
      setError(t('acceptTermsError'))
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
        setError(result.message || t('registrationFailed'))
        return
      }

      setSuccess(true)
    } catch {
      setError(t('unexpectedError'))
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-green-600">{t('checkEmailTitle')}</CardTitle>
          <CardDescription className="text-center">
            {t('checkEmailSubtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-600">
              {t('verificationInstructions')}
            </p>
            <p className="text-sm text-gray-500">
              {t('linkExpiry')}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push('/login')}
          >
            {t('goToLogin')}
          </Button>
          <p className="text-sm text-center text-gray-500">
            {t('didntReceive')}{' '}
            <Link href="/verify-email" className="text-blue-600 hover:underline">
              {t('resendVerification')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="space-y-0">
      <div className="relative z-10 -mb-px grid grid-cols-2 gap-1 px-2">
        <button
          type="button"
          onClick={() => setValue('role', 'ATTENDEE', { shouldValidate: true })}
          className="relative h-[112px] w-full text-left"
        >
          <div
            className={`absolute inset-x-0 bottom-0 rounded-t-[1.75rem] border px-6 text-left transition-all duration-200 ${
              role === 'ATTENDEE'
                ? 'top-0 z-20 border-gray-300 border-b-white bg-white py-6 text-gray-900 shadow-[0_14px_30px_-16px_rgba(17,24,39,0.35)]'
                : 'top-3 z-10 border-gray-300 bg-gray-100 py-4 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <p className="text-3xl font-semibold leading-tight tracking-tight">{t('attendeeTab')}</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setValue('role', 'ORGANIZER', { shouldValidate: true })}
          className="relative h-[112px] w-full text-left"
        >
          <div
            className={`absolute inset-x-0 bottom-0 rounded-t-[1.75rem] border px-6 text-left transition-all duration-200 ${
              role === 'ORGANIZER'
                ? 'top-0 z-20 border-gray-300 border-b-white bg-white py-6 text-gray-900 shadow-[0_14px_30px_-16px_rgba(17,24,39,0.35)]'
                : 'top-3 z-10 border-gray-300 bg-gray-100 py-4 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <p className="text-3xl font-semibold leading-tight tracking-tight">{t('organizerTab')}</p>
          </div>
        </button>
      </div>
      <Card className="relative z-20 rounded-t-none rounded-b-[1.75rem] border border-t-0 border-gray-300 shadow-xl">
      <CardHeader className="space-y-2 pt-9">
        <CardTitle className="text-3xl text-center font-semibold tracking-tight">{t('title')}</CardTitle>
        <CardDescription className="text-center text-base">
          {role === 'ORGANIZER' ? t('organizerDescription') : t('attendeeDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('role')} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" required>{t('firstNameLabel')}</Label>
              <Input
                id="firstName"
                placeholder={t('firstNamePlaceholder')}
                autoComplete="given-name"
                disabled={isLoading}
                error={errors.firstName?.message}
                required
                {...register('firstName')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" required>{t('lastNameLabel')}</Label>
              <Input
                id="lastName"
                placeholder={t('lastNamePlaceholder')}
                autoComplete="family-name"
                disabled={isLoading}
                error={errors.lastName?.message}
                required
                {...register('lastName')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" required>{t('emailLabel')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('emailPlaceholder')}
              autoComplete="email"
              disabled={isLoading}
              error={errors.email?.message}
              required
              {...register('email')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" required>{t('passwordLabel')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                disabled={isLoading}
                error={errors.password?.message}
                required
                className="pr-10"
                {...register('password')}
              />
              <button
                type="button"
                className="absolute right-3 top-5 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                disabled={isLoading}
              >
                {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </div>
            <PasswordStrengthIndicator password={password} />
            <p className="text-xs text-gray-500">
              {t('passwordHint')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" required>{t('confirmPasswordLabel')}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                disabled={isLoading}
                error={errors.confirmPassword?.message}
                required
                className="pr-10"
                {...register('confirmPassword')}
              />
              <button
                type="button"
                className="absolute right-3 top-5 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                onClick={() => setShowConfirmPassword((value) => !value)}
                aria-label={showConfirmPassword ? t('hideConfirmPassword') : t('showConfirmPassword')}
                disabled={isLoading}
              >
                {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="terms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              {t('termsAgreement')} <span className="text-red-500">*</span>{' '}
              <Link href="/terms" className="text-blue-600 hover:underline">
                {t('termsOfService')}
              </Link>{' '}
              {t('and')}{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                {t('privacyPolicy')}
              </Link>
            </label>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            {t('submitButton')}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center text-gray-500">
          {t('alreadyHaveAccount')}{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            {t('signInLink')}
          </Link>
        </div>
      </CardFooter>
      </Card>
    </div>
  )
}
