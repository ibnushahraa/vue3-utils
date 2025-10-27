import { Ref } from 'vue';

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  email_verified: boolean;
}

export interface GoogleLoginSuccessResponse {
  credential: string;
  user: GoogleUser;
}

export interface UseGoogleLoginOptions {
  clientId: string;
  onSuccess: (response: GoogleLoginSuccessResponse) => void;
  onError?: (error: Error) => void;
}

export interface UseGoogleLoginReturn {
  login: () => Promise<void>;
  isLoading: Ref<boolean>;
  error: Ref<Error | null>;
}

export function useGoogleLogin(
  options: UseGoogleLoginOptions
): UseGoogleLoginReturn;
