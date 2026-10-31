import { QueryClient } from "@tanstack/react-query";

// fresh for 5 min, kept 10 min; network blips retry once, 400/403/404 don't since retrying can't help
const FIVE_MINUTES = 5 * 60 * 1000;
const TEN_MINUTES = 10 * 60 * 1000;

const isWorthRetrying = (error: unknown) => {
  const status = (error as { status?: number } | null)?.status;
  return !status || status >= 500;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: FIVE_MINUTES,
      gcTime: TEN_MINUTES,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => failureCount < 1 && isWorthRetrying(error),
    },
  },
});
