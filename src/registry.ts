import {
  FactoryAdded as FactoryAddedEvent,
  FactoryRemoved as FactoryRemovedEvent,
  ProductAdded as ProductAddedEvent,
  ProductRemoved as ProductRemovedEvent,
  TokenAdded as TokenAddedEvent,
  TokenRemoved as TokenRemovedEvent
} from "../generated/Registry/Registry"
import {
  Factory,
  Product,
  Token,
} from "../generated/schema"
import { InaAccountFactory, Token as TokenTemplate } from "../generated/templates"
import { store, BigInt } from '@graphprotocol/graph-ts'
import { ERC20 } from "../generated/templates/Token/ERC20"
import { AggregatorV3Interface } from "../generated/templates/PriceFeed/AggregatorV3Interface"

// Handle FactoryAdded event
export function handleFactoryAdded(event: FactoryAddedEvent): void {
  // Create or load the Factory entity
  let factory = Factory.load(event.params.factoryAddress.toHex())
  if (!factory) {
    factory = new Factory(event.params.factoryAddress.toHex())
  }
  factory.save()

  // Dynamically create a new data source for the added factory
  InaAccountFactory.create(event.params.factoryAddress)
}

// Handle FactoryRemoved event
export function handleFactoryRemoved(event: FactoryRemovedEvent): void {
  // Load the Factory entity and remove it if it exists
  let factory = Factory.load(event.params.factoryAddress.toHex())
  if (factory) {
    store.remove('Factory', event.params.factoryAddress.toHex())
  }
}

// Handle ProductAdded event
export function handleProductAdded(event: ProductAddedEvent): void {
  // Loop over the array of product addresses and create Product entities
  let productAddresses = event.params.productAddresses
  for (let i = 0; i < productAddresses.length; i++) {
    let product = Product.load(productAddresses[i].toHex())
    if (!product) {
      product = new Product(productAddresses[i].toHex())
      product.save() // Save only if the product is new
    }
  }
}

// Handle ProductRemoved event
export function handleProductRemoved(event: ProductRemovedEvent): void {
  let productAddresses = event.params.productAddresses
  for (let i = 0; i < productAddresses.length; i++) {
    let productId = productAddresses[i].toHex()
    if (Product.load(productId) != null) {
      store.remove('Product', productId) // Remove the product if it exists
    }
  }
}

// Updated TokenAdded event handler
export function handleTokenAdded(event: TokenAddedEvent): void {
  let tokenAddresses = event.params.tokenAddresses
  let priceFeedAddresses = event.params.priceFeedAddresses

  for (let i = 0; i < tokenAddresses.length; i++) {
    let tokenAddress = tokenAddresses[i]
    let priceFeedAddress = priceFeedAddresses[i]

    let token = new Token(tokenAddress.toHexString())

    // Fetch token details
    let tokenContract = ERC20.bind(tokenAddress)
    let nameResult = tokenContract.try_name()
    let symbolResult = tokenContract.try_symbol()
    let decimalsResult = tokenContract.try_decimals()

    token.name = nameResult.reverted ? "Unknown" : nameResult.value
    token.symbol = symbolResult.reverted ? "UNKNOWN" : symbolResult.value
    token.decimals = decimalsResult.reverted ? 18 : decimalsResult.value
    token.priceFeedAddress = priceFeedAddress

    // Fetch initial price data
    let priceFeedContract = AggregatorV3Interface.bind(priceFeedAddress)
    let latestRoundData = priceFeedContract.try_latestRoundData()
    if (!latestRoundData.reverted) {
      token.lastPrice = latestRoundData.value.value1
      token.lastUpdate = latestRoundData.value.value3
    } else {
      token.lastPrice = BigInt.fromI32(0)
      token.lastUpdate = BigInt.fromI32(0)
    }

    token.save()

    // Create new Token template
    TokenTemplate.create(tokenAddress)
  }
}

// Handle TokenRemoved event
export function handleTokenRemoved(event: TokenRemovedEvent): void {
  let tokenAddresses = event.params.tokenAddresses
  for (let i = 0; i < tokenAddresses.length; i++) {
    let tokenId = tokenAddresses[i].toHexString()
    if (Token.load(tokenId) != null) {
      store.remove('Token', tokenId)
    }
  }
}

