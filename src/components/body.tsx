import { ArrowDown, ArrowUp, MoveRight, ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import bolt from "../assets/bolt.svg"
import blackDot from "../assets/blackDot.svg"
import polymarketLogo from "../assets/polymarketLogo.svg"
import card1 from "../assets/card1.svg"
import card2 from "../assets/card2.svg"
import card3 from "../assets/card3.svg"
import card4 from "../assets/card4.svg"
import card5 from "../assets/card5.svg"
import card6 from "../assets/card6.svg"

const body = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState("")
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLiquidityOpen, setIsLiquidityOpen] = useState(false)
  const [isVolumeOpen, setIsVolumeOpen] = useState(false)
  const [isTimeframeOpen, setIsTimeframeOpen] = useState(false)
  const [isNewestOpen, setIsNewestOpen] = useState(false)
  const [isEndingSoonOpen, setIsEndingSoonOpen] = useState(false)
  const [selectedLiquidity, setSelectedLiquidity] = useState<string | null>(null)
  const [selectedVolume, setSelectedVolume] = useState<string | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState<string | null>(null)
  const [selectedNewest, setSelectedNewest] = useState<string | null>(null)
  const [selectedEndingSoon, setSelectedEndingSoon] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const liquidityRef = useRef<HTMLDivElement>(null)
  const volumeRef = useRef<HTMLDivElement>(null)
  const timeframeRef = useRef<HTMLDivElement>(null)
  const newestRef = useRef<HTMLDivElement>(null)
  const endingSoonRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const totalSlides = 3 // 9 cards / 3 cards per slide = 3 slides
  const autoPlayInterval = 4000 // 4 seconds between slides

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

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const anyOpen = isDropdownOpen || isLiquidityOpen || isVolumeOpen || isTimeframeOpen || isNewestOpen || isEndingSoonOpen
    if (!anyOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (
        (dropdownRef.current && dropdownRef.current.contains(target)) ||
        (liquidityRef.current && liquidityRef.current.contains(target)) ||
        (volumeRef.current && volumeRef.current.contains(target)) ||
        (timeframeRef.current && timeframeRef.current.contains(target)) ||
        (newestRef.current && newestRef.current.contains(target)) ||
        (endingSoonRef.current && endingSoonRef.current.contains(target))
      ) {
        return
      }
      setIsDropdownOpen(false)
      setIsLiquidityOpen(false)
      setIsVolumeOpen(false)
      setIsTimeframeOpen(false)
      setIsNewestOpen(false)
      setIsEndingSoonOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false)
        setIsLiquidityOpen(false)
        setIsVolumeOpen(false)
        setIsTimeframeOpen(false)
        setIsNewestOpen(false)
        setIsEndingSoonOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDropdownOpen, isLiquidityOpen, isVolumeOpen, isTimeframeOpen, isNewestOpen, isEndingSoonOpen])

  const goToPreviousSlide = () => {
    if (isTransitioning) return
    pauseAutoPlay()
    setIsTransitioning(true)
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : totalSlides - 1))
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const goToNextSlide = () => {
    if (isTransitioning) return
    pauseAutoPlay()
    setIsTransitioning(true)
    setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : 0))
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const goToSlide = (slideIndex: number) => {
    if (isTransitioning || slideIndex === currentSlide) return
    pauseAutoPlay()
    setIsTransitioning(true)
    setCurrentSlide(slideIndex)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlay || isTransitioning) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const nextSlide = prev < totalSlides - 1 ? prev + 1 : 0
        setIsTransitioning(true)
        setTimeout(() => setIsTransitioning(false), 500)
        return nextSlide
      })
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [isAutoPlay, isTransitioning, autoPlayInterval, totalSlides])

  // Pause auto-play on user interaction
  const pauseAutoPlay = () => {
    setIsAutoPlay(false)
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlay(true), 10000)
  }

  // Define different card sets for each slide to show animation
  const getCardSet = (slideIndex: number) => {
    const cardSets = [
      // Slide 1: Original cards
      [
        { src: card1, alt: "Fed Decision Card" },
        { src: card2, alt: "Russia Ukraine Card" },
        { src: card3, alt: "TCU vs North Carolina Card" }
      ],
      // Slide 2: Different arrangement
      [
        { src: card4, alt: "Crypto Trading Card" },
        { src: card5, alt: "Market Analysis Card" },
        { src: card6, alt: "Prediction Card" }
      ],
      // Slide 3: Mixed arrangement
      [
        { src: card1, alt: "Fed Decision Card" },
        { src: card4, alt: "Crypto Trading Card" },
        { src: card2, alt: "Russia Ukraine Card" }
      ]
    ]
    return cardSets[slideIndex] || cardSets[0]
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
                 <div className="font-urbanist font-medium text-3xl leading-none tracking-[0%] text-[#FFFFFF] text-center">Polymarket Predictions</div>
                <div className="w-full flex flex-row justify-center items-center">
                 <div className="flex flex-row border border-gray-500 w-fit h-9 rounded-full mt-2 gap-3 items-center px-3 py-1.5">
                    <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#4f4f4f] p-1 bg-[#45FFAE] h-fit bg-opacity-50 rounded-full text-center">Raven</div>
                    <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#E0E0E0]">I predict what the market hasn't priced yet.</div>
                 </div>
                 </div>

           </div>

           {/* Carousel Container */}
           <div 
             className="relative w-5xl"
             onMouseEnter={() => setIsAutoPlay(false)}
             onMouseLeave={() => setIsAutoPlay(true)}
           >
             {/* Left Navigation Indicator */}
             <button 
               onClick={goToPreviousSlide}
               disabled={isTransitioning}
               className={`absolute left-[-52px] top-1/2 transform -translate-y-1/2 z-10 rounded-full p-2.5 transition-all duration-200 ${
                 isTransitioning 
                   ? 'bg-[#0A0A0A] cursor-not-allowed opacity-50' 
                   : 'bg-[#1A1A1A] hover:bg-[#2A2A2A] hover:scale-110'
               }`}
             >
               <ChevronLeft className={`h-5 w-5 transition-colors duration-200 ${
                 isTransitioning ? 'text-gray-500' : 'text-white'
               }`} />
             </button>

             {/* Right Navigation Indicator */}
             <button 
               onClick={goToNextSlide}
               disabled={isTransitioning}
               className={`absolute right-[-52px] top-1/2 transform -translate-y-1/2 z-10 rounded-full p-2.5 transition-all duration-200 ${
                 isTransitioning 
                   ? 'bg-[#0A0A0A] cursor-not-allowed opacity-50' 
                   : 'bg-[#1A1A1A] hover:bg-[#2A2A2A] hover:scale-110'
               }`}
             >
               <ChevronRight className={`h-5 w-5 transition-colors duration-200 ${
                 isTransitioning ? 'text-gray-500' : 'text-white'
               }`} />
             </button>


             {/* Carousel Content */}
             <div className="flex flex-col gap-3.5 w-full h-96 p-4 overflow-hidden relative">
               {/* Animated Card Container */}
               <div 
                 className={`flex flex-col gap-3.5 w-full transition-all duration-500 ease-in-out ${
                   isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                 }`}
               >
                 <div className="flex flex-row items-center justify-between">
                   {getCardSet(currentSlide).map((card, index) => (
                     <img 
                       key={`${currentSlide}-${index}`}
                       src={card.src} 
                       alt={card.alt} 
                       className={`h-[168px] w-[292px] flex-shrink-0 transition-all duration-300 ease-out ${
                         isTransitioning 
                           ? 'transform translate-x-[-20px] opacity-0' 
                           : 'transform translate-x-0 opacity-100'
                       }`}
                       style={{
                         transitionDelay: `${index * 100}ms`
                       }}
                     />
                   ))}
                 </div>
                 <div className="flex flex-row items-center justify-between">
                   {getCardSet(currentSlide).map((card, index) => (
                     <img 
                       key={`${currentSlide}-${index + 3}`}
                       src={card.src} 
                       alt={card.alt} 
                       className={`h-[168px] w-[292px] flex-shrink-0 transition-all duration-300 ease-out ${
                         isTransitioning 
                           ? 'transform translate-x-[20px] opacity-0' 
                           : 'transform translate-x-0 opacity-100'
                       }`}
                       style={{
                         transitionDelay: `${(index + 3) * 100}ms`
                       }}
                     />
                   ))}
                 </div>
               </div>
             </div>

             {/* Pagination Dots */}
             <div className="flex justify-center mt-4 gap-1.5">
               {Array.from({ length: totalSlides }, (_, index) => (
                 <button
                   key={index}
                   onClick={() => goToSlide(index)}
                   disabled={isTransitioning}
                   className={`w-2.5 h-2.5 rounded-sm transition-all duration-300 ${
                     index === currentSlide 
                       ? 'bg-[#45FFAE] scale-110 shadow-lg shadow-[#45FFAE]/30' 
                       : isTransitioning
                       ? 'bg-[#1A1A1A] cursor-not-allowed'
                       : 'bg-[#2A2A2A] hover:bg-[#3A3A3A] hover:scale-105'
                   }`}
                 />
               ))}
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
                  <img src={polymarketLogo} alt="polymarket" className="h-4 w-4"/>
                  <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#FFFFFF]">Polymarket</div>
                  <ArrowDown className={`text-[#808080] h-3 w-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}/>
                </button>

                {isDropdownOpen && (
                  <div className="absolute mt-4 left-0 z-50 w-36 bg-[#1A1A1A] border border-gray-700 rounded-lg shadow-xl p-1">
                    <div className="bg-[#121212] rounded-md max-h-16 overflow-y-auto">
                      <div className="px-3 py-2 text-[#E0E0E0] font-urbanist text-sm cursor-default bg-[#222] text-center rounded-t-md">Polymarket</div>
                      <div className="px-3 py-2 cursor-pointer hover:bg-[#222] text-[#E0E0E0] font-urbanist text-sm text-center rounded-b-md" onClick={() => { setIsDropdownOpen(false); navigate('/crypto') }}>Crypto</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Liquidity Dropdown */}
              <div className="relative" ref={liquidityRef}>
                <button className="flex flex-row items-center justify-center gap-2 bg-black bg-opacity-70 rounded-lg px-3 py-2 cursor-pointer w-fit h-10 hover:bg-opacity-80" onClick={() => setIsLiquidityOpen(prev => !prev)}>
                  <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#FFFFFF]">{selectedLiquidity ?? 'Liquidity'}</div>
                  <ArrowDown className={`text-[#808080] h-3 w-3 transition-transform ${isLiquidityOpen ? 'rotate-180' : ''}`}/>
                </button>
                {isLiquidityOpen && (
                  <div className="absolute mt-4 left-0 z-50 w-36 bg-[#1A1A1A] border border-gray-700 rounded-lg shadow-xl p-1">
                    <div className="bg-[#121212] rounded-md max-h-16 overflow-y-auto">
                      {['High','Medium','Low'].map(v => (
                        <div key={v} className="px-3 py-2 cursor-pointer hover:bg-[#222] text-[#E0E0E0] font-urbanist text-sm text-center" onClick={() => { setSelectedLiquidity(v); setIsLiquidityOpen(false) }}>{v}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Volume Dropdown */}
              <div className="relative" ref={volumeRef}>
                <button className="flex flex-row items-center justify-center gap-2 bg-black bg-opacity-70 rounded-lg px-3 py-2 cursor-pointer w-fit h-10 hover:bg-opacity-80" onClick={() => setIsVolumeOpen(prev => !prev)}>
                  <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#FFFFFF]">{selectedVolume ?? 'Volume'}</div>
                  <ArrowDown className={`text-[#808080] h-3 w-3 transition-transform ${isVolumeOpen ? 'rotate-180' : ''}`}/>
                </button>
                {isVolumeOpen && (
                  <div className="absolute mt-4 left-0 z-50 w-36 bg-[#1A1A1A] border border-gray-700 rounded-lg shadow-xl p-1">
                    <div className="bg-[#121212] rounded-md max-h-16 overflow-y-auto">
                      {['High','Medium','Low'].map(v => (
                        <div key={v} className="px-3 py-2 cursor-pointer hover:bg-[#222] text-[#E0E0E0] font-urbanist text-sm text-center" onClick={() => { setSelectedVolume(v); setIsVolumeOpen(false) }}>{v}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Timeframe Dropdown */}
              <div className="relative" ref={timeframeRef}>
                <button className="flex flex-row items-center justify-center gap-2 bg-black bg-opacity-70 rounded-lg px-3 py-2 cursor-pointer w-fit h-10 hover:bg-opacity-80" onClick={() => setIsTimeframeOpen(prev => !prev)}>
                  <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#FFFFFF]">{selectedTimeframe ?? 'Timeframe'}</div>
                  <ArrowDown className={`text-[#808080] h-3 w-3 transition-transform ${isTimeframeOpen ? 'rotate-180' : ''}`}/>
                </button>
                {isTimeframeOpen && (
                  <div className="absolute mt-4 left-0 z-50 w-36 bg-[#1A1A1A] border border-gray-700 rounded-lg shadow-xl p-1">
                    <div className="bg-[#121212] rounded-md max-h-16 overflow-y-auto">
                      {['1h','4h','12h','24h','3d','7d','30d','90d','YTD','1y'].map(v => (
                        <div key={v} className="px-3 py-2 cursor-pointer hover:bg-[#222] text-[#E0E0E0] font-urbanist text-sm text-center" onClick={() => { setSelectedTimeframe(v); setIsTimeframeOpen(false) }}>{v}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Newest Dropdown */}
              <div className="relative" ref={newestRef}>
                <button className="flex flex-row items-center justify-center gap-2 bg-black bg-opacity-70 rounded-lg px-3 py-2 cursor-pointer w-fit h-10 hover:bg-opacity-80" onClick={() => setIsNewestOpen(prev => !prev)}>
                  <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#FFFFFF]">{selectedNewest ?? 'Newest'}</div>
                  <ArrowDown className={`text-[#808080] h-3 w-3 transition-transform ${isNewestOpen ? 'rotate-180' : ''}`}/>
                </button>
                {isNewestOpen && (
                  <div className="absolute mt-4 left-0 z-50 w-36 bg-[#1A1A1A] border border-gray-700 rounded-lg shadow-xl p-1">
                    <div className="bg-[#121212] rounded-md max-h-16 overflow-y-auto">
                      {['Today','This Week','This Month'].map(v => (
                        <div key={v} className="px-3 py-2 cursor-pointer hover:bg-[#222] text-[#E0E0E0] font-urbanist text-sm text-center" onClick={() => { setSelectedNewest(v); setIsNewestOpen(false) }}>{v}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Ending Soon Dropdown */}
              <div className="relative" ref={endingSoonRef}>
                <button className="flex flex-row items-center justify-center gap-2 bg-black bg-opacity-70 rounded-lg px-3 py-2 cursor-pointer w-fit h-10 hover:bg-opacity-80" onClick={() => setIsEndingSoonOpen(prev => !prev)}>
                  <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#FFFFFF]">{selectedEndingSoon ?? 'Ending Soon'}</div>
                  <ArrowDown className={`text-[#808080] h-3 w-3 transition-transform ${isEndingSoonOpen ? 'rotate-180' : ''}`}/>
                </button>
                {isEndingSoonOpen && (
                  <div className="absolute mt-4 left-0 z-50 w-36 bg-[#1A1A1A] border border-gray-700 rounded-lg shadow-xl p-1">
                    <div className="bg-[#121212] rounded-md max-h-16 overflow-y-auto">
                      {['1h','6h','12h','24h','3d','7d'].map(v => (
                        <div key={v} className="px-3 py-2 cursor-pointer hover:bg-[#222] text-[#E0E0E0] font-urbanist text-sm text-center" onClick={() => { setSelectedEndingSoon(v); setIsEndingSoonOpen(false) }}>{v}</div>
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
