import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildContactMessage, contacts } from '../../data/contacts';
import { useProducts } from '../../hooks/useProducts';
import { trackEvent } from '../../lib/api';
import { getCatalogFallbackImage, resolveCatalogProductImage } from '../../lib/catalogImages';
import { getBudgetLabel, getProductKey, getProductSlug, rankCatalogProducts, toProductView } from '../../lib/products';
import type { ProductView } from '../../lib/products';
import { calculateFps, getTierLabel, parseGpuProfile } from '../../lib/performance';
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
              <button type="button" className="premium-btn ghost" onClick={copyCheckoutText}>
                {checkoutCopyState === 'copied' ? '✓ Скопировано' : 'Скопировать'}
              </button>
              <a
                className="premium-btn solid"
                href={contacts.avito}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('product_cta_click', { productId: checkoutProduct.sourceId, channel: 'avito', placement: 'checkout_modal' })}
              >
                Отправить в Avito
              </a>
              <a
                className="premium-btn solid"
                href={`${contacts.vk}?message=${buildContactMessage(buildOrderText(checkoutProduct))}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('product_cta_click', { productId: checkoutProduct.sourceId, channel: 'vk', placement: 'checkout_modal' })}
              >
                Отправить в VK
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
