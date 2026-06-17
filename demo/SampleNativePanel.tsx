import type { BridgePlatform } from "../src/core"
import { defaultDemoNativeState, type DemoNativeState } from "./bridges"
import {
  AppDeviceSection,
  NativeStateSection,
  NetworkSyncSection,
  PlatformProfilesSection,
} from "./NativeStateSections"

export function SampleNativePanel({
  nativeState,
  selectedPlatform,
  setNativeState,
  visibleBridgeCount,
}: {
  nativeState: DemoNativeState
  selectedPlatform: BridgePlatform
  setNativeState: (
    updater: (current: DemoNativeState) => DemoNativeState,
  ) => void
  visibleBridgeCount: number
}) {
  const platformProfile =
    selectedPlatform === "ios"
      ? nativeState.platforms.ios
      : nativeState.platforms.android

  return (
    <section className="demo-native-panel">
      <div className="demo-native-summary">
        <strong>
          {selectedPlatform === "android" ? "Android" : "iOS"} host
        </strong>
        <span>{visibleBridgeCount} visible bridge specs</span>
        <span>App {nativeState.app.version}</span>
        <span>Build {nativeState.app.buildNumber}</span>
        <span>{platformProfile.modelName}</span>
        <span>
          {nativeState.network.online ? nativeState.network.type : "offline"}
        </span>
      </div>

      <AppDeviceSection
        nativeState={nativeState}
        setNativeState={setNativeState}
      />
      <PlatformProfilesSection
        nativeState={nativeState}
        setNativeState={setNativeState}
      />
      <NativeStateSection
        nativeState={nativeState}
        setNativeState={setNativeState}
      />
      <NetworkSyncSection
        nativeState={nativeState}
        setNativeState={setNativeState}
      />

      <div className="demo-actions">
        <button
          type="button"
          onClick={() => setNativeState(() => defaultDemoNativeState)}
        >
          Reset sample state
        </button>
      </div>
    </section>
  )
}
