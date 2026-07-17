import { seoPages } from '../../data/seo';
import { blogArticles } from '../../data/blog';
import { SeoHead } from '../../components/SeoHead/SeoHead';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import './BlogPage.css';

export function BlogPage() {
  return (
    <>
      <SeoHead 
        title="Блог о ПК и комплектующих - TOGOSHOL"
        description="Полезные статьи о сборке компьютеров, выборе комплектующих и настройке игровых ПК в Великом Новгороде."
        path="/blog"
      />
      <main className="premium-blog-page">
        <div className="container">
          <div className="blog-hero">
            <h1 className="premium-section-title">
              Блог <span>TOGOSHOL</span>
            </h1>
            <p className="premium-section-subtitle">
              Полезные статьи, гайды по сборке и новости из мира железа
            </p>
          </div>

          <div className="blog-grid">
            {blogArticles.map((article) => (
              <article key={article.slug} className="blog-card">
                <a href={`/blog/${article.slug}`} className="blog-card-image-link">
                  <img src={article.image} alt={article.title} loading="lazy" />
                </a>
                <div className="blog-card-content">
                  <div className="blog-meta">
                    <span className="blog-meta-item">
                      <Calendar size={14} />
                      {new Date(article.publishedAt).toLocaleDateString('ru-RU')}
                    </span>
                    <span className="blog-meta-item">
                      <Clock size={14} />
                      {article.readingTime}
                    </span>
                  </div>
                  <h2 className="blog-card-title">
                    <a href={`/blog/${article.slug}`}>{article.title}</a>
                  </h2>
                  <p className="blog-card-excerpt">{article.description}</p>
                  <a href={`/blog/${article.slug}`} className="premium-btn ghost small blog-read-more">
                    Читать статью <ArrowRight size={16} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
