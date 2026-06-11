# BridgeSpec UI

Swagger UI-style documentation and testing components for WebView bridge APIs.

BridgeSpec UI is intentionally app-agnostic. Your app owns the actual bridge
runtime, mock native behavior, themes, routes, and handler implementation. This
package gives you a small source-of-truth API for bridge specs and a React UI
that can render those specs.

## Install

```bash
pnpm add bridge-spec-ui zod
```

## Quick Start

```tsx
import {
  BridgeSpecUi,
  defineWebToAppBridge,
  type BridgeTryResult,
  type BridgePlatform,
} from "bridge-spec-ui"
import "bridge-spec-ui/styles.css"
import { useState } from "react"
import { z } from "zod"

const getNativeAppVersion = defineWebToAppBridge({
  handlerName: "getNativeAppVersion",
  title: "Native app version",
  summary: "Requests the native app version from the WebView host.",
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
  invoke: async () => {
    return window.NativeBridge.getNativeAppVersion()
  },
})

function App() {
  const [platform, setPlatform] = useState<BridgePlatform>("android")

  return (
    <BridgeSpecUi
      title="Example WebView Bridge"
      bridges={[getNativeAppVersion]}
      platform={platform}
      platformOptions={[
        { label: "Android WebView", value: "android" },
        { label: "iOS WebView", value: "ios" },
      ]}
      onPlatformChange={setPlatform}
      runBridge={async ({ bridge, data }) => {
        if (!bridge.invoke) {
          return {
            ok: false,
            message: "No invoke adapter is attached.",
          } satisfies BridgeTryResult
        }

        return {
          ok: true,
          message: "Bridge request completed.",
          payload: await bridge.invoke(data),
        }
      }}
    />
  )
}
```

## Sample App

The local demo app shows a production-shaped integration:

- Web -> App and App -> Web bridge specs
- Android/iOS platform switching
- mock native state controls for app, device, network, permissions, secure
  storage, push, and checkout scenarios
- permission, secure storage, native UI, navigation, commerce, sync, push, and
  lifecycle examples
- mock-only and disabled Try it out policies

```bash
pnpm install
pnpm dev
```

## Design Notes

- `defineWebToAppBridge` and `defineAppToWebBridge` keep handler names, runtime
  schemas, examples, and optional invoke functions together.
- BridgeSpec UI does not know app-specific user agents, permission state,
  native state, or request envelopes. Pass those through adapters from the host
  app.
- The first migration target should be a few safe Web -> App bridges, then mock
  native state and App -> Web execution can be layered in.
