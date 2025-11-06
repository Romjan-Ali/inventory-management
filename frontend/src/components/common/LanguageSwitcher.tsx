import { useTranslation } from 'react-i18next'

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation()

  const changeLanguage = (lng: 'en' | 'bn') => {
    void i18n.changeLanguage(lng)
    try {
      localStorage.setItem('lang', lng)
      document.documentElement.lang = lng
    } catch {}
  }

  const current = (i18n.resolvedLanguage || 'en') as 'en' | 'bn'

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="lang" className="text-sm hidden md:inline">
        {t('language')}
      </label>
      <select
        id="lang"
        value={current}
        onChange={(e) => changeLanguage(e.target.value as 'en' | 'bn')}
        className="h-8 rounded-md border bg-background px-2 text-sm"
        aria-label={t('language')}
      >
        <option value="en">{t('english')}</option>
        <option value="bn">{t('bangla')}</option>
      </select>
    </div>
  )
}


