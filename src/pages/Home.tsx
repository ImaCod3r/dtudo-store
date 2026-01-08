import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";

// Context
import { useLocation } from "../context/LocationContext";
import { useGeolocationPermission } from "../hooks/useGeolocationPermission";

// Components
import ProductCard from "../components/ProductCard";
import ProductSkeleton from "../components/ProductSkeleton";
import Modal from "../components/Modal";
import { SEO } from "../components/SEO";

import api from "../api/axios";
import { MapIcon, Home as HomeIcon, ChevronRight, Search } from "lucide-react";

import type { Product, Pagination } from "../types";

function Home() {
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [products, setProducts] = useState<Product[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Breadcrumb state
    const [categoryName, setCategoryName] = useState("");

    const { location, refreshLocation } = useLocation();
    const { permissionStatus } = useGeolocationPermission();

    const { category: categorySlug } = useParams();
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('search');

    const getCategoryIdFromSlug = async (slug: string) => {
        try {
            const response = await api.get('/categories');
            const categories: any[] = response.data.categories;

            const findCategory = (cats: any[]): any => {
                for (const cat of cats) {
                    if (cat.slug === slug) return cat;
                    if (cat.children) {
                        const found = findCategory(cat.children);
                        if (found) return found;
                    }
                }
                return null;
            };

            const foundCategory = findCategory(categories);
            if (foundCategory) {
                setCategoryName(foundCategory.name);
                return foundCategory.id;
            }
            return null;
        } catch (error) {
            console.error("Error fetching category info:", error);
            return null;
        }
    };

    const fetchProducts = async (page = 1, catId?: string | null) => {
        setIsLoading(true);
        try {
            const endpoint = catId ? `/products/category/${catId}` : "/products";

            const params: any = {
                page,
                per_page: 12
            };

            if (searchTerm) {
                params.search = searchTerm;
                params.q = searchTerm;
                params.name = searchTerm;
            }

            const response = await api.get(endpoint, { params });
            console.log("Fetch products response:", response.data);

            let data = response.data;
            let fetchedProducts: Product[] = [];

            if (data.products) {
                fetchedProducts = data.products;
                if (data.pagination) {
                    setPagination(data.pagination);
                }
            } else if (Array.isArray(data)) {
                fetchedProducts = data;
                setPagination(null);
            } else {
                console.warn("Unexpected response format, setting products to empty");
                fetchedProducts = [];
            }

            // Client-side filtering check
            if (searchTerm && fetchedProducts.length > 0) {
                const filtered = fetchedProducts.filter(product =>
                    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
                );
                fetchedProducts = filtered;
            }

            setProducts(fetchedProducts);
        } catch (error) {
            console.error("Error fetching products:", error);
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    }

    // Title logic
    let pageTitle = "Todos os Produtos";
    if (searchTerm) {
        pageTitle = `Resultados para "${searchTerm}"`;
    } else if (categorySlug) {
        pageTitle = categoryName || "Produtos da Categoria";
    }

    useEffect(() => {
        if (permissionStatus === 'denied' || (permissionStatus === 'prompt' && !location)) {
            setIsModalOpen(true);
        }
    }, [permissionStatus, location]);

    useEffect(() => {
        setCurrentPage(1);
    }, [categorySlug, searchTerm]);

    useEffect(() => {
        const loadData = async () => {
            if (categorySlug) {
                const id = await getCategoryIdFromSlug(categorySlug);
                if (id) {
                    fetchProducts(currentPage, id);
                } else {
                    // Categoria não encontrada ou erro
                    setProducts([]);
                    setIsLoading(false);
                }
            } else {
                setCategoryName("");
                fetchProducts(currentPage);
            }
        };

        loadData();
    }, [currentPage, categorySlug, searchTerm])

    const handlePageChange = (newPage: number) => {
        if (!pagination) return;
        if (newPage >= 1 && newPage <= pagination.total_pages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 pb-20 pt-6">
            <SEO title={pageTitle} />
            {/* Breadcrumbs */}
            {(categorySlug || searchTerm) && (
                <nav className="flex items-center text-sm text-gray-500 mb-8 overflow-x-auto whitespace-nowrap">
                    <Link to="/" className="flex items-center hover:text-[#008cff] transition-colors">
                        <HomeIcon className="w-4 h-4 mr-2" />
                        Início
                    </Link>

                    {categorySlug && (
                        <>
                            <ChevronRight className="w-4 h-4 mx-2" />
                            <span className="font-bold text-[#008cff]">{categoryName || 'Categoria'}</span>
                        </>
                    )}

                    {searchTerm && (
                        <>
                            <ChevronRight className="w-4 h-4 mx-2" />
                            <span className="font-medium">Busca: </span>
                            <span className="font-bold text-[#008cff] ml-1">"{searchTerm}"</span>
                        </>
                    )}
                </nav>
            )}

            <div className="w-full">
                <main className="w-full">
                    <div className="flex items-center justify-between mb-6 sm:mb-10 px-1">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            {pageTitle}
                        </h2>
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                            {isLoading ? 'Carregando...' : `${pagination?.total_items || products.length} Items`}
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                            {[...Array(8)].map((_, i) => (
                                <ProductSkeleton key={i} />
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                            {products.map(product => (
                                <ProductCard key={product.public_id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-700">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Search className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center px-4">
                                {searchTerm ? `Nenhum resultado para "${searchTerm}"` : "Nenhum produto encontrado"}
                            </h3>
                            <p className="text-gray-400 font-medium text-center max-w-md px-4">
                                {searchTerm
                                    ? "Tente verificar a ortografia ou usar termos mais genéricos."
                                    : "Não há produtos disponíveis nesta categoria no momento."}
                            </p>
                            {searchTerm && (
                                <Link to="/" className="mt-6 px-8 py-4 bg-[#028dfe] text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 active:scale-95">
                                    Ver todos os produtos
                                </Link>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Pagination */}
            {!isLoading && pagination && pagination.total_pages > 1 && (
                <div className="mt-20 flex items-center justify-center gap-4">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="text-xs font-bold text-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-wider transition-colors"
                    >
                        ← Anterior
                    </button>
                    <div className="flex gap-2">
                        {Array.from({ length: pagination.total_pages }, (_, i) => i + 1)
                            .filter(page => {
                                // Show first, last, current, and adjacent pages
                                return page === 1 ||
                                    page === pagination.total_pages ||
                                    Math.abs(page - currentPage) <= 1;
                            })
                            .map((page, index, array) => (
                                <div key={page} className="flex">
                                    {index > 0 && array[index - 1] !== page - 1 && (
                                        <span className="w-8 h-8 flex items-center justify-center text-gray-300">...</span>
                                    )}
                                    <button
                                        onClick={() => handlePageChange(page)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${page === currentPage
                                            ? 'bg-[#008cff] text-white shadow-lg shadow-blue-500/20'
                                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                </div>
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

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
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