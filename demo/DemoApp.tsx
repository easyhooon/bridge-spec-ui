import { useMemo, useState } from "react"
import { BridgeDocs } from "../src/components/BridgeDocs"
import type { BridgePlatform } from "../src/core"
import { defaultDemoNativeState, demoBridges, demoTagOrder } from "./bridges"
import { createDemoRunner } from "./demoRunner"
import { SampleNativePanel } from "./SampleNativePanel"

export function DemoApp() {
  const [platform, setPlatform] = useState<BridgePlatform>("android")
  const [nativeState, setNativeState] = useState(defaultDemoNativeState)
  const demoRunner = useMemo(
    () =>
      createDemoRunner({
        getNativeState: () => nativeState,
      }),
    [nativeState],
  )

  return (
    <BridgeDocs
      title="Example WebView Bridge"
      version="0.0.0"
      brandName="BridgeDocs"
      description="A production-shaped sample bridge console with mock native state, schema-driven docs, and Try it out execution."
      bridges={demoBridges}
      platform={platform}
      platformOptions={[
        { label: "Android WebView", value: "android" },
        { label: "iOS WebView", value: "ios" },
      ]}
      runBridge={demoRunner}
      onPlatformChange={setPlatform}
      tagOrder={demoTagOrder}
      renderEnvironmentPanel={({ selectedPlatform, visibleBridges }) => (
        <SampleNativePanel
          nativeState={nativeState}
          selectedPlatform={selectedPlatform}
          setNativeState={setNativeState}
          visibleBridgeCount={visibleBridges.length}
        />
      )}
    />
  )
}
