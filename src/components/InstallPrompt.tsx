import { useState, useEffect } from 'react';
import { Download, X, Smartphone, ShieldCheck, Zap } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if it's iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIOSDevice);

        // Check if already in standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

        if (isStandalone) return;

        // Handle PWA install prompt for Android/Desktop
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Delay showing the prompt to not be intrusive
            setTimeout(() => {
                setIsVisible(true);
            }, 3000);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // For iOS, just show instructions after a delay if not installed
        if (isIOSDevice && !isStandalone) {
            setTimeout(() => {
                setIsVisible(true);
            }, 3000);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const result = await deferredPrompt.userChoice;

        if (result.outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-full duration-500">
            <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-4xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 relative">
                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-start gap-5">
                        <div className="w-16 h-16 bg-linear-to-br from-[#028dfe] to-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
                            <Smartphone className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Instalar App</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                                Instale o nosso aplicativo para uma experiência <span className="text-[#028dfe] font-bold">mais rápida</span> e acesso offline!
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <div className="flex-1 flex gap-2 items-center justify-center bg-gray-50 dark:bg-gray-900 py-3 rounded-xl">
                            <Zap className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Rápido</span>
                        </div>
                        <div className="flex-1 flex gap-2 items-center justify-center bg-gray-50 dark:bg-gray-900 py-3 rounded-xl">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Seguro</span>
                        </div>
                    </div>

                    {isIOS ? (
                        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl text-sm text-gray-600 dark:text-gray-300">
                            <p className="font-bold mb-2 flex items-center gap-2">
                                <Download className="w-4 h-4" /> Como instalar no iOS:
                            </p>
                            <ol className="list-decimal pl-4 space-y-1 text-xs">
                                <li>Toque no botão <strong>Compartilhar</strong> do navegador</li>
                                <li>Selecione <strong>Adicionar à Tela de Início</strong></li>
                            </ol>
                        </div>
                    ) : (
                        <button
                            onClick={handleInstallClick}
                            className="w-full mt-6 bg-[#028dfe] text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 transition-all active:scale-95 shadow-xl shadow-blue-500/20"
                        >
                            <Download className="w-5 h-5" />
                            Instalar Agora
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
