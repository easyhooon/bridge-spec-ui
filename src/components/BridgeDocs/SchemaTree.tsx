import { useState } from "react"
import type { ReactNode } from "react"
import type { SchemaModel } from "./componentTypes"
import {
  getNonNullAnyOfValues,
  getSchemaEnumValues,
  getSchemaProperties,
  getSchemaRequired,
  getSchemaTypeLabel,
  hasSchemaChildren,
  isJsonSchemaRecord,
  isNullableSchema,
} from "./schemaInspection"
import { SchemaChevronIcon } from "./primitives"

function SchemaTypeLabel({ children }: { children: string }) {
  return <span className="bd-schema-type">{children}</span>
}

function SchemaTreeLine({
  children,
  level,
}: {
  children: ReactNode
  level: number
}) {
  return (
    <div className="bd-schema-line" style={{ paddingLeft: level * 20 }}>
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
        <span className="bd-schema-name">
          {name}
          {showRequiredMark && <span className="bd-required">*</span>}
        </span>
        {expandable && (
          <button
            type="button"
            aria-expanded={isExpanded}
            className="bd-schema-toggle"
            onClick={() => toggleNode(nodeKey)}
          >
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
                <span className="bd-schema-name">Enum</span>
                <SchemaTypeLabel>array</SchemaTypeLabel>
              </SchemaTreeLine>
              {enumValues.map((value, index) => (
                <SchemaTreeLine
                  key={`${index}-${String(value)}`}
                  level={level + 2}
                >
                  <span className="bd-schema-enum">
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
    <div className="bd-schema-tree">
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

export function SchemaModelPanel({
  defaultOpen = false,
  model,
}: {
  defaultOpen?: boolean
  model: SchemaModel
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="bd-schema-model" data-bridge-schema-model={model.name}>
      <div className="bd-schema-model-header">
        <span className="bd-schema-model-name">{model.name}</span>
        <button
          type="button"
          aria-expanded={isOpen}
          className="bd-schema-toggle"
          onClick={() => setIsOpen((current) => !current)}
        >
          <SchemaChevronIcon isOpen={isOpen} />
          <span>{isOpen ? "Collapse all" : "Expand all"}</span>
        </button>
        <SchemaTypeLabel>object</SchemaTypeLabel>
      </div>
      {isOpen && <SchemaTree model={model} />}
    </div>
  )
}
