import { Checksum160, Checksum256, Float64, Name, UInt64, UInt128 } from '@wharfkit/antelope';
import { Session as WharfKitSession } from '@wharfkit/session';

export type Session = WharfKitSession

export type TableIndexType = Name | UInt64 | UInt128 | Float64 | Checksum256 | Checksum160;

export type GetTableRowsResult<T, K = TableIndexType> = {
  rows: T[];
  more: boolean;
  next_key?: K;
}