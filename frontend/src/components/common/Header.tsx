// frontend/src/components/common/Header.tsx
import { Link } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { logout } from '@/features/auth/authSlice'
import SearchBox from './SearchBox'
import { LogOut, User, Menu, X, Search } from 'lucide-react'
import { ModeToggle } from './ModeToggler'
import LanguageSwitcher from './LanguageSwitcher'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

export default function Header() {
  const dispatch = useAppDispatch()
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const { t } = useTranslation()

  const handleLogout = () => {
    dispatch(logout())
    localStorage.removeItem('token')
    setIsMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch)
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            {isAuthenticated && (
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 hover:bg-accent rounded-md transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            )}

            {/* Logo */}
            <Link
              to="/"
              className="flex items-center space-x-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="h-8 w-8 bg-primary rounded-lg" />
              <span className="font-bold text-xl">{t('appName')}</span>
            </Link>
          </div>

          {/* Search Box - Desktop */}
          {isAuthenticated && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <SearchBox />
            </div>
          )}

          {/* Mobile Search Button */}
          {isAuthenticated && (
            <button
              onClick={toggleMobileSearch}
              className="md:hidden p-2 hover:bg-accent rounded-md transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  {t('dashboard')}
                </Link>
                <LanguageSwitcher />
                <ModeToggle />
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm hidden xl:block">{user?.name}</span>
                  <span className="text-sm xl:hidden">
                    {user?.name?.split(' ')[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-accent rounded-md transition-colors"
                  title={t('logout')}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  className="hover:bg-accent rounded-md transition-colors"
                  title={t('toggleTheme')}
                >
                  <ModeToggle />
                </button>
                <LanguageSwitcher />
                <Link
                  to="/login"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  {t('signIn')}
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Theme Toggle for non-authenticated users */}
          {!isAuthenticated && (
            <button
              className="lg:hidden hover:bg-accent rounded-md transition-colors"
              title={t('toggleTheme')}
            >
              <ModeToggle />
            </button>
          )}
        </div>

        {/* Mobile Search Box */}
        {isAuthenticated && showMobileSearch && (
          <div className="md:hidden py-3 border-t">
            <SearchBox />
          </div>
        )}

        {/* Mobile Menu */}
        {isAuthenticated && isMobileMenuOpen && (
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-background border-b shadow-lg">
            <div className="container mx-auto px-4 py-4">
              {/* User Info */}
              <div className="flex items-center space-x-3 pb-4 mb-4 border-b">
                <User className="h-5 w-5" />
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-3">
                <Link
                  to="/dashboard"
                  className="block py-2 px-3 text-sm font-medium transition-colors hover:text-primary hover:bg-accent rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('dashboard')}
                </Link>

                <Link
                  to="/inventories"
                  className="block py-2 px-3 text-sm font-medium transition-colors hover:text-primary hover:bg-accent rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('myInventories')}
                </Link>

                <Link
                  to="/profile"
                  className="block py-2 px-3 text-sm font-medium transition-colors hover:text-primary hover:bg-accent rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('profile')}
                </Link>

                {/* Theme Toggle in Mobile Menu */}
                <div className="flex items-center justify-between py-2 px-3">
                  <span className="text-sm font-medium">{t('theme')}</span>
                  <div className="flex items-center gap-2">
                    <LanguageSwitcher />
                    <ModeToggle />
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 py-2 px-3 text-sm font-medium transition-colors hover:text-primary hover:bg-accent rounded-md text-left"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t('logout')}</span>
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
