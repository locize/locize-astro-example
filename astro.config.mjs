// @ts-check
import { defineConfig } from 'astro/config'

export default defineConfig({
  // Astro's built-in i18n routing. Docs: https://docs.astro.build/en/guides/internationalization/
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
    routing: {
      // Every locale gets a URL prefix (/en/, /de/) — uniform, SEO-clean,
      // and works well with dynamic `[lang]/` routes + getStaticPaths.
      prefixDefaultLocale: true
    }
  }
})
