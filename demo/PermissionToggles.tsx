import type { DemoNativeState, DemoPermissionName } from "./bridges"
import { Toggle } from "./controls"

export function PermissionToggles({
  nativeState,
  setNativeState,
}: {
  nativeState: DemoNativeState
  setNativeState: (
    updater: (current: DemoNativeState) => DemoNativeState,
  ) => void
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
