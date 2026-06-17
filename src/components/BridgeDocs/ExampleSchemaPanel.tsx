import { useState } from "react"
import type { SchemaModel, SchemaPanelView } from "./componentTypes"
import { SchemaModelPanel } from "./SchemaTree"

export function ExampleSchemaPanel({
  exampleContent,
  panelName,
  schemaModel,
}: {
  exampleContent: string
  panelName: "request" | "response"
  schemaModel: SchemaModel
}) {
  const [view, setView] = useState<SchemaPanelView>("example")

  return (
    <div
      className="bd-example-schema"
      data-bridge-example-schema-panel={panelName}
    >
      <div className="bd-example-schema-tabs">
        <button
          type="button"
          className={view === "example" ? "bd-tab-active" : ""}
          onClick={() => setView("example")}
        >
          Example Value
        </button>
        <span aria-hidden="true" />
        <button
          type="button"
          className={view === "schema" ? "bd-tab-active" : ""}
          onClick={() => setView("schema")}
        >
          Schema
        </button>
      </div>

      {view === "example" ? (
        <pre className="bd-code">{exampleContent}</pre>
      ) : (
        <SchemaModelPanel defaultOpen model={schemaModel} />
      )}
    </div>
  )
}
