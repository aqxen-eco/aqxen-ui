'use client'

import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'

import { listFees } from '@/api/chain/billing/list-fees'
import { listCycle } from '@/api/chain/cycle/list-cycle'
import { listMembers } from '@/api/chain/organization/list-members'
import type { Cycle } from '@/api/model/cycle'
import { BuySubscriptionTable } from '@/components/buy-subscription-table'
import { TableSkeleton } from '@/components/skeleton'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import { COINGECKO_ID, TOKEN_SYMBOL } from '@/constants'
import { useChain } from '@/contexts/chain'
import { useOrganization } from '@/contexts/organization'
import { useGetBillingDetail } from '@/hooks/query/use-get-billing-detail'
import { useCurrency } from '@/hooks/use-currency'
import { useIntlLocale } from '@/hooks/use-date-locale'
import { formatDecimal, formatNumber } from '@/utils/intl-format'

export default function PricingPage() {
  const { isAuthenticated, login } = useChain()
  const { hasOrganization } = useOrganization()
  const t = useTranslations('pricing')

  return (
    <section className="max-w-container-lg relative mx-auto px-4 py-16">
      <img
        src="./img/gradient.png"
        alt=""
        className="w-container-lg absolute top-0 left-0 -z-10 block select-none"
      />
      <header className="space-y-4 text-center max-md:pb-16 md:py-16">
        <h2 className="text-display-2 text-white">
          {hasOrganization
            ? t('manageSubscription')
            : isAuthenticated
              ? t('createYourOrganization')
              : t('pricing')}
        </h2>
        <p className="text-body-1 text-gray-3">
          {hasOrganization
            ? t('manageDescription')
            : isAuthenticated
              ? t('createDescription')
              : t('defaultDescription')}
        </p>
        {!isAuthenticated && (
          <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={login} variant="primary" size="lg">
              {t('logInToCreateOrg')}
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a
                href="https://vaulta.gitbook.io/vaulta-guides/user-guides/getting-started-on-vaulta/wallet-and-account-setup"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('createVaultaAccount')}
              </a>
            </Button>
          </div>
        )}
      </header>
      {hasOrganization && (
        <CurrentUsage
          renderTable={(props) => <BuySubscriptionTable {...props} />}
        />
      )}
      {!hasOrganization && <BuySubscriptionTable />}
    </section>
  )
}

function CurrentUsage({
  renderTable,
}: {
  renderTable: (props: {
    paidForCurrentCycle: boolean
    existingSeats: number
    activeMembers: number
  }) => React.ReactNode
}) {
  const { actor } = useChain()
  const billing = useGetBillingDetail()
  const t = useTranslations('pricing')
  const intlLocale = useIntlLocale()
  const { formatPrice } = useCurrency()

  const membersQuery = useQuery({
    queryKey: ['members', actor],
    queryFn: async () => await listMembers({ scope: actor! }),
    enabled: !!actor,
  })

  const cyclesQuery = useQuery({
    queryKey: ['bill-cycles'],
    queryFn: async () => await listCycle({}),
  })

  const feesQuery = useQuery({
    queryKey: ['fees'],
    queryFn: async () => await listFees(),
  })

  const tokenPriceQuery = useQuery({
    queryKey: ['token-price'],
    queryFn: async () => {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${COINGECKO_ID}&vs_currencies=usd`,
      )
      const data = await res.json()
      return data[COINGECKO_ID].usd as number
    },
    staleTime: 60_000,
  })

  if (
    billing.isLoading ||
    membersQuery.isLoading ||
    feesQuery.isLoading ||
    tokenPriceQuery.isLoading ||
    cyclesQuery.isLoading
  ) {
    return <TableSkeleton rows={1} columns={3} />
  }

  const latest = billing.data?.rows.at(-1)
  if (!latest) return null

  const nowMs = Date.now()
  const currentCycle = (cyclesQuery.data?.rows as Cycle[] | undefined)?.find(
    (cycle) => {
      const start = new Date(`${cycle.start_time}Z`).getTime()
      const end = new Date(`${cycle.end_time}Z`).getTime()
      return nowMs >= start && nowMs <= end
    },
  )

  const paidForCurrentCycle = currentCycle
    ? billing.data?.rows.some(
        (row) =>
          String(row.bill_cycle_id) ===
          String(currentCycle.bill_cycle_id),
      )
    : false

  const nextPaymentDate = currentCycle
    ? new Date(`${currentCycle.end_time}Z`)
    : null

  const totalSeats = Number(latest.members_paid_for)
  const activeMembers = membersQuery.data?.rows.length ?? 0
  const allSeatsUsed = activeMembers >= totalSeats

  const fee = feesQuery.data?.rows[0]
  const perSeatUsd = fee
    ? parseFloat(fee.member_fee.replace(/[^0-9.]/g, ''))
    : 0
  const monthlyCostUsd = perSeatUsd * totalSeats

  const monthlyCostToken =
    tokenPriceQuery.data && monthlyCostUsd > 0
      ? `${formatDecimal(monthlyCostUsd / tokenPriceQuery.data, 4, intlLocale)} ${TOKEN_SYMBOL}`
      : null

  return (
    <div className="mb-8 space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Box className="space-y-1 text-center">
          <p className="text-body-2 text-gray-3">{t('memberSeats')}</p>
          <p className="text-display-3 text-white">{formatNumber(totalSeats, intlLocale)}</p>
        </Box>
        <Box className="space-y-1 text-center">
          <p className="text-body-2 text-gray-3">{t('activeMembers')}</p>
          <p className="text-display-3 text-white">{formatNumber(activeMembers, intlLocale)}</p>
        </Box>
        <Box className="space-y-1 text-center">
          <p className="text-body-2 text-gray-3">{t('monthlyCost')}</p>
          <p className="text-display-3 text-white">
            {formatPrice(monthlyCostUsd)}
          </p>
          {monthlyCostToken && (
            <p className="text-body-2 text-gray-3">({monthlyCostToken})</p>
          )}
        </Box>
        <Box className="space-y-1 text-center">
          <p className="text-body-2 text-gray-3">{t('nextPaymentDue')}</p>
          <p className="text-display-3 text-white">
            {nextPaymentDate
              ? nextPaymentDate.toLocaleDateString(intlLocale, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '—'}
          </p>
        </Box>
      </div>
      {!paidForCurrentCycle && (
        <Box className="border-red-500/30 bg-red-500/10 text-center">
          <p className="text-body-2 text-red-400">
            {t('unpaidCycleWarning')}
          </p>
        </Box>
      )}
      {allSeatsUsed && paidForCurrentCycle && (
        <Box className="border-yellow-500/30 bg-yellow-500/10 text-center">
          <p className="text-body-2 text-yellow-400">
            {t('allSeatsUsedWarning')}
          </p>
        </Box>
      )}
      {renderTable({ paidForCurrentCycle: !!paidForCurrentCycle, existingSeats: totalSeats, activeMembers })}
    </div>
  )
}
