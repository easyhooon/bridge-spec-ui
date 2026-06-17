import type { BridgeDirection, BridgeTryResult } from "../../core/types"

export type DirectionFilter = BridgeDirection | "all"

export type TryState = {
  rawInput: string
  result?: BridgeTryResult
  isRunning: boolean
  isEnabled: boolean
}

export type SchemaModel = {
  name: string
  schema: unknown
}

export type SchemaPanelView = "example" | "schema"

export type SelectOption = {
  label: string
  value: string
}
