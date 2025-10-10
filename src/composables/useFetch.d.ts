// composables/useFetch.d.ts
import { Ref } from "vue";

export interface UseFetchReturn<T = any> {
  data: Ref<T | null>;
  error: Ref<Error | null>;
  loading: Ref<boolean>;
  refetch: () => Promise<void>;
}

export interface UseFetchOptions {
  cacheTime?: number; // waktu cache dalam ms, default 0 (non-cache)
}

export function useFetch<T = any>(
  url: string,
  options?: RequestInit,
  config?: UseFetchOptions
): UseFetchReturn<T>;
