import { useState, useEffect } from "react";
import walletLogo from "../assets/walletLogo.svg"
import {
   useConnectModal,
   useAccountModal
} from '@rainbow-me/rainbowkit';
import truncateEthAddress from "truncate-eth-address";
import { signInWithPopup, signOut, onAuthStateChanged, type User } from "firebase/auth";
import { auth, twitterProvider, db } from '../firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import { useWriteContract, usePublicClient, useWalletClient, useAccount  } from 'wagmi';
import contractABI from '../utils/contractABI.json';
import { BACKEND_URL, CHAIN_ID_TO_CONTRACT_ADDRESSES } from '../utils/constants';
import { erc20Abi } from 'viem';
import { useSubscription } from '../contexts/SubscriptionContext';

const NavBar = () => {

   const { openConnectModal } = useConnectModal();
   const { openAccountModal } = useAccountModal();
   const { address , isConnected } = useAccount();
   const [twitterUser, setTwitterUser] = useState<User | null>(null);
   const [isCheckingAuth, setIsCheckingAuth] = useState(false);
   const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
   const { writeContractAsync } = useWriteContract()
   const publicClient = usePublicClient();
   const { data: walletClient } = useWalletClient();
   const [subcribeButtonText, setSubcribeButtonText] = useState("Subscribe");
   const [isSubscribing, setIsSubscribing] = useState(false);
   const { isUserSubscribed, setIsUserSubscribed, showSubscriptionModal, setShowSubscriptionModal } = useSubscription();

   const checkIfUserIsSubscribed = async () => {
       try{
        const response = await fetch(`${BACKEND_URL}users/${address}/has-active-subscription`);
        const data = await response.json();
        setIsUserSubscribed(data.hasActiveSubscription);
       }catch(error: any){
        console.error('Error checking if user is subscribed:', error);
        toast.error('Error checking if user is subscribed', {
          style: { fontSize: '12px' }
        });
       }
   }

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

   useEffect(() => {
    if(isConnected){
      checkIfUserIsSubscribed();
    }
   }, [isConnected]);

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

   const handleLogout = async () => {
    try {
      setIsCheckingAuth(true);
      await signOut(auth);
      // twitterUser will be set to null by onAuthStateChanged
      toast.success('Logged out successfully', {
        style: { fontSize: '12px' }
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(`Logout failed: ${error.message}`, {
        style: { fontSize: '12px' }
      });
    } finally {
      setIsCheckingAuth(false);
    }
   }

   const handleBuySubscription = () => {
    setShowSubscriptionModal(true);
   }

   const handleCloseModal = () => {
    setShowSubscriptionModal(false);
    setSelectedPlan(null);
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
    }
   ];

   const handleSubscribe = async () => {
    if (!selectedPlan) {
      toast.warning('Please select a plan', {
        style: { fontSize: '12px' }
      });
      return;
    }

    if(!isConnected){
      toast.warning('Please connect your wallet to subscribe', {
        style: { fontSize: '12px' }
      });
      return;
    }

    const selectedPlanData = plans.find(p => p.id === selectedPlan);
    const chainId =  walletClient?.chain?.id;
    if(chainId !== 11155111){
      toast.warning('Please connect to the correct network', {
        style: { fontSize: '12px' }
      });
      return;
    }
    
    setIsSubscribing(true);
    
    try{



      let hash = '';

      setSubcribeButtonText(`Approving mUSDC...`);

      hash = await writeContractAsync({
        address: CHAIN_ID_TO_CONTRACT_ADDRESSES[chainId as keyof typeof CHAIN_ID_TO_CONTRACT_ADDRESSES]?.mUSDC as `0x${string}`,
        abi: erc20Abi,
        functionName: 'approve',
        args: [CHAIN_ID_TO_CONTRACT_ADDRESSES[chainId as keyof typeof CHAIN_ID_TO_CONTRACT_ADDRESSES]?.contractAddress as `0x${string}`, BigInt(selectedPlanData?.priceUnits ?? 0) ],
        chainId: chainId,
      }) as `0x${string}`;

      setSubcribeButtonText('Waiting for confirmation...');


    await publicClient?.waitForTransactionReceipt({ hash: hash as `0x${string}` });

    toast.success('Token approved successfully!', {
      position: "top-right",
      autoClose: 5000,
    });

    setSubcribeButtonText("Subscribing...")

    hash = await writeContractAsync({
      address: CHAIN_ID_TO_CONTRACT_ADDRESSES[chainId as keyof typeof CHAIN_ID_TO_CONTRACT_ADDRESSES]?.contractAddress as `0x${string}`,
      abi: contractABI,
      functionName: 'purchaseSubscriptionWithToken',
      args: [selectedPlanData?.id, CHAIN_ID_TO_CONTRACT_ADDRESSES[chainId as keyof typeof CHAIN_ID_TO_CONTRACT_ADDRESSES]?.mUSDC ,BigInt(selectedPlanData?.priceUnits ?? 0) ],
      chainId: chainId,
    }) as `0x${string}`;

    await publicClient?.waitForTransactionReceipt({ hash: hash as `0x${string}` });

    toast.success('Subscription purchased successfully!', {
      position: "top-right",
      autoClose: 5000,
    });

    setIsUserSubscribed(true);

    }catch(error: any){
      console.error('Subscription error:', error);
      toast.error(`Subscription failed`, {
        style: { fontSize: '12px' }
      });
    }finally{
      setIsSubscribing(false);
      handleCloseModal();
      setSubcribeButtonText("Subscribe")
    }

   }

  return (
    <div className="sticky top-0 z-30 flex h-16 w-full flex-row items-center justify-end gap-4 border-b border-gray-800 bg-black/90 px-4 py-2 backdrop-blur">
          {/* <div className="font-urbanist font-medium text-lg leading-none tracking-[0%] text-[#45FFAE] bg-[#141414] rounded-lg p-2 ml-2 text-center" >
             Polymarket
          </div> */}


        {/* Login with X Button - Disabled when logged in */}
        <div 
          className={`flex flex-row items-center gap-2 border-t border-l rounded-lg p-2 transition-all duration-200 ease-in-out ${
            twitterUser || isCheckingAuth
              ? 'bg-[#45FFAE]/5 border-[#45FFAE]/50 cursor-not-allowed opacity-60'
              : 'bg-[#45FFAE]/10 border-[#45FFAE] cursor-pointer hover:bg-[#45FFAE]/15 hover:scale-105'
          }`}
          onClick={twitterUser || isCheckingAuth ? undefined : handleLoginWithX}
          >
             <img src={walletLogo} alt="logo"  className="h-6 w-6"/>
             <div className="font-urbanist font-medium text-lg leading-none tracking-[0%] text-[#45FFAE] text-center">
               {twitterUser ? getTwitterUsername(twitterUser) : (isCheckingAuth ? 'Loading...' : 'Login with X')}
             </div>
          </div>
          
          {/* Connect Wallet Button - Only show when user is logged in */}
          {twitterUser && (
            <div className="flex flex-row items-center gap-2 bg-[#45FFAE]/10 border-t border-l border-[#45FFAE] rounded-lg p-2 cursor-pointer hover:bg-[#45FFAE]/15 hover:scale-105 transition-all duration-200 ease-in-out"
            onClick={handleConnectWallet}
            >
               <img src={walletLogo} alt="logo"  className="h-6 w-6"/>
               <div className="font-urbanist font-medium text-lg leading-none tracking-[0%] text-[#45FFAE] text-center">
               {isConnected ? truncateEthAddress(address as string) : 'Connect Wallet'}
               </div>
            </div>
          )}

          {/* Subscribe Button - Only show when user is logged in and not subscribed */}
          {twitterUser && !isUserSubscribed && (
            <div 
              className="flex flex-row items-center gap-2 bg-[#45FFAE]/10 border-t border-l border-[#45FFAE] rounded-lg p-2 cursor-pointer hover:bg-[#45FFAE]/15 hover:scale-105 transition-all duration-200 ease-in-out"
              onClick={handleBuySubscription}
              >
                 <div className="font-urbanist font-medium text-lg leading-none tracking-[0%] text-[#45FFAE] text-center">
                   Subscribe
                 </div>
            </div>
          )}

          {/* Logout Button - Only show when user is logged in */}
          {twitterUser && (
            <div 
              className="flex flex-row items-center gap-2 bg-red-500/10 border-t border-l border-red-500 rounded-lg p-2 cursor-pointer hover:bg-red-500/15 hover:scale-105 transition-all duration-200 ease-in-out"
              onClick={handleLogout}
              >
                 <div className="font-urbanist font-medium text-lg leading-none tracking-[0%] text-red-500 text-center">
                   Logout
                 </div>
            </div>
          )}

          {/* <div className="font-urbanist font-medium text-lg leading-none tracking-[0%] text-black bg-[#45FFAE] rounded-lg p-2 ml-2 text-center cursor-pointer hover:bg-[#3dff9e] hover:scale-105 transition-all duration-200 ease-in-out" >
             Connect Wallet
          </div> */}

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
          <div 
            className="backdrop-blur-lg border border-[#45FFAE]/30 h-auto w-full p-8 m-2 relative"
            style={{
              width: 'min(600px, 100%)',
              borderRadius: '30px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              background: 'rgba(0, 0, 0, 0.9)'
            }}
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
                className="w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-sm border border-[#45FFAE]/30 hover:border-[#45FFAE]/50 transition-colors cursor-pointer"
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
              className="backdrop-blur-sm border border-[#45FFAE]/20 h-full w-full"
              style={{
                borderRadius: '20px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                width: '100%'
              }}
            >
              {/* Plan Options */}
              <div className="flex flex-col gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col p-4 rounded-lg border transition-all duration-200 ease-in-out cursor-pointer ${
                      selectedPlan === plan.id
                        ? 'bg-[#45FFAE]/20 border-[#45FFAE]'
                        : 'bg-[#45FFAE]/5 border-[#45FFAE]/30 hover:bg-[#45FFAE]/10 hover:border-[#45FFAE]/50'
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {/* Plan Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedPlan === plan.id
                              ? 'border-[#45FFAE] bg-[#45FFAE]'
                              : 'border-[#45FFAE]/50'
                          }`}
                        >
                          {selectedPlan === plan.id && (
                            <div className="w-2 h-2 rounded-full bg-black"></div>
                          )}
                        </div>
                        <h3 
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 600,
                            fontSize: '18px',
                            color: '#45FFAE',
                            margin: 0
                          }}
                        >
                          {plan.name}
                        </h3>
                      </div>
                      <div 
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 700,
                          fontSize: '20px',
                          color: '#45FFAE',
                        }}
                      >
                        {plan.price}
                        <span 
                          style={{
                            fontSize: '14px',
                            fontWeight: 400,
                            color: '#45FFAE',
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
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#45FFAE',
                          opacity: 0.9,
                          marginBottom: '4px'
                        }}
                      >
                        {plan.description}
                      </div>
                      <div 
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: '12px',
                          color: '#45FFAE',
                          opacity: 0.7
                        }}
                      >
                        {plan.requests}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subscribe Button */}
              <button
                onClick={handleSubscribe}
                disabled={!selectedPlan || isSubscribing}
                className={`w-full py-3 rounded-lg font-medium transition-all ${
                  selectedPlan && !isSubscribing
                    ? 'bg-[#45FFAE]/10 border border-[#45FFAE] hover:bg-[#45FFAE]/20 cursor-pointer'
                    : 'bg-[#45FFAE]/5 border border-[#45FFAE]/30 cursor-not-allowed opacity-50'
                }`}
                style={{
                  color: '#45FFAE',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '16px',
                  fontWeight: 500,
                  marginTop: '8px'
                }}
              >
                {subcribeButtonText}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default NavBar
