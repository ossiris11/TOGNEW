import React from 'react';
import { trackEvent } from '../../lib/api';
import './Features.css';

export function Features() {
  return (
    <section className="features-section premium-catalog-section">
      {/* Animated Grid Pattern */}
      <div className="features-grid-bg"></div>

      <div className="container relative z-10">
        <div className="premium-catalog-header">
          <h2 className="premium-section-title">Собираем <span className="text-glow">как для себя</span></h2>
          <p className="premium-section-subtitle">Мы знаем, что бесит геймеров. Поэтому мы решили эти проблемы раз и навсегда.</p>
        </div>

        <div className="bento-grid">
          <div className="bento-card">
            <div className="bento-content">
              <h3>Идеальный кабель-менеджмент</h3>
              <p>Никаких висящих проводов. Каждый кабель уложен идеально ровно и закреплен за задней стенкой. Это не только эстетика, но и идеальный воздушный поток внутри корпуса.</p>
              <a href="#catalog" className="btn-premium btn-secondary interactive mt-16" onClick={() => trackEvent('click_cable_to_catalog')}>
                Каталог ПК
              </a>
            </div>
            <div className="bento-visual cable-visual"></div>
            <div className="border-beam"></div>
          </div>

          <div className="bento-card">
            <div className="bento-content">
              <h3>100% Стресс-тест</h3>
              <p>Каждая сборка проходит 24 часа тестов в OCCT, FurMark и AIDA64. Если ПК троттлит или перегревается — мы его переделываем. Вы получаете абсолютно стабильную систему.</p>
              <a href="#custom" className="btn-premium btn-secondary interactive mt-16" onClick={() => trackEvent('click_stress_to_custom')}>
                Заказать надежную сборку
              </a>
            </div>
            <div className="bento-visual stress-visual">
              <div className="temp-badge">65°C Макс.</div>
            </div>
            <div className="border-beam" style={{ animationDelay: '2s' }}></div>
          </div>

          <div className="bento-card">
            <div className="bento-content">
              <h3>Никакого шума</h3>
              <p>Мы настраиваем кривые вентиляторов (Fan Curve) в BIOS. В простое ПК работает абсолютно бесшумно, а в играх — на комфортном уровне.</p>
              <a href="#custom" className="btn-premium btn-secondary interactive mt-16" onClick={() => trackEvent('click_noise_to_custom')}>
                Собрать тихий ПК
              </a>
            </div>
            <div className="bento-visual noise-visual">
               <div className="wave-line"></div>
            </div>
            <div className="border-beam" style={{ animationDelay: '4s' }}></div>
          </div>

          <div className="bento-card">
            <div className="bento-content">
              <h3>Гарантия 1 год</h3>
              <p>Сломалось? Починим бесплатно. Мы используем только новые комплектующие из проверенных магазинов (DNS, Ситилинк) с чеками и коробками.</p>
              <a 
                href="#catalog" 
                className="btn-premium btn-primary interactive mt-16"
                onClick={() => trackEvent('click_warranty_to_catalog')}
              >
                Выбрать свой ПК
              </a>
            </div>
            <div className="bento-visual warranty-visual"></div>
            <div className="border-beam" style={{ animationDelay: '6s' }}></div>
          </div>
        </div>
      </div>
    </section>
  );
}
