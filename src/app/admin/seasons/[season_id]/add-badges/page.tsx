'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useParams } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'

import {
  HeaderAdmin,
  HeaderAdminBack,
  HeaderAdminTitle,
} from '@/components/header-admin'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import { InputBadges } from '@/components/ui/input-badges'

const addBadgesSchema = z.object({
  badges: z.string().array().min(1, 'Badges is required'),
})

type AddBadgesSchema = z.infer<typeof addBadgesSchema>

export default function AddBadgesPage() {
  const params = useParams()

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddBadgesSchema>({
    resolver: zodResolver(addBadgesSchema),
  })

  async function onSubmit({ badges }: AddBadgesSchema) {
    console.log({
      badges,
    })
  }

  return (
    <>
      <HeaderAdmin>
        <HeaderAdminBack href={`/admin/seasons/${params.season_id}`}>
          {decodeURIComponent(params.season_id as string)}
        </HeaderAdminBack>
        <HeaderAdminTitle
          title={
            <>
              Add badge{' '}
              <span className="text-gray-3">(to season / to series)</span>
            </>
          }
          className="max-w-container-md"
        />
      </HeaderAdmin>
      <div className="mx-auto min-h-[calc(100vh-24rem)] max-w-container-md px-4 pb-8">
        <Box className="mobile:rounded-none mobile:border-0 mobile:bg-black mobile:p-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <Controller
              name="badges"
              control={control}
              render={({ field }) => (
                <InputBadges
                  value={field.value}
                  onChange={field.onChange}
                  error={errors['badges']?.message}
                />
              )}
            />

            <Button type="submit" variant="primary" size="lg">
              {isSubmitting ? 'Adding...' : 'Add'}
            </Button>
          </form>
        </Box>
      </div>
    </>
  )
}
