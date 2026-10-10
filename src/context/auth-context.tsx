import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import Cookies from "js-cookie";
import { useGetUserDetails } from "./service";
import { APIS_ROUTES, USER_ACCESS_KEY, authCookieOptions } from "../utils";
import { ILoginResponse, IUserAvatar, IUserPreferences } from "../types";
import LogoSpinner from "../components/logo-spinner";
import apiClient from "../config/api-client";
import { isAuthPage } from "../config/auth-pages";

type User = {
  name?: string;
  id?: string;
  email?: string;
  role?: "admin" | "parent" | "teacher";
  phoneNumber?: string;
  isPlatformAdmin?: boolean;
  permissions?: {
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    isGlobalAdmin: boolean;
  };
  preferences?: IUserPreferences;
  avatar?: IUserAvatar;
} | null;

interface IAuthContext {
  login: (data: ILoginResponse) => void;
  logout: () => void;
  // forgets the session on this device without leaving the page, for example after a password reset
  endSession: () => void;
  user: User;
  // merges a partial preferences update into the current user in place — the one
  // source of truth for "what does this user have set right now", so consumers
  // (theme, language, notification switches) don't each need their own local
  // state + a useEffect to keep it in sync with the server value
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
    // expiries mirror the backend's own token lifetimes (1 day access / 30 day refresh)
    Cookies.set(USER_ACCESS_KEY.TOKEN, data.token, authCookieOptions(1));
    if (data.refreshToken) {
      Cookies.set(USER_ACCESS_KEY.REFRESH_TOKEN, data.refreshToken, authCookieOptions(30));
    }
    Cookies.set(USER_ACCESS_KEY.ROLE, data.role, authCookieOptions(30));
    setUser(data);
  };

  const updatePreferences = (partial: Partial<IUserPreferences>) => {
    setUser((prev) =>
      prev ? { ...prev, preferences: { ...prev.preferences, ...partial } as IUserPreferences } : prev,
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
    setUser(null);
  };

  const logout = () => {
    // best-effort session revocation — clear local cookies regardless of outcome
    apiClient.post(APIS_ROUTES.LOGOUT).catch(() => {});
    clearSessionCookies();
    window.location.href = "/login";
  };

  useEffect(() => {
    if (Cookies.get(USER_ACCESS_KEY.TOKEN)) {
      if (getUserDetails.isSuccess && getUserDetails.data) {
        if (getUserDetails.data.role !== Cookies.get(USER_ACCESS_KEY.ROLE)) {
          clearSessionCookies();
          window.location.href = "/login";
        } else {
          setUser(getUserDetails.data);
        }
      }
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

  // a token cookie exists but we haven't yet confirmed it's still valid (page load / hard refresh) —
  // this is the ONLY place the full-page logo loader should show; every other loading state
  // in the app is a normal in-page spinner, not this one
  // it also covers the render between the server confirming the user and the effect above storing it, so route
  // guards never see a signed-in visitor as signed out
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
