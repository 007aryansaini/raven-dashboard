import { useLocation } from "react-router-dom"
import SideBar from "./SideBar"
import NavBar from "./NavBar"
import Body from "./body"
import CryptoBody from "./CryptoBody"
import Points from "./Points"
import Home from "./Home"
import Benchmark from "./Benchmark"

const Dashboard = () => {
  const location = useLocation()

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-white">
      <div className="relative flex h-full">
        {/* SideBar - stays in place */}
        <SideBar />
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
