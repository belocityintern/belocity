"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, ZapIcon } from "lucide-react" // ZapIcon is already correct

interface PoolData {
  id: string
  attributes: {
    name: string
    base_token_price_usd: string
    quote_token_price_usd: string
    price_change_percentage: { [key: string]: string } // h1, h24, etc.
    volume_usd: { h24: string }
    transactions: { h24: { buys: number; sells: number } }
  }
  relationships: {
    base_token: { data: { id: string; type: string } }
    quote_token: { data: { id: string; type: string } }
  }
}

interface TokenData {
  id: string
  attributes: {
    symbol: string
    name: string
    image_url?: string
  }
}

interface GeckoTerminalResponse {
  data: PoolData[]
  included?: TokenData[] // included tokens for symbols
}

interface GeckoTerminalTrendingProps {
  onPoolSelect: (data: {
    id: string // base token id
    name: string // base token name
    symbol: string // base token symbol
    poolId: string // pool id for context, contract address of the pool
    volume24h?: string
    priceChange24h?: string
    liquidityUsd?: string // Changed from fdvUsd
  }) => void
  onInitialDataLoaded?: (
    firstPool: PoolData, // Pass the full PoolData object
    includedTokens: Map<string, TokenData>,
  ) => void
}

export default function GeckoTerminalTrending(props: GeckoTerminalTrendingProps) {
  const [trendingPools, setTrendingPools] = useState<PoolData[]>([])
  const [includedTokens, setIncludedTokens] = useState<Map<string, TokenData>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrendingPools = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(
          "https://api.geckoterminal.com/api/v2/networks/solana/trending_pools?include=base_token,quote_token&page=1",
        )
        if (!response.ok) {
          try {
            const errorData = await response.json()
            const errorMessage = errorData?.errors?.[0]?.title || `HTTP error! status: ${response.status}`
            throw new Error(errorMessage)
          } catch (e) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
        }
        const result: GeckoTerminalResponse = await response.json()

        const topTenPools = result.data.slice(0, 10)
        setTrendingPools(topTenPools)

        const tokenMap = new Map<string, TokenData>()
        if (result.included) {
          result.included.forEach((token) => tokenMap.set(token.id, token))
        }
        setIncludedTokens(tokenMap)

        // Call onInitialDataLoaded with the first pool if available
        if (topTenPools.length > 0 && props.onInitialDataLoaded) {
          props.onInitialDataLoaded(topTenPools[0], tokenMap)
        }
      } catch (err: any) {
        console.error("Failed to fetch trending pools:", err)
        setError(err.message || "Failed to load data. API may be rate-limiting.")
      } finally {
        setLoading(false)
      }
    }

    fetchTrendingPools()
    const interval = setInterval(fetchTrendingPools, 60000) // Refresh every 60 seconds
    return () => clearInterval(interval)
  }, [props.onInitialDataLoaded])

  const getTokenSymbol = (tokenId: string) => {
    return includedTokens.get(tokenId)?.attributes.symbol || "N/A"
  }

  const formatVolume = (volume: string | number): string => {
    const num = Number(volume)
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
    return num.toFixed(0)
  }

  return (
    <Card className="bg-black border-electric-green/50 rounded-none shadow-electric-DEFAULT mt-6">
      <CardHeader className="p-3 border-b border-electric-green/30">
        <CardTitle className="text-electric-green text-lg glowing-text flex items-center">
          <ZapIcon className="h-5 w-5 mr-2 animate-pulse" />
          TRENDING_POOLS [SOLANA]
        </CardTitle>
        <CardDescription className="text-electric-green/60 text-xs">
          TOP MOVERS ON SOLANA DEXS // REAL-TIME DATA STREAM
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {loading && <div className="p-6 text-center text-electric-green/70 text-sm">LOADING_DATA_STREAM...</div>}
        {error && (
          <div className="p-6 text-center text-red-500 text-sm">
            ERROR: {error} <br /> PLEASE_WAIT_OR_REFRESH.
          </div>
        )}
        {!loading && !error && trendingPools.length === 0 && (
          <div className="p-6 text-center text-electric-green/70 text-sm">NO_TRENDING_POOLS_DETECTED.</div>
        )}
        {!loading && !error && trendingPools.length > 0 && (
          <div className="divide-y divide-electric-green/30">
            {trendingPools.map((pool, index) => {
              const baseTokenSymbol = getTokenSymbol(pool.relationships.base_token.data.id)
              const quoteTokenSymbol = getTokenSymbol(pool.relationships.quote_token.data.id)
              const priceChange24h = Number.parseFloat(pool.attributes.price_change_percentage?.h24 || "0")
              const volume24h = Number.parseFloat(pool.attributes.volume_usd?.h24 || "0")
              const poolName = pool.attributes.name || `${baseTokenSymbol}/${quoteTokenSymbol}`

              return (
                <div
                  key={pool.id}
                  onClick={() => {
                    const baseToken = includedTokens.get(pool.relationships.base_token.data.id)
                    // Attempt to get fdv_usd from base_token if it was included and has market_data
                    // This part depends on whether GeckoTerminal API for trending_pools can include base_token.market_data.fdv_usd
                    // For now, we'll assume it might be on pool.attributes or baseToken.attributes if fetched.
                    // Let's prioritize data directly from the 'pool' object for simplicity here.
                    // If fdv_usd is specific to the token and not the pool, it might need a separate fetch or be part of 'baseToken' details.
                    // For this QuickEdit, we'll pass what's directly available or easily derivable from the pool.
                    // The `fdv_usd` on `pool.attributes` is for the pool itself, which can be different from the base token's FDV.
                    // We will pass `pool.attributes.fdv_usd` if it exists, otherwise it will be undefined.
                    props.onPoolSelect({
                      id: baseToken?.id || pool.relationships.base_token.data.id,
                      name: baseToken?.attributes.name || pool.attributes.name.split("/")[0].trim() || "Unknown Token",
                      symbol: baseToken?.attributes.symbol || pool.attributes.name.split("/")[0].trim() || "N/A",
                      poolId: pool.id,
                      volume24h: pool.attributes.volume_usd?.h24,
                      priceChange24h: pool.attributes.price_change_percentage?.h24,
                      liquidityUsd: (pool.attributes as any).reserve_in_usd, // Use reserve_in_usd for liquidity
                    })
                  }}
                  className="p-3 grid grid-cols-[auto,1fr,auto] gap-3 items-center hover:bg-electric-green/10 cursor-pointer transition-colors text-xs"
                >
                  <span className="text-electric-green/60 w-6 text-center">#{index + 1}</span>
                  <div>
                    <div className="text-electric-green font-bold">{poolName}</div>
                    <div className="text-electric-green/50 truncate max-w-[150px] sm:max-w-[200px]">{pool.id}</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className={`font-bold ${priceChange24h >= 0 ? "text-electric-green" : "text-red-500"}`}>
                        {priceChange24h >= 0 ? "+" : ""}
                        {priceChange24h.toFixed(2)}%
                      </div>
                      <div className="text-electric-green/60">24H_%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-electric-green font-bold">${formatVolume(volume24h)}</div>
                      <div className="text-electric-green/60">VOL_24H</div>
                    </div>
                    <a
                      href={`https://www.geckoterminal.com/solana/pools/${pool.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()} // Prevent row click from triggering if link is clicked
                      className="hover:text-electric-green"
                    >
                      <ExternalLink className="h-3 w-3 text-electric-green/50 hover:text-electric-green" />
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <div className="p-2 text-center text-[10px] text-electric-green/50 border-t border-electric-green/30">
          DATA_SOURCE: DEX AGGREGATOR // PUBLIC_API_USAGE
        </div>
      </CardContent>
    </Card>
  )
}
