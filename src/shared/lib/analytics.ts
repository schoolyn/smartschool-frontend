// one anonymous "app_open" GA event per session in production; page views off since URLs carry school ids
const GA_ID = import.meta.env.VITE_GA_ID?.trim();
const SESSION_KEY = "opscul-app-open-sent";

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

export function trackAppOpen() {
  if (!import.meta.env.PROD || !GA_ID) return;

  try {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // storage blocked (private mode): still count this load, it just can't be de-duplicated
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  // gtag must push the arguments object itself, not an array, or GA ignores the command
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };

  const location = `${window.location.origin}/`;
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { send_page_view: false, page_location: location, page_title: "Opscul app" });
  window.gtag("event", "app_open", { page_location: location });
}
