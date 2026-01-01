import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import type { CartItem } from '../types';
import { formatPrice } from '../utils/formatPrice';
import { useCart } from '../context/CartContext';
import { BASE_URL } from '../api/axios';

// Components
import Back from '../components/Back';

function Cart() {
    const { cart, removeFromCart, updateQuantity, subtotal } = useCart();
    const navigate = useNavigate();
    const shipping = 1500.00;
    const tax = subtotal * 0.1;
    const total = subtotal + shipping + tax;

    if (cart.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 text-gray-400">
                    <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Seu carrinho está vazio</h1>
                <p className="text-gray-500 mb-8 max-w-xs text-sm sm:text-base">Parece que você ainda não adicionou nada ao seu carrinho.</p>
                <Link to="/" className="bg-[#008cff] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#007ad6] transition-all text-sm sm:text-base shadow-lg shadow-blue-500/20">
                    Começar a Comprar
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 pb-12">
            <Back />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 mt-4">Carrinho de Compras</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* List */}
                <div className="lg:col-span-2 space-y-4">
                    {cart.map((item: CartItem) => (
                        <div key={item.id} className="group relative bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-3xl border border-gray-100 dark:border-gray-700 flex gap-3 sm:gap-4 items-center shadow-sm hover:shadow-md transition-all">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-900 shrink-0">
                                <img src={`${BASE_URL}/${item.product.image_url}`} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            </div>

                            <div className="flex-1 min-w-0 pr-8">
                                <Link to={`/produto/${item.product.public_id}`} className="text-left font-bold text-gray-900 dark:text-white hover:text-[#008cff] transition-colors line-clamp-1 text-sm sm:text-base">
                                    {item.product.name}
                                </Link>

                                <p className="text-left text-gray-400 capitalize text-xs sm:text-sm">{item.product.category}</p>

                                <div className="mt-2 flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
                                    <div className="flex items-center bg-gray-50 dark:bg-gray-900 rounded-xl p-1 border border-gray-100 dark:border-gray-700">
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </button>
                                        <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-bold dark:text-white">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </button>
                                    </div>
                                    <span className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap">
                                        {formatPrice(item.product.price * item.quantity)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                                title="Remover item"
                            >
                                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="lg:h-fit lg:sticky lg:top-24">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-5 sm:p-6 shadow-sm">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-6">Resumo do Pedido</h2>
                        <div className="space-y-4 mb-6 text-sm sm:text-base">
                            <div className="flex justify-between text-gray-500">
                                <span>Subtotal</span>
                                <span className="text-gray-900 dark:text-white font-semibold">{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Frete</span>
                                <span className="text-gray-900 dark:text-white font-semibold">{formatPrice(shipping)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Imposto Estimado</span>
                                <span className="text-gray-900 dark:text-white font-semibold">{formatPrice(tax)}</span>
                            </div>
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                                <span className="text-2xl font-bold text-[#008cff]">{formatPrice(total)}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="w-full flex items-center justify-center gap-3 bg-[#008cff] text-white py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg hover:bg-[#007ad6] shadow-xl shadow-[#008cff]/20 active:scale-95 transition-all"
                        >
                            Finalizar Compra <ArrowRight className="w-5 h-5" />
                        </button>

                        <p className="text-center text-xs text-gray-400 mt-4">
                            Pagamento seguro garantido pela Dtudo Shop.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;