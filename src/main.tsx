import { StrictMode, useMemo, useState } from "react"
import { createRoot } from "react-dom/client"
import { BridgeSpecUi } from "./components/BridgeSpecUi"
import {
  createDemoRunner,
  defaultDemoNativeState,
  demoBridges,
  demoTagOrder,
  type DemoNativeState,
  type DemoPermissionName,
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

function DemoField({
  label,
  onChange,
  type = "text",
  value,
}: {
  label: string
  onChange: (value: string) => void
  type?: "number" | "text"
  value: number | string
}) {
  return (
    <label className="demo-field">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function DemoSelect<TValue extends string>({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: TValue) => void
  options: readonly TValue[]
  value: TValue
}) {
  return (
    <label className="demo-field">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value as TValue)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function PermissionToggles({
  nativeState,
  setNativeState,
}: {
  nativeState: DemoNativeState
  setNativeState: (updater: (current: DemoNativeState) => DemoNativeState) => void
}) {
  const setPermission = (name: DemoPermissionName, checked: boolean) => {
    setNativeState((current) => ({
      ...current,
      permissions: {
        ...current.permissions,
        [name]: checked,
      },
    }))
  }

  return (
    <>
      {(
        [
          "notifications",
          "camera",
          "location",
          "contacts",
          "biometrics",
        ] as const
      ).map((permissionName) => (
        <Toggle
          checked={nativeState.permissions[permissionName]}
          key={permissionName}
          label={permissionName}
          onChange={(checked) => setPermission(permissionName, checked)}
        />
      ))}
    </>
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
  const platformProfile =
    selectedPlatform === "ios"
      ? nativeState.platforms.ios
      : nativeState.platforms.android

  return (
    <section className="demo-native-panel">
      <div className="demo-native-summary">
        <strong>{selectedPlatform === "android" ? "Android" : "iOS"} host</strong>
        <span>{visibleBridgeCount} visible bridge specs</span>
        <span>App {nativeState.app.version}</span>
        <span>Build {nativeState.app.buildNumber}</span>
        <span>{platformProfile.modelName}</span>
        <span>{nativeState.network.online ? nativeState.network.type : "offline"}</span>
      </div>

      <section className="demo-section">
        <h3>App and Device</h3>
        <div className="demo-native-grid">
          <DemoField
            label="App version"
            value={nativeState.app.version}
            onChange={(value) =>
              setNativeState((current) => ({
                ...current,
                app: { ...current.app, version: value },
              }))
            }
          />
          <DemoField
            label="Build number"
            value={nativeState.app.buildNumber}
            onChange={(value) =>
              setNativeState((current) => ({
                ...current,
                app: { ...current.app, buildNumber: value },
              }))
            }
          />
          <DemoSelect
            label="Environment"
            options={["development", "staging", "production"] as const}
            value={nativeState.app.environment}
            onChange={(value) =>
              setNativeState((current) => ({
                ...current,
                app: { ...current.app, environment: value },
              }))
            }
          />
          <DemoSelect
            label="Theme"
            options={["system", "light", "dark"] as const}
            value={nativeState.device.theme}
            onChange={(value) =>
              setNativeState((current) => ({
                ...current,
                device: { ...current.device, theme: value },
              }))
            }
          />
          <DemoField
            label="Device ID"
            value={nativeState.device.id}
            onChange={(value) =>
              setNativeState((current) => ({
                ...current,
                device: { ...current.device, id: value },
              }))
            }
          />
          <DemoField
            label="Locale"
            value={nativeState.device.locale}
            onChange={(value) =>
              setNativeState((current) => ({
                ...current,
                device: { ...current.device, locale: value },
              }))
            }
          />
          <DemoField
            label="Timezone"
            value={nativeState.device.timezone}
            onChange={(value) =>
              setNativeState((current) => ({
                ...current,
                device: { ...current.device, timezone: value },
              }))
            }
          />
          <DemoField
            label="Battery"
            type="number"
            value={nativeState.device.batteryLevel}
            onChange={(value) =>
              setNativeState((current) => ({
                ...current,
                device: {
                  ...current.device,
                  batteryLevel: Number(value),
                },
              }))
            }
          />
        </div>
      </section>

      <section className="demo-section">
        <h3>Platform Profiles</h3>
        <div className="demo-native-grid">
          <DemoField
            label="Android OS"
            value={nativeState.platforms.android.osVersion}
            onChange={(value) =>
              setNativeState((current) => ({
                ...current,
                platforms: {
                  ...current.platforms,
                  android: {
                    ...current.platforms.android,
                    osVersion: value,
                  },
                },
              }))
            }
          />
          <DemoField
            label="Android model"
            value={nativeState.platforms.android.modelName}
            onChange={(value) =>
              setNativeState((current) => ({
                ...current,
                platforms: {
                  ...current.platforms,
                  android: {
                    ...current.platforms.android,
                    modelName: value,
                  },
                },
              }))
            }
          />
          <DemoField
            label="iOS version"
            value={nativeState.platforms.ios.osVersion}
            onChange={(value) =>
              setNativeState((current) => ({
                ...current,
                platforms: {
                  ...current.platforms,
                  ios: {
                    ...current.platforms.ios,
                    osVersion: value,
                  },
                },
              }))
            }
          />
          <DemoField
            label="iOS model"
            value={nativeState.platforms.ios.modelName}
            onChange={(value) =>
              setNativeState((current) => ({
                ...current,
                platforms: {
                  ...current.platforms,
                  ios: {
                    ...current.platforms.ios,
                    modelName: value,
                  },
                },
              }))
            }
          />
        </div>
      </section>

      <section className="demo-section">
        <h3>Native State</h3>
        <div className="demo-native-grid demo-native-grid-compact">
          <PermissionToggles
            nativeState={nativeState}
            setNativeState={setNativeState}
          />
          <Toggle
            checked={nativeState.network.online}
            label="network online"
            onChange={(checked) =>
              setNativeState((current) => ({
                ...current,
                network: {
                  ...current.network,
                  online: checked,
                  type: checked ? current.network.type === "offline" ? "wifi" : current.network.type : "offline",
                },
              }))
            }
          />
          <Toggle
            checked={nativeState.account.signedIn}
            label="signed in"
            onChange={(checked) =>
              setNativeState((current) => ({
                ...current,
                account: { ...current.account, signedIn: checked },
              }))
            }
          />
          <Toggle
            checked={nativeState.account.biometricsEnrolled}
            label="biometrics enrolled"
            onChange={(checked) =>
              setNativeState((current) => ({
                ...current,
                account: { ...current.account, biometricsEnrolled: checked },
              }))
            }
          />
          <Toggle
            checked={nativeState.push.enabled}
            label="push enabled"
            onChange={(checked) =>
              setNativeState((current) => ({
                ...current,
                push: { ...current.push, enabled: checked },
              }))
            }
          />
          <Toggle
            checked={nativeState.checkout.canPay}
            label="checkout can pay"
            onChange={(checked) =>
              setNativeState((current) => ({
                ...current,
                checkout: { ...current.checkout, canPay: checked },
              }))
            }
          />
        </div>
      </section>

      <section className="demo-section">
        <h3>Network, Sync, and Tokens</h3>
        <div className="demo-native-grid">
          <DemoSelect
            label="Network type"
            options={["wifi", "cellular", "offline"] as const}
            value={nativeState.network.type}
            onChange={(value) =>
              setNativeState((current) => ({
                ...current,
                network: {
                  ...current.network,
                  type: value,
                  online: value !== "offline",
                },
              }))
            }
          />
          <DemoField
            label="Queued records"
            type="number"
            value={nativeState.sync.queuedRecords}
            onChange={(value) =>
              setNativeState((current) => ({
                ...current,
                sync: { ...current.sync, queuedRecords: Number(value) },
              }))
            }
          />
          <DemoField
            label="Push token"
            value={nativeState.push.token}
            onChange={(value) =>
              setNativeState((current) => ({
                ...current,
                push: { ...current.push, token: value },
              }))
            }
          />
          <DemoField
            label="Last transaction"
            value={nativeState.checkout.lastTransactionId}
            onChange={(value) =>
              setNativeState((current) => ({
                ...current,
                checkout: {
                  ...current.checkout,
                  lastTransactionId: value,
                },
              }))
            }
          />
        </div>
      </section>

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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DemoApp />
  </StrictMode>,
)
