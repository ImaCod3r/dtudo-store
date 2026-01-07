import { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import type { Product, Pagination } from '../types';

function News() {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchNews = async (page = 1) => {
        setIsLoading(true);
        try {
            const response = await api.get('/products/new-arrivals', {
                params: { page, per_page: 8 }
            });
            setProducts(response.data.products);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error("Error fetching news:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNews(currentPage);
    }, [currentPage]);

    const handlePageChange = (newPage: number) => {
        if (!pagination) return;
        if (newPage >= 1 && newPage <= pagination.total_pages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-10">
            <div className="flex flex-col md:flex-row items-start justify-between mb-12 gap-6">
                <div className="text-left">
                    <div className="flex items-center gap-2 text-[#028DFE] font-black uppercase tracking-widest text-sm mb-2">
                        <Sparkles className="w-5 h-5" />
                        <span>Recém Chegados</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Novidades</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Os últimos produtos adicionados à nossa loja.</p>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Voltar
                </button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                    {[...Array(8)].map((_, i) => (
                        <ProductSkeleton key={i} />
                    ))}
                </div>
            ) : products.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                        {products.map(product => (
                            <ProductCard key={product.public_id} product={product} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.total_pages > 1 && (
                        <div className="mt-20 flex items-center justify-center gap-4">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="text-xs font-bold text-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-wider transition-colors"
                            >
                                ← Anterior
                            </button>
                            <div className="flex gap-2">
                                {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`w-10 h-10 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${page === currentPage
                                                ? 'bg-[#008cff] text-white shadow-lg shadow-blue-500/20'
                                                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === pagination.total_pages}
                                className="text-xs font-bold text-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-wider transition-colors"
                            >
                                Próxima →
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="py-20 text-center bg-white dark:bg-gray-800 rounded-4xl border-2 border-dashed border-gray-100 dark:border-gray-700">
                    <p className="text-gray-500 font-bold">Nenhuma novidade no momento.</p>
                </div>
            )}
        </div>
    );
}

export default News;
