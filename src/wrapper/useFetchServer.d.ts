import type { Ref } from 'vue'
import type { FetchOptions } from 'ofetch'
import type { FetchManagerOptions } from '../core/FetchManager'

export interface UseFetchServerReturn {
  fetchWithAuth: <T = any>(url: string, options?: FetchOptions) => Promise<T>
  isRefreshing: Ref<boolean>
  clearTokens: () => void
}

export declare function useFetchServer(
  baseUrl?: string,
  options?: FetchManagerOptions
): UseFetchServerReturn