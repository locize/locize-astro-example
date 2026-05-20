# Astro 6 + [Locize](https://www.locize.com/?from=locize-astro-example) example

A minimal **Astro 6** sample showing how to manage translations for an
Astro site with [Locize](https://www.locize.com/?from=locize-astro-example)
as the translation backend, using Astro's **built-in i18n routing** and
build-time JSON sync via
[`locize-cli`](https://github.com/locize/locize-cli) — no runtime
dependencies, no extra framework, no peer-dep chain.

Companion blog post: pending (will link from
[locize.com/blog](https://www.locize.com/blog) once published).

Stack: Astro 6.3 · Node 22+ · `locize-cli` 12.1 · TypeScript 5.

> This example uses the **Standard** Locize CDN
> (`api.lite.locize.app` — BunnyCDN, free, the default for new projects).
> If your project is on the **Pro** CDN (`api.locize.app`, CloudFront,
> paid), change `--cdn-type=standard` to `--cdn-type=pro` in the
> `downloadLocales` / `syncLocales` scripts in
> [`package.json`](package.json). See
> [CDN types: Standard vs. Pro](https://www.locize.com/docs/integration/cdn-types-standard-vs-pro?from=locize-astro-example).

> Companion examples on adjacent SSR-flavoured frameworks:
> [`locize-nuxt-example`](https://github.com/locize/locize-nuxt-example)
> (Nuxt 4 + @nuxtjs/i18n + vue-i18n),
> [`locize-react-router-example`](https://github.com/locize/locize-react-router-example)
> (React Router v7 framework mode + remix-i18next). All three share the
> same bundle-at-build-time-from-Locize shape; Astro is the simplest
> because the i18n logic is just file-based lookups.

## Why this is short

Astro's built-in i18n is **routing-only**: it owns URL prefixing
(`/en/`, `/de/`), the `Astro.currentLocale` helper, and the SEO
`<link rel="alternate" hreflang>` tags. It does **not** ship a
translation function (`t()`), pluralization, or message interpolation —
the official [i18n recipe](https://docs.astro.build/en/recipes/i18n/)
shows the standard pattern: import a per-locale JSON file and write
five lines of helper.

So the Locize integration here doesn't fight any framework
abstraction. `locize-cli` downloads the latest published JSON from
Locize into `src/i18n/locales/{lng}/{ns}.json`, the helpers in
`src/i18n/ui.ts` + `src/i18n/utils.ts` assemble those into a flat
lookup tree, and Astro's static build picks them up at compile time.
That's it — no client-side runtime, no SSR considerations, no
hydration mismatches.

## Getting started

1. Create a free account and a project at
   [www.locize.com](https://www.locize.com/?from=locize-astro-example).
   When the new-project wizard asks for an **i18n format**, pick
   **i18next JSON v4** (the default).
2. Copy [`.env.example`](.env.example) to `.env` and paste your
   project id (from your Locize project's _Settings_ panel) into
   `LOCIZE_PROJECT_ID`. For the optional `npm run syncLocales` flow,
   also paste a write-enabled API key into `LOCIZE_API_KEY`. **Never
   commit `.env`** — it's already in `.gitignore`.
3. Install dependencies and run the dev server:

   ```sh
   npm install
   npm run dev
   ```

   The site is available at `http://localhost:4321/en/` and
   `http://localhost:4321/de/`.

## Project layout

```
locize-astro-example/
├── astro.config.mjs            — Astro's built-in i18n config
├── package.json                — locize-cli download/sync scripts
└── src/
    ├── pages/
    │   ├── index.astro         — root /, redirects to /en/
    │   └── [lang]/
    │       ├── index.astro     — home, renders for each locale via getStaticPaths
    │       └── second.astro    — secondary page, same pattern
    ├── layouts/
    │   └── Layout.astro        — shared <html>/<head>/<body>
    ├── components/
    │   └── LanguagePicker.astro — swaps the /{lang}/ prefix
    └── i18n/
        ├── ui.ts               — assembles namespaced JSON into a flat tree
        ├── utils.ts            — getLangFromUrl + useTranslations helpers
        └── locales/            — locize-cli download target (one JSON per ns)
            ├── en/
            │   ├── common.json
            │   ├── index.json
            │   └── second.json
            └── de/
                ├── common.json
                ├── index.json
                └── second.json
```

## How translations sync

The example ships with seed JSON files so it works out of the box.
When you're ready to pull from your Locize project, run:

```sh
npm run downloadLocales
```

That invokes
[`locize-cli`](https://github.com/locize/locize-cli)'s `download`
command with the `--clean=true` flag, so deleted keys in Locize are
removed locally too. The script is wired in [`package.json`](package.json):

```json
{
  "downloadLocales": "locize download --project-id=$LOCIZE_PROJECT_ID --ver=latest --cdn-type=standard --clean=true --path=./src/i18n/locales"
}
```

Make `npm run downloadLocales` a `prebuild` hook (or run it from CI
before `astro build`) so the bundled JSON is always fresh.

## Pushing new keys back to Locize

There are three ways to land newly-added strings in your Locize
project; pick whichever matches your workflow.

1. **`npm run syncLocales`** — uploads any keys present locally but
   missing in Locize. The script is wired in `--dry=true` mode so you
   can see what it would do; drop the flag to actually push.
2. **Static extraction** via
   [`i18next-cli`](https://github.com/i18next/i18next-cli) — scans
   your `.astro` sources for `t('…')` calls, writes new keys into
   `src/i18n/locales/en/*.json`, then `syncLocales` ships them to
   Locize.
3. **The Locize web app** — add keys manually in the editor and pull
   them down with `downloadLocales` before the next build.

There is intentionally **no runtime `saveMissing`** in this example.
Astro pages are pre-rendered at build time, so a runtime push from
production users isn't possible without an SSR adapter — and even
then, Astro discourages writes from the static layer. If you want
`saveMissing`-style flow, it lives inside any
React/Vue/Svelte/Solid/Preact island you add via `@astrojs/<framework>`
that uses `i18next-locize-backend` directly. See the
[React Router v7 example](https://github.com/locize/locize-react-router-example)
for that shape.

## The `t()` function

```ts
// src/i18n/utils.ts (excerpt)
import { ui, defaultLang, type Lang, type TranslationKey } from './ui'

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
```

Five lines of logic — fallback to default locale, fallback to key if
both miss, simple `{name}` interpolation. The keys are namespaced via
the on-disk layout (`common.json` → `common.*`, `index.json` → `index.*`)
and assembled into a flat tree at module load in
[`src/i18n/ui.ts`](src/i18n/ui.ts). The `TranslationKey` type is
derived from the default-locale tree, so TypeScript autocompletes keys
in `.astro` files.

## What this example does NOT do

- **No runtime saveMissing** — see above. Astro static builds can't
  push, and an SSR Astro app would do this from inside an island, not
  from the static layer.
- **No in-context editing overlay** — the
  [`locize`](https://github.com/locize/locize) editor needs a DOM that
  re-renders when the editor updates a string. Astro's static output
  doesn't have that hook. If you need in-context editing, mount any
  framework island (React, Vue, Svelte) and wire `locize` inside it.
- **No live CDN fetch** — translations are bundled at build time. To
  serve a fresh translation, run `npm run downloadLocales` and
  redeploy. This matches Astro's "static-first" model and keeps the
  build artifact self-contained.

## Related

- [Locize platform docs](https://www.locize.com/docs?from=locize-astro-example)
- [Astro built-in i18n routing](https://docs.astro.build/en/guides/internationalization/)
- [Astro i18n recipe](https://docs.astro.build/en/recipes/i18n/) — the
  build-it-yourself pattern this example layers on top of.
- [`locize-cli`](https://github.com/locize/locize-cli) — the build-time
  sync tool.
- [How to internationalize a React Router v7 app with remix-i18next](https://www.locize.com/blog/react-router-i18next?from=locize-astro-example)
  ([blog walkthrough](https://www.locize.com/blog/react-router-i18next?from=locize-astro-example))
- [How to internationalize a Nuxt 4 app with @nuxtjs/i18n and Locize](https://www.locize.com/blog/nuxt-i18n?from=locize-astro-example)
  ([blog walkthrough](https://www.locize.com/blog/nuxt-i18n?from=locize-astro-example))
