import { conditions } from '../../data/conditions';
import './TrustConditions.css';

export function TrustConditions() {
  return (
    <section className="premium-trust-section" aria-labelledby="trust-title">
      <div className="container">
        <div className="premium-trust-inner">
          <div className="premium-trust-header">
            <span className="premium-badge">Гарантии</span>
            <h2 id="trust-title" className="premium-section-title">Чистые <span>Условия</span></h2>
            <p className="premium-section-subtitle">
              Никаких скрытых платежей. Перед сборкой фиксируем конфигурацию, стоимость и сроки.
            </p>
          </div>
          <div className="premium-trust-grid">
            {conditions.map((item) => (
              <article key={item.title} className="premium-trust-card">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
          <div className="premium-trust-actions" style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
            <a href="#custom" className="premium-btn solid large">Обсудить сборку</a>
          </div>
        </div>
      </div>
    </section>
  );
}
