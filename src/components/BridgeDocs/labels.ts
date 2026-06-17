import type {
  AnyBridgeSpec,
  BridgeDirection,
  BridgePlatform,
} from "../../core/types"
import type { DirectionFilter } from "./componentTypes"

export const defaultDirectionLabels: Record<DirectionFilter, string> = {
  all: "All bridge messages",
  "web-to-app": "Web -> App",
  "app-to-web": "App -> Web",
}

export const defaultOperationTheme: Record<
  BridgeDirection,
  {
    badge: string
    label: string
  }
> = {
  "web-to-app": {
    badge: "Web -> App",
    label: "Web calls App",
  },
  "app-to-web": {
    badge: "App -> Web",
    label: "App dispatches Web",
  },
}

export function formatPlatformLabel(platform: BridgePlatform) {
  if (platform === "android") return "Android"
  if (platform === "ios") return "iOS"
  if (platform === "web") return "Web"
  return platform
}

export function getPlatformRestrictionLabel(
  platforms: AnyBridgeSpec["platforms"],
) {
  const supportsAndroid = platforms.includes("android")
  const supportsIos = platforms.includes("ios")

  if (supportsAndroid && !supportsIos) return "Android Only"
  if (supportsIos && !supportsAndroid) return "iOS Only"
  return null
}

export function getBridgeResponseSuccess(payload: unknown): boolean | null {
  if (!payload || typeof payload !== "object" || !("isSuccess" in payload)) {
    return null
  }

  const isSuccess = (payload as { isSuccess?: unknown }).isSuccess
  return typeof isSuccess === "boolean" ? isSuccess : null
}
