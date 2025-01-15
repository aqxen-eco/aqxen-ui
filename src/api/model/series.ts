import { GetTableRowsResult } from './index'

export type Series = {
  id: number
  status: 'end' | 'active' | 'init'
  name: string
  init_time: string
  active_time: string
  end_time: string
}

export type ListSeriesResult = GetTableRowsResult<Series>
