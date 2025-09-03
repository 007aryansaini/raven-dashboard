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
        <div className="bg-black h-screen w-3xs flex flex-col items-start p-2 border-r border-gray-800">
            <img className="w-30 h-10 mt-6 cursor-pointer hover:scale-105 transition-transform duration-200 ease-in-out" src={logo} alt="logo" />
            <div
                className="text-[#808080] text-sm leading-none tracking-[0%] cursor-pointer mt-10 hover:text-[#45FFAE] transition-colors duration-200 hover:scale-105 transform origin-left"
                onClick={onBackToMenu}
            >
                {"<"} <span className="ml-2">Back to menu</span>
            </div>

            <div className="flex flex-col p-2 gap-4 mt-6">
                <div className="h-10 w-56 bg-[#141414] rounded-lg p-2 text-[#808080] text-sm leading-none tracking-[0%] flex flex-row items-center justify-center cursor-pointer hover:bg-[#1a1a1a] hover:scale-105 transition-all duration-200 ease-in-out">
                    <div>+ Start new chat</div>
                </div>

                <div className="flex flex-row gap-2 bg-[#141414] rounded-lg p-2">
                    <div className="flex flex-row items-center gap-1 cursor-pointer bg-[#292929] rounded-lg p-2 hover:bg-[#3a3a3a] hover:scale-105 transition-all duration-200 ease-in-out">
                        <img className="w-6 h-6" src={cryptoTrade} alt="add" />
                        <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#FFFFFF]">Polymarket</div>
                    </div>

                    <div className="flex flex-row items-center gap-1 cursor-pointer rounded-lg p-2 hover:bg-[#292929] hover:scale-105 transition-all duration-200 ease-in-out">
                        <img className="w-6 h-6" src={cryptoTrade} alt="add" />
                        <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#808080]">Crypto</div>
                    </div>
                </div>



                <div className="flex flex-col gap-1 items-start mt-1 h-54">

                    <div className="flex flex-row items-center justify-between w-full gap-1 mb-2">
                        <div className="flex flex-row items-center gap-2">
                            <Star className="w-4 h-4 text-white" />
                            <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#808080]">Watchlist</div>
                        </div>

                        <ArrowDownNarrowWide className="w-4 h-4 text-white cursor-pointer hover:scale-110 hover:text-[#45FFAE] transition-all duration-200 ease-in-out" />

                    </div>

                    <div className="flex flex-col gap-2 items-start p-2 w-full h-full">
                        <div className="flex flex-col gap-2 items-start w-full overflow-y-auto flex-1">
                            {watchlistData.map((item) => (
                                <div key={item.id} className="flex flex-col gap-2 items-start p-3 bg-[#141414] rounded-lg w-full cursor-pointer hover:bg-[#1a1a1a] hover:scale-[1.02] transition-all duration-200 ease-in-out">
                                    <div className="flex flex-row items-center justify-between w-full gap-1">
                                        <img className="w-6 h-6" src={cryptoTrade} alt="add" />
                                        <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#FFFFFF] truncate w-32 h-3.5">{item.title}</div>
                                        <ArrowRight className="text-white ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                                    </div>

                                    <div className="flex flex-row items-center justify-between w-full">
                                        <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#808080]">{item.volume}</div>
                                        <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#FFFFFF]">{item.percentage}</div>
                                    </div>

                                    <div className="flex flex-row items-center justify-between w-full">
                                        <div className="flex flex-row items-center gap-1">
                                            <Circle className="w-3 h-3 text-[#808080]" />
                                            <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#808080]">{item.frequency}</div>
                                        </div>
                                        <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#808080]">{item.change}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* View More Footer - Fixed at bottom */}
                        <div className="flex flex-row items-center justify-center w-full mt-2">
                            <div className="font-urbanist font-normal text-sm leading-none tracking-[0%] text-[#808080] cursor-pointer hover:text-[#45FFAE] hover:scale-105 transition-all duration-200 ease-in-out">
                                View more
                            </div>
                        </div>
                    </div>


                </div>

                <div className="flex flex-col gap-1 items-start mt-15 h-50">

                    <div className="flex flex-row items-center justify-between w-full gap-1 mb-2">
                        <div className="flex flex-row items-center gap-2">
                            <Clock className="w-4 h-4 text-white" />
                            <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#808080]">Recent Chats</div>
                        </div>

                        <ArrowDownNarrowWide className="w-4 h-4 text-white cursor-pointer hover:scale-110 hover:text-[#45FFAE] transition-all duration-200 ease-in-out" />

                    </div>

                    <div className="flex flex-col gap-2 items-start p-2 w-full h-full">
                        <div className="flex flex-col gap-4 items-start w-full overflow-y-auto flex-1">
                            {recentChatData.map((item) => (
                                <div key={item.id} className={`text-sm leading-none tracking-[0%] text-[#FFFFFF] cursor-pointer hover:text-[#45FFAE] hover:scale-105 transition-all duration-200 ease-in-out transform origin-left`}>
                                      {item.title}
                                </div>
                            ))}
                        </div>

                        {/* View More Footer - Fixed at bottom */}
                        <div className="flex flex-row items-center justify-center w-full mt-2">
                            <div className="font-urbanist font-normal text-sm leading-none tracking-[0%] text-[#808080] cursor-pointer hover:text-[#45FFAE] hover:scale-105 transition-all duration-200 ease-in-out">
                                View more
                            </div>
                        </div>
                    </div>


                </div>



            </div>


        </div>
    )
}

export default ChatSideBar
