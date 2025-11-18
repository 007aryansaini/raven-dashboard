
import { ArrowUp, MoveRight } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAccount } from 'wagmi'
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from '../firebase'
import { toast } from 'react-toastify'
import bolt from "../assets/bolt.svg"
import blackDot from "../assets/blackDot.svg"

type ChatMessage = {
  id: number
  role: "user" | "assistant"
  content: string
}

const Home = () => {
  const { isConnected } = useAccount()
  const [twitterUser, setTwitterUser] = useState<User | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [inputValue, setInputValue] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const navigate = useNavigate()
  const dropdownRef = useRef<HTMLDivElement>(null)

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
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    if (!isDropdownOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDropdownOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
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

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: trimmed,
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
    <div className={`relative flex h-full flex-col items-center ${messages.length === 0 ? 'justify-center' : 'justify-start'} gap-10 px-4 py-8 sm:px-6 lg:px-10 overflow-hidden`}
         style={{
           background: `
             radial-gradient(circle at center, rgba(69, 255, 174, 0.1) 0%, rgba(0, 0, 0, 0.8) 70%, rgba(0, 0, 0, 1) 100%),
             linear-gradient(90deg, rgba(69, 255, 174, 0.05) 1px, transparent 1px),
             linear-gradient(rgba(69, 255, 174, 0.05) 1px, transparent 1px)
           `,
           backgroundSize: '100% 100%, 60px 60px, 60px 60px',
           backgroundColor: '#000000'
         }}>
           <div className={`flex flex-col gap-3 text-center transition-all duration-700 ease-out ${
             isVisible 
               ? 'opacity-100 translate-y-0' 
               : 'opacity-0 translate-y-8'
           }`}>
                 <div className="font-urbanist font-medium text-3xl leading-tight tracking-[0%] text-[#FFFFFF] sm:text-4xl">Artificial Prediction Intelligence</div>
                <div className="flex w-full flex-row items-center justify-center">
                 <div className={`mt-2 flex h-10 w-auto items-center gap-4 rounded-full border border-gray-500 px-4 transition-all duration-500 ease-out ${
                   isVisible 
                     ? 'opacity-100 translate-y-0' 
                     : 'opacity-0 translate-y-4'
                 }`} style={{ transitionDelay: isVisible ? '200ms' : '0ms' }}>
                    <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#4f4f4f] p-1 bg-[#45FFAE] h-fit bg-opacity-50 rounded-full text-center">Raven</div>
                    <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#E0E0E0]">I predict what the market hasn't priced yet.</div>
                 </div>
                 </div>
           </div>

           {messages.length > 0 && (
             /* Chat Interface */
             <div className="flex-1 w-full max-w-4xl flex flex-col gap-4 min-h-0">
               <div className="flex flex-row items-center justify-between">
                 <div className="flex flex-row gap-2 items-center">
                   <img src={bolt} alt="bolt"  className="h-3 w-3"/>
                   <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#808080]">Unlock more with paid plans</div>
                   <MoveRight className="text-[#808080] text-center"/>
                 </div>
               </div>
               <div className="flex-1 rounded-3xl bg-[#141414] p-6 flex flex-col min-h-0 overflow-hidden">
                 <div className="flex-1 min-h-0 overflow-y-auto rounded-2xl border border-[#1F1F1F] bg-[#0F0F0F]/80 p-4 space-y-4">
                   {messages.map((message) => (
                     <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <div
                         className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed font-urbanist ${
                           message.role === 'user'
                             ? 'bg-[#45FFAE]/15 text-[#45FFAE]'
                             : 'bg-[#1F1F1F] text-[#FFFFFF]'
                         }`}
                       >
                         {message.content}
                       </div>
                     </div>
                   ))}
                   <div ref={chatEndRef} />
                 </div>
               </div>
             </div>
           )}

           <div className="flex w-full max-w-4xl flex-col gap-4 rounded-3xl bg-[#141414] p-6 sm:p-8">
             <div className={`flex w-full flex-col items-start justify-between gap-3 rounded-2xl bg-[#1A1A1A] p-4 transition-all duration-500 ease-out sm:flex-row sm:items-center sm:p-6 ${
               isVisible 
                 ? 'opacity-100 scale-100' 
                 : 'opacity-0 scale-95'
             }`} style={{ transitionDelay: isVisible ? '800ms' : '0ms' }}>

               <div className="flex w-full flex-1 items-center justify-between gap-3 sm:gap-4">
                 <img src={blackDot} alt="history" className="h-5 w-5"/>
                 <div className="font-urbanist font-medium text-lg  text-[#3E3E3E]">|</div>
                 <input 
                   ref={inputRef}
                   type="text" 
                   placeholder="Ask anything" 
                   value={inputValue}
                   onChange={handleInputChange}
                   onKeyPress={handleKeyPress}
                   className="font-urbanist font-medium text-base text-[#FFFFFF] placeholder-[#3E3E3E] focus:outline-none sm:text-lg bg-transparent flex-1"
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

             <div className={`flex flex-row items-center justify-start transition-all duration-400 ease-out ${
               isVisible 
                 ? 'opacity-100 translate-x-0' 
                 : 'opacity-0 translate-x-4'
             }`} style={{ transitionDelay: isVisible ? '1000ms' : '0ms' }}>

               <div className="relative" ref={dropdownRef}>
                 <button 
                   className="flex flex-row items-center gap-2 rounded-lg bg-black/70 px-4 py-2 hover:bg-black/80"
                   onClick={() => setIsDropdownOpen((prev) => !prev)}
                 >
                   <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#FFFFFF] mr-4">
                     Market
                   </div>
                   <ArrowUp className={`text-[#808080] h-3 w-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}/>
                 </button>

                 {isDropdownOpen && (
                   <div 
                     className="absolute bottom-full left-0 z-50 mb-2 w-48 rounded-xl border border-gray-700 bg-[#1A1A1A] shadow-xl"
                   >
                     <div 
                       className="px-3 py-2 cursor-pointer hover:bg-[#222] text-[#E0E0E0] font-urbanist text-sm rounded-t-lg"
                       onClick={() => { setIsDropdownOpen(false); navigate('/polymarket') }}
                     >
                       Polymarket
                     </div>
                     <div 
                       className="px-3 py-2 cursor-pointer hover:bg-[#222] text-[#E0E0E0] font-urbanist text-sm rounded-b-lg"
                       onClick={() => { setIsDropdownOpen(false); navigate('/crypto') }}
                     >
                       Crypto
                     </div>
                   </div>
                 )}
               </div>

             </div>
           </div>
    </div>
  )
}

export default Home
