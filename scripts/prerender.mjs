import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import http from 'node:http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '../dist');

// Список статических роутов для пререндеринга
const routes = [
  '/',
  '/igrovye-pk-velikiy-novgorod',
  '/sborka-pk-na-zakaz-velikiy-novgorod',
  '/upgrade-pc-velikiy-novgorod',
  '/contacts',
  '/catalog/full-hd',
  '/catalog/2k',
  '/catalog/4k',
  '/catalog/rtx',
  '/catalog/ryzen',
  '/catalog/intel',
  '/blog',
  '/blog/kak-vybrat-igrovoj-pk-2026',
  '/blog/sborka-pk-dlya-cs2'
];

async function startServer() {
  return new Promise((resolve) => {
    // Простой статический сервер
    const server = http.createServer((req, res) => {
      let reqPath = req.url.split('?')[0];
      let filePath = path.join(distDir, reqPath);
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(distDir, 'index.html');
      }
      const ext = path.extname(filePath);
      const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.svg': 'image/svg+xml'
      };
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
    server.listen(0, '127.0.0.1', () => {
      resolve(server);
    });
  });
}

async function run() {
  console.log('Starting prerender...');
  if (!fs.existsSync(distDir)) {
    console.error('dist directory not found. Run vite build first.');
    process.exit(1);
  }

  const server = await startServer();
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  for (const route of routes) {
    console.log(`Prerendering ${route}...`);
    try {
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle0' }); // ждем пока загрузятся данные и отрендерится React
      
      const html = await page.content();
      
      const routePath = route === '/' ? '/index' : route;
      const outPath = path.join(distDir, `${routePath}.html`);
      const dir = path.dirname(outPath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(outPath, html);
    } catch (err) {
      console.error(`Failed to prerender ${route}:`, err);
    }
  }

  await browser.close();
  server.close();
  console.log('Prerender finished.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
