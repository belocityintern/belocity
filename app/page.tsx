"use client"

import { useState, useEffect, useCallback } from "react"
import { Zap, Brain, AreaChart } from "lucide-react" // Added Activity and Search back for potential future use, but not used in current layout
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Area,
  CartesianGrid,
} from "recharts"

import GeckoTerminalTrending from "./components/gecko-terminal-trending"
// Assuming PoolData and TokenData might be needed from gecko-terminal-trending or a shared types file
// For simplicity, if they are not exported from there, we'd define minimal versions or use 'any'
// However, GeckoTerminalTrendingProps in gecko-terminal-trending.tsx already types them for the callback.

interface PredictionPoint {
  day: number
  value: number // Predicted Belief Velocity
  lowerBand: number
  upperBand: number
}

interface BeliefComponent {
  name: string // e.g., "TWITTER", "DISCORD"
  rawScore: number // Score for this component (0-100)
  weight: number // Weight of this component (e.g., 0.3 for 30%)
  contribution: number // Calculated: rawScore * weight
}

interface PredictedToken {
  id: string
  name: string
  symbol: string
  contract?: string
  isPrediction: true
  beliefPredictionData: PredictionPoint[] // For the left panel forecast

  beliefScore: number // Overall Belief Score (0-100)
  beliefComponents: BeliefComponent[]

  // Market data for the left panel
  volume24h?: number
  priceChange24h?: number
  liquidityUsd?: number

  currentPredictedBV?: number
  narrativeMomentum?: string
  lastUpdate?: string
}

type SelectedTokenType = PredictedToken | null

// Types that would be used by onInitialDataLoaded callback
interface TokenDataForPage {
  id: string
  attributes: { name: string; symbol: string }
}

interface PoolAttributesForPage {
  name: string
  volume_usd?: { h24?: string }
  price_change_percentage?: { h24?: string }
  fdv_usd?: string // Assuming fdv_usd might be part of attributes
}
interface PoolDataForPageFull {
  // Renaming for clarity
  id: string
  attributes: PoolAttributesForPage
  relationships: { base_token: { data: { id: string } } }
}

interface ScoreComponent {
  name: string;
  score: number;
  weight: number;
  contribution: number;
}

interface BeliefScoreOutput {
  token_address: string;
  network: string;
  token_symbol: string;
  token_name: string;
  overall_belief_score: number;
  score_components: ScoreComponent[];
  predicted_score_trajectory: { day: string; score: number }[];
  price_change_24h_usd: number | null;
  liquidity_usd: number;
  volume_24h_usd: number;
}

const ProgressBar = ({ score, glow }: { score: number; glow?: boolean }) => (
  <div className="w-full bg-gray-800 h-2.5 my-2">
    <div
      className={`bg-primary h-2.5 ${glow ? 'progress-bar-glow' : ''}`}
      style={{ width: `${score}%` }}
    ></div>
  </div>
);

export default function BelocityDashboard() {
  const [selectedToken, setSelectedToken] = useState<SelectedTokenType>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoadingInitialToken, setIsLoadingInitialToken] = useState(true)
  const [address, setAddress] = useState('');
  const [data, setData] = useState<BeliefScoreOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto-fetch a default token on initial load
  useEffect(() => {
    const defaultToken = '24QeFuBcBP1PHf8uAxyQzcDNPisEfyvoEbDgVAMyFbonk'; // Example: SUPERBONK
    setAddress(defaultToken);
    handleSearch(defaultToken);
  }, []);

  const formatUsd = (value: number | undefined, compact = false) => {
    if (value === undefined) return "N/A"
    const options: Intl.NumberFormatOptions = { style: "currency", currency: "USD" }
    if (compact) {
      options.notation = "compact"
      options.minimumFractionDigits = 2
      options.maximumFractionDigits = 2
    } else {
      options.minimumFractionDigits = 2
      options.maximumFractionDigits = 2
    }
    return new Intl.NumberFormat("en-US", options).format(value)
  }

  const formatPercentage = (value: number | undefined) => {
    if (value === undefined) return "N/A"
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
  }

  const processTokenSelection = (
    tokenInfo: { id: string; name: string; symbol: string },
    contractId?: string,
    narrative?: string,
    marketData?: { volume24h?: string; priceChange24h?: string; liquidityUsd?: string }, // Added liquidityUsd
  ): PredictedToken => {
    const beliefPredictionData: PredictionPoint[] = []
    let lastBeliefValue = Math.random() * 40 + 30 // This will be our overall belief score for the forecast
    for (let i = 1; i <= 7; i++) {
      const change = (Math.random() - 0.45) * 15
      const newValue = Math.max(0, Math.min(100, lastBeliefValue + change))
      const bandSize = Math.random() * 10 + 5
      beliefPredictionData.push({
        day: i,
        value: Number.parseFloat(newValue.toFixed(1)),
        lowerBand: Number.parseFloat(Math.max(0, newValue - bandSize / 2).toFixed(1)),
        upperBand: Number.parseFloat(Math.min(100, newValue + bandSize / 2).toFixed(1)),
      })
      lastBeliefValue = newValue
    }

    // Generate Belief Score Components
    const componentsData = [
      { name: "TWITTER_ACTIVITY", weightPercentage: 35 },
      { name: "DISCORD_ENGAGEMENT", weightPercentage: 25 },
      { name: "NEWS_SENTIMENT", weightPercentage: 20 },
      { name: "ONCHAIN_SIGNALS", weightPercentage: 20 },
    ]

    let calculatedOverallBeliefScore = 0
    const beliefComponents: BeliefComponent[] = componentsData.map((comp) => {
      const rawScore = Math.floor(Math.random() * 71) + 30 // Random raw score 30-100
      const weight = comp.weightPercentage / 100
      const contribution = Number.parseFloat((rawScore * weight).toFixed(1))
      calculatedOverallBeliefScore += contribution
      return {
        name: comp.name,
        rawScore,
        weight,
        contribution,
      }
    })

    // Ensure overall score is capped at 100
    const finalBeliefScore = Number.parseFloat(Math.min(100, calculatedOverallBeliefScore).toFixed(1))

    // Use the finalBeliefScore for the forecast's current value if desired, or keep them separate
    // For consistency, let's make currentPredictedBV (used in forecast) match this new beliefScore
    if (beliefPredictionData.length > 0) {
      beliefPredictionData[beliefPredictionData.length - 1].value = finalBeliefScore // Update last point of forecast
    }

    return {
      id: tokenInfo.id,
      name: tokenInfo.name,
      symbol: tokenInfo.symbol,
      contract: contractId || tokenInfo.id,
      isPrediction: true,
      beliefPredictionData,

      beliefScore: finalBeliefScore,
      beliefComponents,

      volume24h: marketData?.volume24h ? Number.parseFloat(marketData.volume24h) : undefined,
      priceChange24h: marketData?.priceChange24h ? Number.parseFloat(marketData.priceChange24h) : undefined,
      liquidityUsd: marketData?.liquidityUsd ? Number.parseFloat(marketData.liquidityUsd) : undefined,

      currentPredictedBV: finalBeliefScore,
      narrativeMomentum: narrative || "Trending Momentum",
      lastUpdate: "Just now",
    }
  }

  const handlePoolSelect = useCallback(
    (data: {
      id: string
      name: string
      symbol: string
      poolId: string
      volume24h?: string
      priceChange24h?: string
      liquidityUsd?: string // Added liquidityUsd
    }) => {
      const newSelectedToken = processTokenSelection(
        { id: data.id, name: data.name, symbol: data.symbol },
        data.poolId,
        "Selected from Trending",
        { volume24h: data.volume24h, priceChange24h: data.priceChange24h, liquidityUsd: data.liquidityUsd },
      )
      setSelectedToken(newSelectedToken)
      setIsLoadingInitialToken(false)
    },
    [],
  )

  const handleInitialDataLoaded = useCallback(
    (firstPool: PoolDataForPageFull, includedTokensMap: Map<string, TokenDataForPage>) => {
      const baseTokenId = firstPool.relationships.base_token.data.id
      const baseToken = includedTokensMap.get(baseTokenId)

      const tokenInfo = {
        id: baseTokenId,
        name: baseToken?.attributes.name || firstPool.attributes.name.split("/")[0].trim() || "Unknown Token",
        symbol: baseToken?.attributes.symbol || firstPool.attributes.name.split("/")[0].trim() || "N/A",
      }

      const newSelectedToken = processTokenSelection(tokenInfo, firstPool.id, "Top Trending Signal", {
        volume24h: firstPool.attributes.volume_usd?.h24,
        priceChange24h: firstPool.attributes.price_change_percentage?.h24,
        liquidityUsd: (firstPool.attributes as any).reserve_in_usd, // Use reserve_in_usd
      })
      setSelectedToken(newSelectedToken)
      setIsLoadingInitialToken(false)
    },
    [],
  )

  const handleSearch = async (searchAddress?: string) => {
    const addressToSearch = typeof searchAddress === 'string' ? searchAddress : address;
    if (!addressToSearch) {
      setError('Please enter a Solana token address.');
      return;
    }
    setLoading(true);
    setData(null);
    setError(null);
    try {
      const response = await fetch(`/api/score?network=solana&address=${addressToSearch}`);
      if (!response.ok) {
        throw new Error('Failed to fetch score. Please check the address and try again.');
      }
      const result: BeliefScoreOutput = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) return 'N/A';
    if (num > 1_000) return `$${(num / 1_000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };
  
  const formatPercent = (num: number | null | undefined) => {
    if (num === null || num === undefined) return 'N/A';
    return `${num.toFixed(2)}%`;
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const formulaBlockStyle = "p-4 border border-electric-green/50 rounded bg-black/80 mb-4 overflow-x-auto text-sm"
  const beliefScoreFormula =
    "B(t) = w_1 E(t) + w_2 S(t) + w_3 P(t) + ... // Weighted sum of Engagement, Sentiment, Price Action, etc."
  const logNormalizedFormula = "B_log(t) = log(1 + B(t)) / log(1 + B_max) // Log-normalized score (0-1)"
  const percentileFormula = "B_pct(t) = rank(B(t)) / N // Percentile rank among peers"
  const beliefVelocityFormula = "BV(t) = (B(t) - B(t-1)) / B(t-1) // Rate of change of Belief Score"
  const beliefAccelerationFormula = "BA(t) = BV(t) - BV(t-1) // Rate of change of Belief Velocity"
  const breakoutFormula = "Breakout(t) = B(t) / SMA(B(t), w) > threshold // Current belief vs. Simple Moving Average"

  return (
    <div className="min-h-screen bg-black text-electric-green">
      <header className="sticky top-0 z-50 border-b border-electric-green/30 bg-black/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Zap className="h-7 w-7 text-electric-green animate-electric-glow" />
              <h1 className="text-3xl font-bold glowing-text">[BELOCITY]</h1>
            </div>
            <div className="text-xs text-electric-green/70">
              {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })} ZULU
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="scanner" className="space-y-6">
          <TabsList className="bg-black border border-electric-green/50 rounded-none">
            <TabsTrigger
              value="scanner"
              className="px-4 py-2 data-[state=active]:bg-electric-green data-[state=active]:text-black data-[state=active]:shadow-electric-md rounded-none text-electric-green/80 hover:text-electric-green hover:bg-electric-green/10 transition-colors"
            >
              SCANNER_FEED
            </TabsTrigger>
            <TabsTrigger
              value="how-it-works"
              className="px-4 py-2 data-[state=active]:bg-electric-green data-[state=active]:text-black data-[state=active]:shadow-electric-md rounded-none text-electric-green/80 hover:text-electric-green hover:bg-electric-green/10 transition-colors"
            >
              HOW_IT_WORKS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scanner" className="space-y-6">
            <form onSubmit={handleFormSubmit} className="flex items-center space-x-2 component-border p-2">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter Solana Token Address..."
                className="flex-grow bg-gray-900 text-green-400 border border-green-700 p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-green-500 text-black font-bold py-2 px-4 hover:bg-green-400 disabled:bg-gray-600"
              >
                {loading ? 'ANALYZING...' : 'SEARCH_TOKEN'}
              </button>
            </form>

            {loading && <div className="mt-4 text-center text-lg glow animate-pulse">Loading Belief-Velocity Data...</div>}
            {error && <div className="mt-4 text-red-500 text-center">{error}</div>}

            {data && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {/* Left Panel: Forecast and Info */}
                <div className="md:col-span-2 component-border p-4">
                  <h2 className="text-xl font-bold glow">{data.token_symbol} BELIEF_VELOCITY_FORECAST [7D]</h2>
                  <p className="text-sm text-gray-400">PREDICTED SCORE TRAJECTORY // 0-100 SCALE</p>
                  <div className="h-64 mt-4 flex items-center justify-center bg-gray-900 component-border">
                    {/* Chart placeholder */}
                    <p className="text-gray-500">Chart will be displayed here once library is available.</p>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-lg">
                    <div>PRICE_CHG_24H: <span className="font-bold">{formatPercent(data.price_change_24h_usd)}</span></div>
                    <div>LIQUIDITY_USD: <span className="font-bold">{formatNumber(data.liquidity_usd)}</span></div>
                    <div>VOLUME_24H_USD: <span className="font-bold">{formatNumber(data.volume_24h_usd)}</span></div>
                  </div>
                </div>

                {/* Right Panel: Score Components */}
                <div className="component-border p-4">
                  <h2 className="text-xl font-bold glow">{data.token_symbol} BELIEF_SCORE_COMPONENTS</h2>
                  <p className="text-sm text-gray-400">DECONSTRUCTION OF NARRATIVE MOMENTUM</p>
                  
                  <div className="my-6 text-center">
                    <p className="text-5xl font-bold glow">{data.overall_belief_score.toFixed(1)} / 100</p>
                    <p className="text-sm text-gray-400">OVERALL_BELIEF_SCORE</p>
                    <ProgressBar score={data.overall_belief_score} glow />
                  </div>

                  {data.score_components.map((comp) => (
                    <div key={comp.name} className="mt-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="font-bold text-lg">{comp.name}</p>
                          <p className="text-2xl">{comp.score.toFixed(0)}<span className="text-lg">/100</span></p>
                        </div>
                        <div className="text-right text-xs">
                          <p>WT: {(comp.weight * 100).toFixed(0)}%</p>
                          <p>Contrib: {comp.contribution.toFixed(1)}</p>
                        </div>
                      </div>
                      <ProgressBar score={comp.score} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <GeckoTerminalTrending onPoolSelect={handlePoolSelect} onInitialDataLoaded={handleInitialDataLoaded} />
          </TabsContent>

          <TabsContent value="how-it-works" className="space-y-6">
            <Card className="bg-black border-electric-green/50 rounded-none shadow-electric-DEFAULT">
              <CardHeader className="p-3 border-b border-electric-green/30">
                <CardTitle className="text-electric-green text-lg glowing-text flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  BELIEF_VELOCITY_PROTOCOL // HOW_IT_WORKS
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-6 text-electric-green/80 text-sm leading-relaxed">
                <p className="text-electric-green/70">
                  Belief Velocity (BV) quantifies the rate of change in collective conviction surrounding a crypto asset
                  or narrative. It aims to identify assets gaining significant social and market momentum *before* it
                  fully reflects in price. The core idea is that rapidly accelerating belief, driven by social
                  discourse, influencer activity, and early on-chain signals, often precedes major price movements.
                </p>
                <section>
                  <h3 className="text-base font-bold text-electric-green glowing-text mb-2">
                    STEP_1: COMPUTE_BELIEF_SCORE (B)
                  </h3>
                  <pre className={formulaBlockStyle}>
                    <code>{beliefScoreFormula}</code>
                  </pre>
                  <p className="text-xs text-electric-green/60">
                    The Belief Score is a composite metric derived from various data sources like Twitter (engagement,
                    key opinion leader mentions), Discord (message velocity, sentiment), news sentiment, and on-chain
                    data (e.g., smart money inflows, new holder growth). Each factor is weighted based on its historical
                    correlation with positive price action or narrative adoption.
                  </p>
                </section>
                <section>
                  <h3 className="text-base font-bold text-electric-green glowing-text mb-2">
                    STEP_2: NORMALIZE_OR_RANK
                  </h3>
                  <pre className={formulaBlockStyle}>
                    <code>{logNormalizedFormula}</code>
                  </pre>
                  <pre className={formulaBlockStyle}>
                    <code>{percentileFormula}</code>
                  </pre>
                  <p className="text-xs text-electric-green/60">
                    Scores are normalized (e.g., log-normalized to a 0-100 scale) or percentile-ranked against a
                    universe of comparable assets to provide relative strength. This helps in comparing assets with
                    vastly different raw metric volumes.
                  </p>
                </section>
                <section>
                  <h3 className="text-base font-bold text-electric-green glowing-text mb-2">
                    STEP_3: COMPUTE_BELIEF_VELOCITY (BV) & ACCELERATION (BA)
                  </h3>
                  <pre className={formulaBlockStyle}>
                    <code>{beliefVelocityFormula}</code>
                  </pre>
                  <pre className={formulaBlockStyle}>
                    <code>{beliefAccelerationFormula}</code>
                  </pre>
                  <p className="text-xs text-electric-green/60">
                    Velocity measures the rate of change of the Belief Score. High velocity indicates rapidly growing
                    conviction. Acceleration measures the rate of change of velocity, highlighting assets where momentum
                    is picking up speed exponentially.
                  </p>
                </section>
                <section>
                  <h3 className="text-base font-bold text-electric-green glowing-text mb-2">
                    STEP_4: DETECT_REFLEXIVE_BREAKOUTS & NARRATIVE_VECTORS
                  </h3>
                  <pre className={formulaBlockStyle}>
                    <code>{breakoutFormula}</code>
                  </pre>
                  <p className="text-xs text-electric-green/60">
                    Breakout signals are triggered when the current Belief Score significantly surpasses its recent
                    moving average, indicating a potential shift. AI models analyze the content driving the belief score
                    to identify dominant "Narrative Vectors" (e.g., "AI Coins," "DePIN," "Restaking"). The Reflexivity
                    Index (0-1) attempts to measure how much the current narrative is self-reinforcing.
                  </p>
                </section>
                <p className="text-[10px] text-electric-green/50 pt-3 border-t border-electric-green/20">
                  NOTE: Mathematical formulas are simplified representations. Actual calculations involve complex data
                  processing and machine learning models. This dashboard uses mock data for demonstration.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-electric-green/30 bg-black/80 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-xs">
            <div className="text-electric-green/70 glowing-text">[BELOCITY] TERMINAL © 2025</div>
            <div className="text-electric-green/50">SYSTEM_STATUS: OPERATIONAL // DATA_STREAM: ACTIVE</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
