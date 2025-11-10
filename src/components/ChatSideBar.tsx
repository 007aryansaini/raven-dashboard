import logo from "../assets/logo.svg"
import cryptoTrade from "../assets/cryptoTrade.svg"
import { ArrowDownNarrowWide, ArrowRight, Circle, Clock, Star } from "lucide-react"

interface WatchlistItem {
    id: number
    title: string
    volume: string
    percentage: string
    frequency: string
    change: string
}

const watchlistData: WatchlistItem[] = [
    {
        id: 1,
        title: "Fed decision in septe...",
        volume: "$52m Vol.",
        percentage: "5%",
        frequency: "Monthly",
        change: "25 bps decrease"
    },
    {
        id: 2,
        title: "Fed decision in septe...",
        volume: "$52m Vol.",
        percentage: "5%",
        frequency: "Monthly",
        change: "25 bps decrease"
    },
    {
        id: 3,
        title: "Fed decision in septe...",
        volume: "$52m Vol.",
        percentage: "5%",
        frequency: "Monthly",
        change: "25 bps decrease"
    },
    {
        id: 4,
        title: "Fed decision in septe...",
        volume: "$52m Vol.",
        percentage: "5%",
        frequency: "Monthly",
        change: "25 bps decrease"
    }
]

interface RecentChatItem {
    id: number
    title: string
}

const recentChatData: RecentChatItem[] = [
    {
        id: 1,
        title: "Fed decision in september?"
    },
    {
        id: 2,
        title: "Crypto market analysis"
    },
    {
        id: 3,
        title: "Options trading strategy"
    },
    {
        id: 4,
        title: "Market volatility discussion"
    },
    {
        id: 5,
        title: "Portfolio rebalancing"
    },
    {
        id: 6,
        title: "Earnings season preview"
    },
    {
        id: 7,
        title: "Bond yield analysis"
    },
    {
        id: 8,
        title: "Sector rotation strategy"
    },
    {
        id: 9,
        title: "Risk management tips"
    },
    {
        id: 10,
        title: "Technical analysis patterns"
    },
    {
        id: 11,
        title: "Global market outlook"
    },
    {
        id: 12,
        title: "Commodity price trends"
    },
    {
        id: 13,
        title: "ETF allocation guide"
    },
    {
        id: 14,
        title: "Market sentiment indicators"
    },
    {
        id: 15,
        title: "Trading psychology discussion"
    }
]

interface ChatSideBarProps {
    onBackToMenu: () => void
}

const ChatSideBar = ({ onBackToMenu }: ChatSideBarProps) => {
    return (
        <div className="flex h-full max-h-screen w-64 flex-col gap-6 border-r border-gray-800 bg-black p-4 md:w-72 lg:w-80">
            <img className="h-10 w-30 cursor-pointer transition-transform duration-200 ease-in-out hover:scale-105" src={logo} alt="logo" />
            <button
                className="mt-2 w-fit text-sm leading-none tracking-[0%] text-[#808080] transition-all duration-200 hover:scale-105 hover:text-[#45FFAE]"
                onClick={onBackToMenu}
                type="button"
            >
                {"<"} <span className="ml-2">Back to menu</span>
            </button>

            <div className="flex w-full flex-1 flex-col gap-4 overflow-y-auto pr-1">
                <button className="flex h-12 w-full items-center justify-center rounded-xl bg-[#141414] text-sm text-[#808080] transition-all duration-200 hover:scale-105 hover:bg-[#1a1a1a]" type="button">
                    + Start new chat
                </button>

                <div className="flex flex-row gap-2 rounded-xl bg-[#141414] p-2">
                    <button className="flex flex-1 items-center gap-2 rounded-lg bg-[#292929] p-2 transition-all duration-200 hover:scale-105 hover:bg-[#3a3a3a]" type="button">
                        <img className="h-6 w-6" src={cryptoTrade} alt="add" />
                        <span className="font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">Polymarket</span>
                    </button>

                    <button className="flex flex-1 items-center gap-2 rounded-lg p-2 transition-all duration-200 hover:scale-105 hover:bg-[#292929]" type="button">
                        <img className="h-6 w-6" src={cryptoTrade} alt="add" />
                        <span className="font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#808080]">Crypto</span>
                    </button>
                </div>

                <div className="flex flex-col gap-3 rounded-2xl bg-[#121212]/20 p-3">
                    <div className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-white" />
                            <span className="font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#808080]">Watchlist</span>
                        </div>
                        <ArrowDownNarrowWide className="h-4 w-4 cursor-pointer text-white transition-all duration-200 hover:scale-110 hover:text-[#45FFAE]" />
                    </div>

                    <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
                        {watchlistData.map((item) => (
                            <button
                                key={item.id}
                                className="flex flex-col gap-2 rounded-xl bg-[#141414] p-3 text-left transition-all duration-200 hover:-translate-y-1 hover:bg-[#1a1a1a]"
                                type="button"
                            >
                                <span className="flex items-center justify-between gap-2">
                                    <img className="h-6 w-6" src={cryptoTrade} alt="add" />
                                    <span className="w-32 truncate font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">
                                        {item.title}
                                    </span>
                                    <ArrowRight className="h-4 w-4 text-white" />
                                </span>
                                <span className="flex items-center justify-between font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#808080]">
                                    {item.volume}
                                    <span className="text-[#FFFFFF]">{item.percentage}</span>
                                </span>
                                <span className="flex items-center justify-between font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#808080]">
                                    <span className="flex items-center gap-1">
                                        <Circle className="h-3 w-3 text-[#808080]" />
                                        {item.frequency}
                                    </span>
                                    {item.change}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-3 rounded-2xl bg-[#121212]/20 p-3">
                    <div className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-white" />
                            <span className="font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#808080]">Recent Chats</span>
                        </div>
                        <ArrowDownNarrowWide className="h-4 w-4 cursor-pointer text-white transition-all duration-200 hover:scale-110 hover:text-[#45FFAE]" />
                    </div>

                    <div className="flex max-h-48 flex-col gap-2 overflow-y-auto">
                        {recentChatData.map((item) => (
                            <button
                                key={item.id}
                                className="text-left font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF] transition-all duration-200 hover:-translate-y-0.5 hover:text-[#45FFAE]"
                                type="button"
                            >
                                {item.title}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatSideBar
