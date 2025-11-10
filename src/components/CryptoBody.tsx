import { ArrowUp, MoveRight } from "lucide-react"
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
    <div className="relative flex min-h-full flex-col items-center justify-between gap-10 px-4 py-8 sm:px-6 lg:px-10" 
         style={{
           background: `
             radial-gradient(circle at center, rgba(69, 255, 174, 0.1) 0%, rgba(0, 0, 0, 0.8) 70%, rgba(0, 0, 0, 1) 100%),
             linear-gradient(90deg, rgba(69, 255, 174, 0.05) 1px, transparent 1px),
             linear-gradient(rgba(69, 255, 174, 0.05) 1px, transparent 1px)
           `,
           backgroundSize: '100% 100%, 60px 60px, 60px 60px',
           backgroundColor: '#000000'
         }}>
           <div className="flex flex-col items-center gap-3 text-center">
                 <div className="font-urbanist font-medium text-3xl leading-tight tracking-[0%] text-[#FFFFFF] sm:text-4xl">
                   {activeTab === 'polymarket' ? 'Polymarket Predictions' : 'Crypto Market Predictions'}
                 </div>
                <div className="flex w-full flex-row items-center justify-center">
                 <div className="mt-2 flex w-auto items-center gap-3 rounded-full border border-gray-500 px-4 py-2">
                    <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#4f4f4f] p-1 bg-[#45FFAE] h-fit bg-opacity-50 rounded-full text-center">Raven</div>
                    <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#E0E0E0]">I predict what the market hasn't priced yet.</div>
                 </div>
                 </div>

           </div>

           {/* Crypto Prediction Cards */}
           <div className="w-full max-w-5xl">
             <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
               {[
                 'What will the BTC price be in the next 5 mins?',
                 'Where will BTC close by the end of this month?',
                 'Will ETH outperform BTC this week?',
                 'When will ETH cross $5K this month?',
                 'Why could ETH drop below $3K in the next 24 hours?',
                 'Is SOL likely to break new highs this quarter?',
               ].map((question) => (
                 <button
                   key={question}
                   className="group flex h-full w-full items-center justify-between gap-3 rounded-2xl border border-[#282828] bg-[#1A1A1A]/80 px-4 py-3 text-left transition-all duration-200 hover:-translate-y-1 hover:bg-[#2A2A2A]"
                   type="button"
                 >
                   <span className="font-urbanist text-sm font-medium text-white">{question}</span>
                   <MoveRight className="h-4 w-4 text-white transition-transform group-hover:translate-x-1" />
                 </button>
               ))}
             </div>
           </div>




           <div className="flex w-full max-w-5xl flex-col gap-4 rounded-3xl bg-[#141414] p-6">
               
               <div className="flex flex-row items-center justify-between gap-3">
                       <div className="flex flex-row items-center gap-2">
                            <img src={bolt} alt="bolt"  className="h-3 w-3"/>
                            <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#808080]">Unlock more with paid plans</div>
                            <MoveRight className="text-[#808080] text-center h-4 w-4"/>
                       </div>

               </div>



         <div className="flex w-full flex-col items-start justify-between gap-4 rounded-2xl bg-[#1A1A1A] p-4 sm:flex-row sm:items-center sm:p-6">

            <div className="flex flex-1 items-center gap-3">
                <img src={blackDot} alt="history" className="h-4 w-4 flex-shrink-0"/>
                <div className="font-urbanist font-medium text-base text-[#3E3E3E]">|</div>
                <input 
                  ref={inputRef}
                  type="text" 
                  placeholder="Ask me anything" 
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-transparent font-urbanist text-base font-medium text-[#FFFFFF] placeholder-[#3E3E3E] focus:outline-none"
                />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 ${
                inputValue.trim()
                  ? 'border-[#45FFAE] bg-[#45FFAE]/10 text-[#45FFAE] hover:bg-[#45FFAE]/20'
                  : 'border-transparent bg-[#2A2A2A] text-[#808080]'}`}
              aria-label="Submit query"
              disabled={!inputValue.trim()}
            >
              <ArrowUp className="h-5 w-5" />
            </button>

         </div>

         <div className="flex flex-wrap items-center justify-start gap-3">

              <div className="relative" ref={dropdownRef}>
                <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-black/70 px-4 py-2 transition-all hover:bg-black/80" onClick={() => setIsDropdownOpen(prev => !prev)}>
                  <img src={cryptoTrade} alt="crypto" className="h-4 w-4"/>
                  <div className="font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">Crypto</div>
                  <ArrowUp className={`h-4 w-4 text-[#808080] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}/>
                </button>

                {isDropdownOpen && (
                  <div className="absolute bottom-full left-0 z-50 mb-3 w-48 rounded-xl border border-gray-700 bg-[#1A1A1A] p-1 shadow-xl">
                    <div className="max-h-48 overflow-y-auto rounded-lg bg-[#121212]">
                      <div className="cursor-pointer rounded-t-lg px-4 py-2 text-center font-urbanist text-sm text-[#E0E0E0] hover:bg-[#222]" onClick={() => { setIsDropdownOpen(false); navigate('/polymarket') }}>Polymarket</div>
                      <div className="cursor-default rounded-b-lg bg-[#222] px-4 py-2 text-center font-urbanist text-sm text-[#E0E0E0]">Crypto</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Timeframe Dropdown */}
              <div className="relative" ref={tfRef}>
                <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-black/70 px-4 py-2 transition-all hover:bg-black/80" onClick={() => setIsTfOpen(prev => !prev)}>
                  <div className="font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">{selectedTimeframe ?? 'Timeframe'}</div>
                  <ArrowUp className={`h-4 w-4 text-[#808080] transition-transform ${isTfOpen ? 'rotate-180' : ''}`}/>
                </button>
                {isTfOpen && (
                  <div className="absolute bottom-full left-0 z-50 mb-3 w-48 rounded-xl border border-gray-700 bg-[#1A1A1A] p-1 shadow-xl">
                    <div className="max-h-48 overflow-y-auto rounded-lg bg-[#121212]">
                      {['1m','5m','15m','1h','4h','12h','24h','3d','7d','30d','90d','YTD','1y'].map(v => (
                        <div key={v} className="px-4 py-2 text-center font-urbanist text-sm text-[#E0E0E0] hover:bg-[#222] cursor-pointer" onClick={() => { setSelectedTimeframe(v); setIsTfOpen(false) }}>{v}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Analysis Dropdown */}
              <div className="relative" ref={analysisRef}>
                <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-black/70 px-4 py-2 transition-all hover:bg-black/80" onClick={() => setIsAnalysisOpen(prev => !prev)}>
                  <div className="font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">{selectedAnalysis ?? 'Analysis'}</div>
                  <ArrowUp className={`h-4 w-4 text-[#808080] transition-transform ${isAnalysisOpen ? 'rotate-180' : ''}`}/>
                </button>
                {isAnalysisOpen && (
                  <div className="absolute bottom-full left-0 z-50 mb-3 w-48 rounded-xl border border-gray-700 bg-[#1A1A1A] p-1 shadow-xl">
                    <div className="max-h-48 overflow-y-auto rounded-lg bg-[#121212]">
                      {['AI signals','On-chain','Macro','Sentiment','Technical','Fundamental','News','Community'].map(v => (
                        <div key={v} className="px-4 py-2 text-center font-urbanist text-sm text-[#E0E0E0] hover:bg-[#222] cursor-pointer" onClick={() => { setSelectedAnalysis(v); setIsAnalysisOpen(false) }}>{v}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Assets Dropdown */}
              <div className="relative" ref={assetsRef}>
                <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-black/70 px-4 py-2 transition-all hover:bg-black/80" onClick={() => setIsAssetsOpen(prev => !prev)}>
                  <div className="font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">{selectedAsset ?? 'Assets'}</div>
                  <ArrowUp className={`h-4 w-4 text-[#808080] transition-transform ${isAssetsOpen ? 'rotate-180' : ''}`}/>
                </button>
                {isAssetsOpen && (
                  <div className="absolute bottom-full left-0 z-50 mb-3 w-48 rounded-xl border border-gray-700 bg-[#1A1A1A] p-1 shadow-xl">
                    <div className="max-h-48 overflow-y-auto rounded-lg bg-[#121212]">
                      {['BTC','ETH','SOL','XRP'].map(v => (
                        <div key={v} className="px-4 py-2 text-center font-urbanist text-sm text-[#E0E0E0] hover:bg-[#222] cursor-pointer" onClick={() => { setSelectedAsset(v); setIsAssetsOpen(false) }}>{v}</div>
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
