import { useState, useEffect, useRef } from 'react';
import {
    Wallet,
    TrendingUp,
    DollarSign,
    Copy,
    CheckCircle2,
    Loader2,
    ShieldCheck,
    Camera,
    AlertCircle,
    CopyCheck,
    ArrowUpRight,
    Users,
    Info
} from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../context/AlertContext';
import affiliateService from '../services/affiliateService';
import type { Affiliate, WithdrawalRequest } from '../types';
import { ANGOLA_BANKS } from '../constants/banks';
import Back from '../components/Back';
import { SEO } from '../components/SEO';
import Modal from '../components/Modal';

function Affiliates() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { showSuccess, showError } = useAlert();
    const howItWorksRef = useRef<HTMLDivElement>(null);

    const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [copied, setCopied] = useState(false);

    // Apply Form State
    const [applyForm, setApplyForm] = useState({
        bi_front: null as File | null,
        bi_back: null as File | null,
        selfie: null as File | null,
    });

    // Withdraw Form State
    const [withdrawForm, setWithdrawForm] = useState<WithdrawalRequest>({
        amount: 0,
        iban: '',
        bank: '',
    });

    const fetchAffiliateData = async () => {
        setIsLoading(true);
        try {
            const response = await affiliateService.getMe();
            // Handle both wrapped (ApiResponse) and direct responses
            if (response) {
                const data = (response as any).data || response;
                if (data && (data.is_affiliate !== undefined || data.affiliate || data.stats)) {
                    setAffiliate(data);
                }
            }
        } catch (error) {
            console.error('Error fetching affiliate data:', error);
            showError('Erro ao carregar dados de afiliado. Por favor, tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchAffiliateData();
        } else {
            setIsLoading(false);
        }
    }, [user]);

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!applyForm.bi_front || !applyForm.bi_back || !applyForm.selfie) {
            showError('Por favor, carregue todos os documentos necessários.');
            return;
        }

        setIsProcessing(true);
        const formData = new FormData();
        formData.append('bi_front', applyForm.bi_front);
        formData.append('bi_back', applyForm.bi_back);
        formData.append('selfie', applyForm.selfie);

        try {
            const response = await affiliateService.apply(formData);
            if (!response.error) {
                showSuccess('Candidatura enviada com sucesso! Analisaremos os seus documentos em breve.');
                setShowApplyModal(false);
                fetchAffiliateData();
            } else {
                showError(response.message || 'Erro ao enviar candidatura.');
            }
        } catch (error) {
            showError('Erro ao processar a candidatura.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        if (withdrawForm.amount < 10000) {
            showError('O montante mínimo para saque é de 10.000 Kz.');
            return;
        }
        if (!user?.phone) {
            showError('Você precisa ter um telefone cadastrado para solicitar saques.');
            return;
        }

        setIsProcessing(true);
        try {
            const response = await affiliateService.withdraw(withdrawForm);
            if (!response.error) {
                showSuccess('Solicitação de saque enviada com sucesso!');
                setShowWithdrawModal(false);
                fetchAffiliateData();
            } else {
                showError(response.message || 'Erro ao solicitar saque.');
            }
        } catch (error) {
            showError('Erro ao processar o saque.');
        } finally {
            setIsProcessing(false);
        }
    };

    const copyReferralLink = () => {
        const code = affiliate?.stats?.code || affiliate?.affiliate?.code;
        if (!code) return;
        const link = `${window.location.origin}?r=${code}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        showSuccess('Link de afiliado copiado!');
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-32 flex flex-col items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-100 rounded-full animate-spin border-t-[#028dfe]"></div>
                    <Loader2 className="w-6 h-6 text-[#028dfe] absolute inset-0 m-auto animate-pulse" />
                </div>
                <p className="mt-6 text-gray-400 font-bold uppercase tracking-widest text-xs">A carregar...</p>
            </div>
        );
    }

    if (!user && !authLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
                <SEO title="Afiliados - Dtudo Store" />
                <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-8">
                    <Users className="w-12 h-12 text-[#028dfe]" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Programa de Afiliados</h1>
                <p className="text-gray-500 mb-8 max-w-md">Faça login para se tornar um parceiro oficial da Dtudo Store e comece a ganhar comissões em cada venda recomendada.</p>
                <button
                    onClick={() => navigate('/login')}
                    className="bg-[#028dfe] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all text-sm"
                >
                    Entrar com Google
                </button>
            </div>
        );
    }

    // STATE: NOT AFFILIATE (Landing Page)
    const status = (affiliate?.stats?.status || affiliate?.affiliate?.status || '').toLowerCase();
    const code = affiliate?.stats?.code || affiliate?.affiliate?.code;
    const isApproved = affiliate?.is_affiliate || status === 'approved';
    const isPending = status === 'pending' && !affiliate?.is_affiliate;

    if (user && !isApproved && !isPending) {
        return (
            <div className="max-w-6xl mx-auto px-2 py-12">
                <SEO title="Programa de Afiliados - Dtudo Shop" />
                <Back />
                <div className="bg-linear-to-br from-[#028dfe] to-blue-700 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden mb-8 md:mb-12 shadow-2xl shadow-blue-500/20">
                    <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-white/10 rounded-full -mr-24 md:-mr-32 -mt-24 md:-mt-32 blur-3xl"></div>
                    <div className="text-left relative z-10 max-w-2xl">
                        <span className="bg-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border border-white/20 mb-6 md:mb-8 inline-block">
                            Oportunidade de Parceiro
                        </span>
                        <h1 className="text-3xl md:text-6xl font-black mb-4 md:mb-6 tracking-tight leading-tight">
                            Ganhe Dinheiro com a Dtudo Shop
                        </h1>
                        <p className="text-blue-100 text-base md:text-xl font-medium mb-8 md:mb-10 leading-relaxed">
                            Torna-te um afiliado e ganha comissões generosas por cada venda realizada através dos teus links. Simples, rápido e lucrativo.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => setShowApplyModal(true)}
                                className="bg-white text-[#028dfe] px-8 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-3xl font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all text-xs md:text-sm"
                            >
                                Candidatar-me Agora
                            </button>
                            <button
                                onClick={() => howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                className="bg-black/20 text-white border border-white/20 px-8 py-4 md:py-5 rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-xs md:text-sm backdrop-blur-md"
                            >
                                Como Funciona?
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-20">
                    {[
                        {
                            icon: <TrendingUp className="w-8 h-8 text-[#028dfe]" />,
                            title: "Comissões Altas",
                            desc: "Recebe uma percentagem fixa de cada venda confirmada que vier do teu link."
                        },
                        {
                            icon: <CheckCircle2 className="w-8 h-8 text-[#028dfe]" />,
                            title: "Fácil de Divulgar",
                            desc: "Usa o teu código único nos teus status, redes sociais ou blog pessoal."
                        },
                        {
                            icon: <Wallet className="w-8 h-8 text-[#028dfe]" />,
                            title: "Pagamentos Rápidos",
                            desc: "Solicita o saque para a tua conta bancária assim que atingires o saldo mínimo."
                        }
                    ].map((item, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl shadow-blue-500/5 group hover:border-[#028dfe]/40 transition-all">
                            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">{item.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>

                {/* How it Works Detailed Section */}
                <div ref={howItWorksRef} className="mb-24 scroll-mt-32">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Passo a Passo</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Veja como é fácil começar a faturar hoje mesmo.</p>
                    </div>

                    <div className="relative">
                        {/* Connecting Line - Desktop Only */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-blue-100 dark:bg-blue-900/30 -translate-y-1/2 z-0"></div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                            {[
                                { step: "01", title: "Candidatura", desc: "Envia os teus documentos e aguarda a nossa aprovação rápida." },
                                { step: "02", title: "Divulgação", desc: "Copia o teu link e partilha com os teus amigos e redes sociais." },
                                { step: "03", title: "Lucro", desc: "Recebe comissões automáticas por cada compra confirmada." }
                            ].map((s, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <div className="w-16 h-16 bg-[#028dfe] text-white rounded-full flex items-center justify-center font-black text-xl shadow-xl shadow-blue-500/20 mb-6 border-4 border-white dark:border-gray-900">
                                        {s.step}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{s.title}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center font-medium px-4">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <Modal
                    isOpen={showApplyModal}
                    onClose={() => setShowApplyModal(false)}
                    title="Candidatura de Afiliado"
                >
                    <form onSubmit={handleApply} className="space-y-6">
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 font-medium mb-4">Para aprovação da tua conta, necessitamos dos seguintes documentos (BI ou Passaporte):</p>

                            {[
                                { id: 'bi_front', label: 'BI Frente', state: applyForm.bi_front },
                                { id: 'bi_back', label: 'BI Verso', state: applyForm.bi_back },
                                { id: 'selfie', label: 'Selfie com BI', state: applyForm.selfie },
                            ].map((field) => (
                                <div key={field.id} className="relative group">
                                    <input
                                        type="file"
                                        id={field.id}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) setApplyForm({ ...applyForm, [field.id]: file });
                                        }}
                                    />
                                    <label
                                        htmlFor={field.id}
                                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${field.state
                                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-[#028dfe] bg-gray-50 dark:bg-gray-900/50'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${field.state ? 'bg-emerald-100 text-emerald-600' : 'bg-white dark:bg-gray-800 text-gray-400'
                                            }`}>
                                            {field.state ? <CheckCircle2 className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">{field.label}</p>
                                            <p className="text-xs text-gray-400">{field.state ? field.state.name : 'Clique para carregar imagem'}</p>
                                        </div>
                                        {field.state && <ArrowUpRight className="w-4 h-4 text-emerald-500" />}
                                    </label>
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full bg-[#028dfe] text-white py-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enviar Candidatura"}
                        </button>
                    </form>
                </Modal>
            </div>
        );
    }

    // STATE: PENDING
    if (isPending) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-32 flex flex-col items-center text-center">
                <SEO title="Candidatura Pendente - Dtudo Store" />
                <div className="w-32 h-32 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-10 animate-pulse">
                    <AlertCircle className="w-16 h-16 text-amber-500" />
                </div>
                <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">Estamos a Analisar!</h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-12 max-w-lg leading-relaxed">
                    Recebemos os teus documentos com sucesso. O nosso departamento jurídico está a analisar as informações para garantir a segurança da nossa rede de parceiros.
                </p>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 w-full">
                    <div className="flex items-center gap-4 justify-center text-amber-600 font-bold mb-2">
                        <Info className="w-5 h-5" />
                        <span>Notificação em Breve</span>
                    </div>
                    <p className="text-sm text-gray-400">Enviaremos um e-mail assim que o teu pedido for processado. (Normalmente 24-48h úteis)</p>
                </div>
            </div>
        );
    }

    // STATE: APPROVED (DASHBOARD)
    if (isApproved) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-12">
                <SEO title="Painel do Afiliado - Dtudo Shop" />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Painel do Afiliado</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Bem-vindo de volta, parceiro(a) {user?.name?.split(' ')[0] || 'Afiliado'}!</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-6 py-3 rounded-2xl border border-emerald-100 dark:border-emerald-800 flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5" />
                        <span className="text-sm font-black uppercase tracking-widest">Afiliado Verificado</span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[
                        { label: "Saldo Disponível", value: `Kz ${(affiliate?.stats?.balance || 0).toLocaleString()}`, icon: <Wallet className="w-6 h-6" />, color: "text-[#028dfe]", bg: "bg-blue-50 dark:bg-blue-900/20" },
                        { label: "Total Ganho", value: `Kz ${(affiliate?.stats?.total_earned || 0).toLocaleString()}`, icon: <TrendingUp className="w-6 h-6" />, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
                        { label: "Saques Pendentes", value: `Kz ${(affiliate?.stats?.pending_withdrawal || 0).toLocaleString()}`, icon: <DollarSign className="w-6 h-6" />, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl shadow-blue-500/5">
                            <div className={`w-12 h-12 md:w-14 md:h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6`}>
                                {stat.icon}
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{stat.label}</p>
                            <p className={`text-2xl md:text-3xl font-black ${stat.color} tracking-tight`}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Referral Section */}
                <div className="bg-linear-to-r from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-14 text-white shadow-2xl mb-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#028dfe]/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black mb-4 md:mb-6 tracking-tight">O Teu Link de Divulgação</h2>
                            <p className="text-gray-400 font-medium text-base md:text-lg leading-relaxed mb-8 md:mb-10">
                                Partilha o teu link único nas tuas redes sociais. Sempre que alguém comprar usando este link, ganhas comissão automaticamente.
                            </p>
                            <div className="bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl p-1.5 md:p-2 flex items-center backdrop-blur-md">
                                <div className="flex-1 px-4 md:px-6 text-blue-400 font-black tracking-tight truncate py-2 text-sm md:text-base">
                                    {window.location.origin}?r={code}
                                </div>
                                <button
                                    onClick={copyReferralLink}
                                    className="bg-[#028dfe] text-white p-4 md:p-5 rounded-xl md:rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20 group"
                                >
                                    {copied ? <CopyCheck className="w-5 h-5 md:w-6 md:h-6" /> : <Copy className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-12" />}
                                </button>
                            </div>
                        </div>
                        <div className="hidden lg:flex justify-center">
                            <div className="w-64 h-64 bg-white p-6 rounded-[2.5rem] flex flex-col items-center justify-center text-gray-900">
                                <div className="bg-gray-50 w-full h-full rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200">
                                    <span className="text-4xl font-black text-[#028dfe] tracking-tighter">QR CODE</span>
                                </div>
                                <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Brevemente QR Disponível</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-center">
                    <button
                        disabled={(affiliate?.stats?.balance || 0) < 10000}
                        onClick={() => setShowWithdrawModal(true)}
                        className={`px-12 py-6 rounded-3xl font-black uppercase tracking-widest text-sm shadow-2xl flex items-center gap-4 transition-all active:scale-95 ${(affiliate?.stats?.balance || 0) >= 10000
                            ? 'bg-[#028dfe] text-white hover:bg-blue-600 shadow-blue-500/20'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        <Wallet className="w-5 h-5" />
                        Solicitar Saque de Saldo
                    </button>
                </div>

                <Modal
                    isOpen={showWithdrawModal}
                    onClose={() => setShowWithdrawModal(false)}
                    title="Solicitar Pagamento"
                >
                    <form onSubmit={handleWithdraw} className="space-y-6">
                        {user && !user.phone && (
                            <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-2xl border border-red-100 dark:border-red-900/20 flex gap-4 text-red-500">
                                <AlertCircle className="w-6 h-6 shrink-0" />
                                <div>
                                    <p className="font-bold text-sm">Telefone em Falta</p>
                                    <p className="text-xs">Precisas cadastrar um telefone no teu perfil para receber os pagamentos.</p>
                                    <button type="button" onClick={() => navigate('/onboarding')} className="text-xs font-black underline mt-2 block">CADASTRAR AGORA</button>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Montante (Kz)</label>
                            <input
                                required
                                type="number"
                                min="10000"
                                max={affiliate?.stats?.balance}
                                value={withdrawForm.amount}
                                onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: parseFloat(e.target.value) })}
                                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-transparent focus:border-[#028dfe]/20 rounded-2xl py-5 px-6 focus:ring-4 focus:ring-[#028dfe]/5 outline-none text-gray-900 dark:text-white font-bold transition-all"
                                placeholder="Mínimo 10.000 Kz"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Banco</label>
                            <select
                                required
                                value={withdrawForm.bank}
                                onChange={(e) => setWithdrawForm({ ...withdrawForm, bank: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-transparent focus:border-[#028dfe]/20 rounded-2xl py-5 px-6 focus:ring-4 focus:ring-[#028dfe]/5 outline-none text-gray-900 dark:text-white font-bold transition-all appearance-none"
                            >
                                <option value="">Selecionar Banco...</option>
                                {ANGOLA_BANKS.map((bank, i) => (
                                    <option key={i} value={bank}>{bank}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">IBAN</label>
                            <input
                                required
                                type="text"
                                value={withdrawForm.iban}
                                onChange={(e) => setWithdrawForm({ ...withdrawForm, iban: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-transparent focus:border-[#028dfe]/20 rounded-2xl py-5 px-6 focus:ring-4 focus:ring-[#028dfe]/5 outline-none text-gray-900 dark:text-white font-bold transition-all"
                                placeholder="AO06 0000 0000 0000 0000 0000 0"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isProcessing || !user?.phone || withdrawForm.amount < 10000}
                            className="w-full bg-[#028dfe] text-white py-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmar Saque"}
                        </button>

                        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            Processamento em até 72h úteis
                        </p>
                    </form>
                </Modal>
            </div>
        );
    }

    // Fallback if somehow nothing returned but user exists
    return (
        <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[40vh]">
            <SEO title="Programa de Afiliados - Dtudo Shop" />
            <Back />
            <button
                onClick={fetchAffiliateData}
                className="bg-[#028dfe] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all text-sm"
            >
                Recarregar Dados
            </button>
        </div>
    );
}

export default Affiliates;
