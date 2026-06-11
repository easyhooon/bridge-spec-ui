import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { useState } from "react"
import { BridgeSpecUi } from "./components/BridgeSpecUi"
import { demoBridges, demoRunner } from "./demo/bridges"
import type { BridgePlatform } from "./core"
import "./styles.css"

function DemoApp() {
  const [platform, setPlatform] = useState<BridgePlatform>("android")

  return (
    <BridgeSpecUi
      title="BridgeSpec UI"
      version="0.0.0"
      brandName="BridgeSpec UI"
      description="Documentation and testing components for WebView bridge APIs."
      bridges={demoBridges}
      platform={platform}
      platformOptions={[
        { label: "Android WebView", value: "android" },
        { label: "iOS WebView", value: "ios" },
      ]}
      runBridge={demoRunner}
      onPlatformChange={setPlatform}
      tagOrder={["App Info / Version", "Deep Link", "Sync Events"]}
      renderEnvironmentPanel={({ selectedPlatform, visibleBridges }) => (
        <div className="bsu-demo-panel">
          <strong>Mock native: {selectedPlatform}</strong>
          <span>{visibleBridges.length} visible bridge specs</span>
        </div>
      )}
    />
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DemoApp />
  </StrictMode>,
)
