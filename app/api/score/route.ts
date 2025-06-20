import { NextRequest, NextResponse } from 'next/server';

interface PoolData {
  pool_id: string;
  name: string;
  symbol: string;
  address: string;
  token_address: string;
  base_token_price_usd: number;
  quote_token_price_usd: number;
  volume_24h: number;
  volume_1h: number;
  volume_6h: number;
  price_change_24h: number;
  price_change_1h: number;
  price_change_6h: number;
  liquidity: number;
  fdv: number;
  market_cap: number;
  transactions_24h: number;
  transactions_1h: number;
  unique_transactions_24h: number;
  pool_created_at: string;
  network: string;
}

interface TweetData {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentiment_score: number;
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

interface SentimentAnalysis {
  total_tweets: number;
  positive_tweets: number;
  negative_tweets: number;
  neutral_tweets: number;
  sentiment_score: number;
  top_positive_tweets: TweetData[];
  top_negative_tweets: TweetData[];
}

interface AggregatedData {
  token_address: string;
  network: string;
  token_symbol: string;
  token_name: string;
  total_pools: number;
  total_volume_24h: number;
  total_volume_1h: number;
  total_volume_6h: number;
  total_liquidity: number;
  total_market_cap: number;
  total_fdv: number;
  total_transactions_24h: number;
  total_transactions_1h: number;
  total_unique_transactions_24h: number;
  weighted_avg_price_usd: number;
  weighted_avg_price_change_24h: number;
  weighted_avg_price_change_1h: number;
  weighted_avg_price_change_6h: number;
  sentiment_analysis: SentimentAnalysis;
  pools: PoolData[];
}

class GeckoTerminalClient {
  private baseUrl = "https://api.geckoterminal.com/api/v2";
  private headers = {
    'Accept': 'application/json',
    'User-Agent': 'BelocityTrendingAnalyzer/1.0'
  };

  private rapidApiKey = process.env.RAPIDAPI_KEY || 'fff2512acdmsh8399ffffdaedf8fp1244cajsnbcfb19aac0c3';
  private rapidApiHost = 'twitter-api47.p.rapidapi.com';
  private rapidApiUrl = 'https://twitter-api47.p.rapidapi.com/v2/search';

  private tweetCache = new Map<string, { data: TweetData[]; timestamp: number }>();
  private cacheDuration = 5 * 60 * 1000;

  private positiveKeywords = ['bullish', 'moon', 'pump', 'buy', 'hodl', 'strong', 'good', 'great', 'profit', 'gains', '🚀', '📈', '💎', '🔥'];
  private negativeKeywords = ['bearish', 'dump', 'sell', 'crash', 'drop', 'weak', 'bad', 'loss', 'scam', 'rug', '📉', '💩', '⚠️'];

  private safeFloat(value: any, defaultValue: number = 0.0): number {
    const res = parseFloat(value);
    return isNaN(res) ? defaultValue : res;
  }

  private safeInt(value: any, defaultValue: number = 0): number {
    const res = parseInt(value, 10);
    return isNaN(res) ? defaultValue : res;
  }

  async fetchTweets(tokenSymbol: string, maxResults: number = 50): Promise<TweetData[]> {
    const cacheKey = `${tokenSymbol}_${maxResults}`;
    const cached = this.tweetCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }

    try {
      const query = `$${tokenSymbol}`;
      const url = `${this.rapidApiUrl}?query=${encodeURIComponent(query)}&type=Top`;
      const response = await fetch(url, {
        headers: {
          'x-rapidapi-host': this.rapidApiHost,
          'x-rapidapi-key': this.rapidApiKey,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) return [];
      const data = await response.json();
      const tweets: TweetData[] = [];
      if (Array.isArray(data.tweets)) {
        for (const entry of data.tweets) {
          if (entry.content?.itemContent?.itemType === 'TimelineTweet' && entry.content.itemContent.tweet_results?.result?.legacy) {
            const legacy = entry.content.itemContent.tweet_results.result.legacy;
            const sentiment = this.analyzeSentiment(legacy.full_text || '');
            tweets.push({
              id: legacy.id_str || 'unknown',
              text: legacy.full_text || '',
              created_at: legacy.created_at || new Date().toISOString(),
              author_id: legacy.user_id_str || 'unknown',
              sentiment: sentiment.sentiment,
              sentiment_score: sentiment.score
            });
          }
        }
      }
      const limitedTweets = tweets.slice(0, maxResults);
      this.tweetCache.set(cacheKey, { data: limitedTweets, timestamp: Date.now() });
      return limitedTweets;
    } catch (error) {
      console.error('Error fetching tweets:', error);
      return [];
    }
  }

  private analyzeSentiment(text: string): { sentiment: 'positive' | 'negative' | 'neutral'; score: number } {
    const lowerText = text.toLowerCase();
    const positiveScore = this.positiveKeywords.filter(k => lowerText.includes(k)).length;
    const negativeScore = this.negativeKeywords.filter(k => lowerText.includes(k)).length;
    const totalScore = positiveScore + negativeScore;
    if (totalScore === 0) return { sentiment: 'neutral', score: 0 };
    const sentimentScore = (positiveScore - negativeScore) / totalScore;
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (sentimentScore > 0.1) sentiment = 'positive';
    else if (sentimentScore < -0.1) sentiment = 'negative';
    return { sentiment, score: sentimentScore };
  }

  async getSentimentAnalysis(tokenSymbol: string): Promise<SentimentAnalysis> {
    const tweets = await this.fetchTweets(tokenSymbol);
    if (tweets.length === 0) {
      return { total_tweets: 0, positive_tweets: 0, negative_tweets: 0, neutral_tweets: 0, sentiment_score: 0, top_positive_tweets: [], top_negative_tweets: [] };
    }
    const positiveTweets = tweets.filter(t => t.sentiment === 'positive');
    const negativeTweets = tweets.filter(t => t.sentiment === 'negative');
    const averageSentimentScore = tweets.reduce((sum, t) => sum + t.sentiment_score, 0) / tweets.length;
    return {
      total_tweets: tweets.length,
      positive_tweets: positiveTweets.length,
      negative_tweets: negativeTweets.length,
      neutral_tweets: tweets.length - positiveTweets.length - negativeTweets.length,
      sentiment_score: averageSentimentScore,
      top_positive_tweets: positiveTweets.sort((a, b) => b.sentiment_score - a.sentiment_score).slice(0, 5),
      top_negative_tweets: negativeTweets.sort((a, b) => a.sentiment_score - b.sentiment_score).slice(0, 5)
    };
  }

  async searchTokenByAddress(network: string, tokenAddress: string): Promise<PoolData[]> {
    try {
      const url = `${this.baseUrl}/networks/${network}/tokens/${tokenAddress}/pools`;
      const response = await fetch(url, { headers: this.headers });
      if (!response.ok) return [];
      const data = await response.json();
      return (data.data || []).map((p: any) => ({
        pool_id: p.id,
        name: p.attributes.name,
        symbol: p.attributes.base_token.symbol,
        address: p.attributes.address,
        token_address: p.attributes.base_token.address,
        base_token_price_usd: this.safeFloat(p.attributes.base_token_price_usd),
        quote_token_price_usd: this.safeFloat(p.attributes.quote_token_price_usd),
        volume_24h: this.safeFloat(p.attributes.volume_usd.h24),
        volume_6h: this.safeFloat(p.attributes.volume_usd.h6),
        volume_1h: this.safeFloat(p.attributes.volume_usd.h1),
        price_change_24h: this.safeFloat(p.attributes.price_change_percentage.h24),
        price_change_6h: this.safeFloat(p.attributes.price_change_percentage.h6),
        price_change_1h: this.safeFloat(p.attributes.price_change_percentage.h1),
        liquidity: this.safeFloat(p.attributes.reserve_in_usd),
        fdv: this.safeFloat(p.attributes.fdv_usd),
        market_cap: this.safeFloat(p.attributes.market_cap_usd),
        transactions_24h: this.safeInt(p.attributes.transactions.h24.buys) + this.safeInt(p.attributes.transactions.h24.sells),
        transactions_1h: this.safeInt(p.attributes.transactions.h1.buys) + this.safeInt(p.attributes.transactions.h1.sells),
        unique_transactions_24h: this.safeInt(p.attributes.transactions.h24.unique_buys) + this.safeInt(p.attributes.transactions.h24.unique_sells),
        pool_created_at: p.attributes.pool_created_at,
        network: network
      }));
    } catch (error) {
      console.error("Error searching token by address:", error);
      return [];
    }
  }

  public async getBeliefScore(network: string, tokenAddress: string): Promise<BeliefScoreOutput> {
    const pools = await this.searchTokenByAddress(network, tokenAddress);

    if (pools.length === 0) {
      const trajectory = Array.from({ length: 7 }, (_, i) => ({ day: `D${i + 1}`, score: 0 }));
      return {
        token_address: tokenAddress, network: network, token_symbol: 'N/A', token_name: 'Unknown Token',
        overall_belief_score: 0,
        score_components: [
          { name: 'TWITTER_ACTIVITY', score: 0, weight: 0.35, contribution: 0 },
          { name: 'CONTENT_SCORE', score: 0, weight: 0.25, contribution: 0 },
          { name: 'NEWS_SENTIMENT', score: 0, weight: 0.20, contribution: 0 },
          { name: 'REFLEXIVITY', score: 0, weight: 0.20, contribution: 0 },
        ],
        predicted_score_trajectory: trajectory,
        price_change_24h_usd: null, liquidity_usd: 0, volume_24h_usd: 0,
      };
    }

    const firstPool = pools[0];
    const totalLiquidity = pools.reduce((sum, p) => sum + p.liquidity, 0);
    const totalWeight = totalLiquidity > 0 ? totalLiquidity : 1;

    const weightedAvg = (getter: (p: PoolData) => number) => pools.reduce((sum, p) => sum + getter(p) * p.liquidity, 0) / totalWeight;

    const sentiment = await this.getSentimentAnalysis(firstPool.symbol);

    const aggregated: AggregatedData = {
      token_address: firstPool.token_address,
      network: firstPool.network,
      token_symbol: firstPool.symbol,
      token_name: firstPool.name,
      total_pools: pools.length,
      total_volume_24h: pools.reduce((sum, p) => sum + p.volume_24h, 0),
      total_volume_1h: pools.reduce((sum, p) => sum + p.volume_1h, 0),
      total_volume_6h: pools.reduce((sum, p) => sum + p.volume_6h, 0),
      total_liquidity: totalLiquidity,
      total_market_cap: pools.reduce((sum, p) => sum + p.market_cap, 0),
      total_fdv: pools.reduce((sum, p) => sum + p.fdv, 0),
      total_transactions_24h: pools.reduce((sum, p) => sum + p.transactions_24h, 0),
      total_transactions_1h: pools.reduce((sum, p) => sum + p.transactions_1h, 0),
      total_unique_transactions_24h: pools.reduce((sum, p) => sum + p.unique_transactions_24h, 0),
      weighted_avg_price_usd: weightedAvg(p => p.base_token_price_usd),
      weighted_avg_price_change_24h: weightedAvg(p => p.price_change_24h),
      weighted_avg_price_change_1h: weightedAvg(p => p.price_change_1h),
      weighted_avg_price_change_6h: weightedAvg(p => p.price_change_6h),
      sentiment_analysis: sentiment,
      pools: pools,
    };

    return this.calculateBeliefScore(aggregated);
  }
  
  private calculateBeliefScore(aggregatedData: AggregatedData): BeliefScoreOutput {
    const weights = { TWITTER_ACTIVITY: 0.35, CONTENT_SCORE: 0.25, NEWS_SENTIMENT: 0.20, REFLEXIVITY: 0.20 };

    const twitterActivityScore = Math.min((aggregatedData.sentiment_analysis.total_tweets / 100) * 100, 100);
    const newsSentimentScore = (aggregatedData.sentiment_analysis.sentiment_score + 1) * 50;
    const reflexivityScore = Math.max(0, Math.min(100, 50 + aggregatedData.weighted_avg_price_change_24h));
    const { positive_tweets, total_tweets } = aggregatedData.sentiment_analysis;
    const contentScore = total_tweets > 0 ? (positive_tweets / total_tweets) * 100 : 50;

    const components: ScoreComponent[] = [
      { name: 'TWITTER_ACTIVITY', score: twitterActivityScore, weight: weights.TWITTER_ACTIVITY, contribution: 0 },
      { name: 'CONTENT_SCORE', score: contentScore, weight: weights.CONTENT_SCORE, contribution: 0 },
      { name: 'NEWS_SENTIMENT', score: newsSentimentScore, weight: weights.NEWS_SENTIMENT, contribution: 0 },
      { name: 'REFLEXIVITY', score: reflexivityScore, weight: weights.REFLEXIVITY, contribution: 0 },
    ];

    let overallScore = 0;
    for (const component of components) {
      component.contribution = component.score * component.weight;
      overallScore += component.contribution;
    }

    const predicted_score_trajectory = Array.from({ length: 7 }, (_, i) => {
      const score = (i === 0) ? overallScore : overallScore + (Math.random() - 0.5) * 20;
      return { day: `D${i + 1}`, score: Math.max(0, Math.min(100, score)) };
    });

    return {
      token_address: aggregatedData.token_address,
      network: aggregatedData.network,
      token_symbol: aggregatedData.token_symbol,
      token_name: aggregatedData.token_name,
      overall_belief_score: overallScore,
      score_components: components,
      predicted_score_trajectory,
      price_change_24h_usd: aggregatedData.weighted_avg_price_change_24h,
      liquidity_usd: aggregatedData.total_liquidity,
      volume_24h_usd: aggregatedData.total_volume_24h,
    };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const network = searchParams.get('network') || 'solana';

  if (!address) {
    return NextResponse.json({ error: 'Contract address is required' }, { status: 400 });
  }

  try {
    const client = new GeckoTerminalClient();
    const beliefScore = await client.getBeliefScore(network, address);
    return NextResponse.json(beliefScore);
  } catch (error) {
    console.error('Error in GET /api/score:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 