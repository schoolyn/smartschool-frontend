import { useTheme } from "@/context/theme-context";

interface BrandLogoProps {
  className?: string;
}

// opscul.png is the black wordmark, for light backgrounds.
// opscul-light.png is the white wordmark, for dark backgrounds.
// One place to pick the right asset.
const BrandLogo = ({ className }: BrandLogoProps) => {
  const { theme } = useTheme();
  const src = theme === "dark" ? "/opscul-light.png" : "/opscul.png";

  return <img src={src} alt="Opscul" className={className} />;
};

export default BrandLogo;
