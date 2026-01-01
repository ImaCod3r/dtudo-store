import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

// Context
import { useLocation } from "../context/LocationContext";
import { useGeolocationPermission } from "../hooks/useGeolocationPermission";

// Components
import ProductCard from "../components/ProductCard";
import ProductSkeleton from "../components/ProductSkeleton";
import Modal from "../components/Modal";

import api from "../api/axios";
import { MapIcon } from "lucide-react";

import type { Product } from "../types";

function Home() {
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [products, setProducts] = useState<Product[]>([]);

    const { location, refreshLocation } = useLocation();
    const permissionStatus = useGeolocationPermission();

    const { category: categoryId } = useParams();

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const endpoint = categoryId ? `/products/category/${categoryId}` : "/products";
            const response = await api.get(endpoint);
            console.log("Fetch products response:", response.data);


            let data = response.data;
            if (data.products) {
                setProducts(data.products);
            } else if (Array.isArray(data)) {

                setProducts(data);
            } else {
                console.warn("Unexpected response format, setting products to empty");
                setProducts([]);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setIsLoading(false);
        }
    }

    // Title logic
    const pageTitle = categoryId
        ? "Produtos da Categoria"
        : "Todos os Produtos";

    useEffect(() => {
        if (permissionStatus === 'denied' || (permissionStatus === 'prompt' && !location)) {
            setIsModalOpen(true);
        }
    }, [permissionStatus, location]);

    useEffect(() => {
        fetchProducts();
    }, [categoryId])

    return (
        <div className="max-w-7xl mx-auto px-4 pb-20">
            <div className="flex flex-col lg:flex-row gap-8">

                <main className="flex-1">

                    <div className="flex items-center justify-between mb-10 px-1">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            {pageTitle}
                        </h2>
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                            {isLoading ? 'Carregando...' : `${products.length} Items`}
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
                            {[...Array(6)].map((_, i) => (
                                <ProductSkeleton key={i} />
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-8">
                            {products.map(product => (
                                <ProductCard key={product.public_id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-700">
                            <p className="text-gray-400 font-medium">Nenhum produto disponível nesta categoria.</p>
                        </div>
                    )}

                    {/* Pagination Mockup */}
                    {!isLoading && products.length > 0 && (
                        <div className="mt-20 flex items-center justify-center gap-4">
                            <button className="text-xs font-bold text-gray-400 hover:text-gray-900">← Previous</button>
                            <div className="flex gap-2">
                                {[1, 2, 3].map(n => (
                                    <button key={n} className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${n === 1 ? 'bg-[#008cff] text-white' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                                        {n}
                                    </button>
                                ))}
                            </div>
                            <button className="text-xs font-bold text-gray-400 hover:text-gray-900">Next →</button>
                        </div>
                    )}
                </main>
            </div>
            <Modal isOpen={isModalOpen}>
                <div className="flex flex-col items-center justify-center gap-4">
                    <div className="bg-[#008cff] p-6 rounded-full flex items-center justify-center">
                        <MapIcon size={80} color="#fff" />
                    </div>
                    <h1 className="text-2xl font-bold text-center">Opa, precisamos que você ative sua localização para continuar.</h1>
                    <p className="text-gray-500 text-center text-sm">A sua localização é usada para calcular o frete e os produtos mais próximos de você.</p>
                    <button className="bg-[#008cff] text-white px-6 py-4 rounded-xl cursor-pointer" onClick={() => {
                        refreshLocation();
                        setIsModalOpen(false);
                    }}>Ativar localização</button>
                </div>
            </Modal>
        </div>
    );
}

export default Home;