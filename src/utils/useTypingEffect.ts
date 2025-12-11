import { useState, useEffect } from 'react'

/**
 * Hook to create a typing effect for text
 * @param text - The full text to display
 * @param speed - Typing speed in milliseconds per character (default: 10)
 * @param enabled - Whether to enable typing effect (default: true)
 * @returns The currently displayed text
 */
export function useTypingEffect(text: string, speed: number = 10, enabled: boolean = true): string {
  const [displayedText, setDisplayedText] = useState<string>('')

  useEffect(() => {
    if (!enabled || !text) {
      setDisplayedText(text)
      return
    }

    setDisplayedText('')
    let currentIndex = 0
    const timeoutIds: NodeJS.Timeout[] = []

    const typeNextChar = () => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1))
        currentIndex++
        const timeoutId = setTimeout(typeNextChar, speed)
        timeoutIds.push(timeoutId)
      }
    }

    // Start typing after a small delay
    const initialTimeout = setTimeout(() => {
      typeNextChar()
    }, 100)
    timeoutIds.push(initialTimeout)

    return () => {
      timeoutIds.forEach(id => clearTimeout(id))
    }
  }, [text, speed, enabled])

  return displayedText
}

