import {
  FactoryAdded as FactoryAddedEvent,
  FactoryRemoved as FactoryRemovedEvent,
  ProductAdded as ProductAddedEvent,
  ProductRemoved as ProductRemovedEvent,
  TokenAdded as TokenAddedEvent,
  TokenRemoved as TokenRemovedEvent
} from "../generated/Registry/Registry"
import {
  FactoryAdded,
  FactoryRemoved,
  ProductAdded,
  ProductRemoved,
  TokenAdded,
  TokenRemoved
} from "../generated/schema"

export function handleFactoryAdded(event: FactoryAddedEvent): void {
  let entity = new FactoryAdded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.factoryAddress = event.params.factoryAddress

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFactoryRemoved(event: FactoryRemovedEvent): void {
  let entity = new FactoryRemoved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.factoryAddress = event.params.factoryAddress

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleProductAdded(event: ProductAddedEvent): void {
  let entity = new ProductAdded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.productAddresses = event.params.productAddresses

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleProductRemoved(event: ProductRemovedEvent): void {
  let entity = new ProductRemoved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.productAddresses = event.params.productAddresses

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTokenAdded(event: TokenAddedEvent): void {
  let entity = new TokenAdded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.tokenAddresses = event.params.tokenAddresses

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTokenRemoved(event: TokenRemovedEvent): void {
  let entity = new TokenRemoved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.tokenAddresses = event.params.tokenAddresses

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
