'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'

interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

interface TabsProps {
  tabs: Tab[]
  activeTab?: string
  onChange?: (tabId: string) => void
}

export function Tabs({ tabs, activeTab: controlledActiveTab, onChange }: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.id || '')
  const activeTab = controlledActiveTab ?? internalActiveTab

  const handleTabChange = (tabId: string) => {
    if (!controlledActiveTab) {
      setInternalActiveTab(tabId)
    }
    onChange?.(tabId)
  }

  return (
    <div className="w-full">
      {/* Tab buttons */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-all relative',
              activeTab === tab.id
                ? 'text-neon-teal'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-teal" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  )
}
