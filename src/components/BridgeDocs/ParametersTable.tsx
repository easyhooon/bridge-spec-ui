import type { AnyBridgeSpec, BridgePlatform } from "../../core/types"
import { defaultOperationTheme, formatPlatformLabel } from "./labels"

export function ParametersTable({
  platform,
  spec,
}: {
  platform: BridgePlatform
  spec: AnyBridgeSpec
}) {
  return (
    <div>
      <h3>Parameters</h3>
      <div className="bd-table-wrap">
        <table className="bd-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>direction</td>
              <td>{defaultOperationTheme[spec.direction].label}</td>
            </tr>
            <tr>
              <td>platform</td>
              <td>
                selected: <strong>{formatPlatformLabel(platform)}</strong>,
                supports: {spec.platforms.map(formatPlatformLabel).join(", ")}
              </td>
            </tr>
            <tr>
              <td>tags</td>
              <td>{spec.tags.join(", ")}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
