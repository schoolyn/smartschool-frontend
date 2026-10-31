// one shape for every auth cookie so options don't drift; `expires` is in days, like js-cookie
export const authCookieOptions = (expiresInDays: number) => ({
  secure: true,
  sameSite: "lax" as const,
  expires: expiresInDays,
});
