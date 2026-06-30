// Deterministic pseudo-random helpers so server and client render the same
// initial values (avoids hydration mismatches). Live ticking happens only
// after mount via setInterval in MarketContext.

function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateHistory(symbol: string, basePrice: number, points = 24): number[] {
  const rand = mulberry32(hashStr(symbol));
  const history: number[] = [];
  let price = basePrice * (0.97 + rand() * 0.03);
  for (let i = 0; i < points; i++) {
    const drift = (rand() - 0.5) * 0.012;
    price = Math.max(price * (1 + drift), 0.01);
    history.push(Number(price.toFixed(2)));
  }
  return history;
}

export function nextTick(price: number): number {
  const drift = (Math.random() - 0.5) * 0.01;
  return Number(Math.max(price * (1 + drift), 0.01).toFixed(2));
}
