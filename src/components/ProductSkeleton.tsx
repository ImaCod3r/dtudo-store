function ProductSkeleton() {
    return (
        <div className="flex flex-col h-full animate-pulse bg-white dark:bg-gray-900 rounded-4xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="aspect-square w-full bg-gray-100 dark:bg-gray-800 rounded-2xl mb-6"></div>
            <div className="space-y-3 flex-1">
                <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-full w-3/4"></div>
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full w-1/3"></div>
            </div>
            <div className="mt-8 flex items-center justify-between">
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-1/2"></div>
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
            </div>
        </div>
    );
};

export default ProductSkeleton;