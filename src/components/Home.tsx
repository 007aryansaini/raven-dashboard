
import { ArrowUp } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAccount } from 'wagmi'
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from '../firebase'
import { toast } from 'react-toastify'
import blackDot from "../assets/blackDot.svg"
import { CHAT_API_BASE } from "../utils/constants"
import { authorizeInference } from "../utils/inference"
import { useUserMetrics } from "../contexts/UserMetricsContext"
type ChatMessage = {
  id: number
  role: "user" | "assistant"
  content: string
  reasoning?: string
  answer?: string
}

const Home = () => {
  const { isConnected, address } = useAccount()
  const { refreshMetrics, creditsPending, inferenceRemaining } = useUserMetrics()
  const [twitterUser, setTwitterUser] = useState<User | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [inputValue, setInputValue] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
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

  const formatMarkdown = (text: string) => {
    if (!text) return ''
    
    // Split text into lines for better processing
    const lines = text.split('\n')
    const formattedLines: string[] = []
    let inTable = false
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const isTableRow = line.trim().startsWith('|') && line.trim().endsWith('|')
      const isTableSeparator = isTableRow && line.includes('---')
      
      if (isTableRow && !isTableSeparator) {
        if (!inTable) {
          inTable = true
          formattedLines.push('<div class="my-2 space-y-1">')
        }
        const cells = line.split('|').filter(cell => cell.trim() && !cell.trim().match(/^:?-+:?$/))
        if (cells.length > 0) {
          formattedLines.push(
            `<div class="flex gap-3 py-1 border-b border-[#2A2A2A]">${cells.map(cell => 
              `<span class="text-[#E0E0E0] flex-1">${cell.trim()}</span>`
            ).join('')}</div>`
          )
        }
      } else {
        if (inTable) {
          inTable = false
          formattedLines.push('</div>')
        }
        
        // Handle "REASONING" and "ANSWER" headers first - style them prominently
        if (line.trim().toUpperCase() === 'REASONING' || line.trim().toUpperCase() === 'ANSWER') {
          formattedLines.push(`<div class="font-urbanist font-semibold text-base text-[#45FFAE] mb-3 mt-4">${line.trim()}</div>`)
          continue
        }
        
        // Handle numbered headings (e.g., "1. Current Market Position & Momentum")
        // These should be on new lines with green text
        const numberedHeadingMatch = line.match(/^(\d+\.)\s+(.+)$/)
        if (numberedHeadingMatch) {
          const headingText = numberedHeadingMatch[2]
          // Check if it contains bold text or looks like a heading
          const hasBold = headingText.includes('**')
          if (hasBold) {
            const processedHeading = headingText.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#45FFAE]">$1</strong>')
            formattedLines.push(`<div class="font-urbanist font-semibold text-sm text-[#45FFAE] mt-4 mb-2">${numberedHeadingMatch[1]} ${processedHeading}</div>`)
          } else {
            formattedLines.push(`<div class="font-urbanist font-semibold text-sm text-[#45FFAE] mt-4 mb-2">${numberedHeadingMatch[1]} ${headingText}</div>`)
          }
          continue
        }
        
        // Handle bold **text** - convert to green and ensure proper line breaks
        let processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#45FFAE]">$1</strong>')
        
        // Handle bullet points
        processedLine = processedLine.replace(/^(\*|\-)\s+(.+)$/, '<div class="ml-4 my-1">• $2</div>')
        
        // If line is not empty or already processed, add it
        if (processedLine.trim() || line.trim() === '') {
          formattedLines.push(processedLine || '<br />')
        }
      }
    }
    
    if (inTable) {
      formattedLines.push('</div>')
    }
    
    return formattedLines.join('\n')
  }

  const buildChatUrl = () => {
    return `${CHAT_API_BASE}query`
  }

  const callAPI = async (query: string) => {
    try {
      setIsLoading(true)

      if (!address) {
        throw new Error("Wallet not connected")
      }

      const authorization = await authorizeInference(address, {
        tags: false,
        reason: query,
        mode: "",
      })

      if (!authorization.allowed) {
        toast.warning(
          `Request denied: ${authorization.reason.replace(/_/g, " ")}`,
          {
            style: { fontSize: "12px" },
          }
        )
        return
      }

      const response = await fetch(buildChatUrl(), {
        method: "POST",
        headers: {
          accept: "application/json",
          "x-api-key": "mcp-secret-key-xyz123abc456",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
          wallet_address: address || "",
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      // Extract reasoning and answer from response
      let reasoning = ""
      let answer = ""

      if (data.success && data.results && data.results.length > 0) {
        const firstResult = data.results[0]
        if (firstResult.results && firstResult.results.length > 0) {
          const resultData = firstResult.results[0]
          reasoning = resultData.reasoning || ""
          answer = resultData.answer || ""
        }
      }

      // Add assistant message with reasoning and answer
      setMessages((prev) => {
        const newMessages: ChatMessage[] = [
          ...prev,
          {
            id: Date.now() + 1,
            role: "assistant" as const,
            content: answer || "No answer available",
            reasoning: reasoning || undefined,
            answer: answer || undefined,
          },
        ]
        return newMessages
      })

      void refreshMetrics()
    } catch (error: any) {
      console.error("API Error:", error)
      toast.error(`Failed to get response: ${error.message}`, {
        style: { fontSize: "12px" },
      })
      // Add error message
      setMessages((prev) => {
        const newMessages: ChatMessage[] = [
          ...prev,
          {
            id: Date.now() + 1,
            role: "assistant" as const,
            content: "Sorry, I encountered an error while processing your request. Please try again.",
          },
        ]
        return newMessages
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
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

    // Check if user has 0 credits and 0 inference
    const credits = creditsPending ?? 0
    const inference = inferenceRemaining ?? 0
    if (credits === 0 && inference === 0) {
      toast.warning('You have no credits or inference remaining. Please upgrade your plan to continue.', {
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

    // Call API (wallet connection is already validated above)
    await callAPI(trimmed)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className={`relative flex h-full flex-col items-center ${messages.length === 0 ? 'justify-center' : 'justify-start'} gap-4 lg:gap-10 px-3 py-4 sm:px-4 sm:py-6 lg:px-10 lg:py-8 overflow-hidden`}
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
             <div className={`flex flex-col gap-3 text-center transition-all duration-700 ease-out ${
               isVisible 
                 ? 'opacity-100 translate-y-0' 
                 : 'opacity-0 translate-y-8'
             }`}>
               <div className="font-urbanist font-medium text-2xl sm:text-3xl lg:text-4xl leading-tight tracking-[0%] text-[#FFFFFF] px-2">Artificial Prediction Intelligence</div>
               <div className="flex w-full flex-row items-center justify-center px-2">
                 <div className={`mt-2 flex h-8 lg:h-10 w-auto items-center gap-2 lg:gap-4 rounded-full border border-gray-500 px-3 lg:px-4 transition-all duration-500 ease-out ${
                   isVisible 
                     ? 'opacity-100 translate-y-0' 
                     : 'opacity-0 translate-y-4'
                 }`} style={{ transitionDelay: isVisible ? '200ms' : '0ms' }}>
                   <div className="font-urbanist font-medium text-xs lg:text-sm leading-none tracking-[0%] text-[#4f4f4f] p-1 bg-[#45FFAE] h-fit bg-opacity-50 rounded-full text-center">Raven</div>
                   <div className="font-urbanist font-medium text-xs lg:text-sm leading-none tracking-[0%] text-[#E0E0E0]">I predict what the market hasn't priced yet.</div>
                 </div>
               </div>
             </div>
           )}

           {messages.length > 0 && (
             /* Chat Interface */
             <div className="flex w-full max-w-4xl flex-1 flex-col gap-2 lg:gap-4 min-h-0 px-2 lg:px-0">
               <div className="flex-1 rounded-2xl lg:rounded-3xl bg-[#141414] p-3 sm:p-4 lg:p-6 flex flex-col min-h-0 overflow-hidden">
                 <div className="flex-1 min-h-0 overflow-y-auto rounded-xl lg:rounded-2xl border border-[#1F1F1F] bg-[#0F0F0F]/80 p-3 lg:p-4 space-y-3 lg:space-y-4">
                   {messages.map((message) => (
                     <div key={message.id} className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} gap-2`}>
                       {message.role === 'user' ? (
                         <div className="max-w-[85%] lg:max-w-[75%] rounded-xl lg:rounded-2xl px-3 py-2 lg:px-4 lg:py-3 text-xs lg:text-sm leading-relaxed font-urbanist bg-[#45FFAE]/15 text-[#45FFAE]">
                           {message.content}
                         </div>
                       ) : (
                         <div className="max-w-[90%] lg:max-w-[85%] flex flex-col gap-2 lg:gap-3">
                           {message.reasoning && (
                             <div className="rounded-xl lg:rounded-2xl px-3 py-2 lg:px-4 lg:py-3 bg-[#1F1F1F] border border-[#2A2A2A]">
                               <div 
                                 className="font-urbanist text-xs lg:text-sm leading-relaxed text-[#FFFFFF] prose prose-invert max-w-none"
                                 dangerouslySetInnerHTML={{ __html: formatMarkdown(message.reasoning) }}
                               />
                             </div>
                           )}
                           {message.answer && (
                             <div className="rounded-xl lg:rounded-2xl px-3 py-2 lg:px-4 lg:py-3 bg-[#1F1F1F] text-[#FFFFFF]">
                               <div 
                                 className="font-urbanist text-xs lg:text-sm leading-relaxed"
                                 dangerouslySetInnerHTML={{ __html: formatMarkdown(message.answer) }}
                               />
                             </div>
                           )}
                           {!message.reasoning && !message.answer && (
                             <div className="rounded-xl lg:rounded-2xl px-3 py-2 lg:px-4 lg:py-3 text-xs lg:text-sm leading-relaxed font-urbanist bg-[#1F1F1F] text-[#FFFFFF]">
                               {message.content}
                             </div>
                           )}
                         </div>
                       )}
                     </div>
                   ))}
                   {isLoading && (
                     <div className="flex justify-start">
                       <div className="max-w-[90%] lg:max-w-[85%] rounded-xl lg:rounded-2xl px-3 py-2 lg:px-4 lg:py-3 bg-[#1F1F1F] text-[#FFFFFF]">
                         <div className="font-urbanist text-xs lg:text-sm text-[#808080]">Raven is predicting...</div>
                       </div>
                     </div>
                   )}
                   <div ref={chatEndRef} />
                 </div>
               </div>
             </div>
           )}

           <div className="flex w-full max-w-4xl flex-col gap-3 lg:gap-4 rounded-2xl lg:rounded-3xl bg-[#141414] p-4 sm:p-6 lg:p-8">
             <div className={`flex w-full flex-col items-start justify-between gap-2 lg:gap-3 rounded-xl lg:rounded-2xl bg-[#1A1A1A] p-3 lg:p-4 transition-all duration-500 ease-out sm:flex-row sm:items-center sm:p-6 ${
               isVisible 
                 ? 'opacity-100 scale-100' 
                 : 'opacity-0 scale-95'
             }`} style={{ transitionDelay: isVisible ? '800ms' : '0ms' }}>

               <div className="flex w-full flex-1 items-center justify-between gap-2 lg:gap-3 sm:gap-4">
                 <img src={blackDot} alt="history" className="h-4 w-4 lg:h-5 lg:w-5"/>
                 <div className="font-urbanist font-medium text-base lg:text-lg text-[#3E3E3E]">|</div>
                 <input 
                   ref={inputRef}
                   type="text" 
                   placeholder="Ask anything" 
                   value={inputValue}
                   onChange={handleInputChange}
                   onKeyPress={handleKeyPress}
                   className="font-urbanist font-medium text-sm lg:text-base text-[#FFFFFF] placeholder-[#3E3E3E] focus:outline-none sm:text-lg bg-transparent flex-1"
                 />
               </div>

               <button
                 type="button"
                 onClick={handleSubmit}
                 className={`flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-full border transition-all duration-200 ${
                   inputValue.trim()
                     ? 'border-[#45FFAE] bg-[#45FFAE]/10 text-[#45FFAE] hover:bg-[#45FFAE]/20 cursor-pointer'
                     : 'border-transparent bg-[#2A2A2A] text-[#808080] cursor-not-allowed'}`}
                 aria-label="Submit query"
                 disabled={!inputValue.trim()}
               >
                 <ArrowUp className="h-4 w-4 lg:h-5 lg:w-5" />
               </button>

             </div>

             <div className={`flex flex-row items-center justify-start transition-all duration-400 ease-out ${
               isVisible 
                 ? 'opacity-100 translate-x-0' 
                 : 'opacity-0 translate-x-4'
             }`} style={{ transitionDelay: isVisible ? '1000ms' : '0ms' }}>

               <div className="relative" ref={dropdownRef}>
                 <button 
                   className="flex flex-row items-center gap-1 lg:gap-2 rounded-lg bg-black/70 px-3 py-1.5 lg:px-4 lg:py-2 hover:bg-black/80"
                   onClick={() => setIsDropdownOpen((prev) => !prev)}
                 >
                   <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#FFFFFF] mr-2 lg:mr-4">
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
