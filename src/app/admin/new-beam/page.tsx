'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import z from 'zod'

import { initBeam } from '@/api/chain/beams/init-beam'
import { Badge } from '@/components/ui/badge'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import { Checkbox, CheckboxWrapper } from '@/components/ui/checkbox'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { ErrorMessage, Field, Label } from '@/components/ui/field'
import { ImageUpload } from '@/components/ui/image-upload'
import { Input } from '@/components/ui/input'
import { InputSymbol } from '@/components/ui/input-symbol'
import { useChain } from '@/contexts/chain'
import { useOrganization } from '@/contexts/organization'
import { uploadFile } from '@/lib/upload-file'

const CYCLE_UNITS = [
  { labelKey: 'seconds' as const, value: 1 },
  { labelKey: 'minutes' as const, value: 60 },
  { labelKey: 'hours' as const, value: 3600 },
  { labelKey: 'days' as const, value: 86400 },
  { labelKey: 'years' as const, value: 31536000 },
]

const CYCLE_PRESETS = [
  { labelKey: 'day1' as const, seconds: 86400 },
  { labelKey: 'days7' as const, seconds: 604800 },
  { labelKey: 'days14' as const, seconds: 1209600 },
  { labelKey: 'days30' as const, seconds: 2592000 },
  { labelKey: 'days90' as const, seconds: 7776000 },
  { labelKey: 'days365' as const, seconds: 31536000 },
]

const newBeamSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  symbol: z.string().length(3, 'Symbol must be 3 characters'),
  image: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  starttime: z
    .string()
    .min(1, 'Start time is required')
    .refine((val) => new Date(val) > new Date(), {
      message: 'Start time must be in the future',
    }),
  cycleLength: z.coerce.number().min(1, 'Cycle length is required'),
  supplyPerCycle: z.coerce.number().min(1, 'Supply per cycle is required'),
  lifetimeAggregate: z.boolean(),
  lifetimeStats: z.boolean(),
})

type NewBeamSchema = z.infer<typeof newBeamSchema>

export default function NewBeamPage() {
  const t = useTranslations('admin.newBeam')
  const tc = useTranslations('admin.common')
  const {
    name: orgName,
    symbol: organizationSymbol,
  } = useOrganization()
  const router = useRouter()
  const { session } = useChain()

  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [cycleUnit, setCycleUnit] = useState(86400)
  const [cycleValue, setCycleValue] = useState<string>('')

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<NewBeamSchema>({
    resolver: zodResolver(newBeamSchema),
    defaultValues: {
      lifetimeAggregate: false,
      lifetimeStats: false,
    },
  })

  const name = watch('name')
  const symbol = watch('symbol')
  const image = watch('image')
  const cycleLength = watch('cycleLength')

  function selectPreset(seconds: number) {
    setValue('cycleLength', seconds, { shouldValidate: true })
    const bestUnit = [...CYCLE_UNITS]
      .reverse()
      .find((u) => seconds >= u.value && seconds % u.value === 0)
    if (bestUnit) {
      setCycleUnit(bestUnit.value)
      setCycleValue(String(seconds / bestUnit.value))
    } else {
      setCycleUnit(1)
      setCycleValue(String(seconds))
    }
  }

  function handleCycleValueChange(raw: string) {
    setCycleValue(raw)
    const num = Number(raw)
    if (num > 0) {
      setValue('cycleLength', num * cycleUnit, { shouldValidate: true })
    }
  }

  function handleCycleUnitChange(unitValue: number) {
    setCycleUnit(unitValue)
    const num = Number(cycleValue)
    if (num > 0) {
      setValue('cycleLength', num * unitValue, { shouldValidate: true })
    }
  }

  async function onSubmit({
    name,
    symbol,
    image,
    description,
    starttime,
    cycleLength,
    supplyPerCycle,
    lifetimeAggregate,
    lifetimeStats,
  }: NewBeamSchema) {
    if (!pendingFile && !image) {
      setError('image', { message: 'Image is required' })
      return
    }

    try {
      let imageHash = image ?? ''

      if (pendingFile) {
        setIsUploading(true)
        try {
          imageHash = await uploadFile(pendingFile, {
            groupName: `org-${orgName}-beams`,
            name: `org-${orgName}-beam-${name}`,
          })
        } finally {
          setIsUploading(false)
        }
      }

      await initBeam({
        session: session!,
        symbol: organizationSymbol + symbol,
        display_name: name,
        ipfs_image: imageHash,
        description,
        starttime: new Date(starttime).toISOString().replace('.000Z', ''),
        cycle_length: cycleLength,
        supply_per_cycle: supplyPerCycle,
        lifetime_aggregate: lifetimeAggregate,
        lifetime_stats: lifetimeStats,
        memo: description,
      })
      toast.success(t('createSuccess'))
      router.push('/admin/beams')
    } catch {
      toast.error(t('createFailed'))
    }
  }

  return (
    <Box className="p-0 max-md:space-y-8 max-md:rounded-none max-md:border-0 max-md:bg-black md:grid md:grid-cols-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 p-8 max-md:p-0 md:col-span-4"
      >
        <Field>
          <Label htmlFor="name">{tc('name')}</Label>
          <Input
            id="name"
            {...register('name')}
            aria-invalid={!!errors['name']}
          />
          <ErrorMessage>{errors['name']?.message}</ErrorMessage>
        </Field>
        <Controller
          name="symbol"
          control={control}
          render={({ field }) => (
            <Field>
              <Label htmlFor="symbol">{tc('symbol')}</Label>
              <InputSymbol
                id="symbol"
                aria-invalid={!!errors['symbol']}
                maxLength={3}
                {...field}
              />
              <ErrorMessage>{errors['symbol']?.message}</ErrorMessage>
            </Field>
          )}
        />
        <Field>
          <Label>{tc('image')}</Label>
          <ImageUpload
            variant="avatar"
            value={image}
            onFileSelect={(file) => {
              setPendingFile(file)
              setPreview(URL.createObjectURL(file))
            }}
            isUploading={isUploading}
          />
          <ErrorMessage>{errors['image']?.message}</ErrorMessage>
          <span className="text-body-3 text-gray-3 mt-1 block">
            {tc('recommendedSize')}
          </span>
        </Field>
        <Field>
          <Label htmlFor="description">{tc('description')}</Label>
          <Input
            id="description"
            {...register('description')}
            aria-invalid={!!errors['description']}
          />
          <ErrorMessage>{errors['description']?.message}</ErrorMessage>
        </Field>
        <Controller
          name="starttime"
          control={control}
          render={({ field }) => (
            <Field>
              <Label htmlFor="starttime">{t('startTime')}</Label>
              <DateTimePicker
                id="starttime"
                value={field.value}
                onChange={field.onChange}
                hasError={!!errors['starttime']}
              />
              <ErrorMessage>{errors['starttime']?.message}</ErrorMessage>
            </Field>
          )}
        />
        <Field>
          <Label>{t('cycleLength')}</Label>
          <div className="flex flex-wrap gap-2 pb-2">
            {CYCLE_PRESETS.map((preset) => (
              <button
                key={preset.seconds}
                type="button"
                onClick={() => selectPreset(preset.seconds)}
                className={`text-body-3 rounded-full border px-3 py-1 transition-colors ${
                  cycleLength === preset.seconds
                    ? 'border-white bg-white text-black'
                    : 'border-gray-3 text-gray-3 hover:border-white hover:text-white'
                }`}
              >
                {t(preset.labelKey)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              id="cycleValue"
              type="number"
              min={1}
              placeholder="1"
              value={cycleValue}
              onChange={(e) => handleCycleValueChange(e.target.value)}
              aria-invalid={!!errors['cycleLength']}
              className="flex-1"
            />
            <select
              value={cycleUnit}
              onChange={(e) => handleCycleUnitChange(Number(e.target.value))}
              className="border-gray-3 text-body-2 w-32 shrink-0 border-b bg-transparent pt-2 pb-[calc(1rem-1px)] text-white focus:border-white focus:outline-0"
            >
              {CYCLE_UNITS.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {t(unit.labelKey)}
                </option>
              ))}
            </select>
          </div>
          <input type="hidden" {...register('cycleLength')} />
          <ErrorMessage>{errors['cycleLength']?.message}</ErrorMessage>
        </Field>
        <Field>
          <Label htmlFor="supplyPerCycle">{t('supplyPerCycle')}</Label>
          <Input
            id="supplyPerCycle"
            type="number"
            placeholder="100"
            {...register('supplyPerCycle')}
            aria-invalid={!!errors['supplyPerCycle']}
          />
          <ErrorMessage>{errors['supplyPerCycle']?.message}</ErrorMessage>
        </Field>
        <Field>
          <CheckboxWrapper>
            <Label htmlFor="lifetimeAggregate" className="flex-1">
              {tc('lifetimeAggregate')}
            </Label>
            <Checkbox
              id="lifetimeAggregate"
              {...register('lifetimeAggregate')}
              aria-invalid={!!errors['lifetimeAggregate']}
            />
          </CheckboxWrapper>
          <ErrorMessage>{errors['lifetimeAggregate']?.message}</ErrorMessage>
        </Field>
        <Field>
          <CheckboxWrapper>
            <Label htmlFor="lifetimeStats" className="flex-1">
              {tc('lifetimeStats')}
            </Label>
            <Checkbox
              id="lifetimeStats"
              {...register('lifetimeStats')}
              aria-invalid={!!errors['lifetimeStats']}
            />
          </CheckboxWrapper>
          <ErrorMessage>{errors['lifetimeStats']?.message}</ErrorMessage>
        </Field>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting || isUploading}
        >
          {isSubmitting || isUploading ? tc('creating') : tc('create')}
        </Button>
      </form>
      <div className="border-gray-2 max-md:bg-gray-1 space-y-4 border-l p-8 max-md:rounded-2xl max-md:border max-md:p-4 md:col-span-2">
        <h2 className="text-title-2 text-white">{t('preview')}</h2>
        <Badge
          ipfs={preview ?? image}
          name={name ? name : tc('name')}
          balance={symbol ? symbol.toUpperCase() : 'BDG'}
        />
      </div>
    </Box>
  )
}
