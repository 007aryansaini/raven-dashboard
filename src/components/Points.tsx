
import { Share2, Copy, X, CheckCircle2, UserPlus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useAccount } from "wagmi"
import { getBackendBaseUrl } from "../utils/constants"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from '../firebase'
import { toast } from 'react-toastify'
import { useUserMetrics } from "../contexts/UserMetricsContext"
import { createPortal } from "react-dom"
import { verifyTwitterPost } from "../utils/twitterVerification"

const Points = () => {
  const [xp, setXp] = useState<number | null>(null)
  const [isXpLoading, setIsXpLoading] = useState(false)
  const [xpError, setXpError] = useState<string | null>(null)
  const { address, isConnected } = useAccount()
  const { refreshMetrics } = useUserMetrics()
  const [twitterUser, setTwitterUser] = useState<User | null>(null)
  const [referralCode, setReferralCode] = useState<string>("")
  const [isReferralCodeLoading, setIsReferralCodeLoading] = useState(false)
  const [referralCodeError, setReferralCodeError] = useState<string | null>(null)
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle")
  const [questResponse, setQuestResponse] = useState<{
    address: string
    reason: string
    parameter: number
    credits: number
    totalCalculatedCredits: number
  } | null>(null)
  const [isQuestLoading, setIsQuestLoading] = useState(false)
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false)
  const [tweetUrl, setTweetUrl] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [hasShared, setHasShared] = useState(false)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [isReferralInputModalOpen, setIsReferralInputModalOpen] = useState(false)
  const [inputReferralCode, setInputReferralCode] = useState("")

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setTwitterUser(user)
      } else {
        setTwitterUser(null)
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!address || !isConnected) {
      setXp(null)
      setXpError(null)
      setIsXpLoading(false)
      return
    }

    const controller = new AbortController()

    const loadXp = async () => {
      setIsXpLoading(true)
      setXpError(null)

      try {
        const response = await fetch(`${getBackendBaseUrl()}users/${address}/xp`, {
          signal: controller.signal
        })

        if (!response.ok) {
          throw new Error(`Failed to load XP: ${response.status}`)
        }

        const data = await response.json()
        const xpValue = Number(
          data?.xp ??
            data?.points ??
            data?.xpPoints ??
            data?.xpTotal ??
            data?.xp_total ??
            0
        )

        setXp(Number.isFinite(xpValue) ? xpValue : 0)
      } catch (error: unknown) {
        if (controller.signal.aborted) return
        console.error("Error fetching XP:", error)
        setXp(0)
        setXpError("Unable to load XP")
      } finally {
        if (!controller.signal.aborted) {
          setIsXpLoading(false)
        }
      }
    }

    loadXp()

    return () => {
      controller.abort()
    }
  }, [address, isConnected])

  // Fetch referral code from API
  useEffect(() => {
    if (!address || !isConnected) {
      setReferralCode("")
      setReferralCodeError(null)
      setIsReferralCodeLoading(false)
      return
    }

    const controller = new AbortController()

    const fetchReferralCode = async () => {
      setIsReferralCodeLoading(true)
      setReferralCodeError(null)

      try {
        const response = await fetch(`${getBackendBaseUrl()}referral/code`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address: address,
          }),
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch referral code: ${response.status}`)
        }

        const data = await response.json()
        const code = data?.code || ""
        
        if (code) {
          setReferralCode(code)
        } else {
          throw new Error("No referral code in response")
        }
      } catch (error: unknown) {
        if (controller.signal.aborted) return
        console.error("Error fetching referral code:", error)
        setReferralCode("")
        setReferralCodeError("Unable to load referral code")
      } finally {
        if (!controller.signal.aborted) {
          setIsReferralCodeLoading(false)
        }
      }
    }

    fetchReferralCode()

    return () => {
      controller.abort()
    }
  }, [address, isConnected])



  const referralUrl = useMemo(() => {
    if (!referralCode) {
      return isReferralCodeLoading ? "Loading referral link…" : "Unable to load referral link"
    }
    
    // Build referral link with ?rc=<code> format
    const baseUrl = typeof window !== "undefined" 
      ? window.location.origin 
      : ""
    return `${baseUrl}/?rc=${referralCode}`
  }, [referralCode, isReferralCodeLoading])


  const handleCopyReferralLink = async () => {
    if (!referralCode || typeof navigator === "undefined") return

    try {
      await navigator.clipboard.writeText(referralUrl)
      setCopyStatus("copied")
      setTimeout(() => setCopyStatus("idle"), 2200)
    } catch (error) {
      console.error("Failed to copy referral link", error)
      setCopyStatus("error")
      setTimeout(() => setCopyStatus("idle"), 2200)
    }
  }

  const handleShareOnTwitter = () => {
    if (!referralUrl || referralUrl.includes("Loading") || referralUrl.includes("Unable")) {
      return
    }

    // Create Twitter share URL with pre-filled text and URL
    const tweetText = `Check out Raven - AI-powered market predictions! Join me using my referral link: ${referralUrl}`
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`
    
    // Open Twitter in a new window
    window.open(twitterShareUrl, '_blank', 'width=550,height=420')
  }

  const handleSocialQuest = async (reason: string) => {
    if (!address || !isConnected) {
      toast.warning('Please connect your wallet to complete quests', {
        style: { fontSize: '12px' }
      })
      return
    }

    setIsQuestLoading(true)
    setQuestResponse(null)

    try {
      const response = await fetch(`${getBackendBaseUrl()}credits/calculate-and-store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: address,
          reason: reason,
          parameter: 3
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to calculate credits: ${response.status}`)
      }

      const data = await response.json()
      console.log("Quest API Response:", data)
      setQuestResponse(data)
      
      toast.success(`Quest completed! You earned ${data.credits} credits.`, {
        style: { fontSize: '12px' },
        autoClose: 3000,
      })

      // Refresh metrics to show updated credits and XP
      await refreshMetrics()
      
      // Refresh XP to show updated values
      if (address && isConnected) {
        const xpResponse = await fetch(`${getBackendBaseUrl()}users/${address}/xp`)
        if (xpResponse.ok) {
          const xpData = await xpResponse.json()
          const xpValue = Number(
            xpData?.xp ??
              xpData?.points ??
              xpData?.xpPoints ??
              xpData?.xpTotal ??
              xpData?.xp_total ??
              0
          )
          setXp(Number.isFinite(xpValue) ? xpValue : 0)
        }
      }
    } catch (error: unknown) {
      console.error("Error calculating credits:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to complete quest"
      toast.error(`Quest failed: ${errorMessage}`, {
        style: { fontSize: '12px' }
      })
    } finally {
      setIsQuestLoading(false)
    }
  }

  // Share about Raven on Twitter
  const handleShareAboutRaven = () => {
    const shareText = `🚀 Check out Raven - AI-powered market predictions and insights! 

✨ Get accurate predictions for crypto and prediction markets
🤖 Powered by advanced AI technology
📊 Real-time market analysis

Join the future of trading predictions! 🎯`
    
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
    window.open(twitterShareUrl, '_blank', 'width=550,height=420')
    setHasShared(true)
  }

  // Handle referral code input
  const handleSubmitReferralCode = () => {
    if (!inputReferralCode.trim()) {
      toast.error('Please enter a referral code', {
        style: { fontSize: '12px' }
      })
      return
    }

    // Print referral code to console
    console.log('Referral code entered:', inputReferralCode.trim())
    
    // Show success message
    toast.success('Referral code submitted! Check console for details.', {
      style: { fontSize: '12px' },
      autoClose: 3000,
    })

    // Close modal and reset
    setIsReferralInputModalOpen(false)
    setInputReferralCode("")
  }

  // Extract tweet ID from Twitter URL
  const extractTweetId = (url: string): string | null => {
    try {
      // Handle various Twitter URL formats:
      // https://twitter.com/username/status/1234567890
      // https://x.com/username/status/1234567890
      // https://twitter.com/i/web/status/1234567890
      // Support usernames with numbers and underscores
      
      // Pattern 1: Standard tweet URL - capture username and tweet ID
      const standardPattern = /(?:twitter\.com|x\.com)\/[^\/]+\/status\/(\d+)/
      const standardMatch = url.match(standardPattern)
      if (standardMatch && standardMatch[1]) {
        return standardMatch[1]
      }
      
      // Pattern 2: Web status URL
      const webPattern = /(?:twitter\.com|x\.com)\/i\/web\/status\/(\d+)/
      const webMatch = url.match(webPattern)
      if (webMatch && webMatch[1]) {
        return webMatch[1]
      }
      
      return null
    } catch (error) {
      console.error("Error extracting tweet ID:", error)
      return null
    }
  }

  // Verify Twitter post
  const handleVerifyPost = async () => {
    // Clear previous errors
    setVerificationError(null)

    if (!tweetUrl.trim()) {
      const errorMsg = 'Please enter a valid Twitter post URL'
      setVerificationError(errorMsg)
      toast.error(errorMsg, {
        style: { fontSize: '12px' }
      })
      return
    }

    if (!address || !isConnected) {
      const errorMsg = 'Please connect your wallet to verify your post'
      setVerificationError(errorMsg)
      toast.warning(errorMsg, {
        style: { fontSize: '12px' }
      })
      return
    }

    const tweetId = extractTweetId(tweetUrl)
    if (!tweetId) {
      const errorMsg = 'Invalid Twitter URL format. Please enter a valid tweet URL (e.g., https://x.com/username/status/123456)'
      setVerificationError(errorMsg)
      toast.error(errorMsg, {
        style: { fontSize: '12px' }
      })
      return
    }

    setIsVerifying(true)
    setVerificationError(null)

    try {
      // Get Twitter user info from Firebase auth
      const userAny = twitterUser as any
      const twitterUsername = userAny.reloadUserInfo?.providerUserInfo?.[0]?.screenName || 
                              twitterUser?.providerData.find(p => p.providerId === 'twitter.com')?.displayName ||
                              twitterUser?.displayName ||
                              null

      console.log('Verifying tweet:', { tweetId, tweetUrl, address, twitterUsername })

      // DEVELOPMENT MODE: Check if we should use mock verification
      const USE_MOCK_VERIFICATION = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_VERIFICATION === 'true'
      
      let data: any = null

      if (USE_MOCK_VERIFICATION) {
        // Mock verification for development/testing
        console.log('Using mock verification (development mode)')
        await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API delay
        
        // In mock mode, we'll accept any valid tweet URL
        data = {
          verified: true,
          postExists: true,
          message: 'Mock verification successful (development mode)'
        }
      } else {
        // Use frontend Twitter API verification
        console.log('Using frontend Twitter API verification')
        
        // Optional: Get Twitter Bearer Token from environment variable if available
        // If not provided, will use public oEmbed API
        const twitterBearerToken = import.meta.env.VITE_TWITTER_BEARER_TOKEN || undefined
        
        // Verify tweet using frontend Twitter APIs
        const verificationResult = await verifyTwitterPost(
          tweetUrl,
          tweetId,
          ['raven', 'rave'], // Expected keywords to search for
          twitterBearerToken
        )
        
        console.log('Twitter verification result:', verificationResult)
        
        data = verificationResult
      }
      
      console.log('Verification response data:', data)
      
      if (data.verified && data.postExists) {
        // Post verified successfully
        setVerificationError(null)
        toast.success('Post verified successfully! 🎉', {
          style: { fontSize: '12px' },
          autoClose: 3000,
        })

        // Close modal and reset
        setIsVerifyModalOpen(false)
        setTweetUrl("")
        setHasShared(false)
        setVerificationError(null)

        // Complete the quest and award credits
        await handleSocialQuest('social_quest')
      } else {
        // Post not found or doesn't match
        const errorMsg = data.message || 'Could not verify your post. Please make sure you posted the tweet with Raven content and try again.'
        setVerificationError(errorMsg)
        toast.error(errorMsg, {
          style: { fontSize: '12px' },
          autoClose: 4000,
        })
      }
    } catch (error: unknown) {
      console.error("Error verifying tweet:", error)
      let errorMessage = "Failed to verify post"
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Network error: Could not connect to server. Please check your internet connection and try again.'
      } else if (error instanceof Error) {
        errorMessage = error.message || "Failed to verify post"
      }
      
      setVerificationError(errorMessage)
      toast.error(`Verification failed: ${errorMessage}`, {
        style: { fontSize: '12px' },
        autoClose: 5000,
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const xpDisplayValue = xp !== null ? xp.toLocaleString("en-US") : "00"
  const xpDisplayText = isXpLoading ? "Loading..." : `${xpDisplayValue} XP`

  // Show content only when both wallet is connected and Twitter is logged in
  const isAuthorized = isConnected && twitterUser && address

  if (!isAuthorized) {
    return (
      <div className="relative flex min-h-full flex-col items-center justify-center gap-6 overflow-hidden px-4 py-10 text-white sm:px-6 lg:px-10"  
           style={{
             background: `
               radial-gradient(circle at center, rgba(69, 255, 174, 0.1) 0%, rgba(0, 0, 0, 0.8) 70%, rgba(0, 0, 0, 1) 100%),
               linear-gradient(90deg, rgba(69, 255, 174, 0.05) 1px, transparent 1px),
               linear-gradient(rgba(69, 255, 174, 0.05) 1px, transparent 1px)
             `,
             backgroundSize: '100% 100%, 60px 60px, 60px 60px',
             backgroundColor: '#000000'
           }}>
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="font-urbanist text-2xl sm:text-3xl font-medium leading-tight tracking-[0%] text-[#FFFFFF]">
            Connect to View Points
          </div>
          <div className="font-urbanist text-sm sm:text-base font-medium leading-normal tracking-[0%] text-[#D1D1D1]">
            Please connect your wallet and login with Twitter to view your points and rewards.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-full flex-col items-center gap-8 overflow-hidden px-4 py-10 text-white sm:px-6 lg:px-10"  
         style={{
           background: `
             radial-gradient(circle at center, rgba(69, 255, 174, 0.1) 0%, rgba(0, 0, 0, 0.8) 70%, rgba(0, 0, 0, 1) 100%),
             linear-gradient(90deg, rgba(69, 255, 174, 0.05) 1px, transparent 1px),
             linear-gradient(rgba(69, 255, 174, 0.05) 1px, transparent 1px)
           `,
           backgroundSize: '100% 100%, 60px 60px, 60px 60px',
           backgroundColor: '#000000'
         }}>
     

     <div className="flex h-full w-full max-w-6xl flex-col items-center justify-start gap-6">
               
               <div className="flex w-full flex-col items-center gap-6">
                      
                       <div className="flex w-full flex-col items-center justify-center gap-2 rounded-3xl bg-[#141414] px-6 py-8 text-center sm:px-10 sm:py-10">
                             <div className="font-urbanist text-2xl font-medium leading-tight tracking-[0%] text-[#FFFFFF] sm:text-3xl">Earn Points, Unlock Rewards</div> 
                             <div className="font-urbanist text-sm font-medium leading-normal tracking-[0%] text-[#D1D1D1]">Finish quick quests and stack points to claim rewards.</div>
                       </div>

                       {/* Cards Container */}
                       <div className="flex w-full flex-col gap-4 md:flex-row">
                         {/* Achievement Card */}
                         <div className="flex w-full flex-col gap-3 rounded-3xl bg-[#1A1A1A] p-4">
                          <div className="flex flex-col items-center justify-center min-h-[100px]">
                              <div className="font-urbanist text-2xl md:text-4xl lg:text-5xl font-bold leading-none tracking-[0%] text-[#45FFAE] text-center">{xpDisplayText}</div>
                              {xpError && (
                                <div className="text-center text-xs font-urbanist text-[#FF7D7D] mt-2">{xpError}</div>
                              )}
                          </div>
                         </div>

                         {/* Invite Friends Card */}
                         <div className="flex w-full flex-col gap-3 rounded-3xl bg-[#1A1A1A] p-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div className="font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">Invite your friends</div>
                              <div className="font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">
                                {referralCode ? referralCode : isReferralCodeLoading ? "Loading..." : "—"}
                              </div>
                            </div>
                           <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                             <div className="flex flex-1 items-center rounded-xl bg-[#2A2A2A] px-3 py-2">
                               <span className="font-urbanist text-xs font-medium leading-none tracking-[0%] text-[#D1D1D1] truncate">
                                 {referralUrl}
                               </span>
                             </div>
                             <button
                               onClick={handleCopyReferralLink}
                               disabled={!referralCode || isReferralCodeLoading}
                               className="rounded-xl bg-[#2A2A2A] p-2 transition-colors hover:bg-[#3A3A3A] disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                               <Copy className="h-4 w-4 text-white" />
                             </button>
                           </div>
                           <div className="text-xs font-urbanist">
                             {copyStatus === "copied" && (
                               <span className="text-[#45FFAE] cursor-pointer">Link copied!</span>
                             )}
                             {copyStatus === "error" && (
                               <span className="text-[#FF7D7D]">Copy failed</span>
                             )}
                             {referralCodeError && (
                               <span className="text-[#FF7D7D]">{referralCodeError}</span>
                             )}
                             {isReferralCodeLoading && !referralCodeError && (
                               <span className="text-[#808080]">Loading referral code...</span>
                             )}
                           </div>
                           <button 
                             onClick={handleShareOnTwitter}
                             disabled={!referralCode || isReferralCodeLoading || !referralUrl || referralUrl.includes("Loading") || referralUrl.includes("Unable")}
                             className="flex w-fit flex-row items-center gap-2 rounded-xl bg-[#2A2A2A] px-3 py-2 transition-colors hover:bg-[#3A3A3A] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                             <span className="font-urbanist text-xs font-medium leading-none tracking-[0%] text-[#FFFFFF]">Share on</span>
                             <X className="h-4 w-4 text-white" />
                           </button>
                         </div>
                       </div>

                       {/* Enter Referral Code Card */}
                       <div className="flex w-full flex-col gap-3 rounded-3xl bg-[#1A1A1A] p-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-1 flex-col gap-2">
                              <div className="font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">
                                Enter Referral Code
                              </div>
                              <div className="font-urbanist text-xs font-medium leading-normal tracking-[0%] text-[#D1D1D1]">
                                Were you referred by someone? Enter their referral code here.
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => setIsReferralInputModalOpen(true)}
                            className="flex w-fit flex-row items-center gap-2 rounded-xl bg-[#45FFAE] px-3 py-2 transition-colors hover:bg-[#35EF9E] text-black"
                          >
                            <span className="font-urbanist text-xs font-medium leading-none tracking-[0%]">
                              Enter Referral Code
                            </span>
                            <UserPlus className="h-4 w-4" />
                          </button>
                       </div>

                       {/* Share About Raven Quest Card */}
                       <div className="flex w-full flex-col gap-3 rounded-3xl bg-[#1A1A1A] p-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-1 flex-col gap-2">
                              <div className="font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">
                                Share about Raven on Twitter
                              </div>
                              <div className="font-urbanist text-xs font-medium leading-normal tracking-[0%] text-[#D1D1D1]">
                                Spread the word about Raven and earn rewards!
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <button
                              onClick={handleShareAboutRaven}
                              className="flex w-fit flex-row items-center gap-2 rounded-xl bg-[#2A2A2A] px-3 py-2 transition-colors hover:bg-[#3A3A3A] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <span className="font-urbanist text-xs font-medium leading-none tracking-[0%] text-[#FFFFFF]">
                                {hasShared ? "Shared!" : "Share on Twitter"}
                              </span>
                              <X className="h-4 w-4 text-white" />
                            </button>

                            {hasShared && (
                              <button
                                onClick={() => setIsVerifyModalOpen(true)}
                                disabled={isVerifying}
                                className="flex w-fit flex-row items-center gap-2 rounded-xl bg-[#45FFAE] px-3 py-2 transition-colors hover:bg-[#35EF9E] disabled:opacity-50 disabled:cursor-not-allowed text-black"
                              >
                                <span className="font-urbanist text-xs font-medium leading-none tracking-[0%]">
                                  {isVerifying ? "Verifying..." : "Verify Post"}
                                </span>
                                {!isVerifying && <CheckCircle2 className="h-4 w-4" />}
                              </button>
                            )}
                          </div>
                       </div>

    

                       
                       



               </div>
     </div>

     {/* Verification Modal */}
     <VerifyModal
       isOpen={isVerifyModalOpen}
       onClose={() => {
         setIsVerifyModalOpen(false)
         setTweetUrl("")
         setVerificationError(null)
       }}
       tweetUrl={tweetUrl}
       setTweetUrl={setTweetUrl}
       onVerify={handleVerifyPost}
       isVerifying={isVerifying}
       error={verificationError}
     />

     {/* Referral Input Modal */}
     <ReferralInputModal
       isOpen={isReferralInputModalOpen}
       onClose={() => {
         setIsReferralInputModalOpen(false)
         setInputReferralCode("")
       }}
       referralCode={inputReferralCode}
       setReferralCode={setInputReferralCode}
       onSubmit={handleSubmitReferralCode}
     />

    </div>
  )
}

// Verification Modal Component
interface VerifyModalProps {
  isOpen: boolean
  onClose: () => void
  tweetUrl: string
  setTweetUrl: (url: string) => void
  onVerify: () => void
  isVerifying: boolean
  error: string | null
}

const VerifyModal = ({ isOpen, onClose, tweetUrl, setTweetUrl, onVerify, isVerifying, error }: VerifyModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div 
        className="relative w-full max-w-md rounded-3xl bg-[#1A1A1A] p-6 sm:p-8 border border-[#2A2A2A] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-2 transition-colors hover:bg-[#2A2A2A]"
          disabled={isVerifying}
        >
          <X className="h-5 w-5 text-[#D1D1D1]" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <h2 className="font-urbanist text-2xl font-medium leading-tight tracking-[0%] text-[#FFFFFF] mb-2">
            Verify Your Post
          </h2>
          <p className="font-urbanist text-sm font-medium leading-normal tracking-[0%] text-[#D1D1D1]">
            Enter the URL of your Twitter post to verify you shared about Raven.
          </p>
        </div>

        {/* Input Field */}
        <div className="mb-6">
          <label className="block font-urbanist text-xs font-medium leading-none tracking-[0%] text-[#FFFFFF] mb-2">
            Twitter Post URL
          </label>
          <input
            type="text"
            value={tweetUrl}
            onChange={(e) => setTweetUrl(e.target.value)}
            placeholder="https://twitter.com/username/status/..."
            disabled={isVerifying}
            className="w-full rounded-xl bg-[#2A2A2A] px-4 py-3 font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF] placeholder:text-[#808080] border border-transparent focus:border-[#45FFAE] focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="mt-2 font-urbanist text-xs font-medium leading-normal tracking-[0%] text-[#808080]">
            Copy the URL from your Twitter post and paste it here.
          </p>
          {error && (
            <div className="mt-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
              <p className="font-urbanist text-xs font-medium leading-normal tracking-[0%] text-[#FF7D7D]">
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            disabled={isVerifying}
            className="flex items-center justify-center rounded-xl bg-[#2A2A2A] px-4 py-3 font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF] transition-colors hover:bg-[#3A3A3A] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onVerify}
            disabled={isVerifying || !tweetUrl.trim()}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#45FFAE] px-4 py-3 font-urbanist text-sm font-medium leading-none tracking-[0%] text-black transition-colors hover:bg-[#35EF9E] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Verify</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )

  if (typeof window === 'undefined') {
    return null
  }

  return createPortal(modalContent, document.body)
}

// Referral Input Modal Component
interface ReferralInputModalProps {
  isOpen: boolean
  onClose: () => void
  referralCode: string
  setReferralCode: (code: string) => void
  onSubmit: () => void
}

const ReferralInputModal = ({ isOpen, onClose, referralCode, setReferralCode, onSubmit }: ReferralInputModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div 
        className="relative w-full max-w-md rounded-3xl bg-[#1A1A1A] p-6 sm:p-8 border border-[#2A2A2A] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-2 transition-colors hover:bg-[#2A2A2A]"
        >
          <X className="h-5 w-5 text-[#D1D1D1]" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <h2 className="font-urbanist text-2xl font-medium leading-tight tracking-[0%] text-[#FFFFFF] mb-2">
            Enter Referral Code
          </h2>
          <p className="font-urbanist text-sm font-medium leading-normal tracking-[0%] text-[#D1D1D1]">
            Enter the referral code of the person who referred you to Raven.
          </p>
        </div>

        {/* Input Field */}
        <div className="mb-6">
          <label className="block font-urbanist text-xs font-medium leading-none tracking-[0%] text-[#FFFFFF] mb-2">
            Referral Code
          </label>
          <input
            type="text"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            placeholder="Enter referral code here..."
            className="w-full rounded-xl bg-[#2A2A2A] px-4 py-3 font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF] placeholder:text-[#808080] border border-transparent focus:border-[#45FFAE] focus:outline-none transition-colors"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSubmit()
              }
            }}
            autoFocus
          />
          <p className="mt-2 font-urbanist text-xs font-medium leading-normal tracking-[0%] text-[#808080]">
            Get the referral code from the person who invited you.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-xl bg-[#2A2A2A] px-4 py-3 font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF] transition-colors hover:bg-[#3A3A3A]"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!referralCode.trim()}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#45FFAE] px-4 py-3 font-urbanist text-sm font-medium leading-none tracking-[0%] text-black transition-colors hover:bg-[#35EF9E] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Submit</span>
          </button>
        </div>
      </div>
    </div>
  )

  if (typeof window === 'undefined') {
    return null
  }

  return createPortal(modalContent, document.body)
}

export default Points
