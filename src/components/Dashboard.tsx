import { useState } from "react"
import { useLocation } from "react-router-dom"
import SideBar from "./SideBar"
import ChatSideBar from "./ChatSideBar"
import NavBar from "./NavBar"
import Body from "./body"
import CryptoBody from "./CryptoBody"
import Points from "./Points"
import Home from "./Home"

const Dashboard = () => {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isSlidingOut, setIsSlidingOut] = useState(false)
  const location = useLocation()

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


  return (

    <div className="flex flex-row">

    <div className="flex flex-row relative overflow-hiddens">
      {/* SideBar - stays in place */}
      <div>
        <SideBar onChatClick={handleChatClick} />
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

    <div className="flex flex-col w-full bg-black">
      <NavBar />
      {location.pathname === '/points' ? <Points /> : 
       location.pathname === '/polymarket' ? <Body /> :
       location.pathname === '/crypto' ? <CryptoBody /> :
       <Home />}
    </div>
    </div>
  )
}

export default Dashboard
