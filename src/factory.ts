import {
    AccountCreated,
} from "../generated/templates/InaAccountFactory/InaAccountFactory"
import { Account, Factory } from "../generated/schema"
import { Bytes } from "@graphprotocol/graph-ts"
import { MultiOwnerLightAccount } from "../generated/templates"

// Handle LightAccountInitialized event
export function handleInaAccountCreated(event: AccountCreated): void {
    // Create a new Account entity using the account's address (event.address is the account being initialized)
    let account = new Account(event.address.toHex())

    // Link the account to the factory that created it
    let factory = Factory.load(event.transaction.from.toHex())
    if (factory) {
        account.factory = factory.id
    }

    // Store the owners as an array of Bytes (addresses)
    account.owners = event.params.owners.map<Bytes>((owner: Bytes) => owner)

    // Save the account entity
    account.save()

    // Create a new MultiOwnerLightAccount data source
    MultiOwnerLightAccount.create(event.address)
}