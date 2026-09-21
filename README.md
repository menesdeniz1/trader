# Demo Trader

A Turkish-language paper-trading prototype built with Next.js, React, TypeScript and Tailwind CSS. Explore stocks, maintain a watchlist and simulate purchases, sales and TRY/USD conversions. No real orders or money transfers are made.

## Run locally

Use Node.js 22 and npm:

```sh
npm ci
npm run dev
```

Open http://localhost:3000 and enter a demo display name. Use fictional information. No account registration or API key is required.

```sh
npm run lint
npm run build
npm start
```

The build downloads Geist fonts from Google; an internet connection is required. Market requests also require connectivity.

## How it works

- React contexts manage the demo identity, portfolio, favorites and market state.
- Browser localStorage persists the simulated portfolio and watchlist. The starting balance is fictional.
- Next.js route handlers query Yahoo Finance's unofficial, keyless chart and search endpoints. Quote requests use concurrent fetching with per-result failure handling and a short in-memory cache.
- Charts use daily closing data, not an exchange-grade live feed. Missing stock quotes are marked unavailable. Currency conversion can fall back to a hardcoded exchange rate when the provider is unavailable.

## Important boundaries

This is a local learning/demo project, not a brokerage, investment recommendation or production financial service. The login screen is a display-name preference, **not authentication**. Local data can be modified in browser tools and is not isolated by user identity; do not use it for sensitive information or real balances.

The API routes have no production authentication, rate limiting or bounded cache eviction. Do not expose the app as a public service without additional controls. Availability, accuracy and permission to redistribute third-party market data must be evaluated separately. No exchange-data license is claimed.

## Verification

The September 2026 maintenance pass verified ESLint and a production build, including TypeScript compilation. There is not yet an automated trading-behavior or browser end-to-end test suite; passing a build does not validate financial correctness.
