import { getBackendBaseUrl } from "./constants";

export interface AuthorizeInferenceOptions {
  quantity?: number;
  settle?: boolean;
  contextHash?: string;
  reason?: string;
}

export type AuthorizeInferenceResponse = {
  allowed: boolean;
  method: "initial_grant" | "deny" | "subscription" | "credits";
  reason: string;
  cost: number;
};

const defaultOptions: Required<AuthorizeInferenceOptions> = {
  quantity: 1,
  settle: false,
  contextHash: "",
  reason: "",
};

export async function authorizeInference(
  account: string | null | undefined,
  options: AuthorizeInferenceOptions = {}
): Promise<AuthorizeInferenceResponse> {
  if (!account) {
    throw new Error("Wallet not connected");
  }

  const payload = {
    user: account,
    quantity: options.quantity ?? defaultOptions.quantity,
    settle: Boolean(options.settle ?? defaultOptions.settle),
    contextHash: options.contextHash ?? defaultOptions.contextHash,
    reason: options.reason ?? defaultOptions.reason,
  };

  const response = await fetch(`${getBackendBaseUrl()}inference/authorize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      `Inference authorization failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  console.debug("[inference] authorizeInference response:", data);
  return data;
}

