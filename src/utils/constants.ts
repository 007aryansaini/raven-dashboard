
export const CHAIN_ID_TO_CONTRACT_ADDRESSES = {
11155111: {
        mUSDC: "0x69c11e54051401b254fFE969e2709447817DD547",
        contractAddress: "0x7E07BFe48A8248C8efAeA2b5669804Af24d56ada"
    }
}

export const BACKEND_URL = "https://agent-asva-temp.vercel.app/"
const LOCAL_REFERRAL_HOST = "http://localhost:5173"

export const getBackendBaseUrl = () =>
  import.meta.env.DEV ? "/backend/" : BACKEND_URL

export const getReferralBaseUrl = () => {
  const baseHost =
    import.meta.env.DEV && typeof window !== "undefined"
      ? window.location.origin
      : import.meta.env.DEV
        ? LOCAL_REFERRAL_HOST
        : BACKEND_URL

  return `${baseHost.replace(/\/+$/, "")}/referral/`
}
export const SCORE_API_BASE = "/score-api/" // Use proxy in both dev and production
export const SCORE_API_KEY = "422D5EE31621A6F3DD95E8D926EE3"
export const CHAT_API_BASE = "/chat-api/" // Use proxy in both dev and production
export const POLYMARKET_API_BASE = "/polymarket-api" // Use proxy in both dev and production