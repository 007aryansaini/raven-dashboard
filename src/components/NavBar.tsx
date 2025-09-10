import walletLogo from "../assets/walletLogo.svg"
const NavBar = () => {
  return (
    <div className="flex flex-row items-center justify-end bg-black h-16 w-full px-4 border-b border-gray-800 py-2">
          {/* <div className="font-urbanist font-medium text-lg leading-none tracking-[0%] text-[#45FFAE] bg-[#141414] rounded-lg p-2 ml-2 text-center" >
             Polymarket
          </div> */}


          <div className="flex flex-row items-center gap-2 bg-[#45FFAE]/10 border-t border-l border-[#45FFAE] rounded-lg p-2 cursor-pointer hover:bg-[#45FFAE]/15 hover:scale-105 transition-all duration-200 ease-in-out">
             <img src={walletLogo} alt="logo"  className="h-6 w-6"/>
             <div className="font-urbanist font-medium text-lg leading-none tracking-[0%] text-[#45FFAE] text-center">
             Connect Wallet
             </div>
          </div>

          {/* <div className="font-urbanist font-medium text-lg leading-none tracking-[0%] text-black bg-[#45FFAE] rounded-lg p-2 ml-2 text-center cursor-pointer hover:bg-[#3dff9e] hover:scale-105 transition-all duration-200 ease-in-out" >
             Connect Wallet
          </div> */}

    </div>
  )
}

export default NavBar
