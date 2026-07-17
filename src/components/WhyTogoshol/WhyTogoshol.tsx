import { useEffect, useMemo, useState } from 'react';
import { benefits } from '../../data/benefits';
import { fetchReviews, type ApiReview } from '../../lib/api';
import './WhyTogoshol.css';

const bestReviewGroups = [
  { key: 'avito', title: 'Avito', note: 'Отзывы с площадки' },
  { key: 'vk', title: 'VK', note: 'Отзывы из сообщений' },
  { key: 'site', title: 'Сайт', note: 'Заявки с сайта' },
] as const;

function sourceMatches(review: ApiReview, source: string) {
  if (source === 'site') return ['site', 'manual', 'screenshot'].includes(review.source);
  return review.source === source;
}

function renderReviewShot(review: ApiReview) {
  return (
    <article className="premium-review-card" key={review.id}>
      {review.imageUrl ? (
        <div className="review-image-wrapper">
          <img src={review.imageUrl} alt={`Отзыв ${review.authorName}`} loading="lazy" decoding="async" />
        </div>
      ) : (
        <div className="review-text-content">
          <p>"{review.text}"</p>
        </div>
      )}
      <footer className="review-footer">
        <span className="review-author">{review.authorName}</span>
        <div className="review-rating">
          <span className="star">★</span> {review.rating}/5
        </div>
      </footer>
    </article>
  );
}

export function WhyTogoshol() {
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [isReviewsExpanded, setIsReviewsExpanded] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchReviews()
      .then((items) => {
        if (alive) setReviews(items);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const groupedReviews = useMemo(() => {
    return bestReviewGroups
      .map((group) => ({
        ...group,
        items: reviews.filter((review) => sourceMatches(review, group.key)).slice(0, 8),
      }))
      .filter((group) => group.items.length > 0);
  }, [reviews]);
  const topReviews = useMemo(() => reviews.slice(0, 3), [reviews]);
  const hasReviews = reviews.length > 0;
  const hasExpandedReviews = groupedReviews.some((group) => group.items.length > 3) || reviews.length > 3;

  return (
    <section id="why" className="premium-why-section">
      <div className="container">
        <div className="premium-why-header">
          <h2 className="premium-section-title">Манифест <span>TOGOSHOL</span></h2>
          <p className="premium-section-subtitle">Мы не собираем конвейерные коробки. Каждый проект — инженерное произведение.</p>
        </div>
        
        <div className="premium-benefits-grid">
          {benefits.map((benefit, index) => (
            <article className="premium-benefit-card" key={benefit.title}>
              <div className="benefit-number">{String(index + 1).padStart(2, '0')}</div>
              <div className="benefit-content">
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
              </div>
            </article>
          ))}
        </div>

        <span id="reviews" className="reviewsAnchor" aria-hidden="true" />
        {hasReviews && (
          <div className="premium-reviews-block">
            <div className="premium-reviews-header">
              <div className="reviews-title-area">
                <span className="premium-badge">Social Proof</span>
                <h3 className="premium-section-title">Слово <span>клиентам</span></h3>
              </div>
              {hasExpandedReviews && (
                <button 
                  className="premium-btn ghost" 
                  type="button" 
                  onClick={() => setIsReviewsExpanded((value) => !value)}
                >
                  {isReviewsExpanded ? 'Скрыть архив' : 'Архив отзывов'}
                </button>
              )}
            </div>

            <div className="premium-reviews-top">
              {topReviews.map((review) => renderReviewShot(review))}
            </div>

            {hasExpandedReviews && (
              <div className={`premium-reviews-expanded ${isReviewsExpanded ? 'isExpanded' : ''}`}>
                {groupedReviews.map((group) => (
                  <section className="premium-review-column" key={group.key}>
                    <header className="column-header">
                      <b>{group.title}</b>
                      <span>{group.note}</span>
                    </header>
                    <div className="column-stack">
                      {group.items.map((review) => renderReviewShot(review))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
