import { Link, useParams } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../api/axios";
import type { Category } from "../types";

interface BreadcrumbItem {
    label: string;
    path: string;
}

function Breadcrumbs() {
    const { category: categoryId, subcategory: subcategoryId } = useParams();
    const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
        { label: "Início", path: "/" }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchCategoryData = async () => {
            if (!categoryId) {
                setBreadcrumbs([{ label: "Início", path: "/" }]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await api.get("/categories");
                const categories: Category[] = response.data.categories;

                // Encontrar a categoria principal
                const category = categories.find((cat) => cat.id === categoryId);

                if (category) {
                    const newBreadcrumbs: BreadcrumbItem[] = [
                        { label: "Início", path: "/" },
                        { label: category.name, path: `/categoria/${category.id}` }
                    ];

                    // Se houver subcategoria, encontrar ela nos children da categoria
                    if (subcategoryId && category.children) {
                        const subcategory = category.children.find(
                            (sub) => sub.id === subcategoryId
                        );
                        if (subcategory && subcategory.name) {
                            newBreadcrumbs.push({
                                label: subcategory.name,
                                path: `/categoria/${categoryId}/${subcategoryId}`
                            });
                        }
                    }

                    setBreadcrumbs(newBreadcrumbs);
                } else {
                    // Se não encontrar a categoria, apenas mostrar "Início"
                    setBreadcrumbs([{ label: "Início", path: "/" }]);
                }
            } catch (error) {
                console.error("Error fetching category data:", error);
                setBreadcrumbs([{ label: "Início", path: "/" }]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategoryData();
    }, [categoryId, subcategoryId]);

    // Se estiver carregando ou só tiver "Início", não mostrar breadcrumbs
    if (isLoading || breadcrumbs.length === 1) {
        return null;
    }

    return (
        <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 py-4">
            <ol className="flex items-center flex-wrap gap-2 text-sm">
                {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;

                    return (
                        <li key={crumb.path} className="flex items-center gap-2">
                            {index === 0 ? (
                                <Link
                                    to={crumb.path}
                                    className="flex items-center gap-1.5 text-gray-600 hover:text-[#028dfe] transition-colors duration-200 group"
                                >
                                    <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    <span className="hidden sm:inline font-medium">
                                        {crumb.label}
                                    </span>
                                </Link>
                            ) : isLast ? (
                                <span className="text-gray-900 font-semibold" aria-current="page">
                                    {crumb.label}
                                </span>
                            ) : (
                                <Link
                                    to={crumb.path}
                                    className="text-gray-600 hover:text-[#028dfe] font-medium transition-colors duration-200"
                                >
                                    {crumb.label}
                                </Link>
                            )}

                            {!isLast && (
                                <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

export default Breadcrumbs;
