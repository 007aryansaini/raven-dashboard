import { useTypingEffect } from '../utils/useTypingEffect'

interface TypingMessageProps {
  content: string
  isAssistant: boolean
  isNewMessage: boolean
  speed?: number
  children?: (displayedText: string) => React.ReactNode
}

/**
 * Component that displays text with a typing effect for assistant messages
 */
export function TypingMessage({ 
  content, 
  isAssistant, 
  isNewMessage, 
  speed = 20,
  children 
}: TypingMessageProps) {
  // Only apply typing effect to assistant messages that are new
  const shouldType = isAssistant && isNewMessage
  const displayedText = useTypingEffect(content, speed, shouldType)

  if (children) {
    return <>{children(displayedText)}</>
  }

  return <>{displayedText}</>
}

