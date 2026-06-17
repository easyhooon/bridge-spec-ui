import { z } from "zod"

// allow: SIZE_OK - demo bridge catalog; static sample specs are kept together for scanability.
import { defineAppToWebBridge, defineWebToAppBridge } from "../src/core"

const permissionNameSchema = z.enum([
  "notifications",
  "camera",
  "location",
  "contacts",
  "biometrics",
])

const secureStorageKeySchema = z.enum([
  "accessToken",
  "refreshToken",
  "preferredWorkspace",
])

const themeSchema = z.enum(["system", "light", "dark"])

export type DemoPermissionName = z.infer<typeof permissionNameSchema>
export type DemoSecureStorageKey = z.infer<typeof secureStorageKeySchema>

export type DemoNativeState = {
  app: {
    version: string
    buildNumber: string
    environment: "development" | "staging" | "production"
  }
  platforms: {
    android: {
      osVersion: string
      modelName: string
    }
    ios: {
      osVersion: string
      modelName: string
    }
  }
  device: {
    id: string
    locale: string
    timezone: string
    theme: z.infer<typeof themeSchema>
    batteryLevel: number
    safeAreaInsets: {
      top: number
      right: number
      bottom: number
      left: number
    }
  }
  account: {
    signedIn: boolean
    memberId: string
    workspaceId: string
    biometricsEnrolled: boolean
  }
  permissions: Record<DemoPermissionName, boolean>
  network: {
    online: boolean
    type: "wifi" | "cellular" | "offline"
  }
  secureStorage: Record<DemoSecureStorageKey, string | null>
  sync: {
    lastSyncedAt: string
    queuedRecords: number
  }
  push: {
    token: string
    enabled: boolean
  }
  checkout: {
    canPay: boolean
    lastTransactionId: string
  }
}

export const defaultDemoNativeState: DemoNativeState = {
  app: {
    version: "1.8.0",
    buildNumber: "204",
    environment: "staging",
  },
  platforms: {
    android: {
      osVersion: "15",
      modelName: "Pixel 9 Pro",
    },
    ios: {
      osVersion: "18.2",
      modelName: "iPhone 16",
    },
  },
  device: {
    id: "demo-device-01",
    locale: "en-US",
    timezone: "Asia/Seoul",
    theme: "system",
    batteryLevel: 82,
    safeAreaInsets: {
      top: 47,
      right: 0,
      bottom: 34,
      left: 0,
    },
  },
  account: {
    signedIn: true,
    memberId: "member_1024",
    workspaceId: "workspace_alpha",
    biometricsEnrolled: true,
  },
  permissions: {
    notifications: true,
    camera: true,
    location: false,
    contacts: false,
    biometrics: true,
  },
  network: {
    online: true,
    type: "wifi",
  },
  secureStorage: {
    accessToken: "sample-access-token",
    refreshToken: "sample-refresh-token",
    preferredWorkspace: "workspace_alpha",
  },
  sync: {
    lastSyncedAt: "2026-06-11T15:30:00+09:00",
    queuedRecords: 12,
  },
  push: {
    token: "sample-push-token",
    enabled: true,
  },
  checkout: {
    canPay: true,
    lastTransactionId: "txn_20260611_0001",
  },
}

export const demoTagOrder = [
  "App Info / Device",
  "Permissions",
  "Secure Storage",
  "Native Screens",
  "Navigation",
  "Commerce",
  "Sync / Network",
  "Push / Notifications",
  "App Lifecycle",
  "Danger Zone",
]

export const demoBridges = [
  defineWebToAppBridge({
    handlerName: "getNativeAppInfo",
    title: "Native app info",
    summary:
      "Requests host app version, build number, environment, and platform.",
    tags: ["App Info / Device"],
    platforms: ["android", "ios"],
    response: z.object({
      platform: z.enum(["android", "ios"]),
      appVersion: z.string(),
      buildNumber: z.string(),
      environment: z.enum(["development", "staging", "production"]),
    }),
    examples: [
      {
        title: "Success",
        response: {
          platform: "android",
          appVersion: "1.8.0",
          buildNumber: "204",
          environment: "staging",
        },
      },
    ],
  }),
  defineWebToAppBridge({
    handlerName: "getDeviceContext",
    title: "Device context",
    summary:
      "Reads device identity, model, locale, timezone, theme, and battery.",
    tags: ["App Info / Device"],
    platforms: ["android", "ios"],
    response: z.object({
      deviceId: z.string(),
      modelName: z.string(),
      osVersion: z.string(),
      locale: z.string(),
      timezone: z.string(),
      theme: themeSchema,
      batteryLevel: z.number().min(0).max(100),
    }),
    examples: [
      {
        title: "Device context",
        response: {
          deviceId: "demo-device-01",
          modelName: "Pixel 9 Pro",
          osVersion: "15",
          locale: "en-US",
          timezone: "Asia/Seoul",
          theme: "system",
          batteryLevel: 82,
        },
      },
    ],
  }),
  defineWebToAppBridge({
    handlerName: "getSafeAreaInsets",
    title: "Safe area insets",
    summary: "Requests native safe area values for edge-to-edge layouts.",
    tags: ["App Info / Device"],
    platforms: ["android", "ios"],
    response: z.object({
      top: z.number(),
      right: z.number(),
      bottom: z.number(),
      left: z.number(),
    }),
    examples: [
      {
        title: "Notched device",
        response: { top: 47, right: 0, bottom: 34, left: 0 },
      },
    ],
  }),
  defineWebToAppBridge({
    handlerName: "getPermissionStatus",
    title: "Permission status",
    summary: "Reads one native permission state from the WebView host.",
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
    summary: "Asks native to show a permission prompt and report the result.",
    tags: ["Permissions"],
    platforms: ["android", "ios"],
    request: z.object({
      name: permissionNameSchema,
      rationale: z.string().optional(),
    }),
    response: z.object({
      name: permissionNameSchema,
      granted: z.boolean(),
      reason: z.enum(["GRANTED", "DENIED", "UNAVAILABLE"]),
    }),
    examples: [
      {
        title: "Location denied",
        data: { name: "location", rationale: "Show nearby stores." },
        response: { name: "location", granted: false, reason: "DENIED" },
      },
    ],
  }),
  defineWebToAppBridge({
    handlerName: "authenticateWithBiometrics",
    title: "Biometric authentication",
    summary: "Requests a biometric prompt before a sensitive web action.",
    tags: ["Permissions"],
    platforms: ["android", "ios"],
    request: z.object({
      reason: z.string(),
      fallbackTitle: z.string().optional(),
    }),
    response: z.object({
      authenticated: z.boolean(),
      reason: z.enum(["OK", "NOT_ENROLLED", "DENIED"]),
    }),
    examples: [
      {
        title: "Sensitive action",
        data: { reason: "Confirm account export" },
        response: { authenticated: true, reason: "OK" },
      },
    ],
  }),
  defineWebToAppBridge({
    handlerName: "getSecureItem",
    title: "Read secure item",
    summary: "Reads a value from native secure storage.",
    tags: ["Secure Storage"],
    platforms: ["android", "ios"],
    request: z.object({
      key: secureStorageKeySchema,
    }),
    response: z.object({
      key: secureStorageKeySchema,
      value: z.string().nullable(),
    }),
    examples: [
      {
        title: "Access token",
        data: { key: "accessToken" },
        response: { key: "accessToken", value: "sample-access-token" },
      },
    ],
  }),
  defineWebToAppBridge({
    handlerName: "setSecureItem",
    title: "Write secure item",
    summary: "Writes a value to native secure storage.",
    tags: ["Secure Storage"],
    platforms: ["android", "ios"],
    request: z.object({
      key: secureStorageKeySchema,
      value: z.string().min(1),
    }),
    response: z.object({
      isSuccess: z.boolean(),
    }),
    examples: [
      {
        title: "Preferred workspace",
        data: { key: "preferredWorkspace", value: "workspace_beta" },
        response: { isSuccess: true },
      },
    ],
    tryOut: {
      mode: "mock-only",
      reason: "The sample documents mutation shape without persisting secrets.",
    },
  }),
  defineWebToAppBridge({
    handlerName: "pickImage",
    title: "Pick image",
    summary: "Opens native image picker and returns selected asset metadata.",
    tags: ["Native Screens"],
    platforms: ["android", "ios"],
    request: z.object({
      source: z.enum(["camera", "photo-library"]),
      maxCount: z.number().int().min(1).max(10).default(1),
      mediaTypes: z.array(z.enum(["image", "video"])).default(["image"]),
    }),
    response: z.object({
      assets: z.array(
        z.object({
          id: z.string(),
          uri: z.string(),
          mimeType: z.string(),
          width: z.number(),
          height: z.number(),
          sizeBytes: z.number(),
        }),
      ),
    }),
    examples: [
      {
        title: "Library image",
        data: { source: "photo-library", maxCount: 1, mediaTypes: ["image"] },
        response: {
          assets: [
            {
              id: "asset_001",
              uri: "file://sample/image.jpg",
              mimeType: "image/jpeg",
              width: 1200,
              height: 900,
              sizeBytes: 345678,
            },
          ],
        },
      },
    ],
    tryOut: {
      mode: "mock-only",
      reason: "The sample does not open a real image picker.",
    },
  }),
  defineWebToAppBridge({
    handlerName: "scanCode",
    title: "Scan QR or barcode",
    summary: "Opens a native scanner and returns the decoded payload.",
    tags: ["Native Screens"],
    platforms: ["android", "ios"],
    request: z.object({
      formats: z.array(z.enum(["qr", "ean13", "code128"])),
      prompt: z.string().optional(),
    }),
    response: z.object({
      format: z.enum(["qr", "ean13", "code128"]),
      value: z.string(),
    }),
    examples: [
      {
        title: "QR code",
        data: { formats: ["qr"], prompt: "Scan a ticket" },
        response: { format: "qr", value: "sample-ticket-42" },
      },
    ],
    tryOut: {
      mode: "mock-only",
      reason: "The sample returns a fake scan result.",
    },
  }),
  defineWebToAppBridge({
    handlerName: "shareText",
    title: "Share text",
    summary: "Opens a native share sheet with a text payload.",
    tags: ["Native Screens"],
    platforms: ["android", "ios"],
    request: z.object({
      title: z.string().optional(),
      text: z.string().min(1),
      url: z.url().optional(),
    }),
    response: z.object({
      completed: z.boolean(),
      activityType: z.string().nullable(),
    }),
    examples: [
      {
        title: "Share message",
        data: {
          title: "BridgeDocs",
          text: "Testing a WebView bridge.",
          url: "https://example.com",
        },
        response: { completed: true, activityType: "copy" },
      },
    ],
    tryOut: {
      mode: "mock-only",
      reason:
        "The sample returns a fake share result instead of opening a sheet.",
    },
  }),
  defineWebToAppBridge({
    handlerName: "openExternalURL",
    title: "Open external URL",
    summary: "Asks native to open a URL outside of the WebView.",
    tags: ["Navigation"],
    platforms: ["android", "ios"],
    request: z.object({
      url: z.url(),
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
      reason: "The sample never launches external applications.",
    },
  }),
  defineWebToAppBridge({
    handlerName: "presentNativeCheckout",
    title: "Present native checkout",
    summary: "Starts a native checkout flow and returns a transaction result.",
    tags: ["Commerce"],
    platforms: ["android", "ios"],
    request: z.object({
      orderId: z.string(),
      amount: z.number().positive(),
      currency: z.enum(["USD", "KRW", "JPY", "EUR"]),
      lineItems: z.array(
        z.object({
          sku: z.string(),
          name: z.string(),
          quantity: z.number().int().positive(),
          unitPrice: z.number().positive(),
        }),
      ),
    }),
    response: z.object({
      status: z.enum(["PAID", "CANCELED", "FAILED"]),
      transactionId: z.string().nullable(),
    }),
    examples: [
      {
        title: "Checkout",
        data: {
          orderId: "order_1004",
          amount: 29.99,
          currency: "USD",
          lineItems: [
            {
              sku: "pro_monthly",
              name: "Pro Monthly",
              quantity: 1,
              unitPrice: 29.99,
            },
          ],
        },
        response: { status: "PAID", transactionId: "txn_20260611_0001" },
      },
    ],
  }),
  defineWebToAppBridge({
    handlerName: "syncOfflineQueue",
    title: "Sync offline queue",
    summary: "Requests native to sync locally queued records.",
    tags: ["Sync / Network"],
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
  defineWebToAppBridge({
    handlerName: "getConnectivity",
    title: "Connectivity",
    summary: "Reads native connectivity status and transport type.",
    tags: ["Sync / Network"],
    platforms: ["android", "ios"],
    response: z.object({
      online: z.boolean(),
      type: z.enum(["wifi", "cellular", "offline"]),
    }),
    examples: [
      {
        title: "Wi-Fi",
        response: { online: true, type: "wifi" },
      },
    ],
  }),
  defineWebToAppBridge({
    handlerName: "registerPushToken",
    title: "Register push token",
    summary:
      "Requests a native push token and reports whether push is enabled.",
    tags: ["Push / Notifications"],
    platforms: ["android", "ios"],
    response: z.object({
      token: z.string().nullable(),
      enabled: z.boolean(),
    }),
    examples: [
      {
        title: "Enabled",
        response: { token: "sample-push-token", enabled: true },
      },
    ],
  }),
  defineAppToWebBridge({
    handlerName: "notifyPushNotificationTapped",
    title: "Push notification tapped",
    summary: "Passes native push notification intent data into the web app.",
    tags: ["Push / Notifications"],
    platforms: ["android", "ios"],
    request: z.object({
      notificationId: z.string(),
      title: z.string(),
      deepLink: z.url().optional(),
      data: z.record(z.string(), z.string()).optional(),
    }),
    response: z.object({
      handled: z.boolean(),
    }),
    examples: [
      {
        title: "Open order",
        data: {
          notificationId: "push_42",
          title: "Order shipped",
          deepLink: "https://example.com/orders/42",
          data: { orderId: "42" },
        },
        response: { handled: true },
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
      url: z.url(),
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
  defineAppToWebBridge({
    handlerName: "notifyNativeSyncCompleted",
    title: "Native sync completed",
    summary: "Dispatches a sync-completed event from native to web.",
    tags: ["Sync / Network"],
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
    handlerName: "notifyAppStateChanged",
    title: "App state changed",
    summary: "Notifies web when the host app moves between foreground states.",
    tags: ["App Lifecycle"],
    platforms: ["android", "ios"],
    request: z.object({
      state: z.enum(["active", "background", "inactive"]),
      changedAt: z.string(),
    }),
    response: z.object({
      acknowledged: z.boolean(),
    }),
    examples: [
      {
        title: "Foreground",
        data: { state: "active", changedAt: "2026-06-11T15:30:00+09:00" },
        response: { acknowledged: true },
      },
    ],
    tryOut: {
      mode: "mock-only",
    },
  }),
  defineAppToWebBridge({
    handlerName: "notifyThemeChanged",
    title: "Theme changed",
    summary: "Notifies web when native appearance changes.",
    tags: ["App Lifecycle"],
    platforms: ["android", "ios"],
    request: z.object({
      theme: themeSchema,
    }),
    response: z.object({
      applied: z.boolean(),
    }),
    examples: [
      {
        title: "Dark mode",
        data: { theme: "dark" },
        response: { applied: true },
      },
    ],
    tryOut: {
      mode: "mock-only",
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
