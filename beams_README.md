# Beams & Beams Manager Contracts

Beams is a cycle-based badge distribution system. Org members claim a configurable allowance of badges each cycle and give them to others, optionally attaching short posts. Supply per cycle can scale dynamically with org member count via configurable tiers. Orgs can enable beams with a single action that creates all admin-defined badge templates.

## Architecture

| Contract | Account (Jungle4) | Role |
|---|---|---|
| **beams** | `beamsdevdevd` | Core logic: cycle tracking, claim accounting, badge issuance, posts |
| **beamsmanager** | `beamsmanager` | User-facing entry point: auth checks, delegation, feature wiring |

Users interact with **beamsmanager**. It validates authorization, then dispatches to **beams**, which in turn calls **badgedata** for on-chain badge state.

## Key Concepts

- **Cycle** - A repeating time window (defined by `starttime` + `cycle_length` in seconds). Each cycle resets every member's claimable supply.
- **Supply per cycle** - The number of badge units a member can claim each cycle. Can be a fixed value or determined dynamically by supply tier config.
- **Supply tiers** - Optional per-badge config that maps org member count ranges to supply values. At claim time, the contract looks up `get_total_active_members(org)` and uses `lower_bound` to find the matching tier. Falls back to the badge's default `supply_per_cycle` if no tiers are configured.
- **Badge templates** - Admin-defined templates (badge suffix, cycle length, default supply, display name, image, description) that are instantiated for an org when it calls `enablebeams`.
- **Claim** - A member calls `claimbeam` once per cycle to receive their allowance.
- **Give** - A member spends from their claimed balance to issue badges to others via `givebeam`.

## Actions

### beamsmanager (user-facing)

| Action | Auth | Description |
|---|---|---|
| `initbeam` | org or delegated | Create a new beam badge with cycle config. Optionally enables lifetime aggregate and stats tracking. |
| `claimbeam` | claimer | Claim the per-cycle badge allowance. |
| `givebeam` | from | Issue badges from claimed balance to another member, with a post. |
| `postbeam` | from | Create a standalone post (no badge transfer). |
| `updpostbeam` | from | Update an existing post. |
| `delpostbeam` | from | Delete a post. |
| `setstarttime` | org or delegated | Change the start time (only if it hasn't passed yet). |
| `setcyclelen` | org or delegated | Change the cycle length. |
| `setcyclesup` | org or delegated | Change the supply per cycle. |
| `setsuppcfg` | org or delegated | Set a supply tier: map a member count upper bound to a supply value for a badge. |
| `delsuppcfg` | org or delegated | Delete a supply tier for a badge. |
| `setimage` | org or delegated | Update the ipfs_image for a badge (via `badgedata::offckeyvalue`). |
| `addtempl` | contract self | Add a badge template (admin only). |
| `deltempl` | contract self | Delete a badge template (admin only). |
| `enablebeams` | org | Create all template badges for the org with a given start time. |
| `addbadgeauth` | org | Delegate a specific action on a specific badge to an account. |
| `delbadgeauth` | org | Remove badge-level delegation. |
| `addactionauth` | org | Delegate a specific action (all badges) to an account. |
| `delactionauth` | org | Remove action-level delegation. |

### beams (internal)

| Action | Description |
|---|---|
| `create` | Store badge metadata and call `badgedata::initbadge`. |
| `claim` | Record a claim for the current cycle. |
| `issue` | Deduct from claimed balance, call `badgedata::achievement`, and log. |
| `post` | Emit a `logpost` inline action (no on-chain storage). |
| `updatepost` | Signal a post update (no on-chain storage). |
| `deletepost` | Signal a post deletion (no on-chain storage). |
| `starttime` | Update the start time for a badge. |
| `cyclelength` | Update the cycle length. |
| `cyclesupply` | Update the supply per cycle. |
| `setsuppcfg` | Upsert a row in the supply tier config table for a badge. |
| `delsuppcfg` | Erase a supply tier row. |
| `logpost` | Logged inline for off-chain indexing. |
| `logissuance` | Logged inline for off-chain indexing. |

## Example Flow

```
1. Admin defines badge templates:
   beamsmanager::addtempl (requires contract auth)

2. Org enables beams (creates all template badges at once):
   beamsmanager::enablebeams → for each template:
     beams::create → badgedata::initbadge
     badgedata::addfeature (subscription)

3. Org creates a custom beam (alternative to enablebeams):
   beamsmanager::initbeam → beams::create → badgedata::initbadge

4. Org configures supply tiers for a badge:
   beamsmanager::setsuppcfg → beams::setsuppcfg

5. Member claims their cycle allowance:
   beamsmanager::claimbeam → beams::claim
   (claim checks supply tiers first, falls back to default supply)

6. Member gives badges to another member:
   beamsmanager::givebeam → beams::issue → badgedata::achievement
                                         → beams::logissuance

7. Org updates a badge image:
   beamsmanager::setimage → badgedata::offckeyvalue
```

## Tables

### beams

| Table | Scope | Key | Description |
|---|---|---|---|
| `metadata` | org | badge_symbol | Cycle config per badge (starttime, cycle_length, supply_per_cycle, last known cycle bounds) |
| `stats` | claimer | badge_symbol | Remaining claimed balance and last claim time per member |
| `config` | self | 0 | Global auto-incrementing post ID counter |
| `supplycfg` | badge_symbol.code().raw() | member_count | Supply tier: maps member count upper bound to a supply value |

### beamsmanager

| Table | Scope | Key | Description |
|---|---|---|---|
| `beamtempl` | self | id | Admin-defined badge templates used by `enablebeams` |
| `actionauths` | org | action | Accounts authorized for an action across all badges |
| `badgeauths` | org | id (secondary: action+badge) | Accounts authorized for a specific action on a specific badge |

## Supply Tiers

Supply tiers allow the per-cycle badge supply to scale with org size. Each tier row has:
- `member_count` (primary key) - upper bound of the member range
- `supply` - the supply value for orgs at or below this member count

At claim time, the contract calls `get_total_active_members(org)` and uses `lower_bound(member_count)` to find the first tier whose `member_count >= actual_member_count`. If the org exceeds all configured tiers, the highest tier's supply is used. The default `supply_per_cycle` is only used when no tiers are configured at all.

**Example tiers for a badge:**

| member_count | supply |
|---|---|
| 10 | 3 |
| 50 | 5 |
| 200 | 10 |

- Org with 7 members → tier 10 → supply = 3
- Org with 50 members → tier 50 → supply = 5
- Org with 100 members → tier 200 → supply = 10
- Org with 300 members → exceeds all tiers → uses highest tier (200) → supply = 10

## Badge Templates & Enable Beams

The admin (`get_self()`) can predefine badge templates via `addtempl`. Each template specifies:
- `badge_suffix` (3 uppercase chars, e.g. "BMA")
- `cycle_length`, `supply_per_cycle`, `display_name`, `ipfs_image`, `description`

When an org calls `enablebeams(org, starttime)`, the contract iterates all templates and creates a badge for each one. The badge symbol is constructed as `uppercase(org_code) + badge_suffix` with precision 0. For example, org code `test` + suffix `BMA` → symbol `TESTBMA`.

Each created badge also gets `badgedata::addfeature` called for the subscription contract.
