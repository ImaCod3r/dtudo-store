import { useNavigate } from 'react-router-dom';
import { Ghost, ArrowLeft, Home } from 'lucide-react';

function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
            <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-8 animate-in zoom-in duration-500">
                <Ghost className="w-16 h-16 text-gray-400" />
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                404
            </h1>

            <h2 className="text-xl md:text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6">
                Página não encontrada
            </h2>

            <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-md mx-auto leading-relaxed">
                Oops! Parece que você se perdeu. A página que você está procurando não existe ou foi movida.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Voltar
                </button>

                <button
                    onClick={() => navigate('/')}
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-[#028dfe] text-white rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                >
                    <Home className="w-5 h-5" />
                    Ir para o Início
                </button>
            </div>
        </div>
    );
}

export default NotFound;
