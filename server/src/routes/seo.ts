import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fs from 'node:fs';
import path from 'node:path';
import { prisma } from '../db.js';
import { config } from '../config.js';

const siteUrl = 'https://tog-pc.ru';

const staticSeoMap: Record<string, { title: string; description: string }> = {
  '/igrovye-pk-velikiy-novgorod': {
    title: 'Купить игровой ПК в Великом Новгороде 🎮 | Сборки TOGOSHOL',
    description: '✅ Купить игровой ПК в Великом Новгороде: мощные готовые сборки TOGOSHOL под Full HD, 2K и 4K. Тщательные стресс-тесты, настройка, гарантия и самовывоз.',
  },
  '/sborka-pk-na-zakaz-velikiy-novgorod': {
    title: 'Сборка ПК на заказ в Великом Новгороде 🛠️ | Под ваш бюджет',
    description: '⚡ Сборка компьютера на заказ в Великом Новгороде под игры, работу и стриминг. Индивидуальный подбор CPU, GPU, лучшего охлаждения и настройка системы под ключ.',
  },
  '/contacts': {
    title: 'Контакты TOGOSHOL - игровые ПК в Великом Новгороде',
    description: 'Контакты TOGOSHOL: консультация по игровым ПК, сборке компьютера на заказ, самовывозу в Великом Новгороде и доставке по России.',
  },
  '/upgrade-pc-velikiy-novgorod': {
    title: 'Апгрейд ПК в Великом Новгороде 🔄 | Улучшение компьютера',
    description: '🔧 Профессиональный апгрейд игрового ПК в Великом Новгороде: подбор видеокарты (GPU), процессора, памяти и SSD. Точная проверка совместимости комплектующих.',
  },
  '/catalog/full-hd': {
    title: 'Игровые ПК для Full HD в Великом Новгороде - TOGOSHOL',
    description: 'Готовые игровые ПК для Full HD: киберспорт, учеба, популярные игры и разумный бюджет. Подбор и самовывоз в Великом Новгороде.',
  },
  '/catalog/2k': {
    title: 'Игровые ПК для 2K в Великом Новгороде - TOGOSHOL',
    description: 'Сборки TOGOSHOL для 2K-гейминга: RTX/Radeon, быстрый процессор, 32GB RAM и запас под современные игры.',
  },
  '/catalog/4k': {
    title: 'Игровые ПК для 4K и стриминга в Великом Новгороде - TOGOSHOL',
    description: 'Мощные игровые ПК для 4K, стриминга, монтажа и тяжелых задач. Флагманские сборки TOGOSHOL в Великом Новгороде.',
  },
  '/catalog/rtx': {
    title: 'Игровые ПК с RTX в Великом Новгороде - TOGOSHOL',
    description: 'Игровые компьютеры с видеокартами NVIDIA RTX: готовые сборки и ПК на заказ в Великом Новгороде.',
  },
  '/catalog/ryzen': {
    title: 'Игровые ПК на Ryzen в Великом Новгороде - TOGOSHOL',
    description: 'Готовые игровые ПК и кастомные сборки на AMD Ryzen в Великом Новгороде: подбор под игры, работу и бюджет.',
  },
  '/catalog/intel': {
    title: 'Игровые ПК на Intel в Великом Новгороде - TOGOSHOL',
    description: 'Игровые компьютеры на Intel Core: готовые ПК и сборка на заказ в Великом Новгороде.',
  }
};

const DEFAULT_TITLE = 'Игровые ПК в Великом Новгороде 🚀 | Сборка на заказ | TOGOSHOL';
const DEFAULT_DESC = '🔥 Готовые игровые ПК и профессиональная сборка компьютеров на заказ в Великом Новгороде. Подбор комплектующих, стресс-тесты, идеальный кабель-менеджмент.';

export async function handleSeoHtml(request: FastifyRequest, reply: FastifyReply) {
  // Проверяем наличие пререндеренного файла
  const routePath = request.url.split('?')[0]; // Убираем query params
  const prerenderedPath = path.join(config.distDir, `${routePath === '/' ? '/index' : routePath}.html`);
  
  if (fs.existsSync(prerenderedPath)) {
    // Если страница уже пререндерена (с готовым SEO и контентом)
    const html = await fs.promises.readFile(prerenderedPath, 'utf-8');
    return reply.type('text/html').send(html);
  }

  // Фолбэк на SPA index.html
  const indexPath = path.join(config.distDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    return reply.code(404).send('Frontend build is missing. Run npm run build.');
  }

  let html = await fs.promises.readFile(indexPath, 'utf-8');

  let title = DEFAULT_TITLE;
  let description = DEFAULT_DESC;

  // Exact match for static pages
  if (staticSeoMap[request.url]) {
    title = staticSeoMap[request.url].title;
    description = staticSeoMap[request.url].description;
  } 
  // Dynamic match for products
  else if (request.url.startsWith('/pc/')) {
    const slug = request.url.split('/')[2];
    if (slug) {
      const product = await prisma.product.findFirst({
        where: { 
          deletedAt: null,
          OR: [{ slug }, { id: slug }] 
        }
      });
      if (product) {
        title = `Игровой ПК ${product.title}`;
        description = `Купить игровой ПК ${product.title} в Великом Новгороде. Процессор: ${product.cpu || 'Мощный'}, видеокарта: ${product.gpu || 'Игровая'}. Сборка от TOGOSHOL.`;
      }
    }
  }

  // Inject meta tags
  // The default index.html has:
  // <title>Игровые ПК в Великом Новгороде - TOGOSHOL</title>
  // <meta name="description" content="..." />
  // We will replace them
  
  html = html.replace(/<title>(.*?)<\/title>/i, `<title>${title}</title>`);
  html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/>/i, `<meta name="description" content="${description}" />`);
  html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/i, `<meta property="og:title" content="${title}" />`);
  html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/i, `<meta property="og:description" content="${description}" />`);
  
  return reply.type('text/html').send(html);
}

export async function registerSeoRoutes(app: FastifyInstance) {
  app.get('/sitemap.xml', async (request, reply) => {
    const products = await prisma.product.findMany({
      where: { deletedAt: null, status: { in: ['available', 'preorder'] } },
      select: { id: true, slug: true, updatedAt: true }
    });
    
    const urls = [
      { loc: siteUrl + '/', priority: 1.0 },
      ...Object.keys(staticSeoMap).map(p => ({ loc: siteUrl + p, priority: 0.8 })),
    ];
    
    for (const p of products) {
      const pSlug = p.slug || p.id;
      if (pSlug) {
        urls.push({
          loc: `${siteUrl}/pc/${pSlug}`,
          priority: 0.9
        });
      }
    }
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>weekly</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return reply.type('application/xml').send(xml);
  });
}
