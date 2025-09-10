

const Points = () => {
  return (
    <div className="flex flex-col h-full items-center justtify-between py-5 gap-5 relative text-white"  
         style={{
           background: `
             radial-gradient(circle at center, rgba(69, 255, 174, 0.1) 0%, rgba(0, 0, 0, 0.8) 70%, rgba(0, 0, 0, 1) 100%),
             linear-gradient(90deg, rgba(69, 255, 174, 0.05) 1px, transparent 1px),
             linear-gradient(rgba(69, 255, 174, 0.05) 1px, transparent 1px)
           `,
           backgroundSize: '100% 100%, 60px 60px, 60px 60px',
           backgroundColor: '#000000'
         }}>
     

     <div className="flex flex-col h-full items-center justtify-betweene">
               
               <div className="flex flex-col gap-3 items-center">
                      
                       <div className="flex flex-col gap-3 items-center justify-center h-40 w-4xl bg-[#141414] rounded-lg">
                             <div className="font-urbanist font-medium text-[32px] leading-none tracking-[0%] text-[#FFFFFF]">Earn Points, Unlock Rewards</div> 
                             <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#D1D1D1]">Finish quick quests and stack points to claim rewards.</div>
                       </div>


                       <div className="flex flex-row items-center gap-2">

                        

                       </div>


               </div>
     </div>


    </div>
  )
}

export default Points
