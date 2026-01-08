import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { lazy, Suspense } from 'react';

// Providers
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './auth/AuthProvider';
import { CartProvider } from './context/CartContext';
import { LocationProvider } from './context/LocationContext';
import { AlertProvider } from './context/AlertContext';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages - Lazy loaded
const Home = lazy(() => import('./pages/Home'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Cart = lazy(() => import('./pages/Cart'));
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));
const Checkout = lazy(() => import('./pages/Checkout'));
const News = lazy(() => import('./pages/News'));
const Services = lazy(() => import('./pages/Services'));
const BestSellers = lazy(() => import('./pages/BestSellers'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const About = lazy(() => import('./pages/About'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Shipping = lazy(() => import('./pages/Shipping'));
const Returns = lazy(() => import('./pages/Returns'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Contact = lazy(() => import('./pages/Contact'));
const Affiliates = lazy(() => import('./pages/Affiliates'));
const NotFound = lazy(() => import('./pages/NotFound'));

import PhoneAlert from './components/PhoneAlert';
import PushNotificationDialog from './components/PushNotificationDialog';
import { InstallPrompt } from './components/InstallPrompt';
import { WhatsAppButton } from './components/WhatsAppButton';
import AffiliateTracker from './components/AffiliateTracker';

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
  </div>
);

function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  return (
    <>
      <WhatsAppButton />
      <InstallPrompt />
      <PushNotificationDialog />
      <AuthProvider>
        <GoogleOAuthProvider clientId={clientId}>
          <LocationProvider>
            <AlertProvider>
              <CartProvider>
                <Router>
                  <AffiliateTracker />
                  <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                      {/* Login Route - Standalone Layout */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/onboarding" element={<Onboarding />} />

                      {/* Main App Routes - With Header, Breadcrumbs, and Footer */}
                      <Route path="/*" element={
                        <>
                          <PhoneAlert />
                          <Header />
                          <main className="pt-32 md:pt-52">
                            <Routes>
                              <Route path="/profile" element={<Profile />} />
                              <Route path="/" element={<Home />} />
                              <Route path="/categoria/:category/:subcategory?" element={<Home />} />
                              <Route path="/produto/:public_id" element={<ProductDetails />} />
                              <Route path="/cart" element={<Cart />} />
                              <Route path="/checkout" element={<Checkout />} />
                              <Route path="/novidades" element={<News />} />
                              <Route path="/servicos" element={<Services />} />
                              <Route path="/mais-vendidos" element={<BestSellers />} />
                              <Route path="/sobre-nos" element={<About />} />
                              <Route path="/termos" element={<Terms />} />
                              <Route path="/privacidade" element={<Privacy />} />
                              <Route path="/envio" element={<Shipping />} />
                              <Route path="/devolucoes" element={<Returns />} />
                              <Route path="/faq" element={<FAQ />} />
                              <Route path="/contato" element={<Contact />} />
                              <Route path="/afiliados" element={<Affiliates />} />
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </main>
                          <Footer />
                        </>
                      } />
                    </Routes>
                  </Suspense>
                </Router>
              </CartProvider>
            </AlertProvider>
          </LocationProvider>
        </GoogleOAuthProvider>
      </AuthProvider>
    </>
  );
}

export default App
