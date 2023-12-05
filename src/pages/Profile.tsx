import { MdOutlineModeEdit } from 'react-icons/md'

import { Avatar } from '@/components/ui/Avatar'
import { Box } from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'

export function Profile() {
  return (
    <div className="mx-auto max-w-container-md space-y-8 px-4 py-8">
      <Box className="overflow-hidden p-0">
        <div className="relative h-52 w-full bg-gradient">
          <Button variant="secondary" className="absolute right-4 top-4 z-10">
            <MdOutlineModeEdit className="h-6 w-6" />
          </Button>
        </div>
        <div className="grid grid-cols-8">
          <div className="col-span-3 border-r border-gray-2 text-body-2">
            <div className="p-8">
              <Avatar size="lg" className="mb-4">
                EP
              </Avatar>
              <h1 className="text-white">Elton Pongilo</h1>
              <p className="text-gray-3">elton@detroitledger.tech</p>
              <p className="text-gray-3">@eosdpongilo1</p>
              <div className="mt-4 space-y-4 border-t border-gray-2 pt-4">
                <h4 className="text-white">Badges stats</h4>
                <p className="flex justify-between text-white">
                  <span className="text-gray-3">Total</span>
                  587
                </p>
                <p className="flex justify-between text-white">
                  <span className="text-gray-3">Official</span>
                  176
                </p>
                <p className="flex justify-between text-white">
                  <span className="text-gray-3">Mutual</span>
                  411
                </p>
              </div>
            </div>
          </div>
          <div className="col-span-5"></div>
          <div className="col-span-8 border-t border-gray-2 p-8">
            <h3 className="text-title-2 text-white">Received badges (All)</h3>
          </div>
        </div>
      </Box>
      <Box>
        <h2 className="text-title-1 text-white">Messages</h2>
      </Box>
    </div>
  )
}
