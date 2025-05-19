import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Unknown error' }, { status: 500 });
  }
} 