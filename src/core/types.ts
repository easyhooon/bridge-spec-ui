import type { ReactNode } from "react"
import type { z } from "zod"

export type BridgeDirection = "web-to-app" | "app-to-web"

export type BridgePlatform = "android" | "ios" | "web" | (string & {})

export type BridgeSchema<TValue = unknown> = z.ZodType<TValue>

export type BridgeExample<TData = unknown, TResult = unknown> = {
  title: string
  data?: TData
  response?: TResult
}

export type BridgeTryOutPolicy = {
  mode: "enabled" | "mock-only" | "disabled"
  reason?: string
}

export type BridgeInvoke<TData = unknown, TResult = unknown> = (
  data: TData,
) => Promise<TResult> | TResult

export type BridgeSpec<TData = unknown, TResult = unknown> = {
  handlerName: string
  title: string
  summary: string
  description?: string
  direction: BridgeDirection
  tags: string[]
  platforms: BridgePlatform[]
  dataSchema?: BridgeSchema<TData>
  resultSchema?: BridgeSchema<TResult>
  examples: BridgeExample<TData, TResult>[]
  tryOut?: BridgeTryOutPolicy
  invoke?: BridgeInvoke<TData, TResult>
}

// Intentional type erasure for heterogeneous bridge lists.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyBridgeSpec = BridgeSpec<any, any>

export type DefineBridgeInput<TData = unknown, TResult = unknown> = {
  handlerName: string
  title: string
  summary?: string
  description?: string
  direction: BridgeDirection
  tags?: string[]
  platforms?: BridgePlatform[]
  request?: BridgeSchema<TData>
  response?: BridgeSchema<TResult>
  dataSchema?: BridgeSchema<TData>
  resultSchema?: BridgeSchema<TResult>
  examples?: BridgeExample<TData, TResult>[]
  tryOut?: BridgeTryOutPolicy
  invoke?: BridgeInvoke<TData, TResult>
}

export type DefineWebToAppBridgeInput<
  TData = unknown,
  TResult = unknown,
> = Omit<DefineBridgeInput<TData, TResult>, "direction">

export type DefineAppToWebBridgeInput<
  TData = unknown,
  TResult = unknown,
> = Omit<DefineBridgeInput<TData, TResult>, "direction">

export type BridgeTryContext<TData = unknown> = {
  bridge: AnyBridgeSpec
  data: TData
  platform: BridgePlatform
}

export type BridgeTryResult = {
  ok: boolean
  message: string
  payload?: unknown
}

export type BridgeRunner = (
  context: BridgeTryContext,
) => Promise<BridgeTryResult> | BridgeTryResult

export type BridgeDocsMockPanelContext = {
  visibleBridges: AnyBridgeSpec[]
  selectedPlatform: BridgePlatform
}

export type BridgeDocsProps = {
  title: string
  description?: string
  bridges: AnyBridgeSpec[]
  platform: BridgePlatform
  platformOptions: Array<{
    label: string
    value: BridgePlatform
  }>
  runBridge: BridgeRunner
  onPlatformChange: (platform: BridgePlatform) => void
  version?: string
  brandName?: string
  brandDescription?: string
  iconHref?: string
  queryPlaceholder?: string
  tagOrder?: string[]
  renderEnvironmentPanel?: (context: BridgeDocsMockPanelContext) => ReactNode
}
