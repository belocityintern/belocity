# Contract Address Scoring API

A comprehensive API that analyzes cryptocurrency tokens by contract address, providing market data aggregation and social sentiment analysis.

## Features

- **Token Data Aggregation**: Combines data from all pools containing the token
- **Market Metrics**: Volume, liquidity, price changes, market cap, etc.
- **Scoring System**: 0-100 score based on market performance
- **Social Sentiment Analysis**: Twitter/X sentiment analysis for the token
- **Multi-Network Support**: Works with Ethereum, BSC, and other networks

## API Endpoint

```
GET /api/score?address={token_address}&network={network}
```

### Parameters

- `address` (required): The token contract address
- `network` (optional): Network identifier (default: 'eth')

### Example Request

```bash
curl "http://localhost:3000/api/score?address=0xdAC17F958D2ee523a2206206994597C13D831ec7&network=eth"
```

## Response Structure

```json
{
  "token_address": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  "network": "eth",
  "token_symbol": "USDT",
  "token_name": "Tether USD",
  "total_pools": 19,
  "total_volume_24h": 335526200.4276856,
  "total_volume_1h": 9168836.836796338,
  "total_volume_6h": 65567628.3149533,
  "total_liquidity": 384286559.20739996,
  "total_market_cap": 1385212401834.7048,
  "total_fdv": 730987927165.184,
  "total_transactions_24h": 0,
  "total_transactions_1h": 0,
  "total_unique_transactions_24h": 0,
  "weighted_avg_price_usd": 1456.8934929495483,
  "weighted_avg_price_change_24h": 0.21759511150799005,
  "weighted_avg_price_change_1h": -0.030930096070120323,
  "weighted_avg_price_change_6h": 0.36049093421711215,
  "score": 60,
  "sentiment_analysis": {
    "total_tweets": 0,
    "positive_tweets": 0,
    "negative_tweets": 0,
    "neutral_tweets": 0,
    "sentiment_score": 0,
    "top_positive_tweets": [],
    "top_negative_tweets": []
  },
  "pools": [...]
}
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in your project root:

```env
# Twitter API v2 Configuration (Optional)
# Get your bearer token from https://developer.twitter.com/en/portal/dashboard
TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here
```

### 3. Twitter API v2 Setup (Optional)

To enable social sentiment analysis:

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new app or use an existing one
3. Generate a Bearer Token
4. Add the token to your `.env.local` file

**Note**: You'll need to apply for Twitter Developer access, which may take a few days to be approved.

### 4. Run the Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000/api/score`

## Sentiment Analysis

The API includes a built-in sentiment analyzer that:

- Fetches recent tweets mentioning the token symbol (e.g., "$USDT")
- Analyzes sentiment using crypto-specific keywords and emojis
- Provides sentiment scores and categorized tweets

### Sentiment Keywords

**Positive**: bullish, moon, pump, buy, hodl, strong, 🚀, 📈, 💎, 🔥, 💪, ✅, 👍, 💯, 💰, 🎯

**Negative**: bearish, dump, sell, crash, weak, scam, rug, 📉, 💩, 😡, 😭, 💸, ❌, 👎, 🚨, ⚠️, 💀

## Scoring Algorithm

The scoring system (0-100) is based on:

- **Volume (30 points)**: 24h trading volume
- **Liquidity (25 points)**: Total liquidity across pools
- **Transaction Activity (25 points)**: Number of transactions
- **Price Performance (20 points)**: Weighted average price change

## Testing

### Test the API

```bash
# Test with USDT
curl "http://localhost:3000/api/score?address=0xdAC17F958D2ee523a2206206994597C13D831ec7&network=eth"

# Test with USDC
curl "http://localhost:3000/api/score?address=0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48&network=eth"

# Test with WETH
curl "http://localhost:3000/api/score?address=0xC02aaa39b223FE8D0A0E5C4F27EAD9083C756CC2&network=eth"
```

### Test Sentiment Analysis

```bash
node test-sentiment.js
```

## Data Sources

- **Market Data**: GeckoTerminal API
- **Social Data**: Twitter API v2 (when configured)
- **Token Information**: GeckoTerminal Token API

## Error Handling

The API gracefully handles:
- Missing Twitter credentials (skips sentiment analysis)
- Invalid token addresses (returns empty results)
- API rate limits (returns cached or empty data)
- Network errors (returns error responses)

## Deployment

This API is designed to work with Vercel Edge Functions. Deploy by:

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The API will be available at: `https://your-domain.vercel.app/api/score` 