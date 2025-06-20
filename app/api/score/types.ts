export interface PoolData {
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

export interface TweetData {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentiment_score: number;
}

export interface ScoreComponent {
  name: string;
  score: number;
  weight: number;
  contribution: number;
}

export interface BeliefScoreOutput {
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

export interface SentimentAnalysis {
  total_tweets: number;
  positive_tweets: number;
  negative_tweets: number;
  neutral_tweets: number;
  sentiment_score: number;
  top_positive_tweets: TweetData[];
  top_negative_tweets: TweetData[];
}

export interface AggregatedData {
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