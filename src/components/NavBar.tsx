import { useState, useEffect, useCallback, useRef } from "react";
import walletLogo from "../assets/walletLogo.svg"
import {
   useConnectModal,
   useAccountModal
} from '@rainbow-me/rainbowkit';
import truncateEthAddress from "truncate-eth-address";
import { signInWithPopup, onAuthStateChanged, type User } from "firebase/auth";
import { auth, twitterProvider, db } from '../firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import { useAccount  } from 'wagmi';
import { useUserMetrics } from "../contexts/UserMetricsContext";
import { BACKEND_URL, getBackendBaseUrl } from "../utils/constants";
import { useLocation } from "react-router-dom";

interface NavBarProps {
  onMenuClick?: () => void
}

const NavBar = ({ onMenuClick }: NavBarProps) => {

  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { address , isConnected } = useAccount();
  const location = useLocation();
   const [twitterUser, setTwitterUser] = useState<User | null>(null);
   const [isCheckingAuth, setIsCheckingAuth] = useState(false);
   const { creditsPending, inferenceRemaining, refreshMetrics } = useUserMetrics();
   const [referralCode, setReferralCode] = useState<string | null>(null);
   const hasRedeemedRef = useRef<boolean>(false);
   const isRedeemingRef = useRef<boolean>(false);

   // Helper function to extract Twitter username
   const getTwitterUsername = (user: User | null): string => {
    if (!user) return '';
    
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

   // Extract referral code from URL on mount and when location changes
   useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const rc = urlParams.get('rc');
    if (rc) {
      setReferralCode(rc);
      // Store in localStorage to persist across navigation
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('pending-referral-code', rc);
      }
    } else {
      // Check localStorage for pending referral code
      if (typeof window !== 'undefined') {
        const storedCode = window.localStorage.getItem('pending-referral-code');
        if (storedCode) {
          setReferralCode(storedCode);
        }
      }
    }
   }, [location.search]);

   // Monitor auth state changes
   useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setTwitterUser(user);
      } else {
        setTwitterUser(null);
        // Reset redemption state when user logs out
        hasRedeemedRef.current = false;
      }
      // Reset loading state when auth state changes (handles successful login)
      setIsCheckingAuth(false);
    });

    return () => unsubscribe();
   }, []);

  const formatMetricValue = (value: number | null) => {
    return value !== null ? value.toLocaleString("en-US") : "..."
  };

  const requestInitialGrant = useCallback(async () => {
    if (!address) {
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}credits/initial-grant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: address,
        }),
      });

      if (!response.ok) {
        throw new Error(`Initial grant request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("Initial grant response:", data);
      
      // Refresh metrics to get updated credits
      await refreshMetrics();
    } catch (error: any) {
      console.error("Error requesting initial grant:", error);
      // Silently fail - don't show error to user as this is a background operation
    }
  }, [address, refreshMetrics]);

   // Redeem referral code when both Twitter and wallet are connected
   const redeemReferralCode = useCallback(async () => {
    if (!referralCode || !address || hasRedeemedRef.current || isRedeemingRef.current) {
      return;
    }

    isRedeemingRef.current = true;

    try {
      const response = await fetch(`${getBackendBaseUrl()}referral/redeem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: referralCode,
          newUser: address,
        }),
      });

      if (!response.ok) {
        throw new Error(`Referral redemption failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("Referral redemption successful:", data);

      // Mark as redeemed
      hasRedeemedRef.current = true;
      
      // Clear the referral code from localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('pending-referral-code');
      }
      setReferralCode(null);

      // Refresh metrics to get updated credits/XP
      await refreshMetrics();

      // Show success message
      const referredCredits = data?.referred?.credits || 0;
      const referredXp = data?.referred?.xp || 0;

      toast.success(
        `Referral code redeemed! You earned ${referredCredits} credits and ${referredXp} XP.`,
        {
          style: { fontSize: '12px' },
          autoClose: 5000,
        }
      );
    } catch (error: any) {
      console.error("Error redeeming referral code:", error);
      // Don't show error to user if it's a duplicate redemption or invalid code
      // Only show for unexpected errors
      if (!error.message?.includes('already') && !error.message?.includes('invalid')) {
        toast.warning("Unable to redeem referral code. Please try again.", {
          style: { fontSize: '12px' },
        });
      }
    } finally {
      isRedeemingRef.current = false;
    }
   }, [referralCode, address, refreshMetrics]);

   // Request initial grant when user is logged in with Twitter and wallet gets connected
   useEffect(() => {
    if (twitterUser && isConnected && address) {
      // Small delay to ensure everything is initialized
      const timer = setTimeout(() => {
        requestInitialGrant();
        // Also try to redeem referral code if available
        redeemReferralCode();
      }, 1500);
      return () => clearTimeout(timer);
    }
   }, [twitterUser, isConnected, address, requestInitialGrant, redeemReferralCode]);

   const handleConnectWallet = () => {
    if (isConnected) {
      openAccountModal?.();
    } else {
      openConnectModal?.();
    }
   }

   const handleLoginWithX = async () => {
    // Don't do anything if already logged in or currently checking
    if (twitterUser || isCheckingAuth) {
      return;
    }

    try {
      setIsCheckingAuth(true);
      
      // Sign in with Twitter
      const result = await signInWithPopup(auth, twitterProvider);
      
      // The signed-in user info
      const user = result.user;
      console.log('🎉 Twitter login successful:', user);
      
      // Reset loading state immediately after successful login
      // The onAuthStateChanged will set twitterUser, which will update the UI
      setIsCheckingAuth(false);

      // Request initial grant after successful Twitter login (if wallet is connected)
      if (isConnected && address) {
        await requestInitialGrant();
      }
      
      // Check if Twitter user is already registered
      try {
        const userRef = doc(db, 'rushroll_waitlist', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          // User already registered
          const data = userSnap.data();
          const joinDate = data.joinedAt?.toDate?.() || new Date(data.timestamp);
          const formattedDate = joinDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          
          const username = getTwitterUsername(user);
          toast.success(`Welcome back ${username}! Joined on ${formattedDate}`, {
            toastId: `twitter-already-${user.uid}`,
            autoClose: 4000,
            style: { fontSize: '12px' }
          });
        } else {
          // New user - store basic info
          const twitterUsername = getTwitterUsername(user).replace('@', '');
          
          const waitlistData = {
            twitterUsername: twitterUsername,
            twitterUid: user.uid,
            joinedAt: serverTimestamp(),
            timestamp: new Date().toISOString(),
            source: 'twitter_login'
          };

          await setDoc(userRef, waitlistData, { merge: true });
          
          const displayName = getTwitterUsername(user);
          
          toast.success(`Welcome ${displayName}! Successfully logged in.`, {
            toastId: `twitter-login-${user.uid}`,
            autoClose: 4000,
            style: { fontSize: '12px' }
          });
        }
      } catch (error) {
        console.error('Error checking/storing Twitter user:', error);
        const username = getTwitterUsername(user);
        toast.success(`Welcome ${username}!`, {
          toastId: `twitter-login-${user.uid}`,
          autoClose: 3000,
          style: { fontSize: '12px' }
        });
      }
      
    } catch (error: any) {
      console.error('Firebase Twitter Auth Error:', error);
      
      // Handle specific Twitter login errors
      if (error.code === 'auth/popup-closed-by-user') {
        toast.warning('Login cancelled. Please try again.', {
          style: { fontSize: '12px' }
        });
      } else if (error.code === 'auth/popup-blocked') {
        toast.warning('Popup blocked. Please allow popups and try again.', {
          style: { fontSize: '12px' }
        });
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        toast.warning('Account exists with different method. Please sign in with correct method.', {
          style: { fontSize: '12px' }
        });
      } else {
        toast.error(`Login failed: ${error.message}`, {
          style: { fontSize: '12px' }
        });
      }
    } finally {
      setIsCheckingAuth(false);
    }
   }

  return (
    <div className="flex flex-row items-center justify-between bg-black h-14 lg:h-16 w-full px-2 lg:px-4 border-b border-gray-800 py-2">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#1a1a1a] transition-colors"
          >
            <svg 
              className="w-6 h-6 text-[#45FFAE]" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 6h16M4 12h16M4 18h16" 
              />
            </svg>
          </button>

        {/* User Credits and Inferences - Left Side - Only show when logged in and wallet connected */}
        <div className="flex flex-row items-center gap-2 lg:gap-3 flex-1 lg:flex-none">
          {twitterUser && isConnected && (
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-3">
              <div className="flex flex-row items-center gap-1 lg:gap-2 bg-[#45FFAE]/10 border-t border-l border-[#45FFAE] rounded-lg px-2 lg:px-3 py-1.5 lg:py-2">
                <div className="font-urbanist font-medium text-xs lg:text-sm leading-none tracking-[0%] text-[#45FFAE]">
                  <span className="hidden lg:inline">Credits Remaining: </span>
                  <span className="lg:hidden">Credits: </span>
                  <span className="font-semibold">{formatMetricValue(creditsPending)}</span>
                </div>
              </div>
              <div className="flex flex-row items-center gap-1 lg:gap-2 bg-[#45FFAE]/10 border-t border-l border-[#45FFAE] rounded-lg px-2 lg:px-3 py-1.5 lg:py-2">
                <div className="font-urbanist font-medium text-xs lg:text-sm leading-none tracking-[0%] text-[#45FFAE]">
                  <span className="hidden lg:inline">Inference Remaining: </span>
                  <span className="lg:hidden">Inference: </span>
                  <span className="font-semibold">{formatMetricValue(inferenceRemaining)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side Buttons */}
        <div className="flex flex-row items-center gap-2 lg:gap-4">
          {/* Login with X Button - Only show when user is NOT logged in */}
          {!twitterUser && !isCheckingAuth && (
            <div 
              className="flex flex-row items-center gap-1 lg:gap-2 border-t border-l rounded-lg p-1.5 lg:p-2 transition-all duration-200 ease-in-out bg-[#45FFAE]/10 border-[#45FFAE] cursor-pointer hover:bg-[#45FFAE]/15 hover:scale-105"
              onClick={handleLoginWithX}
            >
              <img src={walletLogo} alt="logo"  className="h-5 w-5 lg:h-6 lg:w-6"/>
              <div className="font-urbanist font-medium text-sm lg:text-lg leading-none tracking-[0%] text-[#45FFAE] text-center">
                <span className="hidden sm:inline">Login with X</span>
                <span className="sm:hidden">Login</span>
              </div>
            </div>
          )}

          {/* Loading state - Only show when checking auth */}
          {isCheckingAuth && (
            <div 
              className="flex flex-row items-center gap-1 lg:gap-2 border-t border-l rounded-lg p-1.5 lg:p-2 bg-[#45FFAE]/5 border-[#45FFAE]/50 cursor-not-allowed opacity-60"
            >
              <img src={walletLogo} alt="logo"  className="h-5 w-5 lg:h-6 lg:w-6"/>
              <div className="font-urbanist font-medium text-sm lg:text-lg leading-none tracking-[0%] text-[#45FFAE] text-center">
                Loading...
              </div>
            </div>
          )}
          
          {/* Connect Wallet Button - Only show when user is logged in */}
          {twitterUser && (
            <div className="flex flex-row items-center gap-1 lg:gap-2 bg-[#45FFAE]/10 border-t border-l border-[#45FFAE] rounded-lg p-1.5 lg:p-2 cursor-pointer hover:bg-[#45FFAE]/15 hover:scale-105 transition-all duration-200 ease-in-out"
            onClick={handleConnectWallet}
            >
               <img src={walletLogo} alt="logo"  className="h-5 w-5 lg:h-6 lg:w-6"/>
               <div className="font-urbanist font-medium text-xs lg:text-sm leading-none tracking-[0%] text-[#45FFAE] text-center">
               {isConnected ? (
                 <span className="hidden sm:inline">{truncateEthAddress(address as string)}</span>
               ) : (
                 <span className="hidden sm:inline">Connect Wallet</span>
               )}
               <span className="sm:hidden">{isConnected ? 'Wallet' : 'Connect'}</span>
               </div>
            </div>
          )}


        </div>


    </div>
  )
}

export default NavBar
