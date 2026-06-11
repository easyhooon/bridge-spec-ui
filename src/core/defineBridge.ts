import type {
  BridgeDirection,
  BridgeSpec,
  DefineAppToWebBridgeInput,
  DefineBridgeInput,
  DefineWebToAppBridgeInput,
} from "./types"

const defaultPlatforms = ["android", "ios"] as const

export function defineBridge<TData = unknown, TResult = unknown>(
  input: DefineBridgeInput<TData, TResult>,
): BridgeSpec<TData, TResult> {
  const dataSchema = input.dataSchema ?? input.request
  const resultSchema = input.resultSchema ?? input.response

  return {
    handlerName: input.handlerName,
    title: input.title,
    summary: input.summary ?? input.title,
    description: input.description,
    direction: input.direction,
    tags: input.tags ?? [],
    platforms: input.platforms ?? [...defaultPlatforms],
    dataSchema,
    resultSchema,
    examples: input.examples ?? [],
    tryOut: input.tryOut,
    invoke: input.invoke,
  }
}

function defineDirectionalBridge<TData, TResult>(
  direction: BridgeDirection,
  input:
    | DefineWebToAppBridgeInput<TData, TResult>
    | DefineAppToWebBridgeInput<TData, TResult>,
) {
  return defineBridge<TData, TResult>({
    ...input,
    direction,
  })
}

export function defineWebToAppBridge<TData = unknown, TResult = unknown>(
  input: DefineWebToAppBridgeInput<TData, TResult>,
) {
  return defineDirectionalBridge("web-to-app", input)
}

export function defineAppToWebBridge<TData = unknown, TResult = unknown>(
  input: DefineAppToWebBridgeInput<TData, TResult>,
) {
  return defineDirectionalBridge("app-to-web", input)
}
