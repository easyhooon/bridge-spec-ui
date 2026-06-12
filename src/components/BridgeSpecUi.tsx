import { useEffect, useMemo, useState } from "react"
import {
  bridgeRequestSchemaToJson,
  bridgeResponseSchemaToJson,
  formatJson,
  getInitialExample,
  parseJsonInput,
  validateSpecData,
} from "../core/schemaUtils"
import type {
  AnyBridgeSpec,
  BridgeDirection,
  BridgePlatform,
  BridgeRunner,
  BridgeSpecUiProps,
  BridgeTryResult,
} from "../core/types"
import type { ReactNode } from "react"

type DirectionFilter = BridgeDirection | "all"

type TryState = {
  rawInput: string
  result?: BridgeTryResult
  isRunning: boolean
  isEnabled: boolean
}

type SchemaModel = {
  name: string
  schema: unknown
}

type SchemaPanelView = "example" | "schema"

type SelectOption = {
  label: string
  value: string
}

const defaultDirectionLabels: Record<DirectionFilter, string> = {
  all: "All bridge messages",
  "web-to-app": "Web -> App",
  "app-to-web": "App -> Web",
}

const defaultOperationTheme: Record<
  BridgeDirection,
  {
    badge: string
    label: string
  }
> = {
  "web-to-app": {
    badge: "Web -> App",
    label: "Web calls App",
  },
  "app-to-web": {
    badge: "App -> Web",
    label: "App dispatches Web",
  },
}

function formatPlatformLabel(platform: BridgePlatform) {
  if (platform === "android") return "Android"
  if (platform === "ios") return "iOS"
  if (platform === "web") return "Web"
  return platform
}

function getPlatformRestrictionLabel(platforms: AnyBridgeSpec["platforms"]) {
  const supportsAndroid = platforms.includes("android")
  const supportsIos = platforms.includes("ios")

  if (supportsAndroid && !supportsIos) return "Android Only"
  if (supportsIos && !supportsAndroid) return "iOS Only"
  return null
}

function getBridgeResponseSuccess(payload: unknown): boolean | null {
  if (!payload || typeof payload !== "object" || !("isSuccess" in payload)) {
    return null
  }

  const isSuccess = (payload as { isSuccess?: unknown }).isSuccess
  return typeof isSuccess === "boolean" ? isSuccess : null
}

function getBridgeRequestExample(spec: AnyBridgeSpec) {
  const exampleData = spec.examples.find(
    (example) => example.data !== undefined,
  )?.data
  const request: {
    type: "request"
    handlerName: string
    requestId: string
    data?: unknown
  } = {
    type: "request",
    handlerName: spec.handlerName,
    requestId: "530fa7eb-ffd4-47d1-86d1-06787d66b9c5",
  }

  if (exampleData !== undefined) {
    request.data = exampleData
  }

  return request
}

function getBridgeResponseExample(spec: AnyBridgeSpec) {
  const exampleResponse = spec.examples.find(
    (example) => example.response !== undefined,
  )?.response

  if (exampleResponse === undefined) {
    return undefined
  }

  return {
    type: "response",
    handlerName: spec.handlerName,
    requestId: "530fa7eb-ffd4-47d1-86d1-06787d66b9c5",
    isSuccess: true,
    result: exampleResponse,
  }
}

function getBridgeResponseExampleContent(spec: AnyBridgeSpec) {
  const example = getBridgeResponseExample(spec)

  if (example === undefined) {
    return "No response example. Source code defines result as unknown."
  }

  return formatJson(example)
}

function SelectField({
  className = "",
  onChange,
  options,
  value,
}: {
  className?: string
  onChange: (value: string) => void
  options: SelectOption[]
  value: string
}) {
  return (
    <span className={`bsu-select-field ${className}`}>
      <select
        className="bsu-select-native"
        value={value}
        onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </span>
  )
}

function OperationMethod({ direction }: { direction: BridgeDirection }) {
  return (
    <span className={`bsu-method bsu-method-${direction}`}>
      {defaultOperationTheme[direction].badge}
    </span>
  )
}

function ChevronIcon({
  isOpen,
  className = "bsu-chevron",
}: {
  isOpen: boolean
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={`${className} ${
        isOpen ? "bsu-chevron-open" : "bsu-chevron-closed"
      }`}>
      <span />
    </span>
  )
}

function SchemaChevronIcon({ isOpen }: { isOpen: boolean }) {
  return <ChevronIcon className="bsu-schema-chevron" isOpen={isOpen} />
}

type JsonSchemaRecord = Record<string, unknown>

function isJsonSchemaRecord(value: unknown): value is JsonSchemaRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function getSchemaArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function getSchemaProperties(schema: unknown): Record<string, unknown> {
  if (!isJsonSchemaRecord(schema) || !isJsonSchemaRecord(schema.properties)) {
    return {}
  }

  return schema.properties
}

function getSchemaRequired(schema: unknown): string[] {
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

function getNonNullAnyOfValues(schema: unknown): unknown[] {
  return getSchemaAnyOfValues(schema).filter((option) => !isNullSchema(option))
}

function isNullableSchema(schema: unknown): boolean {
  if (!isJsonSchemaRecord(schema)) return false
  if (schema.type === "null") return true
  if (Array.isArray(schema.type) && schema.type.includes("null")) return true
  return getSchemaAnyOfValues(schema).some(isNullSchema)
}

function getSchemaTypeLabel(schema: unknown): string {
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

function getSchemaEnumValues(schema: unknown): unknown[] {
  if (!isJsonSchemaRecord(schema)) return []
  return getSchemaArray(schema.enum)
}

function hasRenderableAnyOfChildren(schema: unknown): boolean {
  return getSchemaAnyOfValues(schema).some((option) =>
    hasSchemaChildren(option),
  )
}

function hasSchemaChildren(schema: unknown): boolean {
  if (!isJsonSchemaRecord(schema)) return false
  return (
    Object.keys(getSchemaProperties(schema)).length > 0 ||
    Boolean(schema.items) ||
    getSchemaEnumValues(schema).length > 0 ||
    hasRenderableAnyOfChildren(schema)
  )
}

function SchemaTypeLabel({ children }: { children: string }) {
  return <span className="bsu-schema-type">{children}</span>
}

function SchemaTreeLine({
  children,
  level,
}: {
  children: ReactNode
  level: number
}) {
  return (
    <div className="bsu-schema-line" style={{ paddingLeft: level * 20 }}>
      {children}
    </div>
  )
}

function SchemaTreeNode({
  collapsedNodes,
  isRequired = false,
  level,
  name,
  nodeKey,
  schema,
  toggleNode,
}: {
  collapsedNodes: Set<string>
  isRequired?: boolean
  level: number
  name: string
  nodeKey: string
  schema: unknown
  toggleNode: (nodeKey: string) => void
}) {
  const properties = getSchemaProperties(schema)
  const required = getSchemaRequired(schema)
  const enumValues = getSchemaEnumValues(schema)
  const anyOfValues = getNonNullAnyOfValues(schema)
  const typeLabel = getSchemaTypeLabel(schema)
  const expandable = hasSchemaChildren(schema)
  const isExpanded = expandable && !collapsedNodes.has(nodeKey)
  const showRequiredMark = isRequired && !isNullableSchema(schema)

  return (
    <div>
      <SchemaTreeLine level={level}>
        <span className="bsu-schema-name">
          {name}
          {showRequiredMark && <span className="bsu-required">*</span>}
        </span>
        {expandable && (
          <button
            type="button"
            aria-expanded={isExpanded}
            className="bsu-schema-toggle"
            onClick={() => toggleNode(nodeKey)}>
            <SchemaChevronIcon isOpen={isExpanded} />
            <span>{isExpanded ? "Collapse all" : "Expand all"}</span>
          </button>
        )}
        <SchemaTypeLabel>{typeLabel}</SchemaTypeLabel>
      </SchemaTreeLine>

      {isExpanded && (
        <div>
          {Object.entries(properties).map(([propertyName, propertySchema]) => (
            <SchemaTreeNode
              key={propertyName}
              collapsedNodes={collapsedNodes}
              isRequired={required.includes(propertyName)}
              level={level + 1}
              name={propertyName}
              nodeKey={`${nodeKey}.properties.${propertyName}`}
              schema={propertySchema}
              toggleNode={toggleNode}
            />
          ))}

          {isJsonSchemaRecord(schema) && Boolean(schema.items) && (
            <SchemaTreeNode
              collapsedNodes={collapsedNodes}
              level={level + 1}
              name="Items"
              nodeKey={`${nodeKey}.items`}
              schema={schema.items}
              toggleNode={toggleNode}
            />
          )}

          {anyOfValues.map((option, index) => {
            const optionProperties = getSchemaProperties(option)
            const optionRequired = getSchemaRequired(option)

            return (
              <div key={`anyOf-${index}`}>
                {Object.entries(optionProperties).map(
                  ([propertyName, propertySchema]) => (
                    <SchemaTreeNode
                      key={propertyName}
                      collapsedNodes={collapsedNodes}
                      isRequired={optionRequired.includes(propertyName)}
                      level={level + 1}
                      name={propertyName}
                      nodeKey={`${nodeKey}.anyOf.${index}.properties.${propertyName}`}
                      schema={propertySchema}
                      toggleNode={toggleNode}
                    />
                  ),
                )}

                {isJsonSchemaRecord(option) && Boolean(option.items) && (
                  <SchemaTreeNode
                    collapsedNodes={collapsedNodes}
                    level={level + 1}
                    name="Items"
                    nodeKey={`${nodeKey}.anyOf.${index}.items`}
                    schema={option.items}
                    toggleNode={toggleNode}
                  />
                )}
              </div>
            )
          })}

          {enumValues.length > 0 && (
            <div>
              <SchemaTreeLine level={level + 1}>
                <span className="bsu-schema-name">Enum</span>
                <SchemaTypeLabel>array</SchemaTypeLabel>
              </SchemaTreeLine>
              {enumValues.map((value, index) => (
                <SchemaTreeLine key={`${index}-${String(value)}`} level={level + 2}>
                  <span className="bsu-schema-enum">
                    #{index}={JSON.stringify(value)}
                  </span>
                </SchemaTreeLine>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SchemaTree({ model }: { model: SchemaModel }) {
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(
    () => new Set(),
  )
  const properties = getSchemaProperties(model.schema)
  const required = getSchemaRequired(model.schema)
  const toggleNode = (nodeKey: string) => {
    setCollapsedNodes((current) => {
      const next = new Set(current)
      if (next.has(nodeKey)) {
        next.delete(nodeKey)
      } else {
        next.add(nodeKey)
      }
      return next
    })
  }

  return (
    <div className="bsu-schema-tree">
      {Object.entries(properties).map(([propertyName, propertySchema]) => (
        <SchemaTreeNode
          key={propertyName}
          collapsedNodes={collapsedNodes}
          isRequired={required.includes(propertyName)}
          level={0}
          name={propertyName}
          nodeKey={`${model.name}.properties.${propertyName}`}
          schema={propertySchema}
          toggleNode={toggleNode}
        />
      ))}
    </div>
  )
}

function SchemaModelPanel({
  defaultOpen = false,
  model,
}: {
  defaultOpen?: boolean
  model: SchemaModel
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="bsu-schema-model" data-bridge-schema-model={model.name}>
      <div className="bsu-schema-model-header">
        <span className="bsu-schema-model-name">{model.name}</span>
        <button
          type="button"
          aria-expanded={isOpen}
          className="bsu-schema-toggle"
          onClick={() => setIsOpen((current) => !current)}>
          <SchemaChevronIcon isOpen={isOpen} />
          <span>{isOpen ? "Collapse all" : "Expand all"}</span>
        </button>
        <SchemaTypeLabel>object</SchemaTypeLabel>
      </div>
      {isOpen && <SchemaTree model={model} />}
    </div>
  )
}

function ExampleSchemaPanel({
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
    <div className="bsu-example-schema" data-bridge-example-schema-panel={panelName}>
      <div className="bsu-example-schema-tabs">
        <button
          type="button"
          className={view === "example" ? "bsu-tab-active" : ""}
          onClick={() => setView("example")}>
          Example Value
        </button>
        <span aria-hidden="true" />
        <button
          type="button"
          className={view === "schema" ? "bsu-tab-active" : ""}
          onClick={() => setView("schema")}>
          Schema
        </button>
      </div>

      {view === "example" ? (
        <pre className="bsu-code">{exampleContent}</pre>
      ) : (
        <SchemaModelPanel defaultOpen model={schemaModel} />
      )}
    </div>
  )
}

function buildSchemaModels(specs: AnyBridgeSpec[]): SchemaModel[] {
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

function SchemasSection({ models }: { models: SchemaModel[] }) {
  return (
    <section className="bsu-schemas">
      <div className="bsu-schemas-header">
        <h2>Schemas</h2>
      </div>

      <div className="bsu-schemas-body">
        {models.map((model) => (
          <SchemaModelPanel key={model.name} model={model} />
        ))}
      </div>
    </section>
  )
}

function ParametersTable({
  platform,
  spec,
}: {
  platform: BridgePlatform
  spec: AnyBridgeSpec
}) {
  return (
    <div>
      <h3>Parameters</h3>
      <div className="bsu-table-wrap">
        <table className="bsu-table">
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

function BridgeSpecCard({
  platform,
  runBridge,
  spec,
}: {
  platform: BridgePlatform
  runBridge: BridgeRunner
  spec: AnyBridgeSpec
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [tryState, setTryState] = useState<TryState>({
    rawInput: getInitialExample(spec),
    isRunning: false,
    isEnabled: false,
  })

  const canRunOnPlatform = spec.platforms.includes(platform)
  const canExecuteTryOut = canRunOnPlatform && spec.tryOut?.mode !== "disabled"
  const platformRestrictionLabel = getPlatformRestrictionLabel(spec.platforms)
  const requestSchemaModel = useMemo<SchemaModel>(
    () => ({
      name: `${spec.handlerName}Request`,
      schema: bridgeRequestSchemaToJson(spec),
    }),
    [spec],
  )
  const responseSchemaModel = useMemo<SchemaModel>(
    () => ({
      name: `${spec.handlerName}Response`,
      schema: bridgeResponseSchemaToJson(spec),
    }),
    [spec],
  )

  const enableTryOut = () => {
    setTryState((current) => ({
      ...current,
      isEnabled: true,
      result: undefined,
    }))
  }

  const clearTryOut = () => {
    setTryState({
      rawInput: getInitialExample(spec),
      isRunning: false,
      isEnabled: false,
    })
  }

  useEffect(() => {
    setTryState({
      rawInput: getInitialExample(spec),
      isRunning: false,
      isEnabled: false,
    })
  }, [spec])

  const runSpec = async () => {
    setTryState((current) => ({
      ...current,
      isRunning: true,
      result: undefined,
    }))

    try {
      const input = parseJsonInput(tryState.rawInput)
      const parsedData = validateSpecData(spec, input)
      const result = await runBridge({
        bridge: spec,
        data: parsedData,
        platform,
      })

      setTryState((current) => ({ ...current, isRunning: false, result }))
    } catch (error) {
      setTryState((current) => ({
        ...current,
        isRunning: false,
        result: {
          ok: false,
          message: error instanceof Error ? error.message : String(error),
        },
      }))
    }
  }

  return (
    <section className={`bsu-operation-card bsu-card-${spec.direction}`}>
      <button
        aria-label={`${defaultOperationTheme[spec.direction].badge} ${
          spec.handlerName
        } ${spec.title}${
          platformRestrictionLabel ? ` ${platformRestrictionLabel}` : ""
        }`}
        className="bsu-operation-summary"
        type="button"
        onClick={() => setIsOpen((current) => !current)}>
        <OperationMethod direction={spec.direction} />
        <span className="bsu-operation-title">
          <span>{spec.handlerName}</span>
          <span>{spec.title}</span>
          {platformRestrictionLabel && <span>{platformRestrictionLabel}</span>}
        </span>
        <ChevronIcon isOpen={isOpen} />
      </button>

      {isOpen && (
        <div className="bsu-operation-body">
          <div className="bsu-operation-head">
            <div>
              <p className="bsu-operation-heading">{spec.title}</p>
              <p className="bsu-operation-summary-text">{spec.summary}</p>
            </div>

            <div>
              {!tryState.isEnabled ? (
                <button className="bsu-secondary-button" type="button" onClick={enableTryOut}>
                  Try it out
                </button>
              ) : (
                <button className="bsu-secondary-button" type="button" onClick={clearTryOut}>
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div className="bsu-operation-sections">
            {tryState.isEnabled && (
              <div className="bsu-try-panel">
                <h3>Try it out</h3>
                {spec.tryOut && spec.tryOut.mode !== "enabled" && (
                  <div className="bsu-try-policy">
                    <span>
                      {spec.tryOut.mode === "mock-only" ? "Mock only" : "Disabled"}
                    </span>
                    {spec.tryOut.reason}
                  </div>
                )}
                <textarea
                  className="bsu-textarea"
                  value={tryState.rawInput}
                  placeholder="No payload"
                  onChange={(event) =>
                    setTryState((current) => ({
                      ...current,
                      rawInput: event.target.value,
                      result: undefined,
                    }))
                  }
                />

                <div className="bsu-try-actions">
                  <button
                    className="bsu-primary-button"
                    type="button"
                    disabled={!canExecuteTryOut || tryState.isRunning}
                    onClick={runSpec}>
                    {tryState.isRunning ? "Executing..." : "Execute"}
                  </button>
                  <button className="bsu-secondary-button" type="button" onClick={clearTryOut}>
                    Clear
                  </button>
                  {!canRunOnPlatform && (
                    <span>선택한 플랫폼에서 지원하지 않는 브릿지입니다.</span>
                  )}
                </div>

                {tryState.result && (
                  <div className="bsu-result-panel">
                    <div className="bsu-result-heading">
                      <span className={tryState.result.ok ? "bsu-result-ok" : "bsu-result-fail"}>
                        {tryState.result.ok ? "Success" : "Failed"}
                      </span>
                      {getBridgeResponseSuccess(tryState.result.payload) !== null && (
                        <span>
                          isSuccess: {String(getBridgeResponseSuccess(tryState.result.payload))}
                        </span>
                      )}
                      <span>{tryState.result.message}</span>
                    </div>
                    <pre className="bsu-code">{formatJson(tryState.result.payload)}</pre>
                  </div>
                )}
              </div>
            )}

            <ParametersTable platform={platform} spec={spec} />

            <div>
              <h3>Request body</h3>
              <ExampleSchemaPanel
                key={`${spec.handlerName}-request`}
                exampleContent={formatJson(getBridgeRequestExample(spec))}
                panelName="request"
                schemaModel={requestSchemaModel}
              />
            </div>

            <div>
              <h3>Responses</h3>
              <ExampleSchemaPanel
                key={`${spec.handlerName}-response`}
                exampleContent={getBridgeResponseExampleContent(spec)}
                panelName="response"
                schemaModel={responseSchemaModel}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function getSortedGroups(specs: AnyBridgeSpec[], tagOrder?: string[]) {
  const groups = new Map<string, AnyBridgeSpec[]>()

  specs.forEach((spec) => {
    const tag = spec.tags[0] ?? "Other"
    const current = groups.get(tag) ?? []
    current.push(spec)
    groups.set(tag, current)
  })

  return Array.from(groups.entries()).sort(([leftTag], [rightTag]) => {
    const leftIndex = tagOrder?.indexOf(leftTag) ?? -1
    const rightIndex = tagOrder?.indexOf(rightTag) ?? -1

    if (leftIndex === -1 && rightIndex === -1) {
      return leftTag.localeCompare(rightTag)
    }
    if (leftIndex === -1) return 1
    if (rightIndex === -1) return -1
    return leftIndex - rightIndex
  })
}

export function BridgeSpecUi({
  brandDescription = "Swagger-style WebView bridge documentation",
  brandName = "BridgeSpec UI",
  bridges,
  description,
  iconHref,
  onPlatformChange,
  platform,
  platformOptions,
  queryPlaceholder = "Filter by handler name, title, or summary",
  renderEnvironmentPanel,
  runBridge,
  tagOrder,
  title,
  version,
}: BridgeSpecUiProps) {
  const [direction, setDirection] = useState<DirectionFilter>("all")
  const [query, setQuery] = useState("")
  const directionOptions = useMemo(
    () =>
      Object.entries(defaultDirectionLabels).map(([value, label]) => ({
        label,
        value,
      })),
    [],
  )
  const filteredSpecs = useMemo(
    () =>
      bridges.filter((spec) => {
        const matchesDirection =
          direction === "all" || spec.direction === direction
        const normalizedQuery = query.trim().toLowerCase()
        const matchesQuery =
          !normalizedQuery ||
          spec.handlerName.toLowerCase().includes(normalizedQuery) ||
          spec.title.toLowerCase().includes(normalizedQuery) ||
          spec.summary.toLowerCase().includes(normalizedQuery)

        return matchesDirection && matchesQuery
      }),
    [bridges, direction, query],
  )
  const groupedSpecs = useMemo(
    () => getSortedGroups(filteredSpecs, tagOrder),
    [filteredSpecs, tagOrder],
  )
  const schemaModels = useMemo(() => buildSchemaModels(bridges), [bridges])

  return (
    <main className="bsu">
      <div className="bsu-topbar">
        <div className="bsu-topbar-inner">
          <div className="bsu-brand">
            {iconHref && <img src={iconHref} alt="" />}
            <div>
              <span>{brandName}</span>
              <span>{brandDescription}</span>
            </div>
          </div>

          <input
            className="bsu-search"
            value={query}
            placeholder={queryPlaceholder}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      <div className="bsu-container">
        <section className="bsu-intro">
          <div>
            <h1>{title}</h1>
            {description && <p>{description}</p>}
            {version && (
              <div className="bsu-version-row">
                <span>v{version}</span>
              </div>
            )}
          </div>

          <div className="bsu-controls">
            <label>
              Mock native
              <SelectField
                options={platformOptions}
                value={platform}
                onChange={(value) => onPlatformChange(value as BridgePlatform)}
              />
            </label>
            {renderEnvironmentPanel?.({
              selectedPlatform: platform,
              visibleBridges: filteredSpecs,
            })}
          </div>
        </section>

        <section className="bsu-direction-filter">
          <SelectField
            options={directionOptions}
            value={direction}
            onChange={(value) => setDirection(value as DirectionFilter)}
          />
        </section>

        <div className="bsu-groups">
          {groupedSpecs.map(([tag, specs]) => (
            <section key={tag}>
              <div className="bsu-tag-heading">
                <h2>{tag}</h2>
              </div>
              <div className="bsu-tag-list">
                {specs.map((spec) => (
                  <BridgeSpecCard
                    key={`${spec.direction}:${spec.handlerName}`}
                    platform={platform}
                    runBridge={runBridge}
                    spec={spec}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        <SchemasSection models={schemaModels} />
      </div>
    </main>
  )
}
