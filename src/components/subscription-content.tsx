'use client'

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
import { formatNumber } from '@/utils/intl-format'

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
