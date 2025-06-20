# [BELOCITY] - Token Narrative Momentum Analyzer

This project is a web-based dashboard designed to analyze the "narrative momentum" of Solana-based tokens. It provides a comprehensive scoring system based on real-time market data from GeckoTerminal and social sentiment analysis from Twitter. The goal is to offer a "Belief-Velocity" score that quantifies a token's current standing in the market and its potential trajectory.

## Features

- **Token Search**: Users can input any Solana token contract address to fetch its analysis.
- **Belief-Velocity Score**: An overall score from 0-100 that represents the token's narrative momentum.
- **Score Components**: A detailed breakdown of the overall score, including:
  - **Twitter Activity**: Measures the volume of conversation around the token.
  - **Content Score**: Assesses the quality of the narrative (e.g., ratio of positive to all tweets).
  - **News Sentiment**: Analyzes the overall sentiment (positive, negative, neutral) of recent tweets.
  - **Reflexivity**: Incorporates the token's 24-hour price change as a measure of market reaction.
- **7-Day Forecast**: A chart that predicts the score's trajectory over the next week.
- **Key Metrics**: Displays essential market data such as 24-hour price change, liquidity, and trading volume.

## API Endpoint

The application is powered by a single serverless API endpoint:

### `GET /api/score`

This endpoint fetches and calculates the Belief-Velocity score for a given token.

**Query Parameters:**

- `network` (string, required): The blockchain network. Currently, only `solana` is supported.
- `address` (string, required): The contract address of the token to analyze.

**Example Request:**

```bash
curl "http://localhost:3000/api/score?network=solana&address=24QeFuBcBP1PHf8uAxyQzcDNPisEfyvoEbDgVAMyFbonk"
```

**Example Response:**

The endpoint returns a JSON object containing the full analysis, which is used to render the dashboard.

## How to Run Locally

To run the project on your local machine, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd <your-repo-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env.local` in the root of your project and add your RapidAPI key:
    ```
    RAPIDAPI_KEY=your_rapidapi_key_here
    ```
    This key is required to fetch Twitter data.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:3000`.

## Technologies Used

- **Next.js**: React framework for server-rendered applications.
- **TypeScript**: Statically typed superset of JavaScript.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **GeckoTerminal API**: For fetching real-time market data.
- **RapidAPI (Twitter)**: For fetching social media data.
- **Vercel**: For deployment.
