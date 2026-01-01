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
        <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-[#008cff]/5 transition-all duration-300 flex flex-col h-full">
            <Link to={`/produto/${product.public_id}`} className="relative block overflow-hidden aspect-video">
                <img
                    src={`${BASE_URL}${product.image_url}`}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
            </Link>

            <div className="p-4 flex flex-col flex-1">
                <Link to={`/product/${product.id}`} className="flex-1">
                    <h3 className="text-lg text-left font-semibold text-gray-800 line-clamp-2 group-hover:text-[#008cff] transition-colors">
                        {product.name}
                    </h3>
                    <p className="text-sm text-left text-gray-400 capitalize mb-2">{product.category}</p>
                </Link>

                <div className="mt-auto pt-2 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
                    </div>
                    <button
                        onClick={() => addToCart(product)}
                        className="p-2.5 bg-[#008cff] text-white rounded-xl hover:bg-[#007ad6] shadow-lg shadow-[#008cff]/20 active:scale-95 transition-all"
                        title="Adicionar ao Carrinho"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;