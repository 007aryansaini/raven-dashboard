import { getBackendBaseUrl } from "./constants";

export interface AuthorizeInferenceOptions {
  quantity?: number;
  settle?: boolean;
  contextHash?: string;
  reason?: string;
  tags?: boolean;
}

export type AuthorizeInferenceResponse = {
  allowed: boolean;
  method: "initial_grant" | "deny" | "subscription" | "credits";
  reason: string;
  cost: number;
};

const defaultOptions: Required<Pick<AuthorizeInferenceOptions, 'reason'>> = {
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
    tags: Boolean(options.tags ?? false),
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

