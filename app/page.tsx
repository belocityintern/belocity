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
import { TokenSearch } from "./components/dashboard/TokenSearch"
import { ScoreDisplay } from "./components/dashboard/ScoreDisplay"
import { MetricsDisplay } from "./components/dashboard/MetricsDisplay"
import { ChartDisplay } from "./components/dashboard/ChartDisplay"
import { BeliefScoreOutput } from "./api/score/types" // Import the type

export default function BelocityDashboard() {
  const [address, setAddress] = useState('24QeFuBcBP1PHf8uAxyQzcDNPisEfyvoEbDgVAMyFbonk'); // Default address
  const [data, setData] = useState<BeliefScoreOutput | null>(null);
  const [loading, setLoading] = useState(true); // Start loading initially
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!address) {
      setError("Please enter a token address.");
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(`/api/score?address=${address}&network=solana`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch score');
      }
      const scoreData: BeliefScoreOutput = await response.json();
      setData(scoreData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <Brain className="h-12 w-12 text-primary animate-pulse mx-auto" />
            <p className="mt-4 text-lg">Analyzing token data...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center h-96">
          <div className="text-center text-red-500">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      );
    }

    if (!data || data.overall_belief_score === 0) {
        return (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <p className="font-bold">No data found</p>
              <p>Could not retrieve belief score for this address.</p>
            </div>
          </div>
        );
    }

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div >
                <h2 className="text-2xl font-bold tracking-tight">{data.token_name} ({data.token_symbol})</h2>
                <p className="text-sm text-muted-foreground truncate">{data.token_address}</p>
            </div>
        </div>

        <MetricsDisplay
          liquidity={data.liquidity_usd}
          volume24h={data.volume_24h_usd}
          priceChange24h={data.price_change_24h_usd}
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="lg:col-span-3">
            <ScoreDisplay
              overallScore={data.overall_belief_score}
              components={data.score_components}
            />
          </div>
          <div className="lg:col-span-4">
            <ChartDisplay trajectory={data.predicted_score_trajectory} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Belief Velocity</h1>
      </div>
      
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">
            <Brain className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="trending">
             <Zap className="mr-2 h-4 w-4" />
            Trending
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
            <TokenSearch 
              address={address}
              setAddress={setAddress}
              handleSearch={handleSearch}
              loading={loading}
            />
          {renderContent()}
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
           <Card>
                <CardHeader>
                    <CardTitle>Trending Tokens</CardTitle>
                    <CardDescription>
                        Discover trending tokens on GeckoTerminal. Click to analyze.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <GeckoTerminalTrending onPoolSelect={(pool) => setAddress(pool.id)} />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
