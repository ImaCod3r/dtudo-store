function ProductSkeleton() {
    return (
        <div className="flex flex-col h-full animate-pulse">
            <div className="relative aspect-video w-full bg-gray-200 dark:bg-gray-800 rounded-2xl mb-4">
                <div className="absolute top-4 right-4 bg-gray-300 dark:bg-gray-700 h-6 w-20 rounded-full"></div>
            </div>
            <div className="px-1 space-y-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-auto">
                    <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-full w-full"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full w-full"></div>
                </div>
            </div>
        </div>
    );
};

export default ProductSkeleton;