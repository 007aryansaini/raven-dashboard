import { Edit3, Users, Gift, Bell, Moon, Coins, HelpCircle, ChevronRight, LogOut } from "lucide-react"
import userProfile from "../assets/userProfile.svg"
import { signOut, onAuthStateChanged, type User } from "firebase/auth"
import { auth } from '../firebase'
import { toast } from 'react-toastify'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface SettingProps {
  onClose: () => void
}

const Setting = ({ onClose }: SettingProps) => {
  const [twitterUser, setTwitterUser] = useState<User | null>(null)

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
        setTwitterUser(user);
      } else {
        setTwitterUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast.success('Logged out successfully', {
        style: { fontSize: '12px' }
      })
      onClose() // Close the settings modal after logout
    } catch (error: any) {
      toast.error(`Logout failed: ${error.message}`, {
        style: { fontSize: '12px' }
      })
    }
  }

  const username = getTwitterUsername(twitterUser)
  
  const modalContent = (
    <div 
      className="fixed bg-[#1f1f1f] rounded-lg p-4 w-65 shadow-2xl border border-gray-700" 
      style={{ 
        bottom: '45px', 
        left: '202px',
        zIndex: 99999
      }}
      data-settings-modal
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-600">
        <div className="flex items-center gap-3">
          <img 
            src={twitterUser?.photoURL || userProfile} 
            alt="user profile" 
            className="w-8 h-8 rounded-full object-cover" 
          />
          <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#808080]">
            {username}
          </div>
        </div>
        <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-white transition-colors" />
      </div>

      {/* Profile Section */}
      <div className="mb-6">
        <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#808080] mb-3">Profile</div>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#808080]">Socials</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center justify-between p-2 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <Gift className="w-4 h-4 text-gray-400" />
              <span className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#808080]">Referral</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* General Section */}
      <div>
        <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#808080] mb-3">General</div>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-gray-400" />
              <span className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#808080]">Notifications</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-2 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <Moon className="w-4 h-4 text-gray-400" />
              <span className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#808080]">Switch to light mode</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-2 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <Coins className="w-4 h-4 text-gray-400" />
              <span className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#808080]">Currency</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-2 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-4 h-4 text-gray-400" />
              <span className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#808080]">Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Section */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <div 
          className="flex items-center justify-between p-2 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors"
          onClick={handleLogout}
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-4 h-4 text-red-500" />
            <span className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-red-500">Logout</span>
          </div>
        </div>
      </div>
    </div>
  )

  // Render modal using portal to ensure it's above all content
  if (typeof window === 'undefined') {
    return null
  }

  return createPortal(modalContent, document.body)
}

export default Setting
