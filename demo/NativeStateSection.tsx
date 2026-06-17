import { Toggle } from "./controls"
import type { NativeStateSectionProps } from "./nativeStateSectionTypes"
import { PermissionToggles } from "./PermissionToggles"

export function NativeStateSection({
  nativeState,
  setNativeState,
}: NativeStateSectionProps) {
  return (
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
                type: checked
                  ? current.network.type === "offline"
                    ? "wifi"
                    : current.network.type
                  : "offline",
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
  )
}
