
import { Share2, Copy, X, Twitter, MessageCircle, Check } from "lucide-react"
import { useState } from "react"

const Points = () => {
  const [activeTab, setActiveTab] = useState("Quests")
  return (
    <div className="flex flex-col items-center justify-start py-4 gap-3 relative text-white overflow-hidden"  
         style={{
           background: `
             radial-gradient(circle at center, rgba(69, 255, 174, 0.1) 0%, rgba(0, 0, 0, 0.8) 70%, rgba(0, 0, 0, 1) 100%),
             linear-gradient(90deg, rgba(69, 255, 174, 0.05) 1px, transparent 1px),
             linear-gradient(rgba(69, 255, 174, 0.05) 1px, transparent 1px)
           `,
           backgroundSize: '100% 100%, 60px 60px, 60px 60px',
           backgroundColor: '#000000'
         }}>
     

     <div className="flex flex-col h-full items-center justify-start w-full max-w-6xl px-4">
               
               <div className="flex flex-col gap-4 items-center">
                      
                       <div className="flex flex-col gap-2 items-center justify-center h-24 w-full bg-[#141414] rounded-lg px-4">
                             <div className="font-urbanist font-medium text-2xl leading-none tracking-[0%] text-[#FFFFFF]">Earn Points, Unlock Rewards</div> 
                             <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#D1D1D1]">Finish quick quests and stack points to claim rewards.</div>
                       </div>

                       {/* Cards Container */}
                       <div className="flex flex-row gap-3 w-full">
                         {/* Achievement Card */}
                         <div className="flex flex-col w-full bg-[#1A1A1A] rounded-lg p-3 gap-3">
                           <div className="flex flex-row items-center justify-between">
                             <div className="flex flex-row items-center gap-4">
                               <div className="w-12 h-12 bg-[#2A2A2A] rounded-lg flex items-center justify-center">
                                 <div className="w-8 h-8 bg-[#3A3A3A] rounded"></div>
                               </div>
                               <div className="flex flex-col gap-2 flex-1">
                                 <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#FFFFFF]">Title here</div>
                                 <div className="flex flex-row items-center gap-2">
                                   <div className="px-2 py-1 bg-[#45FFAE] rounded-full flex items-center gap-1">
                                     <div className="w-2 h-2 bg-white rounded-full"></div>
                                     <span className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-black">Level-0</span>
                                   </div>
                                 </div>
                                 <div className="w-full h-1 bg-[#2A2A2A] rounded-full">
                                   <div className="w-0 h-full bg-[#45FFAE] rounded-full"></div>
                                 </div>
                               </div>
                             </div>
                             <div className="font-urbanist font-bold text-2xl leading-none tracking-[0%] text-[#45FFAE]">00 RP</div>
                           </div>
                           <button className="flex flex-row items-center gap-2 px-3 py-2 bg-[#2A2A2A] rounded-lg hover:bg-[#3A3A3A] transition-colors w-fit">
                             <span className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#FFFFFF]">Share it to your achievement</span>
                             <Share2 className="w-4 h-4 text-white" />
                           </button>
                         </div>

                         {/* Invite Friends Card */}
                         <div className="flex flex-col w-full bg-[#1A1A1A] rounded-lg p-3 gap-2">
                           <div className="flex flex-row items-center justify-between">
                             <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#FFFFFF]">Invite your friends</div>
                             <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#FFFFFF]">@username</div>
                           </div>
                           <div className="flex flex-row items-center gap-2">
                             <div className="flex-1 px-3 py-2 bg-[#2A2A2A] rounded-lg">
                               <span className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#D1D1D1]">https://example.com/referral/username</span>
                             </div>
                             <button className="p-2 bg-[#2A2A2A] rounded-lg hover:bg-[#3A3A3A] transition-colors">
                               <Copy className="w-4 h-4 text-white" />
                             </button>
                           </div>
                           <button className="flex flex-row items-center gap-2 px-3 py-2 bg-[#2A2A2A] rounded-lg hover:bg-[#3A3A3A] transition-colors w-fit">
                             <span className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#FFFFFF]">Share on</span>
                             <X className="w-4 h-4 text-white" />
                           </button>
                         </div>
                       </div>

                       {/* Tabs Navigation */}
                       <div className="flex flex-row gap-6 w-full mt-2">
                         <button 
                           className={`font-urbanist cursor-pointer font-medium text-sm leading-none tracking-[0%] pb-2 border-b-2 transition-colors ${
                             activeTab === "Quests" 
                               ? "text-[#45FFAE] border-[#45FFAE]" 
                               : "text-[#808080] border-transparent hover:text-[#D1D1D1]"
                           }`}
                           onClick={() => setActiveTab("Quests")}
                         >
                           Quests
                         </button>
                         <button 
                           className={`font-urbanist font-medium cursor-pointer text-sm leading-none tracking-[0%] pb-2 border-b-2 transition-colors ${
                             activeTab === "Points history" 
                               ? "text-[#45FFAE] border-[#45FFAE]" 
                               : "text-[#808080] border-transparent hover:text-[#D1D1D1]"
                           }`}
                           onClick={() => setActiveTab("Points history")}
                         >
                           Points history
                         </button>
                         <button 
                           className={`font-urbanist font-medium text-sm cursor-pointer leading-none tracking-[0%] pb-2 border-b-2 transition-colors ${
                             activeTab === "Leaderboard" 
                               ? "text-[#45FFAE] border-[#45FFAE]" 
                               : "text-[#808080] border-transparent hover:text-[#D1D1D1]"
                           }`}
                           onClick={() => setActiveTab("Leaderboard")}
                         >
                           Leaderboard
                         </button>
                       </div>

                       {/* Tab Content */}
                       {activeTab === "Quests" && (
                         <div className="flex flex-col gap-4 w-full mt-2 flex-1 min-h-0">
                           {/* Social Quests Section */}
                           <div className="flex flex-col gap-4">
                             <div className="flex flex-row items-center justify-between">
                               <h3 className="font-urbanist font-medium text-lg leading-none tracking-[0%] text-[#FFFFFF]">Social Quests</h3>
                               <span className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#808080]">Refreshes daily 00:00 UTC</span>
                             </div>
                             
                             {/* Quest Cards */}
                             <div className="flex flex-col gap-3 max-h-40 overflow-y-auto">
                               {/* Share on Twitter Quest */}
                               <div className="flex flex-row items-center gap-3 w-full bg-[#1A1A1A] rounded-lg p-3">
                                 <div className="w-10 h-10 bg-[#2A2A2A] rounded-full flex items-center justify-center">
                                   <Twitter className="w-5 h-5 text-[#808080]" />
                                 </div>
                                 <div className="flex-1">
                                   <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#FFFFFF]">Share on twitter</div>
                                   <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#808080] mt-1">Share to one of your friends on twitter.</div>
                                 </div>
                                 <div className="font-urbanist font-bold text-sm leading-none tracking-[0%] text-[#45FFAE]">+25 RP</div>
                               </div>

                               {/* Share on Discord Quest */}
                               <div className="flex flex-row items-center gap-3 w-full bg-[#1A1A1A] rounded-lg p-3">
                                 <div className="w-10 h-10 bg-[#2A2A2A] rounded-full flex items-center justify-center">
                                   <MessageCircle className="w-5 h-5 text-[#808080]" />
                                 </div>
                                 <div className="flex-1">
                                   <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#FFFFFF]">Share on Discord</div>
                                   <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#808080] mt-1">Share to one of your friends on Discord.</div>
                                 </div>
                                 <div className="font-urbanist font-bold text-sm leading-none tracking-[0%] text-[#45FFAE]">+25 RP</div>
                               </div>

                               {/* Share to 5 friends Quest */}
                               <div className="flex flex-row items-center gap-3 w-full bg-[#1A1A1A] rounded-lg p-3">
                                 <div className="w-10 h-10 bg-[#2A2A2A] rounded-full flex items-center justify-center">
                                   <Share2 className="w-5 h-5 text-[#808080]" />
                                 </div>
                                 <div className="flex-1">
                                   <div className="flex flex-row items-center gap-2">
                                     <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#FFFFFF]">Share to 5 friends</div>
                                     <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#808080]">2/5</div>
                                   </div>
                                   <div className="w-full h-1 bg-[#2A2A2A] rounded-full mt-2">
                                     <div className="w-2/5 h-full bg-[#45FFAE] rounded-full"></div>
                                   </div>
                                   <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#808080] mt-1">3 shares away from +250RP</div>
                                   <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#808080]">Resets in 13 hours</div>
                                   <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#808080]">$110 / $250</div>
                                 </div>
                                 <div className="font-urbanist font-bold text-sm leading-none tracking-[0%] text-[#45FFAE]">+250 RP</div>
                               </div>
                             </div>
                           </div>

                           {/* Product Quests Section */}
                           <div className="flex flex-col gap-4">
                             <div className="flex flex-row items-center justify-between">
                               <h3 className="font-urbanist font-medium text-lg leading-none tracking-[0%] text-[#FFFFFF]">Product Quests</h3>
                               <span className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#808080]">Refreshes daily 00:00 UTC</span>
                             </div>
                             
                             {/* Product Quest Cards */}
                             <div className="flex flex-col gap-3 max-h-40 overflow-y-auto">
                               {[1, 2, 3].map((index) => (
                                 <div key={index} className="flex flex-row items-center gap-3 w-full bg-[#1A1A1A] rounded-lg p-3">
                                   <div className="w-10 h-10 bg-[#2A2A2A] rounded-full flex items-center justify-center">
                                     <Twitter className="w-5 h-5 text-[#808080]" />
                                   </div>
                                   <div className="flex-1">
                                     <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#FFFFFF]">Share on twitter</div>
                                     <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#808080] mt-1">Refreshes daily</div>
                                   </div>
                                   <div className="font-urbanist font-bold text-sm leading-none tracking-[0%] text-[#45FFAE]">+25 RP</div>
                                 </div>
                               ))}
                             </div>
                           </div>
                         </div>
                       )}

                       {activeTab === "Points history" && (
                         <div className="flex flex-col w-full mt-2 flex-1">
                           <div className="flex flex-col gap-4">
                             <div className="flex flex-col gap-2">
                               <h3 className="font-urbanist font-medium text-lg leading-none tracking-[0%] text-[#FFFFFF]">Points received</h3>
                               <p className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#808080]">Points will be updated every 24 hours</p>
                             </div>
                             
                             <div className="flex flex-col gap-3">
                               {/* Points History Items */}
                               {[
                                 { action: "Share on twitter", points: "+25 RP", status: "Received" },
                                 { action: "Share on twitter", points: "+25 RP", status: "Received" },
                                 { action: "Share on twitter", points: "+25 RP", status: "Received" }
                               ].map((item, index) => (
                                 <div key={index} className="flex flex-row items-center gap-4 w-full bg-[#1A1A1A] rounded-lg p-3">
                                   <div className="w-10 h-10 bg-[#2A2A2A] rounded-full flex items-center justify-center">
                                     <Twitter className="w-5 h-5 text-[#808080]" />
                                   </div>
                                   <div className="flex-1">
                                     <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#FFFFFF]">{item.action}</div>
                                   </div>
                                   <div className="font-urbanist font-bold text-sm leading-none tracking-[0%] text-[#45FFAE]">{item.points}</div>
                                   <div className="flex flex-row items-center gap-1 px-3 py-1 bg-[#45FFAE] rounded-full">
                                     <span className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-black">{item.status}</span>
                                     <Check className="w-3 h-3 text-black" />
                                   </div>
                                 </div>
                               ))}
                             </div>
                           </div>
                         </div>
                       )}

                       {activeTab === "Leaderboard" && (
                         <div className="flex flex-col w-full mt-2 flex-1">
                           <div className="flex flex-col gap-4">
                             {/* User's Current Standing */}
                             <div className="flex flex-row items-center justify-between w-full bg-[#1A1A1A] rounded-lg p-3">
                               <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#FFFFFF]">You</div>
                               <div className="font-urbanist font-bold text-sm leading-none tracking-[0%] text-[#45FFAE]">+995.565</div>
                             </div>
                             
                             {/* Leaderboard Table */}
                             <div className="flex flex-col gap-3 bg-[#1A1A1A]">
                               {/* Table Header */}
                               <div className="flex flex-row items-center gap-4 w-full  rounded-lg p-3">
                                 <div className="w-16 font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#808080]">Rank</div>
                                 <div className="flex-1 font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#808080]">Wallet</div>
                                 <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#808080]">Points</div>
                               </div>
                               
                               {/* Leaderboard Entries */}
                               {[
                                 { rank: 1, wallet: "0xAlbC...789", points: "+995.565" },
                                 { rank: 2, wallet: "0xD3ef...456", points: "+987.654" },
                                 { rank: 3, wallet: "0x85oD...123", points: "+543.210" },
                                 { rank: 4, wallet: "0xC7eE...890", points: "+321.098" },
                                 { rank: 5, wallet: "0xF9bC...234", points: "+123.456" }
                               ].map((entry, index) => (
                                 <div key={index} className="flex flex-row items-center gap-4 w-full bg-[#1A1A1A] rounded-lg p-3">
                                   <div className="w-16 font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#FFFFFF]">{entry.rank}</div>
                                   <div className="flex-1 font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#FFFFFF]">{entry.wallet}</div>
                                   <div className="font-urbanist font-bold text-sm leading-none tracking-[0%] text-[#45FFAE]">{entry.points}</div>
                                 </div>
                               ))}
                             </div>
                           </div>
                         </div>
                       )}

                       



               </div>
     </div>


    </div>
  )
}

export default Points
