import Logo from "./Logo";
import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="bg-white  border-t border-gray-100 py-12 mt-10">
            <div className="max-w-7xl mx-auto px-2 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 sm:gap-8 transition-colors duration-300">
                <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                    <Logo />
                    <p className="text-gray-500 dark:text-gray-400 mt-4 text-left font-medium max-w-sm mb-6 leading-relaxed">
                        A sua loja de confiança em Angola. Na <b>Dtudo</b> encontras mesmo de tudo, com a melhor qualidade e rapidez na entrega.
                    </p>
                </div>
                <div className="text-left">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-6 uppercase text-xs tracking-widest">Empresa</h4>
                    <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
                        <li><Link to="/sobre-nos" className="hover:text-[#008cff] cursor-pointer transition-colors font-medium">Sobre Nós</Link></li>
                        <li><Link to="/termos" className="hover:text-[#008cff] cursor-pointer transition-colors font-medium">Termos de Serviço</Link></li>
                        <li><Link to="/privacidade" className="hover:text-[#008cff] cursor-pointer transition-colors font-medium">Política de Privacidade</Link></li>
                        <li><Link to="/afiliados" className="hover:text-[#008cff] cursor-pointer transition-colors font-medium">Afiliados</Link></li>
                    </ul>
                </div>
                <div className="text-left">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-6 uppercase text-xs tracking-widest">Suporte</h4>
                    <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
                        <li><Link to="/envio" className="hover:text-[#008cff] cursor-pointer transition-colors font-medium">Informações de Envio</Link></li>
                        <li><Link to="/devolucoes" className="hover:text-[#008cff] cursor-pointer transition-colors font-medium">Devoluções</Link></li>
                        <li><Link to="/faq" className="hover:text-[#008cff] cursor-pointer transition-colors font-medium">FAQ</Link></li>
                        <li><Link to="/contato" className="hover:text-[#008cff] cursor-pointer transition-colors font-medium">Contato</Link></li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-gray-50  text-center text-xs text-gray-400">
                &copy; {new Date().getFullYear()} Dtudo Shop. Todos os direitos reservados.
            </div>
        </footer>
    )
}

export default Footer;