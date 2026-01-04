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


function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  return (
    <>
      <AuthProvider>
        <GoogleOAuthProvider clientId={clientId}>
          <LocationProvider>
            <AlertProvider>
              <CartProvider>
                <Router>
                  <Routes>
                    {/* Login Route - Standalone Layout */}
                    <Route path="/login" element={<Login />} />

                    {/* Main App Routes - With Header, Breadcrumbs, and Footer */}
                    <Route path="/*" element={
                      <>
                        <Header />
                        <main className="pt-40 md:pt-52">
                          <Routes>
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/" element={<Home />} />
                            <Route path="/categoria/:category/:subcategory?" element={<Home />} />
                            <Route path="/produto/:public_id" element={<ProductDetails />} />
                            <Route path="/cart" element={<Cart />} />
                            <Route path="/checkout" element={<Checkout />} />
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
