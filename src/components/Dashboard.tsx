import { useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from '../firebase'
import { toast } from 'react-toastify'
import { getBackendBaseUrl } from "../utils/constants"
import { useUserMetrics } from "../contexts/UserMetricsContext"
import { createPortal } from "react-dom"
import { X, CheckCircle2 } from "lucide-react"

import SideBar from "./SideBar"
import NavBar from "./NavBar"
import Body from "./body"
import CryptoBody from "./CryptoBody"
import Points from "./Points"
import Home from "./Home"
import Benchmark from "./Benchmark"
import MathematicalAccuracy from "./MathematicalAccuracy"

const Dashboard = () => {
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { address, isConnected } = useAccount()
  const { refreshMetrics } = useUserMetrics()
  const [twitterUser, setTwitterUser] = useState<User | null>(null)
  const [isReferralInputModalOpen, setIsReferralInputModalOpen] = useState(false)
  const [inputReferralCode, setInputReferralCode] = useState("")
  const [isRedeemingReferralCode, setIsRedeemingReferralCode] = useState(false)
  const [hasAutoOpenedModal, setHasAutoOpenedModal] = useState(false)
  const [isCheckingInviteStatus, setIsCheckingInviteStatus] = useState(false)

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

  // Reset modal state when address changes (new wallet connection)
  useEffect(() => {
    if (address) {
      console.log('🔄 Wallet address changed, resetting modal state:', address)
      setHasAutoOpenedModal(false)
      setIsReferralInputModalOpen(false)
      setIsCheckingInviteStatus(false)
    }
  }, [address])

  // Check invite status and show modal only if referral code is in URL
  useEffect(() => {
    console.log('🔎 Effect triggered - pathname:', location.pathname, 'search:', location.search, 'twitterUser:', !!twitterUser, 'isConnected:', isConnected, 'address:', address, 'hasAutoOpenedModal:', hasAutoOpenedModal, 'isReferralInputModalOpen:', isReferralInputModalOpen, 'isCheckingInviteStatus:', isCheckingInviteStatus)
    
    // Only check on root route
    if (location.pathname !== '/') {
      console.log('⏭️ Not on root route, skipping')
      return
    }

    // Check for referral code in URL first - only proceed if rc exists
    const urlParams = new URLSearchParams(location.search)
    const rc = urlParams.get('rc')
    console.log('🔗 Referral code in URL:', rc)
    
    // If no referral code in URL, don't do anything
    if (!rc) {
      console.log('⏭️ No referral code in URL, skipping')
      return
    }

    // Only check when user is fully authenticated (Twitter login + wallet connected)
    if (!twitterUser) {
      console.log('⏳ Waiting for Twitter login...')
      return
    }
    
    if (!isConnected) {
      console.log('⏳ Waiting for wallet connection...')
      return
    }
    
    if (!address) {
      console.log('⏳ Waiting for wallet address...')
      return
    }

    console.log('✅ All conditions met - Twitter:', !!twitterUser, 'Wallet connected:', isConnected, 'Address:', address)

    // Skip if we've already checked and handled this referral code
    if (hasAutoOpenedModal) {
      console.log('⏭️ Modal already auto-opened, skipping')
      return
    }
    
    if (isReferralInputModalOpen) {
      console.log('⏭️ Modal already open, skipping')
      return
    }

    // Skip if already checking to avoid duplicate calls
    if (isCheckingInviteStatus) {
      console.log('⏭️ Already checking invite status, skipping')
      return
    }

    // Check invite status for this address
    const controller = new AbortController()
    const checkInviteStatus = async () => {
      try {
        setIsCheckingInviteStatus(true)
        const baseUrl = getBackendBaseUrl()
        const apiUrl = `${baseUrl}invite/status/${address}`
        console.log('🔍 Base URL:', baseUrl)
        console.log('🔍 Full API URL:', apiUrl)
        console.log('📤 Request details - Method: GET, Address:', address, 'Referral code:', rc)
        console.log('📤 Full request URL:', apiUrl)
        
        const resp = await fetch(apiUrl, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        console.log('📥 Response status:', resp.status, resp.statusText)
        
        if (!resp.ok) {
          const errorText = await resp.text()
          console.error('❌ API error response:', errorText)
          throw new Error(`Failed to check invite status: ${resp.status}`)
        }
        
        const data = await resp.json()
        console.log('📋 Invite status response data:', JSON.stringify(data, null, 2))
        const hasUsedInvite = Boolean(data?.hasUsedInvite)
        console.log('🔍 hasUsedInvite:', hasUsedInvite)

        // If user has already used an invite code, don't show the modal
        if (hasUsedInvite) {
          console.log('✅ User has already used an invite code, skipping modal')
          setHasAutoOpenedModal(true)
          setIsCheckingInviteStatus(false)
          return
        }

        // If user hasn't used an invite code, show the modal
        console.log('✅ User has not used invite code, opening modal with referral code from URL:', rc)
        // Small delay to ensure everything is initialized
        setTimeout(() => {
          console.log('🎯 Opening modal now')
          setIsReferralInputModalOpen(true)
          setHasAutoOpenedModal(true)
          setIsCheckingInviteStatus(false)
        }, 500)
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error('❌ Error checking invite status:', err)
          if (err instanceof Error) {
            console.error('❌ Error message:', err.message)
            console.error('❌ Error stack:', err.stack)
          }
          setIsCheckingInviteStatus(false)
        } else {
          console.log('🛑 Request was aborted')
        }
      }
    }

    console.log('🚀 Starting invite status check...')
    checkInviteStatus()

    return () => {
      console.log('🧹 Cleaning up - aborting controller')
      controller.abort()
    }
  }, [location.pathname, location.search, twitterUser, isConnected, address, hasAutoOpenedModal, isReferralInputModalOpen])

  // Check invite status when there's NO referral code in URL
  useEffect(() => {
    console.log('🔎 No-Referral-Code Effect triggered - pathname:', location.pathname, 'search:', location.search, 'twitterUser:', !!twitterUser, 'isConnected:', isConnected, 'address:', address, 'hasAutoOpenedModal:', hasAutoOpenedModal, 'isReferralInputModalOpen:', isReferralInputModalOpen, 'isCheckingInviteStatus:', isCheckingInviteStatus)
    
    // Only check on root route
    if (location.pathname !== '/') {
      console.log('⏭️ Not on root route, skipping')
      return
    }

    // Check for referral code in URL - if it exists, skip this flow
    const urlParams = new URLSearchParams(location.search)
    const rc = urlParams.get('rc')
    
    // If referral code exists in URL, skip this flow (handled by previous useEffect)
    if (rc) {
      console.log('⏭️ Referral code exists in URL, skipping no-referral-code flow')
      return
    }

    // Only check when user is fully authenticated (Twitter login + wallet connected)
    if (!twitterUser) {
      console.log('⏳ Waiting for Twitter login...')
      return
    }
    
    if (!isConnected) {
      console.log('⏳ Waiting for wallet connection...')
      return
    }
    
    if (!address) {
      console.log('⏳ Waiting for wallet address...')
      return
    }

    console.log('✅ All conditions met for no-referral-code flow - Twitter:', !!twitterUser, 'Wallet connected:', isConnected, 'Address:', address)

    // Skip if we've already checked and handled this
    if (hasAutoOpenedModal) {
      console.log('⏭️ Modal already auto-opened, skipping')
      return
    }
    
    if (isReferralInputModalOpen) {
      console.log('⏭️ Modal already open, skipping')
      return
    }

    // Skip if already checking to avoid duplicate calls
    if (isCheckingInviteStatus) {
      console.log('⏭️ Already checking invite status, skipping')
      return
    }

    // Check invite status for this address
    const controller = new AbortController()
    const checkInviteStatus = async () => {
      try {
        setIsCheckingInviteStatus(true)
        const baseUrl = getBackendBaseUrl()
        const apiUrl = `${baseUrl}invite/status/${address}`
        console.log('🔍 [No-Referral-Code] Base URL:', baseUrl)
        console.log('🔍 [No-Referral-Code] Full API URL:', apiUrl)
        console.log('📤 [No-Referral-Code] Request details - Method: GET, Address:', address)
        
        const resp = await fetch(apiUrl, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        console.log('📥 [No-Referral-Code] Response status:', resp.status, resp.statusText)
        
        if (!resp.ok) {
          const errorText = await resp.text()
          console.error('❌ [No-Referral-Code] API error response:', errorText)
          throw new Error(`Failed to check invite status: ${resp.status}`)
        }
        
        const data = await resp.json()
        console.log('📋 [No-Referral-Code] Invite status response data:', JSON.stringify(data, null, 2))
        const hasUsedInvite = Boolean(data?.hasUsedInvite)
        console.log('🔍 [No-Referral-Code] hasUsedInvite:', hasUsedInvite)

        // If user has already used an invite code, don't show the modal
        if (hasUsedInvite) {
          console.log('✅ [No-Referral-Code] User has already used an invite code, skipping modal')
          setHasAutoOpenedModal(true)
          setIsCheckingInviteStatus(false)
          return
        }

        // If user hasn't used an invite code, show the modal asking for invite code
        console.log('✅ [No-Referral-Code] User has not used invite code, opening modal to ask for invite code')
        // Small delay to ensure everything is initialized
        setTimeout(() => {
          console.log('🎯 [No-Referral-Code] Opening modal now')
          setIsReferralInputModalOpen(true)
          setHasAutoOpenedModal(true)
          setIsCheckingInviteStatus(false)
        }, 500)
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error('❌ [No-Referral-Code] Error checking invite status:', err)
          if (err instanceof Error) {
            console.error('❌ [No-Referral-Code] Error message:', err.message)
            console.error('❌ [No-Referral-Code] Error stack:', err.stack)
          }
          setIsCheckingInviteStatus(false)
        } else {
          console.log('🛑 [No-Referral-Code] Request was aborted')
        }
      }
    }

    console.log('🚀 [No-Referral-Code] Starting invite status check...')
    checkInviteStatus()

    return () => {
      console.log('🧹 [No-Referral-Code] Cleaning up - aborting controller')
      controller.abort()
    }
  }, [location.pathname, location.search, twitterUser, isConnected, address, hasAutoOpenedModal, isReferralInputModalOpen])

  // Handle referral code submission
  const handleSubmitReferralCode = async () => {
    if (!inputReferralCode.trim()) {
      toast.error('Please enter an invite code', {
        style: { fontSize: '12px' }
      })
      return
    }

    if (!address || !isConnected) {
      toast.error('Please connect your wallet to redeem an invite code', {
        style: { fontSize: '12px' }
      })
      return
    }

    // Extract rc from URL query parameters if present
    const urlParams = new URLSearchParams(window.location.search)
    const rc = urlParams.get('rc')
    const inviteTokenFromUrl = urlParams.get('inviteToken')

    setIsRedeemingReferralCode(true)

    try {
      // If there's a referral code in URL, use the referral/redeem endpoint (existing flow)
      if (rc) {
        console.log('🔄 Using referral/redeem endpoint (referral code in URL)')
        // Decide which code to send:
        // - If rc is present in URL, use that as code and user input as inviteToken
        // - If rc is absent, treat user input as the invite code directly
        const codeToUse = rc
        const inviteTokenToUse = inviteTokenFromUrl || inputReferralCode.trim() || undefined

        if (!codeToUse) {
          toast.error('Please enter a valid invite code', {
            style: { fontSize: '12px' },
            autoClose: 4000,
          })
          setIsRedeemingReferralCode(false)
          return
        }

        // API parameters:
        // code: referral code from URL (rc parameter)
        // newUser: wallet address
        // inviteToken: what user enters in the input box (or from URL if present)
        const response = await fetch(`${getBackendBaseUrl()}referral/redeem`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: codeToUse, // Referral code (from URL if present, otherwise user input)
            newUser: address, // Wallet address
            inviteToken: inviteTokenToUse, // Invite token from URL or user input (when rc is present)
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          const errorMessage = errorData.error || `Failed to redeem invite code: ${response.status}`
          
          // Handle specific error messages
          let userFriendlyMessage = errorMessage
          if (errorMessage === 'invalid_code_or_already_referred') {
            userFriendlyMessage = 'Invalid invite code or you have already been referred'
          } else if (errorMessage === 'self_referral_not_allowed') {
            userFriendlyMessage = 'You cannot refer yourself'
          } else if (errorMessage === 'referral_not_allowed_by_referrer') {
            userFriendlyMessage = 'Referral not allowed by referrer'
          }
          
          toast.error(userFriendlyMessage, {
            style: { fontSize: '12px' },
            autoClose: 4000,
          })
          setIsRedeemingReferralCode(false)
          return
        }

        const data = await response.json()
        console.log('Referral redemption response:', data)

        // Show success message with details
        const referredCredits = data.referred?.credits || 0
        const referredXp = data.referred?.xp || 0
        
        toast.success(`Invite code redeemed! You earned ${referredCredits} credits and ${referredXp} XP.`, {
          style: { fontSize: '12px' },
          autoClose: 4000,
        })

        // Refresh metrics to show updated credits and XP in navbar
        // Add a small delay to ensure backend has processed the referral redemption
        await new Promise(resolve => setTimeout(resolve, 500))
        await refreshMetrics()

        // Close modal and reset
        setIsReferralInputModalOpen(false)
        setInputReferralCode("")
        
        // Clean up URL parameters
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href)
          url.searchParams.delete('rc')
          url.searchParams.delete('inviteToken')
          window.history.replaceState({}, '', url.toString())
        }
      } else {
        // No referral code in URL - use /invite endpoint
        console.log('🔄 Using /invite endpoint (no referral code in URL)')
        const codeToUse = inputReferralCode.trim()

        if (!codeToUse) {
          toast.error('Please enter a valid invite code', {
            style: { fontSize: '12px' },
            autoClose: 4000,
          })
          setIsRedeemingReferralCode(false)
          return
        }

        console.log('📤 Calling /invite endpoint with code:', codeToUse, 'newUser:', address)
        const response = await fetch(`${getBackendBaseUrl()}invite`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: codeToUse,
            newUser: address,
          }),
        })

        console.log('📥 /invite Response status:', response.status, response.statusText)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          const errorMessage = errorData.error || `Failed to assign invite code: ${response.status}`
          
          console.error('❌ /invite Error:', errorMessage)
          toast.error(errorMessage, {
            style: { fontSize: '12px' },
            autoClose: 4000,
          })
          setIsRedeemingReferralCode(false)
          return
        }

        const data = await response.json()
        console.log('📋 /invite Response data:', JSON.stringify(data, null, 2))

        toast.success('Invite code assigned successfully!', {
          style: { fontSize: '12px' },
          autoClose: 4000,
        })

        // Refresh metrics
        await new Promise(resolve => setTimeout(resolve, 500))
        await refreshMetrics()

        // Close modal and reset
        setIsReferralInputModalOpen(false)
        setInputReferralCode("")
      }
    } catch (error: unknown) {
      console.error("Error processing invite code:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to process invite code"
      toast.error(`Invite code processing failed: ${errorMessage}`, {
        style: { fontSize: '12px' },
        autoClose: 4000,
      })
    } finally {
      setIsRedeemingReferralCode(false)
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-white">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SideBar - Hidden on mobile, visible on desktop */}
      <div className={`fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <SideBar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <div className="flex h-full min-w-0 flex-1 flex-col w-full lg:w-auto">
        <NavBar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-black">
          {location.pathname === '/points' ? (
            <Points />
          ) : location.pathname === '/polymarket' ? (
            <Body />
          ) : location.pathname === '/crypto' || location.pathname === '/' ? (
            <CryptoBody />
          ) : location.pathname === '/score' ? (
            <Benchmark />
          ) : location.pathname === '/mathematical-accuracy' ? (
            <MathematicalAccuracy />
          ) : (
            <Home />
          )}
        </main>
      </div>

      {/* Referral Input Modal - Only shown on root route */}
      {location.pathname === '/' && (
        <ReferralInputModal
          isOpen={isReferralInputModalOpen}
          onClose={() => {
            setIsReferralInputModalOpen(false)
            setInputReferralCode("")
            // Don't delete URL parameters when modal is closed manually
            // They will be cleaned up after successful redemption
          }}
          referralCode={inputReferralCode}
          setReferralCode={setInputReferralCode}
          onSubmit={handleSubmitReferralCode}
          isLoading={isRedeemingReferralCode}
        />
      )}
    </div>
  )
}

// Referral Input Modal Component
interface ReferralInputModalProps {
  isOpen: boolean
  onClose: () => void
  referralCode: string
  setReferralCode: (code: string) => void
  onSubmit: () => void
  isLoading?: boolean
}

const ReferralInputModal = ({ isOpen, onClose, referralCode, setReferralCode, onSubmit, isLoading = false }: ReferralInputModalProps) => {
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
          disabled={isLoading}
          className="absolute top-4 right-4 rounded-lg p-2 transition-colors hover:bg-[#2A2A2A] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="h-5 w-5 text-[#D1D1D1]" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <h2 className="font-urbanist text-2xl font-medium leading-tight tracking-[0%] text-[#FFFFFF] mb-2">
            Enter Invite Code
          </h2>
          <p className="font-urbanist text-sm font-medium leading-normal tracking-[0%] text-[#D1D1D1]">
            Enter the invite code of the person who referred you to Raven.
          </p>
        </div>

        {/* Input Field */}
        <div className="mb-6">
          <label className="block font-urbanist text-xs font-medium leading-none tracking-[0%] text-[#FFFFFF] mb-2">
            Invite Code
          </label>
          <input
            type="text"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            placeholder="Enter invite code here..."
            disabled={isLoading}
            className="w-full rounded-xl bg-[#2A2A2A] px-4 py-3 font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF] placeholder:text-[#808080] border border-transparent focus:border-[#45FFAE] focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                onSubmit()
              }
            }}
            autoFocus
          />
          <p className="mt-2 font-urbanist text-xs font-medium leading-normal tracking-[0%] text-[#808080]">
            Get the invite code from the person who invited you.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex items-center justify-center rounded-xl bg-[#2A2A2A] px-4 py-3 font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF] transition-colors hover:bg-[#3A3A3A] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!referralCode.trim() || isLoading}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#45FFAE] px-4 py-3 font-urbanist text-sm font-medium leading-none tracking-[0%] text-black transition-colors hover:bg-[#35EF9E] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
                <span>Redeeming...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Submit</span>
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

export default Dashboard
