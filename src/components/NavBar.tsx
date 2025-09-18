import walletLogo from "../assets/walletLogo.svg"
import { useAuth } from "../contexts/AuthContext"
import { useSwitchChain } from "wagmi"
import { sepolia } from "viem/chains"
const NavBar = () => {
  const { isConnected, address, connectWallet, signIn, logout, chainId, accessTokenExp, isSignedIn } = useAuth()
  const { switchChain, isPending: switching } = useSwitchChain()
  const minsLeft = accessTokenExp ? Math.max(0, Math.floor((accessTokenExp * 1000 - Date.now()) / 60000)) : undefined
  const targetChainId = sepolia.id
  const wrongChain = !!chainId && chainId !== targetChainId
  return (
    <div className="flex flex-row items-center justify-end bg-black h-16 w-full px-4 border-b border-gray-800 py-2">
          {/* <div className="font-urbanist font-medium text-lg leading-none tracking-[0%] text-[#45FFAE] bg-[#141414] rounded-lg p-2 ml-2 text-center" >
             Polymarket
          </div> */}
          {!isConnected ? (
            <button onClick={connectWallet} className="flex flex-row items-center gap-2 bg-[#45FFAE]/10 border-t border-l border-[#45FFAE] rounded-lg p-2 cursor-pointer hover:bg-[#45FFAE]/15 hover:scale-105 transition-all duration-200 ease-in-out">
              <img src={walletLogo} alt="logo"  className="h-6 w-6"/>
              <div className="font-urbanist font-medium text-lg leading-none tracking-[0%] text-[#45FFAE] text-center">Connect Wallet</div>
            </button>
          ) : (
            <div className="flex flex-row items-center gap-3">
              {wrongChain ? (
                <button
                  onClick={() => switchChain({ chainId: targetChainId })}
                  disabled={switching}
                  className={`flex flex-row items-center gap-2 bg-yellow-500/10 border-t border-l border-yellow-500 rounded-lg p-2 ${switching ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-yellow-500/20 hover:scale-105 transition-all duration-200 ease-in-out'}`}
                >
                  <div className="font-urbanist font-medium text-lg leading-none tracking-[0%] text-yellow-400 text-center">Switch to Sepolia</div>
                </button>
              ) : (
                <button onClick={signIn} disabled={isSignedIn} className={`flex flex-row items-center gap-2 bg-[#45FFAE]/10 border-t border-l border-[#45FFAE] rounded-lg p-2 ${isSignedIn ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[#45FFAE]/15 hover:scale-105 transition-all duration-200 ease-in-out'}`}>
                <img src={walletLogo} alt="logo"  className="h-6 w-6"/>
                <div className="font-urbanist font-medium text-lg leading-none tracking-[0%] text-[#45FFAE] text-center">{isSignedIn ? 'Signed In' : 'Sign In'}</div>
              </button>
              )}
              <div className="text-[#45FFAE] font-urbanist text-sm">{address?.slice(0,6)}...{address?.slice(-4)}</div>
              {chainId ? (
                <div className={`text-xs ${wrongChain ? 'text-yellow-400 border-yellow-500' : 'text-gray-300'} bg-gray-800 rounded px-2 py-1`}>chain {chainId}{minsLeft !== undefined ? ` · ${minsLeft}m` : ''}</div>
              ) : null}
              <button onClick={logout} className="text-gray-400 hover:text-white text-sm">Logout</button>
            </div>
          )}

          {/* <div className="font-urbanist font-medium text-lg leading-none tracking-[0%] text-black bg-[#45FFAE] rounded-lg p-2 ml-2 text-center cursor-pointer hover:bg-[#3dff9e] hover:scale-105 transition-all duration-200 ease-in-out" >
             Connect Wallet
          </div> */}

    </div>
  )
}

export default NavBar