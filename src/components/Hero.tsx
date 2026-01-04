import HeroImage from "../assets/hero.png";

interface HeroProps {
  className?: string;
}

function Hero({ className }: HeroProps) {
  return (
    <div className={className}>
      <img src={HeroImage} alt="Hero" className="w-full h-auto" />
    </div>
  );
}

export default Hero;