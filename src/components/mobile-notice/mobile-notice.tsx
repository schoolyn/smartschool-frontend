import BrandLogo from "@/components/brand-logo/brand-logo";

const MobileNotice = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-100 px-6 text-center">
    <BrandLogo className="h-7" />
    <img src="/screen-not-supported.png" alt="" className="w-64 max-w-full dark:invert" />
    <div className="space-y-2 max-w-xs">
      <h1 className="text-xl font-semibold text-gray-900">Best viewed on a larger screen</h1>
      <p className="text-sm text-gray-600">
        The Opscul admin app is built for tablets and computers for now. A fully mobile-friendly version is on the way.
      </p>
    </div>
  </div>
);

export default MobileNotice;
