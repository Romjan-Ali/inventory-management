// frontend/src/pages/Auth/Login.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { API_BASE_URL } from '@/lib/constants'

export default function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useTranslation()

  const handleSocialLogin = (provider: 'google' | 'github') => {
    setIsLoading(true)
    window.location.href = `${API_BASE_URL}/api/auth/social/${provider}`
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-foreground">
          {t('loginTitle')}
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="space-y-3">
          {/* Google Login */}
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading}
            className="flex w-full justify-center items-center gap-3 rounded-md bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0 disabled:opacity-50 transition-colors duration-200"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {t('continueWithGoogle')}
          </button>

          {/* GitHub Login */}
          <button
            onClick={() => handleSocialLogin('github')}
            disabled={isLoading}
            className="flex w-full justify-center items-center gap-3 rounded-md bg-gray-900 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline-offset-0 disabled:opacity-50 transition-colors duration-200"
          >
            <svg
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 .5C5.648.5.5 5.648.5 12.001c0 5.095 3.292 9.418 7.865 10.95.575.105.786-.25.786-.554 
                0-.274-.01-1.002-.015-1.967-3.2.696-3.878-1.543-3.878-1.543-.523-1.327-1.277-1.68-1.277-1.68-1.045-.715.08-.7.08-.7 
                1.157.082 1.767 1.188 1.767 1.188 1.028 1.761 2.698 1.253 3.356.958.105-.745.402-1.253.73-1.54-2.553-.29-5.236-1.276-5.236-5.68 
                0-1.255.45-2.282 1.188-3.087-.12-.29-.516-1.454.112-3.034 0 0 .967-.31 3.17 1.178a10.993 10.993 0 0 1 2.886-.389 
                10.97 10.97 0 0 1 2.885.389c2.203-1.488 3.168-1.178 3.168-1.178.63 1.58.234 2.744.114 3.034.74.805 1.187 1.832 
                1.187 3.087 0 4.416-2.688 5.387-5.25 5.672.413.357.78 1.062.78 2.142 0 1.546-.014 2.79-.014 3.17 0 .306.208.664.792.552 
                4.57-1.534 7.86-5.855 7.86-10.948C23.5 5.648 18.352.5 12 .5z"
              />
            </svg>
            {t('continueWithGithub')}
          </button>
        </div>

        <p className="mt-10 text-center text-sm text-gray-500">
          {t('noAccount')}{' '}
          <Link
            to="/login"
            className="font-semibold leading-6 text-primary hover:text-primary/80"
          >
            {t('signupWithSocial')}
          </Link>
        </p>
      </div>
    </div>
  )
}