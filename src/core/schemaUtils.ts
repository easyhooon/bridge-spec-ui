import { z } from "zod"
import type { AnyBridgeSpec, BridgeTryResult } from "./types"

type JsonObject = Record<string, unknown>

export function formatJson(value: unknown): string {
  if (value === undefined) return ""
  return JSON.stringify(value, null, 2)
}

export function parseJsonInput(raw: string): unknown {
  const trimmed = raw.trim()
  if (!trimmed) return undefined
  return JSON.parse(trimmed)
}

function sanitizeSchemaForDocs(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeSchemaForDocs)
  }

  if (!value || typeof value !== "object") {
    return value
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== "$schema" && key !== "additionalProperties")
      .map(([key, nestedValue]) => [key, sanitizeSchemaForDocs(nestedValue)]),
  )
}

export function schemaToJson(schema?: z.ZodType): unknown {
  if (!schema) return undefined
  return sanitizeSchemaForDocs(z.toJSONSchema(schema))
}

export function bridgeRequestSchemaToJson(spec: AnyBridgeSpec): unknown {
  const properties: JsonObject = {
    type: { type: "string", const: "request" },
    handlerName: { type: "string", const: spec.handlerName },
    requestId: { type: "string" },
  }
  const required = ["type", "handlerName", "requestId"]

  if (spec.dataSchema) {
    properties.data = schemaToJson(spec.dataSchema)
    required.push("data")
  }

  return {
    type: "object",
    properties,
    required,
  }
}

export function bridgeResponseSchemaToJson(spec: AnyBridgeSpec): unknown {
  const properties: JsonObject = {
    type: { type: "string", const: "response" },
    handlerName: { type: "string", const: spec.handlerName },
    requestId: { type: "string" },
    isSuccess: { type: "boolean" },
  }
  const required = ["type", "handlerName", "requestId", "isSuccess"]

  if (spec.resultSchema) {
    properties.result = schemaToJson(spec.resultSchema)
    required.push("result")
  }

  return {
    type: "object",
    properties,
    required,
  }
}

export function getInitialExample(spec: AnyBridgeSpec): string {
  const firstExample = spec.examples.find(
    (example) => example.data !== undefined,
  )
  return formatJson(firstExample?.data)
}

export function validateSpecData(spec: AnyBridgeSpec, data: unknown): unknown {
  if (!spec.dataSchema) return undefined
  return spec.dataSchema.parse(data)
}

export function getBridgeTags(specs: AnyBridgeSpec[]): string[] {
  return Array.from(new Set(specs.flatMap((spec) => spec.tags))).sort((a, b) =>
    a.localeCompare(b),
  )
}

export function getExampleResponse(spec: AnyBridgeSpec): unknown {
  return spec.examples.find((example) => example.response !== undefined)
    ?.response
}

export function getMockOnlyResult(spec: AnyBridgeSpec): BridgeTryResult {
  return {
    ok: true,
    message:
      spec.tryOut?.reason ??
      "Returned the example response without executing a bridge handler.",
    payload: getExampleResponse(spec) ?? null,
  }
}
