// Tiny helpers around Astro's built-in i18n routing + the message tree in
// `ui.ts`.  Mirrors the convention in Astro's official i18n recipe
// (https://docs.astro.build/en/recipes/i18n/) so it reads naturally to
// any Astro developer who's already seen the docs.

import { ui, defaultLang, type Lang, type TranslationKey } from './ui'

/** Extract the locale from a URL, falling back to the default. */
export function getLangFromUrl (url: URL): Lang {
  const [, lang] = url.pathname.split('/')
  if (lang && lang in ui) return lang as Lang
  return defaultLang
}

/**
 * Returns a `t()` function bound to a given locale.  Pass values to
 * interpolate `{name}`-style placeholders:
 *
 *   const t = useTranslations(lang)
 *   t('index.title', { name: 'Astro' })
 */
export function useTranslations (lang: Lang) {
  return function t (
    key: TranslationKey,
    values?: Record<string, string | number>
  ): string {
    const raw: string = ui[lang][key] ?? ui[defaultLang][key] ?? key
    if (!values) return raw
    return raw.replace(/\{(\w+)\}/g, (_, k: string) =>
      values[k] !== undefined ? String(values[k]) : `{${k}}`
    )
  }
}
