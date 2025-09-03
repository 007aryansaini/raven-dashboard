const NavBar = () => {
  return (
    <div className="flex flex-row items-center justify-between bg-black h-16 w-full px-4 border-b border-gray-800">
          <div className="font-urbanist font-medium text-lg leading-none tracking-[0%] text-[#45FFAE] bg-[#141414] rounded-lg p-2 ml-2 text-center" >
             Polymarket
          </div>

          <div className="font-urbanist font-medium text-lg leading-none tracking-[0%] text-black bg-[#45FFAE] rounded-lg p-2 ml-2 text-center cursor-pointer hover:bg-[#3dff9e] hover:scale-105 transition-all duration-200 ease-in-out" >
             Connect Wallet
          </div>

    </div>
  )
}

export default NavBar
