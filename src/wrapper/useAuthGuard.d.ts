export function useAuthGuard(): (
  refreshTokenExpiration: number,
  onExpiredCallback: () => void
) => boolean;