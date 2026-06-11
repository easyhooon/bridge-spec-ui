import { z } from "zod"
import {
  defineAppToWebBridge,
  defineWebToAppBridge,
  type BridgeRunner,
} from "../core"

export const demoBridges = [
  defineWebToAppBridge({
    handlerName: "getNativeAppVersion",
    title: "Native app version",
    summary: "Requests the app version from the native WebView host.",
    tags: ["App Info / Version"],
    platforms: ["android", "ios"],
    response: z.object({
      os: z.enum(["ANDROID", "IOS"]),
      version: z.string(),
    }),
    examples: [
      {
        title: "Success",
        response: { os: "ANDROID", version: "1.0.0" },
      },
    ],
    invoke: async () => ({ os: "ANDROID" as const, version: "1.0.0" }),
  }),
  defineWebToAppBridge({
    handlerName: "openURL",
    title: "Open URL",
    summary: "Asks native to open an external URL.",
    tags: ["Deep Link"],
    platforms: ["android", "ios"],
    request: z.object({
      url: z.string().url(),
    }),
    response: z.null(),
    examples: [
      {
        title: "External browser",
        data: { url: "https://example.com" },
        response: null,
      },
    ],
    tryOut: {
      mode: "mock-only",
      reason: "The demo does not launch external apps.",
    },
  }),
  defineAppToWebBridge({
    handlerName: "notifyNativeSyncCompleted",
    title: "Native sync completed",
    summary: "Dispatches a sync-completed event from native to web.",
    tags: ["Sync Events"],
    platforms: ["android", "ios"],
    request: z.object({
      syncedAt: z.string(),
    }),
    response: z.object({
      isSuccess: z.boolean(),
    }),
    examples: [
      {
        title: "Completed",
        data: { syncedAt: "2026-06-11T15:30:00+09:00" },
        response: { isSuccess: true },
      },
    ],
    tryOut: {
      mode: "mock-only",
    },
  }),
]

export const demoRunner: BridgeRunner = async ({ bridge, data }) => {
  if (bridge.tryOut?.mode === "mock-only") {
    const response = bridge.examples.find(
      (example) => example.response !== undefined,
    )?.response

    return {
      ok: true,
      message: "Demo mock response returned.",
      payload: response ?? null,
    }
  }

  if (!bridge.invoke) {
    return {
      ok: false,
      message: "No demo invoke handler is attached.",
      payload: data,
    }
  }

  return {
    ok: true,
    message: "Demo bridge handler completed.",
    payload: await bridge.invoke(data),
  }
}
