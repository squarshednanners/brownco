import type { APIRoute } from 'astro';

// robots.txt is generated from Astro's `site` (which comes from business.websiteUrl),
// so the domain is never hard-coded here.
export const GET: APIRoute = ({ site }) => {
  const root = new URL(import.meta.env.BASE_URL, site);
  const sitemap = new URL('sitemap-index.xml', root);
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemap.href}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
