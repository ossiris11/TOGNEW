import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildContactMessage, contacts } from '../../data/contacts';
import { useProducts } from '../../hooks/useProducts';
import { trackEvent } from '../../lib/api';
import { getCatalogFallbackImage, resolveCatalogProductImage } from '../../lib/catalogImages';
import { getBudgetLabel, getProductKey, getProductSlug, rankCatalogProducts, toProductView } from '../../lib/products';
import type { ProductView } from '../../lib/products';
import { calculateFps, getTierLabel, parseGpuProfile } from '../../lib/performance';
import { Copy, Send } from 'lucide-react';
import amdLogo from '../../assets/amd-logo.svg';
import intelLogo from '../../assets/intel-logo.svg';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ProductCatalog.css';

gsap.registerPlugin(ScrollTrigger);

const filters = ['Все', 'Start (до 90k)', 'Pro (90-150k)', 'Ultra (150k+)'] as const;
const specDrawerCloseMs = 420;
type Filter = (typeof filters)[number];

function getCardTitle(priceValue: number) {
  if (priceValue < 90000) return 'START';
  if (priceValue < 150000) return 'PRO';
  return 'ULTRA';
}

function getProcessorBrand(cpu: string) {
  if (/ryzen|threadripper|\bamd\b/i.test(cpu)) {
    return { badge: 'AMD', intro: 'AMD', brand: 'amd' as const };
  }
  if (/intel|core|celeron|pentium|\bi[3579][-\s]?\d/i.test(cpu)) {
    return { badge: 'intel', intro: 'Intel', brand: 'intel' as const };
  }
  return { badge: 'CPU', intro: 'CPU', brand: 'cpu' as const };
}

function ProcessorBrandLogo({ brand, label }: { brand: 'amd' | 'intel' | 'cpu'; label: string }) {
  if (brand === 'intel') {
    return (
      <span className="premium-brand-badge intel" aria-label="Intel">
        <img src={intelLogo} alt="" aria-hidden="true" />
      </span>
    );
  }
  if (brand === 'amd') {
    return (
      <span className="premium-brand-badge amd" aria-label="AMD">
        <img src={amdLogo} alt="" aria-hidden="true" />
      </span>
    );
  }
  return <span className="premium-brand-badge neutral">{label}</span>;
}

// Removed getFpsEstimate and getPerformanceLabel
// We now use calculateFps and getTierLabel from performance.ts

function getOptionalSpecValue(product: ProductView, patterns: RegExp[]) {
  const specs = [...product.cleanSpecs, ...product.specs];
  const match = specs.find((spec) => patterns.some((pattern) => pattern.test(spec)));
  if (!match) return '';
  return match.split(':').slice(1).join(':').trim() || match.trim();
}

function getSpecificationRows(product: ProductView) {
  return [
    ['GPU', product.details.gpu || getOptionalSpecValue(product, [/видеокарта/i, /\bgpu\b/i])],
    ['CPU', product.details.cpu || getOptionalSpecValue(product, [/процессор/i, /\bcpu\b/i])],
    ['MB', getOptionalSpecValue(product, [/материн/i, /motherboard/i, /\b[abzhx]\d{3,4}\b/i, /\bh\d{3}\b/i])],
    ['RAM', product.details.ram || getOptionalSpecValue(product, [/оператив/i, /\bram\b/i, /\bddr[45]\b/i])],
    ['SSD', product.details.storage || getOptionalSpecValue(product, [/накопитель/i, /\bssd\b/i])],
    ['COOL', product.details.cooling || getOptionalSpecValue(product, [/охлаж/i, /cool/i, /\bсжо\b/i])],
    ['PSU', product.details.psu || getOptionalSpecValue(product, [/блок питания/i, /\bpsu\b/i])],
    ['CASE', product.details.caseName || getOptionalSpecValue(product, [/корпус/i, /\bcase\b/i, /airflow/i, /frgb/i, /argb/i])],
  ].filter((row): row is [string, string] => Boolean(row[1]));
}

function buildOrderText(product: ProductView) {
  const rows = getSpecificationRows(product)
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n');

  return `— Заявка с сайта TOG PC —
Бюджет: ${product.price}
Сборка: ${product.title}

— Конфигурация —
${rows}

Хочу оформить этот ПК.`;
}

export function ProductCatalog() {
  const [activeFilter, setActiveFilter] = useState<Filter>('Все');
  const [showAll, setShowAll] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductView | null>(null);
  const [checkoutProduct, setCheckoutProduct] = useState<ProductView | null>(null);
  const [checkoutCopyState, setCheckoutCopyState] = useState<'idle' | 'copied'>('idle');
  const [isSpecClosing, setIsSpecClosing] = useState(false);
  const closeSpecTimer = useRef<number | null>(null);
  const productSpecDrawerRef = useRef<HTMLElement | null>(null);
  const checkoutModalRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const { products: storefrontProducts, error: productsError } = useProducts();
  const gridRef = useRef<HTMLDivElement>(null);
  const products = useMemo(() => storefrontProducts.map(toProductView), [storefrontProducts]);
  const filteredProducts = useMemo(() => {
    if (activeFilter === 'Все') return rankCatalogProducts(products);
    
    let targetSeries = '';
    if (activeFilter === 'Start (до 90k)') targetSeries = 'START';
    if (activeFilter === 'Pro (90-150k)') targetSeries = 'PRO';
    if (activeFilter === 'Ultra (150k+)') targetSeries = 'ULTRA';

    return products.filter((product) => getCardTitle(product.priceValue) === targetSeries).sort((a, b) => b.priceValue - a.priceValue);
  }, [activeFilter, products]);
  const visibleProducts = showAll ? filteredProducts : filteredProducts.slice(0, 9);

  const resetLimit = () => setShowAll(false);

  const openSpecDrawer = (product: ProductView) => {
    lastFocusedElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (closeSpecTimer.current) {
      window.clearTimeout(closeSpecTimer.current);
      closeSpecTimer.current = null;
    }
    setIsSpecClosing(false);
    setSelectedProduct(product);
  };

  const closeSpecDrawer = useCallback(() => {
    if (!selectedProduct || isSpecClosing) return;
    setIsSpecClosing(true);
    closeSpecTimer.current = window.setTimeout(() => {
      setSelectedProduct(null);
      setIsSpecClosing(false);
      closeSpecTimer.current = null;
      lastFocusedElementRef.current?.focus();
    }, specDrawerCloseMs);
  }, [isSpecClosing, selectedProduct]);

  const openCheckout = (product: ProductView, placement: string) => {
    lastFocusedElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setCheckoutCopyState('idle');
    setCheckoutProduct(product);
    setSelectedProduct(null);
    setIsSpecClosing(false);
    trackEvent('product_checkout_open', { productId: product.sourceId, title: product.normalizedTitle, placement });
  };

  const closeCheckout = useCallback(() => {
    setCheckoutProduct(null);
    setCheckoutCopyState('idle');
    window.setTimeout(() => lastFocusedElementRef.current?.focus(), 0);
  }, []);

  const copyCheckoutText = async () => {
    if (!checkoutProduct) return;
    try {
      await navigator.clipboard.writeText(buildOrderText(checkoutProduct));
      setCheckoutCopyState('copied');
      window.setTimeout(() => setCheckoutCopyState('idle'), 1600);
    } catch {
      setCheckoutCopyState('idle');
    }
  };

  useEffect(() => {
    if (!selectedProduct) return undefined;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeSpecDrawer();
      if (event.key !== 'Tab') return;
      const focusable = productSpecDrawerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    window.setTimeout(() => productSpecDrawerRef.current?.querySelector<HTMLElement>('button, a')?.focus(), 0);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeSpecDrawer, selectedProduct]);

  useEffect(() => {
    if (!checkoutProduct) return undefined;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCheckout();
      if (event.key !== 'Tab') return;
      const focusable = checkoutModalRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    window.setTimeout(() => checkoutModalRef.current?.querySelector<HTMLElement>('button')?.focus(), 0);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [checkoutProduct, closeCheckout]);

  useEffect(
    () => () => {
      if (closeSpecTimer.current) window.clearTimeout(closeSpecTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (!gridRef.current) return;
    
    // Refresh ScrollTrigger and animate cards
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.premium-card',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 85%',
          }
        }
      );
    }, gridRef);

    return () => ctx.revert();
  }, [visibleProducts]);

  return (
    <section id="catalog" className="premium-catalog-section">
      <div className="container">
        <div className="premium-catalog-header">
          <h2 className="premium-section-title">Каталог Систем</h2>
          <p className="premium-section-subtitle">Созданы для тех, кто ценит бескомпромиссное качество.</p>
        </div>

        {productsError && (
          <p className="catalogNotice" role="status">
            {productsError} Актуальное наличие лучше уточнить перед заказом.
          </p>
        )}

        <div className="premium-filters">
          {filters.map((filter) => (
            <button
              className={`premium-filter-btn ${activeFilter === filter ? 'isActive' : ''}`}
              key={filter}
              type="button"
              onClick={() => {
                setActiveFilter(filter);
                resetLimit();
              }}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="premium-catalog-grid" ref={gridRef} key={`${activeFilter}-${showAll ? 'all' : 'limited'}`}>
          {visibleProducts.map((product) => {
            const cardTitle = getCardTitle(product.priceValue);
            const processorBrand = getProcessorBrand(product.details.cpu || product.normalizedTitle);
            const gpuProfile = parseGpuProfile(product.details.gpu || product.normalizedTitle);
            const fps = calculateFps(gpuProfile, 'Counter-Strike 2', '1080p');
            const stableImageKey = `${product.sourceId || 'product'}:${product.normalizedTitle}`;
            const catalogImage = getCatalogFallbackImage(product.priceValue, stableImageKey);
            const productImage = resolveCatalogProductImage(product.image, product.priceValue, stableImageKey);
            const specs = [
              ['GPU', product.details.gpu],
              ['CPU', product.details.cpu],
              ['RAM', product.details.ram],
              ['SSD', product.details.storage],
            ].filter(([, value]) => value);

            return (
              <article className="premium-card" key={getProductKey(product)}>
                <div className="border-beam"></div>
                <div className="premium-card-inner">
                  <div className="premium-card-visual">
                    <div className="premium-card-backdrop" />
                  <ProcessorBrandLogo brand={processorBrand.brand} label={processorBrand.badge} />
                  <img
                    className="premium-card-image"
                    src={productImage}
                    alt={`Игровой ПК ${product.normalizedTitle} сборка Великий Новгород`}
                    loading="lazy"
                    decoding="async"
                    onError={(event) => {
                      event.currentTarget.src = catalogImage;
                    }}
                  />
                  <div className="premium-card-tier">{cardTitle}</div>
                </div>

                <div className="premium-card-info">
                  <div className="premium-card-header">
                    <h3>TOGOSHOL {product.mythicName}</h3>
                    <p className="premium-card-subtitle">{product.title}</p>
                    <div className="premium-card-price">{product.price}</div>
                  </div>

                  <div className="premium-card-specs-minimal">
                    {specs.map(([key, value]) => (
                      <div className="minimal-spec-row" key={key}>
                        <span className="minimal-spec-key">{key}</span>
                        <span className="minimal-spec-val">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="premium-card-footer">
                    <div className="premium-fps">
                      <strong>{fps}</strong>
                      <div className="fps-label">
                        <span>FPS</span>
                        <small>{getTierLabel(gpuProfile.tier)}</small>
                      </div>
                    </div>
                    
                    <div className="premium-card-actions">
                      <button
                        className="premium-btn ghost"
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          openSpecDrawer(product);
                          trackEvent('product_details_click', { productId: product.sourceId, placement: 'catalog' });
                        }}
                      >
                        Детали
                      </button>
                      <button
                        className="premium-btn solid"
                        type="button"
                        onClick={() => openCheckout(product, 'catalog_card')}
                      >
                        Заказать
                      </button>
                    </div>
                  </div>
                </div>
                </div>
              </article>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="catalogEmpty">
            <h3>Под такие параметры ничего не нашли</h3>
            <p>Напишите нам — подберём сборку вручную под бюджет, игры и монитор.</p>
            <div className="emptyActions">
              <a className="premium-btn solid" href="#custom">Собрать ПК</a>
              <a className="premium-btn ghost" href={contacts.vk} target="_blank" rel="noreferrer">Написать в VK</a>
            </div>
          </div>
        )}

        {visibleProducts.length < filteredProducts.length && (
          <div className="premium-load-more">
            <button className="premium-btn ghost" type="button" onClick={() => setShowAll(true)}>
              Показать ещё {filteredProducts.length - visibleProducts.length}
            </button>
          </div>
        )}
      </div>

      {selectedProduct && (
        <div
          className={`productSpecOverlay ${isSpecClosing ? 'isClosing' : ''}`}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeSpecDrawer();
          }}
        >
          <aside ref={productSpecDrawerRef} className="premium-drawer" role="dialog" aria-modal="true" aria-labelledby="product-spec-title">
            <header className="premium-drawer-header">
              <div>
                <span className="drawer-eyebrow">Спецификация</span>
                <h3 id="product-spec-title">TOGOSHOL {selectedProduct.mythicName}</h3>
              </div>
              <button type="button" className="drawer-close" aria-label="Закрыть" onClick={closeSpecDrawer}>×</button>
            </header>

            <div className="premium-drawer-body">
              {(selectedProduct.description || selectedProduct.shortDescription) && (
                <p className="drawer-description">{selectedProduct.description || selectedProduct.shortDescription}</p>
              )}
              <dl className="premium-drawer-table">
                {getSpecificationRows(selectedProduct).map(([label, value]) => (
                  <div className="drawer-table-row" key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="premium-drawer-included">
              <h4 className="included-title">В стоимость включено:</h4>
              <ul className="included-list">
                <li>Полная сборка и кабель-менеджмент</li>
                <li>Установка ОС (Windows 10/11) и драйверов</li>
                <li>Стресс-тест 24 часа и настройка XMP/EXPO</li>
                <li>Гарантия на все комплектующие</li>
              </ul>
            </div>
            
            <div className="premium-drawer-footer">
              <div className="drawer-price">{selectedProduct.price}</div>
              <div className="drawer-actions">
                <button className="premium-btn solid full" type="button" onClick={() => openCheckout(selectedProduct, 'spec_drawer')}>
                  Оформить заказ
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {checkoutProduct && (
        <div
          className="checkoutOverlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeCheckout();
          }}
        >
          <div className="premium-checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title" ref={checkoutModalRef}>
            <button type="button" className="checkout-close" aria-label="Закрыть" onClick={closeCheckout}>×</button>
            <h3 id="checkout-title">Оформление заказа</h3>
            <p className="checkout-subtitle">Мы свяжемся с вами для подтверждения конфигурации и деталей.</p>

            <div className="premium-checkout-hint">
              1. Скопируйте заявку<br />2. Отправьте её нам в любой мессенджер
            </div>

            <pre className="premium-checkout-text">{buildOrderText(checkoutProduct)}</pre>

            <div className="premium-checkout-actions">
              <button type="button" className="premium-btn ghost btn-copy" onClick={copyCheckoutText}>
                <Copy size={18} />
                {checkoutCopyState === 'copied' ? '✓ Скопировано' : 'Скопировать заявку'}
              </button>
              
              <div className="checkout-social-grid">
                <a
                  className="premium-btn solid btn-tg"
                  href={contacts.telegram}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent('product_cta_click', { productId: checkoutProduct.sourceId, channel: 'telegram', placement: 'checkout_modal' })}
                >
                  <Send size={18} />
                  Telegram
                </a>
                <a
                  className="premium-btn solid btn-vk"
                  href={`${contacts.vk}?message=${buildContactMessage(buildOrderText(checkoutProduct))}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent('product_cta_click', { productId: checkoutProduct.sourceId, channel: 'vk', placement: 'checkout_modal' })}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M22.06 13.9c.53.53 1.1 1.05 1.58 1.62.4.47.76 1 1.09 1.53.37.6.21 1.09-.47 1.11H19.7c-1.02-.03-1.8-.45-2.37-1.23-.33-.46-.72-.88-1.08-1.32-.14-.17-.28-.35-.45-.49-.44-.36-.83-.3-1.12.22-.38.68-.45 1.41-.48 2.14-.02.48-.17.65-.65.68-1.85.12-3.56-.23-5.06-1.28-1.63-1.13-2.87-2.61-3.9-4.27-1.63-2.64-2.86-5.46-3.8-8.4-.18-.55.03-.78.58-.79h4.31c.48 0 .74.22.88.69.66 2.05 1.53 3.99 2.68 5.78.29.45.61.88.99 1.25.32.32.61.27.75-.17.11-.35.16-.71.18-1.08.05-1.51-.01-3.03-.52-4.48-.15-.43-.02-.75.43-.88.35-.1.72-.11 1.09-.11h2.72c.49.07.61.28.69.75.14 1 .1 2.01.1 3.02 0 .5.08.99.3 1.45.18.36.46.43.76.2.22-.17.43-.37.6-.58 1.15-1.47 1.98-3.13 2.59-4.88.16-.46.4-.64.88-.63h4.63c.27 0 .54 0 .78.07.41.11.49.33.37.74-.29 1.01-.76 1.95-1.28 2.87-1 1.76-2.14 3.42-3.47 4.96-.3.34-.33.56-.05.9 0 0 .01.01.01.01z"/></svg>
                  ВКонтакте
                </a>
                <a
                  className="premium-btn solid btn-ig"
                  href={contacts.instagram}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent('product_cta_click', { productId: checkoutProduct.sourceId, channel: 'instagram', placement: 'checkout_modal' })}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                  </svg>
                  Instagram
                </a>
                <a
                  className="premium-btn solid btn-avito"
                  href={contacts.avito}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent('product_cta_click', { productId: checkoutProduct.sourceId, channel: 'avito', placement: 'checkout_modal' })}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                    <circle cx="7" cy="7" r="3.5" fill="#00AAFF"/>
                    <circle cx="17" cy="7" r="3.5" fill="#84C236"/>
                    <circle cx="7" cy="17" r="3.5" fill="#FF4D4D"/>
                    <circle cx="17" cy="17" r="3.5" fill="#9D4BC6"/>
                  </svg>
                  Авито
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
