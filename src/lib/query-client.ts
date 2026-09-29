import { QueryClient } from "@tanstack/react-query";
// Shared cache for all category queries
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, 
      refetchOnWindowFocus: false,
    },
  },
});