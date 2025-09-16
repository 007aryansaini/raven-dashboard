import { ArrowDown, ArrowUp, MoveRight } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import bolt from "../assets/bolt.svg"
import blackDot from "../assets/blackDot.svg"
import cryptoTrade from "../assets/cryptoTrade.svg"
import { useTab } from "../contexts/TabContext"

const body = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState("")
  const { activeTab } = useTab()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isTfOpen, setIsTfOpen] = useState(false)
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false)
  const [isAssetsOpen, setIsAssetsOpen] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState<string | null>(null)
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const tfRef = useRef<HTMLDivElement>(null)
  const analysisRef = useRef<HTMLDivElement>(null)
  const assetsRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const anyOpen = isDropdownOpen || isTfOpen || isAnalysisOpen || isAssetsOpen
    if (!anyOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (
        (dropdownRef.current && dropdownRef.current.contains(target)) ||
        (tfRef.current && tfRef.current.contains(target)) ||
        (analysisRef.current && analysisRef.current.contains(target)) ||
        (assetsRef.current && assetsRef.current.contains(target))
      ) {
        return
      }
      setIsDropdownOpen(false)
      setIsTfOpen(false)
      setIsAnalysisOpen(false)
      setIsAssetsOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false)
        setIsTfOpen(false)
        setIsAnalysisOpen(false)
        setIsAssetsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDropdownOpen, isTfOpen, isAnalysisOpen, isAssetsOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleSubmit = () => {
    if (inputValue.trim()) {
      console.log("Submitted:", inputValue)
      // Add your submission logic here
      setInputValue("")
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }


  return (
    <div className="flex flex-col h-full items-center justtify-between py-4 gap-4 relative" 
         style={{
           background: `
             radial-gradient(circle at center, rgba(69, 255, 174, 0.1) 0%, rgba(0, 0, 0, 0.8) 70%, rgba(0, 0, 0, 1) 100%),
             linear-gradient(90deg, rgba(69, 255, 174, 0.05) 1px, transparent 1px),
             linear-gradient(rgba(69, 255, 174, 0.05) 1px, transparent 1px)
           `,
           backgroundSize: '100% 100%, 60px 60px, 60px 60px',
           backgroundColor: '#000000'
         }}>
           <div className="flex flex-col gap-2.5 items-center">
                 <div className="font-urbanist font-medium text-3xl leading-none tracking-[0%] text-[#FFFFFF] text-center">
                   {activeTab === 'polymarket' ? 'Polymarket Predictions' : 'Crypto Market Predictions'}
                 </div>
                <div className="w-full flex flex-row justify-center items-center">
                 <div className="flex flex-row border border-gray-500 w-fit h-9 rounded-full mt-2 gap-3 items-center px-3 py-1.5">
                    <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#4f4f4f] p-1 bg-[#45FFAE] h-fit bg-opacity-50 rounded-full text-center">Raven</div>
                    <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#E0E0E0]">I predict what the market hasn't priced yet.</div>
                 </div>
                 </div>

           </div>

           {/* Crypto Prediction Cards */}
           <div className="w-5xl">
             <div className="flex flex-col gap-5 w-full h-96 p-4 items-center justify-center">
               {/* Question Cards Grid - Centered Container */}
               <div className="flex flex-col gap-3.5 items-center">
                 {/* First Row */}
                 <div className="flex flex-row gap-2">
                   <div className="bg-[#1A1A1A] border border-[#282828] rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-[#2A2A2A] transition-all duration-200 w-fit">
                     <span className="text-white font-urbanist font-medium text-sm">What will the BTC price be in the next 5 mins?</span>
                     <MoveRight className="text-white h-4 w-4 ml-2" />
                   </div>
                   <div className="bg-[#1A1A1A] border border-[#282828] rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-[#2A2A2A] transition-all duration-200 w-fit">
                     <span className="text-white font-urbanist font-medium text-sm">Where will BTC close by the end of this month?</span>
                     <MoveRight className="text-white h-4 w-4 ml-2" />
                   </div>
                 </div>
                 
                 {/* Second Row */}
                 <div className="flex flex-row gap-2">
                   <div className="bg-[#1A1A1A] border border-[#282828] rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-[#2A2A2A] transition-all duration-200 w-fit">
                     <span className="text-white font-urbanist font-medium text-sm">Will ETH outperform BTC this week?</span>
                     <MoveRight className="text-white h-4 w-4 ml-2" />
                   </div>
                   <div className="bg-[#1A1A1A] border border-[#282828] rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-[#2A2A2A] transition-all duration-200 w-fit">
                     <span className="text-white font-urbanist font-medium text-sm">When will ETH cross $5K this month?</span>
                     <MoveRight className="text-white h-4 w-4 ml-2" />
                   </div>
                 </div>
                 
                 {/* Third Row - Centered */}
                 <div className="flex flex-row">
                   <div className="bg-[#1A1A1A] border border-[#282828] rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-[#2A2A2A] transition-all duration-200 w-fit">
                     <span className="text-white font-urbanist font-medium text-sm">Why could ETH drop below $3K in the next 24 hours?</span>
                     <MoveRight className="text-white h-4 w-4 ml-2" />
                   </div>
                 </div>
               </div>
             </div>
             {/* Spacer for pagination dots area */}
             <div className="flex justify-center mt-4 gap-1.5">
               <div className="w-2.5 h-2.5"></div>
             </div>
           </div>




           <div className="flex flex-col gap-3.5 w-5xl h-40 bg-[#141414] rounded-lg p-4 justify-between">
               
               <div className="flex flex-row items-center justify-between">
                       <div className="flex flex-row gap-2 items-center">
                            <img src={bolt} alt="bolt"  className="h-3 w-3"/>
                            <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#808080]">Unlock more with paid plans</div>
                            <MoveRight className="text-[#808080] text-center h-4 w-4"/>
                       </div>

               </div>



          <div className="h-28 w-full bg-[#1A1A1A] rounded-lg flex flex-row p-2 items-start justify-between" >

            <div className="flex flex-row items-center justify-between gap-2 flex-1">
                <img src={blackDot} alt="history" className="h-4 w-4"/>
                <div className="font-urbanist font-medium text-base  text-[#3E3E3E]">|</div>
                <input 
                  ref={inputRef}
                  type="text" 
                  placeholder="Ask me anything" 
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="font-urbanist font-medium text-base text-[#FFFFFF] bg-transparent outline-none focus:outline-none focus:ring-0 focus:border-none flex-1 placeholder-[#3E3E3E]"
                />
            </div>

            <ArrowUp 
              className={`h-4 w-4 cursor-pointer transition-all duration-200 ${inputValue.trim() ? 'text-[#45FFAE] hover:scale-110' : 'text-[#808080]'}`} 
              onClick={handleSubmit}
            />

         </div>

         <div className="flex flex-row items-center justify-start gap-4">

              <div className="relative" ref={dropdownRef}>
                <button className="flex flex-row items-center justify-center gap-2 bg-black bg-opacity-70 rounded-lg px-3 py-2 cursor-pointer w-fit h-10 hover:bg-opacity-80" onClick={() => setIsDropdownOpen(prev => !prev)}>
                  <img src={cryptoTrade} alt="crypto" className="h-4 w-4"/>
                  <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#FFFFFF]">Crypto</div>
                  <ArrowDown className={`text-[#808080] h-3 w-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}/>
                </button>

                {isDropdownOpen && (
                  <div className="absolute mt-4 left-0 z-50 w-36 bg-[#1A1A1A] border border-gray-700 rounded-lg shadow-xl p-1">
                    <div className="bg-[#121212] rounded-md max-h-16 overflow-y-auto">
                      <div className="px-3 py-2 cursor-pointer hover:bg-[#222] text-[#E0E0E0] font-urbanist text-sm rounded-t-md text-center" onClick={() => { setIsDropdownOpen(false); navigate('/polymarket') }}>Polymarket</div>
                      <div className="px-3 py-2 text-[#E0E0E0] font-urbanist text-sm rounded-b-md cursor-default bg-[#222] text-center">Crypto</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Timeframe Dropdown */}
              <div className="relative" ref={tfRef}>
                <button className="flex flex-row items-center justify-center gap-2 bg-black bg-opacity-70 rounded-lg px-3 py-2 cursor-pointer w-fit h-10 hover:bg-opacity-80" onClick={() => setIsTfOpen(prev => !prev)}>
                  <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#FFFFFF]">{selectedTimeframe ?? 'Timeframe'}</div>
                  <ArrowDown className={`text-[#808080] h-3 w-3 transition-transform ${isTfOpen ? 'rotate-180' : ''}`}/>
                </button>
                {isTfOpen && (
                  <div className="absolute mt-4 left-0 z-50 w-36 bg-[#1A1A1A] border border-gray-700 rounded-lg shadow-xl p-1">
                    <div className="bg-[#121212] rounded-md max-h-16 overflow-y-auto">
                      {['1m','5m','15m','1h','4h','12h','24h','3d','7d','30d','90d','YTD','1y'].map(v => (
                        <div key={v} className="px-3 py-2 cursor-pointer hover:bg-[#222] text-[#E0E0E0] font-urbanist text-sm text-center" onClick={() => { setSelectedTimeframe(v); setIsTfOpen(false) }}>{v}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Analysis Dropdown */}
              <div className="relative" ref={analysisRef}>
                <button className="flex flex-row items-center justify-center gap-2 bg-black bg-opacity-70 rounded-lg px-3 py-2 cursor-pointer w-fit h-10 hover:bg-opacity-80" onClick={() => setIsAnalysisOpen(prev => !prev)}>
                  <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#FFFFFF]">{selectedAnalysis ?? 'Analysis'}</div>
                  <ArrowDown className={`text-[#808080] h-3 w-3 transition-transform ${isAnalysisOpen ? 'rotate-180' : ''}`}/>
                </button>
                {isAnalysisOpen && (
                  <div className="absolute mt-4 left-0 z-50 w-36 bg-[#1A1A1A] border border-gray-700 rounded-lg shadow-xl p-1">
                    <div className="bg-[#121212] rounded-md max-h-16 overflow-y-auto">
                      {['AI signals','On-chain','Macro','Sentiment','Technical','Fundamental','News','Community'].map(v => (
                        <div key={v} className="px-3 py-2 cursor-pointer hover:bg-[#222] text-[#E0E0E0] font-urbanist text-sm text-center" onClick={() => { setSelectedAnalysis(v); setIsAnalysisOpen(false) }}>{v}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Assets Dropdown */}
              <div className="relative" ref={assetsRef}>
                <button className="flex flex-row items-center justify-center gap-2 bg-black bg-opacity-70 rounded-lg px-3 py-2 cursor-pointer w-fit h-10 hover:bg-opacity-80" onClick={() => setIsAssetsOpen(prev => !prev)}>
                  <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#FFFFFF]">{selectedAsset ?? 'Assets'}</div>
                  <ArrowDown className={`text-[#808080] h-3 w-3 transition-transform ${isAssetsOpen ? 'rotate-180' : ''}`}/>
                </button>
                {isAssetsOpen && (
                  <div className="absolute mt-4 left-0 z-50 w-36 bg-[#1A1A1A] border border-gray-700 rounded-lg shadow-xl p-1">
                    <div className="bg-[#121212] rounded-md max-h-16 overflow-y-auto">
                      {['BTC','ETH','SOL','XRP'].map(v => (
                        <div key={v} className="px-3 py-2 cursor-pointer hover:bg-[#222] text-[#E0E0E0] font-urbanist text-sm text-center" onClick={() => { setSelectedAsset(v); setIsAssetsOpen(false) }}>{v}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

         </div>



           </div>
    </div>
  )
}

export default body
