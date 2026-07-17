import React, { useEffect, useState, useMemo, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { trackEvent } from '../../lib/api';
import { useProducts, useProductViews } from '../../hooks/useProducts';
import { resolveCatalogProductImage } from '../../lib/catalogImages';
import { rankCatalogProducts } from '../../lib/products';
import styles from './PopularBuildsCarousel.module.css';

// We map colors to each position just for the aura glow
const AURA_COLORS = ['#8A2BE2', '#FF0055', '#00BFFF', '#00FA9A'];

export function PopularBuildsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { products, loading } = useProducts();
  const productViews = useProductViews(products);

  // Pick top 4 products for the carousel
  const topProducts = useMemo(() => {
    if (!productViews || productViews.length === 0) return [];
    // Just sort by ranking or take the first 4 premium ones
    const ranked = rankCatalogProducts(productViews);
    return ranked.slice(0, 4);
  }, [productViews]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navigate = (direction: 'prev' | 'next') => {
    if (isAnimating || topProducts.length === 0) return;
    setIsAnimating(true);
    
    setActiveIndex((prev) => {
      if (direction === 'next') return (prev + 1) % topProducts.length;
      return (prev + topProducts.length - 1) % topProducts.length;
    });

    setTimeout(() => {
      setIsAnimating(false);
    }, 650);
  };

  // Swipe and wheel handling
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) navigate('next');
      else navigate('prev');
    }
    touchStartX.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Only trigger on horizontal scrolling (e.g. trackpad swipe)
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 20) {
      if (e.deltaX > 0) navigate('next');
      else navigate('prev');
    }
  };

  const getRole = (index: number) => {
    if (index === activeIndex) return 'center';
    if (index === (activeIndex + topProducts.length - 1) % topProducts.length) return 'left';
    if (index === (activeIndex + 1) % topProducts.length) return 'right';
    return 'back';
  };

  if (loading || topProducts.length === 0) {
    return null;
  }

  return (
    <section 
      className={styles.carouselContainer}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      <div className={styles.carouselInner}>
        
        {/* 1. Grain Overlay */}
        <div className={styles.grainOverlay}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <filter id="noiseFilter">
              <feTurbulence 
                type="fractalNoise" 
                baseFrequency="0.9" 
                numOctaves="4" 
                stitchTiles="stitch" 
              />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" opacity="0.08" />
          </svg>
        </div>

        {/* Dynamic Aura Glow behind the center card */}
        <div 
          className={styles.auraGlow} 
          style={{ background: AURA_COLORS[activeIndex % AURA_COLORS.length] }} 
        />

        {/* 2. Giant Ghost Text */}
        <div className={styles.ghostText}>TOP BUILDS</div>

        {/* 3. Top-left Brand Label */}
        <div className={styles.brandLabel}>TOG PC</div>

        {/* 4. Carousel Cards */}
        <div className={styles.cardsContainer}>
          {topProducts.map((product, index) => {
            const role = getRole(index);
            
            let roleStyles: React.CSSProperties = {};
            // Updated scales and positions for CARDS (not just images)
            if (role === 'center') {
              roleStyles = {
                transform: `translate(-50%, -50%) scale(${isMobile ? 0.9 : 1})`,
                filter: 'blur(0px)',
                opacity: 1,
                zIndex: 20,
                left: isMobile ? '50%' : '65%',
                top: '50%',
              };
            } else if (role === 'left') {
              roleStyles = {
                transform: `translate(-50%, -50%) scale(${isMobile ? 0.75 : 0.85})`,
                filter: 'blur(3px)',
                opacity: 0.6,
                zIndex: 10,
                left: isMobile ? '10%' : '45%',
                top: isMobile ? '40%' : '50%',
              };
            } else if (role === 'right') {
              roleStyles = {
                transform: `translate(-50%, -50%) scale(${isMobile ? 0.75 : 0.85})`,
                filter: 'blur(3px)',
                opacity: 0.6,
                zIndex: 10,
                left: isMobile ? '90%' : '85%',
                top: isMobile ? '40%' : '50%',
              };
            } else if (role === 'back') {
              roleStyles = {
                transform: `translate(-50%, -50%) scale(0.7)`,
                filter: 'blur(6px)',
                opacity: 0.2,
                zIndex: 5,
                left: isMobile ? '50%' : '65%',
                top: isMobile ? '30%' : '45%',
              };
            }

            const formatPrice = (price: number) => {
              return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(price);
            };

            const imageUrl = resolveCatalogProductImage(product.image, product.priceValue, product.id || product.title);

            return (
              <div key={product.id || index} className={styles.carouselCardWrapper} style={roleStyles}>
                <div className={styles.carouselCard}>
                  <div className={styles.cardImageWrapper}>
                    <img src={imageUrl} alt={`Игровой ПК ${product.title} сборка Великий Новгород`} draggable={false} loading="lazy" decoding="async" />
                  </div>
                  <div className={styles.cardInfo}>
                    <h3 className={styles.cardTitle}>{product.mythicName || product.title}</h3>
                    <div className={styles.cardSpecs}>
                      <span className={styles.specTag}>{product.details.gpu || 'GPU'}</span>
                      <span className={styles.specTag}>{product.details.cpu || 'CPU'}</span>
                    </div>
                    <div className={styles.cardPrice}>
                      {formatPrice(product.priceValue)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 5. Bottom-left text + nav buttons */}
        <div className={styles.bottomLeft}>
          <p className={styles.bottomLeftTitle}>САМЫЕ ПОПУЛЯРНЫЕ СБОРКИ</p>
          <p className={styles.bottomLeftDesc}>
            Оцените наши топовые конфигурации. Идеальный баланс производительности и цены. Идеально уложенные кабели и бескомпромиссная мощь.
          </p>
          <div className={styles.navButtons}>
            <button 
              className={styles.navBtn} 
              onClick={() => navigate('prev')}
              aria-label="Previous"
            >
              <ArrowLeft size={26} strokeWidth={2.25} />
            </button>
            <button 
              className={styles.navBtn} 
              onClick={() => navigate('next')}
              aria-label="Next"
            >
              <ArrowRight size={26} strokeWidth={2.25} />
            </button>
          </div>
          
          {/* Link moved here to prevent overlap with cards */}
          <a 
            href="#catalog" 
            className={styles.discoverLink}
            onClick={() => trackEvent('click_carousel_to_catalog')}
            style={{ marginTop: '32px' }}
          >
            В КАТАЛОГ <ArrowRight className={styles.discoverArrow} strokeWidth={2.25} />
          </a>
        </div>

      </div>
    </section>
  );
}
