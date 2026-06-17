import { DemoField } from "./controls"
import type { NativeStateSectionProps } from "./nativeStateSectionTypes"

export function PlatformProfilesSection({
  nativeState,
  setNativeState,
}: NativeStateSectionProps) {
  return (
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
  )
}
