import Logo from "./Logo";

function Footer() {
    return (
        <footer className="bg-white  border-t border-gray-100 py-12 mt-10">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 sm:gap-8">
                <div className="col-span-1">
                    <Logo />
                    <p className="text-gray-400 mt-[-5px] text-left dark:text-gray-500 max-w-sm mb-6">
                        Na <b>Dtudo</b> encontras mesmo de tudo!
                    </p>
                </div>
                <div className="text-left">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4">Empresa</h4>
                    <ul className="space-y-2 text-sm text-gray-500">
                        <li className="hover:text-[#008cff] cursor-pointer transition-colors">Sobre Nós</li>
                        <li className="hover:text-[#008cff] cursor-pointer transition-colors">Carreiras</li>
                        <li className="hover:text-[#008cff] cursor-pointer transition-colors">Termos de Serviço</li>
                        <li className="hover:text-[#008cff] cursor-pointer transition-colors">Política de Privacidade</li>
                    </ul>
                </div>
                <div className="text-left">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4">Suporte</h4>
                    <ul className="space-y-2 text-sm text-gray-500">
                        <li className="hover:text-[#008cff] cursor-pointer transition-colors">Informações de Envio</li>
                        <li className="hover:text-[#008cff] cursor-pointer transition-colors">Devoluções</li>
                        <li className="hover:text-[#008cff] cursor-pointer transition-colors">FAQ</li>
                        <li className="hover:text-[#008cff] cursor-pointer transition-colors">Contato</li>
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