import type { SchemaModel } from "./componentTypes"
import { SchemaModelPanel } from "./SchemaTree"

export function SchemasSection({ models }: { models: SchemaModel[] }) {
  return (
    <section className="bd-schemas">
      <div className="bd-schemas-header">
        <h2>Schemas</h2>
      </div>

      <div className="bd-schemas-body">
        {models.map((model) => (
          <SchemaModelPanel key={model.name} model={model} />
        ))}
      </div>
    </section>
  )
}
