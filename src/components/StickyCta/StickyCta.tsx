import { contacts } from '../../data/contacts';
import { trackEvent } from '../../lib/api';
import { MessageCircle } from 'lucide-react';
import './StickyCta.css';

export function StickyCta() {
  return (
    <div className="sticky-cta-container">
      <a 
        href={contacts.vk} 
        className="sticky-cta-btn" 
        target="_blank" 
        rel="noreferrer"
        onClick={() => trackEvent('contact_click_vk', { placement: 'sticky_cta' })}
      >
        <MessageCircle size={20} />
        <span>Консультация</span>
      </a>
    </div>
  );
}
