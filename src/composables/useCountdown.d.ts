import { Ref, ComputedRef } from 'vue';

export interface UseCountdownOptions {
  onExpired?: () => void;
}

export interface UseCountdownReturn {
  hours: ComputedRef<string>;
  minutes: ComputedRef<string>;
  seconds: ComputedRef<string>;
  remaining: Ref<number>;
  onExpired: (fn: () => void) => void;
  onSuccess: (fn: () => void) => void;
  triggerSuccess: () => void;
}

export function useCountdown(
  expiredUnix: number,
  options?: UseCountdownOptions
): UseCountdownReturn;
