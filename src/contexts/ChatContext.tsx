import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { 
  collection, 
  addDoc, 
  updateDoc,
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc,
  serverTimestamp 
} from 'firebase/firestore'
import { db, auth } from '../firebase'
import { toast } from 'react-toastify'

export interface ChatMessage {
  id: number
  role: "user" | "assistant"
  content: string
  imageSrc?: string
  reasoning?: string
  answer?: string
  chartType?: "btc"
}

export interface SavedChat {
  id: string
  title: string
  messages: ChatMessage[]
  route: string
  createdAt: any
  userId: string
}

interface ChatContextType {
  saveChat: (messages: ChatMessage[], route: string) => Promise<void>
  loadChat: (chatId: string) => Promise<SavedChat | null>
  getRecentChats: (limit?: number) => Promise<SavedChat[]>
  currentChatId: string | null
  setCurrentChatId: (id: string | null) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const saveChat = async (messages: ChatMessage[], route: string) => {
    // Prevent multiple simultaneous saves
    if (isSaving) {
      return
    }

    try {
      setIsSaving(true)
      const user = auth.currentUser
      
      if (!user) {
        setIsSaving(false)
        return
      }

      if (messages.length === 0) {
        setIsSaving(false)
        return
      }

      // Get the first user message as the title
      const firstUserMessage = messages.find(m => m.role === 'user')
      const title = firstUserMessage?.content.substring(0, 50) || 'New Chat'

      // If we have a current chat ID, update the existing chat
      if (currentChatId) {
        try {
          const chatRef = doc(db, 'chats', currentChatId)
          await updateDoc(chatRef, {
            title,
            messages,
            route,
            updatedAt: serverTimestamp()
          })
          return
        } catch (updateError: any) {
          // If update fails, create a new one
          console.warn('Failed to update chat, creating new one:', updateError)
        }
      }

      // Create a new chat
      const chatData = {
        title,
        messages,
        route,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'chats'), chatData)
      setCurrentChatId(docRef.id)
    } catch (error: any) {
      console.error('Auto-save chat failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const loadChat = async (chatId: string): Promise<SavedChat | null> => {
    try {
      const user = auth.currentUser
      if (!user) {
        toast.warning('Please login to load chats', {
          style: { fontSize: '12px' }
        })
        return null
      }

      const chatDoc = await getDoc(doc(db, 'chats', chatId))
      if (!chatDoc.exists()) {
        toast.error('Chat not found', {
          style: { fontSize: '12px' }
        })
        return null
      }

      const chatData = chatDoc.data()
      if (chatData.userId !== user.uid) {
        toast.error('Unauthorized access', {
          style: { fontSize: '12px' }
        })
        return null
      }

      setCurrentChatId(chatId)
      return {
        id: chatDoc.id,
        title: chatData.title,
        messages: chatData.messages,
        route: chatData.route,
        createdAt: chatData.createdAt,
        userId: chatData.userId
      }
    } catch (error: any) {
      console.error('Error loading chat:', error)
      toast.error(`Failed to load chat: ${error.message}`, {
        style: { fontSize: '12px' }
      })
      return null
    }
  }

  const getRecentChats = async (limit: number = 15): Promise<SavedChat[]> => {
    try {
      const user = auth.currentUser
      if (!user) {
        return []
      }

      // Get all chats for the user
      const q = query(
        collection(db, 'chats'),
        where('userId', '==', user.uid)
      )

      const querySnapshot = await getDocs(q)
      const chats: SavedChat[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        chats.push({
          id: doc.id,
          title: data.title,
          messages: data.messages,
          route: data.route,
          createdAt: data.createdAt,
          userId: data.userId,
          updatedAt: data.updatedAt || data.createdAt // Include updatedAt for sorting
        } as SavedChat & { updatedAt?: any })
      })

      // Sort by updatedAt if available, otherwise by createdAt (most recent first)
      chats.sort((a, b) => {
        // Try to get updatedAt timestamp, fallback to createdAt
        const aUpdated = (a as any).updatedAt?.toMillis?.() || a.createdAt?.toMillis?.() || 0
        const bUpdated = (b as any).updatedAt?.toMillis?.() || b.createdAt?.toMillis?.() || 0
        return bUpdated - aUpdated // Descending order (newest first)
      })

      // Remove duplicates by ID (shouldn't be needed, but just in case)
      const uniqueChatsMap = new Map<string, SavedChat>()
      chats.forEach(chat => {
        if (!uniqueChatsMap.has(chat.id)) {
          uniqueChatsMap.set(chat.id, chat)
        }
      })

      return Array.from(uniqueChatsMap.values()).slice(0, limit)
    } catch (error: any) {
      console.error('Error fetching recent chats:', error)
      return []
    }
  }

  return (
    <ChatContext.Provider value={{
      saveChat,
      loadChat,
      getRecentChats,
      currentChatId,
      setCurrentChatId
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}

