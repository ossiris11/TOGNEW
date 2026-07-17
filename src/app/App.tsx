import { useEffect } from 'react';
import { AdminApp } from '../admin/AdminApp';
import { Header } from '../components/Header/Header';
import { Hero } from '../components/Hero/Hero';
import { Features } from '../components/Features/Features';
import { Marquee } from '../components/Marquee/Marquee';
import { PopularBuildsCarousel } from '../components/PopularBuildsCarousel/PopularBuildsCarousel';
import { GlobalBackground } from '../components/GlobalBackground/GlobalBackground';
import { ProductCatalog } from '../components/ProductCatalog/ProductCatalog';
import { CustomBuild } from '../components/CustomBuild/CustomBuild';
import ConfiguratorPromo from '../components/ConfiguratorPromo/ConfiguratorPromo';
import { WhyTogoshol } from '../components/WhyTogoshol/WhyTogoshol';
import { TrustConditions } from '../components/TrustConditions/TrustConditions';
import { OrderProcess } from '../components/OrderProcess/OrderProcess';
import { Faq } from '../components/Faq/Faq';
import { FinalCta } from '../components/FinalCta/FinalCta';
import { StickyCta } from '../components/StickyCta/StickyCta';
import { Footer } from '../components/Footer/Footer';
import { NotFound } from '../components/NotFound/NotFound';
import { SeoHead } from '../components/SeoHead/SeoHead';
import { ContactsPage } from '../pages/ContactsPage/ContactsPage';
import { CatalogSeoPage } from '../pages/CatalogSeoPage/CatalogSeoPage';
import { ProductSeoPage } from '../pages/ProductSeoPage/ProductSeoPage';
import { LocalSeoPage } from '../pages/LocalSeoPage/LocalSeoPage';
import { ArticlePage } from '../pages/ArticlePage/ArticlePage';
import { BlogPage } from '../pages/BlogPage/BlogPage';
import { categorySeoPages, getHomeJsonLd, getLocalPageJsonLd, seoPages, type CategorySlug } from '../data/seo';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useProducts } from '../hooks/useProducts';
import { trackEvent } from '../lib/api';
import { useAppRoute } from './router';

export function App() {
  useScrollReveal();
  const { products } = useProducts();
  const { pathname, route } = useAppRoute();

  useEffect(() => {
    if (!pathname.startsWith('/admin')) trackEvent('page_view', { pathname });
  }, [pathname]);

  if (route === 'admin') return <AdminApp />;
  if (route === 'not-found') return <NotFound />;

  if (route === 'gaming-pc-novgorod') {
    return (
      <>
        <GlobalBackground />
        <SeoHead {...seoPages.gamingPcNovgorod} jsonLd={getLocalPageJsonLd(seoPages.gamingPcNovgorod, 'Продажа игровых ПК в Великом Новгороде')} />
        <Header />
        <LocalSeoPage variant="gaming" />
        <Footer />
      </>
    );
  }

  if (route === 'custom-pc-novgorod') {
    return (
      <>
        <GlobalBackground />
        <SeoHead {...seoPages.customPcNovgorod} jsonLd={getLocalPageJsonLd(seoPages.customPcNovgorod, 'Сборка ПК на заказ в Великом Новгороде')} />
        <Header />
        <LocalSeoPage variant="custom" />
        <Footer />
      </>
    );
  }

  if (route === 'upgrade-pc-novgorod') {
    return (
      <>
        <GlobalBackground />
        <SeoHead {...seoPages.upgradePcNovgorod} jsonLd={getLocalPageJsonLd(seoPages.upgradePcNovgorod, 'Апгрейд ПК в Великом Новгороде')} />
        <Header />
        <LocalSeoPage variant="upgrade" />
        <Footer />
      </>
    );
  }

  if (route === 'contacts') {
    return (
      <>
        <GlobalBackground />
        <SeoHead {...seoPages.contacts} jsonLd={getLocalPageJsonLd(seoPages.contacts, 'Консультация по игровым ПК в Великом Новгороде')} />
        <Header />
        <ContactsPage />
        <Footer />
      </>
    );
  }

  if (route === 'category') {
    const slug = pathname.split('/').at(-1) as CategorySlug;
    if (!categorySeoPages[slug]) return <NotFound />;

    return (
      <>
        <GlobalBackground />
        <Header />
        <CatalogSeoPage slug={slug} />
        <Footer />
      </>
    );
  }

  if (route === 'product') {
    const slug = pathname.split('/').at(-1) || '';

    return (
      <>
        <GlobalBackground />
        <Header />
        <ProductSeoPage slug={slug} />
        <Footer />
      </>
    );
  }

  if (route === 'blog') {
    return (
      <>
        <GlobalBackground />
        <Header />
        <BlogPage />
        <Footer />
      </>
    );
  }

  if (route === 'article') {
    const slug = pathname.split('/').at(-1) || '';
    return (
      <>
        <GlobalBackground />
        <Header />
        <ArticlePage slug={slug} />
        <Footer />
      </>
    );
  }

  return (
    <>
      <GlobalBackground />
      <SeoHead {...seoPages.home} jsonLd={getHomeJsonLd(products)} />
      <Header />
      <main>
        <Hero />
        <Marquee />
        <PopularBuildsCarousel />
        <Features />
        <ConfiguratorPromo />
        <ProductCatalog />
        <CustomBuild />
        <WhyTogoshol />
        <TrustConditions />
        <OrderProcess />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
