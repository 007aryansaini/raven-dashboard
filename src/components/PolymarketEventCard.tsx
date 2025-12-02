import { Bookmark, RefreshCw, Info, ChevronDown } from "lucide-react"
import polymarketLogo from "../assets/polymarketLogo.svg"

interface PolymarketEventCardProps {
  event: {
    id: string
    title: string
    category?: string
    volume?: number
    liquidity?: number
    image?: string
    icon?: string
  }
  market?: {
    question?: string
    yesPrice?: number
    noPrice?: number
  }
  onClick: () => void
  onAskRaven?: () => void
}

const PolymarketEventCard = ({ event, market, onClick, onAskRaven }: PolymarketEventCardProps) => {
  const formatVolume = (volume?: number) => {
    if (!volume || volume === 0) return "$52m"
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(0)}m`
    }
    if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(0)}k`
    }
    return `$${volume.toFixed(0)}`
  }

  const formatPercentage = (price?: number) => {
    if (price === undefined || price === null) return "0%"
    return `${Math.round(price)}%`
  }

  // Get first letter of title for placeholder icon
  const getInitials = (title: string) => {
    return title.substring(0, 2).toUpperCase()
  }

  return (
    <div
      onClick={onClick}
      className="w-full rounded-2xl border border-[#1F1F1F] bg-[#101010] transition-all duration-300 ease-out cursor-pointer hover:border-[#45FFAE] hover:scale-[1.02] overflow-hidden flex flex-col h-full"
    >
      {/* Card Header */}
      <div className="p-4 pb-3 border-b border-[#1F1F1F]">
        <div className="flex items-center gap-3">
          {/* Event Icon/Image */}
          {(event.image || event.icon) ? (
            <img
              src={event.image || event.icon}
              alt={event.category || "Event"}
              className="flex-shrink-0 w-10 h-10 rounded-full object-cover bg-[#2A2A2A]"
              onError={(e) => {
                // Hide image and show fallback
                const target = e.currentTarget as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          ) : null}
          <div 
            className={`flex-shrink-0 w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center overflow-hidden ${(event.image || event.icon) ? 'hidden' : ''}`}
          >
            <div className="text-xs font-urbanist font-medium text-[#808080]">
              {getInitials(event.title)}
            </div>
          </div>
          {/* Event Title */}
          <div className="flex-1 font-urbanist text-sm font-medium leading-tight text-[#FFFFFF] line-clamp-2">
            {event.title}
          </div>
        </div>
      </div>

      {/* Card Body - Market Options */}
      <div className="flex-1 p-4 space-y-3 min-h-[120px]">
        {market && (market.yesPrice !== undefined || market.noPrice !== undefined) ? (
          <div className="space-y-3">
            {/* Yes Option */}
            {market.yesPrice !== undefined && (
              <div className="flex items-center justify-between">
                <span className="font-urbanist text-xs text-[#D1D1D1]">Yes</span>
                <div className="flex items-center gap-2">
                  <span className="font-urbanist text-sm font-medium text-[#45FFAE]">
                    {formatPercentage(market.yesPrice)}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                    className="px-3 py-1 rounded-lg bg-[#45FFAE] text-black font-urbanist text-xs font-medium hover:bg-[#35EF9E] transition-colors"
                  >
                    Yes
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                    className="px-3 py-1 rounded-lg bg-[#8B4513] text-white font-urbanist text-xs font-medium hover:bg-[#A0522D] transition-colors"
                  >
                    No
                  </button>
                  <Info className="w-4 h-4 text-[#808080]" />
                </div>
              </div>
            )}
            {/* No Option */}
            {market.noPrice !== undefined && (
              <div className="flex items-center justify-between">
                <span className="font-urbanist text-xs text-[#D1D1D1]">No</span>
                <div className="flex items-center gap-2">
                  <span className="font-urbanist text-sm font-medium text-[#FF7D7D]">
                    {formatPercentage(market.noPrice)}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                    className="px-3 py-1 rounded-lg bg-[#45FFAE] text-black font-urbanist text-xs font-medium hover:bg-[#35EF9E] transition-colors"
                  >
                    Yes
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                    className="px-3 py-1 rounded-lg bg-[#8B4513] text-white font-urbanist text-xs font-medium hover:bg-[#A0522D] transition-colors relative"
                  >
                    No
                    <ChevronDown className="w-3 h-3 absolute -bottom-1 -right-1 text-[#808080]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="font-urbanist text-xs text-[#808080]">
              Market data loading...
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="p-4 pt-3 border-t border-[#1F1F1F]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-urbanist text-xs font-medium text-[#808080]">
              {formatVolume(event.volume)} Vol.
            </span>
            <div className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3 text-[#808080]" />
              <span className="font-urbanist text-xs font-medium text-[#808080]">Monthly</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                // Bookmark functionality
              }}
              className="p-1 hover:bg-[#2A2A2A] rounded transition-colors"
            >
              <Bookmark className="w-4 h-4 text-[#808080]" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                // Use onAskRaven if provided (for direct submission), otherwise use onClick (for input field)
                if (onAskRaven) {
                  onAskRaven()
                } else {
                  onClick()
                }
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#2A2A2A] hover:bg-[#3A3A3A] transition-colors"
            >
              <img src={polymarketLogo} alt="Raven" className="w-3 h-3" />
              <span className="font-urbanist text-xs font-medium text-[#FFFFFF]">Ask Raven</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PolymarketEventCard
