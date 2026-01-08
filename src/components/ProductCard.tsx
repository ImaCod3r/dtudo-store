import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import type { Product } from '../types';
import { formatPrice } from '../utils/formatPrice';
import { useCart } from '../context/CartContext';


import { BASE_URL } from "../api/axios";

interface ProductCardProps {
    product: Product;
}

function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useCart();

    return (
        <div className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full relative">
            <Link to={`/produto/${product.public_id}`} className="relative block overflow-hidden aspect-square">
                <img
                    src={product.image_url.startsWith('http') ? product.image_url : `${BASE_URL}/${product.image_url}`}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
            </Link>

            <div className="p-3 sm:p-6 flex flex-col flex-1">
                <div className="mb-4 text-left">
                    <Link to={`/produto/${product.public_id}`}>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight mb-1">
                            {product.name}
                        </h3>
                    </Link>
                    <p className="text-sm text-gray-400 font-medium">{product.category}</p>
                </div>

                <div className="mt-auto flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(product.price)}
                    </span>
                    <button
                        onClick={() => addToCart(product)}
                        className="w-12 h-12 bg-[#028dfe] text-white rounded-2xl hover:bg-blue-600 shadow-lg shadow-blue-500/20 active:scale-90 transition-all flex items-center justify-center"
                        title="Adicionar ao Carrinho"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;