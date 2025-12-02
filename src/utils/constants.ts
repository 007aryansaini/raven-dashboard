
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
export const SCORE_API_HOST = "http://provider.h100.hou.sfc.akash.pub:32758/"
export const SCORE_API_BASE = import.meta.env.DEV
  ? "/score-api/"
  : SCORE_API_HOST
export const SCORE_API_KEY = "422D5EE31621A6F3DD95E8D926EE3"
const CHAT_API_HOST = "http://o16tosrfsp85j9oad14dek442s.ingress.h100.hou.sfc.akash.pub/"
export const CHAT_API_BASE = import.meta.env.DEV
  ? "/chat-api/"
  : CHAT_API_HOST