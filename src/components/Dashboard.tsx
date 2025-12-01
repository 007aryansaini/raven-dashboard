import { useLocation } from "react-router-dom"
import { useState } from "react"
import SideBar from "./SideBar"
import NavBar from "./NavBar"
import Body from "./body"
import CryptoBody from "./CryptoBody"
import Points from "./Points"
import Home from "./Home"
import Benchmark from "./Benchmark"
import MathematicalAccuracy from "./MathematicalAccuracy"

const Dashboard = () => {
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-white">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SideBar - Hidden on mobile, visible on desktop */}
      <div className={`fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <SideBar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <div className="flex h-full min-w-0 flex-1 flex-col w-full lg:w-auto">
        <NavBar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-black">
          {location.pathname === '/points' ? (
            <Points />
          ) : location.pathname === '/polymarket' ? (
            <Body />
          ) : location.pathname === '/crypto' || location.pathname === '/' ? (
            <CryptoBody />
          ) : location.pathname === '/score' ? (
            <Benchmark />
          ) : location.pathname === '/mathematical-accuracy' ? (
            <MathematicalAccuracy />
          ) : (
            <Home />
          )}
        </main>
      </div>
    </div>
  )
}

export default Dashboard
