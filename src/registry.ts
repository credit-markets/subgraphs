import {
  FactoryAdded as FactoryAddedEvent,
  FactoryRemoved as FactoryRemovedEvent,
  PoolAdded as PoolAddedEvent,
  PoolRemoved as PoolRemovedEvent,
  TokenAdded as TokenAddedEvent,
  TokenRemoved as TokenRemovedEvent,
  KYCAttested as KYCAttestedEvent,
  KYCRevoked as KYCRevokedEvent,
} from "../generated/Registry/Registry";
import { Factory, Pool, Token, Account } from "../generated/schema";
import {
  InaAccountFactory,
  Token as TokenTemplate,
  InaPool,
} from "../generated/templates";
import { InaPool as InaPoolContract } from "../generated/templates/InaPool/InaPool";
import { store, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ERC20 } from "../generated/templates/Token/ERC20";
import { AggregatorV3Interface } from "../generated/templates/PriceFeed/AggregatorV3Interface";
import { incrementTotalPools } from "./analytics";

// Handle FactoryAdded event
export function handleFactoryAdded(event: FactoryAddedEvent): void {
  // Create or load the Factory entity
  let factory = Factory.load(event.params.factoryAddress.toHex());
  if (!factory) {
    factory = new Factory(event.params.factoryAddress.toHex());
  }
  factory.save();

  // Dynamically create a new data source for the added factory
  InaAccountFactory.create(event.params.factoryAddress);
}

// Handle FactoryRemoved event
export function handleFactoryRemoved(event: FactoryRemovedEvent): void {
  // Load the Factory entity and remove it if it exists
  let factory = Factory.load(event.params.factoryAddress.toHex());
  if (factory) {
    store.remove("Factory", event.params.factoryAddress.toHex());
  }
}

// Handle PoolAdded event
export function handlePoolAdded(event: PoolAddedEvent): void {
  let poolAddresses = event.params.poolAddresses;
  for (let i = 0; i < poolAddresses.length; i++) {
    let poolAddress = poolAddresses[i];
    let pool = Pool.load(poolAddress.toHexString());
    if (!pool) {
      pool = new Pool(poolAddress.toHexString());
      // Bind the InaPool contract
      let inaPoolContract = InaPoolContract.bind(poolAddress);

      // Use try_* methods for all contract calls
      let assetResult = inaPoolContract.try_asset();
      let nameResult = inaPoolContract.try_name();
      let symbolResult = inaPoolContract.try_symbol();
      let startTimeResult = inaPoolContract.try_startTime();
      let endTimeResult = inaPoolContract.try_endTime();
      let thresholdResult = inaPoolContract.try_threshold();
      let amountToRaiseResult = inaPoolContract.try_amountToRaise();
      let feeBasisPointsResult = inaPoolContract.try_feeBasisPoints();
      let estimatedReturnBasisPointsResult =
        inaPoolContract.try_estimatedReturnBasisPoints();
      let creditFacilitatorResult = inaPoolContract.try_creditFacilitator();
      let kycLevelResult = inaPoolContract.try_kycLevel();
      let termResult = inaPoolContract.try_term();

      // Handle the asset token reference
      if (!assetResult.reverted) {
        let tokenAddress = assetResult.value;
        let token = Token.load(tokenAddress.toHexString());
        if (!token) {
          // If the token doesn't exist in our entities yet, we should skip this pool
          return;
        }
        pool.asset = token.id;
      } else {
        // If we can't get the asset address, we should skip this pool
        return;
      }

      pool.name = nameResult.reverted ? "" : nameResult.value;
      pool.symbol = symbolResult.reverted ? "" : symbolResult.value;
      pool.startTime = startTimeResult.reverted
        ? BigInt.fromI32(0)
        : startTimeResult.value;
      pool.endTime = endTimeResult.reverted
        ? BigInt.fromI32(0)
        : endTimeResult.value;
      pool.threshold = thresholdResult.reverted
        ? BigInt.fromI32(0)
        : thresholdResult.value;
      pool.amountToRaise = amountToRaiseResult.reverted
        ? BigInt.fromI32(0)
        : amountToRaiseResult.value;
      pool.feeBasisPoints = feeBasisPointsResult.reverted
        ? BigInt.fromI32(0)
        : feeBasisPointsResult.value;
      pool.estimatedReturnBasisPoints =
        estimatedReturnBasisPointsResult.reverted
          ? BigInt.fromI32(0)
          : estimatedReturnBasisPointsResult.value;
      pool.creditFacilitator = creditFacilitatorResult.reverted
        ? Bytes.fromHexString("0x0000000000000000000000000000000000000000")
        : Bytes.fromHexString(creditFacilitatorResult.value.toHexString());
      pool.kycLevel = kycLevelResult.reverted
        ? BigInt.fromI32(0)
        : kycLevelResult.value;
      pool.term = termResult.reverted ? BigInt.fromI32(0) : termResult.value;
      pool.totalInvested = BigInt.fromI32(0);
      pool.fundsTaken = false;
      pool.repaid = false;
      pool.refunded = false;

      pool.save();
      incrementTotalPools();
      pool.save();

      // Create a new InaPool data source
      InaPool.create(poolAddress);
    }
  }
}

// Handle PoolRemoved event
export function handlePoolRemoved(event: PoolRemovedEvent): void {
  let poolAddresses = event.params.poolAddresses;
  for (let i = 0; i < poolAddresses.length; i++) {
    let poolId = poolAddresses[i].toHex();
    if (Pool.load(poolId) != null) {
      store.remove("Pool", poolId); // Remove the pool if it exists
    }
  }
}

// Updated TokenAdded event handler
export function handleTokenAdded(event: TokenAddedEvent): void {
  let tokenAddresses = event.params.tokenAddresses;
  let priceFeedAddresses = event.params.priceFeedAddresses;

  for (let i = 0; i < tokenAddresses.length; i++) {
    let tokenAddress = tokenAddresses[i];
    let priceFeedAddress = priceFeedAddresses[i];

    let token = new Token(tokenAddress.toHexString());

    // Fetch token details
    let tokenContract = ERC20.bind(tokenAddress);
    let nameResult = tokenContract.try_name();
    let symbolResult = tokenContract.try_symbol();
    let decimalsResult = tokenContract.try_decimals();

    token.name = nameResult.reverted ? "Unknown" : nameResult.value;
    token.symbol = symbolResult.reverted ? "UNKNOWN" : symbolResult.value;
    token.decimals = decimalsResult.reverted ? 18 : decimalsResult.value;
    token.priceFeedAddress = priceFeedAddress;

    // Fetch initial price data
    let priceFeedContract = AggregatorV3Interface.bind(priceFeedAddress);
    let latestRoundData = priceFeedContract.try_latestRoundData();
    if (!latestRoundData.reverted) {
      token.lastPrice = latestRoundData.value.value1;
      token.lastUpdate = latestRoundData.value.value3;
    } else {
      token.lastPrice = BigInt.fromI32(0);
      token.lastUpdate = BigInt.fromI32(0);
    }

    token.save();

    // Create new Token template
    TokenTemplate.create(tokenAddress);
  }
}

// Handle TokenRemoved event
export function handleTokenRemoved(event: TokenRemovedEvent): void {
  let tokenAddresses = event.params.tokenAddresses;
  for (let i = 0; i < tokenAddresses.length; i++) {
    let tokenId = tokenAddresses[i].toHexString();
    if (Token.load(tokenId) != null) {
      store.remove("Token", tokenId);
    }
  }
}

// Handle KYCAttested event
export function handleKYCAttested(event: KYCAttestedEvent): void {
  let account = Account.load(event.params.smartWallet.toHexString());
  if (account) {
    account.kycAttestationUID = event.params.attestationUID;
    account.kycLevel = event.params.kycLevel.toI32();
    account.save();
  }
}

// Handle KYCRevoked event
export function handleKYCRevoked(event: KYCRevokedEvent): void {
  let account = Account.load(event.params.smartWallet.toHexString());
  if (account) {
    account.kycAttestationUID = Bytes.fromHexString(
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    );
    account.kycLevel = 0;
    account.save();
  }
}
