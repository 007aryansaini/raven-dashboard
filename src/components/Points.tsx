
import { Share2, Copy, X, Twitter, MessageCircle, Check } from "lucide-react"
import { useState } from "react"

const Points = () => {
  const [activeTab, setActiveTab] = useState("Quests")
  return (
    <div className="relative flex min-h-full flex-col items-center gap-8 overflow-hidden px-4 py-10 text-white sm:px-6 lg:px-10"  
         style={{
           background: `
             radial-gradient(circle at center, rgba(69, 255, 174, 0.1) 0%, rgba(0, 0, 0, 0.8) 70%, rgba(0, 0, 0, 1) 100%),
             linear-gradient(90deg, rgba(69, 255, 174, 0.05) 1px, transparent 1px),
             linear-gradient(rgba(69, 255, 174, 0.05) 1px, transparent 1px)
           `,
           backgroundSize: '100% 100%, 60px 60px, 60px 60px',
           backgroundColor: '#000000'
         }}>
     

     <div className="flex h-full w-full max-w-6xl flex-col items-center justify-start gap-6">
               
               <div className="flex w-full flex-col items-center gap-6">
                      
                       <div className="flex w-full flex-col items-center justify-center gap-2 rounded-3xl bg-[#141414] px-6 py-8 text-center sm:px-10 sm:py-10">
                             <div className="font-urbanist text-2xl font-medium leading-tight tracking-[0%] text-[#FFFFFF] sm:text-3xl">Earn Points, Unlock Rewards</div> 
                             <div className="font-urbanist text-sm font-medium leading-normal tracking-[0%] text-[#D1D1D1]">Finish quick quests and stack points to claim rewards.</div>
                       </div>

                       {/* Cards Container */}
                       <div className="flex w-full flex-col gap-4 md:flex-row">
                         {/* Achievement Card */}
                         <div className="flex w-full flex-col gap-3 rounded-3xl bg-[#1A1A1A] p-4">
                           <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                             <div className="flex flex-1 flex-row items-center gap-4">
                               <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2A2A2A]">
                                 <div className="h-8 w-8 rounded-full bg-[#3A3A3A]"></div>
                               </div>
                               <div className="flex flex-1 flex-col gap-2">
                                 <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#FFFFFF]">Title here</div>
                                 <div className="flex flex-row items-center gap-2">
                                   <div className="flex items-center gap-1 rounded-full bg-[#45FFAE] px-2 py-1 text-black">
                                     <div className="h-2 w-2 rounded-full bg-white"></div>
                                     <span className="font-urbanist text-xs font-medium leading-none tracking-[0%]">Level-0</span>
                                   </div>
                                 </div>
                                 <div className="h-1 w-full rounded-full bg-[#2A2A2A]">
                                   <div className="h-full w-0 rounded-full bg-[#45FFAE]"></div>
                                 </div>
                               </div>
                             </div>
                             <div className="font-urbanist text-2xl font-bold leading-none tracking-[0%] text-[#45FFAE]">00 RP</div>
                           </div>
                           <button className="flex w-fit flex-row items-center gap-2 rounded-xl bg-[#2A2A2A] px-3 py-2 transition-colors hover:bg-[#3A3A3A]">
                             <span className="font-urbanist text-xs font-medium leading-none tracking-[0%] text-[#FFFFFF]">Share it to your achievement</span>
                             <Share2 className="h-4 w-4 text-white" />
                           </button>
                         </div>

                         {/* Invite Friends Card */}
                         <div className="flex w-full flex-col gap-3 rounded-3xl bg-[#1A1A1A] p-4">
                           <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                             <div className="font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">Invite your friends</div>
                             <div className="font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">@username</div>
                           </div>
                           <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                             <div className="flex-1 rounded-xl bg-[#2A2A2A] px-3 py-2">
                               <span className="font-urbanist text-xs font-medium leading-none tracking-[0%] text-[#D1D1D1]">https://example.com/referral/username</span>
                             </div>
                             <button className="rounded-xl bg-[#2A2A2A] p-2 transition-colors hover:bg-[#3A3A3A]">
                               <Copy className="h-4 w-4 text-white" />
                             </button>
                           </div>
                           <button className="flex w-fit flex-row items-center gap-2 rounded-xl bg-[#2A2A2A] px-3 py-2 transition-colors hover:bg-[#3A3A3A]">
                             <span className="font-urbanist text-xs font-medium leading-none tracking-[0%] text-[#FFFFFF]">Share on</span>
                             <X className="h-4 w-4 text-white" />
                           </button>
                         </div>
                       </div>

                       {/* Tabs Navigation */}
                       <div className="mt-4 flex w-full flex-wrap gap-6">
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
                        <div className="mt-2 flex w-full min-h-0 flex-1 flex-col gap-6">
                           {/* Social Quests Section */}
                           <div className="flex flex-col gap-4">
                             <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                               <h3 className="font-urbanist text-lg font-medium leading-none tracking-[0%] text-[#FFFFFF]">Social Quests</h3>
                               <span className="font-urbanist text-xs font-medium leading-none tracking-[0%] text-[#808080]">Refreshes daily 00:00 UTC</span>
                             </div>
                             
                             {/* Quest Cards */}
                             <div className="flex max-h-60 flex-col gap-3 overflow-y-auto rounded-2xl bg-[#121212]/20 p-2">
                               {/* Share on Twitter Quest */}
                               <div className="flex w-full flex-row items-center gap-3 rounded-2xl bg-[#1A1A1A] p-3">
                                 <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2A2A2A]">
                                   <Twitter className="h-5 w-5 text-[#808080]" />
                                 </div>
                                 <div className="flex-1">
                                   <div className="font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">Share on twitter</div>
                                   <div className="mt-1 font-urbanist text-xs font-medium leading-none tracking-[0%] text-[#808080]">Share to one of your friends on twitter.</div>
                                 </div>
                                 <div className="font-urbanist text-sm font-bold leading-none tracking-[0%] text-[#45FFAE]">+25 RP</div>
                               </div>

                               {/* Share on Discord Quest */}
                               <div className="flex w-full flex-row items-center gap-3 rounded-2xl bg-[#1A1A1A] p-3">
                                 <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2A2A2A]">
                                   <MessageCircle className="h-5 w-5 text-[#808080]" />
                                 </div>
                                 <div className="flex-1">
                                   <div className="font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">Share on Discord</div>
                                   <div className="mt-1 font-urbanist text-xs font-medium leading-none tracking-[0%] text-[#808080]">Share to one of your friends on Discord.</div>
                                 </div>
                                 <div className="font-urbanist text-sm font-bold leading-none tracking-[0%] text-[#45FFAE]">+25 RP</div>
                               </div>

                               {/* Share to 5 friends Quest */}
                               <div className="flex w-full flex-row items-center gap-3 rounded-2xl bg-[#1A1A1A] p-3">
                                 <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2A2A2A]">
                                   <Share2 className="h-5 w-5 text-[#808080]" />
                                 </div>
                                 <div className="flex-1">
                                   <div className="flex flex-row items-center gap-2">
                                     <div className="font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">Share to 5 friends</div>
                                     <div className="font-urbanist text-xs font-medium leading-none tracking-[0%] text-[#808080]">2/5</div>
                                   </div>
                                   <div className="mt-2 h-1 w-full rounded-full bg-[#2A2A2A]">
                                     <div className="h-full w-2/5 rounded-full bg-[#45FFAE]"></div>
                                   </div>
                                   <div className="mt-1 font-urbanist text-xs font-medium leading-none tracking-[0%] text-[#808080]">3 shares away from +250RP</div>
                                   <div className="font-urbanist text-xs font-medium leading-none tracking-[0%] text-[#808080]">Resets in 13 hours</div>
                                   <div className="font-urbanist text-xs font-medium leading-none tracking-[0%] text-[#808080]">$110 / $250</div>
                                 </div>
                                 <div className="font-urbanist text-sm font-bold leading-none tracking-[0%] text-[#45FFAE]">+250 RP</div>
                               </div>
                             </div>
                           </div>

                           {/* Product Quests Section */}
                           <div className="flex flex-col gap-4">
                             <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                               <h3 className="font-urbanist text-lg font-medium leading-none tracking-[0%] text-[#FFFFFF]">Product Quests</h3>
                               <span className="font-urbanist text-xs font-medium leading-none tracking-[0%] text-[#808080]">Refreshes daily 00:00 UTC</span>
                             </div>
                             
                             {/* Product Quest Cards */}
                             <div className="flex max-h-60 flex-col gap-3 overflow-y-auto rounded-2xl bg-[#121212]/20 p-2">
                               {[1, 2, 3].map((index) => (
                                <div key={index} className="flex w-full flex-row items-center gap-3 rounded-2xl bg-[#1A1A1A] p-3">
                                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2A2A2A]">
                                    <Twitter className="h-5 w-5 text-[#808080]" />
                                   </div>
                                   <div className="flex-1">
                                    <div className="font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">Share on twitter</div>
                                    <div className="mt-1 font-urbanist text-xs font-medium leading-none tracking-[0%] text-[#808080]">Refreshes daily</div>
                                   </div>
                                  <div className="font-urbanist text-sm font-bold leading-none tracking-[0%] text-[#45FFAE]">+25 RP</div>
                                 </div>
                               ))}
                             </div>
                           </div>
                         </div>
                       )}

                       {activeTab === "Points history" && (
                        <div className="mt-2 flex w-full flex-1 flex-col gap-4">
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                              <h3 className="font-urbanist text-lg font-medium leading-none tracking-[0%] text-[#FFFFFF]">Points received</h3>
                              <p className="font-urbanist text-xs font-medium leading-none tracking-[0%] text-[#808080]">Points will be updated every 24 hours</p>
                             </div>
                             
                            <div className="flex flex-col gap-3 rounded-2xl bg-[#121212]/20 p-2">
                               {/* Points History Items */}
                               {[
                                 { action: "Share on twitter", points: "+25 RP", status: "Received" },
                                 { action: "Share on twitter", points: "+25 RP", status: "Received" },
                                 { action: "Share on twitter", points: "+25 RP", status: "Received" }
                               ].map((item, index) => (
                                <div key={index} className="flex w-full flex-row items-center gap-4 rounded-2xl bg-[#1A1A1A] p-3">
                                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2A2A2A]">
                                    <Twitter className="h-5 w-5 text-[#808080]" />
                                   </div>
                                   <div className="flex-1">
                                    <div className="font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">{item.action}</div>
                                   </div>
                                  <div className="font-urbanist text-sm font-bold leading-none tracking-[0%] text-[#45FFAE]">{item.points}</div>
                                  <div className="flex flex-row items-center gap-1 rounded-full bg-[#45FFAE] px-3 py-1">
                                    <span className="font-urbanist text-xs font-medium leading-none tracking-[0%] text-black">{item.status}</span>
                                    <Check className="h-3 w-3 text-black" />
                                   </div>
                                 </div>
                               ))}
                             </div>
                           </div>
                         </div>
                       )}

                       {activeTab === "Leaderboard" && (
                        <div className="mt-2 flex w-full flex-1 flex-col gap-4">
                          <div className="flex flex-col gap-4">
                             {/* User's Current Standing */}
                             <div className="flex flex-row items-center justify-between rounded-2xl bg-[#1A1A1A] p-4">
                               <div className="font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">You</div>
                               <div className="font-urbanist text-sm font-bold leading-none tracking-[0%] text-[#45FFAE]">+995.565</div>
                             </div>
                             
                             {/* Leaderboard Table */}
                             <div className="flex flex-col gap-3 rounded-2xl bg-[#1A1A1A] p-4">
                               {/* Table Header */}
                               <div className="flex flex-row items-center gap-4 rounded-xl bg-[#121212]/40 p-3">
                                 <div className="w-16 font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#808080]">Rank</div>
                                 <div className="flex-1 font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#808080]">Wallet</div>
                                 <div className="font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#808080]">Points</div>
                               </div>
                               
                               {/* Leaderboard Entries */}
                               {[
                                 { rank: 1, wallet: "0xAlbC...789", points: "+995.565" },
                                 { rank: 2, wallet: "0xD3ef...456", points: "+987.654" },
                                 { rank: 3, wallet: "0x85oD...123", points: "+543.210" },
                                 { rank: 4, wallet: "0xC7eE...890", points: "+321.098" },
                                 { rank: 5, wallet: "0xF9bC...234", points: "+123.456" }
                               ].map((entry, index) => (
                                <div key={index} className="flex flex-row items-center gap-4 rounded-xl bg-[#121212]/20 p-3">
                                  <div className="w-16 font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">{entry.rank}</div>
                                  <div className="flex-1 font-urbanist text-sm font-medium leading-none tracking-[0%] text-[#FFFFFF]">{entry.wallet}</div>
                                  <div className="font-urbanist text-sm font-bold leading-none tracking-[0%] text-[#45FFAE]">{entry.points}</div>
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
