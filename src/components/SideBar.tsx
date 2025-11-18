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
import cryptoTrade from "../assets/cryptoTrade.svg"
import polymarketMarket from "../assets/polymarketLogo.svg"
import { useTab } from "../contexts/TabContext"
import { useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import Setting from "./Setting"

interface SideBarProps {
  onChatClick: () => void
}

const SideBar = ({ onChatClick }: SideBarProps) => {
  const { setActiveTab } = useTab()
  const navigate = useNavigate()
  const location = useLocation()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Handle click outside to close settings
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      // Close if clicking outside the modal and not on the settings button
      if (!target.closest('[data-settings-modal]') && !target.closest('[data-settings-button]')) {
        setIsSettingsOpen(false)
      }
    }

    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSettingsOpen])

  const handleSettingsClick = () => {
    setIsSettingsOpen(!isSettingsOpen)
  }

  const handleCloseSettings = () => {
    setIsSettingsOpen(false)
  }

  return (
    <>
      <div className="bg-black h-screen w-3xs flex flex-col justify-between border-r border-gray-800">
      <img 
        className="w-30 h-10 mt-6 ml-3 cursor-pointer hover:scale-105 transition-transform duration-200 ease-in-out" 
        src={logo} 
        alt="logo" 
        onClick={() => {
          navigate('/')
          setActiveTab(null)
        }}
      />

      <div className="flex flex-col gap-2 mb-40">
      <div className="flex flex-row items-center  gap-2 bg-[#141414] rounded-lg p-2 w-56 h-12 ml-3">

<div 
  className={`flex flex-row items-center gap-1 rounded-lg p-2 cursor-pointer transition-all duration-200 ${
    location.pathname === '/polymarket'
      ? 'bg-[#292929]' 
      : 'hover:bg-[#1a1a1a]'
  }`}
  onClick={() => {
    navigate('/polymarket')
    setActiveTab('polymarket')
  }}
>
  <img src={polymarketMarket} alt="polymarket"  className="h-4 w-4"/>
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
  onClick={() => {
    navigate('/crypto')
    setActiveTab('crypto')
  }}
>
  <img src={cryptoTrade} alt="crypto"  className="h-4 w-4"/>
  <div className={`font-urbanist font-normal text-sm leading-none tracking-[0%] ${
    location.pathname === '/crypto' ? 'text-[#FFFFFF]' : 'text-[#808080]'
  }`}>Crypto</div>
</div>
</div>

<div className="flex flex-col h-40 w-56 p-2 ml-3">
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

<div className="group flex flex-row items-center justify-between gap-2 w-56 h-14 cursor-pointer hover:bg-[#1a1a1a] rounded-lg p-2 transition-all duration-200 ease-in-out" onClick={() => navigate('/points')}>
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

<div className={`group flex flex-row items-center justify-between gap-2 w-56 h-14 cursor-pointer hover:bg-[#1a1a1a] rounded-lg p-2 transition-all duration-200 ease-in-out ${
  location.pathname === '/benchmark' ? 'bg-[#1a1a1a]' : ''
}`} onClick={() => navigate('/benchmark')}>
<div className="flex flex-row items-center gap-2">
<svg className={`w-8 h-8 transition-all duration-200 ${
  location.pathname === '/benchmark' ? 'text-[#45FFAE]' : 'text-[#808080] group-hover:text-[#45FFAE]'
}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
</svg>
<div className={`font-urbanist font-normal text-sm leading-none tracking-[0%] group-hover:text-[#45FFAE] transition-colors duration-200 ${
  location.pathname === '/benchmark' ? 'text-[#45FFAE]' : 'text-[#808080]'
}`}>Benchmark</div>
</div>
<div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#45FFAE]">
<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
<path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
</svg>
</div>
</div>
</div>
      </div>

      <div className="flex flex-col w-full items-center p-2 gap-4">
        <div className="flex flex-row items-center cursor-pointer gap-2 w-56 h-14 bg-[#45FFAE]/10 border-t border-l border-[#45FFAE] rounded-lg p-2 hover:bg-[#45FFAE]/15 hover:scale-105 transition-all duration-200 ease-in-out">
          <img className="w-6 h-6" src={upgradePlan} alt="points" />
          <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#FFFFFF]">Upgrade plan</div>
        </div>

        <div className="relative flex flex-row items-center justify-between w-56 h-14 p-1 gap-2.5">
          <img className="w-8  h-8" src={userProfile} alt="logout" />
          <div className="font-urbanist font-medium text-base leading-none tracking-[0%] text-[#808080]">Username@123</div>
          <img 
            className="w-12  h-12 cursor-pointer hover:scale-110 transition-transform duration-200 ease-in-out" 
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

        <div className="flex flex-row items-center justify-center w-64 gap-6">
          <img className="w-10  h-10 cursor-pointer hover:scale-110 hover:opacity-80 transition-all duration-200 ease-in-out" src={telegram} alt="logout" />
          <img className="w-10  h-10 cursor-pointer hover:scale-110 hover:opacity-80 transition-all duration-200 ease-in-out" src={twitter} alt="logout" />
          <img className="w-10  h-10 cursor-pointer hover:scale-110 hover:opacity-80 transition-all duration-200 ease-in-out" src={discord} alt="logout" />
        </div>
      </div>
    </div>
    </>
  )
}

export default SideBar
