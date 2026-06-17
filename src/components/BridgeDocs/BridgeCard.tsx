import { useEffect, useMemo, useState } from "react"
import {
  bridgeRequestSchemaToJson,
  bridgeResponseSchemaToJson,
  formatJson,
  getInitialExample,
  parseJsonInput,
  validateSpecData,
} from "../../core/schemaUtils"
import type {
  AnyBridgeSpec,
  BridgePlatform,
  BridgeRunner,
} from "../../core/types"
import type { SchemaModel, TryState } from "./componentTypes"
import { ExampleSchemaPanel } from "./ExampleSchemaPanel"
import {
  getBridgeRequestExample,
  getBridgeResponseExampleContent,
} from "./examples"
import {
  defaultOperationTheme,
  getBridgeResponseSuccess,
  getPlatformRestrictionLabel,
} from "./labels"
import { ParametersTable } from "./ParametersTable"
import { ChevronIcon, OperationMethod } from "./primitives"

export function BridgeCard({
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
    <section className={`bd-operation-card bd-card-${spec.direction}`}>
      <button
        aria-label={`${defaultOperationTheme[spec.direction].badge} ${
          spec.handlerName
        } ${spec.title}${
          platformRestrictionLabel ? ` ${platformRestrictionLabel}` : ""
        }`}
        className="bd-operation-summary"
        type="button"
        onClick={() => setIsOpen((current) => !current)}
      >
        <OperationMethod direction={spec.direction} />
        <span className="bd-operation-title">
          <span>{spec.handlerName}</span>
          <span>{spec.title}</span>
          {platformRestrictionLabel && <span>{platformRestrictionLabel}</span>}
        </span>
        <ChevronIcon isOpen={isOpen} />
      </button>

      {isOpen && (
        <div className="bd-operation-body">
          <div className="bd-operation-head">
            <div>
              <p className="bd-operation-heading">{spec.title}</p>
              <p className="bd-operation-summary-text">{spec.summary}</p>
            </div>

            <div>
              {!tryState.isEnabled ? (
                <button
                  className="bd-secondary-button"
                  type="button"
                  onClick={enableTryOut}
                >
                  Try it out
                </button>
              ) : (
                <button
                  className="bd-secondary-button"
                  type="button"
                  onClick={clearTryOut}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div className="bd-operation-sections">
            {tryState.isEnabled && (
              <div className="bd-try-panel">
                <h3>Try it out</h3>
                {spec.tryOut && spec.tryOut.mode !== "enabled" && (
                  <div className="bd-try-policy">
                    <span>
                      {spec.tryOut.mode === "mock-only"
                        ? "Mock only"
                        : "Disabled"}
                    </span>
                    {spec.tryOut.reason}
                  </div>
                )}
                <textarea
                  className="bd-textarea"
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

                <div className="bd-try-actions">
                  <button
                    className="bd-primary-button"
                    type="button"
                    disabled={!canExecuteTryOut || tryState.isRunning}
                    onClick={runSpec}
                  >
                    {tryState.isRunning ? "Executing..." : "Execute"}
                  </button>
                  <button
                    className="bd-secondary-button"
                    type="button"
                    onClick={clearTryOut}
                  >
                    Clear
                  </button>
                  {!canRunOnPlatform && (
                    <span>선택한 플랫폼에서 지원하지 않는 브릿지입니다.</span>
                  )}
                </div>

                {tryState.result && (
                  <div className="bd-result-panel">
                    <div className="bd-result-heading">
                      <span
                        className={
                          tryState.result.ok ? "bd-result-ok" : "bd-result-fail"
                        }
                      >
                        {tryState.result.ok ? "Success" : "Failed"}
                      </span>
                      {getBridgeResponseSuccess(tryState.result.payload) !==
                        null && (
                        <span>
                          isSuccess:{" "}
                          {String(
                            getBridgeResponseSuccess(tryState.result.payload),
                          )}
                        </span>
                      )}
                      <span>{tryState.result.message}</span>
                    </div>
                    <pre className="bd-code">
                      {formatJson(tryState.result.payload)}
                    </pre>
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
