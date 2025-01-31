import { GetTableRowsResult, Session } from './index'

export type Series = {
  id: number
  status: 'end' | 'active' | 'init'
  name: string
  init_time: string
  active_time: string
  end_time: string
}

export type ListSeriesResult = GetTableRowsResult<Series>

export type AddSeriesProps = {
  session: Session
  agg_symbol: string
  badge_symbols: string[]
  sequence_description: string
  start_right_away: boolean
}

export type AddBadgeToSeriesProps = {
  session: Session
  agg_symbol: string
  seq_ids: number[]
  badge_symbols: string[]
}

export type EndSeriesProps = {
  session: Session
  agg_symbol: string
  seq_ids: number[]
}

export type PauseSeriesProps = {
  session: Session
  agg_symbol: string
  seq_id: number
}

export type ResumeSeriesProps = {
  session: Session
  agg_symbol: string
  seq_id: string
}

export type StartSeriesProps = {
  session: Session
  agg_symbol: string
  seq_ids: number[]
}
