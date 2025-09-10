import { ArrowDown, ArrowUp, Info, MoveRight } from "lucide-react"
import { useRef, useState } from "react"
import bolt from "../assets/bolt.svg"
import blackDot from "../assets/blackDot.svg"

const body = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleSubmit = () => {
    if (inputValue.trim()) {
      console.log("Submitted:", inputValue)
      // Add your submission logic here
      setInputValue("")
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }


  return (
    <div className="flex flex-col h-full bg-black items-center justtify-between py-5 gap-5">
           <div className="flex flex-col gap-3">
                 <div className="font-urbanist font-medium text-4xl leading-none tracking-[0%] text-[#FFFFFF]">Artificial Prediction Intelligence</div>
                <div className="w-full flex flex-row justify-center items-center">
                 <div className="flex flex-row border border-gray-500 w-fit h-10 rounded-full mt-2 gap-4 items-center p-2">
                    <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#4f4f4f] p-1 bg-[#45FFAE] h-fit bg-opacity-50 rounded-full text-center">Raven</div>
                    <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#E0E0E0]">I predict what the market hasn't priced yet.</div>
                 </div>
                 </div>

           </div>

           {/* Placeholder Container */}
           <div className="w-5xl">
             <div className=" flex-col gap-4 w-full h-96 bg-[#141414] rounded-lg p-4 flex items-center justify-center">
               <div className="text-[#808080] font-urbanist font-medium text-lg">
                 
               </div>
             </div>
             {/* Spacer for pagination dots area */}
             <div className="flex justify-center mt-6 gap-2">
               <div className="w-3 h-3"></div>
             </div>
           </div>




           <div className="flex flex-col gap-4 w-5xl h-44 bg-[#141414] rounded-lg p-4 justify-between">
               
               <div className="flex flex-row items-center justify-between">
                       <div className="flex flex-row gap-2 items-center">
                            <img src={bolt} alt="bolt"  className="h-3 w-3"/>
                            <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#808080]">Unlock more with paid plans</div>
                            <MoveRight className="text-[#808080] text-center"/>
                       </div>

               </div>



          <div className="h-30 w-full bg-[#1A1A1A] rounded-lg flex flex-row p-2 items-start justify-between" >

            <div className="flex flex-row items-center justify-between gap-2 flex-1">
                <img src={blackDot} alt="history" className="h-5 w-5"/>
                <div className="font-urbanist font-medium text-lg  text-[#3E3E3E]">|</div>
                <input 
                  ref={inputRef}
                  type="text" 
                  placeholder="Ask me anything" 
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="font-urbanist font-medium text-lg text-[#FFFFFF] bg-transparent outline-none focus:outline-none focus:ring-0 focus:border-none flex-1 placeholder-[#3E3E3E]"
                />
            </div>

            <ArrowUp 
              className={`h-5 w-5 cursor-pointer transition-all duration-200 ${inputValue.trim() ? 'text-[#45FFAE] hover:scale-110' : 'text-[#808080]'}`} 
              onClick={handleSubmit}
            />

         </div>

         <div className="flex flex-row items-center justify-start gap-2">

              <div className="flex flex-row items-center justify-between gap-2 bg-[#282828] rounded-lg p-2 cursor-pointer">
                       <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#808080]">
                           Timeframe
                       </div>
                       <Info className="text-[#808080] h-3 w-3"/>

                       <div>
                       <ArrowDown className="text-[#808080] h-3 w-3"/>
                       </div>
              </div>

              <div className="flex flex-row items-center justify-between gap-2 bg-[#282828] rounded-lg p-2 cursor-pointer">
                       <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#808080]">
                           Analysis
                       </div>
                       <Info className="text-[#808080] h-3 w-3"/>

                       <div>
                       <ArrowDown className="text-[#808080] h-3 w-3"/>
                       </div>
              </div>

              <div className="flex flex-row items-center justify-between gap-2 bg-[#282828] rounded-lg p-2 cursor-pointer">
                       <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#808080]">
                           Assets
                       </div>
                       <Info className="text-[#808080] h-3 w-3"/>

                       <div>
                       <ArrowDown className="text-[#808080] h-3 w-3"/>
                       </div>
              </div>

            

         </div>



           </div>
    </div>
  )
}

export default body
