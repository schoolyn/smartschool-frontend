interface AuthHeadingProps {
  title: string;
  subtitle?: React.ReactNode;
}

const AuthHeading = ({ title, subtitle }: AuthHeadingProps) => (
  <>
    <h1 className="mt-7 text-2xl font-medium tracking-tight text-gray-900">{title}</h1>
    {subtitle && <p className="mt-1.5 text-sm text-gray-600">{subtitle}</p>}
  </>
);

export default AuthHeading;
