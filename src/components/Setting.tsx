import { Edit3, Users, Gift, Bell, Moon, Coins, HelpCircle, ChevronRight } from "lucide-react"
import userProfile from "../assets/userProfile.svg"

interface SettingProps {
  onClose: () => void
}

const Setting = ({ onClose: _onClose }: SettingProps) => {
  return (
    <div 
      className="absolute z-50 bg-[#1f1f1f] rounded-lg p-4 w-65 shadow-2xl border border-gray-700" 
      style={{ 
        position: 'absolute', 
        bottom: '45px', 
        left: '202px' 
      }}
      data-settings-modal
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-600">
        <div className="flex items-center gap-3">
          <img src={userProfile} alt="user profile" className="w-8 h-8 rounded" />
          <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#808080]">Username@123</div>
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
    </div>
  )
}

export default Setting
