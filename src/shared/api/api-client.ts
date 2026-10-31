import axios from "axios";
import get from "lodash.get";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

import { APIS_ROUTES, USER_ACCESS_KEY, authCookieOptions } from "../lib";
import { isAuthPage } from "../config/auth-pages";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// separate instance for the refresh call, so a failed refresh can't recurse through apiClient's interceptors
const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const formatApiError = (error: unknown) => ({
  status: get(error, "response.status"),
  response: get(error, "response.data"),
  message: get(error, "response.data.Error.message"),
});

const clearSessionAndRedirect = () => {
  Cookies.remove(USER_ACCESS_KEY.TOKEN);
  Cookies.remove(USER_ACCESS_KEY.REFRESH_TOKEN);
  Cookies.remove(USER_ACCESS_KEY.ROLE);
  if (!isAuthPage()) {
    window.location.href = "/login";
  }
};

const bearerOf = (headers: unknown) => String(get(headers, "accesstoken", "")).replace(/^Bearer /, "");

// refresh tokens rotate, so a browser lock lets one tab refresh at a time; `failedToken` is the rejected one
let refreshInFlight: Promise<string> | null = null;

const refreshTokens = (failedToken: string): Promise<string> => {
  const run = async () => {
    const current = Cookies.get(USER_ACCESS_KEY.TOKEN);
    if (current && current !== failedToken) return current;

    const refreshToken = Cookies.get(USER_ACCESS_KEY.REFRESH_TOKEN);
    if (!refreshToken) throw new Error("No refresh token");
    try {
      const { data } = await refreshClient.post(APIS_ROUTES.REFRESH_TOKEN, { refreshToken });
      const newToken = data?.Data?.token;
      if (!newToken) throw new Error("Refresh did not return a token");

      Cookies.set(USER_ACCESS_KEY.TOKEN, newToken, authCookieOptions(1));
      if (data?.Data?.refreshToken)
        Cookies.set(USER_ACCESS_KEY.REFRESH_TOKEN, data.Data.refreshToken, authCookieOptions(30));
      return newToken as string;
    } catch (error) {
      // another tab may have refreshed with this same token a moment earlier; its new token is still good
      const latest = Cookies.get(USER_ACCESS_KEY.TOKEN);
      if (latest && latest !== failedToken && Cookies.get(USER_ACCESS_KEY.REFRESH_TOKEN) !== refreshToken)
        return latest;
      throw error;
    }
  };

  // within this tab, requests that fail together share one refresh
  refreshInFlight ??= (navigator.locks ? navigator.locks.request("opscul-token-refresh", run) : run()).finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
};

apiClient.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.get(USER_ACCESS_KEY.TOKEN);

    if (accessToken) {
      config.headers["accesstoken"] = `Bearer ${accessToken}`;
    }

    if (!(config.data instanceof FormData)) {
      config.headers["content-type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(new Error(error.response.data))
);

apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    // a failed file download carries its JSON error as a Blob; read it so callers get the message
    const body = error?.response?.data;
    if (typeof Blob !== "undefined" && body instanceof Blob && body.type.includes("json")) {
      try {
        error.response.data = JSON.parse(await body.text());
      } catch {
        // not JSON after all; keep the generic message
      }
    }

    const originalRequest = error.config;
    const status = error?.response?.status;
    const isAuthRoute =
      originalRequest?.url?.includes(APIS_ROUTES.REFRESH_TOKEN) || originalRequest?.url?.includes(APIS_ROUTES.SIGNIN);

    // 401 on a non-auth route: refresh once and retry; only clearSessionAndRedirect ends a session
    if (status === 401 && !isAuthRoute) {
      if (originalRequest?._retry || !Cookies.get(USER_ACCESS_KEY.REFRESH_TOKEN)) {
        clearSessionAndRedirect();
        return Promise.reject(formatApiError(error));
      }
      originalRequest._retry = true;

      try {
        const newToken = await refreshTokens(bearerOf(originalRequest.headers));
        originalRequest.headers["accesstoken"] = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch {
        clearSessionAndRedirect();
        return Promise.reject(formatApiError(error));
      }
    }

    // a 403 is shown where it happened; redirecting the app on one refused background request misled people
    if (status === 405) {
      toast.error("Your session has expired. Please sign in again.");
      clearSessionAndRedirect();
    } else if (status && status >= 500) {
      // one toast however many requests failed at once
      toast.error(get(error, "response.data.Error.message") || "Something went wrong on our side. Please try again.", {
        id: "server-error",
      });
    }

    return Promise.reject(formatApiError(error));
  }
);

export default apiClient;
