import { ArrowUp, MoveRight } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAccount } from 'wagmi'
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from '../firebase'
import { toast } from 'react-toastify'
import bolt from "../assets/bolt.svg"
import cryptoTrade from "../assets/cryptoTrade.svg"
import { useTab } from "../contexts/TabContext"
import { createChart, ColorType } from "lightweight-charts"
import { CHAT_API_BASE } from "../utils/constants"
import { authorizeInference, recordInference } from "../utils/inference"
import { useUserMetrics } from "../contexts/UserMetricsContext"
import { useTypingEffect } from "../utils/useTypingEffect"
type ChatMessage = {
  id: number
  role: "user" | "assistant"
  content: string
  chartType?: "btc"
  reasoning?: string
  answer?: string
}

// Component to handle typing effect for assistant messages
const TypingAssistantMessage = ({ 
  message, 
  isTyping, 
  formatMarkdown 
}: { 
  message: ChatMessage
  isTyping: boolean
  formatMarkdown: (text: string) => string
}) => {
  const displayedReasoning = useTypingEffect(message.reasoning || '', 8, isTyping && !!message.reasoning)
  const displayedAnswer = useTypingEffect(message.answer || '', 8, isTyping && !!message.answer && !message.reasoning)
  const displayedContent = useTypingEffect(message.content, 8, isTyping && !message.reasoning && !message.answer)

  return (
    <div className="max-w-[90%] lg:max-w-[85%] flex flex-col gap-2 lg:gap-3">
      {message.reasoning && (
        <div className="rounded-xl lg:rounded-2xl px-3 py-2 lg:px-4 lg:py-3 bg-[#1F1F1F] border border-[#2A2A2A]">
          <div 
            className="font-urbanist text-xs lg:text-sm leading-relaxed text-[#FFFFFF] prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: formatMarkdown(displayedReasoning) }}
          />
        </div>
      )}
      {message.answer && (
        <div className="rounded-xl lg:rounded-2xl px-3 py-2 lg:px-4 lg:py-3 bg-[#1F1F1F] text-[#FFFFFF]">
          <div 
            className="font-urbanist text-xs lg:text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatMarkdown(displayedAnswer) }}
          />
        </div>
      )}
      {!message.reasoning && !message.answer && (
        <div className="rounded-xl lg:rounded-2xl px-3 py-2 lg:px-4 lg:py-3 text-xs lg:text-sm leading-relaxed font-urbanist bg-[#1F1F1F] text-[#FFFFFF]">
          {displayedContent}
        </div>
      )}
    </div>
  )
}

const body = () => {
  const { isConnected, address } = useAccount()
  const { refreshMetrics, creditsPending, inferenceRemaining } = useUserMetrics()
  const [twitterUser, setTwitterUser] = useState<User | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [inputValue, setInputValue] = useState("")
  const { activeTab } = useTab()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isTfOpen, setIsTfOpen] = useState(false)
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false)
  const [isAssetsOpen, setIsAssetsOpen] = useState(false)
  const [isScoreOpen, setIsScoreOpen] = useState(false)

  // Helper function to close all modals
  const closeAllModals = () => {
    setIsDropdownOpen(false)
    setIsTfOpen(false)
    setIsAnalysisOpen(false)
    setIsAssetsOpen(false)
    setIsScoreOpen(false)
  }

  // Helper functions to open specific modal and close others
  const openDropdown = () => {
    closeAllModals()
    setIsDropdownOpen(true)
  }

  const openTf = () => {
    closeAllModals()
    setIsTfOpen(true)
  }

  const openAnalysis = () => {
    closeAllModals()
    setIsAnalysisOpen(true)
  }

  const openAssets = () => {
    closeAllModals()
    setIsAssetsOpen(true)
  }

  const openScore = () => {
    closeAllModals()
    setIsScoreOpen(true)
  }
  const [selectedTimeframe, setSelectedTimeframe] = useState<string | null>(null)
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
  const [selectedScore, setSelectedScore] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [typingMessageIds, setTypingMessageIds] = useState<Set<number>>(new Set())
  const dropdownRef = useRef<HTMLDivElement>(null)
  const tfRef = useRef<HTMLDivElement>(null)
  const analysisRef = useRef<HTMLDivElement>(null)
  const assetsRef = useRef<HTMLDivElement>(null)
  const scoreRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Clear messages when navigating to this screen (detect route changes or navigation state)
  useEffect(() => {
    if (location.pathname === '/crypto' || location.pathname === '/') {
      setMessages([])
      setInputValue("")
      setTypingMessageIds(new Set())
    }
  }, [location.pathname, location.state])

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
    const anyOpen = isDropdownOpen || isTfOpen || isAnalysisOpen || isAssetsOpen || isScoreOpen
    if (!anyOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (
        (dropdownRef.current && dropdownRef.current.contains(target)) ||
        (tfRef.current && tfRef.current.contains(target)) ||
        (analysisRef.current && analysisRef.current.contains(target)) ||
        (assetsRef.current && assetsRef.current.contains(target)) ||
        (scoreRef.current && scoreRef.current.contains(target))
      ) {
        return
      }
      closeAllModals()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAllModals()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDropdownOpen, isTfOpen, isAnalysisOpen, isAssetsOpen, isScoreOpen])

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

  // Build query from selected tags
  const buildQueryFromTags = (): string | null => {
    const tags: string[] = []
    
    // Add asset if selected
    if (selectedAsset) {
      tags.push(selectedAsset)
    }
    
    // Add analysis type if selected
    if (selectedAnalysis) {
      tags.push(selectedAnalysis.toLowerCase())
    }
    
    // Add timeframe if selected
    if (selectedTimeframe) {
      tags.push(`around ${selectedTimeframe}`)
    }
    
    // Add score if selected
    if (selectedScore) {
      tags.push(selectedScore.toLowerCase())
    }
    
    // If we have tags, build a query
    if (tags.length > 0) {
      return tags.join(' ')
    }
    
    return null
  }

  const callAPI = async (query: string) => {
    try {
      setIsLoading(true)

      if (!address) {
        throw new Error("Wallet not connected")
      }

      // Check if query was built from tags
      const hasTags = Boolean(selectedAsset || selectedAnalysis || selectedTimeframe || selectedScore)

      // Map selectedScore to mode
      let mode = "basic"
      if (selectedScore === "Logical") {
        mode = "scores.logic"
      } else if (selectedScore === "Sentiment") {
        mode = "scores.sentiment"
      }

      // Determine reason based on tags and query
      let reason = query
      if (hasTags) {
        reason = "tags_price_accuracy_basic"
      }

      // 1. Check authorization before AI call - only if credits >= 6 or inference >= 2
      const shouldAuthorize = (creditsPending ?? 0) >= 6 || (inferenceRemaining ?? 0) >= 2
      let authorization = { allowed: true, reason: "", method: "credits" as const, cost: 0 }
      
      if (shouldAuthorize) {
        console.log('🔐 Authorizing inference - credits:', creditsPending, 'inference:', inferenceRemaining)
        authorization = await authorizeInference(address, {
          mode: mode,
          quantity: 1,
          reason: reason,
          tags: hasTags,
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
      } else {
        console.log('⏭️ Skipping authorization - credits:', creditsPending, 'inference:', inferenceRemaining, '(need credits >= 6 or inference >= 2)')
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

      // Helper function to recursively search for a field in the JSON object
      const findInObject = (obj: any, fieldName: string, visited = new Set()): string => {
        if (!obj || typeof obj !== 'object' || visited.has(obj)) {
          return ""
        }
        visited.add(obj)

        // Check if current object has the field
        if (obj[fieldName] && typeof obj[fieldName] === 'string' && obj[fieldName].trim()) {
          return obj[fieldName]
        }

        // Recursively search in all properties
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key]
            if (value && typeof value === 'object') {
              const found = findInObject(value, fieldName, visited)
              if (found) {
                return found
              }
            }
          }
        }

        return ""
      }

      // Step 1: Search for final_answer anywhere in the response
      let finalAnswer = findInObject(data, 'final_answer')

      // Step 2: If final_answer not found, search for reasoning and answer
      let reasoning = ""
      let answer = ""
      
      if (!finalAnswer) {
        reasoning = findInObject(data, 'reasoning')
        answer = findInObject(data, 'answer')
      }

      // If reasoning contains "ANSWER" heading and we don't have final_answer, split it properly
      if (!finalAnswer && reasoning) {
        const answerMatch = reasoning.match(/(.*?)(\n\s*)?(ANSWER|Answer)(\s*\n)(.*)/is)
        if (answerMatch) {
          // Everything before "ANSWER" stays in reasoning
          reasoning = answerMatch[1].trim()
          // "ANSWER" heading + everything after goes to answer
          const answerHeading = answerMatch[3] // "ANSWER" or "Answer"
          const answerContent = answerMatch[5] // Content after ANSWER
          // Combine existing answer (if any) with the extracted answer
          answer = answer 
            ? `${answerHeading}\n\n${answerContent}\n\n${answer}`.trim()
            : `${answerHeading}\n\n${answerContent}`.trim()
        }
      }

      // Step 3: Determine display content with fallback mechanism
      let displayContent = ""
      if (finalAnswer) {
        // Priority 1: Use final_answer if available
        displayContent = finalAnswer
      } else if (answer) {
        // Priority 2: Use answer if available
        displayContent = answer
      } else if (reasoning) {
        // Priority 3: Use reasoning if available
        displayContent = reasoning
      } else {
        // Priority 4: Fallback to "No data available"
        displayContent = "No data available"
      }

      // Add assistant message with final_answer or answer/reasoning
      const newMessageId = Date.now() + 1
      setMessages((prev) => {
        const newMessages: ChatMessage[] = [
          ...prev,
          {
            id: newMessageId,
            role: "assistant" as const,
            content: displayContent,
            reasoning: finalAnswer ? undefined : (reasoning || undefined),
            answer: finalAnswer || answer || undefined,
          },
        ]
        return newMessages
      })
      // Mark this message for typing effect
      setTypingMessageIds((prev) => new Set(prev).add(newMessageId))

      // Set loading to false immediately after response is received and message is added
      setIsLoading(false)

      // 3. After successful AI response, record the usage (async, don't wait)
      recordInference(address, {
        mode: mode,
        quantity: 1,
        reason: reason,
        tags: hasTags,
      }).catch((error: any) => {
        console.error("Error recording inference:", error)
        // Don't show error to user, just log it
      })

      void refreshMetrics()
      
      // Reset tags after successful query
      setSelectedTimeframe(null)
      setSelectedAnalysis(null)
      setSelectedAsset(null)
      setSelectedScore(null)
    } catch (error: any) {
      console.error("API Error:", error)
      toast.error(`Failed to get response: ${error.message}`, {
        style: { fontSize: "12px" },
      })
      // Add error message
      const errorMessageId = Date.now() + 1
      setMessages((prev) => {
        const newMessages: ChatMessage[] = [
          ...prev,
          {
            id: errorMessageId,
            role: "assistant" as const,
            content: "Sorry, I encountered an error while processing your request. Please try again.",
          },
        ]
        return newMessages
      })
      // Mark this message for typing effect
      setTypingMessageIds((prev) => new Set(prev).add(errorMessageId))
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
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

    // Check if tags are selected and build query from them
    const tagQuery = buildQueryFromTags()
    const trimmed = inputValue.trim()
    
    // Use tag query if available and no manual input, otherwise use manual input
    let finalQuery = trimmed
    if (!trimmed && tagQuery) {
      finalQuery = tagQuery
    } else if (!trimmed && !tagQuery) {
      // No input and no tags selected
      return
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: finalQuery,
    }

    const isChartRequest = /price chart/i.test(finalQuery)

    if (isChartRequest) {
      const assistantMessages: ChatMessage[] = [
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "BTC price snapshot (sample data).",
          chartType: "btc",
        },
      ]

      setMessages((prev) => {
        const newMessages: ChatMessage[] = [...prev, userMessage, ...assistantMessages]
        return newMessages
      })
      setInputValue("")
      
      // Reset tags after chart request
      setSelectedTimeframe(null)
      setSelectedAnalysis(null)
      setSelectedAsset(null)
      setSelectedScore(null)
      return
    }


    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    // Call API (wallet connection is already validated above)
    // Only call API if it's not a chart request
    if (!isChartRequest) {
      await callAPI(finalQuery)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="relative flex h-full flex-col items-center gap-4 lg:gap-10 px-3 py-4 sm:px-4 sm:py-6 lg:px-10 lg:py-8 overflow-hidden"
         style={{
           background: `
             radial-gradient(circle at center, rgba(69, 255, 174, 0.1) 0%, rgba(0, 0, 0, 0.8) 70%, rgba(0, 0, 0, 1) 100%),
             linear-gradient(90deg, rgba(69, 255, 174, 0.05) 1px, transparent 1px),
             linear-gradient(rgba(69, 255, 174, 0.05) 1px, transparent 1px)
           `,
           backgroundSize: '100% 100%, 60px 60px, 60px 60px',
           backgroundColor: '#000000'
         }}>
           {/* Content Area - Takes flex-1 to push input to bottom */}
           <div className="flex-1 w-full flex flex-col items-center min-h-0 overflow-hidden">
           <div className="flex flex-col items-center gap-2 lg:gap-3 text-center px-2">
                {messages.length === 0 && (
                  <>
                 <div className="font-urbanist font-medium text-xl sm:text-2xl lg:text-3xl leading-tight tracking-[0%] text-[#FFFFFF] text-center">
                   {activeTab === 'polymarket' ? 'Polymarket Predictions' : 'Crypto Market Predictions'}
                 </div>
                <div className="w-full flex flex-row justify-center items-center px-2">
                 <div className="flex flex-row border border-gray-500 w-full sm:w-fit h-auto sm:h-9 rounded-full mt-2 gap-2 sm:gap-3 items-center px-2 sm:px-3 py-1.5">
                    <div className="font-urbanist font-medium text-xs sm:text-sm leading-none tracking-[0%] text-[#4f4f4f] p-0.5 sm:p-1 bg-[#45FFAE] h-fit bg-opacity-50 rounded-full text-center">Raven</div>
                    <div className="font-urbanist font-medium text-xs sm:text-sm leading-none tracking-[0%] text-[#E0E0E0]">I predict what the market hasn't priced yet.</div>
                 </div>
                 </div>
                  </>
                )}

           </div>

      <div className="flex w-full max-w-5xl flex-1 flex-col gap-3 lg:gap-6 min-h-0">
        {messages.length === 0 ? (
           <div className="w-full">
             <div className="flex flex-col gap-3 lg:gap-5 w-full min-h-0 lg:h-96 p-2 sm:p-4 items-center justify-center">
               <div className="flex flex-col gap-2.5 lg:gap-3.5 items-center justify-center w-full">
                 <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto justify-center">
                  <div className="bg-[#1A1A1A] border border-[#282828] rounded-lg p-2.5 sm:p-3 flex items-center justify-between cursor-pointer hover:bg-[#2A2A2A] transition-all duration-200 w-full sm:w-fit" onClick={() => handleSuggestedQuestion('Tell me the sentiment around ETH ?')}>
                     <span className="text-white font-urbanist font-medium text-xs sm:text-sm">Tell me the sentiment around ETH ?</span>
                     <MoveRight className="text-white h-3.5 w-3.5 sm:h-4 sm:w-4 ml-2 flex-shrink-0" />
                   </div>
                  <div className="bg-[#1A1A1A] border border-[#282828] rounded-lg p-2.5 sm:p-3 flex items-center justify-between cursor-pointer hover:bg-[#2A2A2A] transition-all duration-200 w-full sm:w-fit" onClick={() => handleSuggestedQuestion('What is the Expected CPI in USA?')}>
                     <span className="text-white font-urbanist font-medium text-xs sm:text-sm">What is the Expected CPI in USA?</span>
                     <MoveRight className="text-white h-3.5 w-3.5 sm:h-4 sm:w-4 ml-2 flex-shrink-0" />
                   </div>
                 </div>
                 
                 <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto justify-center">
                  <div className="bg-[#1A1A1A] border border-[#282828] rounded-lg p-2.5 sm:p-3 flex items-center justify-between cursor-pointer hover:bg-[#2A2A2A] transition-all duration-200 w-full sm:w-fit" onClick={() => handleSuggestedQuestion("What's the primarily reason of Bitcoin falling recently?")}>
                     <span className="text-white font-urbanist font-medium text-xs sm:text-sm">What's the primarily reason of Bitcoin falling recently?</span>
                     <MoveRight className="text-white h-3.5 w-3.5 sm:h-4 sm:w-4 ml-2 flex-shrink-0" />
                   </div>
                  <div className="bg-[#1A1A1A] border border-[#282828] rounded-lg p-2.5 sm:p-3 flex items-center justify-between cursor-pointer hover:bg-[#2A2A2A] transition-all duration-200 w-full sm:w-fit" onClick={() => handleSuggestedQuestion('Which airdrop to target right now in coming 2026?')}>
                     <span className="text-white font-urbanist font-medium text-xs sm:text-sm">Which airdrop to target right now in coming 2026?</span>
                     <MoveRight className="text-white h-3.5 w-3.5 sm:h-4 sm:w-4 ml-2 flex-shrink-0" />
                   </div>
                 </div>
                 
                 <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto justify-center">
                  <div className="bg-[#1A1A1A] border border-[#282828] rounded-lg p-2.5 sm:p-3 flex items-center justify-between cursor-pointer hover:bg-[#2A2A2A] transition-all duration-200 w-full sm:w-fit" onClick={() => handleSuggestedQuestion('Should I invest in Bitcoin now?')}>
                     <span className="text-white font-urbanist font-medium text-xs sm:text-sm">Should I invest in Bitcoin now?</span>
                     <MoveRight className="text-white h-3.5 w-3.5 sm:h-4 sm:w-4 ml-2 flex-shrink-0" />
                   </div>
                 </div>
               </div>
             </div>
          </div>
        ) : (
          <div className="flex-1 w-full max-w-5xl rounded-2xl lg:rounded-3xl bg-[#141414] p-3 sm:p-4 lg:p-6 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto rounded-xl lg:rounded-2xl border border-[#1F1F1F] bg-[#0F0F0F]/80 p-3 lg:p-4 space-y-3 lg:space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} gap-2`}>
                  {message.chartType === 'btc' ? (
                    <div className="w-full rounded-xl lg:rounded-2xl border border-[#1F1F1F] bg-[#121212] p-3 lg:p-4">
                      <div className="mb-2 lg:mb-3 font-urbanist text-xs lg:text-sm font-medium text-white">{message.content}</div>
                      <div className="rounded-lg lg:rounded-xl bg-[#0B0B0B] p-2 lg:p-3">
                        <BTCPriceChart />
                      </div>
                      <div className="mt-2 lg:mt-3 font-urbanist text-xs lg:text-sm leading-none tracking-[0%] text-[#808080]">
                        Displaying sample BTC closing prices for illustrative purposes.
                      </div>
                    </div>
                  ) : message.role === 'user' ? (
                    <div className="max-w-[85%] lg:max-w-[75%] rounded-xl lg:rounded-2xl px-3 py-2 lg:px-4 lg:py-3 text-xs lg:text-sm leading-relaxed font-urbanist bg-[#45FFAE]/15 text-[#45FFAE]">
                      {message.content}
                    </div>
                  ) : (
                    <TypingAssistantMessage 
                      message={message} 
                      isTyping={typingMessageIds.has(message.id)}
                      formatMarkdown={formatMarkdown}
                    />
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
        )}
           </div>
           </div>

           {/* Input Area - Always at bottom */}
           <div className="flex flex-col gap-2.5 lg:gap-3.5 w-full max-w-5xl lg:h-40 bg-[#141414] rounded-lg p-3 lg:p-4 justify-between flex-shrink-0">
               
               <div className="flex flex-row items-center justify-between">
                       <div className="flex flex-row gap-1 lg:gap-2 items-center">
                            <img src={bolt} alt="bolt"  className="h-2.5 w-2.5 lg:h-3 lg:w-3"/>
                            <div className="font-urbanist font-medium text-xs lg:text-sm leading-none tracking-[0%] text-[#808080]">Unlock more with paid plans</div>
                            <MoveRight className="text-[#808080] text-center h-3 w-3 lg:h-4 lg:w-4"/>
                       </div>
               </div>



          <div className="h-auto lg:h-28 w-full bg-[#1A1A1A] rounded-lg flex flex-row p-2 lg:p-2 items-start justify-between" >

            <div className="flex flex-row items-center justify-between gap-1.5 lg:gap-2 flex-1">
                <input 
                  ref={inputRef}
                  type="text" 
                  placeholder="Ask me anything" 
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="font-urbanist font-medium text-sm lg:text-base text-[#FFFFFF] bg-transparent outline-none focus:outline-none focus:ring-0 focus:border-none flex-1 placeholder-[#3E3E3E]"
                />
            </div>

            <ArrowUp 
              className={`h-3.5 w-3.5 lg:h-4 lg:w-4 cursor-pointer transition-all duration-200 ${(inputValue.trim() || buildQueryFromTags()) ? 'text-[#45FFAE] hover:scale-110' : 'text-[#808080]'}`} 
              onClick={handleSubmit}
            />

         </div>

         <div className="flex flex-row items-center justify-start gap-2 lg:gap-4 flex-wrap">

              <div className="relative" ref={dropdownRef}>
                <button className="flex flex-row items-center justify-center gap-1.5 lg:gap-2 bg-black bg-opacity-70 rounded-lg px-2.5 lg:px-3 py-1.5 lg:py-2 cursor-pointer w-fit h-8 lg:h-10 hover:bg-opacity-80" onClick={() => isDropdownOpen ? closeAllModals() : openDropdown()}>
                  <img src={cryptoTrade} alt="crypto" className="h-3.5 w-3.5 lg:h-4 lg:w-4"/>
                  <div className="font-urbanist font-medium text-xs lg:text-sm leading-none tracking-[0%] text-[#FFFFFF]">Crypto</div>
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
                <button className="flex flex-row items-center justify-center gap-1.5 lg:gap-2 bg-black bg-opacity-70 rounded-lg px-2.5 lg:px-3 py-1.5 lg:py-2 cursor-pointer w-fit h-8 lg:h-10 hover:bg-opacity-80" onClick={() => isTfOpen ? closeAllModals() : openTf()}>
                  <div className="font-urbanist font-medium text-xs lg:text-sm leading-none tracking-[0%] text-[#FFFFFF]">{selectedTimeframe ?? 'Timeframe'}</div>
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
                <button className="flex flex-row items-center justify-center gap-1.5 lg:gap-2 bg-black bg-opacity-70 rounded-lg px-2.5 lg:px-3 py-1.5 lg:py-2 cursor-pointer w-fit h-8 lg:h-10 hover:bg-opacity-80" onClick={() => isAnalysisOpen ? closeAllModals() : openAnalysis()}>
                  <div className="font-urbanist font-medium text-xs lg:text-sm leading-none tracking-[0%] text-[#FFFFFF]">{selectedAnalysis ?? 'Analysis'}</div>
                   <ArrowUp className={`text-[#808080] h-3 w-3 transition-transform ${isAnalysisOpen ? 'rotate-180' : ''}`}/>
                </button>
                {isAnalysisOpen && (
                   <div className="absolute bottom-full left-0 z-50 mb-3 w-48 rounded-xl border border-gray-700 bg-[#1A1A1A] p-1 shadow-xl">
                     <div className="max-h-48 overflow-y-auto rounded-lg bg-[#121212]">
                      {['Sentiment','Accuracy'].map(v => (
                        <div key={v} className="px-3 py-2 cursor-pointer hover:bg-[#222] text-[#E0E0E0] font-urbanist text-sm text-center" onClick={() => { setSelectedAnalysis(v); setIsAnalysisOpen(false) }}>{v}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Assets Dropdown */}
              <div className="relative" ref={assetsRef}>
                <button className="flex flex-row items-center justify-center gap-1.5 lg:gap-2 bg-black bg-opacity-70 rounded-lg px-2.5 lg:px-3 py-1.5 lg:py-2 cursor-pointer w-fit h-8 lg:h-10 hover:bg-opacity-80" onClick={() => isAssetsOpen ? closeAllModals() : openAssets()}>
                  <div className="font-urbanist font-medium text-xs lg:text-sm leading-none tracking-[0%] text-[#FFFFFF]">{selectedAsset ?? 'Assets'}</div>
                   <ArrowUp className={`text-[#808080] h-3 w-3 transition-transform ${isAssetsOpen ? 'rotate-180' : ''}`}/>
                </button>
                {isAssetsOpen && (
                   <div className="absolute bottom-full left-0 z-50 mb-3 w-48 rounded-xl border border-gray-700 bg-[#1A1A1A] p-1 shadow-xl">
                     <div className="max-h-48 overflow-y-auto rounded-lg bg-[#121212]">
                      {['BTC','ETH','SOL','XRP','AAVE','UNI','BNB','ADA','DOGE','SUI','TRX','LINK'].map(v => (
                        <div key={v} className="px-3 py-2 cursor-pointer hover:bg-[#222] text-[#E0E0E0] font-urbanist text-sm text-center" onClick={() => { setSelectedAsset(v); setIsAssetsOpen(false) }}>{v}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Score Dropdown */}
              <div className="relative" ref={scoreRef}>
                <button className="flex flex-row items-center justify-center gap-1.5 lg:gap-2 bg-black bg-opacity-70 rounded-lg px-2.5 lg:px-3 py-1.5 lg:py-2 cursor-pointer w-fit h-8 lg:h-10 hover:bg-opacity-80" onClick={() => isScoreOpen ? closeAllModals() : openScore()}>
                  <div className="font-urbanist font-medium text-xs lg:text-sm leading-none tracking-[0%] text-[#FFFFFF]">{selectedScore ?? 'Score'}</div>
                   <ArrowUp className={`text-[#808080] h-3 w-3 transition-transform ${isScoreOpen ? 'rotate-180' : ''}`}/>
                </button>
                {isScoreOpen && (
                   <div className="absolute bottom-full left-0 z-50 mb-3 w-48 rounded-xl border border-gray-700 bg-[#1A1A1A] p-1 shadow-xl">
                     <div className="max-h-48 overflow-y-auto rounded-lg bg-[#121212]">
                      {['Logical','Sentiment'].map(v => (
                        <div key={v} className="px-3 py-2 cursor-pointer hover:bg-[#222] text-[#E0E0E0] font-urbanist text-sm text-center" onClick={() => { setSelectedScore(v); setIsScoreOpen(false) }}>{v}</div>
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
