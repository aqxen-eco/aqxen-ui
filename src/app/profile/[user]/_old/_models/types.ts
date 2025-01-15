import type {
  Checksum160,
  Checksum256,
  Float64,
  Name,
  UInt64,
  UInt128,
} from '@wharfkit/antelope'

export type IndexPosition =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'fourth'
  | 'fifth'
  | 'sixth'
  | 'seventh'
  | 'eighth'
  | 'ninth'
  | 'tenth'
  | undefined

export type TableIndexType =
  | Name
  | UInt64
  | UInt128
  | Float64
  | Checksum256
  | Checksum160
