import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { MOMENTS } from "./auth-content";
import { useAutoAdvance } from "./use-auto-advance";

const ROTATE_MS = 5000;

const MomentList = ({ active, onSelect }: { active: number; onSelect: (index: number) => void }) => (
  <div className="mt-5 rounded-2xl border border-white/10 bg-[#131418] p-1.5">
    {MOMENTS.map((moment, i) => {
      const on = i === active;
      return (
        <button
          key={moment.title}
          type="button"
          aria-pressed={on}
          onClick={() => onSelect(i)}
          className={cn(
            "grid w-full grid-cols-[52px_1fr_auto] items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-white/5",
            on && "bg-white/5",
          )}
        >
          <span className={cn("font-mono text-[12px]", on ? "text-white" : "text-white/40")}>{moment.time}</span>
          <span className="flex min-w-0 items-baseline gap-2.5">
            <span className="text-[15px] font-semibold tracking-tight">{moment.title}</span>
            <span className="truncate text-[12.5px] text-white/50">{moment.who}</span>
          </span>
          <span className={cn("h-2 w-2 rounded-full", on ? "bg-white" : "bg-transparent")} />
        </button>
      );
    })}
  </div>
);

const LiveCard = ({ active }: { active: number }) => {
  const moment = MOMENTS[active];

  return (
    <div className="relative mt-3 overflow-hidden rounded-2xl border border-white/10 bg-[#0f1013] p-4">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(420px circle at 100% 100%, rgba(255,255,255,0.08), rgba(255,255,255,0) 60%)",
        }}
      />
      <div className="relative mb-4 flex justify-between font-mono text-xs text-white/50">
        <span>
          {moment.time} · {moment.title}
        </span>
        <span className="flex items-center gap-2">
          <span className="login-pulse h-[7px] w-[7px] rounded-full bg-green-500" />
          LIVE
        </span>
      </div>

      <div key={active} className="fade-up relative">
        <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-[#16171b] px-4 py-3.5">
          <span className="flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] tracking-[0.06em] text-white/60">{moment.from}</span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 font-mono text-[11px] text-white/80">
              {moment.effort}
            </span>
          </span>
          <span className="min-h-[2.75rem] text-base font-medium leading-snug tracking-tight">{moment.action}</span>
        </div>

        <div className="flex items-center gap-3 py-2.5 pl-6">
          <span className="h-6 w-px [background:repeating-linear-gradient(rgba(255,255,255,0.5)_0_4px,transparent_4px_8px)]" />
          <span className="font-mono text-[11.5px] text-white/50">{moment.channels}</span>
        </div>

        <div className="ml-auto flex h-[84px] w-[min(100%,340px)] items-center gap-3 rounded-2xl bg-[rgba(246,246,244,0.96)] px-3.5 py-3 text-[#0c0d10] shadow-[0_20px_50px_-16px_rgba(0,0,0,0.6)]">
          <img src="/opscul-tile.png" alt="" className="h-[34px] w-[34px] flex-none rounded-[9px]" />
          <span className="flex min-w-0 flex-col gap-[3px]">
            <span className="flex justify-between gap-3 text-xs text-[#5e6169]">
              <span>OPSCUL · Parent app</span>
              <span>now</span>
            </span>
            <span className="truncate text-[14px] font-semibold leading-5">{moment.pushTitle}</span>
            <span className="truncate text-[13px] leading-5 text-[#3a3c42]">{moment.pushBody}</span>
          </span>
        </div>
      </div>

      <div className="relative mt-4 flex gap-1.5">
        {MOMENTS.map((m, i) => (
          <span key={m.title} className={cn("h-[3px] flex-1 rounded-sm", i <= active ? "bg-white" : "bg-white/15")} />
        ))}
      </div>
    </div>
  );
};

const AuthShowcase = () => {
  const { t } = useTranslation();
  const { index, select } = useAutoAdvance(MOMENTS.length, ROTATE_MS);

  return (
    <div className="w-full max-w-xl">
      <span className="font-mono text-xs tracking-[0.08em] text-white/50">{t("labels.login_panel_tag")}</span>
      <h2 className="mt-3 text-3xl font-semibold leading-[1.05] tracking-tight xl:text-4xl">
        {t("labels.login_panel_title")}
      </h2>
      <MomentList active={index} onSelect={select} />
      <LiveCard active={index} />
    </div>
  );
};

export default AuthShowcase;
