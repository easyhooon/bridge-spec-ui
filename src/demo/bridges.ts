import { z } from "zod"
import {
  defineAppToWebBridge,
  defineWebToAppBridge,
  type BridgePlatform,
  type BridgeRunner,
} from "../core"

export type DemoNativeState = {
  appVersion: string
  osVersion: string
  deviceId: string
  permissions: {
    notifications: boolean
    camera: boolean
    location: boolean
  }
  sync: {
    online: boolean
    lastSyncedAt: string
  }
}

export const defaultDemoNativeState: DemoNativeState = {
  appVersion: "1.8.0",
  osVersion: "18.2",
  deviceId: "demo-device-01",
  permissions: {
    notifications: true,
    camera: true,
    location: false,
  },
  sync: {
    online: true,
    lastSyncedAt: "2026-06-11T15:30:00+09:00",
  },
}

const permissionNameSchema = z.enum(["notifications", "camera", "location"])

export const demoBridges = [
  defineWebToAppBridge({
    handlerName: "getNativeAppInfo",
    title: "Native app info",
    summary: "Requests host app version, OS version, and device identity.",
    tags: ["App Info / Version"],
    platforms: ["android", "ios"],
    response: z.object({
      platform: z.enum(["android", "ios"]),
      appVersion: z.string(),
      osVersion: z.string(),
      deviceId: z.string(),
    }),
    examples: [
      {
        title: "Success",
        response: {
          platform: "android",
          appVersion: "1.8.0",
          osVersion: "15",
          deviceId: "demo-device-01",
        },
      },
    ],
  }),
  defineWebToAppBridge({
    handlerName: "getPermissionStatus",
    title: "Permission status",
    summary: "Reads a native permission state from the WebView host.",
    tags: ["Permissions"],
    platforms: ["android", "ios"],
    request: z.object({
      name: permissionNameSchema,
    }),
    response: z.object({
      name: permissionNameSchema,
      granted: z.boolean(),
    }),
    examples: [
      {
        title: "Camera granted",
        data: { name: "camera" },
        response: { name: "camera", granted: true },
      },
    ],
  }),
  defineWebToAppBridge({
    handlerName: "requestPermission",
    title: "Request permission",
    summary: "Asks native to show a permission prompt.",
    tags: ["Permissions"],
    platforms: ["android", "ios"],
    request: z.object({
      name: permissionNameSchema,
    }),
    response: z.object({
      name: permissionNameSchema,
      granted: z.boolean(),
      reason: z.enum(["GRANTED", "DENIED"]),
    }),
    examples: [
      {
        title: "Location denied",
        data: { name: "location" },
        response: { name: "location", granted: false, reason: "DENIED" },
      },
    ],
  }),
  defineWebToAppBridge({
    handlerName: "openExternalURL",
    title: "Open external URL",
    summary: "Asks native to open a URL outside of the WebView.",
    tags: ["Navigation"],
    platforms: ["android", "ios"],
    request: z.object({
      url: z.string().url(),
      presentation: z.enum(["browser", "in-app"]).default("browser"),
    }),
    response: z.object({
      accepted: z.boolean(),
    }),
    examples: [
      {
        title: "External browser",
        data: { url: "https://example.com", presentation: "browser" },
        response: { accepted: true },
      },
    ],
    tryOut: {
      mode: "mock-only",
      reason: "The sample app never launches external applications.",
    },
  }),
  defineWebToAppBridge({
    handlerName: "shareText",
    title: "Share text",
    summary: "Opens a native share sheet with a text payload.",
    tags: ["Native UI"],
    platforms: ["android", "ios"],
    request: z.object({
      title: z.string().optional(),
      text: z.string().min(1),
    }),
    response: z.object({
      completed: z.boolean(),
      activityType: z.string().nullable(),
    }),
    examples: [
      {
        title: "Share message",
        data: { title: "BridgeSpec UI", text: "Testing a WebView bridge." },
        response: { completed: true, activityType: "copy" },
      },
    ],
    tryOut: {
      mode: "mock-only",
      reason: "The sample returns a fake share result instead of opening a sheet.",
    },
  }),
  defineWebToAppBridge({
    handlerName: "syncOfflineQueue",
    title: "Sync offline queue",
    summary: "Requests native to sync locally queued records.",
    tags: ["Sync Events"],
    platforms: ["android", "ios"],
    response: z.object({
      status: z.enum(["SYNCED", "OFFLINE"]),
      syncedAt: z.string().nullable(),
      recordsUploaded: z.number(),
    }),
    examples: [
      {
        title: "Synced",
        response: {
          status: "SYNCED",
          syncedAt: "2026-06-11T15:30:00+09:00",
          recordsUploaded: 12,
        },
      },
    ],
  }),
  defineAppToWebBridge({
    handlerName: "notifyNativeSyncCompleted",
    title: "Native sync completed",
    summary: "Dispatches a sync-completed event from native to web.",
    tags: ["Sync Events"],
    platforms: ["android", "ios"],
    request: z.object({
      syncedAt: z.string(),
      recordsUploaded: z.number(),
    }),
    response: z.object({
      isSuccess: z.boolean(),
    }),
    examples: [
      {
        title: "Completed",
        data: { syncedAt: "2026-06-11T15:30:00+09:00", recordsUploaded: 12 },
        response: { isSuccess: true },
      },
    ],
    tryOut: {
      mode: "mock-only",
    },
  }),
  defineAppToWebBridge({
    handlerName: "handleDeepLink",
    title: "Handle deep link",
    summary: "Passes a native deep link URL into the web app.",
    tags: ["Navigation"],
    platforms: ["android", "ios"],
    request: z.object({
      url: z.string().url(),
      source: z.enum(["push", "universal-link", "custom-scheme"]),
    }),
    response: z.object({
      handled: z.boolean(),
      route: z.string(),
    }),
    examples: [
      {
        title: "Push deep link",
        data: {
          url: "https://example.com/orders/42",
          source: "push",
        },
        response: { handled: true, route: "/orders/42" },
      },
    ],
    tryOut: {
      mode: "mock-only",
      reason: "The sample does not mutate router state.",
    },
  }),
  defineWebToAppBridge({
    handlerName: "resetNativeSession",
    title: "Reset native session",
    summary: "Dangerous command that clears host app session state.",
    tags: ["Danger Zone"],
    platforms: ["android", "ios"],
    response: z.object({
      reset: z.boolean(),
    }),
    examples: [
      {
        title: "Blocked",
        response: { reset: false },
      },
    ],
    tryOut: {
      mode: "disabled",
      reason: "Dangerous commands should stay documented but non-executable.",
    },
  }),
]

export function createDemoRunner({
  getNativeState,
}: {
  getNativeState: () => DemoNativeState
}): BridgeRunner {
  return async ({ bridge, data, platform }) => {
    const nativeState = getNativeState()

    if (bridge.tryOut?.mode === "disabled") {
      return {
        ok: false,
        message: bridge.tryOut.reason ?? "This bridge is disabled.",
        payload: null,
      }
    }

    if (bridge.tryOut?.mode === "mock-only") {
      const response = bridge.examples.find(
        (example) => example.response !== undefined,
      )?.response

      return {
        ok: true,
        message: "Sample mock response returned.",
        payload: response ?? null,
      }
    }

    switch (bridge.handlerName) {
      case "getNativeAppInfo":
        return {
          ok: true,
          message: "Native app info resolved from sample state.",
          payload: {
            platform: platform as Extract<BridgePlatform, "android" | "ios">,
            appVersion: nativeState.appVersion,
            osVersion:
              platform === "android" ? nativeState.osVersion : "18.2",
            deviceId: nativeState.deviceId,
          },
        }
      case "getPermissionStatus": {
        const permissionName = (data as { name: keyof DemoNativeState["permissions"] }).name

        return {
          ok: true,
          message: "Permission state resolved from sample state.",
          payload: {
            name: permissionName,
            granted: nativeState.permissions[permissionName],
          },
        }
      }
      case "requestPermission": {
        const permissionName = (data as { name: keyof DemoNativeState["permissions"] }).name
        const granted = nativeState.permissions[permissionName]

        return {
          ok: true,
          message: granted
            ? "Sample permission request granted."
            : "Sample permission request denied.",
          payload: {
            name: permissionName,
            granted,
            reason: granted ? "GRANTED" : "DENIED",
          },
        }
      }
      case "syncOfflineQueue":
        return {
          ok: nativeState.sync.online,
          message: nativeState.sync.online
            ? "Sample offline queue synced."
            : "Sample native host is offline.",
          payload: {
            status: nativeState.sync.online ? "SYNCED" : "OFFLINE",
            syncedAt: nativeState.sync.online
              ? nativeState.sync.lastSyncedAt
              : null,
            recordsUploaded: nativeState.sync.online ? 12 : 0,
          },
        }
      default:
        return {
          ok: false,
          message: "No sample runner is attached to this bridge.",
          payload: data,
        }
    }
  }
}
