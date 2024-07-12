import { MdOutlineModeEdit } from 'react-icons/md'
import { useParams } from 'react-router-dom'

import { Avatar } from '@/components/ui/Avatar'
import { BadgeSection } from '@/components/ui/BadgeSection'
import { Box } from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { SeasonalBadgeSection } from '@/components/ui/SeasonalBadgeSection'
import { useSeasons } from '@/hooks/seasons'

export function Profile() {
  const { orgAggregates } = useSeasons()
  const { user } = useParams()

  return (
    <div className="mx-auto max-w-container-md space-y-8 py-8 mobile:pt-0 desktop:px-4">
      <Box className="divide-y divide-gray-2 overflow-hidden p-0 mobile:rounded-none mobile:border-0 mobile:bg-black">
        <div className="relative h-52 w-full bg-gradient">
          {/* Later control disabled based on the logged in account vs profile link */}
          <Button variant="secondary" className="absolute right-4 top-4 z-10" disabled>
            <MdOutlineModeEdit className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-4 p-8 mobile:px-4">
          <Avatar size="lg" className="flex-none">
            {user ? user.slice(0, 2) : 'un'}
          </Avatar>
          <h1 className="text-title-2 text-white">{user ?? 'unknown'}</h1>
        </div>

        <BadgeSection />

        {orgAggregates.map((agg, index) => (
          <SeasonalBadgeSection key={index} agg={agg} />
        ))}
      </Box>
    </div>
  )
}
