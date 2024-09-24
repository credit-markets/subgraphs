import { newMockEvent } from "matchstick-as"
import { ethereum, Address } from "@graphprotocol/graph-ts"
import {
  FactoryAdded,
  FactoryRemoved,
  ProductAdded,
  ProductRemoved,
  TokenAdded,
  TokenRemoved
} from "../generated/Registry/Registry"

export function createFactoryAddedEvent(factoryAddress: Address): FactoryAdded {
  let factoryAddedEvent = changetype<FactoryAdded>(newMockEvent())

  factoryAddedEvent.parameters = new Array()

  factoryAddedEvent.parameters.push(
    new ethereum.EventParam(
      "factoryAddress",
      ethereum.Value.fromAddress(factoryAddress)
    )
  )

  return factoryAddedEvent
}

export function createFactoryRemovedEvent(
  factoryAddress: Address
): FactoryRemoved {
  let factoryRemovedEvent = changetype<FactoryRemoved>(newMockEvent())

  factoryRemovedEvent.parameters = new Array()

  factoryRemovedEvent.parameters.push(
    new ethereum.EventParam(
      "factoryAddress",
      ethereum.Value.fromAddress(factoryAddress)
    )
  )

  return factoryRemovedEvent
}

export function createProductAddedEvent(
  productAddresses: Array<Address>
): ProductAdded {
  let productAddedEvent = changetype<ProductAdded>(newMockEvent())

  productAddedEvent.parameters = new Array()

  productAddedEvent.parameters.push(
    new ethereum.EventParam(
      "productAddresses",
      ethereum.Value.fromAddressArray(productAddresses)
    )
  )

  return productAddedEvent
}

export function createProductRemovedEvent(
  productAddresses: Array<Address>
): ProductRemoved {
  let productRemovedEvent = changetype<ProductRemoved>(newMockEvent())

  productRemovedEvent.parameters = new Array()

  productRemovedEvent.parameters.push(
    new ethereum.EventParam(
      "productAddresses",
      ethereum.Value.fromAddressArray(productAddresses)
    )
  )

  return productRemovedEvent
}

export function createTokenAddedEvent(
  tokenAddresses: Array<Address>
): TokenAdded {
  let tokenAddedEvent = changetype<TokenAdded>(newMockEvent())

  tokenAddedEvent.parameters = new Array()

  tokenAddedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenAddresses",
      ethereum.Value.fromAddressArray(tokenAddresses)
    )
  )

  return tokenAddedEvent
}

export function createTokenRemovedEvent(
  tokenAddresses: Array<Address>
): TokenRemoved {
  let tokenRemovedEvent = changetype<TokenRemoved>(newMockEvent())

  tokenRemovedEvent.parameters = new Array()

  tokenRemovedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenAddresses",
      ethereum.Value.fromAddressArray(tokenAddresses)
    )
  )

  return tokenRemovedEvent
}
