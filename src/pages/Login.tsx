import { GoogleLogin } from "@react-oauth/google";
import { login } from "../services/auth";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md px-6">
                {/* Logo/Brand Section */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2" style={{ color: '#028dfe' }}>
                        DTudo Store
                    </h1>
                    <p className="text-gray-600">
                        Entre para continuar suas compras
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                        Bem-vindo de volta!
                    </h2>

                    <div className="space-y-4">
                        <GoogleLogin onSuccess={async (response) => {
                            const token = response.credential;
                            
                            if (!token) throw new Error("Token not found");

                            try {
                                await login(token);
                                navigate('/');
                            } catch (error) {
                                console.log(error);
                            }
                        }}
                        onError={() => {
                            console.log("error");
                        }}
                    />
                </div>

                    {/* Additional Info */}
                    <div className="mt-6 text-center text-sm text-gray-500">
                        Ao fazer login, você concorda com nossos{' '}
                        <a href="#" className="underline hover:text-blue-600">
                            Termos de Serviço
                        </a>
                        {' '}e{' '}
                        <a href="#" className="underline hover:text-blue-600">
                            Política de Privacidade
                        </a>
                    </div>
                </div>

                {/* Footer Note */}
                <p className="text-center text-gray-500 text-sm mt-6">
                    Novo por aqui? O cadastro será feito automaticamente no primeiro login.
                </p>
            </div>
        </div>
    )
}

export default Login;