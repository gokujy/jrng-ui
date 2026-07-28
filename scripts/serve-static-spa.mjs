import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';

const root = resolve(process.argv[2] || 'dist/docs/browser');
const port = Number(process.argv[3] || 4300);
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

if (!existsSync(resolve(root, 'index.html'))) {
  throw new Error(`Static application was not found in ${root}. Build the docs first.`);
}

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
  const candidate = resolve(root, `.${pathname}`);
  const safeCandidate = candidate === root || candidate.startsWith(`${root}${sep}`);
  const file =
    safeCandidate && existsSync(candidate) && statSync(candidate).isFile()
      ? candidate
      : resolve(root, 'index.html');

  response.setHeader('Content-Type', contentTypes[extname(file)] || 'application/octet-stream');
  createReadStream(file).pipe(response);
}).listen(port, '127.0.0.1');
