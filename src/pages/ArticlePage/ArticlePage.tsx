import { useAppRoute } from '../../app/router';
import { blogArticles } from '../../data/blog';
import { SeoHead } from '../../components/SeoHead/SeoHead';
import { getCanonicalUrl, getBusinessJsonLd } from '../../data/seo';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { NotFound } from '../../components/NotFound/NotFound';
import './ArticlePage.css';

export function ArticlePage({ slug }: { slug: string }) {
  const article = blogArticles.find(a => a.slug === slug);

  if (!article) {
    return <NotFound />;
  }

  const pageUrl = getCanonicalUrl(`/blog/${article.slug}`);

  const articleJsonLd = [
    getBusinessJsonLd(),
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      image: [article.image],
      datePublished: new Date(article.publishedAt).toISOString(),
      dateModified: new Date(article.publishedAt).toISOString(),
      author: [{
        '@type': 'Organization',
        name: 'TOGOSHOL',
        url: 'https://tog-pc.ru'
      }],
      publisher: {
        '@id': 'https://tog-pc.ru/#business'
      },
      description: article.description
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://tog-pc.ru' },
        { '@type': 'ListItem', position: 2, name: 'Блог', item: 'https://tog-pc.ru/blog' },
        { '@type': 'ListItem', position: 3, name: article.title, item: pageUrl },
      ],
    }
  ];

  return (
    <>
      <SeoHead 
        title={`${article.title} - Блог TOGOSHOL`}
        description={article.description}
        path={`/blog/${article.slug}`}
        image={article.image}
        jsonLd={articleJsonLd}
      />
      <main className="premium-article-page">
        <div className="container article-container">
          <div className="article-back">
            <a href="/blog" className="back-link">
              <ArrowLeft size={18} /> Вернуться в блог
            </a>
          </div>
          
          <header className="article-header">
            <div className="article-meta">
              <span className="article-meta-item">
                <Calendar size={16} />
                {new Date(article.publishedAt).toLocaleDateString('ru-RU')}
              </span>
              <span className="article-meta-item">
                <Clock size={16} />
                {article.readingTime}
              </span>
            </div>
            <h1 className="article-title">{article.title}</h1>
            <p className="article-lead">{article.description}</p>
          </header>

          <figure className="article-hero-image">
            <img src={article.image} alt={article.title} loading="lazy" />
          </figure>

          <div 
            className="article-content"
            dangerouslySetInnerHTML={{ __html: article.content }} 
          />
        </div>
      </main>
    </>
  );
}
