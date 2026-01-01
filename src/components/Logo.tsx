import { Link } from "react-router-dom";
import LogoImage from "../assets/Logo_Dtudo.png";

function Logo() {
    return (
        <Link to="/" aria-disabled>
            <img className="w-24" src={LogoImage} alt="Logo image Dtudo Store" />
        </Link>
    )
}

export default Logo;