import { NextRequest, NextResponse } from "next/server";
import { searchYahooSymbols } from "@/lib/yahooFinance";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchYahooSymbols(q);
  return NextResponse.json({ results });
}
