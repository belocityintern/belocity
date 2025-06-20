import { NextRequest, NextResponse } from 'next/server';
import { GeckoTerminalClient } from './client';

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