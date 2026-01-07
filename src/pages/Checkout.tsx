import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCart } from '../context/CartContext';
import { useAuth } from '../auth/useAuth';
import { useAlert } from '../context/AlertContext';

import { createOrder } from '../services/order';
import { getAddresses } from '../services/address';
import { BASE_URL } from '../api/axios';

import { Truck, Phone, MapPin, CheckCircle2, Loader2, Map as MapIcon, X, Search, Locate } from 'lucide-react';

// Components
import Back from '../components/Back';

// Leaflet
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Types
import type { Address } from '../types';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function Checkout() {
  const { cart, subtotal, cartId, clearCart } = useCart();
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const [address, setAddress] = useState<any | null>(null);
  const navigate = useNavigate();
  const [isOrdered, setIsOrdered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [formData, setFormData] = useState({
    address: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Address[]>([]);

  const total = subtotal + 2000;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !cartId) return;

    setIsLoading(true);

    const orderData = {
      items: cart,
      address: address!,
      phone: user.phone!,
      total_price: total,
      shipping_fee: 2000,
    }

    try {
      const response = await createOrder(orderData);
      if (response?.error === false) {
        showSuccess(response.message || 'Pedido criado com sucesso!');
        if (clearCart) {
          await clearCart();
        }
        setIsOrdered(true);
      } else if (response?.error === true) {
        showError(response.message || 'Erro ao criar pedido');
      }
    } catch (error) {
      showError('Erro ao processar o pedido');
      console.error("Order failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Fetch user addresses on mount
  useEffect(() => {
    const fetchUserAddresses = async () => {
      try {
        const data = await getAddresses();
        if (data && Array.isArray(data.addresses)) {
          setUserAddresses(data.addresses);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
      }
    };

    if (user) {
      fetchUserAddresses();
    }
  }, [user]);

  // Initialize Map with current location
  useEffect(() => {
    if (showMap && mapContainerRef.current) {
      // Default center: Cabinda, Angola (since the store delivers there) or existing address
      const cabindaPos: [number, number] = [-5.5567, 12.1894];
      const startPos: [number, number] = address?.lat && address?.long
        ? [address.lat, address.long]
        : cabindaPos;

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapContainerRef.current).setView(startPos, address?.lat ? 16 : 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstanceRef.current);

        markerRef.current = L.marker(startPos, { draggable: true }).addTo(mapInstanceRef.current);

        mapInstanceRef.current.on('click', (e: any) => {
          markerRef.current.setLatLng(e.latlng);
        });

        // If no address selected, try to locate user immediately
        if (!address?.lat && "geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userPos: [number, number] = [position.coords.latitude, position.coords.longitude];
              if (mapInstanceRef.current && markerRef.current) {
                mapInstanceRef.current.flyTo(userPos, 16);
                markerRef.current.setLatLng(userPos);
              }
            },
            (error) => {
              console.warn('Geolocation error:', error);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        }
      }

      // Cleanup on unmount or close
      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }
  }, [showMap]);

  const handleConfirmLocation = async () => {
    if (!markerRef.current) return;

    const { lat, lng } = markerRef.current.getLatLng();

    setIsGeocoding(true);

    try {
      // Use Nominatim for reverse geocoding
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
      const data = await response.json();

      if (data && data.display_name) {
        const address = data.display_name;

        setAddress({
          name: address,
          long: lng,
          lat: lat
        });

        setFormData(prev => ({
          ...prev,
          address: address,
        }));
      }
    } catch (error) {
      showError('Erro ao buscar endereço. Tente novamente');
      console.error("Geocoding error:", error);
    } finally {
      setIsGeocoding(false);
      setShowMap(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newPos: [number, number] = [parseFloat(lat), parseFloat(lon)];

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView(newPos, 16);
          markerRef.current.setLatLng(newPos);
        }
      } else {
        showError('Local não encontrado');
      }
    } catch (error) {
      console.error("Search error:", error);
      showError('Erro ao buscar local');
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocateMe = () => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition((position) => {
        const userPos: [number, number] = [position.coords.latitude, position.coords.longitude];
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo(userPos, 16);
          markerRef.current.setLatLng(userPos);
        }
        setIsLocating(false);
      }, (error) => {
        console.error("Geolocation error:", error);
        showError('Não foi possível obter sua localização. Verifique as permissões do seu navegador.');
        setIsLocating(false);
      }, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    } else {
      showError('Geolocalização não suportada pelo seu navegador');
    }
  };

  // Handle address input change with suggestions
  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, address: value }));

    // Filter suggestions based on input
    if (value.trim() && userAddresses.length > 0) {
      const filtered = userAddresses.filter(addr =>
        addr.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (selectedAddress: Address) => {
    setFormData(prev => ({ ...prev, address: selectedAddress.name }));
    setAddress({
      name: selectedAddress.name,
      long: selectedAddress.long,
      lat: selectedAddress.lat
    });
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (cart.length === 0 && !isOrdered) {
    navigate('/cart');
    return null;
  }

  if (isOrdered) {
    setTimeout(() => {
      navigate('/profile');
    }, 3000);

    return (
      <div className="max-w-7xl mx-auto px-4 py-32 flex flex-col items-center justify-center text-center">
        <CheckCircle2 className="w-20 h-20 text-green-500 mb-6 animate-bounce" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Pedido Confirmado!</h1>
        <p className="text-gray-500 mb-8 max-w-md">Obrigado pela sua compra. Enviaremos uma notificação para o seu telefone cadastrado.</p>
        <div className="text-sm text-gray-400">Redirecionando para seus pedidos...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Formulário */}
        <div>
          <Back />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Detalhes de Envio</h1>

          {!user ? (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-6 rounded-3xl mb-8">
              <h3 className="text-[#008cff] font-bold mb-2">Login Necessário</h3>
              <p className="text-sm text-blue-800/70 dark:text-blue-300 mb-4">Por favor, faça login com o Google para salvar seu endereço e acompanhar seu histórico de pedidos.</p>
              <button
                onClick={() => navigate('/login')}
                className="bg-[#008cff] text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-[#007ad6]"
              >
                Entrar com Google
              </button>
            </div>
          ) : null}

          {user && !user.phone && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 p-6 rounded-3xl mb-8">
              <h3 className="text-amber-600 font-bold mb-2 flex items-center gap-2">
                <Phone className="w-5 h-5" /> Telefone Necessário
              </h3>
              <p className="text-sm text-amber-800/70 dark:text-amber-300 mb-4">
                Você precisa cadastrar seu número de telefone para que possamos entrar em contato sobre a entrega.
              </p>
              <button
                onClick={() => navigate('/onboarding')}
                className="bg-amber-500 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors"
              >
                Cadastrar Telefone
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-full relative" ref={suggestionRef}>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Endereço</label>
                  <button
                    type="button"
                    onClick={() => setShowMap(true)}
                    className="flex items-center gap-1.5 text-xs font-black text-[#008cff] hover:text-[#007ad6] uppercase tracking-wider transition-colors"
                  >
                    <MapIcon className="w-3.5 h-3.5" /> Selecionar no Mapa
                  </button>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <input
                    required
                    type="text"
                    placeholder="Comece a digitar sua rua..."
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl py-3 pl-12 pr-10 focus:ring-2 focus:ring-[#008cff] outline-none dark:text-white transition-colors"
                    value={formData.address}
                    onChange={handleAddressInputChange}
                    autoComplete="off"
                  />

                  {/* Address Suggestions Dropdown */}
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl max-h-60 overflow-y-auto z-50">
                      {filteredSuggestions.map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => handleSelectSuggestion(addr)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 flex items-start gap-3 group"
                        >
                          <MapPin className="w-4 h-4 text-[#008cff] mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-[#008cff] transition-colors">
                              {addr.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Endereço salvo
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-full">
                <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 p-4 rounded-2xl flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl">
                    <Phone className="w-5 h-5 text-[#008cff]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Telefone de Contato</label>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.phone || 'Não cadastrado'}</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!user || !user.phone || isLoading || !address}
              className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl active:scale-95 transition-all mt-6 ${user && user.phone && !isLoading && address
                ? 'bg-[#008cff] text-white hover:bg-[#007ad6] shadow-[#008cff]/20'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Processando...
                </div>
              ) : (
                `Confirmar Pedido • Kz ${total.toLocaleString()}`
              )}
            </button>
          </form>
        </div>

        {/* Resumo do Pedido */}
        <div className="lg:pl-12">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Truck className="w-6 h-6" /> Seu Pedido
            </h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0">
                      <img src={`${BASE_URL}/${item.product.image_url}`} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">Kz {(item.product.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>Kz {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Frete</span>
                <span>Kz 2.000</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-3">
                <span>Total</span>
                <span className="text-[#008cff]">Kz {total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Modal */}
      {showMap && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-8">
          <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm" onClick={() => setShowMap(false)}></div>
          <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 h-[90vh] sm:h-[80vh]">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">Selecione o Endereço</h2>
                <p className="text-[10px] sm:text-xs text-gray-500">Toque no mapa para posicionar o marcador</p>
              </div>
              <button
                onClick={() => setShowMap(false)}
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 relative">
              <div ref={mapContainerRef} className="absolute inset-0 z-0"></div>
              {/* Overlay for feedback */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none w-full px-4 flex justify-center">
                <span className="bg-gray-900/90 text-white text-[9px] sm:text-[10px] font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg backdrop-blur-md uppercase tracking-widest border border-white/10 text-center">
                  Mova o marcador ou toque para escolher
                </span>
              </div>

              {/* Map Controls */}
              <div className="absolute top-16 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                <form onSubmit={handleSearch} className="pointer-events-auto w-full max-w-md mx-auto relative group">
                  <div className="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-2xl -m-1 group-focus-within:bg-[#008cff]/20 transition-all duration-300"></div>
                  <div className="relative flex items-center bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar endereço..."
                      className="flex-1 px-4 py-3 bg-transparent outline-none text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400"
                    />
                    <button
                      type="submit"
                      disabled={isSearching}
                      className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border-l border-gray-100 dark:border-gray-700 transition-colors"
                    >
                      {isSearching ? (
                        <Loader2 className="w-4 h-4 text-[#008cff] animate-spin" />
                      ) : (
                        <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                </form>
              </div>

              <div className="absolute bottom-6 right-4 z-50 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleLocateMe}
                  disabled={isLocating}
                  className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:text-[#008cff] active:scale-95 transition-all disabled:opacity-50"
                  title="Minha Localização"
                >
                  {isLocating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Locate className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 w-full sm:w-auto">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#008cff] shrink-0" />
                <span className="text-[10px] sm:text-xs font-bold truncate max-w-full">O endereço será detectado automaticamente</span>
              </div>
              <button
                onClick={handleConfirmLocation}
                disabled={isGeocoding}
                className="w-full sm:w-auto bg-[#008cff] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm hover:bg-[#007ad6] shadow-xl shadow-[#008cff]/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {isGeocoding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Buscando Endereço...
                  </>
                ) : (
                  'Confirmar Localização'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;