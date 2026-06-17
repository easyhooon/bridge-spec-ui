import { formatJson } from "../../core/schemaUtils"
import type { AnyBridgeSpec } from "../../core/types"

export function getBridgeRequestExample(spec: AnyBridgeSpec) {
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

export function getBridgeResponseExampleContent(spec: AnyBridgeSpec) {
  const example = getBridgeResponseExample(spec)

  if (example === undefined) {
    return "No response example. Source code defines result as unknown."
  }

  return formatJson(example)
}
