import { lazy, Suspense, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router';
import { site } from '../site.config.js';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { SupportFab } from '@/components/site/SupportFab';
import { SmoothScroll, ScrollManager } from '@/components/site/SmoothScroll';
import { UIProvider, useUI } from '@/components/site/ui';
import Home from '@/pages/Home';
import NotFound from '@/pages/NotFound';

// Each page is its own chunk; the prerendered HTML shows instantly and the
// page's code arrives alongside (scripts/prerender.mjs adds modulepreload links).
export const PAGES = {
  shop: () => import('@/pages/Shop'),
  collection: () => import('@/pages/Collection'),
  product: () => import('@/pages/Product'),
  story: () => import('@/pages/Story'),
  journal: () => import('@/pages/Journal'),
  article: () => import('@/pages/Article'),
  contact: () => import('@/pages/Contact'),
  faq: () => import('@/pages/Faq'),
  policy: () => import('@/pages/Policy'),
  search: () => import('@/pages/Search'),
  checkout: () => import('@/pages/Checkout'),
  order: () => import('@/pages/Order'),
};
const Shop = lazy(PAGES.shop);
const Collection = lazy(PAGES.collection);
const Product = lazy(PAGES.product);
const Story = lazy(PAGES.story);
const Journal = lazy(PAGES.journal);
const Article = lazy(PAGES.article);
const Contact = lazy(PAGES.contact);
const Faq = lazy(PAGES.faq);
const Policy = lazy(PAGES.policy);
const SearchPage = lazy(PAGES.search);
const Checkout = lazy(PAGES.checkout);
const Order = lazy(PAGES.order);
const SearchDialog = lazy(() => import('@/components/site/SearchDialog').then((m) => ({ default: m.SearchDialog })));
const QuickView = lazy(() => import('@/components/site/QuickView').then((m) => ({ default: m.QuickView })));
const BagSheet = lazy(() => import('@/components/site/BagSheet').then((m) => ({ default: m.BagSheet })));

export const ROUTES = [
  '/',
  '/shop',
  '/story',
  '/journal',
  '/contact',
  '/faq',
  '/shipping-returns',
  '/privacy',
  '/terms',
  '/search',
  '/checkout',
  '/order',
];

/** Search, quick view and bag load on first use, so they cost nothing up front. */
function Overlays() {
  const { searchOpen, quickView, bagOpen } = useUI();
  const [used, setUsed] = useState({ search: false, qv: false, bag: false });
  useEffect(() => {
    setUsed((u) => ({ search: u.search || searchOpen, qv: u.qv || !!quickView, bag: u.bag || bagOpen }));
  }, [searchOpen, quickView, bagOpen]);
  // ⌘K must work before the search code has loaded
  const { setSearchOpen } = useUI();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setSearchOpen]);
  return (
    <Suspense fallback={null}>
      {used.search && <SearchDialog />}
      {used.qv && <QuickView />}
      {site.commerce.enabled && used.bag && <BagSheet />}
    </Suspense>
  );
}

export default function App() {
  const { pathname } = useLocation();
  return (
    <UIProvider>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-cocoa focus:px-4 focus:py-2 focus:text-milk">
        Skip to content
      </a>
      <SmoothScroll />
      <ScrollManager />
      <Header overlay={pathname === '/'} />
      <main id="main" tabIndex={-1} className="outline-none">
        <Suspense fallback={<div className="min-h-[60vh]" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/collections/:handle" element={<Collection />} />
            <Route path="/products/:handle" element={<Product />} />
            <Route path="/story" element={<Story />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/journal/:slug" element={<Article />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/shipping-returns" element={<Policy policy="shipping" />} />
            <Route path="/privacy" element={<Policy policy="privacy" />} />
            <Route path="/terms" element={<Policy policy="terms" />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order" element={<Order />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <Overlays />
      <SupportFab />
    </UIProvider>
  );
}
