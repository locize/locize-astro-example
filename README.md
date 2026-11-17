# Astro 7 + [i18next](https://www.i18next.com) + [Locize](https://www.locize.com/?from=locize-astro-example) example

A minimal **Astro 7** sample showing how to manage translations for an
Astro site with [Locize](https://www.locize.com/?from=locize-astro-example)
as the translation backend: Astro's **built-in i18n routing** for the
URLs, [i18next](https://www.i18next.com) for `t()`, plurals and
interpolation at build time, and build-time JSON sync via
[`locize-cli`](https://github.com/locize/locize-cli). The static build
sends no JavaScript to the browser.

Companion blog post:
[How to internationalize an Astro site with i18next and Locize](https://www.locize.com/blog/astro-i18n?from=locize-astro-example).

Stack: Astro 7.4 · Node 22.23.4+ · i18next 27 · `locize-cli` 12.10 · TypeScript 5.

> This example uses the **Standard** Locize CDN
> (`api.lite.locize.app`, BunnyCDN, free, the default for new projects).
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
> because i18next only runs while the pages are built.

## How it fits together

Astro's built-in i18n is **routing-only**: it owns URL prefixing
(`/en/`, `/de/`), the `Astro.currentLocale` helper and URL helpers
such as `getRelativeLocaleUrl`. It does **not** ship a translation
function (`t()`), pluralization, message interpolation or hreflang
tags.

i18next fills that gap at build time. `locize-cli` downloads the
latest published JSON from Locize into
`src/i18n/locales/{lng}/{ns}.json`, [`src/i18n/index.ts`](src/i18n/index.ts)
loads every file found there into i18next (one namespace per file),
and each page gets a `t()` for its language with `getFixedT`. Astro's
static build renders every language to plain HTML: no client-side
runtime, no SSR considerations, no hydration mismatches. The layout
writes the `<link rel="alternate" hreflang>` tags (set `site` in
`astro.config.mjs` to your domain).

## Getting started

1. Create a free account and a project at
   [www.locize.com](https://www.locize.com/?from=locize-astro-example).
   When the new-project wizard asks for an **i18n format**, pick
   **i18next JSON v4** (the default).
2. Copy [`.env.example`](.env.example) to `.env` and paste your
   project id (from your Locize project's _Settings_ panel) into
   `LOCIZE_PROJECT_ID`. For the optional `npm run syncLocales` flow,
   also paste a write-enabled API key into `LOCIZE_API_KEY`. **Never
   commit `.env`**; it's already in `.gitignore`.
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
├── astro.config.mjs            # Astro's built-in i18n config + site
├── package.json                # locize-cli download/sync scripts
└── src/
    ├── pages/
    │   ├── index.astro         # root /, redirects to /en/
    │   └── [lang]/
    │       ├── index.astro     # home, renders for each locale via getStaticPaths
    │       └── second.astro    # secondary page, same pattern
    ├── layouts/
    │   └── Layout.astro        # shared <html>/<head>/<body>
    ├── components/
    │   └── LanguagePicker.astro # swaps the /{lang}/ prefix
    └── i18n/
        ├── index.ts            # loads the JSON into i18next; getT + pathForLang
        └── locales/            # locize-cli download target (one JSON per ns)
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

1. **`npm run syncLocales`**: uploads any keys present locally but
   missing in Locize. The script is wired in `--dry=true` mode so you
   can see what it would do; drop the flag to actually push.
2. **Static extraction** via
   [`i18next-cli`](https://github.com/i18next/i18next-cli): it finds
   `t('…')` calls in `.js`/`.ts`/`.jsx`/`.tsx` files and writes new
   keys into `src/i18n/locales/en/*.json`, then `syncLocales` ships
   them to Locize. `.astro` files need an i18next-cli plugin.
3. **The Locize web app**: add keys manually in the editor and pull
   them down with `downloadLocales` before the next build.

There is intentionally **no runtime `saveMissing`** in this example.
Astro pages are pre-rendered at build time, so a runtime push from
production users isn't possible without an SSR adapter, and even
then, Astro discourages writes from the static layer. If you want
`saveMissing`-style flow, it lives inside any
React/Vue/Svelte/Solid/Preact island you add via `@astrojs/<framework>`
that uses `i18next-locize-backend` directly. See the
[React Router v7 example](https://github.com/locize/locize-react-router-example)
for that shape.

## The `t()` function

```astro
---
// src/pages/[lang]/index.astro (excerpt)
import { getT, type Lang } from '../../i18n'
const { lang } = Astro.params as { lang: Lang }
const t = getT(lang, 'index')
---
<h1>{t('title', { name: 'Astro' })}</h1>
<p>{t('loaves', { count: 3 })}</p>
```

`t()` is i18next's: `{{name}}` interpolation and `_one` / `_other`
plurals in the i18next JSON v4 format Locize stores by default,
fallback to the default language, keys from other namespaces with a
prefix (`t('common:headTitle')`). Typed keys are available through
i18next's [TypeScript support](https://www.i18next.com/overview/typescript).

## What this example does NOT do

- **No runtime saveMissing**: see above. Astro static builds can't
  push, and an SSR Astro app would do this from inside an island, not
  from the static layer.
- **No in-context editing overlay**: the
  [`locize`](https://github.com/locize/locize) editor needs a DOM that
  re-renders when the editor updates a string. Astro's static output
  doesn't have that hook. If you need in-context editing, mount any
  framework island (React, Vue, Svelte) and wire `locize` inside it.
- **No live CDN fetch**: translations are bundled at build time. To
  serve a fresh translation, run `npm run downloadLocales` and
  redeploy. This matches Astro's "static-first" model and keeps the
  build artifact self-contained.

## Related

- [Locize platform docs](https://www.locize.com/docs?from=locize-astro-example)
- [Astro built-in i18n routing](https://docs.astro.build/en/guides/internationalization/)
- [i18next documentation](https://www.i18next.com): `t()`, plurals,
  interpolation, TypeScript.
- [`locize-cli`](https://github.com/locize/locize-cli): the build-time
  sync tool.
- [How to internationalize a React Router v7 app with remix-i18next](https://www.locize.com/blog/react-router-i18next?from=locize-astro-example)
  ([blog walkthrough](https://www.locize.com/blog/react-router-i18next?from=locize-astro-example))
- [How to internationalize a Nuxt 4 app with @nuxtjs/i18n and Locize](https://www.locize.com/blog/nuxt-i18n?from=locize-astro-example)
  ([blog walkthrough](https://www.locize.com/blog/nuxt-i18n?from=locize-astro-example))
