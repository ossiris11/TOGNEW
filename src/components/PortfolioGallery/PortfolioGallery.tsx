import { useState } from 'react';
import './PortfolioGallery.css';

import img1 from '../../assets/catalog-pc-premium-01-cutout.webp';
import img2 from '../../assets/catalog-pc-premium-03-cutout.webp';
import img3 from '../../assets/product-intel-i5-13400f-rtx5060-white-cutout.webp';
import img4 from '../../assets/catalog-pc-premium-06-cutout.webp';

const portfolioItems = [
  { id: 1, img: img1, title: 'Project NEON', desc: 'Custom Watercooling / RTX 4090', series: 'ULTRA' },
  { id: 2, img: img2, title: 'Snow White', desc: 'All White Build / i9-14900K', series: 'PRO' },
  { id: 3, img: img3, title: 'Esports Machine', desc: 'Airflow Focused / RTX 4070 Ti', series: 'PRO' },
  { id: 4, img: img4, title: 'Stealth Black', desc: 'Minimal RGB / Ryzen 9', series: 'ULTRA' },
];

export function PortfolioGallery() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="portfolio-section" id="portfolio">
      <div className="portfolio-header">
        <h2 className="portfolio-title">Наши Работы</h2>
        <p className="portfolio-subtitle">Галерея премиальных проектов и кастомных решений.</p>
      </div>

      <div className="portfolio-carousel">
        <div className="portfolio-track" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
          {portfolioItems.map((item) => (
            <div className="portfolio-slide" key={item.id}>
              <div className="portfolio-card">
                <div className="portfolio-image-wrapper">
                  <div className="portfolio-glow" />
                  <img src={item.img} alt={item.title} className="portfolio-img" />
                </div>
                <div className="portfolio-info">
                  <span className="portfolio-series">{item.series}</span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="portfolio-controls">
        {portfolioItems.map((_, idx) => (
          <button
            key={idx}
            className={`portfolio-dot ${activeIndex === idx ? 'active' : ''}`}
            onClick={() => setActiveIndex(idx)}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
