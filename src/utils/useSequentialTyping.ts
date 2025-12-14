import { useState, useEffect } from 'react'

/**
 * Hook to create sequential typing effect - first text completes, then second starts
 * @param firstText - The first text to type
 * @param secondText - The second text to type (starts after first completes)
 * @param speed - Typing speed in milliseconds per character (default: 8)
 * @param enabled - Whether to enable typing effect (default: true)
 * @returns Object with displayedFirst and displayedSecond
 */
export function useSequentialTyping(
  firstText: string,
  secondText: string,
  speed: number = 8,
  enabled: boolean = true
): { displayedFirst: string; displayedSecond: string; isFirstComplete: boolean } {
  const [displayedFirst, setDisplayedFirst] = useState<string>('')
  const [displayedSecond, setDisplayedSecond] = useState<string>('')
  const [isFirstComplete, setIsFirstComplete] = useState<boolean>(false)

  useEffect(() => {
    if (!enabled) {
      setDisplayedFirst(firstText)
      setDisplayedSecond(secondText)
      setIsFirstComplete(true)
      return
    }

    // Reset when texts change
    setDisplayedFirst('')
    setDisplayedSecond('')
    setIsFirstComplete(false)

    let firstIndex = 0
    let secondIndex = 0
    const timeoutIds: NodeJS.Timeout[] = []
    let isCancelled = false

    // Type first text
    const typeFirst = () => {
      if (isCancelled) return
      if (firstIndex < firstText.length) {
        setDisplayedFirst(firstText.slice(0, firstIndex + 1))
        firstIndex++
        const timeoutId = setTimeout(typeFirst, speed)
        timeoutIds.push(timeoutId)
      } else {
        // First text is complete, ensure it's fully set
        setDisplayedFirst(firstText)
        setIsFirstComplete(true)
        const delayBeforeSecond = setTimeout(() => {
          if (!isCancelled) {
            typeSecond()
          }
        }, 300) // Small delay before starting second text
        timeoutIds.push(delayBeforeSecond)
      }
    }

    // Type second text
    const typeSecond = () => {
      if (isCancelled) return
      if (secondIndex < secondText.length) {
        setDisplayedSecond(secondText.slice(0, secondIndex + 1))
        secondIndex++
        const timeoutId = setTimeout(typeSecond, speed)
        timeoutIds.push(timeoutId)
      } else {
        // Second text is complete, ensure it's fully set
        setDisplayedSecond(secondText)
      }
    }

    // Start typing first text after a small delay
    const initialTimeout = setTimeout(() => {
      if (!isCancelled) {
        typeFirst()
      }
    }, 100)
    timeoutIds.push(initialTimeout)

    return () => {
      isCancelled = true
      timeoutIds.forEach(id => clearTimeout(id))
    }
  }, [firstText, secondText, speed, enabled])

  return { displayedFirst, displayedSecond, isFirstComplete }
}

