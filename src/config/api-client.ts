import axios from "axios";
import get from "lodash.get";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

import { APIS_ROUTES, USER_ACCESS_KEY, authCookieOptions } from "../utils";
import { isAuthPage } from "./auth-pages";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// separate instance for the refresh call itself — must never go through
// apiClient's own interceptors, or a failed refresh would recurse into itself
const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const formatApiError = (error: unknown) => ({
  status: get(error, "response.status"),
  response: get(error, "response.data"),
  message: get(error, "response.data.Error.message"),
});

type PendingRequest = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let isRefreshing = false;
let pendingQueue: PendingRequest[] = [];

const resolveQueue = (token: string) => {
  pendingQueue.forEach(({ resolve }) => resolve(token));
  pendingQueue = [];
};

const rejectQueue = (error: unknown) => {
  pendingQueue.forEach(({ reject }) => reject(error));
  pendingQueue = [];
};

const clearSessionAndRedirect = () => {
  Cookies.remove(USER_ACCESS_KEY.TOKEN);
  Cookies.remove(USER_ACCESS_KEY.REFRESH_TOKEN);
  Cookies.remove(USER_ACCESS_KEY.ROLE);
  if (!isAuthPage()) {
    window.location.href = "/login";
  }
};

// Request interceptor to add token to request headers
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

// Response interceptor
apiClient.interceptors.response.use(
  // Return the response as-is
  (response) => response,

  // Handle errors
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    const isAuthRoute =
      originalRequest?.url?.includes(APIS_ROUTES.REFRESH_TOKEN) ||
      originalRequest?.url?.includes(APIS_ROUTES.SIGNIN);

    // 401 on any non-auth route: try one silent refresh before giving up.
    // Everything that can end a session funnels through clearSessionAndRedirect
    // so there's exactly one place that decides "the session is dead, go to /login".
    if (status === 401 && !isAuthRoute) {
      if (originalRequest?._retry || !Cookies.get(USER_ACCESS_KEY.REFRESH_TOKEN)) {
        clearSessionAndRedirect();
        return Promise.reject(formatApiError(error));
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (newToken) => {
              originalRequest.headers["accesstoken"] = `Bearer ${newToken}`;
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;
      try {
        const refreshToken = Cookies.get(USER_ACCESS_KEY.REFRESH_TOKEN);
        const { data } = await refreshClient.post(APIS_ROUTES.REFRESH_TOKEN, {
          refreshToken,
        });
        const newToken = data?.Data?.token;
        const newRefreshToken = data?.Data?.refreshToken;

        if (!newToken) {
          throw new Error("Refresh did not return a token");
        }

        Cookies.set(USER_ACCESS_KEY.TOKEN, newToken, authCookieOptions(1));
        if (newRefreshToken) {
          Cookies.set(USER_ACCESS_KEY.REFRESH_TOKEN, newRefreshToken, authCookieOptions(30));
        }

        isRefreshing = false;
        resolveQueue(newToken);

        originalRequest.headers["accesstoken"] = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch {
        isRefreshing = false;
        const formatted = formatApiError(error);
        rejectQueue(formatted);
        clearSessionAndRedirect();
        return Promise.reject(formatted);
      }
    }

    if (status === 403) {
      // a refused page load goes to the access-denied screen; a refused action (create, update,
      // delete) stays where it happened so the caller can tell the user why it was refused
      if (originalRequest?.method?.toLowerCase() === "get") window.location.href = "/not-access";
    } else if (status === 405) {
      toast.error("token is expired please login and continue");
      clearSessionAndRedirect();
    } else if (status === 500 || status === 503) {
      alert("Server under maintenance");
    }

    return Promise.reject(formatApiError(error));
  }
);

export default apiClient;
