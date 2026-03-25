'use client'

import type { UInt64 } from '@wharfkit/antelope'
import { useTranslations } from 'next-intl'

import { TableSkeleton } from '@/components/skeleton'
import { Box } from '@/components/ui/box'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useGetBillingDetail } from '@/hooks/query/use-get-billing-detail'
import { useCurrency } from '@/hooks/use-currency'
import { useIntlLocale } from '@/hooks/use-date-locale'
import { decodeActionKey } from '@/utils/decode-action-key'
import { formatNumber } from '@/utils/intl-format'

function ActionList({
  actions,
}: {
  actions: Array<{ key: string; value: UInt64 }>
}) {
  const tc = useTranslations('admin.common')
  if (actions.length === 0) return <span className="text-gray-3">{tc('none')}</span>

  return (
    <ul className="inline-block space-y-1 text-left">
      {actions.map((entry) => {
        const { contract, action } = decodeActionKey(entry.key)
        return (
          <li key={entry.key}>
            <span className="text-gray-2">{contract}</span>
            <span className="text-gray-3">::</span>
            <span>{action}</span>
            <span className="text-gray-3"> ({String(entry.value)})</span>
          </li>
        )
      })}
    </ul>
  )
}

export function SubscriptionContent() {
  const t = useTranslations('admin.subscription')
  const intlLocale = useIntlLocale()
  const { formatPriceFromString } = useCurrency()
  const billing = useGetBillingDetail()

  return (
    <div className="max-w-container-lg mx-auto min-h-[calc(100vh-24rem)] px-4 pb-8">
      <div className="space-y-8">
        <section className="space-y-2">
          {billing.isLoading && <TableSkeleton rows={1} />}
          {billing.isSuccess && (
            <>
              {billing.data?.rows.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">{t('billCycleId')}</TableHead>
                      <TableHead>{t('amountPaid')}</TableHead>
                      <TableHead className="text-center">
                        {t('membersPaidFor')}
                      </TableHead>
                      <TableHead className="text-center">
                        {t('allowedActions')}
                      </TableHead>
                      <TableHead className="text-center">
                        {t('usedActions')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billing.data?.rows.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="py-6">
                          {String(row.bill_cycle_id)}
                        </TableCell>
                        <TableCell className="py-6">
                          {formatPriceFromString(row.amount_paid)}
                        </TableCell>
                        <TableCell className="py-6 text-center">
                          {formatNumber(Number(row.members_paid_for), intlLocale)}
                        </TableCell>
                        <TableCell className="py-6 text-center">
                          <ActionList actions={row.allowed_actions} />
                        </TableCell>
                        <TableCell className="py-6 text-center">
                          <ActionList actions={row.used_actions} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Box className="flex w-full items-center justify-center text-center">
                  <p className="text-body-2 text-gray-3">
                    {t('noSubscriptions')}
                  </p>
                </Box>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
