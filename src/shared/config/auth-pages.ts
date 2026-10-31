// pages a signed-out visitor must be able to stay on; a failed session check never redirects away from them
const AUTH_PAGES = ["/login", "/forgot-password", "/set-password", "/reset-password"];

export const isAuthPage = (pathname = window.location.pathname) =>
  AUTH_PAGES.includes(pathname.replace(/\/+$/, "") || "/");
