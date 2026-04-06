'use client'

import { useState } from 'react'

import { Avatar, randomVariant } from '@/components/ui/avatar'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import { Checkbox, CheckboxWrapper } from '@/components/ui/checkbox'
import { Field, Label } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Tag } from '@/components/ui/tag'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip } from '@/components/ui/tooltip'

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-6">
      <h2 className="text-title-1 border-gray-2 border-b pb-4 font-medium text-white">
        {title}
      </h2>
      {children}
    </section>
  )
}

function SubSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-title-2 text-gray-3 font-medium">{title}</h3>
      {children}
    </div>
  )
}

function ColorSwatch({
  name,
  hex,
  className,
}: {
  name: string
  hex: string
  className: string
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`${className} size-16 rounded-xl border border-white/10`}
      />
      <span className="text-body-3 font-medium text-white">{name}</span>
      <span className="text-body-3 text-gray-3">{hex}</span>
    </div>
  )
}

export default function StyleGuidePage() {
  const [inputValue, setInputValue] = useState('')
  const [checked, setChecked] = useState(false)

  return (
    <div className="max-w-container-lg mx-auto space-y-16 px-4 py-16">
      {/* Header */}
      <header className="space-y-4 text-center">
        <h1 className="text-display-1 max-md:text-display-2 font-medium text-white">
          Style Guide
        </h1>
        <p className="text-body-1 text-gray-3">
          Visual reference for the Upscale UI design system
        </p>
        <div
          className="mx-auto h-1 w-32 rounded-full"
          style={{
            background:
              'linear-gradient(90deg, #a36ab7 0%, #d17650 25%, #8ca3da 50%, #b6c190 75%, #e6c97e 100%)',
          }}
        />
      </header>

      {/* Colors */}
      <Section title="Colors">
        <SubSection title="Grays">
          <div className="flex flex-wrap gap-6">
            <ColorSwatch name="Black" hex="#000000" className="bg-black" />
            <ColorSwatch name="Gray 1" hex="#111111" className="bg-gray-1" />
            <ColorSwatch name="Gray 2" hex="#333333" className="bg-gray-2" />
            <ColorSwatch name="Gray 3" hex="#b6b4b4" className="bg-gray-3" />
            <ColorSwatch name="White" hex="#ffffff" className="bg-white" />
          </div>
        </SubSection>

        <SubSection title="Badge Colors">
          <div className="flex flex-wrap gap-6">
            <ColorSwatch
              name="Red"
              hex="#d17650"
              className="bg-badge-red"
            />
            <ColorSwatch
              name="Yellow"
              hex="#e6c97e"
              className="bg-badge-yellow"
            />
            <ColorSwatch
              name="Green"
              hex="#b6c190"
              className="bg-badge-green"
            />
            <ColorSwatch
              name="Blue"
              hex="#8ca3da"
              className="bg-badge-blue"
            />
            <ColorSwatch
              name="Purple"
              hex="#a36ab7"
              className="bg-badge-purple"
            />
          </div>
        </SubSection>

        <SubSection title="Gradient">
          <div
            className="h-12 w-full rounded-xl"
            style={{
              background:
                'linear-gradient(90deg, #a36ab7 0%, #d17650 25%, #8ca3da 50%, #b6c190 75%, #e6c97e 100%)',
            }}
          />
          <p className="text-body-3 text-gray-3">
            90deg, #a36ab7 0%, #d17650 25%, #8ca3da 50%, #b6c190 75%, #e6c97e
            100%
          </p>
        </SubSection>
      </Section>

      {/* Typography */}
      <Section title="Typography">
        <div className="space-y-6">
          <div className="border-gray-2 flex items-baseline justify-between border-b pb-4">
            <span className="text-display-1 max-md:text-display-2 text-white">
              Display 1
            </span>
            <span className="text-body-3 text-gray-3 text-nowrap pl-4">
              4rem / 64px
            </span>
          </div>
          <div className="border-gray-2 flex items-baseline justify-between border-b pb-4">
            <span className="text-display-2 text-white">Display 2</span>
            <span className="text-body-3 text-gray-3 text-nowrap pl-4">
              2.5rem / 40px
            </span>
          </div>
          <div className="border-gray-2 flex items-baseline justify-between border-b pb-4">
            <span className="text-title-1 text-white">Title 1</span>
            <span className="text-body-3 text-gray-3 text-nowrap pl-4">
              1.75rem / 28px
            </span>
          </div>
          <div className="border-gray-2 flex items-baseline justify-between border-b pb-4">
            <span className="text-title-2 text-white">Title 2</span>
            <span className="text-body-3 text-gray-3 text-nowrap pl-4">
              1.25rem / 20px
            </span>
          </div>
          <div className="border-gray-2 flex items-baseline justify-between border-b pb-4">
            <span className="text-body-1 text-white">Body 1</span>
            <span className="text-body-3 text-gray-3 text-nowrap pl-4">
              1.125rem / 18px
            </span>
          </div>
          <div className="border-gray-2 flex items-baseline justify-between border-b pb-4">
            <span className="text-body-2 text-white">Body 2</span>
            <span className="text-body-3 text-gray-3 text-nowrap pl-4">
              1rem / 16px
            </span>
          </div>
          <div className="border-gray-2 flex items-baseline justify-between border-b pb-4">
            <span className="text-body-3 text-white">Body 3</span>
            <span className="text-body-3 text-gray-3 text-nowrap pl-4">
              0.875rem / 14px
            </span>
          </div>
        </div>

        <SubSection title="Font Weights">
          <div className="flex gap-8">
            <span className="text-body-1 font-normal text-white">
              Regular (400)
            </span>
            <span className="text-body-1 font-medium text-white">
              Medium (500)
            </span>
          </div>
        </SubSection>

        <SubSection title="Font Family">
          <p className="text-body-2 text-gray-3">
            DM Sans — <span className="text-white">sans-serif</span>
          </p>
        </SubSection>
      </Section>

      {/* Buttons */}
      <Section title="Buttons">
        <SubSection title="Variants">
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" size="md">
              Primary
            </Button>
            <Button variant="secondary" size="md">
              Secondary
            </Button>
            <Button variant="link" size="md">
              Link
            </Button>
            <Button variant="default" size="md">
              Default
            </Button>
          </div>
        </SubSection>

        <SubSection title="Sizes">
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" size="md">
              Medium
            </Button>
            <Button variant="primary" size="lg">
              Large
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <Button variant="secondary" size="md">
              Medium
            </Button>
            <Button variant="secondary" size="lg">
              Large
            </Button>
          </div>
        </SubSection>

        <SubSection title="States">
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" size="md">
              Default
            </Button>
            <Button variant="primary" size="md" disabled>
              Disabled
            </Button>
          </div>
        </SubSection>
      </Section>

      {/* Avatars */}
      <Section title="Avatars">
        <SubSection title="Sizes">
          <div className="flex flex-wrap items-end gap-6">
            <div className="flex flex-col items-center gap-2">
              <Avatar size="xs" color="blue">
                XS
              </Avatar>
              <span className="text-body-3 text-gray-3">xs (24px)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar size="sm" color="blue">
                SM
              </Avatar>
              <span className="text-body-3 text-gray-3">sm (40px)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar size="md" color="blue">
                MD
              </Avatar>
              <span className="text-body-3 text-gray-3">md (48px)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar size="lg" color="blue">
                LG
              </Avatar>
              <span className="text-body-3 text-gray-3">lg (96px)</span>
            </div>
          </div>
        </SubSection>

        <SubSection title="Colors">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar size="md" color="red">
              RE
            </Avatar>
            <Avatar size="md" color="yellow">
              YE
            </Avatar>
            <Avatar size="md" color="green">
              GR
            </Avatar>
            <Avatar size="md" color="blue">
              BL
            </Avatar>
            <Avatar size="md" color="purple">
              PU
            </Avatar>
            <Avatar size="md" color={randomVariant()}>
              RN
            </Avatar>
            <span className="text-body-3 text-gray-3">
              + randomVariant()
            </span>
          </div>
        </SubSection>
      </Section>

      {/* Tags */}
      <Section title="Tags">
        <div className="flex flex-wrap items-center gap-3">
          <Tag variant="default">Default</Tag>
          <Tag variant="red">Red</Tag>
          <Tag variant="yellow">Yellow</Tag>
          <Tag variant="green">Green</Tag>
          <Tag variant="blue">Blue</Tag>
          <Tag variant="purple">Purple</Tag>
        </div>
      </Section>

      {/* Box */}
      <Section title="Box">
        <div className="grid gap-6 md:grid-cols-2">
          <Box>
            <h3 className="text-title-2 font-medium text-white">
              Default Box
            </h3>
            <p className="text-body-2 text-gray-3 mt-2">
              rounded-2xl, border-gray-2, bg-gray-1, p-8
            </p>
          </Box>
          <Box className="flex flex-col items-center gap-4 text-center">
            <Avatar size="lg" color="purple">
              AB
            </Avatar>
            <div>
              <h3 className="text-title-2 font-medium text-white">
                Card Example
              </h3>
              <p className="text-body-3 text-gray-3">
                Centered content layout
              </p>
            </div>
            <Button variant="primary" size="md">
              Action
            </Button>
          </Box>
        </div>
      </Section>

      {/* Form Elements */}
      <Section title="Form Elements">
        <div className="grid gap-8 md:grid-cols-2">
          <Box>
            <div className="space-y-6">
              <Field>
                <Label>Text Input</Label>
                <Input
                  placeholder="Enter text..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </Field>

              <Field>
                <Label>Disabled Input</Label>
                <Input placeholder="Disabled" disabled />
              </Field>

              <Field>
                <Label>Textarea</Label>
                <Textarea placeholder="Write something..." />
              </Field>
            </div>
          </Box>

          <Box>
            <div className="space-y-6">
              <Field>
                <Label>Checkbox</Label>
                <CheckboxWrapper>
                  <span className="text-body-2 text-gray-3">
                    Accept terms
                  </span>
                  <Checkbox
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                  />
                </CheckboxWrapper>
              </Field>

              <div>
                <Label>Error State</Label>
                <div data-error="true" className="group/input">
                  <Input placeholder="Invalid input" />
                </div>
                <span className="text-body-3 mt-2 block text-red-600">
                  This field is required
                </span>
              </div>
            </div>
          </Box>
        </div>
      </Section>

      {/* Tooltips */}
      <Section title="Tooltips">
        <div className="flex gap-4">
          <Tooltip content="This is a tooltip with helpful information">
            <Button variant="secondary" size="md">
              Hover me
            </Button>
          </Tooltip>
        </div>
      </Section>

      {/* Spacing */}
      <Section title="Spacing & Containers">
        <SubSection title="Container Widths">
          <div className="space-y-4">
            <div>
              <p className="text-body-3 text-gray-3 mb-2">
                container-lg: 80rem (1280px)
              </p>
              <div className="bg-gray-2 h-3 w-full rounded-full" />
            </div>
            <div>
              <p className="text-body-3 text-gray-3 mb-2">
                container-md: 53.375rem (853px)
              </p>
              <div
                className="bg-badge-blue h-3 rounded-full"
                style={{ width: '66.7%' }}
              />
            </div>
          </div>
        </SubSection>

        <SubSection title="Common Spacing">
          <div className="flex flex-wrap items-end gap-4">
            {[1, 2, 3, 4, 6, 8, 12, 16].map((n) => (
              <div key={n} className="flex flex-col items-center gap-1">
                <div
                  className="bg-badge-purple rounded"
                  style={{
                    width: `${n * 4}px`,
                    height: `${n * 4}px`,
                  }}
                />
                <span className="text-body-3 text-gray-3">{n}</span>
                <span className="text-body-3 text-gray-3">{n * 4}px</span>
              </div>
            ))}
          </div>
        </SubSection>
      </Section>

      {/* Border Radius */}
      <Section title="Border Radius">
        <div className="flex flex-wrap items-center gap-6">
          {[
            { name: 'rounded-full', className: 'rounded-full' },
            { name: 'rounded-2xl', className: 'rounded-2xl' },
            { name: 'rounded-xl', className: 'rounded-xl' },
            { name: 'rounded-lg', className: 'rounded-lg' },
            { name: 'rounded-md', className: 'rounded-md' },
          ].map(({ name, className }) => (
            <div key={name} className="flex flex-col items-center gap-2">
              <div
                className={`bg-gray-2 border-gray-3 size-16 border ${className}`}
              />
              <span className="text-body-3 text-gray-3">{name}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Z-Index Layers */}
      <Section title="Z-Index Layers">
        <div className="relative h-64">
          {[
            {
              z: 'z-10',
              label: 'z-10 — Overlays',
              color: 'bg-badge-red/80',
              offset: 0,
            },
            {
              z: 'z-20',
              label: 'z-30 — App bar',
              color: 'bg-badge-yellow/80',
              offset: 40,
            },
            {
              z: 'z-30',
              label: 'z-40 — Dropdowns',
              color: 'bg-badge-green/80',
              offset: 80,
            },
            {
              z: 'z-40',
              label: 'z-50 — Modals',
              color: 'bg-badge-blue/80',
              offset: 120,
            },
            {
              z: 'z-50',
              label: 'z-60 — Dialog overlays',
              color: 'bg-badge-purple/80',
              offset: 160,
            },
          ].map(({ z, label, color, offset }) => (
            <div
              key={z}
              className={`${z} ${color} absolute left-0 flex h-12 items-center rounded-xl px-4`}
              style={{
                top: `${offset}px`,
                width: `${100 - offset / 4}%`,
              }}
            >
              <span className="text-body-3 font-medium text-black">
                {label}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* Interaction States */}
      <Section title="Interaction States">
        <div className="grid gap-6 md:grid-cols-3">
          <Box className="space-y-3 text-center">
            <p className="text-body-3 text-gray-3 font-medium uppercase">
              Hover
            </p>
            <div className="bg-gray-2 mx-auto w-fit rounded-full px-6 py-3 text-white transition-colors hover:bg-white hover:text-black">
              Hover me
            </div>
            <p className="text-body-3 text-gray-3">
              hover:bg-gray-2 or hover:bg-white
            </p>
          </Box>
          <Box className="space-y-3 text-center">
            <p className="text-body-3 text-gray-3 font-medium uppercase">
              Focus
            </p>
            <input
              className="border-gray-3 text-body-2 w-full border-b bg-transparent pb-2 text-white focus:border-white focus:outline-0"
              placeholder="Focus me"
            />
            <p className="text-body-3 text-gray-3">
              focus:border-white focus:outline-0
            </p>
          </Box>
          <Box className="space-y-3 text-center">
            <p className="text-body-3 text-gray-3 font-medium uppercase">
              Disabled
            </p>
            <Button variant="primary" size="md" disabled>
              Disabled
            </Button>
            <p className="text-body-3 text-gray-3">
              opacity-50, cursor-not-allowed
            </p>
          </Box>
        </div>
      </Section>

      {/* Animation */}
      <Section title="Animation">
        <Box>
          <div className="space-y-2">
            <p className="text-body-2 text-white">
              Motion library (Framer Motion) for enter/exit animations
            </p>
            <pre className="text-body-3 bg-gray-2 overflow-x-auto rounded-lg p-4 text-white">
              {`initial={{ opacity: 0, y: 16 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: 16 }}`}
            </pre>
            <p className="text-body-3 text-gray-3 mt-2">
              CSS transitions use duration-150 for hover/focus states
            </p>
          </div>
        </Box>
      </Section>

      {/* Design Principles */}
      <Section title="Design Principles">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'Dark Theme',
              desc: 'bg-black body with gray-1 surfaces. White primary text, gray-3 secondary.',
            },
            {
              title: 'Underline Inputs',
              desc: 'Border-bottom only for all text inputs. No box outlines.',
            },
            {
              title: 'Pill Shapes',
              desc: 'rounded-full for all interactive elements — buttons, tags, chips.',
            },
            {
              title: '5-Color System',
              desc: 'Badge colors (red, yellow, green, blue, purple) for categorization.',
            },
            {
              title: 'Radix Primitives',
              desc: 'Accessible by default. Select, Dropdown, Tooltip, Dialog all use Radix.',
            },
            {
              title: 'tailwind-variants',
              desc: 'All component variants defined declaratively with tv() function.',
            },
          ].map(({ title, desc }) => (
            <Box key={title}>
              <h3 className="text-title-2 font-medium text-white">{title}</h3>
              <p className="text-body-3 text-gray-3 mt-2">{desc}</p>
            </Box>
          ))}
        </div>
      </Section>
    </div>
  )
}
