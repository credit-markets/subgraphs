import {
  FactoryAdded as FactoryAddedEvent,
  FactoryRemoved as FactoryRemovedEvent,
  KYCAttested as KYCAttestedEvent,
  KYCRevoked as KYCRevokedEvent,
  Paused as PausedEvent,
  PoolAdded as PoolAddedEvent,
  PoolRemoved as PoolRemovedEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  TokenAdded as TokenAddedEvent,
  TokenRemoved as TokenRemovedEvent,
  Unpaused as UnpausedEvent
} from "../generated/Registry/Registry"
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
} from "../generated/schema"
import { Bytes } from "@graphprotocol/graph-ts"

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

export function handleKYCAttested(event: KYCAttestedEvent): void {
  let entity = new KYCAttested(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.smartWallet = event.params.smartWallet
  entity.kycId = event.params.kycId
  entity.kycLevel = event.params.kycLevel
  entity.attestationUID = event.params.attestationUID

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleKYCRevoked(event: KYCRevokedEvent): void {
  let entity = new KYCRevoked(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.smartWallet = event.params.smartWallet
  entity.attestationUID = event.params.attestationUID

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePaused(event: PausedEvent): void {
  let entity = new Paused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePoolAdded(event: PoolAddedEvent): void {
  let entity = new PoolAdded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.poolAddresses = changetype<Bytes[]>(event.params.poolAddresses)

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePoolRemoved(event: PoolRemovedEvent): void {
  let entity = new PoolRemoved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.poolAddresses = changetype<Bytes[]>(event.params.poolAddresses)

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let entity = new RoleAdminChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.previousAdminRole = event.params.previousAdminRole
  entity.newAdminRole = event.params.newAdminRole

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let entity = new RoleGranted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let entity = new RoleRevoked(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTokenAdded(event: TokenAddedEvent): void {
  let entity = new TokenAdded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.tokenAddresses = changetype<Bytes[]>(event.params.tokenAddresses)
  entity.priceFeedAddresses = changetype<Bytes[]>(
    event.params.priceFeedAddresses
  )

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTokenRemoved(event: TokenRemovedEvent): void {
  let entity = new TokenRemoved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.tokenAddresses = changetype<Bytes[]>(event.params.tokenAddresses)

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUnpaused(event: UnpausedEvent): void {
  let entity = new Unpaused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
