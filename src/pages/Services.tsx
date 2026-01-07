import { Construction, ArrowLeft, Wrench, Clock, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Services() {
    const navigate = useNavigate();

    return (
        <div className="container mx-auto px-4 py-20 min-h-[70vh] flex flex-col items-center justify-center text-center">
            <div className="max-w-2xl">
                <div className="flex justify-center mb-8 relative">
                    <div className="bg-yellow-100 dark:bg-yellow-900/20 p-8 rounded-full border-4 border-yellow-500 animate-pulse">
                        <Construction size={80} className="text-yellow-600 dark:text-yellow-500" />
                    </div>
                </div>

                <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
                    Página em <span className="text-[#028dfe]">Construção</span>
                </h1>

                <p className="text-xl text-gray-500 dark:text-gray-400 mb-12 font-medium leading-relaxed max-w-lg mx-auto">
                    Estamos a trabalhar arduamente para trazer os melhores serviços técnicos e de consultoria até si. Volte em breve!
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <Wrench className="w-6 h-6 text-[#028dfe] mx-auto mb-3" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Assistência</span>
                    </div>
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <Clock className="w-6 h-6 text-[#028dfe] mx-auto mb-3" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Brevemente</span>
                    </div>
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <ShieldCheck className="w-6 h-6 text-[#028dfe] mx-auto mb-3" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Qualidade</span>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-[#028dfe] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Voltar para a Loja
                </button>
            </div>
        </div>
    );
}

export default Services;
