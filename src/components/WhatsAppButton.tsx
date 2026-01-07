import { MessageCircle } from 'lucide-react';

export function WhatsAppButton() {
    return (
        <a
            href="https://wa.me/244929087734"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-xl hover:bg-[#20bd5a] hover:scale-110 transition-all duration-300 flex items-center justify-center group"
            aria-label="Contactar no WhatsApp"
        >
            <MessageCircle className="w-8 h-8 fill-current" />
            <span className="absolute right-full mr-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Fale conosco
            </span>
            <span className="absolute w-full h-full rounded-full bg-[#25D366] animate-ping opacity-20 -z-10"></span>
        </a>
    );
}
