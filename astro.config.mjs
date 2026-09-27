// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { business } from './src/config/business.ts';

// The site address comes from business.websiteUrl (the single source).
// CI may set SITE_URL for GitHub Pages builds; an empty value counts as unset.
const site = process.env.SITE_URL || business.websiteUrl;
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  output: 'static',
  site,
  base,
  trailingSlash: 'ignore',
  build: {
    inlineStylesheets: 'always',
  },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
