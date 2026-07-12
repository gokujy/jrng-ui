import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const guideSource = fs.readFileSync(path.join(root, 'projects/docs/src/app/guides/guides.data.ts'), 'utf8');
const guideSlugs = [...guideSource.matchAll(/\bslug:\s*'([^']+)'/g)].map((match) => match[1]);
const routes = ['/', '/docs', '/docs/components', '/docs/index', '/docs/charts', '/themes', '/examples', '/admin-starter', '/guides', '/community', ...guideSlugs.map((slug) => `/guides/${slug}`)];
const entries = routes.map((route) => `  <url><loc>https://jrngui.dev${route}</loc></url>`).join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
fs.writeFileSync(path.join(root, 'projects/docs/public/sitemap.xml'), sitemap);
console.log(`Generated sitemap with ${routes.length} routes.`);
