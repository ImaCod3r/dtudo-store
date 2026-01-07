import { useState, useEffect } from 'react';
import { Package, MapPin, LogOut, ChevronLeft, ChevronRight, ShoppingBag, Home, Trash2, Loader2, X, Phone, Calendar, CreditCard, Edit2, Camera, User as UserIcon, ShieldCheck } from 'lucide-react';

// Services
import { getUserOrders } from '../services/order';
import { getAddresses, deleteAddress } from '../services/address';

// Hooks
import { useAuth } from '../auth/useAuth';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../context/AlertContext';
import { updateUser } from '../services/auth';

// Utils
import { formatPrice } from '../utils/formatPrice';

// Components


// Types
import type { Order, Address, Pagination } from '../types';
import { BASE_URL } from '../api/axios';

function Profile() {
    const { user, logout, refreshUser } = useAuth();
    const navigate = useNavigate();
    const { showSuccess, showError } = useAlert();
    // States
    const [activeSection, setActiveSection] = useState<'orders' | 'addresses'>('orders');
    const [orders, setOrders] = useState<Order[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editForm, setEditForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        avatar: null as File | null,
    });

    const fetchOrders = async (page: number = 1) => {
        setIsLoadingOrders(true);
        try {
            const response = await getUserOrders(page);
            if (response && response.orders) {
                setOrders(response.orders);
                setPagination(response.pagination || null);
            } else if (Array.isArray(response)) {
                setOrders(response);
                setPagination(null);
            } else if (response && Array.isArray(response.data)) {
                setOrders(response.data);
                setPagination(response.pagination || null);
            } else {
                setOrders([]);
                setPagination(null);
            }
        } catch (error: any) {
            if (!user) return;
            if (error.response?.status === 500) {
                showError('Erro ao buscar pedidos');
            }
            console.error('Erro ao buscar pedidos:', error);
        } finally {
            setIsLoadingOrders(false);
        }
    };

    const fetchAddresses = async () => {
        setIsLoadingAddresses(true);
        try {
            const data = await getAddresses();

            if (!data) {
                setAddresses([]);
                return;
            }
            setAddresses(Array.isArray(data?.addresses) ? data.addresses : []);
        } catch (error: any) {
            if (!user) return;

            if (error.response?.status === 500) {
                showError('Erro ao buscar endereços');
            }
            console.error('Erro ao buscar endereços:', error);

            setAddresses([]);
        } finally {
            setIsLoadingAddresses(false);
        }
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            await updateUser({
                name: editForm.name,
                phone: editForm.phone,
                avatar: editForm.avatar || undefined
            });
            await refreshUser();
            showSuccess('Perfil atualizado com sucesso!');
            setIsEditingProfile(false);
        } catch (error) {
            showError('Erro ao atualizar perfil');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteAddress = async (id: number) => {
        const previousAddresses = [...addresses];
        setAddresses((prev: Address[]) => prev.filter((addr: Address) => addr.id !== id));

        try {
            await deleteAddress(id);
            showSuccess('Endereço excluído com sucesso');
        } catch (error) {
            setAddresses(previousAddresses);
            showError('Erro ao excluir endereço');
            console.error('Erro ao excluir endereço:', error);
        }
    }

    useEffect(() => {
        if (activeSection === 'orders') {
            fetchOrders(currentPage);
        } else if (activeSection === 'addresses') {
            fetchAddresses();
        }
    }, [activeSection, currentPage]);

    if (!user) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Acesso Negado</h1>
                <p className="text-gray-500 mb-8">Por favor, faça login para ver seu perfil e histórico de pedidos.</p>
                <button
                    onClick={() => navigate('/login')}
                    className="bg-[#008cff] text-white px-8 py-3 rounded-2xl font-bold"
                >
                    Fazer login
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            {/* User Header - Modernized */}
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 sm:p-10 border border-gray-100 dark:border-gray-700 shadow-xl shadow-blue-500/5 flex flex-col md:flex-row items-center gap-10 mb-12 relative overflow-hidden transition-all duration-300">
                {/* Decorative Background Element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 dark:bg-blue-900/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>

                <div className="relative group shrink-0">
                    <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white dark:ring-gray-800 shadow-2xl flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                        {user?.avatar ? (
                            <img
                                src={user.avatar.startsWith('http') ? user.avatar : `${BASE_URL}/${user.avatar}`}
                                alt={user?.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-linear-to-br from-[#028dfe] to-blue-600 flex items-center justify-center text-white text-4xl font-black">
                                {user?.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left z-10 w-full">
                    <div className="mb-4">
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2 leading-tight tracking-tight">
                            {user?.name}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">{user?.email}</p>
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> Cliente Verificado
                        </span>
                        {user.phone && (
                            <span className="bg-blue-50 dark:bg-blue-900/20 text-[#028dfe] dark:text-blue-400 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex items-center gap-2">
                                <Phone className="w-4 h-4" /> {user.phone}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 z-10">
                    <button
                        onClick={() => {
                            setEditForm({
                                name: user?.name || '',
                                phone: user?.phone || '',
                                avatar: null,
                            });
                            setIsEditingProfile(true);
                        }}
                        className="w-12 h-12 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 text-gray-400 hover:text-[#028dfe] rounded-2xl border border-gray-100 dark:border-gray-600 transition-all hover:shadow-lg active:scale-95"
                        title="Editar Perfil"
                    >
                        <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={logout}
                        className="w-12 h-12 flex items-center justify-center bg-red-50 dark:bg-red-900/10 text-red-500 rounded-2xl border border-red-100 dark:border-red-900/30 transition-all hover:shadow-lg active:scale-95"
                        title="Sair"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Profile Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700 shadow-xl shadow-blue-500/5">
                        <h3 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-8 ml-2">Minha Conta</h3>
                        <nav className="space-y-2">
                            <button
                                onClick={() => setActiveSection('orders')}
                                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 ${activeSection === 'orders'
                                    ? 'bg-[#028dfe] text-white shadow-xl shadow-blue-500/20'
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 font-bold'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <ShoppingBag className="w-5 h-5" />
                                    <span className="tracking-tight">Meus Pedidos</span>
                                </div>
                                <ChevronRight className={`w-4 h-4 transition-transform ${activeSection === 'orders' ? 'rotate-90' : ''}`} />
                            </button>
                            <button
                                onClick={() => setActiveSection('addresses')}
                                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 ${activeSection === 'addresses'
                                    ? 'bg-[#028dfe] text-white shadow-xl shadow-blue-500/20'
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 font-bold'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <MapPin className="w-5 h-5" />
                                    <span className="tracking-tight">Endereços</span>
                                </div>
                                <ChevronRight className={`w-4 h-4 transition-transform ${activeSection === 'addresses' ? 'rotate-90' : ''}`} />
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-8 space-y-6">
                    {activeSection === 'orders' ? (
                        <>
                            <div className="flex items-center justify-between px-4">
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
                                    Meus Pedidos
                                </h2>
                                <span className="bg-blue-50 dark:bg-blue-900/20 text-[#028dfe] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-800">
                                    {pagination?.total_items || orders.length} Totais
                                </span>
                            </div>

                            {isLoadingOrders ? (
                                <div className="flex flex-col items-center justify-center min-h-[400px]">
                                    <div className="relative">
                                        <div className="w-16 h-16 border-4 border-blue-100 rounded-full animate-spin border-t-[#028dfe]"></div>
                                        <Loader2 className="w-6 h-6 text-[#028dfe] absolute inset-0 m-auto animate-pulse" />
                                    </div>
                                    <p className="mt-6 text-gray-400 font-bold uppercase tracking-widest text-xs">A carregar pedidos...</p>
                                </div>
                            ) : orders?.length === 0 ? (
                                <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-16 border border-gray-100 dark:border-gray-700 shadow-xl shadow-blue-500/5 flex flex-col items-center text-center transition-all">
                                    <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-8">
                                        <ShoppingBag className="w-12 h-12 text-[#028dfe]" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Nenhum pedido ainda</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-sm font-medium leading-relaxed">Parece que ainda não encontraste o teu produto favorito. Explora a nossa loja!</p>
                                    <button
                                        onClick={() => navigate('/')}
                                        className="bg-[#028dfe] text-white px-10 py-5 rounded-4xl font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Explorar Produtos
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {(orders as Order[]).map((order: Order) => (
                                        <div
                                            key={order.id}
                                            onClick={() => setSelectedOrder(order)}
                                            className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl shadow-blue-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group hover:border-[#028dfe]/40 transition-all cursor-pointer relative overflow-hidden active:scale-[0.98]"
                                        >
                                            <div className="flex items-center gap-6 relative z-10">
                                                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900/50 rounded-2xl flex items-center justify-center text-[#028dfe] group-hover:scale-110 transition-transform">
                                                    <Package className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Pedido #{order.id}</span>
                                                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${order.status === 'Entregue'
                                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                                            : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-gray-400 font-bold">
                                                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(order.createdAt).toLocaleDateString('pt-AO')}</span>
                                                        <div className="w-1.5 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                                        <span className="flex items-center gap-1.5"><ShoppingBag className="w-3.5 h-3.5" /> {order.items?.length || 0} Itens</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 self-end sm:self-center pr-2">
                                                <p className="text-xl font-black text-[#028dfe] tracking-tight">{formatPrice(order.total_price)}</p>
                                                <div className="bg-[#028dfe]/5 text-[#028dfe] p-2 rounded-xl sm:opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                    <ChevronRight className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Pagination Controls - Modernized */}
                                    {pagination && pagination.total_pages > 1 && (
                                        <div className="flex items-center justify-center gap-6 pt-10">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1 || isLoadingOrders}
                                                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-400 disabled:opacity-20 hover:text-[#028dfe] hover:shadow-lg transition-all"
                                            >
                                                <ChevronLeft className="w-6 h-6" />
                                            </button>

                                            <div className="flex items-center gap-3">
                                                <span className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#028dfe] text-white font-black shadow-xl shadow-blue-500/30">
                                                    {currentPage}
                                                </span>
                                                <span className="text-gray-400 font-black text-xs uppercase tracking-widest px-2">de</span>
                                                <span className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-400 font-black">
                                                    {pagination.total_pages}
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(pagination.total_pages, prev + 1))}
                                                disabled={currentPage === pagination.total_pages || isLoadingOrders}
                                                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-400 disabled:opacity-20 hover:text-[#028dfe] hover:shadow-lg transition-all"
                                            >
                                                <ChevronRight className="w-6 h-6" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-between px-4">
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
                                    Meus Endereços
                                </h2>
                                <button
                                    className="bg-blue-50 dark:bg-blue-900/20 text-[#028dfe] text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-blue-100 dark:border-blue-800 hover:bg-[#028dfe] hover:text-white transition-all shadow-lg active:scale-95"
                                >
                                    Adicionar
                                </button>
                            </div>

                            {isLoadingAddresses ? (
                                <div className="flex flex-col items-center justify-center min-h-[300px]">
                                    <div className="w-12 h-12 border-4 border-blue-50 rounded-full animate-spin border-t-[#028dfe]"></div>
                                </div>
                            ) : addresses.length === 0 ? (
                                <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-16 border border-gray-100 dark:border-gray-700 shadow-xl shadow-blue-500/5 flex flex-col items-center text-center transition-all">
                                    <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900/50 rounded-full flex items-center justify-center mb-8">
                                        <Home className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Nenhum endereço</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-sm font-medium">Cadastra um endereço para acelerar as tuas entregas.</p>
                                    <button
                                        className="bg-[#028dfe] text-white px-10 py-5 rounded-4xl font-black shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest"
                                    >
                                        Novo Endereço
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(addresses as Address[]).map((address: Address) => (
                                        <div key={address.id} className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl shadow-blue-500/5 group hover:border-[#028dfe]/40 transition-all flex items-center gap-6">
                                            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-[#028dfe] shrink-0">
                                                <MapPin className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="font-black text-gray-900 dark:text-white truncate block">{address.name}</span>
                                            </div>
                                            <button
                                                className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                                                onClick={() => handleDeleteAddress(address.id)}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Order Details Modal */}
            {
                selectedOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300">
                            <div className="sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between z-10">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Detalhes do Pedido</h3>
                                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">#{selectedOrder.public_id || selectedOrder.id}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="p-3 bg-gray-50 dark:bg-gray-700/50 text-gray-400 hover:text-red-500 rounded-2xl transition-all active:scale-90"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-8 space-y-10">
                                {/* Order Info Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800">
                                        <Calendar className="w-5 h-5 text-[#028dfe] mb-3" />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Data</p>
                                        <p className="text-sm font-black text-gray-900 dark:text-white">
                                            {new Date(selectedOrder.createdAt).toLocaleDateString('pt-AO')}
                                        </p>
                                    </div>
                                    <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800">
                                        <CreditCard className="w-5 h-5 text-[#028dfe] mb-3" />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Total</p>
                                        <p className="text-sm font-black text-[#028dfe]">
                                            {formatPrice(selectedOrder.total_price)}
                                        </p>
                                    </div>
                                    <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800">
                                        <Package className="w-5 h-5 text-[#028dfe] mb-3" />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Status</p>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${selectedOrder.status === 'Entregue'
                                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                            : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                                            }`}>
                                            {selectedOrder.status}
                                        </span>
                                    </div>
                                    <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800">
                                        <Phone className="w-5 h-5 text-[#028dfe] mb-3" />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Contato</p>
                                        <p className="text-sm font-black text-gray-900 dark:text-white truncate">
                                            {selectedOrder.phone_number}
                                        </p>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div>
                                    <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                        Itens do Pedido <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800"></div>
                                    </h4>
                                    <div className="space-y-4">
                                        {selectedOrder.items.map((item: any) => (
                                            <div key={item.id} className="flex gap-6 p-5 rounded-4xl border border-gray-100 dark:border-gray-700 hover:border-[#028dfe]/30 transition-all group">
                                                <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900/50 rounded-2xl overflow-hidden shrink-0 ring-1 ring-gray-100 dark:ring-gray-800 group-hover:ring-[#028dfe]/30 transition-all">
                                                    <img
                                                        src={`${BASE_URL}/${item.image}`}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div>
                                                            <p className="text-[10px] text-[#028dfe] font-black uppercase tracking-widest mb-1.5">{item.category}</p>
                                                            <h5 className="text-lg font-black text-gray-900 dark:text-white line-clamp-1 tracking-tight">{item.name}</h5>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                                                                {formatPrice(item.price)}
                                                            </p>
                                                            <span className="text-[11px] font-bold text-gray-400 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 rounded-xl">
                                                                Qtd: {item.quantity}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 font-medium">Subtotal</span>
                                            <span className="font-black text-gray-900 dark:text-white">{formatPrice(selectedOrder.total_price)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 font-medium">Portes de Envio</span>
                                            <span className="text-emerald-500 font-black uppercase text-[10px] tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full">Grátis</span>
                                        </div>
                                        <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-black text-xl text-gray-900 dark:text-white tracking-tight">Total Final</span>
                                            <span className="font-black text-2xl text-[#028dfe] tracking-tight">{formatPrice(selectedOrder.total_price)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Profile Edit Modal */}
            {
                isEditingProfile && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-white dark:bg-gray-800 rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                            <div className="p-10">
                                <div className="flex justify-between items-center mb-10">
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Editar Perfil</h3>
                                    <button
                                        onClick={() => setIsEditingProfile(false)}
                                        className="p-3 bg-gray-50 dark:bg-gray-700/50 text-gray-400 hover:text-[#028dfe] rounded-2xl transition-all active:scale-90"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleUpdateProfile} className="space-y-8">
                                    {/* Avatar Upload */}
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative group">
                                            <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-blue-50 dark:ring-blue-900/20 flex items-center justify-center bg-gray-100 dark:bg-gray-700 shadow-xl">
                                                {editForm.avatar ? (
                                                    <img
                                                        src={URL.createObjectURL(editForm.avatar)}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : user?.avatar ? (
                                                    <img
                                                        src={user.avatar.startsWith('http') ? user.avatar : `${BASE_URL}/${user.avatar}`}
                                                        alt="Avatar"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-linear-to-br from-[#028dfe] to-blue-600 flex items-center justify-center text-white text-4xl font-black uppercase">
                                                        {user?.name.charAt(0)}
                                                    </div>
                                                )}

                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                    <Camera className="w-8 h-8 text-white" />
                                                </div>
                                            </div>
                                            <input
                                                type="file"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) setEditForm({ ...editForm, avatar: file });
                                                }}
                                            />
                                        </div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Toque para alterar imagem</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">Nome Completo</label>
                                            <div className="relative group">
                                                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#028dfe] transition-colors" />
                                                <input
                                                    type="text"
                                                    value={editForm.name}
                                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-transparent focus:border-[#028dfe]/20 rounded-2xl py-5 pl-14 pr-6 focus:ring-4 focus:ring-[#028dfe]/5 outline-none text-gray-900 dark:text-white font-bold transition-all"
                                                    placeholder="O teu nome"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">Telefone / WhatsApp</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#028dfe] transition-colors" />
                                                <input
                                                    type="tel"
                                                    value={editForm.phone}
                                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-transparent focus:border-[#028dfe]/20 rounded-2xl py-5 pl-14 pr-6 focus:ring-4 focus:ring-[#028dfe]/5 outline-none text-gray-900 dark:text-white font-bold transition-all"
                                                    placeholder="9XX XXX XXX"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isUpdating}
                                        className="w-full bg-[#028dfe] text-white py-5 rounded-4xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-blue-500/30 mt-4"
                                    >
                                        {isUpdating ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <span>Salvar Dados</span>
                                                <ShieldCheck className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

export default Profile;