import { ArrowUp, MoveRight, ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAccount } from 'wagmi'
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from '../firebase'
import { toast } from 'react-toastify'
import bolt from "../assets/bolt.svg"
import blackDot from "../assets/blackDot.svg"
import polymarketLogo from "../assets/polymarketLogo.svg"
import card1 from "../assets/card1.svg"
import card2 from "../assets/card2.svg"
import card3 from "../assets/card3.svg"
import card4 from "../assets/card4.svg"
import card5 from "../assets/card5.svg"
import card6 from "../assets/card6.svg"

type ChatMessage = {
  id: number
  role: "user" | "assistant"
  content: string
  imageSrc?: string
}

// Card mapping: maps card source to heading text
const cardMapping: Record<string, string> = {
  [card1]: "Fed decision in september?",
  [card2]: "Russia x Ukraine ceasefire in 2025?",
  [card3]: "TCU vs North Carolina",
  [card4]: "Crypto Trading Prediction",
  [card5]: "Market Analysis Prediction",
  [card6]: "Prediction Market"
}

const body = () => {
  const { isConnected } = useAccount()
  const [twitterUser, setTwitterUser] = useState<User | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
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
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [selectedCardImage, setSelectedCardImage] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const liquidityRef = useRef<HTMLDivElement>(null)
  const volumeRef = useRef<HTMLDivElement>(null)
  const timeframeRef = useRef<HTMLDivElement>(null)
  const newestRef = useRef<HTMLDivElement>(null)
  const endingSoonRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const totalSlides = 3 // 9 cards / 3 cards per slide = 3 slides
  const autoPlayInterval = 4000 // 4 seconds between slides

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
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleCardClick = (cardSrc: string) => {
    const heading = cardMapping[cardSrc] || "Market Prediction"
    
    // Store the selected card image and set the input value
    // Ensure we're storing the actual image source string
    console.log("Card clicked - Image source:", cardSrc, "Type:", typeof cardSrc)
    setSelectedCardImage(cardSrc)
    setInputValue(heading)
    
    // Auto-focus input
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const appendAssistantMessage = (question: string) => {
    const response = `Working on that prediction insight for you. Here's a placeholder response for "${question}".`
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

    // Store the selected card image before clearing - ensure it's a string
    const cardImageToUse = selectedCardImage ? String(selectedCardImage) : null
    console.log("Submitting - Selected card image:", cardImageToUse, "Type:", typeof cardImageToUse)

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: trimmed,
      imageSrc: cardImageToUse || undefined
    }

    console.log("User message created:", userMessage)

    setMessages((prev) => {
      console.log("Previous messages:", prev)
      const newMessages = [...prev, userMessage]
      console.log("New messages:", newMessages)
      return newMessages
    })
    setInputValue("")
    setSelectedCardImage(null) // Clear selected card after sending

    setTimeout(() => {
      appendAssistantMessage(trimmed)
    }, 500)
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
           {messages.length === 0 && (
             <div className="flex flex-col items-center gap-3 text-center">
               <div className="font-urbanist font-medium text-3xl leading-tight tracking-[0%] text-[#FFFFFF] sm:text-4xl">Polymarket Predictions</div>
               <div className="flex w-full flex-row items-center justify-center">
                 <div className="mt-2 flex w-auto items-center gap-3 rounded-full border border-gray-500 px-4 py-2">
                   <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#4f4f4f] p-1 bg-[#45FFAE] h-fit bg-opacity-50 rounded-full text-center">Raven</div>
                   <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#E0E0E0]">I predict what the market hasn't priced yet.</div>
                 </div>
               </div>
             </div>
           )}

           {messages.length === 0 ? (
             /* Carousel Container */
             <div 
               className="relative w-full max-w-5xl"
               onMouseEnter={() => setIsAutoPlay(false)}
               onMouseLeave={() => setIsAutoPlay(true)}
             >
               {/* Left Navigation Indicator */}
               <button 
                 onClick={goToPreviousSlide}
                 disabled={isTransitioning}
                 className={`absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 transition-all duration-200 sm:left-[-46px] ${
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
                 className={`absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 transition-all duration-200 sm:right-[-46px] ${
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
               <div className="relative flex w-full flex-col gap-4 overflow-hidden rounded-3xl bg-[#121212]/60 p-4 backdrop-blur">
                 {/* Animated Card Container */}
                 <div 
                   className={`grid gap-4 transition-all duration-500 ease-in-out sm:grid-cols-2 lg:grid-cols-3 ${
                     isTransitioning ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'
                   }`}
                 >
                   {getCardSet(currentSlide).map((card, index) => (
                     <img 
                       key={`${currentSlide}-${index}`}
                       src={card.src} 
                       alt={card.alt} 
                       onClick={() => handleCardClick(card.src)}
                       className={`w-full rounded-2xl border border-[#1F1F1F] bg-[#101010] object-cover transition-all duration-300 ease-out cursor-pointer hover:border-[#45FFAE] hover:scale-[1.02] ${
                         isTransitioning 
                           ? 'translate-y-3 opacity-0' 
                           : 'translate-y-0 opacity-100'
                       }`}
                       style={{
                         transitionDelay: `${index * 100}ms`
                       }}
                     />
                   ))}
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
           ) : (
             /* Chat Interface */
             <div className="flex-1 w-full max-w-5xl rounded-3xl bg-[#141414] p-6 flex flex-col min-h-0 overflow-hidden">
               <div className="flex-1 min-h-0 overflow-y-auto rounded-2xl border border-[#1F1F1F] bg-[#0F0F0F]/80 p-4 space-y-4">
                 {messages.map((message) => (
                   <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`flex flex-row gap-3 max-w-[80%] rounded-2xl border border-[#1F1F1F] p-4 ${
                       message.role === 'user' 
                         ? 'bg-[#45FFAE]/10 border-[#45FFAE]/30' 
                         : 'bg-[#121212]'
                     }`}>
                       {message.imageSrc && message.imageSrc !== '' && (
                         <div className="flex-shrink-0">
                           <img 
                             src={message.imageSrc} 
                             alt="Selected card" 
                             className="w-40 h-40 rounded-xl border-2 border-[#45FFAE]/50 object-contain bg-[#1A1A1A] p-1"
                             style={{ display: 'block', minWidth: '160px', minHeight: '160px' }}
                             onError={(e) => {
                               console.error("Failed to load image:", message.imageSrc)
                             }}
                             onLoad={() => {
                               console.log("Image loaded successfully:", message.imageSrc)
                             }}
                           />
                         </div>
                       )}
                       <div className="flex flex-col gap-1 flex-1 min-w-0">
                         <div className={`font-urbanist text-sm leading-relaxed tracking-[0%] break-words ${
                           message.role === 'user' ? 'text-[#45FFAE]' : 'text-white'
                         }`}>
                           {message.content}
                         </div>
                       </div>
                     </div>
                   </div>
                 ))}
                 <div ref={chatEndRef} />
               </div>
             </div>
           )}




           <div className="flex w-full max-w-5xl flex-col gap-4 rounded-3xl bg-[#141414] p-6">
               
               <div className="flex flex-row items-center justify-between">
                       <div className="flex flex-row gap-2 items-center">
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
                  ? 'border-[#45FFAE] bg-[#45FFAE]/10 text-[#45FFAE] hover:bg-[#45FFAE]/20 cursor-pointer'
                  : 'border-transparent bg-[#2A2A2A] text-[#808080] cursor-not-allowed'}`}
              aria-label="Submit query"
              disabled={!inputValue.trim()}
            >
              <ArrowUp className="h-5 w-5" />
            </button>

         </div>

         <div className="flex flex-wrap items-center justify-start gap-3">

              <div className="relative" ref={dropdownRef}>
                <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-black/70 px-4 py-2 transition-all hover:bg-black/80" onClick={() => setIsDropdownOpen(prev => !prev)}>
                  <img src={polymarketLogo} alt="polymarket" className="h-4 w-4"/>
                  <div className="font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">Polymarket</div>
                  <ArrowUp className={`h-4 w-4 text-[#808080] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}/>
                </button>

                {isDropdownOpen && (
                  <div className="absolute bottom-full left-0 z-50 mb-3 w-48 rounded-xl border border-gray-700 bg-[#1A1A1A] p-1 shadow-xl">
                    <div className="max-h-48 overflow-y-auto rounded-lg bg-[#121212]">
                      <div className="cursor-default rounded-t-lg bg-[#222] px-4 py-2 text-center font-urbanist text-sm text-[#E0E0E0]">Polymarket</div>
                      <div className="cursor-pointer rounded-b-lg px-4 py-2 text-center font-urbanist text-sm text-[#E0E0E0] hover:bg-[#222]" onClick={() => { setIsDropdownOpen(false); navigate('/crypto') }}>Crypto</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Liquidity Dropdown */}
              <div className="relative" ref={liquidityRef}>
                <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-black/70 px-4 py-2 transition-all hover:bg-black/80" onClick={() => setIsLiquidityOpen(prev => !prev)}>
                  <div className="font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">{selectedLiquidity ?? 'Liquidity'}</div>
                  <ArrowUp className={`h-4 w-4 text-[#808080] transition-transform ${isLiquidityOpen ? 'rotate-180' : ''}`}/>
                </button>
                {isLiquidityOpen && (
                  <div className="absolute bottom-full left-0 z-50 mb-3 w-48 rounded-xl border border-gray-700 bg-[#1A1A1A] p-1 shadow-xl">
                    <div className="max-h-48 overflow-y-auto rounded-lg bg-[#121212]">
                      {['High','Medium','Low'].map(v => (
                        <div key={v} className="px-4 py-2 text-center font-urbanist text-sm text-[#E0E0E0] hover:bg-[#222] cursor-pointer" onClick={() => { setSelectedLiquidity(v); setIsLiquidityOpen(false) }}>{v}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Volume Dropdown */}
              <div className="relative" ref={volumeRef}>
                <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-black/70 px-4 py-2 transition-all hover:bg-black/80" onClick={() => setIsVolumeOpen(prev => !prev)}>
                  <div className="font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">{selectedVolume ?? 'Volume'}</div>
                  <ArrowUp className={`h-4 w-4 text-[#808080] transition-transform ${isVolumeOpen ? 'rotate-180' : ''}`}/>
                </button>
                {isVolumeOpen && (
                  <div className="absolute bottom-full left-0 z-50 mb-3 w-48 rounded-xl border border-gray-700 bg-[#1A1A1A] p-1 shadow-xl">
                    <div className="max-h-48 overflow-y-auto rounded-lg bg-[#121212]">
                      {['High','Medium','Low'].map(v => (
                        <div key={v} className="px-4 py-2 text-center font-urbanist text-sm text-[#E0E0E0] hover:bg-[#222] cursor-pointer" onClick={() => { setSelectedVolume(v); setIsVolumeOpen(false) }}>{v}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Timeframe Dropdown */}
              <div className="relative" ref={timeframeRef}>
                <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-black/70 px-4 py-2 transition-all hover:bg-black/80" onClick={() => setIsTimeframeOpen(prev => !prev)}>
                  <div className="font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">{selectedTimeframe ?? 'Timeframe'}</div>
                  <ArrowUp className={`h-4 w-4 text-[#808080] transition-transform ${isTimeframeOpen ? 'rotate-180' : ''}`}/>
                </button>
                {isTimeframeOpen && (
                  <div className="absolute bottom-full left-0 z-50 mb-3 w-48 rounded-xl border border-gray-700 bg-[#1A1A1A] p-1 shadow-xl">
                    <div className="max-h-48 overflow-y-auto rounded-lg bg-[#121212]">
                      {['1h','4h','12h','24h','3d','7d','30d','90d','YTD','1y'].map(v => (
                        <div key={v} className="px-4 py-2 text-center font-urbanist text-sm text-[#E0E0E0] hover:bg-[#222] cursor-pointer" onClick={() => { setSelectedTimeframe(v); setIsTimeframeOpen(false) }}>{v}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Newest Dropdown */}
              <div className="relative" ref={newestRef}>
                <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-black/70 px-4 py-2 transition-all hover:bg-black/80" onClick={() => setIsNewestOpen(prev => !prev)}>
                  <div className="font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">{selectedNewest ?? 'Newest'}</div>
                  <ArrowUp className={`h-4 w-4 text-[#808080] transition-transform ${isNewestOpen ? 'rotate-180' : ''}`}/>
                </button>
                {isNewestOpen && (
                  <div className="absolute bottom-full left-0 z-50 mb-3 w-48 rounded-xl border border-gray-700 bg-[#1A1A1A] p-1 shadow-xl">
                    <div className="max-h-48 overflow-y-auto rounded-lg bg-[#121212]">
                      {['Today','This Week','This Month'].map(v => (
                        <div key={v} className="px-4 py-2 text-center font-urbanist text-sm text-[#E0E0E0] hover:bg-[#222] cursor-pointer" onClick={() => { setSelectedNewest(v); setIsNewestOpen(false) }}>{v}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Ending Soon Dropdown */}
              <div className="relative" ref={endingSoonRef}>
                <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-black/70 px-4 py-2 transition-all hover:bg-black/80" onClick={() => setIsEndingSoonOpen(prev => !prev)}>
                  <div className="font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">{selectedEndingSoon ?? 'Ending Soon'}</div>
                  <ArrowUp className={`h-4 w-4 text-[#808080] transition-transform ${isEndingSoonOpen ? 'rotate-180' : ''}`}/>
                </button>
                {isEndingSoonOpen && (
                  <div className="absolute bottom-full left-0 z-50 mb-3 w-48 rounded-xl border border-gray-700 bg-[#1A1A1A] p-1 shadow-xl">
                    <div className="max-h-48 overflow-y-auto rounded-lg bg-[#121212]">
                      {['1h','6h','12h','24h','3d','7d'].map(v => (
                        <div key={v} className="px-4 py-2 text-center font-urbanist text-sm text-[#E0E0E0] hover:bg-[#222] cursor-pointer" onClick={() => { setSelectedEndingSoon(v); setIsEndingSoonOpen(false) }}>{v}</div>
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
