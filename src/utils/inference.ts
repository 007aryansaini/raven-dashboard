import { getBackendBaseUrl } from "./constants";

export interface AuthorizeInferenceOptions {
  quantity?: number;
  settle?: boolean;
  contextHash?: string;
  reason?: string;
  tags?: boolean;
  mode?: string;
}

export type AuthorizeInferenceResponse = {
  allowed: boolean;
  method: "initial_grant" | "deny" | "subscription" | "credits";
  reason: string;
  cost: number;
};

export type RecordInferenceResponse = {
  success: boolean;
  allowed: boolean;
  method: "initial_grant" | "deny" | "subscription" | "credits";
  reason: string;
  cost: number;
};

export async function authorizeInference(
  account: string | null | undefined,
  options: AuthorizeInferenceOptions = {}
): Promise<AuthorizeInferenceResponse> {
  if (!account) {
    throw new Error("Wallet not connected");
  }

  const payload: any = {
    user: account,
    quantity: options.quantity ?? 1,
  };

  if (options.mode) {
    payload.mode = options.mode;
  }

  if (options.reason) {
    payload.reason = options.reason;
  }

  if (options.tags !== undefined) {
    payload.tags = Boolean(options.tags);
  }

  if (options.contextHash) {
    payload.contextHash = options.contextHash;
  }

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
  return data;
}

export async function recordInference(
  account: string | null | undefined,
  options: AuthorizeInferenceOptions = {}
): Promise<RecordInferenceResponse> {
  if (!account) {
    throw new Error("Wallet not connected");
  }

  const payload: any = {
    user: account,
    quantity: options.quantity ?? 1,
  };

  if (options.mode) {
    payload.mode = options.mode;
  }

  if (options.reason) {
    payload.reason = options.reason;
  }

  if (options.tags !== undefined) {
    payload.tags = Boolean(options.tags);
  }

  if (options.contextHash) {
    payload.contextHash = options.contextHash;
  }

  const response = await fetch(`${getBackendBaseUrl()}inference/record`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      `Inference record failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data;
}

