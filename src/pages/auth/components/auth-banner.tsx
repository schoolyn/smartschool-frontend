import { useTranslation } from "react-i18next";

import { FEATURES } from "./auth-content";

// compact product pitch for screens too narrow to show the side panel
const AuthBanner = () => {
  const { t } = useTranslation();

  return (
    <div className="relative mt-6 overflow-hidden rounded-xl bg-gradient-to-br from-[#0a0a0a] via-[#1c1c1c] to-[#3a3a3a] p-5 text-white lg:hidden">
      <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
      <p className="relative text-lg font-semibold leading-snug">{t("labels.login_hero")}</p>
      <div className="relative mt-3 flex flex-wrap gap-2">
        {FEATURES.filter(({ key }) => key !== "mobile").map(({ key, icon: Icon }) => (
          <span key={key} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs">
            <Icon className="h-3.5 w-3.5" />
            {t(`labels.login_feature_${key}`)}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AuthBanner;
