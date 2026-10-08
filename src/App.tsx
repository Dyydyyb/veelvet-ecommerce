import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Intro3DLoader } from './components/3d/Intro3DLoader';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { CustomCursor } from './components/common/CustomCursor';
import { Toast } from './components/common/Toast';
import { FloatingWhatsApp } from './components/common/FloatingWhatsApp';
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
import { AdminPage } from './pages/admin/AdminPage';

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

// Layout Switcher for Public Store vs Internal Backoffice
function AppContent() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <>
      {/* 3D Intro only on public store home */}
      {!isAdmin && <Intro3DLoader />}

      {/* Desktop Custom Cursor */}
      {!isAdmin && <CustomCursor />}

      {/* Global Modals and Drawers */}
      <CartDrawer />
      <SizeGuideModal />
      <Toast />
      {!isAdmin && <FloatingWhatsApp />}
      <ScrollToTop />

      {isAdmin ? (
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/*" element={<AdminPage />} />
        </Routes>
      ) : (
        <div className="flex flex-col min-h-screen bg-[#f3eee3] text-[#1F2A44] selection:bg-beige-300 selection:text-navy">
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
      )}
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
