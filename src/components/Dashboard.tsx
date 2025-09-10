import { useState } from "react"
import SideBar from "./SideBar"
import ChatSideBar from "./ChatSideBar"
import NavBar from "./NavBar"
import Body from "./body"
import CryptoBody from "./CryptoBody"

type TabType = 'polymarket' | 'crypto'

const Dashboard = () => {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isSlidingOut, setIsSlidingOut] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('polymarket')

  const handleChatClick = () => {
    setIsChatOpen(true)
    setIsSlidingOut(false)
  }

  const handleBackToMenu = () => {
    setIsSlidingOut(true)
    // Wait for animation to complete before hiding
    setTimeout(() => {
      setIsChatOpen(false)
      setIsSlidingOut(false)
    }, 300)
  }

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
  }

  return (

    <div className="flex flex-row">

    <div className="flex flex-row relative overflow-hiddens">
      {/* SideBar - stays in place */}
      <div>
        <SideBar onChatClick={handleChatClick} onTabChange={handleTabChange} activeTab={activeTab} />
      </div>
      
      {/* ChatSideBar - slides in from right to left, slides out from left to right */}
      {isChatOpen && (
        <div 
          className={`absolute top-0 transition-transform duration-500 ease-in-out ${
            isSlidingOut ? 'animate-slideOut' : 'animate-slideIn'
          }`}
          style={{ 
            left: '0px',
            transform: isSlidingOut ? 'translateX(-100%)' : 'translateX(0)'
          }}
        >
          <ChatSideBar onBackToMenu={handleBackToMenu} />
        </div>
      )}
    </div>

    <div className={`flex flex-col w-full transition-colors duration-500 ${
      activeTab === 'polymarket' ? 'bg-black' : 'bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900'
    }`}>
      <NavBar />
      {activeTab === 'polymarket' ? <Body /> : <CryptoBody />}
    </div>
    </div>
  )
}

export default Dashboard
