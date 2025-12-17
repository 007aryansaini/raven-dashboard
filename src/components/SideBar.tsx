import logo from "../assets/logo.svg"
import points from "../assets/points.svg"
import upgradePlan from "../assets/upgradePlan.svg"
import userProfile from "../assets/userProfile.svg"
import settings from "../assets/settings.svg"
import telegram from "../assets/telegram.svg"
import twitter from "../assets/twitter.svg"
import discord from "../assets/discord.svg"
import cryptoTrade from "../assets/cryptoTrade.svg"
import polymarketMarket from "../assets/polymarketLogo.svg"
import { useTab, type TabType } from "../contexts/TabContext"
import { useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Setting from "./Setting"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from '../firebase'
import { useAccount, useWriteContract, usePublicClient, useWalletClient } from 'wagmi'
import { toast } from 'react-toastify'
import { useSubscription } from '../contexts/SubscriptionContext'
import contractABI from '../utils/contractABI.json'
import { CHAIN_ID_TO_CONTRACT_ADDRESSES } from '../utils/constants'
import { erc20Abi } from 'viem'
import { useUserMetrics } from '../contexts/UserMetricsContext'

interface SideBarProps {
  onClose?: () => void
}

const SideBar = ({ onClose }: SideBarProps) => {
  const { setActiveTab } = useTab()
  const navigate = useNavigate()
  const location = useLocation()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isScoreDropdownOpen, setIsScoreDropdownOpen] = useState(false)
  const [twitterUser, setTwitterUser] = useState<User | null>(null)
  const { isConnected } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)
  const [subcribeButtonText, setSubcribeButtonText] = useState("Subscribe")
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false)
  const [enterpriseForm, setEnterpriseForm] = useState({
    name: '',
    email: '',
    contactNumber: ''
  })
  const { setIsUserSubscribed, showSubscriptionModal, setShowSubscriptionModal } = useSubscription()
  const { refreshMetrics, hasActiveSubscription, subscriptionPlanId, inferenceRemaining } = useUserMetrics()

  // Helper function to extract Twitter username
  const getTwitterUsername = (user: User | null): string => {
    if (!user) return 'User';
    
    // Try to get screen name from provider data
    const providerData = user.providerData.find(p => p.providerId === 'twitter.com');
    // Access Twitter-specific properties (may require type assertion)
    const userAny = user as any;
    const screenName = userAny.reloadUserInfo?.providerUserInfo?.[0]?.screenName || 
                      providerData?.displayName ||
                      user.displayName || 
                      user.email ||
                      'User';
    
    // Remove @ if already present and add it
    return screenName.startsWith('@') ? screenName : `@${screenName}`;
  };

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
    if (!isConnected) {
      setIsUserSubscribed(false)
      return
    }

    setIsUserSubscribed(hasActiveSubscription)
  }, [isConnected, hasActiveSubscription, setIsUserSubscribed])

  const handleBuySubscription = () => {
    setShowSubscriptionModal(true)
  }

  const handleCloseModal = () => {
    setShowSubscriptionModal(false)
    setSelectedPlan(null)
  }

  const handleEnterpriseSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate mandatory fields
    if (!enterpriseForm.name.trim() || !enterpriseForm.email.trim()) {
      toast.error('Please fill in all mandatory fields (Name and Email)', {
        style: { fontSize: '12px' }
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(enterpriseForm.email)) {
      toast.error('Please enter a valid email address', {
        style: { fontSize: '12px' }
      })
      return
    }

    // Print to console
    console.log('Enterprise Plan Form Submission:', {
      name: enterpriseForm.name,
      email: enterpriseForm.email,
      contactNumber: enterpriseForm.contactNumber || 'Not provided'
    })

    toast.success('Thank you! We will contact you soon.', {
      style: { fontSize: '12px' }
    })

    // Reset form and close modal
    setEnterpriseForm({ name: '', email: '', contactNumber: '' })
    setShowEnterpriseModal(false)
  }

  const handleEnterpriseInputChange = (field: 'name' | 'email' | 'contactNumber', value: string) => {
    setEnterpriseForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const plans = [
    {
      id: 1,
      name: 'Plan 1',
      price: '$99',
      priceUnits: 99_000_000,
      description: 'Price Accuracy',
      requests: '3,000 requests/month'
    },
    {
      id: 2,
      name: 'Plan 2',
      price: '$129',
      priceUnits: 129_000_000,
      description: 'Price Accuracy + Reasoning',
      requests: '4,000 requests/month'
    },
    {
      id: 3,
      name: 'Plan 3',
      price: '$149',
      priceUnits: 149_000_000,
      description: 'Price Accuracy + Reasoning + Scores',
      requests: '5,000 requests/month'
    },
    {
      id: 4,
      name: 'Enterprise',
      price: 'Custom',
      priceUnits: 0,
      description: 'Custom Solutions',
      requests: 'Unlimited requests'
    }
  ]

  const currentPlanId = subscriptionPlanId ?? 0
  const inferenceLeft = inferenceRemaining ?? 0
  const hasCurrentPlan = hasActiveSubscription && currentPlanId > 0

  const getPlanStatus = (
    planId: number
  ): { disabled: boolean; note: string | null } => {
    // Enterprise plan is always available
    if (planId === 4) {
      return { disabled: false, note: null }
    }

    if (!hasCurrentPlan) {
      return { disabled: false, note: null }
    }

    if (planId < currentPlanId) {
      return {
        disabled: true,
        note: `Already on Plan ${currentPlanId}`,
      }
    }

    if (planId === currentPlanId) {
      if (inferenceLeft > 0) {
        return {
          disabled: true,
          note: `Already on Plan ${currentPlanId}`,
        }
      }

      return {
        disabled: false,
        note: "Inference depleted — ready to renew",
      }
    }

    return {
      disabled: false,
      note: "Upgrade available",
    }
  }

  useEffect(() => {
    if (!selectedPlan) {
      return
    }

    const status = getPlanStatus(selectedPlan)
    if (status.disabled) {
      setSelectedPlan(null)
    }
  }, [selectedPlan, hasActiveSubscription, subscriptionPlanId, inferenceRemaining])

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      toast.warning('Please select a plan', {
        style: { fontSize: '12px' }
      })
      return
    }

    if (!isConnected) {
      toast.warning('Please connect your wallet to subscribe', {
        style: { fontSize: '12px' }
      })
      return
    }

    const selectedPlanData = plans.find(p => p.id === selectedPlan)

    if (!selectedPlanData) {
      toast.error('Selected plan not found', {
        style: { fontSize: '12px' }
      })
      return
    }

    const planStatus = getPlanStatus(selectedPlan)
    if (planStatus.disabled) {
      toast.warning('Selected plan is not available right now', {
        style: { fontSize: '12px' }
      })
      return
    }
    const chainId = walletClient?.chain?.id
    if (chainId !== 11155111) {
      toast.warning('Please connect to the correct network', {
        style: { fontSize: '12px' }
      })
      return
    }

    setIsSubscribing(true)

    try {
      let hash = ''

      setSubcribeButtonText(`Approving mUSDC...`)

      hash = await writeContractAsync({
        address: CHAIN_ID_TO_CONTRACT_ADDRESSES[chainId as keyof typeof CHAIN_ID_TO_CONTRACT_ADDRESSES]?.mUSDC as `0x${string}`,
        abi: erc20Abi,
        functionName: 'approve',
        args: [CHAIN_ID_TO_CONTRACT_ADDRESSES[chainId as keyof typeof CHAIN_ID_TO_CONTRACT_ADDRESSES]?.contractAddress as `0x${string}`, BigInt(selectedPlanData?.priceUnits ?? 0)],
        chainId: chainId,
      }) as `0x${string}`

      setSubcribeButtonText('Waiting for confirmation...')

      await publicClient?.waitForTransactionReceipt({ hash: hash as `0x${string}` })

      toast.success('Token approved successfully!', {
        position: "top-right",
        autoClose: 5000,
      })

      setSubcribeButtonText("Subscribing...")

      hash = await writeContractAsync({
        address: CHAIN_ID_TO_CONTRACT_ADDRESSES[chainId as keyof typeof CHAIN_ID_TO_CONTRACT_ADDRESSES]?.contractAddress as `0x${string}`,
        abi: contractABI,
        functionName: 'purchaseSubscriptionWithToken',
        args: [selectedPlanData?.id, CHAIN_ID_TO_CONTRACT_ADDRESSES[chainId as keyof typeof CHAIN_ID_TO_CONTRACT_ADDRESSES]?.mUSDC, BigInt(selectedPlanData?.priceUnits ?? 0)],
        chainId: chainId,
      }) as `0x${string}`

      await publicClient?.waitForTransactionReceipt({ hash: hash as `0x${string}` })

      toast.success('Subscription purchased successfully!', {
        position: "top-right",
        autoClose: 5000,
      })

      setIsUserSubscribed(true)
      await refreshMetrics()

    } catch (error: any) {
      toast.error(`Subscription failed`, {
        style: { fontSize: '12px' }
      })
    } finally {
      setIsSubscribing(false)
      handleCloseModal()
      setSubcribeButtonText("Subscribe")
    }
  }

  // Handle click outside to close settings
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      // Close if clicking outside the modal and not on the settings button
      if (!target.closest('[data-settings-modal]') && !target.closest('[data-settings-button]')) {
        setIsSettingsOpen(false)
      }
      // Close score dropdown if clicking outside
      if (!target.closest('[data-score-dropdown]') && !target.closest('[data-score-button]')) {
        setIsScoreDropdownOpen(false)
      }
    }

    if (isSettingsOpen || isScoreDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSettingsOpen, isScoreDropdownOpen])

  const handleSettingsClick = () => {
    setIsSettingsOpen(!isSettingsOpen)
  }

  const handleCloseSettings = () => {
    setIsSettingsOpen(false)
  }

  const handleNavigation = (path: string, tab: TabType) => {
    // If already on the same route, force a reset by navigating with replace and state
    if (location.pathname === path) {
      // Force navigation with replace to trigger route change detection
      navigate(path, { replace: true, state: { reset: Date.now() } })
    } else {
      navigate(path)
    }
    setActiveTab(tab)
    onClose?.() // Close sidebar on mobile after navigation
  }

  return (
    <>
      <div className="bg-black h-screen w-64 lg:w-3xs flex flex-col justify-between border-r border-gray-800">
        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#1a1a1a] border border-[#45FFAE]/30 hover:border-[#45FFAE]/50 transition-colors z-10"
        >
          <svg 
            className="w-5 h-5 text-[#45FFAE]" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>
      <img 
        className="w-30 h-10 mt-6 ml-3 cursor-pointer hover:scale-105 transition-transform duration-200 ease-in-out" 
        src={logo} 
        alt="logo" 
        onClick={() => handleNavigation('/', null)}
      />

      <div className="flex flex-col gap-2 mb-40">
      <div className="flex flex-row items-center gap-2 bg-[#141414] rounded-lg p-2 w-52 lg:w-56 h-12 ml-3">

<div 
  className={`flex flex-row items-center gap-1 rounded-lg p-2 cursor-pointer transition-all duration-200 ${
    location.pathname === '/polymarket'
      ? 'bg-[#292929]' 
      : 'hover:bg-[#1a1a1a]'
  }`}
  onClick={() => handleNavigation('/polymarket', 'polymarket')}
>
  <img src={polymarketMarket} alt="polymarket"  className="h-6 w-6"/>
  <div className={`font-urbanist font-normal text-sm leading-none tracking-[0%] ${
    location.pathname === '/polymarket' ? 'text-[#FFFFFF]' : 'text-[#808080]'
  }`}>Polymarket</div>
</div>


<div 
  className={`flex flex-row items-center gap-1 rounded-lg p-2 cursor-pointer transition-all duration-200 ${
    location.pathname === '/crypto'
      ? 'bg-[#292929]' 
      : 'hover:bg-[#1a1a1a]'
  }`}
  onClick={() => handleNavigation('/crypto', 'crypto')}
>
  <img src={cryptoTrade} alt="crypto"  className="h-6 w-6"/>
  <div className={`font-urbanist font-normal text-sm leading-none tracking-[0%] ${
    location.pathname === '/crypto' ? 'text-[#FFFFFF]' : 'text-[#808080]'
  }`}>Crypto</div>
</div>
</div>

<div className="group flex flex-row items-center justify-between gap-2 ml-3 w-52 lg:w-56 h-14 cursor-pointer hover:bg-[#1a1a1a] rounded-lg p-2 transition-all duration-200 ease-in-out" onClick={() => handleNavigation('/points', null)}>
<div className="flex flex-row items-center gap-2">
<img className="w-6 h-6 group-hover:fill-[#45FFAE] transition-all duration-200" src={points} alt="points" />
<div className="font-urbanist font-normal text-sm leading-none tracking-[0%] group-hover:text-[#45FFAE] text-[#808080] transition-colors duration-200">Points</div>
</div>
<div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#45FFAE]">
<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
<path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
</svg>
</div>
</div>

<div className="relative" data-score-dropdown>
<div className={`group flex flex-row items-center justify-between gap-2 ml-3 w-56 h-14 cursor-pointer hover:bg-[#1a1a1a] rounded-lg p-2 transition-all duration-200 ease-in-out ${
  location.pathname === '/score' || location.pathname === '/mathematical-accuracy' ? 'bg-[#1a1a1a]' : ''
}`} onClick={() => setIsScoreDropdownOpen(!isScoreDropdownOpen)} data-score-button>
<div className="flex flex-row items-center gap-2">
<svg className={`w-6 h-6 transition-all duration-200 ${
  location.pathname === '/score' || location.pathname === '/mathematical-accuracy' ? 'text-[#45FFAE]' : 'text-[#808080] group-hover:text-[#45FFAE]'
}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
</svg>
<div className={`font-urbanist font-normal text-sm leading-none tracking-[0%] group-hover:text-[#45FFAE] transition-colors duration-200 ${
  location.pathname === '/score' || location.pathname === '/mathematical-accuracy' ? 'text-[#45FFAE]' : 'text-[#808080]'
}`}>Benchmark</div>
</div>
<div className={`transition-transform duration-200 ${isScoreDropdownOpen ? 'rotate-90' : ''}`}>
<svg className="w-4 h-4 text-[#45FFAE]" fill="currentColor" viewBox="0 0 20 20">
<path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
</svg>
</div>
</div>

{/* Dropdown Menu */}
{isScoreDropdownOpen && (
  <div className="absolute left-3 top-16 w-56 bg-[#1a1a1a] border border-[#45FFAE]/30 rounded-lg shadow-lg z-50 overflow-hidden">
    <div 
      className={`flex flex-row items-center gap-2 px-4 py-3 cursor-pointer hover:bg-[#292929] transition-colors duration-200 ${
        location.pathname === '/score' ? 'bg-[#292929]' : ''
      }`}
      onClick={() => {
        handleNavigation('/score', null)
        setIsScoreDropdownOpen(false)
      }}
    >
      <div className={`font-urbanist font-normal text-sm leading-none tracking-[0%] ${
        location.pathname === '/score' ? 'text-[#45FFAE]' : 'text-[#808080]'
      }`}>FT Reasoning Model</div>
    </div>
    <div 
      className={`flex flex-row items-center gap-2 px-4 py-3 cursor-pointer hover:bg-[#292929] transition-colors duration-200 border-t border-[#45FFAE]/10 ${
        location.pathname === '/mathematical-accuracy' ? 'bg-[#292929]' : ''
      }`}
      onClick={() => {
        handleNavigation('/mathematical-accuracy', null)
        setIsScoreDropdownOpen(false)
      }}
    >
      <div className={`font-urbanist font-normal text-sm leading-none tracking-[0%] ${
        location.pathname === '/mathematical-accuracy' ? 'text-[#45FFAE]' : 'text-[#808080]'
      }`}>Mathematical accuracy</div>
    </div>
  </div>
)}
</div>
</div>

      <div className="flex flex-col w-full items-center p-2 gap-4">
        {twitterUser && (
          <div 
            className="flex flex-row items-center cursor-pointer gap-2 w-52 lg:w-56 h-14 bg-[#45FFAE]/10 border-t border-l border-[#45FFAE] rounded-lg p-2 hover:bg-[#45FFAE]/15 hover:scale-105 transition-all duration-200 ease-in-out"
            onClick={handleBuySubscription}
          >
            <img className="w-6 h-6" src={upgradePlan} alt="points" />
            <div className="font-urbanist font-medium text-xs lg:text-sm leading-none tracking-[0%] text-[#FFFFFF]">Upgrade plan</div>
          </div>
        )}

        {twitterUser && (
          <div className="relative flex flex-row items-center justify-between w-52 lg:w-56 h-14 p-1 gap-2">
            <img 
              className="w-8 h-8 rounded-full object-cover" 
              src={twitterUser.photoURL || userProfile} 
              alt="user profile" 
            />
            <div className="font-urbanist font-medium text-sm lg:text-base leading-none tracking-[0%] text-[#808080] truncate flex-1">
              {getTwitterUsername(twitterUser)}
            </div>
            <img 
              className="w-10 lg:w-12 h-10 lg:h-12 cursor-pointer hover:scale-110 transition-transform duration-200 ease-in-out flex-shrink-0" 
              src={settings} 
              alt="settings" 
              onClick={handleSettingsClick}
              data-settings-button
            />
            {isSettingsOpen && (
              <Setting 
                onClose={handleCloseSettings} 
              />
            )}
          </div>
        )}

        <div className="flex flex-row items-center justify-center w-52 lg:w-64 gap-4 lg:gap-6">
          <a 
            href="https://t.me/astron_ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="cursor-pointer hover:scale-110 hover:opacity-80 transition-all duration-200 ease-in-out"
          >
            <img className="w-8 lg:w-10 h-8 lg:h-10" src={telegram} alt="Telegram" />
          </a>
          <a 
            href="https://x.com/Astron_Markets" 
            target="_blank" 
            rel="noopener noreferrer"
            className="cursor-pointer hover:scale-110 hover:opacity-80 transition-all duration-200 ease-in-out"
          >
            <img className="w-8 lg:w-10 h-8 lg:h-10" src={twitter} alt="X (Twitter)" />
          </a>
          <a 
            href="https://discord.com/invite/yWCBPsqmdw" 
            target="_blank" 
            rel="noopener noreferrer"
            className="cursor-pointer hover:scale-110 hover:opacity-80 transition-all duration-200 ease-in-out"
          >
            <img className="w-8 lg:w-10 h-8 lg:h-10" src={discord} alt="Discord" />
          </a>
        </div>
      </div>

      {/* Subscription Modal - Rendered via Portal */}
      {showSubscriptionModal && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex lg:items-center lg:justify-center"
          style={{ 
            height: '100vh', 
            width: '100vw',
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
          }}
          onClick={handleCloseModal}
        >
          {/* Modal - Left Sidebar on Mobile, Centered on Desktop */}
          <div 
            className="border-r lg:border border-[#45FFAE]/30 lg:rounded-xl w-full max-w-md lg:max-w-3xl h-full lg:h-auto lg:max-h-[90vh] p-6 sm:p-8 flex flex-col gap-6 overflow-y-auto relative z-[10000]"
            style={{
              background: '#000000',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <h2 
                style={{
                  fontFamily: 'Hauora, sans-serif',
                  fontWeight: 200,
                  fontSize: 'clamp(22px, 4vw, 28px)',
                  lineHeight: '100%',
                  letterSpacing: '-2%',
                  color: '#45FFAE',
                  margin: 0
                }}
              >
                Choose Your Plan
              </h2>
              
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-[#45FFAE]/30 hover:border-[#45FFAE]/50 transition-colors cursor-pointer bg-[#0A0A0A]"
              >
                <svg 
                  className="w-5 h-5 text-[#45FFAE]" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            </div>

            {/* Plans Container */}
            <div 
              className="border border-[#45FFAE]/20 flex-1 w-full flex flex-col rounded-xl p-6"
              style={{
                gap: '16px',
                background: '#0A0A0A',
                minHeight: 0
              }}
            >
              {/* Plan Options */}
              <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
                {plans.map((plan) => {
                  const { disabled: planDisabled, note: planNote } = getPlanStatus(plan.id)
                  const isSelected = selectedPlan === plan.id
                  const selectionClasses = isSelected
                    ? "bg-[#45FFAE]/20 border-[#45FFAE]"
                    : "bg-[#45FFAE]/5 border-[#45FFAE]/30"
                  const interactivityClasses = planDisabled
                    ? "cursor-not-allowed opacity-60 border-[#2b2b2b]"
                    : "cursor-pointer hover:bg-[#45FFAE]/10 hover:border-[#45FFAE]/50"

                  return (
                    <div
                      key={plan.id}
                      className={`relative flex flex-col p-4 rounded-lg border transition-all duration-200 ease-in-out ${selectionClasses} ${interactivityClasses}`}
                      onClick={() => {
                        if (planDisabled) return
                        if (plan.id === 4) {
                          // Enterprise plan - show form modal
                          setShowEnterpriseModal(true)
                        } else {
                          setSelectedPlan(plan.id)
                        }
                      }}
                    >
                      {/* Plan Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected
                                ? "border-[#45FFAE] bg-[#45FFAE]"
                                : "border-[#45FFAE]/50"
                            }`}
                          >
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-black"></div>
                            )}
                          </div>
                          <h3 
                            style={{
                              fontFamily: "Inter, sans-serif",
                              fontWeight: 600,
                              fontSize: "18px",
                              color: "#45FFAE",
                              margin: 0
                            }}
                          >
                            {plan.name}
                          </h3>
                        </div>
                        <div 
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontWeight: 700,
                            fontSize: "20px",
                            color: "#45FFAE",
                          }}
                        >
                          {plan.price}
                          <span 
                            style={{
                              fontSize: "14px",
                              fontWeight: 400,
                              color: "#45FFAE",
                              opacity: 0.8
                            }}
                          >
                            /month
                          </span>
                        </div>
                      </div>

                      {/* Plan Details Tooltip */}
                      <div className="ml-8 mt-2">
                        <div 
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontWeight: 500,
                            fontSize: "14px",
                            color: "#45FFAE",
                            opacity: 0.9,
                            marginBottom: "4px"
                          }}
                        >
                          {plan.description}
                        </div>
                        <div 
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontWeight: 400,
                            fontSize: "12px",
                            color: "#45FFAE",
                            opacity: 0.7
                          }}
                        >
                          {plan.requests}
                        </div>
                        {planNote && (
                          <div className="text-xs text-[#A4FFB3] mt-2">
                            {planNote}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Subscribe Button */}
              <button
                onClick={handleSubscribe}
                disabled={!selectedPlan || isSubscribing}
                className={`w-full py-3 rounded-lg font-medium transition-all flex-shrink-0 ${
                  selectedPlan && !isSubscribing
                    ? 'bg-[#45FFAE]/10 border border-[#45FFAE] hover:bg-[#45FFAE]/20 cursor-pointer'
                    : 'bg-[#45FFAE]/5 border border-[#45FFAE]/30 cursor-not-allowed opacity-50'
                }`}
                style={{
                  color: '#45FFAE',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '16px',
                  fontWeight: 500
                }}
              >
                {subcribeButtonText}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Enterprise Form Modal */}
      {showEnterpriseModal && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ 
            height: '100vh', 
            width: '100vw',
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
          }}
          onClick={() => setShowEnterpriseModal(false)}
        >
          <div 
            className="border border-[#45FFAE]/30 rounded-xl w-full max-w-md lg:max-w-lg h-auto max-h-[90vh] p-6 sm:p-8 flex flex-col gap-6 overflow-y-auto relative z-[10000]"
            style={{
              background: '#000000',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <h2 
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600,
                  fontSize: '24px',
                  lineHeight: '100%',
                  color: '#45FFAE',
                  margin: 0
                }}
              >
                Enterprise Plan Inquiry
              </h2>
              
              {/* Close Button */}
              <button
                onClick={() => setShowEnterpriseModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-[#45FFAE]/30 hover:border-[#45FFAE]/50 transition-colors cursor-pointer bg-[#0A0A0A]"
              >
                <svg 
                  className="w-5 h-5 text-[#45FFAE]" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEnterpriseSubmit} className="flex flex-col gap-4">
              {/* Name/Company Name */}
              <div className="flex flex-col gap-2">
                <label 
                  htmlFor="enterprise-name"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '14px',
                    color: '#45FFAE',
                    fontWeight: 500
                  }}
                >
                  Name or Company Name <span style={{ color: '#ff4444' }}>*</span>
                </label>
                <input
                  id="enterprise-name"
                  type="text"
                  value={enterpriseForm.name}
                  onChange={(e) => handleEnterpriseInputChange('name', e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-[#45FFAE]/30 bg-[#0A0A0A] text-white focus:outline-none focus:border-[#45FFAE] transition-colors"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '14px'
                  }}
                  placeholder="Enter your name or company name"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label 
                  htmlFor="enterprise-email"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '14px',
                    color: '#45FFAE',
                    fontWeight: 500
                  }}
                >
                  Email <span style={{ color: '#ff4444' }}>*</span>
                </label>
                <input
                  id="enterprise-email"
                  type="email"
                  value={enterpriseForm.email}
                  onChange={(e) => handleEnterpriseInputChange('email', e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-[#45FFAE]/30 bg-[#0A0A0A] text-white focus:outline-none focus:border-[#45FFAE] transition-colors"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '14px'
                  }}
                  placeholder="Enter your email address"
                />
              </div>

              {/* Contact Number */}
              <div className="flex flex-col gap-2">
                <label 
                  htmlFor="enterprise-contact"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '14px',
                    color: '#45FFAE',
                    fontWeight: 500
                  }}
                >
                  Contact Number
                </label>
                <input
                  id="enterprise-contact"
                  type="tel"
                  value={enterpriseForm.contactNumber}
                  onChange={(e) => handleEnterpriseInputChange('contactNumber', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#45FFAE]/30 bg-[#0A0A0A] text-white focus:outline-none focus:border-[#45FFAE] transition-colors"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '14px'
                  }}
                  placeholder="Enter your contact number (optional)"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-lg font-medium transition-all mt-2 bg-[#45FFAE]/10 border border-[#45FFAE] hover:bg-[#45FFAE]/20 cursor-pointer"
                style={{
                  color: '#45FFAE',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '16px',
                  fontWeight: 500
                }}
              >
                Submit
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
    </>
  )
}

export default SideBar
