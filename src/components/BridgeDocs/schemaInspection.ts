type JsonSchemaRecord = Record<string, unknown>

export function isJsonSchemaRecord(value: unknown): value is JsonSchemaRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function getSchemaArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

export function getSchemaProperties(schema: unknown): Record<string, unknown> {
  if (!isJsonSchemaRecord(schema) || !isJsonSchemaRecord(schema.properties)) {
    return {}
  }

  return schema.properties
}

export function getSchemaRequired(schema: unknown): string[] {
  if (!isJsonSchemaRecord(schema)) return []
  return getSchemaArray(schema.required).filter(
    (item): item is string => typeof item === "string",
  )
}

function inferSchemaPrimitiveType(value: unknown): string {
  if (value === null) return "null"
  if (Array.isArray(value)) return "array"
  return typeof value
}

function isNullSchema(schema: unknown): boolean {
  return isJsonSchemaRecord(schema) && schema.type === "null"
}

function getSchemaAnyOfValues(schema: unknown): unknown[] {
  if (!isJsonSchemaRecord(schema)) return []
  return getSchemaArray(schema.anyOf)
}

export function getNonNullAnyOfValues(schema: unknown): unknown[] {
  return getSchemaAnyOfValues(schema).filter((option) => !isNullSchema(option))
}

export function isNullableSchema(schema: unknown): boolean {
  if (!isJsonSchemaRecord(schema)) return false
  if (schema.type === "null") return true
  if (Array.isArray(schema.type) && schema.type.includes("null")) return true
  return getSchemaAnyOfValues(schema).some(isNullSchema)
}

export function getSchemaTypeLabel(schema: unknown): string {
  if (!isJsonSchemaRecord(schema)) return "unknown"

  const anyOf = getNonNullAnyOfValues(schema)
  if (anyOf.length > 0) {
    return anyOf.map(getSchemaTypeLabel).join(" | ")
  }

  if (schema.const !== undefined) {
    return typeof schema.const === "string"
      ? "string"
      : inferSchemaPrimitiveType(schema.const)
  }

  const enumValues = getSchemaArray(schema.enum)
  if (enumValues.length > 0) {
    return inferSchemaPrimitiveType(enumValues[0])
  }

  if (schema.type === "array") {
    return `array<${getSchemaTypeLabel(schema.items)}>`
  }

  if (Array.isArray(schema.type)) {
    const nonNullTypes = schema.type.filter((type) => type !== "null")
    if (nonNullTypes.length === 0) return "null"

    return nonNullTypes
      .map((type) =>
        type === "array"
          ? getSchemaTypeLabel({ ...schema, type })
          : String(type),
      )
      .join(" | ")
  }

  if (schema.type) return String(schema.type)
  if (Object.keys(getSchemaProperties(schema)).length > 0) return "object"
  if (schema.items) return `array<${getSchemaTypeLabel(schema.items)}>`
  return "unknown"
}

export function getSchemaEnumValues(schema: unknown): unknown[] {
  if (!isJsonSchemaRecord(schema)) return []
  return getSchemaArray(schema.enum)
}

function hasRenderableAnyOfChildren(schema: unknown): boolean {
  return getSchemaAnyOfValues(schema).some((option) =>
    hasSchemaChildren(option),
  )
}

export function hasSchemaChildren(schema: unknown): boolean {
  if (!isJsonSchemaRecord(schema)) return false
  return (
    Object.keys(getSchemaProperties(schema)).length > 0 ||
    Boolean(schema.items) ||
    getSchemaEnumValues(schema).length > 0 ||
    hasRenderableAnyOfChildren(schema)
  )
}
