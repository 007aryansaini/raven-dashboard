import { useEffect, useRef } from "react"

const MathematicalAccuracy = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to top when component mounts
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className="relative flex min-h-full flex-col items-center justify-center gap-8 overflow-y-auto px-4 py-10 text-white sm:px-6 lg:px-10"
      style={{
        background: `
          radial-gradient(circle at center, rgba(69, 255, 174, 0.1) 0%, rgba(0, 0, 0, 0.8) 70%, rgba(0, 0, 0, 1) 100%),
          linear-gradient(90deg, rgba(69, 255, 174, 0.05) 1px, transparent 1px),
          linear-gradient(rgba(69, 255, 174, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 60px 60px, 60px 60px',
        backgroundColor: '#000000'
      }}
    >
      <div className="flex flex-col items-center justify-center gap-6">
        <div 
          className="font-urbanist font-semibold text-4xl text-[#45FFAE]"
          style={{
            letterSpacing: '-2%'
          }}
        >
          Coming Soon
        </div>
        <div 
          className="font-urbanist font-normal text-lg text-[#808080] text-center max-w-md"
        >
          Mathematical accuracy feature is under development. Stay tuned!
        </div>
      </div>
    </div>
  )
}

export default MathematicalAccuracy

