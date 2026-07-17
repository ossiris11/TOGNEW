import { contacts } from '../../data/contacts';
import { useProducts } from '../../hooks/useProducts';
import { trackEvent } from '../../lib/api';
import './FinalCta.css';

export function FinalCta() {
  const { finalCtaProducts } = useProducts();
  const featuredProduct = finalCtaProducts[0];

  return (
    <section className="premium-cta-section">
      <div className="container">
        <div className="premium-cta-card">
          <div className="cta-content">
            <span className="premium-badge">Заявка</span>
            <h2>Соберем идеальный игровой ПК под твой бюджет</h2>
            <p>{featuredProduct ? `Например, сборка: ${featuredProduct.title} за ${featuredProduct.price}. Напиши нам, и мы соберем ПК, который будет тянуть любые игры.` : 'Напиши нам — бесплатно подберём конфигурацию, проверим совместимость и посчитаем итоговую стоимость.'}</p>
            
            <div className="cta-actions">
              <a className="premium-btn solid large" href={contacts.vk} target="_blank" rel="noreferrer" onClick={() => trackEvent('contact_click_vk', { placement: 'final_cta' })}>
                Получить бесплатный расчет
              </a>
              <a className="premium-btn ghost" href={contacts.telegram} target="_blank" rel="noreferrer" onClick={() => trackEvent('contact_click_telegram', { placement: 'final_cta' })}>
                Telegram
              </a>
              <a className="premium-btn ghost" href={contacts.instagram} target="_blank" rel="noreferrer" onClick={() => trackEvent('contact_click_instagram', { placement: 'final_cta' })}>
                Instagram
              </a>
              <a className="premium-btn ghost" href={contacts.avito} target="_blank" rel="noreferrer" onClick={() => trackEvent('contact_click_avito', { placement: 'final_cta' })}>
                Avito
              </a>
              <a className="premium-btn ghost" href="#custom">
                Собрать под задачу
              </a>
            </div>
            <small className="cta-note">Ответим по наличию, срокам сборки и вариантам апгрейда.</small>
          </div>
        </div>
      </div>
    </section>
  );
}
