import type { BridgePlatform, BridgeRunner } from "../src/core"
import type {
  DemoNativeState,
  DemoPermissionName,
  DemoSecureStorageKey,
} from "./bridges"

function getPlatformProfile(state: DemoNativeState, platform: BridgePlatform) {
  return platform === "ios" ? state.platforms.ios : state.platforms.android
}

export function createDemoRunner({
  getNativeState,
}: {
  getNativeState: () => DemoNativeState
}): BridgeRunner {
  return async ({ bridge, data, platform }) => {
    const nativeState = getNativeState()
    const platformProfile = getPlatformProfile(nativeState, platform)

    if (bridge.tryOut?.mode === "disabled") {
      return {
        ok: false,
        message: bridge.tryOut.reason ?? "This bridge is disabled.",
        payload: null,
      }
    }

    if (bridge.tryOut?.mode === "mock-only") {
      const response = bridge.examples.find(
        (example) => example.response !== undefined,
      )?.response

      return {
        ok: true,
        message: "Sample mock response returned.",
        payload: response ?? null,
      }
    }

    switch (bridge.handlerName) {
      case "getNativeAppInfo":
        return {
          ok: true,
          message: "Native app info resolved from sample state.",
          payload: {
            platform,
            appVersion: nativeState.app.version,
            buildNumber: nativeState.app.buildNumber,
            environment: nativeState.app.environment,
          },
        }
      case "getDeviceContext":
        return {
          ok: true,
          message: "Device context resolved from sample state.",
          payload: {
            deviceId: nativeState.device.id,
            modelName: platformProfile.modelName,
            osVersion: platformProfile.osVersion,
            locale: nativeState.device.locale,
            timezone: nativeState.device.timezone,
            theme: nativeState.device.theme,
            batteryLevel: nativeState.device.batteryLevel,
          },
        }
      case "getSafeAreaInsets":
        return {
          ok: true,
          message: "Safe area insets resolved from sample state.",
          payload: nativeState.device.safeAreaInsets,
        }
      case "getPermissionStatus": {
        const permissionName = (data as { name: DemoPermissionName }).name

        return {
          ok: true,
          message: "Permission state resolved from sample state.",
          payload: {
            name: permissionName,
            granted: nativeState.permissions[permissionName],
          },
        }
      }
      case "requestPermission": {
        const permissionName = (data as { name: DemoPermissionName }).name
        const granted = nativeState.permissions[permissionName]

        return {
          ok: true,
          message: granted
            ? "Sample permission request granted."
            : "Sample permission request denied.",
          payload: {
            name: permissionName,
            granted,
            reason: granted ? "GRANTED" : "DENIED",
          },
        }
      }
      case "authenticateWithBiometrics":
        return {
          ok: nativeState.permissions.biometrics,
          message:
            nativeState.permissions.biometrics &&
            nativeState.account.biometricsEnrolled
              ? "Sample biometric authentication succeeded."
              : "Sample biometric authentication failed.",
          payload: {
            authenticated:
              nativeState.permissions.biometrics &&
              nativeState.account.biometricsEnrolled,
            reason:
              nativeState.permissions.biometrics &&
              nativeState.account.biometricsEnrolled
                ? "OK"
                : "NOT_ENROLLED",
          },
        }
      case "getSecureItem": {
        const key = (data as { key: DemoSecureStorageKey }).key

        return {
          ok: true,
          message: "Secure storage value resolved from sample state.",
          payload: {
            key,
            value: nativeState.secureStorage[key],
          },
        }
      }
      case "presentNativeCheckout":
        return {
          ok: nativeState.checkout.canPay,
          message: nativeState.checkout.canPay
            ? "Sample checkout paid."
            : "Sample checkout failed.",
          payload: {
            status: nativeState.checkout.canPay ? "PAID" : "FAILED",
            transactionId: nativeState.checkout.canPay
              ? nativeState.checkout.lastTransactionId
              : null,
          },
        }
      case "syncOfflineQueue":
        return {
          ok: nativeState.network.online,
          message: nativeState.network.online
            ? "Sample offline queue synced."
            : "Sample native host is offline.",
          payload: {
            status: nativeState.network.online ? "SYNCED" : "OFFLINE",
            syncedAt: nativeState.network.online
              ? nativeState.sync.lastSyncedAt
              : null,
            recordsUploaded: nativeState.network.online
              ? nativeState.sync.queuedRecords
              : 0,
          },
        }
      case "getConnectivity":
        return {
          ok: true,
          message: "Connectivity resolved from sample state.",
          payload: nativeState.network,
        }
      case "registerPushToken":
        return {
          ok: nativeState.push.enabled,
          message: nativeState.push.enabled
            ? "Sample push token returned."
            : "Sample push registration is disabled.",
          payload: {
            token: nativeState.push.enabled ? nativeState.push.token : null,
            enabled: nativeState.push.enabled,
          },
        }
      default:
        return {
          ok: false,
          message: "No sample runner is attached to this bridge.",
          payload: data,
        }
    }
  }
}
