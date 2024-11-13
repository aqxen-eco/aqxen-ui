import type { UInt64, UInt128 } from "@wharfkit/antelope";

export interface OrgAggregateType {
  agg_symbol: string;
  agg_description: string;
  last_init_seq_id: number;
  init_seq_ids: number[];
  active_seq_ids: number[];
  end_seq_ids: number[];
  init_badge_symbols: string[];
  agg_sequences: OrgSequenceType[] | null;
}

export interface OrgAggregateResponse {
  rows: OrgAggregateType[] | null;
  next_key: string | null;
  more: boolean;
}

export interface OrgSequenceType {
  seq_id: number;
  seq_status: string;
  sequence_description: string;
  init_time: string;
  active_time: string;
  end_time: string;
}

export interface OrgSequenceResponse {
  rows: OrgSequenceType[] | null;
  next_key: string | null;
  more: boolean;
}

export interface OrgBadgeStatusType {
  badge_agg_seq_id: number;
  agg_symbol: string;
  seq_id: number;
  badge_symbol: string;
  badge_status: string;
  seq_status: string;
}

export interface OrgBadgeStatusResponse {
  rows: OrgBadgeStatusType[] | null;
  next_key: string | null;
  more: boolean;
}

export interface AchievementType {
  badge_agg_seq_id: number;
  count: number;
}

export interface AchievementResponse {
  rows: AchievementType[] | null;
  next_key: string | null;
  more: boolean;
}

//

export type Bound = UInt64 | UInt128;

export enum SeasonFilterType {
  DEFAULT = "DEFAULT",
}

export interface OrgSeasonType {
  badge_symbol: string;
  notify_accounts: string[];
  offchain_lookup_data: string;
  onchain_lookup_data: string;
  rarity_counts: number;
}

export interface SeasonType {
  balance: string;
}

export interface OrgSeasonResponse {
  rows: OrgSeasonType[] | null;
  next_key: string | null;
  more: boolean;
}

export interface SeasonResponse {
  rows: SeasonType[] | null;
  next_key: string | null;
  more: boolean;
}

export interface SeasonsFilter {
  scope?: string;
  queryType?: SeasonFilterType;
  lowerBound?: number | string | Bound;
  upperBound?: number | string | Bound;
  returnFirstIteration?: boolean;
}
