import React, { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export type TabType = 'polymarket' | 'crypto'

interface TabContextType {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
}

const TabContext = createContext<TabContextType | undefined>(undefined)

interface TabProviderProps {
  children: ReactNode
}

export const TabProvider: React.FC<TabProviderProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('polymarket')

  const value = {
    activeTab,
    setActiveTab
  }

  return (
    <TabContext.Provider value={value}>
      {children}
    </TabContext.Provider>
  )
}

export const useTab = (): TabContextType => {
  const context = useContext(TabContext)
  if (context === undefined) {
    throw new Error('useTab must be used within a TabProvider')
  }
  return context
}
