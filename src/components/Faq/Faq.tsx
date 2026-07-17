import { faqItems } from '../../data/faq';
import './Faq.css';

export function Faq() {
  return (
    <section className="premium-faq-section" aria-labelledby="faq-title">
      <div className="container">
        <div className="premium-faq-layout">
          <div className="premium-faq-header">
            <span className="premium-badge">FAQ</span>
            <h2 id="faq-title" className="premium-section-title">Частые <span>Вопросы</span></h2>
            <p className="premium-section-subtitle">Остались сомнения? Мы ответили на самые частые вопросы ниже.</p>
          </div>

          <div className="premium-faq-list">
            {faqItems.map((item, index) => (
              <details className="premium-faq-item" key={item.question} open={index === 0}>
                <summary className="premium-faq-summary">
                  {item.question}
                  <span className="premium-faq-icon"></span>
                </summary>
                <div className="premium-faq-content">
                  <p>{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
