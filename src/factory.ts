import {
    AccountCreated,
} from "../generated/templates/InaAccountFactory/InaAccountFactory"
import { Account, Factory } from "../generated/schema"
import { Bytes } from "@graphprotocol/graph-ts"
import { MultiOwnerLightAccount } from "../generated/templates"

// Handle LightAccountInitialized event
export function handleInaAccountCreated(event: AccountCreated): void {
    // Create a new Account entity using the accountAddress from the event params
    let account = new Account(event.params.accountAddress.toHexString())

    // Link the account to the factory that created it
    // The factory address is the address of the contract that emitted this event
    let factoryAddress = event.address.toHexString()
    account.factory = factoryAddress

    // Store the owners as an array of Bytes (addresses)
    account.owners = event.params.owners.map<Bytes>((owner: Bytes) => owner)

    // Save the account entity
    account.save()

    // Create a new MultiOwnerLightAccount data source
    MultiOwnerLightAccount.create(event.params.accountAddress)
}