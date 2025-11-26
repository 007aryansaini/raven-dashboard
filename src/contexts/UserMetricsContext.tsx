import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useAccount } from "wagmi";
import { BACKEND_URL } from "../utils/constants";

interface UserMetricsContextValue {
  creditsPending: number | null;
  inferenceRemaining: number | null;
  refreshMetrics: () => Promise<void>;
}

const UserMetricsContext = createContext<UserMetricsContextValue | undefined>(
  undefined
);

export const UserMetricsProvider = ({ children }: { children: ReactNode }) => {
  const { address, isConnected } = useAccount();
  const [creditsPending, setCreditsPending] = useState<number | null>(null);
  const [inferenceRemaining, setInferenceRemaining] = useState<number | null>(null);

  const numericValue = useCallback((value: unknown): number => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  }, []);

  const fetchCreditsPending = useCallback(
    async (signal?: AbortSignal) => {
      if (!address || !isConnected) {
        setCreditsPending(null);
        return;
      }

      setCreditsPending(null);

      try {
        const response = await fetch(`${BACKEND_URL}users/${address}/credits/pending`, {
          signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch credits: ${response.status}`);
        }

        const data = await response.json();
        const creditsValue = numericValue(
          data?.pendingCredits ??
            data?.creditsPending ??
            data?.credits ??
            data?.pending ??
            data?.pending_credits ??
            0
        );

        setCreditsPending(creditsValue);
      } catch (error: any) {
        if (signal?.aborted) return;
        console.error("Error fetching credits:", error);
        setCreditsPending(0);
      }
    },
    [address, isConnected, numericValue]
  );

  const fetchInferenceRemaining = useCallback(
    async (signal?: AbortSignal) => {
      if (!address || !isConnected) {
        setInferenceRemaining(null);
        return;
      }

      setInferenceRemaining(null);

      try {
        const mode = "full";
        const response = await fetch(
          `${BACKEND_URL}users/${address}/inference/remaining?mode=${encodeURIComponent(
            mode
          )}`,
          {
            signal,
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch inference remaining: ${response.status}`);
        }

        const data = await response.json();
        const inferenceValue = numericValue(
          data?.remaining ??
            data?.inferenceRemaining ??
            data?.inference_remaining ??
            data?.inference ??
            data?.result ??
            0
        );

        setInferenceRemaining(inferenceValue);
      } catch (error: any) {
        if (signal?.aborted) return;
        console.error("Error fetching inference remaining:", error);
        setInferenceRemaining(0);
      }
    },
    [address, isConnected, numericValue]
  );

  const fetchMetrics = useCallback(
    async (signal?: AbortSignal) => {
      await Promise.all([
        fetchCreditsPending(signal),
        fetchInferenceRemaining(signal),
      ]);
    },
    [fetchCreditsPending, fetchInferenceRemaining]
  );

  const refreshMetrics = useCallback(async () => {
    const controller = new AbortController();
    try {
      await fetchMetrics(controller.signal);
    } finally {
      controller.abort();
    }
  }, [fetchMetrics]);

  useEffect(() => {
    const controller = new AbortController();
    void fetchMetrics(controller.signal);
    return () => controller.abort();
  }, [fetchMetrics]);

  const value = {
    creditsPending,
    inferenceRemaining,
    refreshMetrics,
  };

  return (
    <UserMetricsContext.Provider value={value}>
      {children}
    </UserMetricsContext.Provider>
  );
};

export const useUserMetrics = () => {
  const context = useContext(UserMetricsContext);

  if (!context) {
    throw new Error("useUserMetrics must be used within UserMetricsProvider");
  }

  return context;
};

