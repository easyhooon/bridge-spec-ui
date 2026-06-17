import { DemoField, DemoSelect } from "./controls"
import type { NativeStateSectionProps } from "./nativeStateSectionTypes"

export function AppDeviceSection({
  nativeState,
  setNativeState,
}: NativeStateSectionProps) {
  return (
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
  )
}
