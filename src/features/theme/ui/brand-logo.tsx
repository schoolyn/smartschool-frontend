import { useTheme } from "../model/theme-context";

interface BrandLogoProps {
  className?: string;
}

// opscul.png is the black wordmark (light backgrounds), opscul-light.png the white one (dark backgrounds)
const BrandLogo = ({ className }: BrandLogoProps) => {
  const { theme } = useTheme();
  const src = theme === "dark" ? "/opscul-light.png" : "/opscul.png";

  return <img src={src} alt="Opscul" className={className} />;
};

export default BrandLogo;
