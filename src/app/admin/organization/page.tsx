'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'

import { Badge } from '@/components/ui/badge'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import { ErrorMessage, Field, Label } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useOrganization } from '@/contexts/organization'

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
    <Box className="p-0 max-md:space-y-8 max-md:rounded-none max-md:border-0 max-md:bg-black md:grid md:grid-cols-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 p-8 max-md:p-0 md:col-span-4"
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
      <div className="border-gray-2 max-md:bg-gray-1 space-y-4 border-l p-8 max-md:rounded-2xl max-md:border max-md:p-4 md:col-span-2">
        <h2 className="text-title-2 text-white">Organization preview</h2>
        <Badge name={name} balance={symbol.toUpperCase()} />
        <hr className="border-gray-2 border-t" />
        <div className="flex justify-between py-2">
          <p className="text-body-2 text-white">Active users</p>
          <p className="text-body-2 text-white">48</p>
        </div>
      </div>
    </Box>
  )
}
