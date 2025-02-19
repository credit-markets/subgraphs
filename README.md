# CM Protocol Subgraph

This subgraph indexes events from the CM Protocol on the Arbitrum Sepolia network. It tracks factories, accounts, pools, tokens, and token transactions.

## Setup

1. Install dependencies:

   ```
   npm install
   ```

2. Generate types:

   ```
   graph codegen
   ```

3. Build the subgraph:
   ```
   graph build
   ```

## Deployment

To deploy the subgraph:

1. Authenticate with the Graph CLI:

   ```
   graph auth --product hosted-service <YOUR_ACCESS_TOKEN>
   ```

2. Deploy the subgraph:
   ```
   graph deploy --product hosted-service <GITHUB_USER>/<SUBGRAPH_NAME>
   ```

## Project Structure

- `schema.graphql`: Defines the data schema for the subgraph.
- `subgraph.yaml`: Configuration file that defines the data sources and mappings.
- `src/`:
  - `registry.ts`: Handles events from the Registry contract.
  - `factory.ts`: Handles events from the CMAccountFactory contract.
  - `account.ts`: Handles events from the MultiOwnerLightAccount contract.
  - `token.ts`: Handles ERC20 token transfer events.
- `abis/`: Contains the ABIs for the contracts being indexed.

## Entities

- `Factory`: Represents an CM Protocol factory.
- `Account`: Represents an account created by a factory.
- `Pool`: Represents a pool in the protocol.
- `Token`: Represents an ERC20 token supported by the protocol.
- `Holding`: Represents a token holding for an account.
- `Transaction`: Represents a token transfer involving an account.

## Development

When making changes:

1. Update `schema.graphql` if you're changing the data model.
2. Modify `subgraph.yaml` if you're changing event handlers or adding new data sources.
3. Update the TypeScript files in `src/` to implement new logic.
4. Run `graph codegen` to regenerate types after schema changes.
5. Run `graph build` to check for any build errors.
6. Test locally if possible before deploying.

## Querying

Once deployed, you can query the subgraph using GraphQL. Example query:

```graphql
{
  accounts(first: 5) {
    id
    owners
    holdings {
      token {
        symbol
      }
      amount
    }
    transactions(first: 10) {
      token {
        symbol
      }
      amount
      tag
    }
  }
}
```

This query fetches the first 5 accounts, their owners, holdings, and recent transactions.
