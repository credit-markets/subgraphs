import {
    AccountCreated,
} from "../generated/templates/CMAccountFactory/CMAccountFactory"
import { Account } from "../generated/schema"
import { Bytes, BigInt } from "@graphprotocol/graph-ts"
import { MultiOwnerLightAccount } from "../generated/templates"

// Handle LightAccountInitialized event
export function handleCMAccountCreated(event: AccountCreated): void {
    // Create a new Account entity using the accountAddress from the event params
    let account = new Account(event.params.accountAddress.toHexString())

    // Link the account to the factory that created it
    // The factory address is the address of the contract that emitted this event
    let factoryAddress = event.address.toHexString()
    account.factory = factoryAddress
    account.kycAttestationUID = Bytes.fromHexString('0x0000000000000000000000000000000000000000000000000000000000000000')
    account.kycLevel = 0
    // Store the owners as an array of Bytes (addresses)
    account.owners = event.params.owners.map<Bytes>((owner: Bytes) => owner)
    account.totalInterestEarned = BigInt.fromI32(0) // Initialize total interest earned


    // Save the account entity
    account.save()

    // Create a new MultiOwnerLightAccount data source
    MultiOwnerLightAccount.create(event.params.accountAddress)
}