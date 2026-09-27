// Blocks Netlify/Cloudflare deploys while websiteUrl is still the placeholder.
// Those hosts get no SITE_URL from CI, so the canonical link and search listing would be wrong.
import { business } from '../src/config/business.ts';

if (business.websiteUrl.includes('example.com')) {
  console.error('\nSet websiteUrl in src/config/business.ts before deploying (it is still https://www.example.com).\n');
  process.exit(1);
}
console.log(`Deploying for ${business.websiteUrl}`);
