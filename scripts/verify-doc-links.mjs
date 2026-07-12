import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const routesSource = fs.readFileSync(
  path.join(root, 'projects/docs/src/app/app.routes.ts'),
  'utf8',
);
const sitemap = fs.readFileSync(path.join(root, 'projects/docs/public/sitemap.xml'), 'utf8');
const index = fs.readFileSync(path.join(root, 'projects/docs/src/index.html'), 'utf8');
const guideSource = fs.readFileSync(
  path.join(root, 'projects/docs/src/app/guides/guides.data.ts'),
  'utf8',
);
const guideRoutes = [...guideSource.matchAll(/\bslug:\s*'([^']+)'/g)].map(
  (match) => `/guides/${match[1]}`,
);
const requiredRoutes = [
  '/',
  '/docs',
  '/docs/components',
  '/docs/index',
  '/docs/charts',
  '/themes',
  '/examples',
  '/admin-starter',
  '/guides',
  '/community',
  ...guideRoutes,
];
const failures = [];

for (const route of requiredRoutes) {
  const location = `https://jrngui.dev${route}`;
  if (!sitemap.includes(`<loc>${location}</loc>`)) failures.push(`Sitemap is missing ${location}.`);
}

for (const phrase of ['canonical', 'og:title', 'twitter:card', 'application/ld+json']) {
  if (!index.includes(phrase)) failures.push(`index.html is missing ${phrase}.`);
}

for (const pathName of [
  'docs',
  'docs/components',
  'docs/index',
  'docs/charts',
  'themes',
  'examples',
  'admin-starter',
  'guides',
  'community',
]) {
  if (!routesSource.includes(`path: '${pathName}'`))
    failures.push(`Application routes are missing ${pathName}.`);
}

if (failures.length) {
  console.error('Documentation link verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(`Verified ${requiredRoutes.length} sitemap routes and SEO metadata.`);
