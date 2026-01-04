import { GoogleLogin } from "@react-oauth/google";
import { login } from "../services/auth";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";

// Components
import Logo from "../components/Logo";
import Hero from "../components/Hero";

function Login() {
    const { refreshUser } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (response: any) => {
        const token = response.credential;

        if (!token) throw new Error("Token not found");

        try {
            await login(token);
            await refreshUser();
            navigate('/');
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="w-full p-6 lg:p-8">
            <div className="w-full">
                <Logo />
            </div>

            <div className="flex flex-col lg:flex-row gap-10 lg:gap-5 justify-between mt-10">
                <div className="w-full lg:w-1/2 flex flex-col gap-6 lg:mt-10">
                    <h1 className="text-3xl lg:text-5xl text-left font-bold text-[#309EE9]">
                        Faça login para começar a sua experiência de compras.
                    </h1>
                    <p className="text-left text-gray-400 w-full lg:w-1/2">
                        Novo por aqui? O cadastro será feito automaticamente no primeiro login.
                    </p>

                    <div className="w-full lg:w-1/2">
                        <GoogleLogin
                            onSuccess={handleLogin}
                            onError={() => console.error()}
                        />
                    </div>

                    <p className="text-left text-gray-400 w-full lg:w-1/2">
                        Ao fazer login, você concorda com nossos <a href="#" className="text-[#309EE9]">Termos de Serviço</a> e <a href="#" className="text-[#309EE9]">Política de Privacidade</a>.
                    </p>
                </div>

                <Hero className="w-full lg:w-1/2" />
            </div>
        </div>
    )
}

export default Login;