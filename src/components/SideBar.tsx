import logo from "../assets/logo.svg"
import chat from "../assets/chat.svg"
import vaults from "../assets/vault.svg"
import points from "../assets/points.svg"
import upgradePlan from "../assets/upgradePlan.svg"
import userProfile from "../assets/userProfile.svg"
import settings from "../assets/settings.svg"
import telegram from "../assets/telegram.svg"
import twitter from "../assets/twitter.svg"
import discord from "../assets/discord.svg"

interface SideBarProps {
  onChatClick: () => void
}

const SideBar = ({ onChatClick }: SideBarProps) => {

  return (
    <div className="bg-black h-screen w-3xs flex flex-col justify-between border-r border-gray-800">
      <img className="w-30 h-10 mt-6 ml-3 cursor-pointer hover:scale-105 transition-transform duration-200 ease-in-out" src={logo} alt="logo" />

      <div className="flex flex-col h-40 w-56 p-2 ml-3 mb-40">
        <div className="group flex flex-row items-center justify-between gap-2 w-56 h-14 cursor-pointer hover:bg-[#1a1a1a] rounded-lg p-2 transition-all duration-200 ease-in-out" onClick={onChatClick}>
          <div className="flex flex-row items-center gap-2">
            <img className="w-8 h-8 group-hover:fill-[#45FFAE] transition-all duration-200" src={chat} alt="chat" />
            <div className="font-urbanist font-normal text-sm leading-none tracking-[0%] group-hover:text-[#45FFAE] text-[#808080] transition-colors duration-200">Chat</div>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#45FFAE]">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        <div className="group flex flex-row items-center justify-between gap-2 w-56 h-14 cursor-pointer hover:bg-[#1a1a1a] rounded-lg p-2 transition-all duration-200 ease-in-out">
          <div className="flex flex-row items-center gap-2">
            <img className="w-8 h-8 group-hover:fill-[#45FFAE] transition-all duration-200" src={vaults} alt="vaults" />
            <div className="font-urbanist font-normal text-sm leading-none tracking-[0%] group-hover:text-[#45FFAE] text-[#808080] transition-colors duration-200">Vaults</div>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#45FFAE]">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        <div className="group flex flex-row items-center justify-between gap-2 w-56 h-14 cursor-pointer hover:bg-[#1a1a1a] rounded-lg p-2 transition-all duration-200 ease-in-out">
          <div className="flex flex-row items-center gap-2">
            <img className="w-8 h-8 group-hover:fill-[#45FFAE] transition-all duration-200" src={points} alt="points" />
            <div className="font-urbanist font-normal text-sm leading-none tracking-[0%] group-hover:text-[#45FFAE] text-[#808080] transition-colors duration-200">Points</div>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#45FFAE]">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full items-center p-2 gap-4">
        <div className="flex flex-row items-center cursor-pointer gap-2 w-56 h-14 bg-[#45FFAE]/4 border-t border-l border-[#45FFAE] rounded-lg p-2 hover:bg-[#45FFAE]/8 hover:scale-105 transition-all duration-200 ease-in-out">
          <img className="w-6 h-6" src={upgradePlan} alt="points" />
          <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#FFFFFF]">Upgrade plan</div>
        </div>

        <div className="flex flex-row items-center justify-between w-56 h-14 p-1 gap-2.5">
          <img className="w-8  h-8" src={userProfile} alt="logout" />
          <div className="font-urbanist font-medium text-base leading-none tracking-[0%] text-[#808080]">Username@123</div>
          <img className="w-12  h-12 cursor-pointer hover:scale-110 transition-transform duration-200 ease-in-out" src={settings} alt="logout" />
        </div>

        <div className="flex flex-row items-center justify-center w-64 gap-6">
          <img className="w-10  h-10 cursor-pointer hover:scale-110 hover:opacity-80 transition-all duration-200 ease-in-out" src={telegram} alt="logout" />
          <img className="w-10  h-10 cursor-pointer hover:scale-110 hover:opacity-80 transition-all duration-200 ease-in-out" src={twitter} alt="logout" />
          <img className="w-10  h-10 cursor-pointer hover:scale-110 hover:opacity-80 transition-all duration-200 ease-in-out" src={discord} alt="logout" />
        </div>
      </div>
    </div>
  )
}

export default SideBar
