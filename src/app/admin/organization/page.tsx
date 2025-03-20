'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'

import { updateOrganization } from '@/api/chain/organization/update-organization'
import { Badge } from '@/components/ui/badge'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import { ErrorMessage, Field, Label } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useChain } from '@/contexts/chain'
import { useOrganization } from '@/contexts/organization'

const organizationSchema = z.object({
  displayName: z.string().min(1, 'Name is required'),
  ipfs: z.string().min(1, 'Logo is required'),
})

type OrganizationSchema = z.infer<typeof organizationSchema>

export default function OrganizationPage() {
  const { session } = useChain()
  const { name, symbol, displayName, ipfs } = useOrganization()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isLoading },
  } = useForm<OrganizationSchema>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      displayName: displayName,
      ipfs: ipfs,
    },
  })

  const logo = watch('ipfs')

  async function onSubmit({ displayName, ipfs }: OrganizationSchema) {
    await updateOrganization({
      session: session!,
      org: name,
      display_name: displayName,
      ipfs_image: ipfs,
    })
  }

  useEffect(() => {
    reset({
      displayName,
      ipfs,
    })
  }, [displayName, ipfs, reset])

  return (
    <Box className="p-0 max-md:space-y-8 max-md:rounded-none max-md:border-0 max-md:bg-black md:grid md:grid-cols-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 p-8 max-md:p-0 md:col-span-4"
      >
        <Field>
          <Label htmlFor="displayName">Name</Label>
          <Input
            id="displayName"
            {...register('displayName')}
            aria-invalid={!!errors['displayName']}
            disabled={isLoading}
          />
          <ErrorMessage>{errors['displayName']?.message}</ErrorMessage>
        </Field>
        <Field>
          <Label htmlFor="ipfs">Logo IPFS Image hash</Label>
          <Input
            id="ipfs"
            {...register('ipfs')}
            aria-invalid={!!errors['ipfs']}
            disabled={isLoading}
          />
          <ErrorMessage>{errors['ipfs']?.message}</ErrorMessage>
        </Field>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </form>
      <div className="border-gray-2 max-md:bg-gray-1 space-y-4 border-l p-8 max-md:rounded-2xl max-md:border max-md:p-4 md:col-span-2">
        <h2 className="text-title-2 text-white">Organization preview</h2>
        <Badge
          ipfs={logo}
          name={displayName ?? name}
          balance={symbol.toUpperCase()}
        />
        {/* <hr className="border-gray-2 border-t" />
        <div className="flex justify-between py-2">
          <p className="text-body-2 text-white">Active users</p>
          <p className="text-body-2 text-white">48</p>
        </div> */}
      </div>
    </Box>
  )
}
