import { useMemo, useState } from "react"
import type {
  AnyBridgeSpec,
  BridgeDocsProps,
  BridgePlatform,
} from "../../core/types"
import type { DirectionFilter } from "./componentTypes"
import { BridgeCard } from "./BridgeCard"
import { defaultDirectionLabels } from "./labels"
import { SelectField } from "./primitives"
import { buildSchemaModels } from "./schemaModels"
import { SchemasSection } from "./SchemasSection"

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

export function BridgeDocs({
  brandDescription = "Swagger-style WebView bridge documentation",
  brandName = "BridgeDocs",
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
}: BridgeDocsProps) {
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
    <main className="bd">
      <div className="bd-topbar">
        <div className="bd-topbar-inner">
          <div className="bd-brand">
            {iconHref && <img src={iconHref} alt="" />}
            <div>
              <span>{brandName}</span>
              <span>{brandDescription}</span>
            </div>
          </div>

          <input
            className="bd-search"
            value={query}
            placeholder={queryPlaceholder}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      <div className="bd-container">
        <section className="bd-intro">
          <div>
            <h1>{title}</h1>
            {description && <p>{description}</p>}
            {version && (
              <div className="bd-version-row">
                <span>v{version}</span>
              </div>
            )}
          </div>

          <div className="bd-controls">
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

        <section className="bd-direction-filter">
          <SelectField
            options={directionOptions}
            value={direction}
            onChange={(value) => setDirection(value as DirectionFilter)}
          />
        </section>

        <div className="bd-groups">
          {groupedSpecs.map(([tag, specs]) => (
            <section key={tag}>
              <div className="bd-tag-heading">
                <h2>{tag}</h2>
              </div>
              <div className="bd-tag-list">
                {specs.map((spec) => (
                  <BridgeCard
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
