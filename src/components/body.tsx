import { ArrowUp, MoveRight, ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState, useEffect, useMemo } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAccount } from 'wagmi'
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from '../firebase'
import { toast } from 'react-toastify'
import bolt from "../assets/bolt.svg"
import { CHAT_API_BASE } from "../utils/constants"
import { authorizeInference, recordInference, type AuthorizeInferenceResponse } from "../utils/inference"
import { useUserMetrics } from "../contexts/UserMetricsContext"
import polymarketLogo from "../assets/polymarketLogo.svg"
import PolymarketEventCard from "./PolymarketEventCard"
import { PolymarketFetcher, type PolymarketEvent, type PolymarketMarket } from "../utils/polymarketFetcher"
import { useTypingEffect } from "../utils/useTypingEffect"

type ChatMessage = {
  id: number
  role: "user" | "assistant"
  content: string
  imageSrc?: string
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

// Polymarket fetcher instance
const polymarketFetcher = new PolymarketFetcher()

const body = () => {
  const { isConnected, address } = useAccount()
  const { refreshMetrics, creditsPending, inferenceRemaining } = useUserMetrics()
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
  const [isScoreOpen, setIsScoreOpen] = useState(false)

  // Helper function to close all modals
  const closeAllModals = () => {
    setIsDropdownOpen(false)
    setIsLiquidityOpen(false)
    setIsVolumeOpen(false)
    setIsTimeframeOpen(false)
    setIsNewestOpen(false)
    setIsEndingSoonOpen(false)
    setIsScoreOpen(false)
  }

  // Helper functions to open specific modal and close others
  const openDropdown = () => {
    closeAllModals()
    setIsDropdownOpen(true)
  }

  const openLiquidity = () => {
    closeAllModals()
    setIsLiquidityOpen(true)
  }

  const openVolume = () => {
    closeAllModals()
    setIsVolumeOpen(true)
  }

  const openTimeframe = () => {
    closeAllModals()
    setIsTimeframeOpen(true)
  }

  const openNewest = () => {
    closeAllModals()
    setIsNewestOpen(true)
  }

  const openEndingSoon = () => {
    closeAllModals()
    setIsEndingSoonOpen(true)
  }

  const openScore = () => {
    closeAllModals()
    setIsScoreOpen(true)
  }
  const [selectedLiquidity, setSelectedLiquidity] = useState<string | null>(null)
  const [selectedVolume, setSelectedVolume] = useState<string | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState<string | null>(null)
  const [selectedNewest, setSelectedNewest] = useState<string | null>(null)
  const [selectedEndingSoon, setSelectedEndingSoon] = useState<string | null>(null)
  const [selectedScore, setSelectedScore] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [typingMessageIds, setTypingMessageIds] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCardImage, setSelectedCardImage] = useState<string | null>(null)
  const [polymarketEvents, setPolymarketEvents] = useState<Array<{ event: PolymarketEvent; market?: PolymarketMarket }>>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [eventsError, setEventsError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const liquidityRef = useRef<HTMLDivElement>(null)
  const volumeRef = useRef<HTMLDivElement>(null)
  const timeframeRef = useRef<HTMLDivElement>(null)
  const newestRef = useRef<HTMLDivElement>(null)
  const endingSoonRef = useRef<HTMLDivElement>(null)
  const scoreRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  
  const autoPlayInterval = 4000 // 4 seconds between slides

  // Clear messages when navigating to this screen (detect route changes or navigation state)
  useEffect(() => {
    if (location.pathname === '/polymarket') {
      setMessages([])
      setTypingMessageIds(new Set())
      setInputValue("")
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

  // Fetch Polymarket events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoadingEvents(true)
      setEventsError(null)
      
      try {
        const eventsWithMarkets = await polymarketFetcher.fetchEventsWithMarkets(100)
        
        if (eventsWithMarkets.length === 0) {
          setEventsError('No events found. Please try again later.')
          toast.warning('No Polymarket events available', {
            style: { fontSize: '12px' }
          })
        } else {
          setPolymarketEvents(eventsWithMarkets)
          console.log('Fetched Polymarket events:', eventsWithMarkets.length, 'events')
        }
      } catch (error: any) {
        console.error('Error fetching Polymarket events:', error)
        const errorMessage = 'Failed to load events. Please check your connection and try again.'
        setEventsError(errorMessage)
        toast.error(errorMessage, {
          style: { fontSize: '12px' },
          autoClose: 5000,
        })
      } finally {
        setIsLoadingEvents(false)
      }
    }

    fetchEvents()
  }, [])

  // Sort and filter events based on selected options
  const sortedEvents = useMemo(() => {
    let filtered = [...polymarketEvents]

    // Helper function to get liquidity value (from event or market)
    const getLiquidity = (item: { event: PolymarketEvent; market?: PolymarketMarket }) => {
      return item.market?.liquidity ?? item.event.liquidity ?? 0
    }

    // Helper function to get volume value (from event or market)
    const getVolume = (item: { event: PolymarketEvent; market?: PolymarketMarket }) => {
      return item.market?.volume ?? item.event.volume ?? 0
    }

    // Helper function to get end date
    const getEndDate = (item: { event: PolymarketEvent; market?: PolymarketMarket }) => {
      if (item.market?.endDate) return new Date(item.market.endDate).getTime()
      if (item.event.endDate) return new Date(item.event.endDate).getTime()
      return 0
    }

    // Filter by Liquidity
    if (selectedLiquidity) {
      const allLiquidity = filtered.map(getLiquidity).filter(v => v > 0)
      if (allLiquidity.length > 0) {
        const maxLiquidity = Math.max(...allLiquidity)
        const minLiquidity = Math.min(...allLiquidity)
        const midLiquidity = (maxLiquidity + minLiquidity) / 2
        
        if (selectedLiquidity === 'High') {
          filtered = filtered.filter(item => {
            const liq = getLiquidity(item)
            return liq >= midLiquidity
          })
        } else if (selectedLiquidity === 'Low') {
          filtered = filtered.filter(item => {
            const liq = getLiquidity(item)
            return liq < midLiquidity
          })
        } else if (selectedLiquidity === 'Medium') {
          filtered = filtered.filter(item => {
            const liq = getLiquidity(item)
            const lowerThird = minLiquidity + (maxLiquidity - minLiquidity) / 3
            const upperThird = minLiquidity + 2 * (maxLiquidity - minLiquidity) / 3
            return liq >= lowerThird && liq <= upperThird
          })
        }
      }
    }

    // Filter by Volume
    if (selectedVolume) {
      const allVolume = filtered.map(getVolume).filter(v => v > 0)
      if (allVolume.length > 0) {
        const maxVolume = Math.max(...allVolume)
        const minVolume = Math.min(...allVolume)
        const midVolume = (maxVolume + minVolume) / 2
        
        if (selectedVolume === 'High') {
          filtered = filtered.filter(item => {
            const vol = getVolume(item)
            return vol >= midVolume
          })
        } else if (selectedVolume === 'Low') {
          filtered = filtered.filter(item => {
            const vol = getVolume(item)
            return vol < midVolume
          })
        } else if (selectedVolume === 'Medium') {
          filtered = filtered.filter(item => {
            const vol = getVolume(item)
            const lowerThird = minVolume + (maxVolume - minVolume) / 3
            const upperThird = minVolume + 2 * (maxVolume - minVolume) / 3
            return vol >= lowerThird && vol <= upperThird
          })
        }
      }
    }

    // Filter by Timeframe (events ending within the timeframe)
    if (selectedTimeframe) {
      const now = Date.now()
      let timeframeMs = 0
      
      switch (selectedTimeframe) {
        case '1h': timeframeMs = 60 * 60 * 1000; break
        case '4h': timeframeMs = 4 * 60 * 60 * 1000; break
        case '12h': timeframeMs = 12 * 60 * 60 * 1000; break
        case '24h': timeframeMs = 24 * 60 * 60 * 1000; break
        case '3d': timeframeMs = 3 * 24 * 60 * 60 * 1000; break
        case '7d': timeframeMs = 7 * 24 * 60 * 60 * 1000; break
        case '30d': timeframeMs = 30 * 24 * 60 * 60 * 1000; break
        case '90d': timeframeMs = 90 * 24 * 60 * 60 * 1000; break
        case 'YTD': {
          const yearStart = new Date(new Date().getFullYear(), 0, 1).getTime()
          timeframeMs = now - yearStart
          break
        }
        case '1y': timeframeMs = 365 * 24 * 60 * 60 * 1000; break
      }
      
      if (timeframeMs > 0) {
        const endTime = now + timeframeMs
        filtered = filtered.filter(item => {
          const endDate = getEndDate(item)
          return endDate > now && endDate <= endTime
        })
      }
    }

    // Filter by Newest (creation date)
    if (selectedNewest) {
      const now = Date.now()
      let timeAgoMs = 0
      
      switch (selectedNewest) {
        case 'Today': timeAgoMs = 24 * 60 * 60 * 1000; break
        case 'This Week': timeAgoMs = 7 * 24 * 60 * 60 * 1000; break
        case 'This Month': timeAgoMs = 30 * 24 * 60 * 60 * 1000; break
      }
      
      if (timeAgoMs > 0) {
        // Since we don't have creation date, we'll filter by events that are still active
        // and haven't ended yet, or use endDate as a proxy
        filtered = filtered.filter(item => {
          const endDate = getEndDate(item)
          // Keep events that are ending in the future (recently created)
          return endDate > now
        })
      }
    }

    // Filter by Ending Soon timeframe first
    if (selectedEndingSoon) {
      const now = Date.now()
      let timeframeMs = 0
      
      switch (selectedEndingSoon) {
        case '1h': timeframeMs = 60 * 60 * 1000; break
        case '6h': timeframeMs = 6 * 60 * 60 * 1000; break
        case '12h': timeframeMs = 12 * 60 * 60 * 1000; break
        case '24h': timeframeMs = 24 * 60 * 60 * 1000; break
        case '3d': timeframeMs = 3 * 24 * 60 * 60 * 1000; break
        case '7d': timeframeMs = 7 * 24 * 60 * 60 * 1000; break
      }
      
      if (timeframeMs > 0) {
        const endTime = now + timeframeMs
        filtered = filtered.filter(item => {
          const endDate = getEndDate(item)
          return endDate > now && endDate <= endTime
        })
      }
      
      // Sort by end date (ascending - closest first) after filtering
      filtered.sort((a, b) => {
        const endDateA = getEndDate(a)
        const endDateB = getEndDate(b)
        return endDateA - endDateB // Ascending: closest first
      })
    }

    // Sort by Liquidity (High = descending, Low = ascending)
    if (selectedLiquidity === 'High' || selectedLiquidity === 'Low') {
      filtered.sort((a, b) => {
        const liqA = getLiquidity(a)
        const liqB = getLiquidity(b)
        return selectedLiquidity === 'High' ? liqB - liqA : liqA - liqB
      })
    }

    // Sort by Volume (High = descending, Low = ascending)
    if (selectedVolume === 'High' || selectedVolume === 'Low') {
      filtered.sort((a, b) => {
        const volA = getVolume(a)
        const volB = getVolume(b)
        return selectedVolume === 'High' ? volB - volA : volA - volB
      })
    }

    // Default sort by volume (descending) if no specific sorting is selected
    if (!selectedLiquidity && !selectedVolume && !selectedEndingSoon) {
      filtered.sort((a, b) => {
        const volA = getVolume(a)
        const volB = getVolume(b)
        return volB - volA // Descending: highest volume first
      })
    }

    return filtered
  }, [polymarketEvents, selectedLiquidity, selectedVolume, selectedTimeframe, selectedNewest, selectedEndingSoon])

  // Calculate total slides based on sorted events (3 cards per slide)
  const totalSlides = Math.max(1, Math.ceil(sortedEvents.length / 3))

  // Reset current slide when sorted events change or sorting options change
  useEffect(() => {
    const newTotalSlides = Math.max(1, Math.ceil(sortedEvents.length / 3))
    if (currentSlide >= newTotalSlides || newTotalSlides === 1) {
      setCurrentSlide(0)
    }
  }, [sortedEvents.length, currentSlide, selectedLiquidity, selectedVolume, selectedTimeframe, selectedNewest, selectedEndingSoon])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleCardClick = (eventTitle: string, eventId?: string, eventImageUrl?: string) => {
    // Prevent interaction while loading
    if (isLoading) {
      return
    }

    console.log("Event card clicked - Question:", eventTitle, "Event ID:", eventId, "Image URL:", eventImageUrl)
    
    // Set the input value to the question
    setInputValue(eventTitle)
    console.log("Input value set to:", eventTitle)
    
    // Store the event image URL if available (for display in chat)
    if (eventImageUrl) {
      setSelectedCardImage(eventImageUrl)
      console.log("Card image URL set to:", eventImageUrl)
    } else if (eventId) {
      // Fallback to event ID if no image URL
      setSelectedCardImage(eventId)
    }
    
    // Auto-focus the input field
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        console.log("Input field focused, current value:", inputRef.current.value)
      }
    }, 100)
  }

  // Handle direct submission from "Ask Raven" button on card
  const handleAskRavenClick = async (eventTitle: string, _eventId?: string, eventImageUrl?: string) => {
    // Prevent multiple submissions while loading
    if (isLoading) {
      return
    }

    console.log("Ask Raven clicked - Question:", eventTitle, "Image URL:", eventImageUrl)
    
    // Validate before proceeding
    if (!twitterUser) {
      toast.warning('Please login with X (Twitter) to send messages', {
        style: { fontSize: '12px' }
      })
      return
    }

    if (!isConnected) {
      toast.warning('Please connect your wallet to send messages', {
        style: { fontSize: '12px' }
      })
      return
    }

    const credits = creditsPending ?? 0
    const inference = inferenceRemaining ?? 0
    if (credits === 0 && inference === 0) {
      toast.warning('You have no credits or inference remaining. Please upgrade your plan to continue.', {
        style: { fontSize: '12px' }
      })
      return
    }

    // Store the image URL
    const imageUrl = (eventImageUrl || '').trim()
    const cardImageToUse = imageUrl && imageUrl !== '' ? imageUrl : undefined
    
    // Create user message with image
    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: eventTitle,
      imageSrc: cardImageToUse
    }
    
    console.log("Submitting directly to chat - Question:", eventTitle, "Image:", cardImageToUse)
    
    // Add message to chat
    setMessages((prev) => [...prev, userMessage])
    
    // Clear input and selected card
    setInputValue("")
    setSelectedCardImage(null)
    
    // Call API
    await callAPI(eventTitle)
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
    return `${CHAT_API_BASE}polymarket-predict`
  }

  // Build query from selected tags
  const buildQueryFromTags = (): string | null => {
    const tags: string[] = []
    
    // Add liquidity if selected
    if (selectedLiquidity) {
      tags.push(selectedLiquidity.toLowerCase())
    }
    
    // Add volume if selected
    if (selectedVolume) {
      tags.push(selectedVolume.toLowerCase())
    }
    
    // Add timeframe if selected
    if (selectedTimeframe) {
      tags.push(selectedTimeframe.toLowerCase())
    }
    
    // Add newest if selected
    if (selectedNewest) {
      tags.push(selectedNewest.toLowerCase())
    }
    
    // Add ending soon if selected
    if (selectedEndingSoon) {
      tags.push(selectedEndingSoon.toLowerCase())
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
      const hasTags = Boolean(selectedLiquidity || selectedVolume || selectedTimeframe || selectedNewest || selectedEndingSoon || selectedScore)

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
      let authorization: AuthorizeInferenceResponse = { allowed: true, reason: "", method: "credits", cost: 0 }
      
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

      console.log("Building chat URL:", buildChatUrl())

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

      // Extract final_answer from the new polymarket-predict response structure
      let finalAnswer = ""

      if (data.success && data.result && data.result.final_answer) {
        finalAnswer = data.result.final_answer
      } else if (data.result && data.result.final_answer) {
        finalAnswer = data.result.final_answer
      } else {
        // Fallback: try to construct from other fields if final_answer is missing
        if (data.result) {
          const result = data.result
          if (result.answer) {
            finalAnswer = result.answer
          } else if (result.reasoning) {
            finalAnswer = result.reasoning
          }
        }
      }

      // Add assistant message with final_answer
      const newMessageId = Date.now() + 1
      setMessages((prev) => {
        const newMessages: ChatMessage[] = [
          ...prev,
          {
            id: newMessageId,
            role: "assistant" as const,
            content: finalAnswer || "No answer available",
            answer: finalAnswer || undefined,
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
      setSelectedLiquidity(null)
      setSelectedVolume(null)
      setSelectedTimeframe(null)
      setSelectedNewest(null)
      setSelectedEndingSoon(null)
      setSelectedScore(null)
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
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    // Prevent multiple submissions while loading
    if (isLoading) {
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

    // Store the selected card image before clearing - ensure it's a valid URL string
    const cardImageToUse = selectedCardImage && selectedCardImage.trim() !== '' 
      ? String(selectedCardImage).trim() 
      : undefined
    console.log("Submitting - Selected card image URL:", cardImageToUse, "Type:", typeof cardImageToUse)

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: finalQuery,
      imageSrc: cardImageToUse
    }
    
    console.log("User message created with imageSrc:", userMessage.imageSrc)

    console.log("User message created:", userMessage)

    setMessages((prev) => {
      console.log("Previous messages:", prev)
      const newMessages = [...prev, userMessage]
      console.log("New messages:", newMessages)
      return newMessages
    })
    setInputValue("")
    setSelectedCardImage(null) // Clear selected card after sending

    // Call API (wallet connection is already validated above)
    await callAPI(finalQuery)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit()
    }
  }

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const anyOpen = isDropdownOpen || isLiquidityOpen || isVolumeOpen || isTimeframeOpen || isNewestOpen || isEndingSoonOpen || isScoreOpen
    if (!anyOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (
        (dropdownRef.current && dropdownRef.current.contains(target)) ||
        (liquidityRef.current && liquidityRef.current.contains(target)) ||
        (volumeRef.current && volumeRef.current.contains(target)) ||
        (timeframeRef.current && timeframeRef.current.contains(target)) ||
        (newestRef.current && newestRef.current.contains(target)) ||
        (endingSoonRef.current && endingSoonRef.current.contains(target)) ||
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
  }, [isDropdownOpen, isLiquidityOpen, isVolumeOpen, isTimeframeOpen, isNewestOpen, isEndingSoonOpen, isScoreOpen])

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
    // Get 3 events for the current slide from sorted events
    const startIndex = slideIndex * 3
    const endIndex = startIndex + 3
    return sortedEvents.slice(startIndex, endIndex)
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
                 <div className="font-urbanist font-medium text-xl sm:text-2xl lg:text-3xl leading-tight tracking-[0%] text-[#FFFFFF] text-center">Polymarket Predictions</div>
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
           <div 
               className="relative w-full mt-6 sm:mt-8 lg:mt-25"
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
               {isLoadingEvents ? (
                 <div className="flex items-center justify-center py-12">
                   <div className="font-urbanist text-sm text-[#808080]">Loading Polymarket events...</div>
                 </div>
               ) : eventsError ? (
                 <div className="flex items-center justify-center py-12">
                   <div className="font-urbanist text-sm text-[#FF7D7D]">{eventsError}</div>
                 </div>
               ) : sortedEvents.length === 0 ? (
                 <div className="flex items-center justify-center py-12">
                   <div className="font-urbanist text-sm text-[#808080]">No events available</div>
                 </div>
               ) : (
                 <div 
                   className={`grid gap-4 transition-all duration-500 ease-in-out sm:grid-cols-2 lg:grid-cols-3 ${
                     isTransitioning ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'
                   }`}
                 >
                   {getCardSet(currentSlide).map((eventPair, index) => (
                     <div
                       key={`${currentSlide}-${eventPair.event.id}-${index}`}
                       className={`transition-all duration-300 ease-out ${
                         isTransitioning 
                           ? 'translate-y-3 opacity-0' 
                           : 'translate-y-0 opacity-100'
                       }`}
                       style={{
                         transitionDelay: `${index * 100}ms`
                       }}
                     >
                       <PolymarketEventCard
                         event={eventPair.event}
                         market={eventPair.market}
                         onClick={() => {
                           if (isLoading) return
                           // Send the event title (the question displayed on the card) to chat input
                           // Pass the image URL so it appears in the chat
                           const imageUrl = (eventPair.event.image || eventPair.event.icon || '').trim()
                           const validImageUrl = imageUrl && imageUrl !== '' ? imageUrl : undefined
                           console.log("Card onClick triggered - Question:", eventPair.event.title)
                           console.log("Event image:", eventPair.event.image, "Event icon:", eventPair.event.icon)
                           console.log("Final image URL:", validImageUrl)
                           handleCardClick(eventPair.event.title, eventPair.event.id, validImageUrl)
                         }}
                         onAskRaven={() => {
                           if (isLoading) return
                           // Directly submit to chat when "Ask Raven" button is clicked
                           const imageUrl = (eventPair.event.image || eventPair.event.icon || '').trim()
                           const validImageUrl = imageUrl && imageUrl !== '' ? imageUrl : undefined
                           console.log("Ask Raven button clicked - Question:", eventPair.event.title, "Image URL:", validImageUrl)
                           handleAskRavenClick(eventPair.event.title, eventPair.event.id, validImageUrl)
                         }}
                       />
                     </div>
                   ))}
                 </div>
               )}
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
          </div>
        ) : (
          <div className="flex-1 w-full max-w-5xl rounded-2xl lg:rounded-3xl bg-[#141414] p-3 sm:p-4 lg:p-6 flex flex-col min-h-0 overflow-hidden">
               <div className="flex-1 min-h-0 overflow-y-auto rounded-xl lg:rounded-2xl border border-[#1F1F1F] bg-[#0F0F0F]/80 p-3 lg:p-4 space-y-3 lg:space-y-4">
                 {messages.map((message) => (
                   <div key={message.id} className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} gap-2`}>
                     {message.role === 'user' ? (
                       <div className={`flex flex-row gap-2 lg:gap-3 max-w-[90%] lg:max-w-[80%] rounded-xl lg:rounded-2xl border border-[#1F1F1F] p-3 lg:p-4 bg-[#45FFAE]/10 border-[#45FFAE]/30`}>
                         {message.imageSrc && message.imageSrc !== '' && (
                           <div className="flex-shrink-0">
                             <img 
                               src={message.imageSrc} 
                               alt="Selected card" 
                               className="w-24 h-24 lg:w-40 lg:h-40 rounded-lg lg:rounded-xl border-2 border-[#45FFAE]/50 object-contain bg-[#1A1A1A] p-1"
                               style={{ display: 'block', minWidth: '160px', minHeight: '160px' }}
                              onError={() => {
                                console.error("Failed to load image:", message.imageSrc)
                              }}
                               onLoad={() => {
                                 console.log("Image loaded successfully:", message.imageSrc)
                               }}
                             />
                           </div>
                         )}
                         <div className="flex flex-col gap-1 flex-1 min-w-0">
                           <div className="font-urbanist text-xs lg:text-sm leading-relaxed tracking-[0%] break-words text-[#45FFAE]">
                             {message.content}
                           </div>
                         </div>
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
                  disabled={isLoading}
                  className={`font-urbanist font-medium text-sm lg:text-base text-[#FFFFFF] bg-transparent outline-none focus:outline-none focus:ring-0 focus:border-none flex-1 placeholder-[#3E3E3E] ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
            </div>

            <ArrowUp 
              className={`h-3.5 w-3.5 lg:h-4 lg:w-4 transition-all duration-200 ${
                isLoading 
                  ? 'text-[#808080] cursor-not-allowed opacity-50' 
                  : (inputValue.trim() || buildQueryFromTags()) 
                    ? 'text-[#45FFAE] hover:scale-110 cursor-pointer' 
                    : 'text-[#808080] cursor-not-allowed'
              }`} 
              onClick={isLoading ? undefined : handleSubmit}
            />

         </div>

         <div className="flex flex-wrap items-center justify-start gap-2 lg:gap-3">

              <div className="relative" ref={dropdownRef}>
                <button className="flex h-8 lg:h-10 items-center justify-center gap-1.5 lg:gap-2 rounded-lg bg-black/70 px-2.5 lg:px-4 py-1.5 lg:py-2 transition-all hover:bg-black/80" onClick={() => isDropdownOpen ? closeAllModals() : openDropdown()}>
                  <img src={polymarketLogo} alt="polymarket" className="h-3.5 w-3.5 lg:h-4 lg:w-4"/>
                  <div className="font-urbanist text-xs lg:text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">Polymarket</div>
                  <ArrowUp className={`h-3.5 w-3.5 lg:h-4 lg:w-4 text-[#808080] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}/>
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
                <button className="flex h-8 lg:h-10 items-center justify-center gap-1.5 lg:gap-2 rounded-lg bg-black/70 px-2.5 lg:px-4 py-1.5 lg:py-2 transition-all hover:bg-black/80" onClick={() => isLiquidityOpen ? closeAllModals() : openLiquidity()}>
                  <div className="font-urbanist text-xs lg:text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">{selectedLiquidity ?? 'Liquidity'}</div>
                  <ArrowUp className={`h-3.5 w-3.5 lg:h-4 lg:w-4 text-[#808080] transition-transform ${isLiquidityOpen ? 'rotate-180' : ''}`}/>
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
                <button className="flex h-8 lg:h-10 items-center justify-center gap-1.5 lg:gap-2 rounded-lg bg-black/70 px-2.5 lg:px-4 py-1.5 lg:py-2 transition-all hover:bg-black/80" onClick={() => isVolumeOpen ? closeAllModals() : openVolume()}>
                  <div className="font-urbanist text-xs lg:text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">{selectedVolume ?? 'Volume'}</div>
                  <ArrowUp className={`h-3.5 w-3.5 lg:h-4 lg:w-4 text-[#808080] transition-transform ${isVolumeOpen ? 'rotate-180' : ''}`}/>
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
                <button className="flex h-8 lg:h-10 items-center justify-center gap-1.5 lg:gap-2 rounded-lg bg-black/70 px-2.5 lg:px-4 py-1.5 lg:py-2 transition-all hover:bg-black/80" onClick={() => isTimeframeOpen ? closeAllModals() : openTimeframe()}>
                  <div className="font-urbanist text-xs lg:text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">{selectedTimeframe ?? 'Timeframe'}</div>
                  <ArrowUp className={`h-3.5 w-3.5 lg:h-4 lg:w-4 text-[#808080] transition-transform ${isTimeframeOpen ? 'rotate-180' : ''}`}/>
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
                <button className="flex h-8 lg:h-10 items-center justify-center gap-1.5 lg:gap-2 rounded-lg bg-black/70 px-2.5 lg:px-4 py-1.5 lg:py-2 transition-all hover:bg-black/80" onClick={() => isNewestOpen ? closeAllModals() : openNewest()}>
                  <div className="font-urbanist text-xs lg:text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">{selectedNewest ?? 'Newest'}</div>
                  <ArrowUp className={`h-3.5 w-3.5 lg:h-4 lg:w-4 text-[#808080] transition-transform ${isNewestOpen ? 'rotate-180' : ''}`}/>
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
                <button className="flex h-8 lg:h-10 items-center justify-center gap-1.5 lg:gap-2 rounded-lg bg-black/70 px-2.5 lg:px-4 py-1.5 lg:py-2 transition-all hover:bg-black/80" onClick={() => isEndingSoonOpen ? closeAllModals() : openEndingSoon()}>
                  <div className="font-urbanist text-xs lg:text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">{selectedEndingSoon ?? 'Ending Soon'}</div>
                  <ArrowUp className={`h-3.5 w-3.5 lg:h-4 lg:w-4 text-[#808080] transition-transform ${isEndingSoonOpen ? 'rotate-180' : ''}`}/>
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

              {/* Score Dropdown */}
              <div className="relative" ref={scoreRef}>
                <button className="flex h-8 lg:h-10 items-center justify-center gap-1.5 lg:gap-2 rounded-lg bg-black/70 px-2.5 lg:px-4 py-1.5 lg:py-2 transition-all hover:bg-black/80" onClick={() => isScoreOpen ? closeAllModals() : openScore()}>
                  <div className="font-urbanist text-xs lg:text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">{selectedScore ?? 'Score'}</div>
                  <ArrowUp className={`h-3.5 w-3.5 lg:h-4 lg:w-4 text-[#808080] transition-transform ${isScoreOpen ? 'rotate-180' : ''}`}/>
                </button>
                {isScoreOpen && (
                  <div className="absolute bottom-full left-0 z-50 mb-3 w-48 rounded-xl border border-gray-700 bg-[#1A1A1A] p-1 shadow-xl">
                    <div className="max-h-48 overflow-y-auto rounded-lg bg-[#121212]">
                      {['Logical','Sentiment'].map(v => (
                        <div key={v} className="px-4 py-2 text-center font-urbanist text-sm text-[#E0E0E0] hover:bg-[#222] cursor-pointer" onClick={() => { setSelectedScore(v); setIsScoreOpen(false) }}>{v}</div>
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
