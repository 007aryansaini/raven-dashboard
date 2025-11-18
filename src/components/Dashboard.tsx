import { useState } from "react"
import { useLocation } from "react-router-dom"
import SideBar from "./SideBar"
import ChatSideBar from "./ChatSideBar"
import NavBar from "./NavBar"
import Body from "./body"
import CryptoBody from "./CryptoBody"
import Points from "./Points"
import Home from "./Home"
import Benchmark from "./Benchmark"

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
    <div className="flex h-screen w-screen overflow-hidden bg-black text-white">
      <div className="relative flex h-full">
        {/* SideBar - stays in place */}
        <SideBar onChatClick={handleChatClick} />

        {/* ChatSideBar - slides over the sidebar */}
        {isChatOpen && (
          <div
            className={`absolute inset-y-0 left-0 z-20 transition-transform duration-500 ease-in-out ${
              isSlidingOut ? 'animate-slideOut' : 'animate-slideIn'
            }`}
            style={{
              transform: isSlidingOut ? 'translateX(-100%)' : 'translateX(0)',
            }}
          >
            <ChatSideBar onBackToMenu={handleBackToMenu} />
          </div>
        )}
      </div>

      <div className="flex h-full min-w-0 flex-1 flex-col">
        <NavBar />
        <main className="flex-1 overflow-y-auto bg-black">
          {location.pathname === '/points' ? (
            <Points />
          ) : location.pathname === '/polymarket' ? (
            <Body />
          ) : location.pathname === '/crypto' ? (
            <CryptoBody />
          ) : location.pathname === '/score' ? (
            <Benchmark />
          ) : (
            <Home />
          )}
        </main>
      </div>
    </div>
  )
}

export default Dashboard
