// Assemble the per-locale message tree from the namespaced JSON files
// produced by `locize-cli download`.  Each Locize namespace becomes a key
// prefix at module-load time, so callers can do `t('common.headTitle')`
// without thinking about the on-disk layout.

import enCommon from './locales/en/common.json' with { type: 'json' }
import enIndex from './locales/en/index.json' with { type: 'json' }
import enSecond from './locales/en/second.json' with { type: 'json' }
import deCommon from './locales/de/common.json' with { type: 'json' }
import deIndex from './locales/de/index.json' with { type: 'json' }
import deSecond from './locales/de/second.json' with { type: 'json' }

type Messages = Record<string, string>

function prefix (ns: string, obj: Messages): Messages {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [`${ns}.${k}`, v])
  )
}

export const ui = {
  en: { ...prefix('common', enCommon), ...prefix('index', enIndex), ...prefix('second', enSecond) },
  de: { ...prefix('common', deCommon), ...prefix('index', deIndex), ...prefix('second', deSecond) }
} as const

export const defaultLang = 'en'

// Human-readable labels for the language picker.
export const languages = {
  en: 'English',
  de: 'Deutsch'
} as const

export type Lang = keyof typeof ui
export type TranslationKey = keyof typeof ui[typeof defaultLang]
