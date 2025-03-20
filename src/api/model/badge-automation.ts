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
  status: 'init' | 'activate' | 'deactivate'
  cyclic: boolean
  offchain_lookup_data: {
    user: {
      ipfs_description: string
    }
  }
  onchain_lookup_data: {
    system: {
      created_at: number
    }
    user: {
      name: string
    }
  }
}

export type ListBadgeAutomationResult = GetTableRowsResult<BadgeAutomation>

export type CreateBadgeAutomationProps = {
  session: Session
  emission_symbol: string
  display_name: string
  ipfs_description: string
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
