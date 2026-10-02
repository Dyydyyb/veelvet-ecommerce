import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Intro3DLoader } from './components/3d/Intro3DLoader';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { CustomCursor } from './components/common/CustomCursor';
import { Toast } from './components/common/Toast';
import { CartDrawer } from './components/cart/CartDrawer';
import { SizeGuideModal } from './components/product/SizeGuideModal';

// Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { SizeGuidePage } from './pages/SizeGuidePage';
import { CarePage } from './pages/CarePage';
import { ShippingPage } from './pages/ShippingPage';
import { FaqPage } from './pages/FaqPage';
import { WholesalePage } from './pages/WholesalePage';
import { ShowroomPage } from './pages/ShowroomPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Scroll to top helper on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, [pathname]);

  return null;
}

export function App() {
  return (
    <BrowserRouter>
      {/* 3D Cinematic Intro Loader (Curtain reveal) */}
      <Intro3DLoader />

      {/* Desktop Custom Cursor */}
      <CustomCursor />

      {/* Global Modals and Drawers */}
      <CartDrawer />
      <SizeGuideModal />
      <Toast />
      <ScrollToTop />

      <div className="flex flex-col min-h-screen bg-white text-navy selection:bg-beige-300 selection:text-navy">
        <Header />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tienda" element={<ShopPage />} />
            <Route path="/producto/:id" element={<ProductDetailPage />} />
            <Route path="/guia-de-talles" element={<SizeGuidePage />} />
            <Route path="/cuidados" element={<CarePage />} />
            <Route path="/envios" element={<ShippingPage />} />
            <Route path="/preguntas-frecuentes" element={<FaqPage />} />
            <Route path="/mayoristas" element={<WholesalePage />} />
            <Route path="/showroom" element={<ShowroomPage />} />
            <Route path="/contacto" element={<ShowroomPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
