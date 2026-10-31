export interface IForgetPasswordRequest {
  email: string;
  captcha_token: string | null;
}

export interface ILoginResponse {
  id: string;
  email: string;
  token: string;
  refreshToken?: string;
  name: string;
  isPlatformAdmin?: boolean;
  preferences?: IUserPreferences;
  avatar?: IUserAvatar;
}

export interface IForgotPassword {
  email: string;
}

export interface IUserPreferences {
  theme: "light" | "dark";
  locale: "en" | "hi";
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export interface IUserAvatar {
  publicId: string;
  url: string;
}

export interface IUserDetailResponse {
  id: string;
  email: string;
  token: string;
  isPlatformAdmin?: boolean;
  preferences?: IUserPreferences;
  avatar?: IUserAvatar;
}
