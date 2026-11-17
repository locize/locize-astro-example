import i18next, { type Namespace } from 'i18next'

// Every file locize-cli downloads: ./locales/{lng}/{ns}.json
const files = import.meta.glob<{ default: Record<string, string> }>('./locales/*/*.json', { eager: true })

const resources: Record<string, Record<string, Record<string, string>>> = {}
for (const [path, mod] of Object.entries(files)) {
  const [, lng, ns] = path.match(/\.\/locales\/([^/]+)\/([^/]+)\.json$/)!
  resources[lng] ??= {}
  resources[lng][ns] = mod.default
}

export const languages = { en: 'English', de: 'Deutsch' } as const
export type Lang = keyof typeof languages
export const defaultLang: Lang = 'en'

// An instance of its own, apart from any island that uses i18next in the browser.
const i18n = i18next.createInstance()
i18n.init({
  resources, // bundled, so init finishes right away
  fallbackLng: defaultLang,
  defaultNS: 'common',
  interpolation: { escapeValue: false } // Astro escapes what {t(...)} renders
})

// A t() bound to one language (and optionally one namespace).
export const getT = <N extends Namespace>(lang: Lang, ns?: N) => i18n.getFixedT(lang, ns)

// The same page in another language: swap the /{lang}/ prefix.
// "/en/second/" → "/de/second/"
export function pathForLang (pathname: string, target: Lang): string {
  const parts = pathname.split('/')
  parts[1] = target
  return parts.join('/')
}
