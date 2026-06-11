import { StrictMode, useMemo, useState } from "react"
import { createRoot } from "react-dom/client"
import { BridgeSpecUi } from "./components/BridgeSpecUi"
import {
  createDemoRunner,
  defaultDemoNativeState,
  demoBridges,
  type DemoNativeState,
} from "./demo/bridges"
import type { BridgePlatform } from "./core"
import "./styles.css"

function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="demo-toggle">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  )
}

function SampleNativePanel({
  nativeState,
  selectedPlatform,
  setNativeState,
  visibleBridgeCount,
}: {
  nativeState: DemoNativeState
  selectedPlatform: BridgePlatform
  setNativeState: (updater: (current: DemoNativeState) => DemoNativeState) => void
  visibleBridgeCount: number
}) {
  const setPermission = (
    name: keyof DemoNativeState["permissions"],
    checked: boolean,
  ) => {
    setNativeState((current) => ({
      ...current,
      permissions: {
        ...current.permissions,
        [name]: checked,
      },
    }))
  }

  return (
    <section className="demo-native-panel">
      <div className="demo-native-summary">
        <strong>{selectedPlatform === "android" ? "Android" : "iOS"} host</strong>
        <span>{visibleBridgeCount} visible bridge specs</span>
        <span>App {nativeState.appVersion}</span>
        <span>OS {selectedPlatform === "android" ? nativeState.osVersion : "18.2"}</span>
      </div>

      <div className="demo-native-grid">
        <label className="demo-field">
          App version
          <input
            value={nativeState.appVersion}
            onChange={(event) =>
              setNativeState((current) => ({
                ...current,
                appVersion: event.target.value,
              }))
            }
          />
        </label>
        <label className="demo-field">
          Android OS version
          <input
            value={nativeState.osVersion}
            onChange={(event) =>
              setNativeState((current) => ({
                ...current,
                osVersion: event.target.value,
              }))
            }
          />
        </label>
        <label className="demo-field">
          Device ID
          <input
            value={nativeState.deviceId}
            onChange={(event) =>
              setNativeState((current) => ({
                ...current,
                deviceId: event.target.value,
              }))
            }
          />
        </label>
      </div>

      <div className="demo-native-grid">
        <Toggle
          checked={nativeState.permissions.notifications}
          label="Notifications"
          onChange={(checked) => setPermission("notifications", checked)}
        />
        <Toggle
          checked={nativeState.permissions.camera}
          label="Camera"
          onChange={(checked) => setPermission("camera", checked)}
        />
        <Toggle
          checked={nativeState.permissions.location}
          label="Location"
          onChange={(checked) => setPermission("location", checked)}
        />
        <Toggle
          checked={nativeState.sync.online}
          label="Native online"
          onChange={(checked) =>
            setNativeState((current) => ({
              ...current,
              sync: {
                ...current.sync,
                online: checked,
              },
            }))
          }
        />
      </div>

      <div className="demo-actions">
        <button
          type="button"
          onClick={() => setNativeState(() => defaultDemoNativeState)}>
          Reset sample state
        </button>
      </div>
    </section>
  )
}

function DemoApp() {
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
    <BridgeSpecUi
      title="Example WebView Bridge"
      version="0.0.0"
      brandName="BridgeSpec UI"
      description="A sample bridge console with mock native state, schema-driven docs, and Try it out execution."
      bridges={demoBridges}
      platform={platform}
      platformOptions={[
        { label: "Android WebView", value: "android" },
        { label: "iOS WebView", value: "ios" },
      ]}
      runBridge={demoRunner}
      onPlatformChange={setPlatform}
      tagOrder={[
        "App Info / Version",
        "Permissions",
        "Navigation",
        "Native UI",
        "Sync Events",
        "Danger Zone",
      ]}
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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DemoApp />
  </StrictMode>,
)
