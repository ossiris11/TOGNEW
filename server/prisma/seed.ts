import { PrismaClient } from '@prisma/client';
import { vkProducts } from '../../src/data/vkProducts.ts';
import { getProductDetails, getProductViews, parsePriceValue } from '../../src/lib/products.ts';
import { hashPassword } from '../src/security.ts';

const prisma = new PrismaClient();
const seedAdminPassword = process.env.ADMIN_PASSWORD || '1111000010';

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/ё/g, 'e')
    .replace(/[^a-z0-9а-я]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

function classFromTier(tier: string) {
  if (tier === 'Full HD') return 'fullhd';
  if (tier === '2K') return 'qhd';
  if (tier === 'Топ') return 'top';
  return 'custom';
}

const componentSeeds = [
  ['cpu', 'Intel Core i3-12100F', '4 ядра / 8 потоков, базовый', 8000, 60, ['Full HD', 'базовый']],
  ['cpu', 'Intel Core i5-12400F', '6 ядер / 12 потоков, отличный старт', 12000, 65, ['Full HD', 'старт']],
  ['cpu', 'Intel Core i5-13400F', '10 ядер, баланс для игр и работы', 17000, 65, ['2K', 'баланс']],
  ['cpu', 'Intel Core i5-14600KF', '14 ядер, высокая частота для 2K', 28000, 125, ['2K', 'мощный']],
  ['cpu', 'Intel Core i7-14700KF', '20 ядер, топ для игр и рендера', 38000, 125, ['4K', 'работа']],
  ['cpu', 'Intel Core i9-14900KF', '24 ядра, флагман Intel', 55000, 125, ['4K', 'топ']],
  ['cpu', 'AMD Ryzen 5 5500', '6 ядер / 12 потоков, выгодный старт', 8500, 65, ['Full HD', 'выгодно']],
  ['cpu', 'AMD Ryzen 5 5600', '6 ядер / 12 потоков, классика', 11000, 65, ['Full HD', 'хит']],
  ['cpu', 'AMD Ryzen 5 7500F', 'AM5, отличный баланс для 2K', 15000, 65, ['2K', 'AM5']],
  ['cpu', 'AMD Ryzen 7 7700', 'AM5, 8 ядер для комфортной работы', 22000, 65, ['2K', 'AM5']],
  ['cpu', 'AMD Ryzen 7 7800X3D', 'топ для игр, холодный и быстрый', 35000, 120, ['топ', '4K']],
  ['cpu', 'AMD Ryzen 9 7900X', '12 ядер, мощная рабочая станция', 40000, 170, ['работа', 'топ']],
  ['cpu', 'AMD Ryzen 9 7950X3D', '16 ядер, ультимативное решение', 58000, 120, ['топ', '4K']],
  ['gpu', 'Nvidia RTX 3050 6GB', 'базовый уровень', 18000, 130, ['Full HD', 'старт']],
  ['gpu', 'Nvidia RTX 3060 12GB', 'Full HD, народный выбор', 28000, 170, ['Full HD', 'хит']],
  ['gpu', 'Nvidia RTX 4060 8GB', 'Full HD + DLSS 3', 32000, 115, ['Full HD', 'новый']],
  ['gpu', 'Nvidia RTX 4060 Ti 8GB', 'Full HD / 2K, уверенно', 40000, 160, ['Full HD', '2K']],
  ['gpu', 'Nvidia RTX 4070 12GB', 'отличный 2K-гейминг', 58000, 200, ['2K', 'рекомендуем']],
  ['gpu', 'Nvidia RTX 4070 Super 12GB', 'мощно, запас под 2K/4K', 65000, 220, ['2K', '4K']],
  ['gpu', 'Nvidia RTX 4070 Ti Super 16GB', '2K/4K, много памяти', 85000, 285, ['4K', 'топ']],
  ['gpu', 'Nvidia RTX 4080 Super 16GB', 'уверенный 4K-гейминг', 105000, 320, ['4K', 'топ']],
  ['gpu', 'Nvidia RTX 4090 24GB', 'абсолютный максимум', 180000, 450, ['4K', 'ультра']],
  ['gpu', 'Nvidia RTX 5070 12GB', 'новое поколение, идеальный баланс', 75000, 220, ['2K', '4K']],
  ['gpu', 'Nvidia RTX 5080 16GB', 'новый флагман под 4K и работу', 140000, 360, ['топ', '4K']],
  ['gpu', 'Nvidia RTX 5090 32GB', 'бескомпромиссный топ 2026', 220000, 500, ['4K', 'ультра']],
  ['gpu', 'AMD RX 6600 8GB', 'бюджетно и сердито', 22000, 132, ['Full HD', 'выгодно']],
  ['gpu', 'AMD RX 7600 8GB', 'Full HD новинка', 28000, 165, ['Full HD', 'хит']],
  ['gpu', 'AMD RX 7700 XT 12GB', 'мощный 2K', 45000, 245, ['2K']],
  ['gpu', 'AMD RX 7800 XT 16GB', '2K, много памяти, выгодно', 55000, 263, ['2K', 'хит']],
  ['gpu', 'AMD RX 7900 GRE 16GB', 'топ 2K/4K', 62000, 260, ['4K']],
  ['gpu', 'AMD RX 7900 XTX 24GB', 'флагман от красных', 95000, 355, ['4K', 'топ']],
  ['motherboard', 'H610 / A520', 'бюджетно', 6000, 0, ['старт']],
  ['motherboard', 'B550M / B650M / B760M', 'подберем совместимую плату', 11000, 0, ['совместимость']],
  ['motherboard', 'B650 / Z790 Wi-Fi', 'AM5 / LGA1700, Wi-Fi, топ', 20000, 0, ['Wi-Fi']],
  ['ram', '16GB DDR4', 'минимум для игр', 4000, 0, ['старт']],
  ['ram', '32GB DDR4', 'комфортный запас', 7000, 0, ['рекомендуем']],
  ['ram', '32GB DDR5', 'новый стандарт', 11000, 0, ['современно']],
  ['ram', '64GB DDR5', 'монтаж, 3D, AI', 22000, 0, ['работа']],
  ['storage', 'SSD NVMe 512GB', 'быстрый старт', 4000, 0, ['старт']],
  ['storage', 'SSD NVMe 1TB', 'оптимально под игры', 7500, 0, ['рекомендуем']],
  ['storage', 'SSD NVMe 2TB', 'большая библиотека игр', 13000, 0, ['запас']],
  ['storage', 'SSD NVMe 4TB', 'максимум памяти', 25000, 0, ['топ']],
  ['psu', '600W 80+ Bronze', 'для стартовых сборок', 5000, 0, ['старт']],
  ['psu', '750W 80+ Gold', 'запас и тишина', 9000, 0, ['рекомендуем']],
  ['psu', '850W 80+ Gold', 'ATX 3.0 для новых видеокарт', 12000, 0, ['надежно']],
  ['psu', '1000W 80+ Platinum', 'для флагманских систем', 18000, 0, ['топ']],
  ['cooling', 'Башенное охлаждение', 'тихо и надежно', 3500, 0, ['тихо']],
  ['cooling', 'СЖО 240mm', 'для горячих CPU и красоты', 8000, 0, ['RGB']],
  ['cooling', 'СЖО 360mm', 'для топовых сборок', 15000, 0, ['топ']],
  ['case', 'Airflow Black', 'строгий корпус с продувом', 7000, 0, ['airflow']],
  ['case', 'RGB Glass', 'акцентный корпус с подсветкой', 9000, 0, ['RGB']],
  ['case', 'Premium Compact / Dual Chamber', 'плотная аккуратная сборка (аквариум)', 14000, 0, ['premium']],
  ['os', 'Windows 11 Pro + драйверы', 'установка и первичная настройка', 0, 0, ['готово']],
  ['service', 'Стресс-тест и сборка TOGOSHOL', 'входит в стоимость', 0, 0, ['включено']],
] as const;

async function main() {
  const views = getProductViews(vkProducts);

  for (const [index, product] of views.entries()) {
    const details = getProductDetails(product);
    const sourceId = product.sourceId || `seed-${index}`;
    const title = product.normalizedTitle || product.title;
    const slug = slugify(`${title}-${sourceId}`) || `product-${index}`;

    await prisma.product.upsert({
      where: { slug },
      update: {
        title,
        status: 'available',
        badge: product.badge,
        badgeType: product.badgeType || 'available',
        price: parsePriceValue(product.price),
        priceText: product.price,
        imageUrl: product.image || null,
        cpu: details.cpu,
        gpu: details.gpu,
        ram: details.ram,
        storage: details.storage,
        psu: details.psu,
        specsJson: JSON.stringify(product.cleanSpecs),
        productClass: classFromTier(product.gpuTier),
        scenario: product.useCase,
        sortOrder: index + 1,
        isFeatured: index < 6,
        featuredSlot: index < 6 ? index : null,
        sourceType: 'vk_import',
        externalId: sourceId,
      },
      create: {
        title,
        slug,
        status: 'available',
        badge: product.badge,
        badgeType: product.badgeType || 'available',
        price: parsePriceValue(product.price),
        priceText: product.price,
        imageUrl: product.image || null,
        cpu: details.cpu,
        gpu: details.gpu,
        ram: details.ram,
        storage: details.storage,
        psu: details.psu,
        specsJson: JSON.stringify(product.cleanSpecs),
        productClass: classFromTier(product.gpuTier),
        scenario: product.useCase,
        sortOrder: index + 1,
        isFeatured: index < 6,
        heroSlot: index === 1 ? 0 : null,
        featuredSlot: index < 6 ? index : null,
        sourceType: 'vk_import',
        externalId: sourceId,
      },
    });
  }

  const seededProducts = await prisma.product.findMany({
    where: { deletedAt: null, status: { in: ['available', 'preorder'] } },
    orderBy: [{ sortOrder: 'asc' }],
    take: 6,
  });

  const heroIds = seededProducts.slice(1, 2).map((product) => product.id);
  const featuredIds = seededProducts.map((product) => product.id);
  const finalCtaIds = seededProducts.slice(0, 1).map((product) => product.id);

  await prisma.pageBlock.upsert({
    where: { key: 'heroProductIds' },
    update: { itemsJson: JSON.stringify(heroIds) },
    create: { key: 'heroProductIds', title: 'Hero products', itemsJson: JSON.stringify(heroIds) },
  });
  await prisma.pageBlock.upsert({
    where: { key: 'featuredProductIds' },
    update: { itemsJson: JSON.stringify(featuredIds) },
    create: { key: 'featuredProductIds', title: 'Featured products', itemsJson: JSON.stringify(featuredIds) },
  });
  await prisma.pageBlock.upsert({
    where: { key: 'finalCtaProductIds' },
    update: { itemsJson: JSON.stringify(finalCtaIds) },
    create: { key: 'finalCtaProductIds', title: 'Final CTA products', itemsJson: JSON.stringify(finalCtaIds) },
  });

  await prisma.adminSetting.upsert({
    where: { key: 'adminPasswordHash' },
    update: { value: hashPassword(seedAdminPassword) },
    create: { key: 'adminPasswordHash', value: hashPassword(seedAdminPassword) },
  });

  for (const [index, item] of componentSeeds.entries()) {
    const [category, title, subtitle, price, wattage, tags] = item;
    await prisma.componentOption.upsert({
      where: { id: `seed-component-${category}-${index}` },
      update: {
        category,
        title,
        subtitle,
        price,
        wattage,
        tagsJson: JSON.stringify(tags),
        status: 'available',
        sortOrder: index + 1,
      },
      create: {
        id: `seed-component-${category}-${index}`,
        category,
        title,
        subtitle,
        price,
        wattage,
        tagsJson: JSON.stringify(tags),
        status: 'available',
        sortOrder: index + 1,
      },
    });
  }

  console.log(`Seeded ${views.length} products and ${componentSeeds.length} component options`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
