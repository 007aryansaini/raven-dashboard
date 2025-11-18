import { ArrowUp, MoveRight } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAccount } from 'wagmi'
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from '../firebase'
import { toast } from 'react-toastify'
import bolt from "../assets/bolt.svg"
import blackDot from "../assets/blackDot.svg"
import cryptoTrade from "../assets/cryptoTrade.svg"
import { useTab } from "../contexts/TabContext"
import { createChart, ColorType } from "lightweight-charts"

type ChatMessage = {
  id: number
  role: "user" | "assistant"
  content: string
  chartType?: "btc"
}

const body = () => {
  const { isConnected } = useAccount()
  const [twitterUser, setTwitterUser] = useState<User | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [inputValue, setInputValue] = useState("")
  const { activeTab } = useTab()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isTfOpen, setIsTfOpen] = useState(false)
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false)
  const [isAssetsOpen, setIsAssetsOpen] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState<string | null>(null)
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const tfRef = useRef<HTMLDivElement>(null)
  const analysisRef = useRef<HTMLDivElement>(null)
  const assetsRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setTwitterUser(user)
      } else {
        setTwitterUser(null)
      }
    })
    return () => unsubscribe()
  }, [])

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const appendAssistantMessage = (question: string) => {
    const response = `Working on that crypto insight for you. Here's a placeholder response for "${question}".`
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 1,
        role: "assistant",
        content: response,
      },
    ])
  }

  const handleSubmit = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) {
      return
    }

    // Validate user is logged in with Twitter
    if (!twitterUser) {
      toast.warning('Please login with X (Twitter) to send messages', {
        style: { fontSize: '12px' }
      })
      return
    }

    // Validate wallet is connected
    if (!isConnected) {
      toast.warning('Please connect your wallet to send messages', {
        style: { fontSize: '12px' }
      })
      return
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: trimmed,
    }

    const isChartRequest = /price chart/i.test(trimmed)

    if (isChartRequest) {
      const assistantMessages: ChatMessage[] = [
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "BTC price snapshot (sample data).",
          chartType: "btc",
        },
      ]

      setMessages((prev) => [...prev, userMessage, ...assistantMessages])
      setInputValue("")
      return
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    setTimeout(() => {
      appendAssistantMessage(trimmed)
    }, 500)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className={`relative flex h-full flex-col items-center ${messages.length === 0 ? 'justify-between' : 'justify-start'} gap-10 px-4 py-8 sm:px-6 lg:px-10 overflow-hidden`}
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
                {messages.length === 0 && (
                  <>
                    <div className="font-urbanist font-medium text-3xl leading-none tracking-[0%] text-[#FFFFFF] text-center">
                      {activeTab === 'polymarket' ? 'Polymarket Predictions' : 'Crypto Market Predictions'}
                    </div>
                   <div className="w-full flex flex-row justify-center items-center">
                     <div className="flex flex-row border border-gray-500 w-fit h-9 rounded-full mt-2 gap-3 items-center px-3 py-1.5">
                       <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#4f4f4f] p-1 bg-[#45FFAE] h-fit bg-opacity-50 rounded-full text-center">Raven</div>
                       <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#E0E0E0]">I predict what the market hasn't priced yet.</div>
                     </div>
                   </div>
                  </>
                )}
 
           </div>
 
      <div className="flex w-full max-w-5xl flex-1 flex-col gap-6 min-h-0">
        {messages.length === 0 ? (
          <div className="w-5xl">
            <div className="flex flex-col gap-5 w-full h-96 p-4 items-center justify-center">
              <div className="flex flex-col gap-3.5 items-center">
                <div className="flex flex-row gap-2">
                  <div className="bg-[#1A1A1A] border border-[#282828] rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-[#2A2A2A] transition-all duration-200 w-fit" onClick={() => handleSuggestedQuestion('What will the BTC price be in the next 5 mins?')}>
                    <span className="text-white font-urbanist font-medium text-sm">What will the BTC price be in the next 5 mins?</span>
                    <MoveRight className="text-white h-4 w-4 ml-2" />
                  </div>
                  <div className="bg-[#1A1A1A] border border-[#282828] rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-[#2A2A2A] transition-all duration-200 w-fit" onClick={() => handleSuggestedQuestion('Where will BTC close by the end of this month?')}>
                    <span className="text-white font-urbanist font-medium text-sm">Where will BTC close by the end of this month?</span>
                    <MoveRight className="text-white h-4 w-4 ml-2" />
                  </div>
                </div>

                <div className="flex flex-row gap-2">
                  <div className="bg-[#1A1A1A] border border-[#282828] rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-[#2A2A2A] transition-all duration-200 w-fit" onClick={() => handleSuggestedQuestion('Will ETH outperform BTC this week?')}>
                    <span className="text-white font-urbanist font-medium text-sm">Will ETH outperform BTC this week?</span>
                    <MoveRight className="text-white h-4 w-4 ml-2" />
                  </div>
                  <div className="bg-[#1A1A1A] border border-[#282828] rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-[#2A2A2A] transition-all duration-200 w-fit" onClick={() => handleSuggestedQuestion('When will ETH cross $5K this month?')}>
                    <span className="text-white font-urbanist font-medium text-sm">When will ETH cross $5K this month?</span>
                    <MoveRight className="text-white h-4 w-4 ml-2" />
                  </div>
                </div>

                <div className="flex flex-row">
                  <div className="bg-[#1A1A1A] border border-[#282828] rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-[#2A2A2A] transition-all duration-200 w-fit" onClick={() => handleSuggestedQuestion('Why could ETH drop below $3K in the next 24 hours?')}>
                    <span className="text-white font-urbanist font-medium text-sm">Why could ETH drop below $3K in the next 24 hours?</span>
                    <MoveRight className="text-white h-4 w-4 ml-2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 w-full max-w-5xl rounded-3xl bg-[#141414] p-6 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto rounded-2xl border border-[#1F1F1F] bg-[#0F0F0F]/80 p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.chartType === 'btc' ? (
                    <div className="w-full rounded-2xl border border-[#1F1F1F] bg-[#121212] p-4">
                      <div className="mb-3 font-urbanist text-sm font-medium text-white">{message.content}</div>
                      <div className="rounded-xl bg-[#0B0B0B] p-3">
                        <BTCPriceChart />
                      </div>
                      <div className="mt-3 font-urbanist text-xs leading-none tracking-[0%] text-[#808080]">
                        Displaying sample BTC closing prices for illustrative purposes.
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed font-urbanist ${
                        message.role === 'user'
                          ? 'bg-[#45FFAE]/15 text-[#45FFAE]'
                          : 'bg-[#1F1F1F] text-[#FFFFFF]'
                      }`}
                    >
                      {message.content}
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>
        )}
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
                   <ArrowUp className={`text-[#808080] h-3 w-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}/>
                 </button>
 
                 {isDropdownOpen && (
                   <div className="absolute bottom-full left-0 z-50 mb-3 w-48 rounded-xl border border-gray-700 bg-[#1A1A1A] p-1 shadow-xl">
                     <div className="max-h-48 overflow-y-auto rounded-lg bg-[#121212]">
                       <div className="px-3 py-2 cursor-pointer hover:bg-[#222] text-[#E0E0E0] font-urbanist text-sm rounded-t-lg" onClick={() => { setIsDropdownOpen(false); navigate('/polymarket') }}>
                         Polymarket
                       </div>
                       <div className="px-3 py-2 cursor-default bg-[#222] text-[#E0E0E0] font-urbanist text-sm rounded-b-lg">
                         Crypto
                       </div>
                     </div>
                   </div>
                 )}
               </div>
 
               {/* Timeframe Dropdown */}
               <div className="relative" ref={tfRef}>
                 <button className="flex flex-row items-center justify-center gap-2 bg-black bg-opacity-70 rounded-lg px-3 py-2 cursor-pointer w-fit h-10 hover:bg-opacity-80" onClick={() => setIsTfOpen(prev => !prev)}>
                   <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#FFFFFF]">{selectedTimeframe ?? 'Timeframe'}</div>
                   <ArrowUp className={`text-[#808080] h-3 w-3 transition-transform ${isTfOpen ? 'rotate-180' : ''}`}/>
                 </button>
                 {isTfOpen && (
                   <div className="absolute bottom-full left-0 z-50 mb-3 w-48 rounded-xl border border-gray-700 bg-[#1A1A1A] p-1 shadow-xl">
                     <div className="max-h-48 overflow-y-auto rounded-lg bg-[#121212]">
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
                   <ArrowUp className={`text-[#808080] h-3 w-3 transition-transform ${isAnalysisOpen ? 'rotate-180' : ''}`}/>
                 </button>
                 {isAnalysisOpen && (
                   <div className="absolute bottom-full left-0 z-50 mb-3 w-48 rounded-xl border border-gray-700 bg-[#1A1A1A] p-1 shadow-xl">
                     <div className="max-h-48 overflow-y-auto rounded-lg bg-[#121212]">
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
                   <ArrowUp className={`text-[#808080] h-3 w-3 transition-transform ${isAssetsOpen ? 'rotate-180' : ''}`}/>
                 </button>
                 {isAssetsOpen && (
                   <div className="absolute bottom-full left-0 z-50 mb-3 w-48 rounded-xl border border-gray-700 bg-[#1A1A1A] p-1 shadow-xl">
                     <div className="max-h-48 overflow-y-auto rounded-lg bg-[#121212]">
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

const btcSampleData = [
  { time: "2024-06-01", value: 68250 },
  { time: "2024-06-02", value: 67680 },
  { time: "2024-06-03", value: 66940 },
  { time: "2024-06-04", value: 67210 },
  { time: "2024-06-05", value: 67890 },
  { time: "2024-06-06", value: 68420 },
  { time: "2024-06-07", value: 69310 },
  { time: "2024-06-08", value: 70150 },
  { time: "2024-06-09", value: 69780 },
  { time: "2024-06-10", value: 70440 }
]

const BTCPriceChart = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 260,
      layout: {
        background: {
          type: ColorType.Solid,
          color: "#0B0B0B",
        },
        textColor: "#A0A0A0",
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
      },
      grid: {
        vertLines: {
          color: "rgba(255,255,255,0.05)",
        },
        horzLines: {
          color: "rgba(255,255,255,0.05)",
        },
      },
      crosshair: {
        mode: 0,
      },
    })

    const lineSeries = chart.addLineSeries({
      color: "#45FFAE",
      lineWidth: 2,
    })

    lineSeries.setData(btcSampleData)

    const tooltip = document.createElement("div")
    tooltipRef.current = tooltip
    Object.assign(tooltip.style, {
      position: "absolute",
      display: "none",
      pointerEvents: "none",
      padding: "10px 14px",
      borderRadius: "14px",
      background: "rgba(8, 8, 8, 0.92)",
      color: "#FFFFFF",
      boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
      fontFamily: "Inter, sans-serif",
      fontSize: "12px",
      fontWeight: "500",
      border: "1px solid rgba(69, 255, 174, 0.25)",
      zIndex: "15",
      transition: "transform 0.12s ease, opacity 0.12s ease",
    } as CSSStyleDeclaration)

    containerRef.current.appendChild(tooltip)

    const formatDate = (time: unknown) => {
      if (typeof time === "string") {
        return time
      }
      if (typeof time === "object" && time !== null && "year" in time) {
        const { year, month, day } = time as { year: number; month: number; day: number }
        return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      }
      return ""
    }

    const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

    const handleCrosshairMove = (param: any) => {
      if (!tooltipRef.current || !containerRef.current) {
        return
      }

      const tooltipEl = tooltipRef.current

      if (!param?.time || !param?.point || param.point.x < 0 || param.point.y < 0) {
        tooltipEl.style.display = "none"
        return
      }

      const price = param.seriesPrices?.get(lineSeries)
      if (price === undefined) {
        tooltipEl.style.display = "none"
        return
      }

      tooltipEl.innerHTML = `
        <div style="font-size:13px; font-weight:600; margin-bottom:4px; letter-spacing:0.01em; color:#45FFAE;">BTC / USD</div>
        <div style="font-size:12px; letter-spacing:0.01em;">${formatDate(param.time)}</div>
        <div style="font-size:15px; font-weight:600; margin-top:6px;">$${Number(price).toLocaleString()}</div>
      `

      tooltipEl.style.display = "block"

      const containerWidth = containerRef.current.clientWidth
      const containerHeight = containerRef.current.clientHeight
      const tooltipWidth = tooltipEl.clientWidth
      const tooltipHeight = tooltipEl.clientHeight

      const x = clamp(param.point.x + 16, 8, containerWidth - tooltipWidth - 8)
      const y = clamp(param.point.y + 16, 8, containerHeight - tooltipHeight - 8)

      tooltipEl.style.transform = `translate(${x}px, ${y}px)`
      tooltipEl.style.opacity = "1"
    }

    const handleMouseLeave = () => {
      if (tooltipRef.current) {
        tooltipRef.current.style.display = "none"
      }
    }

    chart.subscribeCrosshairMove(handleCrosshairMove)
    containerRef.current.addEventListener("mouseleave", handleMouseLeave)

    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth })
      }
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.unsubscribeCrosshairMove(handleCrosshairMove)
      containerRef.current?.removeEventListener("mouseleave", handleMouseLeave)
      if (tooltipRef.current) {
        tooltipRef.current.remove()
      }
      chart.remove()
    }
  }, [])

  return <div ref={containerRef} className="relative h-64 w-full" />
}
