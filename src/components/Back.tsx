import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function Back() {
    const navigate = useNavigate();
    return (
          <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#008cff] dark:hover:text-[#008cff] mb-6 transition-colors group"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Voltar</span>
            </button>
    )
}

export default Back;