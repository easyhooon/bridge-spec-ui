import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { DemoApp } from "./DemoApp"
import "../src/styles.css"

const root = document.getElementById("root")

if (!root) {
  throw new Error("BridgeDocs demo root element was not found.")
}

createRoot(root).render(
  <StrictMode>
    <DemoApp />
  </StrictMode>,
)
