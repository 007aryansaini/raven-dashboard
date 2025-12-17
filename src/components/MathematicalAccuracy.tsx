import React, { useEffect, useMemo, useRef, useState } from "react"
import { Info } from "lucide-react"
import { SCORE_API_BASE, SCORE_API_KEY } from "../utils/constants"

type MetricKey = "pdds" | "directional" | "price"
type ModelKey = "RNN" | "LSTM" | "GRU"

const MODEL_NAME_MAP: Record<ModelKey, string> = {
  RNN: "Kryos",
  LSTM: "Helion",
  GRU: "Astrax"
}

// Reverse mapping from API model names to ModelKey (handles both old and new formats)
const API_MODEL_TO_KEY: Record<string, ModelKey> = {
  // Old format
  "RNN": "RNN",
  "LSTM": "LSTM",
  "GRU": "GRU",
  // New format
  "Kryos": "RNN",
  "Helion": "LSTM",
  "Astrax": "GRU"
}

const MODEL_DESCRIPTIONS: Record<ModelKey, string> = {
  RNN: "Forecasts prices heavily weighted on the the last price.",
  LSTM: "Forecasts prices based on pure patterns showed by the market.",
  GRU: "Forecasts prices combining both previous trends and market patterns."
}

const TEMPORAL_MODEL_PREFERENCE = {
  Astrax: "Neutral market flow, when market follows stable trends (bearish, bullish or sideways), Reliable when patterns are constant and any sudden fluctuations are also taken into account.",
  Helion: "It purely relies on pattern capturing.",
  Kryos: "Usually preferred for chaotic market when indicators going haywire, Preferred at the crime scene of black swan events or high liquidity flow. It captures changes from the most recent changes in the market and data."
}

const TEMPORAL_MODEL_PREFERENCE_FULL = `All three of these models are trained often with newer data to keep performance high and give the best forecasts. They are also trained on custom proprietary algorithms to make sure that they learn patterns prioritising the most recent ones but still learning from the old market trends.`

const METRIC_DESCRIPTIONS: Record<MetricKey, React.ReactNode> = {
  pdds: (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        Price-Derivative Directional Score (PDDS) can be extended so the raw price difference between forecast and realized drives direction scoring across multiple time states.
      </p>
      <div className="space-y-2">
        <div className="font-semibold text-[#45FFAE]">Formula:</div>
        <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg p-4 font-mono text-sm leading-relaxed overflow-x-auto">
          <div className="text-center text-white whitespace-nowrap">
            PDDS = <span className="text-[#45FFAE]">(</span>
            <span className="text-[#45FFAE]">Σ</span>
            <sub className="text-xs text-[#BFBFBF]">t,k</sub> w<sub className="text-xs text-[#BFBFBF]">k</sub> · 
            (sign_score<sub className="text-xs text-[#BFBFBF]">t,k</sub> · 
            e<sup className="text-xs text-[#BFBFBF]">-β·|e<sub>t,k</sub>|/(|ΔR<sub>t,k</sub>|+ε)</sup>) · 
            e<sup className="text-xs text-[#BFBFBF]">-λ·Σ<sub>k</sub>α<sub>k</sub>·|e<sub>t,k</sub>|/(|ΔR<sub>t,k</sub>|+ε)</sup>
            <span className="text-[#45FFAE]">)</span> / 
            <span className="text-[#45FFAE]">(</span>
            <span className="text-[#45FFAE]">Σ</span>
            <sub className="text-xs text-[#BFBFBF]">t,k</sub> w<sub className="text-xs text-[#BFBFBF]">k</sub>
            <span className="text-[#45FFAE]">)</span>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="font-semibold text-[#45FFAE]">Variables:</div>
        <ul className="space-y-1.5 text-xs leading-relaxed list-none pl-0">
          <li>• e<sub className="text-[#BFBFBF]">t,k</sub> = R<sub className="text-[#BFBFBF]">t,k</sub> - F<sub className="text-[#BFBFBF]">t,k</sub>: forecast error</li>
          <li>• ΔR<sub className="text-[#BFBFBF]">t,k</sub> = R<sub className="text-[#BFBFBF]">t,k</sub> - P<sub className="text-[#BFBFBF]">t</sub>: realized move</li>
          <li>• sign_score<sub className="text-[#BFBFBF]">t,k</sub> = 1 if forecast direction matches realized, else 0</li>
          <li>• w<sub className="text-[#BFBFBF]">k</sub>: horizon weight</li>
          <li>• α<sub className="text-[#BFBFBF]">k</sub>: trajectory weight</li>
          <li>• β, λ: sensitivity parameters</li>
          <li>• ε: small stabilizer</li>
        </ul>
      </div>
    </div>
  ),
  directional: (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        The accuracy of direction of price changes shown by actual market prices compared to direction of price changes of the forecasted prices.
      </p>
      <div className="space-y-2">
        <div className="font-semibold text-[#45FFAE]">Formula:</div>
        <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg p-4 font-mono text-sm leading-relaxed overflow-x-auto">
          <div className="text-center text-white whitespace-nowrap">
            DA = <span className="text-[#45FFAE]">(</span>1/(n-1)<span className="text-[#45FFAE]">)</span> · 
            <span className="text-[#45FFAE]">Σ</span>
            <sub className="text-xs text-[#BFBFBF]">t=2 to n</sub> 
            1<span className="text-[#45FFAE]">[</span>sign(p<sup className="text-xs text-[#BFBFBF]">pred</sup><sub className="text-xs text-[#BFBFBF]">t</sub> - p<sup className="text-xs text-[#BFBFBF]">pred</sup><sub className="text-xs text-[#BFBFBF]">t-1</sub>) = 
            sign(p<sup className="text-xs text-[#BFBFBF]">actual</sup><sub className="text-xs text-[#BFBFBF]">t</sub> - p<sup className="text-xs text-[#BFBFBF]">actual</sup><sub className="text-xs text-[#BFBFBF]">t-1</sub>)<span className="text-[#45FFAE]">]</span>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="font-semibold text-[#45FFAE]">Variables:</div>
        <ul className="space-y-1.5 text-xs leading-relaxed list-none pl-0">
          <li>• p<sup className="text-[#BFBFBF]">actual</sup><sub className="text-[#BFBFBF]">t</sub>: actual price at time (t)</li>
          <li>• p<sup className="text-[#BFBFBF]">pred</sup><sub className="text-[#BFBFBF]">t</sub>: predicted price at time (t)</li>
          <li>• sign(x): returns +1, 0, or -1</li>
          <li>• 1<span className="text-[#45FFAE]">[</span>·<span className="text-[#45FFAE]">]</span>: indicator function (1 if the condition is true, 0 otherwise)</li>
        </ul>
      </div>
    </div>
  ),
  price: (
    <p className="text-sm leading-relaxed">
      A negative price accuracy shows that the prices predicted by the model are much farther from the actual prices compared to just drawing a mean line, this can happen due to change in market trends and noise entering different time intervals.
    </p>
  )
}

const METRIC_CONFIGS: Record<MetricKey, { label: string; endpoint: string }> = {
  pdds: {
    label: "PDDS score",
    endpoint: `${SCORE_API_BASE}all_pdds`
  },
  directional: {
    label: "Directional accuracy",
    endpoint: `${SCORE_API_BASE}all_directional_acc`
  },
  price: {
    label: "Price accuracy",
    endpoint: `${SCORE_API_BASE}all_r2`
  }
}

interface MetricRow {
  exchange: string
  pair: string
  resolution: string
  timestamp: number | null
  modelValues: Record<ModelKey, number | null>
}

interface MetricState {
  rows: MetricRow[]
  loading: boolean
  error: string | null
}

const DEFAULT_METRIC_STATE: Record<MetricKey, MetricState> = {
  pdds: { rows: [], loading: true, error: null },
  directional: { rows: [], loading: true, error: null },
  price: { rows: [], loading: true, error: null }
}

const parseMetricResponse = (payload: unknown): MetricRow[] => {
  if (!payload || typeof payload !== "object") {
    return []
  }

  const rows: MetricRow[] = []

  // Preserve the exact order from the API by iterating in order
  Object.entries(payload).forEach(([exchange, pairData]) => {
    if (!pairData || typeof pairData !== "object") return

    Object.entries(pairData).forEach(([pair, resolutionData]) => {
      if (!resolutionData || typeof resolutionData !== "object") return

      Object.entries(resolutionData).forEach(([resolution, modelData]) => {
        if (!modelData || typeof modelData !== "object") return

        const modelValues: Record<ModelKey, number | null> = {
          RNN: null,
          LSTM: null,
          GRU: null
        }
        let timestamp: number | null = null

        // Extract values from each model, preserving order
        Object.entries(modelData).forEach(([modelKey, timestampData]) => {
          // Extract the first part of the model key (e.g., "Astrax" from "Astrax_Binance_AAVEUSDT_seq10_multiresolution")
          const apiModelName = modelKey.split("_")[0]
          // Map API model name to ModelKey (handles both old format: GRU/LSTM/RNN and new format: Astrax/Helion/Kryos)
          const typedModelKey = API_MODEL_TO_KEY[apiModelName]
          if (!typedModelKey || !Object.prototype.hasOwnProperty.call(MODEL_NAME_MAP, typedModelKey)) return
          if (!timestampData || typeof timestampData !== "object") return

          // Get the first (and typically only) timestamp-value pair
          const timestampEntries = Object.entries(timestampData)
          if (timestampEntries.length > 0) {
            const [timestampKey, rawValue] = timestampEntries[0]
            const numericTimestamp = Number(timestampKey)
            
            if (Number.isFinite(numericTimestamp)) {
              // Use the first valid timestamp we encounter (all models typically have the same timestamp for a resolution)
              if (timestamp === null) {
                timestamp = numericTimestamp
              }
              
              // Handle null values explicitly, but allow 0 as a valid value
              if (rawValue === null) {
                modelValues[typedModelKey] = null
              } else {
                const numericValue = Number(rawValue)
                // 0 is a valid finite number, so we check for null separately above
                modelValues[typedModelKey] = Number.isFinite(numericValue) ? numericValue : null
              }
            }
          }
        })

        rows.push({
          exchange,
          pair,
          resolution,
          timestamp,
          modelValues
        })
      })
    })
  })

  // Return rows in the exact order from the API (no sorting)
  return rows
}

const formatMetricValue = (value: number | null) => {
  if (value === null) {
    return "—"
  }

  return value.toLocaleString("en-US", {
    maximumFractionDigits: 3,
    minimumFractionDigits: value === Math.floor(value) ? 0 : 2
  })
}

const formatTimestamp = (timestamp: number | null) => {
  if (!timestamp) return "—"
  return new Date(timestamp).toLocaleString("en-US", {
    hour12: true,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric"
  })
}

// const testPddsApi = async () => {
//   try {
//     const response = await fetch(METRIC_CONFIGS.pdds.endpoint, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         api_key: SCORE_API_KEY
//       })
//     })

//     if (!response.ok) {
//       throw new Error("Failed to fetch PDDS score for testing")
//     }

//     const payload = await response.json()
//     console.log("PDDS score test response", payload)
//   } catch (error) {
//     console.error("PDDS score test error", error)
//   }
// }

// Tooltip Component
const Tooltip = ({ children, content, className = "", position = "bottom", align = "center", width = "w-80 max-w-md" }: { children: React.ReactNode; content: React.ReactNode | string; className?: string; position?: "top" | "bottom"; align?: "left" | "center" | "right"; width?: string }) => {
  const [isVisible, setIsVisible] = useState(false)

  const getAlignmentClasses = () => {
    if (align === "left") {
      return "left-0 -translate-x-0"
    } else if (align === "right") {
      return "right-0 translate-x-0"
    } else {
      return "left-1/2 -translate-x-1/2"
    }
  }

  const getArrowAlignmentClasses = () => {
    if (align === "left") {
      return "left-4"
    } else if (align === "right") {
      return "right-4"
    } else {
      return "left-1/2"
    }
  }

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute ${position === "top" ? "bottom-full mb-2" : "top-full mt-2"} ${getAlignmentClasses()} z-50 transform`}>
          <div className={`${width} rounded-lg border border-[#45FFAE]/40 bg-[#0B0B0B] px-4 py-3 text-white shadow-lg`}>
            {typeof content === 'string' ? (
              <div className="font-urbanist text-xs leading-relaxed whitespace-pre-line">{content}</div>
            ) : (
              <div className="font-urbanist">{content}</div>
            )}
            <div className={`absolute ${getArrowAlignmentClasses()} ${position === "top" ? "top-full" : "bottom-full"} ${align === "center" ? "-translate-x-1/2 transform" : ""} border-4 border-transparent ${position === "top" ? "border-t-[#45FFAE]/40" : "border-b-[#45FFAE]/40"}`}></div>
          </div>
        </div>
      )}
    </div>
  )
}

const MathematicalAccuracy = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("pdds")
  const [metricsState, setMetricsState] = useState<Record<MetricKey, MetricState>>(DEFAULT_METRIC_STATE)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [])

  // useEffect(() => {
  //   testPddsApi()
  // }, [])

  useEffect(() => {
    const controllers: Record<MetricKey, AbortController> = {
      pdds: new AbortController(),
      directional: new AbortController(),
      price: new AbortController()
    }

    const fetchMetric = async (metricKey: MetricKey) => {
      const controller = controllers[metricKey]
      setMetricsState((prev) => ({
        ...prev,
        [metricKey]: { ...prev[metricKey], loading: true, error: null }
      }))

      try {
        const response = await fetch(METRIC_CONFIGS[metricKey].endpoint, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "accept": "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            api_key: SCORE_API_KEY
          })
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch ${METRIC_CONFIGS[metricKey].label}`)
        }

        const payload = await response.json()
        const rows = parseMetricResponse(payload)

        setMetricsState((prev) => ({
          ...prev,
          [metricKey]: { ...prev[metricKey], rows, loading: false, error: null }
        }))
      } catch (error: unknown) {
        if (controller.signal.aborted) return
        setMetricsState((prev) => ({
          ...prev,
          [metricKey]: {
            ...prev[metricKey],
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : typeof error === "string"
                  ? error
                  : "Unable to load data"
          }
        }))
      }
    }

    Object.keys(METRIC_CONFIGS).forEach((metricKey) => {
      fetchMetric(metricKey as MetricKey)
    })

    return () => {
      Object.values(controllers).forEach((controller) => controller.abort())
    }
  }, [])

  const activeState = metricsState[selectedMetric]
  const selectedLabel = METRIC_CONFIGS[selectedMetric].label

  const modelLegend = useMemo(
    () =>
      (Object.entries(MODEL_NAME_MAP) as [ModelKey, string][]).map(([key, label], index) => (
        <div key={key} className="flex items-center gap-2 rounded-full border border-[#45FFAE]/40 px-3 py-1 text-xs font-semibold text-[#45FFAE] transition-colors">
          <span>{label}</span>
          <Tooltip
            content={MODEL_DESCRIPTIONS[key]}
            className="cursor-help"
            align={index === 0 ? "left" : "center"}
          >
            <Info className="h-3 w-3 text-[#45FFAE] hover:text-[#45FFAE]/80 transition-colors" />
          </Tooltip>
        </div>
      )),
    []
  )

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-full flex-col gap-6 overflow-y-auto px-4 py-8 text-white sm:px-6 lg:px-10"
      style={{
        background: `
          radial-gradient(circle at center, rgba(69, 255, 174, 0.1) 0%, rgba(0, 0, 0, 0.85) 60%, rgba(0, 0, 0, 1) 100%),
          linear-gradient(90deg, rgba(69, 255, 174, 0.05) 1px, transparent 1px),
          linear-gradient(rgba(69, 255, 174, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: "100% 100%, 60px 60px, 60px 60px",
        backgroundColor: "#000000"
      }}
    >
      <div className="flex flex-col gap-2">
        <h1 className="font-urbanist text-xl sm:text-2xl lg:text-3xl font-semibold text-[#45FFAE]">Mathematical Accuracy</h1>
        <p className="font-urbanist text-sm text-[#BFBFBF]">
          View the latest scoring breakdown across Kryos, Helion, and Astrax.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">{modelLegend}</div>
        <div className="flex items-center gap-2 rounded-full border border-[#45FFAE]/40 px-3 py-1 text-xs font-semibold text-[#45FFAE] transition-colors">
          <span>Temporal model preference</span>
          <Tooltip
            content={`Kryos: ${TEMPORAL_MODEL_PREFERENCE.Kryos}\n\nHelion: ${TEMPORAL_MODEL_PREFERENCE.Helion}\n\nAstrax: ${TEMPORAL_MODEL_PREFERENCE.Astrax}\n\n${TEMPORAL_MODEL_PREFERENCE_FULL}`}
            className="cursor-help"
            align="right"
          >
            <Info className="h-3 w-3 text-[#45FFAE] hover:text-[#45FFAE]/80 transition-colors" />
          </Tooltip>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {(Object.entries(METRIC_CONFIGS) as [MetricKey, { label: string }][]).map(
          ([metricKey, config]) => {
            const hasDescription = METRIC_DESCRIPTIONS[metricKey] !== null && METRIC_DESCRIPTIONS[metricKey] !== undefined
            const button = (
              <div key={metricKey} className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedMetric(metricKey)}
                  className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition cursor-pointer ${
                    selectedMetric === metricKey
                      ? "border-[#45FFAE] bg-[#45FFAE]/10 text-[#45FFAE]"
                      : "border-[#2A2A2A] bg-transparent text-[#D0D0D0] hover:border-[#45FFAE]/80 hover:text-[#45FFAE]"
                  }`}
                >
                  {config.label}
                </button>
                {hasDescription && (
                  <Tooltip
                    content={METRIC_DESCRIPTIONS[metricKey]}
                    className="cursor-help"
                    align={metricKey === "pdds" ? "left" : metricKey === "directional" ? "left" : "center"}
                    width={
                      metricKey === "pdds"
                        ? "w-[560px] max-w-3xl"
                        : metricKey === "directional"
                          ? "w-[520px] max-w-2xl"
                          : "w-96 max-w-lg"
                    }
                  >
                    <Info className="h-4 w-4 text-[#45FFAE] hover:text-[#45FFAE]/80 transition-colors" />
                  </Tooltip>
                )}
              </div>
            )
            
            return button
          }
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6AE39A]">
          Current view
        </div>
        <div className="text-2xl font-semibold text-white">{selectedLabel}</div>
      </div>

      <div className="rounded-3xl border border-[#2A2A2A] bg-[#0B0B0B]/90 p-4 shadow-[0_0_40px_rgba(69,255,174,0.1)]">
        {activeState.loading ? (
          <div className="flex h-[260px] items-center justify-center text-sm text-[#BFBFBF]">
            Loading {selectedLabel} data...
          </div>
        ) : activeState.error ? (
          <div className="flex h-[260px] items-center justify-center text-sm text-[#FF7D7D]">
            {activeState.error}
          </div>
        ) : activeState.rows.length === 0 ? (
          <div className="flex h-[260px] items-center justify-center text-sm text-[#BFBFBF]">
            Coming soon
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.2em] text-[#7E7E7E]">
                  <th className="py-3 pr-4">Pair</th>
                  <th className="py-3 pr-4">Resolution</th>
                  <th className="py-3 pr-4">Timestamp</th>
                  <th className="py-3 pr-4">
                    <div className="flex items-center gap-1.5">
                      <span>Kryos</span>
                      <Tooltip content={MODEL_DESCRIPTIONS.RNN} className="cursor-help inline-block" position="bottom">
                        <Info className="h-3 w-3 text-[#7E7E7E] hover:text-[#45FFAE] transition-colors" />
                      </Tooltip>
                    </div>
                  </th>
                  <th className="py-3 pr-4">
                    <div className="flex items-center gap-1.5">
                      <span>Helion</span>
                      <Tooltip content={MODEL_DESCRIPTIONS.LSTM} className="cursor-help inline-block" position="bottom">
                        <Info className="h-3 w-3 text-[#7E7E7E] hover:text-[#45FFAE] transition-colors" />
                      </Tooltip>
                    </div>
                  </th>
                  <th className="py-3 pr-4">
                    <div className="flex items-center gap-1.5">
                      <span>Astrax</span>
                      <Tooltip content={MODEL_DESCRIPTIONS.GRU} className="cursor-help inline-block" position="bottom">
                        <Info className="h-3 w-3 text-[#7E7E7E] hover:text-[#45FFAE] transition-colors" />
                      </Tooltip>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeState.rows.map((row, index) => (
                  <tr
                    key={`${row.pair}-${row.resolution}-${index}`}
                    className="border-t border-[#1F1F1F]"
                  >
                    <td className="py-4 pr-4 font-urbanist font-medium text-[#F6F6F6]">
                      {row.pair}
                    </td>
                    <td className="py-4 pr-4 text-[#BFBFBF]">{row.resolution}</td>
                    <td className="py-4 pr-4 text-[#7E7E7E]">{formatTimestamp(row.timestamp)}</td>
                    <td className="py-4 pr-4 text-[#45FFAE]">{formatMetricValue(row.modelValues.RNN)}</td>
                    <td className="py-4 pr-4 text-[#45FFAE]">{formatMetricValue(row.modelValues.LSTM)}</td>
                    <td className="py-4 pr-4 text-[#45FFAE]">{formatMetricValue(row.modelValues.GRU)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default MathematicalAccuracy

