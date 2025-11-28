import { useEffect, useMemo, useRef, useState } from "react"
import { SCORE_API_BASE, SCORE_API_KEY } from "../utils/constants"

type MetricKey = "pdds" | "directional" | "price"
type ModelKey = "RNN" | "LSTM" | "GRU"

const MODEL_NAME_MAP: Record<ModelKey, string> = {
  RNN: "Kryos",
  LSTM: "Helion",
  GRU: "Astrax"
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
          const typedModelKey = (modelKey.split("_")[0] as ModelKey)
          if (!Object.prototype.hasOwnProperty.call(MODEL_NAME_MAP, typedModelKey)) return
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
        if (metricKey === "pdds") {
          console.log("PDDS score API response", payload)
        }
        const rows = parseMetricResponse(payload)

        setMetricsState((prev) => ({
          ...prev,
          [metricKey]: { ...prev[metricKey], rows, loading: false, error: null }
        }))
      } catch (error: unknown) {
        if (controller.signal.aborted) return
        console.error(`Error fetching ${metricKey} data`, error)
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
      (Object.entries(MODEL_NAME_MAP) as [ModelKey, string][]).map(([key, label]) => (
        <div
          key={key}
          className="rounded-full border border-[#45FFAE]/40 px-3 py-1 text-xs font-semibold text-[#45FFAE] transition-colors"
        >
          {label} ({key})
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
        <h1 className="font-urbanist text-4xl font-semibold text-[#45FFAE]">Mathematical Accuracy</h1>
        <p className="font-urbanist text-sm text-[#BFBFBF]">
          View the latest scoring breakdown across Kryos, Helion, and Astrax.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">{modelLegend}</div>

      <div className="flex flex-wrap gap-3">
        {(Object.entries(METRIC_CONFIGS) as [MetricKey, { label: string }][]).map(
          ([metricKey, config]) => (
            <button
              key={metricKey}
              onClick={() => setSelectedMetric(metricKey)}
              className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                selectedMetric === metricKey
                  ? "border-[#45FFAE] bg-[#45FFAE]/10 text-[#45FFAE]"
                  : "border-[#2A2A2A] bg-transparent text-[#D0D0D0] hover:border-[#45FFAE]/80 hover:text-[#45FFAE]"
              }`}
            >
              {config.label}
            </button>
          )
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
            No data available yet.
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.2em] text-[#7E7E7E]">
                  <th className="py-3 pr-4">Pair</th>
                  <th className="py-3 pr-4">Resolution</th>
                  <th className="py-3 pr-4">Timestamp</th>
                  <th className="py-3 pr-4">Kryos</th>
                  <th className="py-3 pr-4">Helion</th>
                  <th className="py-3 pr-4">Astrax</th>
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

