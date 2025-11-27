import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useAccount } from "wagmi";
import { getBackendBaseUrl } from "../utils/constants";

interface UserMetricsContextValue {
  creditsPending: number | null;
  inferenceRemaining: number | null;
  hasActiveSubscription: boolean;
  subscriptionPlanId: number | null;
  refreshMetrics: () => Promise<void>;
}

const UserMetricsContext = createContext<UserMetricsContextValue | undefined>(
  undefined
);

const parseNumericField = (value: unknown): number | null => {
  if (value === undefined || value === null) {
    return null;
  }

  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : null;
};

const parseBooleanField = (value: unknown): boolean => {
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return Boolean(value);
};

export const UserMetricsProvider = ({ children }: { children: ReactNode }) => {
  const { address, isConnected } = useAccount();
  const [creditsPending, setCreditsPending] = useState<number | null>(null);
  const [inferenceRemaining, setInferenceRemaining] = useState<number | null>(
    null
  );
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionPlanId, setSubscriptionPlanId] = useState<number | null>(
    null
  );

  const numericValue = useCallback((value: unknown): number => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  }, []);

  const fetchUserSummary = useCallback(
    async (signal?: AbortSignal) => {
      if (!address || !isConnected) {
        setCreditsPending(null);
        setInferenceRemaining(null);
        setHasActiveSubscription(false);
        setSubscriptionPlanId(null);
        return;
      }

      setCreditsPending(null);
      setInferenceRemaining(null);

      try {
        const response = await fetch(`${getBackendBaseUrl()}users/${address}/summary`, {
          signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user summary: ${response.status}`);
        }

        const data = await response.json();
        const creditsValue = numericValue(
          data?.credits ??
            data?.pendingCredits ??
            data?.creditsPending ??
            data?.pending ??
            data?.pending_credits ??
            0
        );
        const inferenceValue = numericValue(
          data?.inference?.remaining ??
            data?.inferenceRemaining ??
            data?.inference_remaining ??
            data?.inference ??
            data?.remaining ??
            data?.result ??
            0
        );

        const planId = parseNumericField(
          data?.subscription?.planId ??
            data?.subscription?.plan?.planId ??
            data?.subscription?.plan?.id ??
            null
        );

        const activeFlag = parseBooleanField(
          data?.activeSubscription ??
            data?.subscription?.plan?.active ??
            data?.subscription?.active ??
            false
        );

        setCreditsPending(creditsValue);
        setInferenceRemaining(inferenceValue);
        setSubscriptionPlanId(planId);
        setHasActiveSubscription(activeFlag || Boolean(planId));
      } catch (error: any) {
        if (signal?.aborted) return;
        console.error("Error fetching user summary:", error);
        setCreditsPending(0);
        setInferenceRemaining(0);
        setHasActiveSubscription(false);
        setSubscriptionPlanId(null);
      }
    },
    [address, isConnected, numericValue]
  );

  const refreshMetrics = useCallback(async () => {
    const controller = new AbortController();
    try {
      await fetchUserSummary(controller.signal);
    } finally {
      controller.abort();
    }
  }, [fetchUserSummary]);

  useEffect(() => {
    const controller = new AbortController();
    void fetchUserSummary(controller.signal);
    return () => controller.abort();
  }, [fetchUserSummary]);

  const value = {
    creditsPending,
    inferenceRemaining,
    hasActiveSubscription,
    subscriptionPlanId,
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

