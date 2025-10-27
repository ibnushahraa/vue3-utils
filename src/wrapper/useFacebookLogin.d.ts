import { Ref } from 'vue';

export interface FacebookUser {
  id: string;
  email: string;
  name: string;
  picture: string | null;
}

export interface FacebookLoginSuccessResponse {
  accessToken: string;
  user: FacebookUser;
}

export interface UseFacebookLoginOptions {
  appId: string;
  onSuccess: (response: FacebookLoginSuccessResponse) => void;
  onError?: (error: Error) => void;
  scope?: string;
}

export interface UseFacebookLoginReturn {
  login: () => Promise<void>;
  isLoading: Ref<boolean>;
  error: Ref<Error | null>;
}

export function useFacebookLogin(
  options: UseFacebookLoginOptions
): UseFacebookLoginReturn;
