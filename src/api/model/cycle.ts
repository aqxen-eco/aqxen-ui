import type { TimePointSec, UInt64 } from '@wharfkit/antelope'

import { GetTableRowsResult } from './index'

export type Cycle = {
  bill_cycle_id: UInt64
  start_time: TimePointSec
  end_time: TimePointSec
}

export type ListCycleResult = GetTableRowsResult<Cycle>
