import logo from "../assets/logo.svg"
import { ArrowDownNarrowWide, Clock } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useChat } from "../contexts/ChatContext"
import type { SavedChat } from "../contexts/ChatContext"

interface ChatSideBarProps {
    onBackToMenu: () => void
    onLoadChat: (chatId: string) => void
}

const ChatSideBar = ({ onBackToMenu, onLoadChat }: ChatSideBarProps) => {
    const navigate = useNavigate()
    const { getRecentChats, setCurrentChatId } = useChat()
    const [recentChats, setRecentChats] = useState<SavedChat[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchChats = async () => {
            setIsLoading(true)
            const chats = await getRecentChats(15)
            setRecentChats(chats)
            setIsLoading(false)
        }
        fetchChats()
        
        // Refresh chats every 5 seconds to show newly saved chats
        const interval = setInterval(fetchChats, 5000)
        return () => clearInterval(interval)
    }, [getRecentChats])

    const handleStartNewChat = () => {
        // Clear current chat ID to start a new conversation
        setCurrentChatId(null)
        // Close the chat sidebar
        onBackToMenu()
        // Navigate to home route
        navigate('/')
    }

    const handleChatClick = (chatId: string) => {
        onLoadChat(chatId)
    }

    return (
        <div className="flex h-full max-h-screen w-3xs flex-col gap-6 border-r border-gray-800 bg-black p-4">
            <img className="h-10 w-30 cursor-pointer transition-transform duration-200 ease-in-out hover:scale-105" src={logo} alt="logo" />
            <button
                className="mt-2 w-fit text-sm leading-none tracking-[0%] text-[#808080] transition-all duration-200 hover:scale-105 hover:text-[#45FFAE]"
                onClick={onBackToMenu}
                type="button"
            >
                {"<"} <span className="ml-2">Back to menu</span>
            </button>

            <div className="flex w-full flex-1 flex-col gap-4 overflow-y-auto pr-1">
                <button 
                    className="flex h-12 w-full items-center justify-center rounded-xl cursor-pointer bg-[#141414] text-sm text-[#808080] transition-all duration-200 hover:scale-105 hover:bg-[#1a1a1a]" 
                    type="button"
                    onClick={handleStartNewChat}
                >
                    + Start new chat
                </button>

                <div className="flex flex-col gap-3 rounded-2xl mt-10 bg-[#121212]/20 p-3">
                    <div className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-white" />
                            <span className="font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#808080]">Recent Chats</span>
                        </div>
                        <ArrowDownNarrowWide className="h-4 w-4 cursor-pointer text-white transition-all duration-200 hover:scale-110 hover:text-[#45FFAE]" />
                    </div>

                    <div className="flex max-h-48 flex-col gap-5 mt-5  overflow-y-auto">
                        {isLoading ? (
                            <div className="text-center font-urbanist text-sm text-[#808080] py-4">
                                Loading chats...
                            </div>
                        ) : recentChats.length === 0 ? (
                            <div className="text-center font-urbanist text-sm text-[#808080] py-4">
                                No recent chats
                            </div>
                        ) : (
                            recentChats.map((chat) => (
                                <button
                                    key={chat.id}
                                    className="text-left font-urbanist text-sm cursor-pointer font-medium leading-none tracking-[0%] text-[#FFFFFF] transition-all duration-200 hover:-translate-y-0.5 hover:text-[#45FFAE]"
                                    type="button"
                                    onClick={() => handleChatClick(chat.id)}
                                >
                                    {chat.title.length > 40 ? `${chat.title.substring(0, 40)}...` : chat.title}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatSideBar
