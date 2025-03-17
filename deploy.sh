#!/bin/bash
# deploy.sh

# Load environment variables from .env file
source .env

# Generate code
graph codegen

# Build the subgraph
graph build

# Deploy
graph deploy credit-markets \
  --version-label $(date +%s) \
  --node https://subgraphs.alchemy.com/api/subgraphs/deploy \
  --deploy-key $DEPLOY_KEY \
  --ipfs https://ipfs.satsuma.xyz