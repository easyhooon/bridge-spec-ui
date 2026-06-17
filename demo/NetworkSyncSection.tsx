import { DemoField, DemoSelect } from "./controls"
import type { NativeStateSectionProps } from "./nativeStateSectionTypes"

export function NetworkSyncSection({
  nativeState,
  setNativeState,
}: NativeStateSectionProps) {
  return (
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
  )
}
