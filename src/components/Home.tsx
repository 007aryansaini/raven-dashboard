
import { ArrowDown, ArrowUp, MoveRight } from "lucide-react"
import { useRef, useState } from "react"
import bolt from "../assets/bolt.svg"
import blackDot from "../assets/blackDot.svg"

const Home = () => {
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
    <div className="flex flex-col h-full items-center justify-center py-5 gap-20 relative" 
         style={{
           background: `
             radial-gradient(circle at center, rgba(69, 255, 174, 0.1) 0%, rgba(0, 0, 0, 0.8) 70%, rgba(0, 0, 0, 1) 100%),
             linear-gradient(90deg, rgba(69, 255, 174, 0.05) 1px, transparent 1px),
             linear-gradient(rgba(69, 255, 174, 0.05) 1px, transparent 1px)
           `,
           backgroundSize: '100% 100%, 60px 60px, 60px 60px',
           backgroundColor: '#000000'
         }}>
           <div className="flex flex-col gap-3">
                 <div className="font-urbanist font-medium text-4xl leading-none tracking-[0%] text-[#FFFFFF]">Artificial Prediction Intelligence</div>
                <div className="w-full flex flex-row justify-center items-center">
                 <div className="flex flex-row border border-gray-500 w-fit h-10 rounded-full mt-2 gap-4 items-center p-2">
                    <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#4f4f4f] p-1 bg-[#45FFAE] h-fit bg-opacity-50 rounded-full text-center">Raven</div>
                    <div className="font-urbanist font-medium text-sm leading-none tracking-[0%] text-[#E0E0E0]">I predict what the market hasn't priced yet.</div>
                 </div>
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
                  placeholder="Ask anything" 
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

         <div className="flex flex-row items-center justify-start">

              <div className="flex flex-row items-center gap-2 bg-black bg-opacity-70 rounded-lg px-3 py-2 cursor-pointer w-fit h-fit">
                       <div className="font-urbanist font-medium text-xs leading-none tracking-[0%] text-[#FFFFFF] mr-4">
                           Market
                       </div>
                       <ArrowDown className="text-[#808080] h-3 w-3"/>
              </div>

         </div>

           </div>
    </div>
  )
}

export default Home
