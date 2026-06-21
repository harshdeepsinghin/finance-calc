import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { generateSitemapUrls } from './src/data/popularCombinations.js';

const siteUrl = 'https://moneyinfuture.com';
const customSitemapPages = generateSitemapUrls(siteUrl);

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  build: {
    format: 'file',
    inlineStylesheets: 'always'
  },
  integrations: [
    sitemap({
      customPages: customSitemapPages
    })
  ]
});

