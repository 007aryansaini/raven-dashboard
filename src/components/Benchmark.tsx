import { useEffect, useRef } from "react"
import { Trophy, Target, Zap, Rocket, BarChart3, FileText, RefreshCw, TrendingUp, Brain, Info } from "lucide-react"

const Benchmark = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to top when component mounts
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className="relative flex min-h-full flex-col items-center gap-8 overflow-y-auto px-4 py-10 text-white sm:px-6 lg:px-10"
      style={{
        background: `
          radial-gradient(circle at center, rgba(69, 255, 174, 0.1) 0%, rgba(0, 0, 0, 0.8) 70%, rgba(0, 0, 0, 1) 100%),
          linear-gradient(90deg, rgba(69, 255, 174, 0.05) 1px, transparent 1px),
          linear-gradient(rgba(69, 255, 174, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 60px 60px, 60px 60px',
        backgroundColor: '#000000'
      }}
    >
      <div className="flex h-full w-full max-w-6xl flex-col items-center justify-start gap-8">
        
        {/* 1. Project Summary Section - First Photo */}
        <div className="flex w-full flex-col gap-6 rounded-3xl bg-[#141414] p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-[#FFD700]" />
            <h1 className="font-urbanist text-2xl font-bold leading-tight tracking-[0%] text-white sm:text-3xl">
            FT Reasoning Model
            </h1>
          </div>
          
          <p className="font-urbanist text-sm leading-relaxed tracking-[0%] text-[#D1D1D1]">
            GPU-optimized fine-tuning of GPT-OSS-20B for cryptocurrency social media analysis using Adaptive LoRA (AdaLoRA). This project demonstrates state-of-the-art parameter-efficient fine-tuning achieving <span className="font-bold text-[#45FFAE]">98.6% price prediction accuracy</span> with only <span className="font-bold text-[#45FFAE]">0.1% trainable parameters</span>.
          </p>

          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-[#FFD700]" />
            <h2 className="font-urbanist text-lg font-bold leading-tight tracking-[0%] text-white">
              Key Achievements
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {/* 98.6% Price Prediction Accuracy */}
            <div className="flex items-start gap-3 rounded-2xl bg-[#1A1A1A] p-4 border border-[#2A2A2A]">
              <Target className="h-6 w-6 text-[#45FFAE] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-urbanist text-sm font-bold leading-none tracking-[0%] text-[#45FFAE] mb-1">
                  98.6% Price Prediction Accuracy
                </div>
                <div className="font-urbanist text-xs leading-relaxed tracking-[0%] text-[#808080]">
                  Industry-leading performance on Bitcoin market predictions.
                </div>
              </div>
            </div>

            {/* 99.9% Parameter Reduction */}
            <div className="flex items-start gap-3 rounded-2xl bg-[#1A1A1A] p-4 border border-[#2A2A2A]">
              <Zap className="h-6 w-6 text-[#45FFAE] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-urbanist text-sm font-bold leading-none tracking-[0%] text-[#45FFAE] mb-1">
                  99.9% Parameter Reduction
                </div>
                <div className="font-urbanist text-xs leading-relaxed tracking-[0%] text-[#808080]">
                  Only 21M trainable parameters vs 20B base model.
                </div>
              </div>
            </div>

            {/* Production Ready */}
            <div className="flex items-start gap-3 rounded-2xl bg-[#1A1A1A] p-4 border border-[#2A2A2A]">
              <Rocket className="h-6 w-6 text-[#45FFAE] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-urbanist text-sm font-bold leading-none tracking-[0%] text-[#45FFAE] mb-1">
                  Production Ready
                </div>
                <div className="font-urbanist text-xs leading-relaxed tracking-[0%] text-[#808080]">
                  OpenAI-compatible API server with live market integration.
                </div>
              </div>
            </div>

            {/* Comprehensive Benchmarks */}
            <div className="flex items-start gap-3 rounded-2xl bg-[#1A1A1A] p-4 border border-[#2A2A2A]">
              <BarChart3 className="h-6 w-6 text-[#45FFAE] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-urbanist text-sm font-bold leading-none tracking-[0%] text-[#45FFAE] mb-1">
                  Comprehensive Benchmarks
                </div>
                <div className="font-urbanist text-xs leading-relaxed tracking-[0%] text-[#808080]">
                  BERT Score: 0.630, ROUGE-L evaluation framework.
                </div>
              </div>
            </div>

            {/* Academic Documentation */}
            <div className="flex items-start gap-3 rounded-2xl bg-[#1A1A1A] p-4 border border-[#2A2A2A]">
              <FileText className="h-6 w-6 text-[#45FFAE] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-urbanist text-sm font-bold leading-none tracking-[0%] text-[#45FFAE] mb-1">
                  Academic Documentation
                </div>
                <div className="font-urbanist text-xs leading-relaxed tracking-[0%] text-[#808080]">
                  Complete LaTeX report with 30+ pages of analysis.
                </div>
              </div>
            </div>

            {/* Real-time Processing */}
            <div className="flex items-start gap-3 rounded-2xl bg-[#1A1A1A] p-4 border border-[#2A2A2A]">
              <RefreshCw className="h-6 w-6 text-[#45FFAE] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-urbanist text-sm font-bold leading-none tracking-[0%] text-[#45FFAE] mb-1">
                  Real-time Processing
                </div>
                <div className="font-urbanist text-xs leading-relaxed tracking-[0%] text-[#808080]">
                  150+ post analysis with LunarCrush API integration.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Evaluation Results Section - Second Photo */}
        <div className="flex w-full flex-col gap-6 rounded-3xl bg-[#141414] p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <Info className="h-8 w-8 text-[#45FFAE]" />
            <h2 className="font-urbanist text-xl font-bold leading-tight tracking-[0%] text-white sm:text-2xl">
              Evaluation results
            </h2>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl bg-[#1A1A1A] p-4 border border-[#2A2A2A]">
            <div className="flex items-center justify-between py-3 border-b border-[#2A2A2A]">
              <div className="font-urbanist text-xs font-medium leading-none tracking-[0%] text-white">
                Price Direction Accuracy on Cryptocurrency Social Media Dataset
              </div>
              <div className="flex items-center gap-2">
                <div className="font-urbanist text-sm font-bold leading-none tracking-[0%] text-[#45FFAE]">
                  98.600
                </div>
                <span className="font-urbanist text-xs leading-none tracking-[0%] text-[#808080] bg-[#2A2A2A] px-2 py-1 rounded">
                  self-reported
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[#2A2A2A]">
              <div className="font-urbanist text-xs font-medium leading-none tracking-[0%] text-white">
                Galaxy Score Accuracy on Cryptocurrency Social Media Dataset
              </div>
              <div className="flex items-center gap-2">
                <div className="font-urbanist text-sm font-bold leading-none tracking-[0%] text-[#45FFAE]">
                  80.900
                </div>
                <span className="font-urbanist text-xs leading-none tracking-[0%] text-[#808080] bg-[#2A2A2A] px-2 py-1 rounded">
                  self-reported
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[#2A2A2A]">
              <div className="font-urbanist text-xs font-medium leading-none tracking-[0%] text-white">
                BERT F1 Score on Cryptocurrency Social Media Dataset
              </div>
              <div className="flex items-center gap-2">
                <div className="font-urbanist text-sm font-bold leading-none tracking-[0%] text-[#45FFAE]">
                  0.630
                </div>
                <span className="font-urbanist text-xs leading-none tracking-[0%] text-[#808080] bg-[#2A2A2A] px-2 py-1 rounded">
                  self-reported
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[#2A2A2A]">
              <div className="font-urbanist text-xs font-medium leading-none tracking-[0%] text-white">
                BERT F1 Score on Crypto Reasoning Benchmark
              </div>
              <div className="flex items-center gap-2">
                <div className="font-urbanist text-sm font-bold leading-none tracking-[0%] text-[#45FFAE]">
                  0.630
                </div>
                <span className="font-urbanist text-xs leading-none tracking-[0%] text-[#808080] bg-[#2A2A2A] px-2 py-1 rounded">
                  self-reported
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="font-urbanist text-xs font-medium leading-none tracking-[0%] text-white">
                ROUGE-L F1 Score on Crypto Reasoning Benchmark
              </div>
              <div className="flex items-center gap-2">
                <div className="font-urbanist text-sm font-bold leading-none tracking-[0%] text-[#45FFAE]">
                  0.115
                </div>
                <span className="font-urbanist text-xs leading-none tracking-[0%] text-[#808080] bg-[#2A2A2A] px-2 py-1 rounded">
                  self-reported
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Performance Metrics Section - Third Photo */}
        <div className="flex w-full flex-col gap-6 rounded-3xl bg-[#141414] p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-[#45FFAE]" />
            <h2 className="font-urbanist text-xl font-bold leading-tight tracking-[0%] text-white sm:text-2xl">
              Performance Metrics
            </h2>
          </div>

          {/* Market Prediction Accuracy */}
          <div className="flex flex-col gap-4 rounded-2xl bg-[#1A1A1A] p-4 border border-[#2A2A2A]">
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-[#45FFAE]" />
              <h3 className="font-urbanist text-base font-semibold leading-none tracking-[0%] text-white">
                Market Prediction Accuracy
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#2A2A2A]">
                    <th className="text-left py-3 px-4 font-urbanist text-xs font-medium leading-none tracking-[0%] text-[#808080]">Metric</th>
                    <th className="text-left py-3 px-4 font-urbanist text-xs font-medium leading-none tracking-[0%] text-[#808080]">Result</th>
                    <th className="text-left py-3 px-4 font-urbanist text-xs font-medium leading-none tracking-[0%] text-[#808080]">Sample Size</th>
                    <th className="text-left py-3 px-4 font-urbanist text-xs font-medium leading-none tracking-[0%] text-[#808080]">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#2A2A2A]">
                    <td className="py-3 px-4 font-urbanist text-xs leading-none tracking-[0%] text-white">Price Direction</td>
                    <td className="py-3 px-4 font-urbanist text-xs font-bold leading-none tracking-[0%] text-[#45FFAE]">98.6%</td>
                    <td className="py-3 px-4 font-urbanist text-xs leading-none tracking-[0%] text-[#808080]">150 posts</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-[#45FFAE]"></div>
                        <span className="font-urbanist text-xs leading-none tracking-[0%] text-[#45FFAE]">Excellent</span>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-[#2A2A2A]">
                    <td className="py-3 px-4 font-urbanist text-xs leading-none tracking-[0%] text-white">Galaxy Score</td>
                    <td className="py-3 px-4 font-urbanist text-xs font-bold leading-none tracking-[0%] text-[#45FFAE]">80.9%</td>
                    <td className="py-3 px-4 font-urbanist text-xs leading-none tracking-[0%] text-[#808080]">150 posts</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-[#FFD700]"></div>
                        <span className="font-urbanist text-xs leading-none tracking-[0%] text-[#FFD700]">Good</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-urbanist text-xs leading-none tracking-[0%] text-white">Price Magnitude</td>
                    <td className="py-3 px-4 font-urbanist text-xs font-bold leading-none tracking-[0%] text-[#45FFAE]">94.7%</td>
                    <td className="py-3 px-4 font-urbanist text-xs leading-none tracking-[0%] text-[#808080]">Within ±1%</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-[#45FFAE]"></div>
                        <span className="font-urbanist text-xs leading-none tracking-[0%] text-[#45FFAE]">Excellent</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Semantic Quality (BERT Score) */}
          <div className="flex flex-col gap-4 rounded-2xl bg-[#1A1A1A] p-4 border border-[#2A2A2A]">
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-[#FF69B4]" />
              <h3 className="font-urbanist text-base font-semibold leading-none tracking-[0%] text-white">
                Semantic Quality (BERT Score)
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#2A2A2A]">
                    <th className="text-left py-3 px-4 font-urbanist text-xs font-medium leading-none tracking-[0%] text-[#808080]">Metric</th>
                    <th className="text-left py-3 px-4 font-urbanist text-xs font-medium leading-none tracking-[0%] text-[#808080]">Score</th>
                    <th className="text-left py-3 px-4 font-urbanist text-xs font-medium leading-none tracking-[0%] text-[#808080]">Quality Level</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#2A2A2A]">
                    <td className="py-3 px-4 font-urbanist text-xs leading-none tracking-[0%] text-white">F1 Score</td>
                    <td className="py-3 px-4 font-urbanist text-xs font-bold leading-none tracking-[0%] text-[#45FFAE]">0.630</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-[#FFD700]"></div>
                        <span className="font-urbanist text-xs leading-none tracking-[0%] text-[#FFD700]">Good</span>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-[#2A2A2A]">
                    <td className="py-3 px-4 font-urbanist text-xs leading-none tracking-[0%] text-white">Precision</td>
                    <td className="py-3 px-4 font-urbanist text-xs font-bold leading-none tracking-[0%] text-[#45FFAE]">0.585</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-[#FFD700]"></div>
                        <span className="font-urbanist text-xs leading-none tracking-[0%] text-[#FFD700]">Good</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-urbanist text-xs leading-none tracking-[0%] text-white">Recall</td>
                    <td className="py-3 px-4 font-urbanist text-xs font-bold leading-none tracking-[0%] text-[#45FFAE]">0.681</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-[#FFD700]"></div>
                        <span className="font-urbanist text-xs leading-none tracking-[0%] text-[#FFD700]">Good</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 4. Performance Benchmarks Section - Fourth/Sixth Photo */}
        <div className="flex w-full flex-col gap-6 rounded-3xl bg-[#141414] p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-[#FFD700]" />
            <h2 className="font-urbanist text-xl font-bold leading-tight tracking-[0%] text-white sm:text-2xl">
              Performance Benchmarks
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#2A2A2A] bg-[#1F1F1F]">
                  <th className="text-left py-4 px-4 font-urbanist text-xs font-semibold leading-none tracking-[0%] text-white">Test Category</th>
                  <th className="text-left py-4 px-4 font-urbanist text-xs font-semibold leading-none tracking-[0%] text-white">Our Model</th>
                  <th className="text-left py-4 px-4 font-urbanist text-xs font-semibold leading-none tracking-[0%] text-white">GPT-4 Baseline</th>
                  <th className="text-left py-4 px-4 font-urbanist text-xs font-semibold leading-none tracking-[0%] text-white">Improvement</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#2A2A2A]">
                  <td className="py-4 px-4 font-urbanist text-xs leading-none tracking-[0%] text-white">Price Direction</td>
                  <td className="py-4 px-4 font-urbanist text-xs font-bold leading-none tracking-[0%] text-[#45FFAE]">98.6%</td>
                  <td className="py-4 px-4 font-urbanist text-xs leading-none tracking-[0%] text-[#808080]">78.4%</td>
                  <td className="py-4 px-4 font-urbanist text-xs font-bold leading-none tracking-[0%] text-[#45FFAE]">+20.2%</td>
                </tr>
                <tr className="border-b border-[#2A2A2A]">
                  <td className="py-4 px-4 font-urbanist text-xs leading-none tracking-[0%] text-white">Galaxy Score</td>
                  <td className="py-4 px-4 font-urbanist text-xs font-bold leading-none tracking-[0%] text-[#45FFAE]">80.9%</td>
                  <td className="py-4 px-4 font-urbanist text-xs leading-none tracking-[0%] text-[#808080]">65.3%</td>
                  <td className="py-4 px-4 font-urbanist text-xs font-bold leading-none tracking-[0%] text-[#45FFAE]">+15.6%</td>
                </tr>
                <tr className="border-b border-[#2A2A2A]">
                  <td className="py-4 px-4 font-urbanist text-xs leading-none tracking-[0%] text-white">Reasoning Quality</td>
                  <td className="py-4 px-4 font-urbanist text-xs font-bold leading-none tracking-[0%] text-[#45FFAE]">0.630 F1</td>
                  <td className="py-4 px-4 font-urbanist text-xs leading-none tracking-[0%] text-[#808080]">0.580 F1</td>
                  <td className="py-4 px-4 font-urbanist text-xs font-bold leading-none tracking-[0%] text-[#45FFAE]">+8.6%</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-urbanist text-xs leading-none tracking-[0%] text-white">Processing Speed</td>
                  <td className="py-4 px-4 font-urbanist text-xs font-bold leading-none tracking-[0%] text-[#45FFAE]">&lt;1s</td>
                  <td className="py-4 px-4 font-urbanist text-xs leading-none tracking-[0%] text-[#808080]">~3s</td>
                  <td className="py-4 px-4 font-urbanist text-xs font-bold leading-none tracking-[0%] text-[#45FFAE]">3x faster</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. Live Results & Validation Section - Fifth Photo */}
        <div className="flex w-full flex-col gap-6 rounded-3xl bg-[#141414] p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-[#45FFAE]" />
            <h2 className="font-urbanist text-xl font-bold leading-tight tracking-[0%] text-white sm:text-2xl">
              Live Results & Validation
            </h2>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <Target className="h-5 w-5 text-[#45FFAE]" />
            <h3 className="font-urbanist text-base font-semibold leading-none tracking-[0%] text-white">
              Real Market Performance
            </h3>
          </div>

          <p className="font-urbanist text-xs leading-relaxed tracking-[0%] text-[#808080] mb-4">
            Tested on 150 live cryptocurrency posts via LunarCrush API:
          </p>

          <div className="flex flex-col gap-4 rounded-2xl bg-[#1A1A1A] p-6 border border-[#2A2A2A]">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-5 w-5 rounded-full bg-[#45FFAE]/20 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-[#45FFAE]"></div>
              </div>
              <h4 className="font-urbanist text-sm font-semibold leading-none tracking-[0%] text-white">
                Analysis Results:
              </h4>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 py-2 border-l-2 border-[#45FFAE] pl-4">
                <BarChart3 className="h-5 w-5 text-[#45FFAE]" />
                <div className="flex-1">
                  <div className="font-urbanist text-xs font-medium leading-none tracking-[0%] text-white">Posts Processed</div>
                  <div className="font-urbanist text-xs leading-none tracking-[0%] text-[#808080] mt-1">150/150 (100%)</div>
                </div>
              </div>

              <div className="flex items-center gap-3 py-2 border-l-2 border-[#45FFAE] pl-4">
                <div className="h-5 w-5 rounded-full bg-[#FFD700]/20 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-[#FFD700]"></div>
                </div>
                <div className="flex-1">
                  <div className="font-urbanist text-xs font-medium leading-none tracking-[0%] text-white">Price Predictions</div>
                  <div className="font-urbanist text-xs leading-none tracking-[0%] text-[#808080] mt-1">98.6% accuracy</div>
                </div>
              </div>

              <div className="flex items-center gap-3 py-2 border-l-2 border-[#45FFAE] pl-4">
                <div className="h-5 w-5 rounded-full bg-[#FFD700]/20 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-[#FFD700]"></div>
                </div>
                <div className="flex-1">
                  <div className="font-urbanist text-xs font-medium leading-none tracking-[0%] text-white">Galaxy Scores</div>
                  <div className="font-urbanist text-xs leading-none tracking-[0%] text-[#808080] mt-1">80.9% accuracy</div>
                </div>
              </div>

              <div className="flex items-center gap-3 py-2 border-l-2 border-[#45FFAE] pl-4">
                <TrendingUp className="h-5 w-5 text-[#45FFAE]" />
                <div className="flex-1">
                  <div className="font-urbanist text-xs font-medium leading-none tracking-[0%] text-white">Direction Accuracy</div>
                  <div className="font-urbanist text-xs leading-none tracking-[0%] text-[#808080] mt-1">94.7% within ±1%</div>
                </div>
              </div>

              <div className="flex items-center gap-3 py-2 border-l-2 border-[#45FFAE] pl-4">
                <Zap className="h-5 w-5 text-[#45FFAE]" />
                <div className="flex-1">
                  <div className="font-urbanist text-xs font-medium leading-none tracking-[0%] text-white">Processing Speed</div>
                  <div className="font-urbanist text-xs leading-none tracking-[0%] text-[#808080] mt-1">&lt;1s per prediction</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Benchmark
