import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { extname, join, normalize, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE_PATH = '/flavora/';
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

function isPublicFile(filePath) {
  const path = filePath.split(sep).join('/');
  if (path.split('/').some((part) => part.startsWith('.'))) return false;
  return (
    path === 'index.html' ||
    /^scripts\/.+\.js$/.test(path) ||
    /^styles\/.+\.css$/.test(path) ||
    /^assets\/.+\.(svg|webp|png|jpg|woff2)$/.test(path)
  );
}

export function startServer({ port = 5510, root = process.cwd(), host = '127.0.0.1' } = {}) {
  const rootDir = resolve(root);

  const server = createServer(async (request, response) => {
    const url = new URL(request.url, 'http://localhost');
    if (url.pathname === '/' || url.pathname === BASE_PATH.slice(0, -1)) {
      response.writeHead(302, { Location: BASE_PATH });
      response.end();
      return;
    }
    if (!url.pathname.startsWith(BASE_PATH)) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found outside the project base path');
      return;
    }

    const relativePath = decodeURIComponent(url.pathname.slice(BASE_PATH.length)) || 'index.html';
    const filePath = normalize(join(rootDir, relativePath));
    if (filePath !== rootDir && !filePath.startsWith(rootDir + sep)) {
      response.writeHead(403);
      response.end();
      return;
    }

    try {
      const info = await stat(filePath);
      const target = info.isDirectory() ? join(filePath, 'index.html') : filePath;
      const [canonicalRoot, canonicalTarget] = await Promise.all([
        realpath(rootDir),
        realpath(target),
      ]);
      if (
        !isPublicFile(relative(rootDir, target)) ||
        !isPublicFile(relative(canonicalRoot, canonicalTarget))
      ) {
        response.writeHead(404);
        response.end();
        return;
      }
      const type = MIME_TYPES[extname(target).toLowerCase()] ?? 'application/octet-stream';
      response.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
      createReadStream(target).pipe(response);
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
    }
  });

  return new Promise((resolveServer) => {
    server.listen(port, host, () => resolveServer(server));
  });
}

function readOption(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : process.argv[index + 1];
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(readOption('port', process.env.PORT ?? 5510));
  const host = readOption('host', '127.0.0.1');
  await startServer({ port, host, root: readOption('root', process.cwd()) });
  process.stdout.write(`Flavora: http://${host}:${port}${BASE_PATH}\n`);
}
