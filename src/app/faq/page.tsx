'use client'

import * as Accordion from '@radix-ui/react-accordion'
import { useTranslations } from 'next-intl'
import { LuMinus, LuPlus } from 'react-icons/lu'

const faqKeys = [
  'q1',
  'q2',
  'q3',
  'q4',
  'q5',
  'q6',
  'q7',
  'q8',
  'q9',
  'q10',
  'q11',
] as const

export default function FaqPage() {
  const t = useTranslations('faq')

  return (
    <header className="max-w-container-lg relative mx-auto overflow-hidden px-4 py-16">
      <div className="space-y-6 md:text-center">
        <h1 className="text-display-1 max-md:text-display-2 text-white">
          {t('heading')}
        </h1>
        <p className="text-body-1 text-gray-3">{t('subheading')}</p>
      </div>
      <Accordion.Root
        type="multiple"
        className="max-w-container-md mx-auto my-16"
      >
        {faqKeys.map((key, index) => (
          <Accordion.Item
            key={key}
            value={`item-${index}`}
            className="border-gray-2 border-b"
          >
            <Accordion.Header>
              <Accordion.Trigger className="text-body-1 group flex w-full cursor-pointer items-center justify-between py-4 text-left text-white">
                {t(`${key}Title`)}
                <LuPlus className="size-5 shrink-0 group-data-[state=open]:hidden" />
                <LuMinus className="size-5 shrink-0 group-data-[state=closed]:hidden" />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="text-body-2 text-gray-3 space-y-3 pb-4">
              {t(`${key}Content`)
                .split('\n')
                .map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </header>
  )
}
