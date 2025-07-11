# INA Credit Markets Subgraph

A comprehensive subgraph for indexing the INA Credit Markets Protocol on Arbitrum Sepolia. This subgraph tracks user accounts, token holdings, pool investments, transactions, and protocol analytics.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Local Development](#local-development)
- [Building](#building)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Entities](#entities)
- [Query Examples](#query-examples)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)

## Overview

The INA Credit Markets Subgraph indexes and aggregates data from the Credit Markets Protocol smart contracts, providing:

- **Account Tracking**: Smart wallet creation and ownership
- **Token Management**: ERC20 token holdings and transfers
- **Pool Analytics**: Investment pools, deposits, withdrawals
- **Financial Metrics**: TVL (Total Value Locked), user statistics
- **Price Feeds**: Integration with Chainlink oracles
- **Transaction History**: Complete transaction records

## Prerequisites

- **Node.js**: Version 16 or higher
- **pnpm**: v10.8.0 (specified package manager)
- **Docker & Docker Compose**: For local Graph Node
- **Graph CLI**: Installed globally or via pnpm
- **Alchemy Account**: For production deployment

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ina-subgraphs
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and add your DEPLOY_KEY from Alchemy
```

## Environment Setup

### Required Environment Variables

```bash
# Alchemy Deploy Key (required for production deployment)
DEPLOY_KEY="your_alchemy_deploy_key_here"
```

Get your deploy key from [Alchemy Dashboard](https://dashboard.alchemy.com/).

See `.env.example` for complete documentation of all environment variables.

## Local Development

### 1. Start Local Graph Node

```bash
# Start all services (Graph Node, IPFS, PostgreSQL)
docker-compose up -d

# Check logs
docker-compose logs -f graph-node
```

### 2. Create Local Subgraph

```bash
# Create the subgraph on your local node
npm run create-local

# Deploy to local node
npm run deploy-local
```

### 3. Access Local Services

- **GraphQL Playground**: http://localhost:8000/subgraphs/name/ina-credit-markets
- **Graph Node Metrics**: http://localhost:8040
- **IPFS**: http://localhost:5001
- **PostgreSQL**: localhost:5432

## Building

### Generate TypeScript Types

```bash
# Generate types from schema.graphql
graph codegen

# or
pnpm codegen
```

### Build Subgraph

```bash
# Compile and validate the subgraph
graph build

# or
pnpm build
```

## Testing

Run unit tests using Matchstick:

```bash
# Run all tests
graph test

# Run specific test file
graph test pool

# Run with coverage
graph test -- --coverage
```

## Deployment

### Deploy to Alchemy (Production)

```bash
# Ensure DEPLOY_KEY is set in .env
./deploy.sh

# or manually
graph deploy --product hosted-service \
  --deploy-key $DEPLOY_KEY \
  --version-label v1.0.0 \
  ina-credit-markets
```

### Deployment Configuration

- **Network**: Arbitrum Sepolia
- **Start Block**: 148053393
- **Registry Contract**: `0x7594B4D86BcC2745b42b6ea2bB039c1A4A7720Db`

## Project Structure

```
ina-subgraphs/
├── abis/                   # Contract ABIs
│   ├── CMAccountFactory.json
│   ├── CMPool.json
│   ├── Registry.json
│   └── ...
├── src/                    # Mapping handlers
│   ├── registry.ts        # Registry contract events
│   ├── factory.ts         # Account factory events
│   ├── account.ts         # Smart wallet events
│   ├── pool.ts           # Pool investment events
│   ├── token.ts          # ERC20 token events
│   ├── price-feed.ts     # Chainlink price feeds
│   └── analytics.ts      # Analytics calculations
├── tests/                 # Unit tests
├── schema.graphql         # GraphQL schema
├── subgraph.yaml         # Subgraph manifest
├── docker-compose.yml    # Local development setup
└── deploy.sh             # Deployment script
```

## Entities

### Core Entities

- **Factory**: Account factory contracts
- **Account**: User smart wallets with multi-owner support
- **Pool**: Investment pools with metadata
- **Token**: ERC20 tokens with price feeds
- **CreditFacilitator**: Credit facilitators managing pools

### Financial Entities

- **Holding**: Token balances per account
- **Investment**: Pool investments per account
- **Transaction**: All token transfers
- **Analytics**: Global protocol statistics
- **TVLDayData**: Daily TVL snapshots
- **UserMonthlyData**: Monthly user statistics
- **CFMonthlyData**: Monthly facilitator statistics

## Query Examples

### Get Account Details

```graphql
{
  account(id: "0x...") {
    id
    owners
    holdings {
      token {
        symbol
        name
        decimals
      }
      amount
      amountUSD
    }
    investments {
      pool {
        name
        tvl
      }
      shares
      amountInvested
    }
  }
}
```

### Get Pool Information

```graphql
{
  pools(first: 10, orderBy: tvl, orderDirection: desc) {
    id
    name
    symbol
    tvl
    totalInvested
    creditFacilitator {
      name
    }
    investors {
      account {
        id
      }
      shares
    }
  }
}
```

### Get Protocol Analytics

```graphql
{
  analytics(id: "main") {
    totalUsers
    totalPools
    totalTVL
    totalTransactions
  }
  
  tvlDayDatas(first: 30, orderBy: date, orderDirection: desc) {
    date
    tvl
    dailyChange
  }
}
```

### Get Recent Transactions

```graphql
{
  transactions(
    first: 20
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    from
    to
    token {
      symbol
    }
    amount
    amountUSD
    tag
    timestamp
  }
}
```

## Development Workflow

### 1. Schema Changes

```bash
# 1. Edit schema.graphql
# 2. Generate new types
graph codegen

# 3. Update mappings in src/
# 4. Build and test
graph build
graph test
```

### 2. Adding New Event Handlers

1. Update `subgraph.yaml` with new event handlers
2. Add ABI files if needed
3. Implement handler in appropriate TypeScript file
4. Run codegen and build

### 3. Testing Changes Locally

```bash
# 1. Start local node
docker-compose up -d

# 2. Deploy locally
npm run deploy-local

# 3. Test queries in GraphQL playground
# http://localhost:8000/subgraphs/name/ina-credit-markets
```

## Troubleshooting

### Common Issues

1. **Build Errors**
   ```bash
   # Clear generated files and rebuild
   rm -rf generated/
   graph codegen
   graph build
   ```

2. **Docker Issues**
   ```bash
   # Reset local environment
   docker-compose down -v
   docker-compose up -d
   ```

3. **Deployment Fails**
   - Check DEPLOY_KEY is correct
   - Ensure subgraph builds successfully
   - Verify contract addresses in subgraph.yaml

4. **Missing Types**
   - Run `graph codegen` after schema changes
   - Check ABI files are present and correct

### Debug Mode

Enable debug logging in docker-compose.yml:
```yaml
GRAPH_LOG: debug
```

## Best Practices

1. **Schema Design**
   - Use lowercase for entity names
   - Add proper field descriptions
   - Index frequently queried fields

2. **Mapping Handlers**
   - Keep handlers focused and efficient
   - Use early returns to skip unnecessary processing
   - Handle null values properly

3. **Testing**
   - Write tests for critical business logic
   - Test edge cases and error conditions
   - Use mock events for testing

4. **Performance**
   - Avoid excessive entity loads
   - Batch operations when possible
   - Use immutable entities when appropriate

## Resources

- [The Graph Documentation](https://thegraph.com/docs/)
- [Alchemy Subgraphs](https://docs.alchemy.com/docs/how-to-build-and-deploy-a-subgraph)
- [AssemblyScript Guide](https://www.assemblyscript.org/)
- [Matchstick Testing](https://github.com/LimeChain/matchstick)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`graph test`)
5. Build the subgraph (`graph build`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.