import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export interface AlertProps {
    id: string;
    message: string;
    type: 'success' | 'error';
    onClose: (id: string) => void;
}

function Alert({ id, message, type, onClose }: AlertProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, 5000); // Auto-close após 5 segundos

        return () => clearTimeout(timer);
    }, [id, onClose]);

    const isSuccess = type === 'success';

    return (
        <div
            className={`
        flex items-start gap-3 p-4 rounded-2xl shadow-lg border backdrop-blur-sm
        animate-slide-in-right transition-all duration-300
        ${isSuccess
                    ? 'bg-green-50/95 dark:bg-green-900/40 border-green-200 dark:border-green-800'
                    : 'bg-red-50/95 dark:bg-red-900/40 border-red-200 dark:border-red-800'
                }
      `}
            role="alert"
        >
            <div className="shrink-0 mt-0.5">
                {isSuccess ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${isSuccess
                        ? 'text-green-800 dark:text-green-200'
                        : 'text-red-800 dark:text-red-200'
                    }`}>
                    {message}
                </p>
            </div>

            <button
                onClick={() => onClose(id)}
                className={`shrink-0 p-1 rounded-lg transition-colors ${isSuccess
                        ? 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800/50'
                        : 'text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800/50'
                    }`}
                aria-label="Fechar alerta"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

export default Alert;
