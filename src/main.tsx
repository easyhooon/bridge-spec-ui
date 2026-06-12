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
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as TValue)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

type DemoNativeField =
  | {
      key: string
      label: string
      type: "boolean"
      fullWidth?: boolean
      value: (state: DemoNativeState) => boolean
      update: (state: DemoNativeState, value: boolean) => DemoNativeState
    }
  | {
      key: string
      label: string
      type: "number" | "text"
      fullWidth?: boolean
      value: (state: DemoNativeState) => number | string
      update: (state: DemoNativeState, value: string) => DemoNativeState
    }
  | {
      key: string
      label: string
      type: "select"
      fullWidth?: boolean
      options: readonly string[]
      value: (state: DemoNativeState) => string
      update: (state: DemoNativeState, value: string) => DemoNativeState
    }

type DemoNativeFieldSection = {
  compact?: boolean
  fields: readonly DemoNativeField[]
  title: string
}

const demoPermissionNames = [
  "notifications",
  "camera",
  "location",
  "contacts",
  "biometrics",
] as const satisfies readonly DemoPermissionName[]

const demoNativeFieldSections: readonly DemoNativeFieldSection[] = [
  {
    title: "App and Device",
    fields: [
      {
        key: "app.version",
        label: "App version",
        type: "text",
        value: (state) => state.app.version,
        update: (state, value) => ({
          ...state,
          app: { ...state.app, version: value },
        }),
      },
      {
        key: "app.buildNumber",
        label: "Build number",
        type: "text",
        value: (state) => state.app.buildNumber,
        update: (state, value) => ({
          ...state,
          app: { ...state.app, buildNumber: value },
        }),
      },
      {
        key: "app.environment",
        label: "Environment",
        type: "select",
        options: ["development", "staging", "production"],
        value: (state) => state.app.environment,
        update: (state, value) => ({
          ...state,
          app: {
            ...state.app,
            environment: value as DemoNativeState["app"]["environment"],
          },
        }),
      },
      {
        key: "device.theme",
        label: "Theme",
        type: "select",
        options: ["system", "light", "dark"],
        value: (state) => state.device.theme,
        update: (state, value) => ({
          ...state,
          device: {
            ...state.device,
            theme: value as DemoNativeState["device"]["theme"],
          },
        }),
      },
      {
        key: "device.id",
        label: "Device ID",
        type: "text",
        value: (state) => state.device.id,
        update: (state, value) => ({
          ...state,
          device: { ...state.device, id: value },
        }),
      },
      {
        key: "device.locale",
        label: "Locale",
        type: "text",
        value: (state) => state.device.locale,
        update: (state, value) => ({
          ...state,
          device: { ...state.device, locale: value },
        }),
      },
      {
        key: "device.timezone",
        label: "Timezone",
        type: "text",
        value: (state) => state.device.timezone,
        update: (state, value) => ({
          ...state,
          device: { ...state.device, timezone: value },
        }),
      },
      {
        key: "device.batteryLevel",
        label: "Battery",
        type: "number",
        value: (state) => state.device.batteryLevel,
        update: (state, value) => ({
          ...state,
          device: { ...state.device, batteryLevel: Number(value) },
        }),
      },
    ],
  },
  {
    title: "Platform Profiles",
    fields: [
      {
        key: "platforms.android.osVersion",
        label: "Android OS",
        type: "text",
        value: (state) => state.platforms.android.osVersion,
        update: (state, value) => ({
          ...state,
          platforms: {
            ...state.platforms,
            android: { ...state.platforms.android, osVersion: value },
          },
        }),
      },
      {
        key: "platforms.android.modelName",
        label: "Android model",
        type: "text",
        value: (state) => state.platforms.android.modelName,
        update: (state, value) => ({
          ...state,
          platforms: {
            ...state.platforms,
            android: { ...state.platforms.android, modelName: value },
          },
        }),
      },
      {
        key: "platforms.ios.osVersion",
        label: "iOS version",
        type: "text",
        value: (state) => state.platforms.ios.osVersion,
        update: (state, value) => ({
          ...state,
          platforms: {
            ...state.platforms,
            ios: { ...state.platforms.ios, osVersion: value },
          },
        }),
      },
      {
        key: "platforms.ios.modelName",
        label: "iOS model",
        type: "text",
        value: (state) => state.platforms.ios.modelName,
        update: (state, value) => ({
          ...state,
          platforms: {
            ...state.platforms,
            ios: { ...state.platforms.ios, modelName: value },
          },
        }),
      },
    ],
  },
  {
    compact: true,
    title: "Native State",
    fields: [
      ...demoPermissionNames.map(
        (permissionName): DemoNativeField => ({
          key: `permissions.${permissionName}`,
          label: permissionName,
          type: "boolean",
          value: (state) => state.permissions[permissionName],
          update: (state, value) => ({
            ...state,
            permissions: {
              ...state.permissions,
              [permissionName]: value,
            },
          }),
        }),
      ),
      {
        key: "network.online",
        label: "network online",
        type: "boolean",
        value: (state) => state.network.online,
        update: (state, value) => ({
          ...state,
          network: {
            ...state.network,
            online: value,
            type: value
              ? state.network.type === "offline"
                ? "wifi"
                : state.network.type
              : "offline",
          },
        }),
      },
      {
        key: "account.signedIn",
        label: "signed in",
        type: "boolean",
        value: (state) => state.account.signedIn,
        update: (state, value) => ({
          ...state,
          account: { ...state.account, signedIn: value },
        }),
      },
      {
        key: "account.biometricsEnrolled",
        label: "biometrics enrolled",
        type: "boolean",
        value: (state) => state.account.biometricsEnrolled,
        update: (state, value) => ({
          ...state,
          account: { ...state.account, biometricsEnrolled: value },
        }),
      },
      {
        key: "push.enabled",
        label: "push enabled",
        type: "boolean",
        value: (state) => state.push.enabled,
        update: (state, value) => ({
          ...state,
          push: { ...state.push, enabled: value },
        }),
      },
      {
        key: "checkout.canPay",
        label: "checkout can pay",
        type: "boolean",
        value: (state) => state.checkout.canPay,
        update: (state, value) => ({
          ...state,
          checkout: { ...state.checkout, canPay: value },
        }),
      },
    ],
  },
  {
    title: "Network, Sync, and Tokens",
    fields: [
      {
        key: "network.type",
        label: "Network type",
        type: "select",
        options: ["wifi", "cellular", "offline"],
        value: (state) => state.network.type,
        update: (state, value) => ({
          ...state,
          network: {
            ...state.network,
            type: value as DemoNativeState["network"]["type"],
            online: value !== "offline",
          },
        }),
      },
      {
        key: "sync.queuedRecords",
        label: "Queued records",
        type: "number",
        value: (state) => state.sync.queuedRecords,
        update: (state, value) => ({
          ...state,
          sync: { ...state.sync, queuedRecords: Number(value) },
        }),
      },
      {
        fullWidth: true,
        key: "push.token",
        label: "Push token",
        type: "text",
        value: (state) => state.push.token,
        update: (state, value) => ({
          ...state,
          push: { ...state.push, token: value },
        }),
      },
      {
        key: "checkout.lastTransactionId",
        label: "Last transaction",
        type: "text",
        value: (state) => state.checkout.lastTransactionId,
        update: (state, value) => ({
          ...state,
          checkout: {
            ...state.checkout,
            lastTransactionId: value,
          },
        }),
      },
    ],
  },
]

function DemoNativeConfigField({
  field,
  nativeState,
  setNativeState,
}: {
  field: DemoNativeField
  nativeState: DemoNativeState
  setNativeState: (updater: (current: DemoNativeState) => DemoNativeState) => void
}) {
  if (field.type === "boolean") {
    return (
      <Toggle
        checked={field.value(nativeState)}
        label={field.label}
        onChange={(value) =>
          setNativeState((current) => field.update(current, value))
        }
      />
    )
  }

  if (field.type === "select") {
    return (
      <DemoSelect
        label={field.label}
        options={field.options}
        value={field.value(nativeState)}
        onChange={(value) =>
          setNativeState((current) => field.update(current, value))
        }
      />
    )
  }

  return (
    <DemoField
      label={field.label}
      type={field.type}
      value={field.value(nativeState)}
      onChange={(value) =>
        setNativeState((current) => field.update(current, value))
      }
    />
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

      {demoNativeFieldSections.map((section) => (
        <section className="demo-section" key={section.title}>
          <h3>{section.title}</h3>
          <div
            className={`demo-native-grid ${
              section.compact ? "demo-native-grid-compact" : ""
            }`}>
            {section.fields.map((field) => (
              <div
                className={field.fullWidth ? "demo-native-grid-full" : ""}
                key={field.key}>
                <DemoNativeConfigField
                  field={field}
                  nativeState={nativeState}
                  setNativeState={setNativeState}
                />
              </div>
            ))}
          </div>
        </section>
      ))}

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
