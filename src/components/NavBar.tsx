import { useState, useEffect, useCallback } from "react";
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
import { BACKEND_URL } from "../utils/constants";

const NavBar = () => {

  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { address , isConnected } = useAccount();
   const [twitterUser, setTwitterUser] = useState<User | null>(null);
   const [isCheckingAuth, setIsCheckingAuth] = useState(false);
   const { creditsPending, inferenceRemaining, refreshMetrics } = useUserMetrics();

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

   // Monitor auth state changes
   useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setTwitterUser(user);
      } else {
        setTwitterUser(null);
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

   // Request initial grant when user is logged in with Twitter and wallet gets connected
   useEffect(() => {
    if (twitterUser && isConnected && address) {
      // Small delay to ensure everything is initialized
      const timer = setTimeout(() => {
        requestInitialGrant();
      }, 1000);
      return () => clearTimeout(timer);
    }
   }, [twitterUser, isConnected, address, requestInitialGrant]);

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
    <div className="flex flex-row items-center justify-between bg-black h-16 w-full px-4 border-b border-gray-800 py-2">
          {/* <div className="font-urbanist font-medium text-lg leading-none tracking-[0%] text-[#45FFAE] bg-[#141414] rounded-lg p-2 ml-2 text-center" >
             Polymarket
          </div> */}

        {/* User Credits and Inferences - Left Side - Only show when logged in and wallet connected */}
        <div className="flex flex-row items-center">
          {twitterUser && isConnected && (
              <div className="flex flex-row items-center gap-3">
              <div className="flex flex-row items-center gap-2 bg-[#45FFAE]/10 border-t border-l border-[#45FFAE] rounded-lg px-3 py-2">
                <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#45FFAE]">
                  Credits Remaining: <span className="font-semibold">{formatMetricValue(creditsPending)}</span>
                </div>
              </div>
              <div className="flex flex-row items-center gap-2 bg-[#45FFAE]/10 border-t border-l border-[#45FFAE] rounded-lg px-3 py-2">
                <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#45FFAE]">
                  Inference Remaining: <span className="font-semibold">{formatMetricValue(inferenceRemaining)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side Buttons */}
        <div className="flex flex-row items-center gap-4">
          {/* Login with X Button - Only show when user is NOT logged in */}
          {!twitterUser && !isCheckingAuth && (
            <div 
              className="flex flex-row items-center gap-2 border-t border-l rounded-lg p-2 transition-all duration-200 ease-in-out bg-[#45FFAE]/10 border-[#45FFAE] cursor-pointer hover:bg-[#45FFAE]/15 hover:scale-105"
              onClick={handleLoginWithX}
            >
              <img src={walletLogo} alt="logo"  className="h-6 w-6"/>
              <div className="font-urbanist font-medium text-lg leading-none tracking-[0%] text-[#45FFAE] text-center">
                Login with X
              </div>
            </div>
          )}

          {/* Loading state - Only show when checking auth */}
          {isCheckingAuth && (
            <div 
              className="flex flex-row items-center gap-2 border-t border-l rounded-lg p-2 bg-[#45FFAE]/5 border-[#45FFAE]/50 cursor-not-allowed opacity-60"
            >
              <img src={walletLogo} alt="logo"  className="h-6 w-6"/>
              <div className="font-urbanist font-medium text-lg leading-none tracking-[0%] text-[#45FFAE] text-center">
                Loading...
              </div>
            </div>
          )}
          
          {/* Connect Wallet Button - Only show when user is logged in */}
          {twitterUser && (
            <div className="flex flex-row items-center gap-2 bg-[#45FFAE]/10 border-t border-l border-[#45FFAE] rounded-lg p-2 cursor-pointer hover:bg-[#45FFAE]/15 hover:scale-105 transition-all duration-200 ease-in-out"
            onClick={handleConnectWallet}
            >
               <img src={walletLogo} alt="logo"  className="h-6 w-6"/>
               <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#45FFAE] text-center">
               {isConnected ? truncateEthAddress(address as string) : 'Connect Wallet'}
               </div>
            </div>
          )}


        </div>


    </div>
  )
}

export default NavBar
