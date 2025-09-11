import { ArrowDown, ArrowUp, MoveRight, ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState, useEffect } from "react"
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
    <div className="flex flex-col h-full items-center justtify-between py-5 gap-5 relative" 
         style={{
           background: `
             radial-gradient(circle at center, rgba(69, 255, 174, 0.1) 0%, rgba(0, 0, 0, 0.8) 70%, rgba(0, 0, 0, 1) 100%),
             linear-gradient(90deg, rgba(69, 255, 174, 0.05) 1px, transparent 1px),
             linear-gradient(rgba(69, 255, 174, 0.05) 1px, transparent 1px)
           `,
           backgroundSize: '100% 100%, 60px 60px, 60px 60px',
           backgroundColor: '#000000'
         }}>
           <div className="flex flex-col gap-3">
                 <div className="font-urbanist font-medium text-4xl leading-none tracking-[0%] text-[#FFFFFF]">Polymarket Predictions</div>
                <div className="w-full flex flex-row justify-center items-center">
                 <div className="flex flex-row border border-gray-500 w-fit h-10 rounded-full mt-2 gap-4 items-center p-2">
                    <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#4f4f4f] p-1 bg-[#45FFAE] h-fit bg-opacity-50 rounded-full text-center">Raven</div>
                    <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#E0E0E0]">I predict what the market hasn't priced yet.</div>
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
               className={`absolute left-[-60px] top-1/2 transform -translate-y-1/2 z-10 rounded-full p-3 transition-all duration-200 ${
                 isTransitioning 
                   ? 'bg-[#0A0A0A] cursor-not-allowed opacity-50' 
                   : 'bg-[#1A1A1A] hover:bg-[#2A2A2A] hover:scale-110'
               }`}
             >
               <ChevronLeft className={`h-6 w-6 transition-colors duration-200 ${
                 isTransitioning ? 'text-gray-500' : 'text-white'
               }`} />
             </button>

             {/* Right Navigation Indicator */}
             <button 
               onClick={goToNextSlide}
               disabled={isTransitioning}
               className={`absolute right-[-60px] top-1/2 transform -translate-y-1/2 z-10 rounded-full p-3 transition-all duration-200 ${
                 isTransitioning 
                   ? 'bg-[#0A0A0A] cursor-not-allowed opacity-50' 
                   : 'bg-[#1A1A1A] hover:bg-[#2A2A2A] hover:scale-110'
               }`}
             >
               <ChevronRight className={`h-6 w-6 transition-colors duration-200 ${
                 isTransitioning ? 'text-gray-500' : 'text-white'
               }`} />
             </button>


             {/* Carousel Content */}
             <div className="flex flex-col gap-4 w-full h-96 p-4 overflow-hidden relative">
               {/* Animated Card Container */}
               <div 
                 className={`flex flex-col gap-4 w-full transition-all duration-500 ease-in-out ${
                   isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                 }`}
               >
                 <div className="flex flex-row items-center justify-between">
                   {getCardSet(currentSlide).map((card, index) => (
                     <img 
                       key={`${currentSlide}-${index}`}
                       src={card.src} 
                       alt={card.alt} 
                       className={`h-[176px] w-[300px] flex-shrink-0 transition-all duration-300 ease-out ${
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
                       className={`h-[176px] w-[300px] flex-shrink-0 transition-all duration-300 ease-out ${
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
             <div className="flex justify-center mt-6 gap-2">
               {Array.from({ length: totalSlides }, (_, index) => (
                 <button
                   key={index}
                   onClick={() => goToSlide(index)}
                   disabled={isTransitioning}
                   className={`w-3 h-3 rounded-sm transition-all duration-300 ${
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




           <div className="flex flex-col gap-4 w-5xl h-44 bg-[#141414] rounded-lg p-4 justify-between">
               
               <div className="flex flex-row items-center justify-between">
                       <div className="flex flex-row gap-2 items-center">
                            <img src={bolt} alt="bolt"  className="h-3 w-3"/>
                            <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#808080]">Unlock more with paid plans</div>
                            <MoveRight className="text-[#808080] text-center"/>
                       </div>

               </div>



          <div className="h-30 w-full bg-[#1A1A1A] rounded-lg flex flex-row p-2 items-start justify-between" >

            <div className="flex flex-row items-center justify-between gap-2 flex-1">
                <img src={blackDot} alt="history" className="h-5 w-5"/>
                <div className="font-urbanist font-medium text-lg  text-[#3E3E3E]">|</div>
                <input 
                  ref={inputRef}
                  type="text" 
                  placeholder="Ask me anything" 
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="font-urbanist font-medium text-lg text-[#FFFFFF] bg-transparent outline-none focus:outline-none focus:ring-0 focus:border-none flex-1 placeholder-[#3E3E3E]"
                />
            </div>

            <ArrowUp 
              className={`h-5 w-5 cursor-pointer transition-all duration-200 ${inputValue.trim() ? 'text-[#45FFAE] hover:scale-110' : 'text-[#808080]'}`} 
              onClick={handleSubmit}
            />

         </div>

         <div className="flex flex-row items-center justify-start">

              <div className="flex flex-row items-center gap-2 bg-black bg-opacity-70 rounded-lg px-3 py-2 cursor-pointer w-fit h-fit">
                       <img src={polymarketLogo} alt="polymarket" className="h-4 w-4"/>
                       <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#FFFFFF] mr-4">
                           Polymarket
                       </div>
                       <ArrowDown className="text-[#808080] h-3 w-3"/>
              </div>

         </div>



           </div>
    </div>
  )
}

export default body
