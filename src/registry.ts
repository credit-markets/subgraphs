import {
  FactoryAdded as FactoryAddedEvent,
  FactoryRemoved as FactoryRemovedEvent,
  PoolAdded as PoolAddedEvent,
  PoolRemoved as PoolRemovedEvent,
  TokenAdded as TokenAddedEvent,
  TokenRemoved as TokenRemovedEvent,
  KycAttested as KycAttestedEvent,
  KycRevoked as KycRevokedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  Registry,
} from "../generated/Registry/Registry";
import {
  Factory,
  Pool,
  Token,
  Account,
  CreditFacilitator,
} from "../generated/schema";
import {
  CMAccountFactory,
  Token as TokenTemplate,
  CMPool,
} from "../generated/templates";
import { store, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ERC20 } from "../generated/templates/Token/ERC20";
import { AggregatorV3Interface } from "../generated/templates/PriceFeed/AggregatorV3Interface";
import { CMPool as CMPoolContract } from "../generated/templates/CMPool/CMPool";
import { decrementTotalPools, updateTVL, incrementTotalPools } from "./analytics";

// Handle FactoryAdded event
export function handleFactoryAdded(event: FactoryAddedEvent): void {
  // Create or load the Factory entity
  let factory = Factory.load(event.params.factoryAddress.toHex());
  if (!factory) {
    factory = new Factory(event.params.factoryAddress.toHex());
  }
  factory.save();

  // Dynamically create a new data source for the added factory
  CMAccountFactory.create(event.params.factoryAddress);
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
    let poolId = poolAddress.toHexString();
    
    // Check if pool already exists to avoid double counting
    let existingPool = Pool.load(poolId);
    if (!existingPool) {
      // Create the pool entity by reading from the contract
      let pool = new Pool(poolId);
      let poolContract = CMPoolContract.bind(poolAddress);
      
      // Read pool data from contract
      let assetResult = poolContract.try_asset();
      let nameResult = poolContract.try_name();
      let symbolResult = poolContract.try_symbol();
      let startTimeResult = poolContract.try_START_TIME();
      let endTimeResult = poolContract.try_END_TIME();
      let thresholdResult = poolContract.try_THRESHOLD();
      let amountToRaiseResult = poolContract.try_AMOUNT_TO_RAISE();
      let feeBasisPointsResult = poolContract.try_FEE_BASIS_POINTS();
      let estimatedReturnBasisPointsResult = poolContract.try_ESTIMATED_RETURN_BASIS_POINTS();
      let creditFacilitatorResult = poolContract.try_CREDIT_FACILITATOR();
      let kycLevelResult = poolContract.try_KYC_LEVEL();
      let termResult = poolContract.try_TERM();
      
      // Set pool data with proper error handling
      pool.asset = assetResult.reverted ? "0x0000000000000000000000000000000000000000" : assetResult.value.toHexString();
      pool.name = nameResult.reverted ? "Unknown Pool" : nameResult.value;
      pool.symbol = symbolResult.reverted ? "UNKNOWN" : symbolResult.value;
      pool.startTime = startTimeResult.reverted ? BigInt.fromI32(0) : startTimeResult.value;
      pool.endTime = endTimeResult.reverted ? BigInt.fromI32(0) : endTimeResult.value;
      pool.threshold = thresholdResult.reverted ? BigInt.fromI32(0) : thresholdResult.value;
      pool.amountToRaise = amountToRaiseResult.reverted ? BigInt.fromI32(0) : amountToRaiseResult.value;
      pool.feeBasisPoints = feeBasisPointsResult.reverted ? BigInt.fromI32(0) : feeBasisPointsResult.value;
      pool.estimatedReturnBasisPoints = estimatedReturnBasisPointsResult.reverted ? BigInt.fromI32(0) : estimatedReturnBasisPointsResult.value;
      pool.creditFacilitator = creditFacilitatorResult.reverted ? "0x0000000000000000000000000000000000000000" : creditFacilitatorResult.value.toHexString();
      pool.kycLevel = kycLevelResult.reverted ? BigInt.fromI32(0) : kycLevelResult.value;
      pool.term = termResult.reverted ? BigInt.fromI32(0) : termResult.value;
      pool.totalInvested = BigInt.fromI32(0);
      pool.fundsTaken = false;
      pool.repaid = false;
      pool.refunded = false;
      
      pool.save();
      incrementTotalPools();
      
      // Create the CMPool template instance to listen for events
      CMPool.create(poolAddress);
    }
  }
}

// Handle PoolRemoved event
export function handlePoolRemoved(event: PoolRemovedEvent): void {
  let poolAddresses = event.params.poolAddresses;
  for (let i = 0; i < poolAddresses.length; i++) {
    let poolId = poolAddresses[i].toHex();
    let pool = Pool.load(poolId);
    if (pool != null) {
      // Update TVL before removing pool only if not already refunded
      if (!pool.refunded && pool.totalInvested.gt(BigInt.fromI32(0))) {
        updateTVL(pool.totalInvested.neg(), event.block.timestamp);
      }
      store.remove("Pool", poolId);
      decrementTotalPools();
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

// Handle KycAttested event
export function handleKycAttested(event: KycAttestedEvent): void {
  let account = Account.load(event.params.smartWallet.toHexString());
  if (account) {
    account.kycAttestationUid = event.params.attestationUid;
    account.kycLevel = event.params.kycLevel.toI32();
    account.save();
  }
}

// Handle KycRevoked event
export function handleKycRevoked(event: KycRevokedEvent): void {
  let account = Account.load(event.params.smartWallet.toHexString());
  if (account) {
    account.kycAttestationUid = Bytes.fromHexString(
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    );
    account.kycLevel = 0;
    account.save();
  }
}

// These are the event handlers
export function handleRoleGranted(event: RoleGrantedEvent): void {
  // Get the registry contract to check the CF role constant
  let registry = Registry.bind(event.address);
  let cfRoleResult = registry.try_CREDIT_FACILITATOR_ROLE();

  // Check if this is granting the CF role
  if (!cfRoleResult.reverted && event.params.role.equals(cfRoleResult.value)) {
    let cfId = event.params.account.toHexString();
    let accountEntity = Account.load(cfId);

    if (accountEntity) {
      // Create or update the CF entity
      let cf = CreditFacilitator.load(cfId);
      if (!cf) {
        cf = new CreditFacilitator(cfId);
        cf.account = accountEntity.id;
        cf.active = true;
        cf.save();
      } else if (!cf.active) {
        cf.active = true;
        cf.save();
      }
    }
  }
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  // Get the registry contract to check the CF role constant
  let registry = Registry.bind(event.address);
  let cfRoleResult = registry.try_CREDIT_FACILITATOR_ROLE();

  // Check if this is revoking the CF role
  if (!cfRoleResult.reverted && event.params.role.equals(cfRoleResult.value)) {
    let cfId = event.params.account.toHexString();
    let cf = CreditFacilitator.load(cfId);

    if (cf) {
      cf.active = false;
      cf.save();
    }
  }
}
