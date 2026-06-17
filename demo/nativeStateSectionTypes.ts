import type { DemoNativeState } from "./bridges"

export type NativeStateUpdater = (
  updater: (current: DemoNativeState) => DemoNativeState,
) => void

export type NativeStateSectionProps = {
  nativeState: DemoNativeState
  setNativeState: NativeStateUpdater
}
