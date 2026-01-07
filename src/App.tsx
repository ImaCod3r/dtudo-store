import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Providers
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './auth/AuthProvider';
import { CartProvider } from './context/CartContext';
import { LocationProvider } from './context/LocationContext';
import { AlertProvider } from './context/AlertContext';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import News from './pages/News';
import Services from './pages/Services';
import BestSellers from './pages/BestSellers';
import Onboarding from './pages/Onboarding';
import About from './pages/About';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Shipping from './pages/Shipping';
import Returns from './pages/Returns';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import PhoneAlert from './components/PhoneAlert';
import PushNotificationDialog from './components/PushNotificationDialog';
import { InstallPrompt } from './components/InstallPrompt';

function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  return (
    <>
      <InstallPrompt />
      <PushNotificationDialog />
      <AuthProvider>
        <GoogleOAuthProvider clientId={clientId}>
          <LocationProvider>
            <AlertProvider>
              <CartProvider>
                <Router>
                  <Routes>
                    {/* Login Route - Standalone Layout */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/onboarding" element={<Onboarding />} />

                    {/* Main App Routes - With Header, Breadcrumbs, and Footer */}
                    <Route path="/*" element={
                      <>
                        <PhoneAlert />
                        <Header />
                        <main className="pt-40 md:pt-52">
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
                          </Routes>
                        </main>
                        <Footer />
                      </>
                    } />
                  </Routes>
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
