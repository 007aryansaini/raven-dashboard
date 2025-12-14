
import { ArrowUp } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAccount } from 'wagmi'
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from '../firebase'
import { toast } from 'react-toastify'
import blackDot from "../assets/blackDot.svg"
import { CHAT_API_BASE } from "../utils/constants"
import { authorizeInference, type AuthorizeInferenceResponse } from "../utils/inference"
import { useUserMetrics } from "../contexts/UserMetricsContext"
import { useTypingEffect } from "../utils/useTypingEffect"
import { useSequentialTyping } from "../utils/useSequentialTyping"

type ChatMessage = {
  id: number
  role: "user" | "assistant"
  content: string
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
  // Sequential typing: reasoning first, then answer
  // Always show full text if not typing, or if typing is disabled
  const { displayedFirst: displayedReasoning, displayedSecond: displayedAnswer, isFirstComplete } = useSequentialTyping(
    message.reasoning || '',
    message.answer || '',
    8,
    isTyping && !!(message.reasoning || message.answer)
  )
  
  // Ensure full content is displayed when typing completes or is disabled
  const finalReasoning = isTyping ? displayedReasoning : (message.reasoning || '')
  const finalAnswer = isTyping ? displayedAnswer : (message.answer || '')
  
  // For content without reasoning/answer structure
  const displayedContent = useTypingEffect(message.content, 8, isTyping && !message.reasoning && !message.answer)

  return (
    <div className="max-w-[90%] lg:max-w-[85%] flex flex-col gap-3 lg:gap-4">
      {message.reasoning && (
        <div className="rounded-xl lg:rounded-2xl px-4 py-3 lg:px-5 lg:py-4 bg-[#1F1F1F] border border-[#2A2A2A]">
          <div 
            className="font-semibold text-base text-[#45FFAE] mb-3"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif" }}
          >
            Reasoning
          </div>
          <div 
            className="text-xs lg:text-sm leading-relaxed text-[#FFFFFF] prose prose-invert max-w-none"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif" }}
            dangerouslySetInnerHTML={{ __html: formatMarkdown(finalReasoning) }}
          />
        </div>
      )}
      {message.answer && isFirstComplete && (
        <div className="rounded-xl lg:rounded-2xl px-4 py-3 lg:px-5 lg:py-4 bg-[#1F1F1F] text-[#FFFFFF]">
          <div 
            className="font-semibold text-base text-[#45FFAE] mb-3"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif" }}
          >
            Answer
          </div>
          <div 
            className="text-xs lg:text-sm leading-relaxed"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif" }}
            dangerouslySetInnerHTML={{ __html: formatMarkdown(finalAnswer) }}
          />
        </div>
      )}
      {!message.reasoning && !message.answer && (
        <div className="rounded-xl lg:rounded-2xl px-4 py-3 lg:px-5 lg:py-4 text-xs lg:text-sm leading-relaxed bg-[#1F1F1F] text-[#FFFFFF]">
          <div 
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif" }}
            dangerouslySetInnerHTML={{ __html: formatMarkdown(displayedContent) }}
          />
        </div>
      )}
    </div>
  )
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
  const [typingMessageIds, setTypingMessageIds] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Clear messages when navigating to this screen (detect route changes)
  useEffect(() => {
    if (location.pathname === '/' || location.pathname === '/home') {
      setMessages([])
      setTypingMessageIds(new Set())
      setInputValue("")
    }
  }, [location.pathname])

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
    
    // Helper function to bold mathematical numbers in green
    const boldNumbers = (str: string) => {
      // Match numbers (integers, decimals, percentages, currency, etc.)
      // Pattern matches: numbers, decimals, percentages, currency symbols with numbers
      // Make them bold and green (#45FFAE) like headings
      return str.replace(/(\d+\.?\d*%?|\$[\d,]+\.?\d*|€[\d,]+\.?\d*|£[\d,]+\.?\d*|[\d,]+\.\d+)/g, '<strong class="font-semibold text-[#45FFAE]">$1</strong>')
    }
    
    // Comprehensive initial cleanup of all HTML artifacts and malformed patterns
    text = text
      // Remove all variations of color code artifacts
      .replace(/\[#?45FFAE\]"?>/g, '')
      .replace(/45FFAE\]"?>/g, '')
      .replace(/FFAE\]"?>/g, '')
      .replace(/\[#45FFAE\]/g, '')
      .replace(/45FFAE\]/g, '')
      .replace(/FFAE\]/g, '')
      // Remove malformed class attributes
      .replace(/text-\[#45FFAE\]"?>/g, '')
      .replace(/class="text-\[#45FFAE\]"?>/g, '')
      .replace(/class="text-\[#45FFAE\]/g, '')
      // Remove standalone malformed closing tags
      .replace(/\s+FFAE\]/g, '')
      .replace(/\s+45FFAE\]/g, '')
      // Fix malformed strong tags
      .replace(/<strong class="text-\[#45FFAE\]">/g, '<strong class="text-[#45FFAE]">')
    
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
          formattedLines.push('<div class="my-3 space-y-1">')
        }
        const cells = line.split('|').filter(cell => cell.trim() && !cell.trim().match(/^:?-+:?$/))
        if (cells.length > 0) {
          formattedLines.push(
            `<div class="flex gap-3 py-2 border-b border-[#2A2A2A]">${cells.map(cell => 
              `<span class="text-[#E0E0E0] flex-1">${boldNumbers(cell.trim())}</span>`
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
          const escapedText = line.trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
          formattedLines.push(`<div class="font-semibold text-base text-[#45FFAE] mb-4 mt-5" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;">${escapedText}</div>`)
          continue
        }
        
        // Handle section headings like "**Key implications**" - make them green and bold
        const sectionHeadingMatch = line.match(/^\*\*(.+?)\*\*\s*$/)
        if (sectionHeadingMatch && !line.match(/^\*\*REASONING\*\*/i) && !line.match(/^\*\*ANSWER\*\*/i)) {
          const headingText = sectionHeadingMatch[1]
          formattedLines.push(`<div class="font-semibold text-sm text-[#45FFAE] mt-4 mb-3" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;">${boldNumbers(headingText)}</div>`)
          continue
        }
        
        // Handle numbered list items (e.g., "1. **Macro momentum** – ...")
        // Format as list items with bold headings
        const numberedHeadingMatch = line.match(/^(\d+\.)\s+(.+)$/)
        if (numberedHeadingMatch) {
          const headingText = numberedHeadingMatch[2]
          // Process bold text and numbers
          const processedHeading = headingText.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#45FFAE]">$1</strong>')
          // Format as a numbered list item
          formattedLines.push(`<div class="my-2"><strong class="text-[#45FFAE]">${numberedHeadingMatch[1]}</strong> ${boldNumbers(processedHeading)}</div>`)
          continue
        }
        
        // Handle bullet points FIRST (before processing bold text) to preserve structure
        const bulletMatch = line.match(/^(\*|\-)\s+(.+)$/)
        if (bulletMatch) {
          let bulletContent = bulletMatch[2]
          // Process bold text within bullet points
          bulletContent = bulletContent.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#45FFAE]">$1</strong>')
          // Bold mathematical numbers in bullet content
          bulletContent = boldNumbers(bulletContent)
          formattedLines.push(`<div class="ml-4 my-2">• ${bulletContent}</div>`)
          continue
        }
        
        // Handle bold **text** - convert to green and ensure proper line breaks
        let processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#45FFAE]">$1</strong>')
        
        // Remove any HTML artifacts with comprehensive cleanup
        processedLine = processedLine
          .replace(/\[#?45FFAE\]"?>/g, '')
          .replace(/45FFAE\]"?>/g, '')
          .replace(/FFAE\]"?>/g, '')
          .replace(/\[#45FFAE\]/g, '')
          .replace(/45FFAE\]/g, '')
          .replace(/FFAE\]/g, '')
          .replace(/text-\[#45FFAE\]"?>/g, '')
          .replace(/class="text-\[#45FFAE\]"?>/g, '')
          .replace(/class="text-\[#45FFAE\]/g, '')
          .replace(/<strong class="text-\[#45FFAE\]">/g, '<strong class="text-[#45FFAE]">')
        
        // Bold mathematical numbers
        processedLine = boldNumbers(processedLine)
        
        // If line is not empty or already processed, add it
        if (processedLine.trim() || line.trim() === '') {
          formattedLines.push(processedLine || '<br />')
        }
      }
    }
    
    if (inTable) {
      formattedLines.push('</div>')
    }
    
    let finalOutput = formattedLines.join('\n')
    
    // Final comprehensive cleanup of any remaining HTML artifacts
    finalOutput = finalOutput
      // Remove all variations of color code artifacts
      .replace(/\[#?45FFAE\]"?>/g, '')
      .replace(/45FFAE\]"?>/g, '')
      .replace(/FFAE\]"?>/g, '')
      .replace(/\[#45FFAE\]/g, '')
      .replace(/45FFAE\]/g, '')
      .replace(/FFAE\]/g, '')
      // Remove malformed class attributes
      .replace(/text-\[#45FFAE\]"?>/g, '')
      .replace(/class="text-\[#45FFAE\]"?>/g, '')
      .replace(/class="text-\[#45FFAE\]/g, '')
      // Remove standalone malformed patterns
      .replace(/\s+FFAE\]/g, '')
      .replace(/\s+45FFAE\]/g, '')
      // Fix malformed strong tags
      .replace(/<strong class="text-\[#45FFAE\]">/g, '<strong class="text-[#45FFAE]">')
    
    return finalOutput
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

      // Check authorization only if credits >= 6 or inference >= 2
      const shouldAuthorize = (creditsPending ?? 0) >= 6 || (inferenceRemaining ?? 0) >= 2
      let authorization: AuthorizeInferenceResponse = { allowed: true, reason: "", method: "credits", cost: 0 }
      
      if (shouldAuthorize) {
        authorization = await authorizeInference(address, {
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
      // Handle multiple possible structures:
      // 1. data.results[0].results[0].response.results[0].reasoning (nested response)
      // 2. data.results[0].results[0].reasoning (direct)
      let reasoning = ""
      let answer = ""

      if (data.success && data.results && data.results.length > 0) {
        const firstResult = data.results[0]
        if (firstResult.results && firstResult.results.length > 0) {
          const resultData = firstResult.results[0]
          
          // Check for nested response structure first
          if (resultData.response && resultData.response.results && resultData.response.results.length > 0) {
            const nestedResult = resultData.response.results[0]
            reasoning = (nestedResult.reasoning || "").trim()
            answer = (nestedResult.answer || "").trim()
          } else {
            // Fallback to direct structure
            reasoning = (resultData.reasoning || "").trim()
            answer = (resultData.answer || "").trim()
          }
        }
      }

      // Clean up HTML artifacts helper
      const cleanHtmlArtifacts = (text: string) => {
        return text
          .replace(/45FFAE]">/g, '')
          .replace(/45FFAE]/g, '')
          .replace(/\[#45FFAE\]">/g, '')
          .replace(/\[#45FFAE\]/g, '')
      }

      // Clean artifacts from both fields
      reasoning = cleanHtmlArtifacts(reasoning)
      answer = cleanHtmlArtifacts(answer)
      
      // Process reasoning field - it may contain both reasoning AND answer text separated by "**ANSWER**"
      if (reasoning) {
        // Check if reasoning contains "**ANSWER**" marker
        // Split on "**ANSWER**" to separate reasoning from answer text
        const answerSplit = reasoning.split(/\n\s*\*\*ANSWER\*\*\s*\n/i)
        
        if (answerSplit.length > 1) {
          // There's an "**ANSWER**" marker in the middle
          // Everything before "**ANSWER**" is reasoning
          const reasoningText = answerSplit[0].trim()
          // Everything after "**ANSWER**" is answer text from reasoning field
          const answerTextFromReasoning = answerSplit.slice(1).join('\n').trim()
          
          // Clean reasoning: remove "**REASONING**" header at start
          reasoning = reasoningText
            .replace(/^\s*\*\*REASONING\*\*\s*\n*/i, '')
            .replace(/^\s*REASONING\s*\n*/i, '')
            .trim()
          
          // Combine answer from reasoning with separate answer field
          if (answerTextFromReasoning && answer) {
            answer = `${answerTextFromReasoning}\n\n${answer}`.trim()
          } else if (answerTextFromReasoning) {
            answer = answerTextFromReasoning
          }
          // If only answer exists (no text after ANSWER in reasoning), keep it as-is
        } else {
          // No "**ANSWER**" marker - just clean up reasoning
          reasoning = reasoning
            .replace(/^\s*\*\*REASONING\*\*\s*\n*/i, '')
            .replace(/^\s*REASONING\s*\n*/i, '')
            .trim()
        }
      }

      // Clean up answer: remove "**ANSWER**" header if present at the start
      if (answer) {
        answer = answer
          .replace(/^\s*\*\*ANSWER\*\*\s*\n*/i, '')
          .replace(/^\s*ANSWER\s*\n*/i, '')
          .trim()
      }

      // Add assistant message with reasoning and answer
      const newMessageId = Date.now() + 1
      setMessages((prev) => {
        const newMessages: ChatMessage[] = [
          ...prev,
          {
            id: newMessageId,
            role: "assistant" as const,
            content: answer || "No answer available",
            reasoning: reasoning || undefined,
            answer: answer || undefined,
          },
        ]
        return newMessages
      })
      // Mark this message for typing effect
      setTypingMessageIds((prev) => new Set(prev).add(newMessageId))

      void refreshMetrics()
    } catch (error: any) {
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
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    // Prevent multiple submissions while loading
    if (isLoading) {
      return
    }

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
    if (e.key === 'Enter' && !isLoading) {
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
               <div className="font-urbanist font-medium text-xl sm:text-2xl lg:text-3xl leading-tight tracking-[0%] text-[#FFFFFF] px-2">Artificial Prediction Intelligence</div>
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
                 <div className="flex-1 min-h-0 overflow-y-auto rounded-xl lg:rounded-2xl border border-[#1F1F1F] bg-[#0F0F0F]/80 p-3 lg:p-4 space-y-4 lg:space-y-5">
                   {messages.map((message) => (
                     <div key={message.id} className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} gap-2`}>
                       {message.role === 'user' ? (
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
                   disabled={isLoading}
                   className={`font-urbanist font-medium text-sm lg:text-base text-[#FFFFFF] placeholder-[#3E3E3E] focus:outline-none sm:text-lg bg-transparent flex-1 ${
                     isLoading ? 'opacity-50 cursor-not-allowed' : ''
                   }`}
                 />
               </div>

               <button
                 type="button"
                 onClick={handleSubmit}
                 disabled={!inputValue.trim() || isLoading}
                 className={`flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-full border transition-all duration-200 ${
                   isLoading
                     ? 'border-transparent bg-[#2A2A2A] text-[#808080] cursor-not-allowed opacity-50'
                     : inputValue.trim()
                       ? 'border-[#45FFAE] bg-[#45FFAE]/10 text-[#45FFAE] hover:bg-[#45FFAE]/20 cursor-pointer'
                       : 'border-transparent bg-[#2A2A2A] text-[#808080] cursor-not-allowed'
                 }`}
                 aria-label="Submit query"
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
