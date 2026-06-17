import {
  bridgeRequestSchemaToJson,
  bridgeResponseSchemaToJson,
} from "../../core/schemaUtils"
import type { AnyBridgeSpec } from "../../core/types"
import type { SchemaModel } from "./componentTypes"

export function buildSchemaModels(specs: AnyBridgeSpec[]): SchemaModel[] {
  return specs.flatMap((spec) => {
    const models: SchemaModel[] = []

    if (spec.dataSchema) {
      models.push({
        name: `${spec.handlerName}Request`,
        schema: bridgeRequestSchemaToJson(spec),
      })
    }

    if (spec.resultSchema) {
      models.push({
        name: `${spec.handlerName}Response`,
        schema: bridgeResponseSchemaToJson(spec),
      })
    }

    return models
  })
}
