'use client'

import { useState } from 'react'
import { MdOutlineDynamicFeed, MdOutlineWorkspacePremium } from 'react-icons/md'

type ProfileTabsProps = {
  feedContent: React.ReactNode
  badgesContent: React.ReactNode
}

export function ProfileTabs({ feedContent, badgesContent }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'badges'>('feed')

  return (
    <>
      <div className="border-gray-2 flex gap-6 border-b px-8 pt-4 max-md:px-4">
        <button
          type="button"
          data-state={activeTab === 'feed' ? 'active' : 'idle'}
          className="text-body-2 text-gray-3 relative flex cursor-pointer items-center gap-2 pb-4 font-medium data-[state=active]:text-white data-[state=active]:before:absolute data-[state=active]:before:bottom-0 data-[state=active]:before:left-0 data-[state=active]:before:h-0.5 data-[state=active]:before:w-full data-[state=active]:before:bg-white"
          onClick={() => setActiveTab('feed')}
        >
          <MdOutlineDynamicFeed className="size-5" />
          Feed
        </button>
        <button
          type="button"
          data-state={activeTab === 'badges' ? 'active' : 'idle'}
          className="text-body-2 text-gray-3 relative flex cursor-pointer items-center gap-2 pb-4 font-medium data-[state=active]:text-white data-[state=active]:before:absolute data-[state=active]:before:bottom-0 data-[state=active]:before:left-0 data-[state=active]:before:h-0.5 data-[state=active]:before:w-full data-[state=active]:before:bg-white"
          onClick={() => setActiveTab('badges')}
        >
          <MdOutlineWorkspacePremium className="size-5" />
          Badges
        </button>
      </div>
      {activeTab === 'feed' && feedContent}
      {activeTab === 'badges' && badgesContent}
    </>
  )
}
