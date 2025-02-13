import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  FactoryAdded,
  FactoryRemoved,
  KYCAttested,
  KYCRevoked,
  Paused,
  PoolAdded,
  PoolRemoved,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  TokenAdded,
  TokenRemoved,
  Unpaused
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

export function createKYCAttestedEvent(
  smartWallet: Address,
  kycId: BigInt,
  kycLevel: BigInt,
  attestationUID: Bytes
): KYCAttested {
  let kycAttestedEvent = changetype<KYCAttested>(newMockEvent())

  kycAttestedEvent.parameters = new Array()

  kycAttestedEvent.parameters.push(
    new ethereum.EventParam(
      "smartWallet",
      ethereum.Value.fromAddress(smartWallet)
    )
  )
  kycAttestedEvent.parameters.push(
    new ethereum.EventParam("kycId", ethereum.Value.fromUnsignedBigInt(kycId))
  )
  kycAttestedEvent.parameters.push(
    new ethereum.EventParam(
      "kycLevel",
      ethereum.Value.fromUnsignedBigInt(kycLevel)
    )
  )
  kycAttestedEvent.parameters.push(
    new ethereum.EventParam(
      "attestationUID",
      ethereum.Value.fromFixedBytes(attestationUID)
    )
  )

  return kycAttestedEvent
}

export function createKYCRevokedEvent(
  smartWallet: Address,
  attestationUID: Bytes
): KYCRevoked {
  let kycRevokedEvent = changetype<KYCRevoked>(newMockEvent())

  kycRevokedEvent.parameters = new Array()

  kycRevokedEvent.parameters.push(
    new ethereum.EventParam(
      "smartWallet",
      ethereum.Value.fromAddress(smartWallet)
    )
  )
  kycRevokedEvent.parameters.push(
    new ethereum.EventParam(
      "attestationUID",
      ethereum.Value.fromFixedBytes(attestationUID)
    )
  )

  return kycRevokedEvent
}

export function createPausedEvent(account: Address): Paused {
  let pausedEvent = changetype<Paused>(newMockEvent())

  pausedEvent.parameters = new Array()

  pausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return pausedEvent
}

export function createPoolAddedEvent(poolAddresses: Array<Address>): PoolAdded {
  let poolAddedEvent = changetype<PoolAdded>(newMockEvent())

  poolAddedEvent.parameters = new Array()

  poolAddedEvent.parameters.push(
    new ethereum.EventParam(
      "poolAddresses",
      ethereum.Value.fromAddressArray(poolAddresses)
    )
  )

  return poolAddedEvent
}

export function createPoolRemovedEvent(
  poolAddresses: Array<Address>
): PoolRemoved {
  let poolRemovedEvent = changetype<PoolRemoved>(newMockEvent())

  poolRemovedEvent.parameters = new Array()

  poolRemovedEvent.parameters.push(
    new ethereum.EventParam(
      "poolAddresses",
      ethereum.Value.fromAddressArray(poolAddresses)
    )
  )

  return poolRemovedEvent
}

export function createRoleAdminChangedEvent(
  role: Bytes,
  previousAdminRole: Bytes,
  newAdminRole: Bytes
): RoleAdminChanged {
  let roleAdminChangedEvent = changetype<RoleAdminChanged>(newMockEvent())

  roleAdminChangedEvent.parameters = new Array()

  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "previousAdminRole",
      ethereum.Value.fromFixedBytes(previousAdminRole)
    )
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newAdminRole",
      ethereum.Value.fromFixedBytes(newAdminRole)
    )
  )

  return roleAdminChangedEvent
}

export function createRoleGrantedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleGranted {
  let roleGrantedEvent = changetype<RoleGranted>(newMockEvent())

  roleGrantedEvent.parameters = new Array()

  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleGrantedEvent
}

export function createRoleRevokedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleRevoked {
  let roleRevokedEvent = changetype<RoleRevoked>(newMockEvent())

  roleRevokedEvent.parameters = new Array()

  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleRevokedEvent
}

export function createTokenAddedEvent(
  tokenAddresses: Array<Address>,
  priceFeedAddresses: Array<Address>
): TokenAdded {
  let tokenAddedEvent = changetype<TokenAdded>(newMockEvent())

  tokenAddedEvent.parameters = new Array()

  tokenAddedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenAddresses",
      ethereum.Value.fromAddressArray(tokenAddresses)
    )
  )
  tokenAddedEvent.parameters.push(
    new ethereum.EventParam(
      "priceFeedAddresses",
      ethereum.Value.fromAddressArray(priceFeedAddresses)
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

export function createUnpausedEvent(account: Address): Unpaused {
  let unpausedEvent = changetype<Unpaused>(newMockEvent())

  unpausedEvent.parameters = new Array()

  unpausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return unpausedEvent
}
