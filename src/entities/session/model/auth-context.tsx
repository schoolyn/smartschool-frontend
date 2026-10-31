import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import Cookies from "js-cookie";
import { useGetUserDetails } from "../api/user-details-service";
import { APIS_ROUTES, USER_ACCESS_KEY, authCookieOptions } from "@/shared/lib";
import { ILoginResponse, IUserAvatar, IUserPreferences } from "./types";
import LogoSpinner from "@/shared/ui/logo-spinner";
import apiClient from "@/shared/api/api-client";
import { isAuthPage } from "@/shared/config/auth-pages";
import { queryClient } from "@/shared/api/query-client";

type User = {
  name?: string;
  id?: string;
  email?: string;
  phoneNumber?: string;
  isPlatformAdmin?: boolean;
  preferences?: IUserPreferences;
  avatar?: IUserAvatar;
} | null;

interface IAuthContext {
  login: (data: ILoginResponse) => void;
  logout: () => void;
  // forgets the session on this device without leaving the page, for example after a password reset
  endSession: () => void;
  user: User;
  // merges a partial preferences update into the current user, the one source of truth for settings
  updatePreferences: (partial: Partial<IUserPreferences>) => void;
  updateAvatar: (avatar: IUserAvatar) => void;
  updateProfile: (partial: { name?: string; phoneNumber?: string }) => void;
}

const clearSessionCookies = () => {
  Cookies.remove(USER_ACCESS_KEY.TOKEN);
  Cookies.remove(USER_ACCESS_KEY.REFRESH_TOKEN);
  Cookies.remove(USER_ACCESS_KEY.ROLE);
};

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const getUserDetails = useGetUserDetails();

  const login = (data: ILoginResponse) => {
    // nothing cached for whoever used this device before may show to the person signing in now
    queryClient.clear();
    // expiries mirror the backend's own token lifetimes (1 day access / 30 day refresh)
    Cookies.set(USER_ACCESS_KEY.TOKEN, data.token, authCookieOptions(1));
    if (data.refreshToken) {
      Cookies.set(USER_ACCESS_KEY.REFRESH_TOKEN, data.refreshToken, authCookieOptions(30));
    }
    setUser(data);
  };

  const updatePreferences = (partial: Partial<IUserPreferences>) => {
    setUser((prev) =>
      prev ? { ...prev, preferences: { ...prev.preferences, ...partial } as IUserPreferences } : prev
    );
  };

  const updateAvatar = (avatar: IUserAvatar) => {
    setUser((prev) => (prev ? { ...prev, avatar } : prev));
  };

  const updateProfile = (partial: { name?: string; phoneNumber?: string }) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  };

  const endSession = () => {
    clearSessionCookies();
    queryClient.clear();
    setUser(null);
  };

  // ends the server session first so nothing re-renders empty; the full reload to /login clears the cache
  const logout = async () => {
    const token = Cookies.get(USER_ACCESS_KEY.TOKEN);
    const revoke = token
      ? apiClient.post(APIS_ROUTES.LOGOUT, {}, { headers: { accesstoken: `Bearer ${token}` } }).catch(() => {})
      : Promise.resolve();
    await Promise.race([revoke, new Promise((resolve) => setTimeout(resolve, 1500))]);
    clearSessionCookies();
    window.location.replace("/login");
  };

  useEffect(() => {
    if (Cookies.get(USER_ACCESS_KEY.TOKEN)) {
      if (getUserDetails.isSuccess && getUserDetails.data) setUser(getUserDetails.data);
    }
  }, [getUserDetails.isSuccess, getUserDetails.data]);

  useEffect(() => {
    if (getUserDetails.isError) {
      if (Cookies.get(USER_ACCESS_KEY.TOKEN)) endSession();
      if (!isAuthPage()) {
        window.location.href = "/login";
      }
    }
  }, [getUserDetails.isError]);

  // the only full-page loader: session not yet confirmed or not yet stored, so guards never see signed out
  const isCheckingSession =
    !!Cookies.get(USER_ACCESS_KEY.TOKEN) && (getUserDetails.isLoading || (getUserDetails.isSuccess && !user));

  if (isCheckingSession) {
    return <LogoSpinner />;
  }

  return (
    <AuthContext.Provider value={{ login, logout, endSession, user, updatePreferences, updateAvatar, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
