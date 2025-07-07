#!/bin/bash
# deploy.sh

# Load environment variables from .env file
source .env

# Generate code
npx graph codegen

# Build the subgraph
npx graph build

# Deploy
npx graph deploy credit-markets \
  --version-label $(date +%s) \
  --node https://subgraphs.alchemy.com/api/subgraphs/deploy \
  --deploy-key $DEPLOY_KEY \
  --ipfs https://ipfs.satsuma.xyz