# Changelog

## [1.3.0](https://github.com/rie03p/planning-poker/compare/v1.2.0...v1.3.0) (2026-01-18)


### Features

* Active issue in the Game header is now clickable when it has a URL ([#79](https://github.com/rie03p/planning-poker/issues/79)) ([9217da9](https://github.com/rie03p/planning-poker/commit/9217da9f6f1029659f322b7ef766ffd63db2a8e4))
* add issues in bulk ([#83](https://github.com/rie03p/planning-poker/issues/83)) ([8f54106](https://github.com/rie03p/planning-poker/commit/8f54106d38cfa3c47212320fad17511d45f7402c))

## [1.2.0](https://github.com/rie03p/planning-poker/compare/v1.1.1...v1.2.0) (2026-01-12)


### Features

* add functionality to remove all issues and reset game state ([367d4a4](https://github.com/rie03p/planning-poker/commit/367d4a4fa6c279fd6339484a6a23246f78ef7599))
* add tests for removing all issues and resetting game state ([9768185](https://github.com/rie03p/planning-poker/commit/976818536b6681d943882e1a230256881a920ba5))
* delete all issues ([ab57181](https://github.com/rie03p/planning-poker/commit/ab57181df0b5702346c603400b42385c82d15d84))
* refactor issue removal ([deba6df](https://github.com/rie03p/planning-poker/commit/deba6df2f6310b4a503a00b557e4d506196e1bf7))

## [1.1.1](https://github.com/rie03p/planning-poker/compare/v1.1.0...v1.1.1) (2026-01-01)


### Bug Fixes

* Use PAT to create tags ([d32fce7](https://github.com/rie03p/planning-poker/commit/d32fce75307df1bcc577f95406d94a3a21f597aa))

## [1.1.0](https://github.com/rie03p/planning-poker/compare/v1.0.0...v1.1.0) (2026-01-01)


### Features

* add Durable Objects bindings and allowed origins for development ([#72](https://github.com/rie03p/planning-poker/issues/72)) ([d067b69](https://github.com/rie03p/planning-poker/commit/d067b69fb4f6559132c6b4db0425d3feaa00fe82))
* use issue title as dialog title and remove duplication ([#69](https://github.com/rie03p/planning-poker/issues/69)) ([ca5b246](https://github.com/rie03p/planning-poker/commit/ca5b24630fa362668cdfcdd792ec7123b2dfd7b8))

## 1.0.0 (2026-01-01)

Initial release of Planning Poker application.

### Features

- Real-time collaborative planning poker sessions
- Multiple voting systems support (Fibonacci, T-shirts, etc.)
- Issue management with voting results tracking
- WebSocket-based real-time updates
- Room capacity limits
- Server-side user ID generation for reconnection support
- Responsive UI with mobile support
- Cloudflare Workers deployment
