import { steps } from '../../data/steps';
import './OrderProcess.css';

export function OrderProcess() {
  return (
    <section id="process" className="premium-process-section">
      <div className="container">
        <div className="premium-process-header">
          <span className="premium-badge">Work Flow</span>
          <h2 className="premium-section-title">Как мы <span>работаем</span></h2>
          <p className="premium-section-subtitle">Процесс создания вашей системы прозрачен на каждом этапе.</p>
        </div>
        <div className="premium-steps-grid">
          {steps.map((step) => (
            <article className="premium-step-card" key={step.number}>
              <div className="step-number">{step.number}</div>
              <div className="step-content">
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
