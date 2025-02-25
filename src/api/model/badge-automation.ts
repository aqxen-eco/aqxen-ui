import { GetTableRowsResult, Session } from './index'

export type BadgeAutomation = {
  emission_symbol: string
  emitter_criteria: {
    key: string
    value: string
  }[]
  emit_assets: {
    contract: string
    emit_asset: string
  }[]
  status: string
  cyclic: boolean
}

export type ListBadgeAutomationResult = GetTableRowsResult<BadgeAutomation>

export type CreateBadgeAutomationProps = {
  session: Session
  emission_symbol: string
  emitter_criteria: string[]
  emit_badges: string[]
  cyclic: boolean
}

export type DisableBadgeAutomationProps = {
  session: Session
  emission_symbol: string
}

export type EnableBadgeAutomationProps = {
  session: Session
  emission_symbol: string
}
