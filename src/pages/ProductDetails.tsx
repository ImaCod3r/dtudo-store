import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Share2, ShoppingCart, ArrowLeft, Plus, Minus, Check } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import affiliateService from '../services/affiliateService';
import { useAlert } from '../context/AlertContext';

import type { Product, Affiliate } from '../types';
import api, { BASE_URL } from '../api/axios';

// Components
import Back from '../components/Back';
import { SEO } from '../components/SEO';

function ProductDetails() {
    const { addToCart } = useCart();
    const { showSuccess } = useAlert();
    const { user } = useAuth();
    const { public_id } = useParams<{ public_id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
    const [copied, setCopied] = useState(false);

    const fetchProduct = async () => {
        try {
            const response = await api.get(`/products/${public_id}`);
            setProduct(response.data.product);
        } catch (error) {
            console.error(error);
        }
    }

    const fetchAffiliate = async () => {
        if (!user) return;
        try {
            const response = await affiliateService.getMe();
            if (response && response.data) {
                setAffiliate(response.data);
            }
        } catch (error) {
            console.error('Error fetching affiliate:', error);
        }
    };

    useEffect(() => {
        fetchProduct();
        fetchAffiliate();
    }, [public_id, user]);

    const handleShare = async () => {
        const affiliateCode = affiliate?.is_affiliate ? (affiliate?.stats?.code || affiliate?.affiliate?.code) : localStorage.getItem('affiliate_code');
        const shareUrl = affiliateCode
            ? `${window.location.origin}/produto/${public_id}?r=${affiliateCode}`
            : `${window.location.origin}/produto/${public_id}`;

        const shareData = {
            title: product?.name,
            text: product?.description,
            url: shareUrl,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Share failed:', err);
            }
        } else {
            navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            showSuccess('Link copiado com sucesso!');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!product) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-500">
                <p className="mb-4">Produto não encontrado.</p>
                <button onClick={() => navigate('/')} className="text-[#008cff] font-medium flex items-center gap-1">
                    <ArrowLeft className="w-4 h-4" /> Voltar para o início
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto sm:px-4 lg:px-8 pb-12">
            <SEO
                title={product.name}
                description={product.description}
                image={product.image_url.startsWith('http') ? product.image_url : `${BASE_URL}/${product.image_url}`}
                type="product"
                schema={{
                    "@context": "https://schema.org",
                    "@type": "Product",
                    "name": product.name,
                    "image": product.image_url.startsWith('http') ? product.image_url : `${BASE_URL}/${product.image_url}`,
                    "description": product.description,
                    "sku": product.id,
                    "offers": {
                        "@type": "Offer",
                        "price": product.price,
                        "priceCurrency": "AOA",
                        "availability": "https://schema.org/InStock",
                        "url": window.location.href
                    }
                }}
            />
            {/* Back Button */}
            <Back />

            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 bg-white dark:bg-gray-800 rounded-3xl lg:rounded-[3rem] p-4 sm:p-6 lg:p-12 transition-colors duration-300">
                {/* Product Image */}
                <div>
                    <div className="aspect-square sm:aspect-video rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shadow-inner">
                        <img src={product.image_url.startsWith('http') ? product.image_url : `${BASE_URL}/${product.image_url}`} alt={product.name} className="w-full h-full object-contain p-4 sm:p-8" />
                    </div>

                    <div className="mt-auto pt-8 border-t border-gray-50 dark:border-gray-700 grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Envio</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">Para Luanda e Cabinda</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Devolução</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">Grátis em 30 dias</p>
                        </div>
                    </div>

                </div>

                {/* Info */}
                <div className="flex flex-col py-4">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="bg-[#008cff]/10 text-[#008cff] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {product.category}
                        </span>
                    </div>

                    <h1 className="text-2xl text-left lg:text-4xl font-black text-gray-900 dark:text-white mb-4 leading-tight tracking-tighter">
                        {product.name}
                    </h1>

                    <p className="text-left text-2xl font-black text-[#008cff] mb-4 tracking-tighter">
                        Kz {product.price.toLocaleString()}
                    </p>

                    <div className="space-y-8 mb-12">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <h3 className="text-xs text-left font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
                                    Descrição do Produto
                                </h3>
                                <p className="text-gray-600 text-left dark:text-gray-400 leading-relaxed text-lg">
                                    {product.description}
                                </p>
                            </div>
                            <button
                                onClick={handleShare}
                                className="flex flex-col items-center gap-2 group"
                                title="Partilhar Produto"
                            >
                                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl flex items-center justify-center text-gray-500 group-hover:text-[#008cff] group-hover:border-[#008cff]/20 transition-all shadow-sm">
                                    {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Share2 className="w-5 h-5" />}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-[#008cff]">Partilhar</span>
                            </button>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-2 h-16 w-full sm:w-auto">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="w-12 h-full flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
                                >
                                    <Minus className="w-5 h-5" />
                                </button>
                                <span className="w-12 text-center font-black text-gray-900 dark:text-white text-xl">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(q => q + 1)}
                                    className="w-12 h-full flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>

                            <button
                                className="flex-1 w-full py-4 flex items-center justify-center gap-4 bg-[#008cff] text-white h-16 rounded font-black text-xl hover:bg-[#007ad6] shadow-xl shadow-[#008cff]/20 active:scale-95 transition-all"
                                onClick={() => addToCart(product, quantity)}
                            >
                                <ShoppingCart className="w-6 h-6" /> Adicionar ao Carrinho
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProductDetails;