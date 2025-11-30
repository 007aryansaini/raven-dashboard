
import { Share2, Copy, X, Twitter, Check } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useAccount } from "wagmi"
import { getBackendBaseUrl } from "../utils/constants"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from '../firebase'
import { toast } from 'react-toastify'
import { useUserMetrics } from "../contexts/UserMetricsContext"

const Points = () => {
  const [activeTab, setActiveTab] = useState("Quests")
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
  const [questError, setQuestError] = useState<string | null>(null)

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
      } catch (error: any) {
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
      } catch (error: any) {
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

  // Auto-fetch social quest API response when wallet is connected and user is logged in
  useEffect(() => {
    if (address && isConnected && twitterUser && !questResponse && !isQuestLoading) {
      // Auto-fetch with default parameter 3 (social_quest)
      handleSocialQuest('social_quest', 3)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, isConnected, twitterUser])

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

  const handleSocialQuest = async (reason: string, parameter: number) => {
    if (!address || !isConnected) {
      toast.warning('Please connect your wallet to complete quests', {
        style: { fontSize: '12px' }
      })
      return
    }

    setIsQuestLoading(true)
    setQuestError(null)
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
          parameter: parameter
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
    } catch (error: any) {
      console.error("Error calculating credits:", error)
      setQuestError(error.message || "Failed to complete quest")
      toast.error(`Quest failed: ${error.message}`, {
        style: { fontSize: '12px' }
      })
    } finally {
      setIsQuestLoading(false)
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
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-1 flex-row items-center gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2A2A2A]">
                                <div className="h-8 w-8 rounded-full bg-[#3A3A3A]"></div>
                              </div>
                              <div className="flex flex-1 flex-col gap-2">
                                <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#FFFFFF]">Title here</div>
                                <div className="flex flex-row items-center gap-2">
                                  <div className="flex items-center gap-1 rounded-full bg-[#45FFAE] px-2 py-1 text-black">
                                    <div className="h-2 w-2 rounded-full bg-white"></div>
                                    <span className="font-urbanist text-xs font-medium leading-none tracking-[0%]">Level-0</span>
                                  </div>
                                </div>
                                <div className="h-1 w-full rounded-full bg-[#2A2A2A]">
                                  <div className="h-full w-0 rounded-full bg-[#45FFAE]"></div>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <div className="font-urbanist text-2xl font-bold leading-none tracking-[0%] text-[#45FFAE]">{xpDisplayText}</div>
                              {xpError && (
                                <div className="text-right text-xs font-urbanist text-[#FF7D7D]">{xpError}</div>
                              )}
                            </div>
                          </div>
                           <button className="flex w-fit flex-row items-center gap-2 rounded-xl bg-[#2A2A2A] px-3 py-2 transition-colors hover:bg-[#3A3A3A]">
                             <span className="font-urbanist text-xs font-medium leading-none tracking-[0%] text-[#FFFFFF]">Share it to your achievement</span>
                             <Share2 className="h-4 w-4 text-white" />
                           </button>
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

                       {/* Tabs Navigation */}
                       <div className="mt-4 flex w-full flex-wrap gap-6">
                         <button 
                           className={`font-urbanist cursor-pointer font-medium text-sm leading-none tracking-[0%] pb-2 border-b-2 transition-colors ${
                             activeTab === "Quests" 
                               ? "text-[#45FFAE] border-[#45FFAE]" 
                               : "text-[#808080] border-transparent hover:text-[#D1D1D1]"
                           }`}
                           onClick={() => setActiveTab("Quests")}
                         >
                           Quests
                         </button>
                         <button 
                           className={`font-urbanist font-medium cursor-pointer text-sm leading-none tracking-[0%] pb-2 border-b-2 transition-colors ${
                             activeTab === "Points history" 
                               ? "text-[#45FFAE] border-[#45FFAE]" 
                               : "text-[#808080] border-transparent hover:text-[#D1D1D1]"
                           }`}
                           onClick={() => setActiveTab("Points history")}
                         >
                           Points history
                         </button>
                         <button 
                           className={`font-urbanist font-medium text-sm cursor-pointer leading-none tracking-[0%] pb-2 border-b-2 transition-colors ${
                             activeTab === "Leaderboard" 
                               ? "text-[#45FFAE] border-[#45FFAE]" 
                               : "text-[#808080] border-transparent hover:text-[#D1D1D1]"
                           }`}
                           onClick={() => setActiveTab("Leaderboard")}
                         >
                           Leaderboard
                         </button>
                       </div>

                       {/* Tab Content */}
                       {activeTab === "Quests" && (
                        <div className="mt-2 flex w-full min-h-0 flex-1 flex-col gap-6">
                           {/* Social Quests Section */}
                           <div className="flex flex-col gap-4">
                             <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                               <h3 className="font-urbanist text-lg font-medium leading-none tracking-[0%] text-[#FFFFFF]">Social Quests</h3>
                               <span className="font-urbanist text-xs font-medium leading-none tracking-[0%] text-[#808080]">Refreshes daily 00:00 UTC</span>
                             </div>

                             {/* Trigger Button */}
                             {!questResponse && !isQuestLoading && (
                               <button
                                 onClick={() => handleSocialQuest('social_quest', 3)}
                                 disabled={!address || !isConnected || isQuestLoading}
                                 className={`w-full sm:w-auto px-6 py-3 rounded-lg font-urbanist text-sm font-medium transition-colors ${
                                   !address || !isConnected || isQuestLoading
                                     ? 'bg-[#2A2A2A] text-[#808080] cursor-not-allowed'
                                     : 'bg-[#45FFAE] text-[#000000] hover:bg-[#3FE89E] cursor-pointer'
                                 }`}
                               >
                                 Fetch API Response
                               </button>
                             )}

                             {/* Loading State */}
                             {isQuestLoading && (
                               <div className="text-center font-urbanist text-sm text-[#808080] py-4">Processing quest...</div>
                             )}

                             {/* Error State */}
                             {questError && (
                               <div className="rounded-2xl bg-[#1A1A1A] border border-red-500/30 p-4">
                                 <div className="text-center font-urbanist text-sm text-[#FF7D7D]">{questError}</div>
                               </div>
                             )}

                             {/* API Response Display */}
                             {questResponse && (
                               <div className="w-full rounded-2xl bg-[#1A1A1A] border border-[#45FFAE]/30 p-6">
                                 <div className="flex flex-col gap-8 font-urbanist">
                                   <div className="flex flex-col gap-2">
                                     <span className="text-sm font-medium text-[#808080]">parameter:</span>
                                     <span className="text-lg font-semibold text-[#FFFFFF]">{questResponse.parameter}</span>
                                   </div>
                                   
                                   <div className="flex flex-col gap-2">
                                     <span className="text-sm font-medium text-[#808080]">credits:</span>
                                     <span className="text-lg font-semibold text-[#45FFAE]">{questResponse.credits}</span>
                                   </div>
                                   
                                   <div className="flex flex-col gap-2">
                                     <span className="text-sm font-medium text-[#808080]">total Calculated Credits:</span>
                                     <span className="text-lg font-semibold text-[#45FFAE]">{questResponse.totalCalculatedCredits}</span>
                                   </div>
                                   
                                   <div className="flex flex-col gap-2">
                                     <span className="text-sm font-medium text-[#808080]">address:</span>
                                     <span className="text-base font-mono text-[#FFFFFF] break-all">{questResponse.address}</span>
                                   </div>
                                 </div>
                               </div>
                             )}
                           </div>

                           {/* Product Quests Section */}
                           <div className="flex flex-col gap-4">
                             <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                               <h3 className="font-urbanist text-lg font-medium leading-none tracking-[0%] text-[#FFFFFF]">Product Quests</h3>
                               <span className="font-urbanist text-xs font-medium leading-none tracking-[0%] text-[#808080]">Refreshes daily 00:00 UTC</span>
                             </div>
                             
                             {/* Product Quest Cards */}
                             <div className="flex max-h-60 flex-col gap-3 overflow-y-auto rounded-2xl bg-[#121212]/20 p-2">
                               {[1, 2, 3].map((index) => (
                                <div key={index} className="flex w-full flex-row items-center gap-3 rounded-2xl bg-[#1A1A1A] p-3">
                                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2A2A2A]">
                                    <Twitter className="h-5 w-5 text-[#808080]" />
                                   </div>
                                   <div className="flex-1">
                                    <div className="font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">Share on twitter</div>
                                    <div className="mt-1 font-urbanist text-xs font-medium leading-none tracking-[0%] text-[#808080]">Refreshes daily</div>
                                   </div>
                                  <div className="font-urbanist text-sm font-bold leading-none tracking-[0%] text-[#45FFAE]">+25 XP</div>
                                 </div>
                               ))}
                             </div>
                           </div>
                         </div>
                       )}

                       {activeTab === "Points history" && (
                        <div className="mt-2 flex w-full flex-1 flex-col gap-4">
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                              <h3 className="font-urbanist text-lg font-medium leading-none tracking-[0%] text-[#FFFFFF]">Points received</h3>
                              <p className="font-urbanist text-xs font-medium leading-none tracking-[0%] text-[#808080]">Points will be updated every 24 hours</p>
                             </div>
                             
                            <div className="flex flex-col gap-3 rounded-2xl bg-[#121212]/20 p-2">
                               {/* Points History Items */}
                               {[
                                { action: "Share on twitter", points: "+25 XP", status: "Received" },
                                { action: "Share on twitter", points: "+25 XP", status: "Received" },
                                { action: "Share on twitter", points: "+25 XP", status: "Received" }
                               ].map((item, index) => (
                                <div key={index} className="flex w-full flex-row items-center gap-4 rounded-2xl bg-[#1A1A1A] p-3">
                                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2A2A2A]">
                                    <Twitter className="h-5 w-5 text-[#808080]" />
                                   </div>
                                   <div className="flex-1">
                                    <div className="font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">{item.action}</div>
                                   </div>
                                  <div className="font-urbanist text-sm font-bold leading-none tracking-[0%] text-[#45FFAE]">{item.points}</div>
                                  <div className="flex flex-row items-center gap-1 rounded-full bg-[#45FFAE] px-3 py-1">
                                    <span className="font-urbanist text-xs font-medium leading-none tracking-[0%] text-black">{item.status}</span>
                                    <Check className="h-3 w-3 text-black" />
                                   </div>
                                 </div>
                               ))}
                             </div>
                           </div>
                         </div>
                       )}

                       {activeTab === "Leaderboard" && (
                        <div className="mt-2 flex w-full flex-1 flex-col gap-4">
                          <div className="flex flex-col gap-4">
                             {/* User's Current Standing */}
                             <div className="flex flex-row items-center justify-between rounded-2xl bg-[#1A1A1A] p-4">
                               <div className="font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">You</div>
                               <div className="font-urbanist text-sm font-bold leading-none tracking-[0%] text-[#45FFAE]">+995.565</div>
                             </div>
                             
                             {/* Leaderboard Table */}
                             <div className="flex flex-col gap-3 rounded-2xl bg-[#1A1A1A] p-4">
                               {/* Table Header */}
                               <div className="flex flex-row items-center gap-4 rounded-xl bg-[#121212]/40 p-3">
                                 <div className="w-16 font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#808080]">Rank</div>
                                 <div className="flex-1 font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#808080]">Wallet</div>
                                 <div className="font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#808080]">Points</div>
                               </div>
                               
                               {/* Leaderboard Entries */}
                               {[
                                 { rank: 1, wallet: "0xAlbC...789", points: "+995.565" },
                                 { rank: 2, wallet: "0xD3ef...456", points: "+987.654" },
                                 { rank: 3, wallet: "0x85oD...123", points: "+543.210" },
                                 { rank: 4, wallet: "0xC7eE...890", points: "+321.098" },
                                 { rank: 5, wallet: "0xF9bC...234", points: "+123.456" }
                               ].map((entry, index) => (
                                <div key={index} className="flex flex-row items-center gap-4 rounded-xl bg-[#121212]/20 p-3">
                                  <div className="w-16 font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">{entry.rank}</div>
                                  <div className="flex-1 font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">{entry.wallet}</div>
                                  <div className="font-urbanist text-sm font-bold leading-none tracking-[0%] text-[#45FFAE]">{entry.points}</div>
                                 </div>
                               ))}
                             </div>
                           </div>
                         </div>
                       )}

                       



               </div>
     </div>


    </div>
  )
}

export default Points
