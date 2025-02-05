'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'

import { Badge } from '@/components/ui/badge'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useOrganization } from '@/contexts/organization'
import { ErrorMessage, Field, Label } from '@/components/ui/field'

const organizationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  logo: z.string().min(1, 'Logo is required'),
})

type OrganizationSchema = z.infer<typeof organizationSchema>

export default function OrganizationPage() {
  const { name, symbol } = useOrganization()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isLoading },
  } = useForm<OrganizationSchema>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name,
    },
  })

  async function onSubmit({ name, logo }: OrganizationSchema) {
    console.log(name, logo)
  }

  useEffect(() => {
    if (name) {
      setValue('name', name)
    }
  }, [name, setValue])

  return (
    <Box className="p-0 mobile:space-y-8 mobile:rounded-none mobile:border-0 mobile:bg-black desktop:grid desktop:grid-cols-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 p-8 mobile:p-0 desktop:col-span-4"
      >
        <Field>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            {...register('name')}
            aria-invalid={!!errors['name']}
            disabled={isLoading}
          />
          <ErrorMessage>{errors['name']?.message}</ErrorMessage>
        </Field>
        <Field>
          <Label htmlFor="logo">Logo IPFS Image hash</Label>
          <Input
            id="logo"
            {...register('logo')}
            aria-invalid={!!errors['logo']}
            disabled={isLoading}
          />
          <ErrorMessage>{errors['logo']?.message}</ErrorMessage>
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
      <div className="space-y-4 border-l border-gray-2 p-8 mobile:rounded-2xl mobile:border mobile:bg-gray-1 mobile:p-4 desktop:col-span-2">
        <h2 className="text-title-2 text-white">Organization preview</h2>
        <Badge name={name} balance={symbol.toUpperCase()} />
        <hr className="border-t border-gray-2" />
        <div className="flex justify-between py-2">
          <p className="text-body-2 text-white">Active users</p>
          <p className="text-body-2 text-white">48</p>
        </div>
      </div>
    </Box>
  )
}
