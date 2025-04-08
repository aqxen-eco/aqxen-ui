'use client'

import { Button } from '@/components/ui/button'
import { DropdownItem, DropdownRoot } from '@/components/ui/dropdown'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box } from '@/components/ui/box'
import { Avatar } from '@/components/ui/avatar'
import { BadgeImage } from '@/components/ui/badge-image'
import { Tooltip } from '@/components/ui/tooltip'
import { MdWorkspacePremium, MdMoreHoriz } from 'react-icons/md'

const sortList = [
  {
    description: 'Latest',
    value: 'latest',
  },
]

const postSchema = z.object({
  postContent: z.string().nonempty('Post content is required'),
})

type PostSchema = z.infer<typeof postSchema>

export default function FeedPage() {
  const [sort, setSort] = useState<Record<string, string>>(sortList[0])
  const [filter, setFilter] = useState('myRecognitions')

  const { register, handleSubmit, watch } = useForm<PostSchema>({
    resolver: zodResolver(postSchema),
  })

  const postContentWatched = watch('postContent')

  const onSubmit = ({ postContent }: PostSchema) => {
    console.log(postContent)
  }

  return (
    <div className="max-w-container-md mx-auto px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-title-1 text-white">Feed</h1>
        <DropdownRoot label={sort.description} align="end">
          {sortList.map((item) => (
            <DropdownItem
              key={item.value}
              isSelected={sort.value === item.value}
              onClick={() => {
                setSort(item)
              }}
            >
              {item.description}
            </DropdownItem>
          ))}
        </DropdownRoot>
      </header>
      <div className="border-gray-2 overflow-x-auto border-b py-2">
        <ul className="flex gap-2">
          <li
            data-state={filter === 'myRecognitions' ? 'active' : 'idle'}
            className="relative data-[state=active]:before:absolute data-[state=active]:before:-bottom-2 data-[state=active]:before:h-px data-[state=active]:before:w-full data-[state=active]:before:bg-white"
          >
            <Button
              onClick={() => setFilter('myRecognitions')}
              variant={filter === 'myRecognitions' ? 'link' : 'default'}
            >
              My Recognitions
            </Button>
          </li>
          <li
            data-state={filter === 'teamRecognitions' ? 'active' : 'idle'}
            className="relative data-[state=active]:before:absolute data-[state=active]:before:-bottom-2 data-[state=active]:before:h-px data-[state=active]:before:w-full data-[state=active]:before:bg-white"
          >
            <Button
              onClick={() => setFilter('teamRecognitions')}
              variant={filter === 'teamRecognitions' ? 'link' : 'default'}
            >
              Team Recognitions
            </Button>
          </li>
          <li
            data-state={
              filter === 'organizationRecognitions' ? 'active' : 'idle'
            }
            className="relative data-[state=active]:before:absolute data-[state=active]:before:-bottom-2 data-[state=active]:before:h-px data-[state=active]:before:w-full data-[state=active]:before:bg-white"
          >
            <Button
              onClick={() => setFilter('organizationRecognitions')}
              variant={
                filter === 'organizationRecognitions' ? 'link' : 'default'
              }
            >
              Organization Recognitions
            </Button>
          </li>
        </ul>
      </div>
      <div className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)}>
          <label className="bg-gray-1 border-gray-2 mt-4 block space-y-4 rounded-2xl border p-4">
            <textarea
              {...register('postContent')}
              placeholder="What do you consider is worth recognition?"
              className="text-body-1 placeholder:text-gray-3 block field-sizing-content w-full resize-none outline-none"
              rows={1}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                disabled={
                  !postContentWatched || postContentWatched.length === 0
                }
              >
                Post
              </Button>
            </div>
          </label>
        </form>
        <hr className="border-gray-2 border-t" />
        <Box className="before:bg-gray-2 after:bg-gray-2 relative p-0 before:absolute before:top-4 before:left-10 before:h-[calc(100%-2rem)] before:w-0.5 before:content-[''] after:absolute after:bottom-4 after:left-9.25 after:size-2 after:rounded-full after:content-[''] md:p-4 md:before:top-8 md:before:left-14 md:before:h-[calc(100%-4rem)] md:after:bottom-8 md:after:left-13.25">
          <div className="grid grid-cols-[3rem_1fr] gap-4 p-4">
            <Avatar size="md" className="ring-gray-1 relative z-10 ring-8">
              AZ
            </Avatar>
            <div className="max-md:space-y-2">
              <div className="flex flex-wrap items-center justify-between max-md:space-y-2">
                <p className="text-body-2 text-gray-3 max-w-full">
                  <span className="text-white">Adam Zientarski</span> received{' '}
                  <span className="text-white">10 badges</span> by{' '}
                  <span className="text-white">Karyne</span> and 3 others • Tue
                  8 Aug
                </p>
                <div className="text-gray-3 flex gap-0.5">
                  <MdWorkspacePremium className="size-6" />
                  <span className="text-body-2">50</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {[2, 4, 2, 1, 1].map((value, index) => (
                  <Tooltip
                    key={index}
                    className="text-gray-3 flex gap-0.5 p-1.5"
                    content={
                      <>
                        <MdWorkspacePremium className="size-6" />
                        <span className="text-body-2">3</span>
                      </>
                    }
                  >
                    <div className="flex min-w-16 gap-2">
                      <BadgeImage src="" size="xs" />
                      <span className="text-body-2 text-white">{value}</span>
                    </div>
                  </Tooltip>
                ))}
              </div>
              <Button variant="secondary" className="mt-2">
                +1 recognize
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-[3rem_1fr] gap-4 p-4">
            <Avatar size="md" className="ring-gray-1 relative z-10 ring-8">
              AZ
            </Avatar>
            <div className="max-md:space-y-2">
              <div className="flex flex-wrap items-center justify-between max-md:space-y-2">
                <div className="flex gap-2">
                  <p className="text-body-2 max-w-full text-white">
                    Karyne Mayer
                  </p>
                  <Avatar size="xs">AZ</Avatar>
                  <span className="text-body-2 text-gray-3">
                    Responsibility
                  </span>
                </div>
                <div className="text-gray-3 flex gap-0.5">
                  <MdWorkspacePremium className="size-6" />
                  <span className="text-body-2">50</span>
                </div>
              </div>
              <p className="text-body-2 text-gray-3">
                Highly recommend him for his exceptional sense of
                responsibility. Dependable and dedicated, he consistently goes
                above and beyond, making them an invaluable asset to any team or
                project.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-[3rem_1fr] gap-4 p-4">
            <div className="border-gray-2 bg-gray-1 ring-gray-1 relative z-10 flex size-12 items-center justify-center rounded-full border ring-8">
              <MdMoreHoriz className="size-6 text-white" />
            </div>
            <div className="flex items-center justify-start">
              <Button variant="secondary">Show More</Button>
            </div>
          </div>
        </Box>
      </div>
    </div>
  )
}
