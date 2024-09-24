import {
    OwnersUpdated
} from "../generated/templates/MultiOwnerLightAccount/MultiOwnerLightAccount"
import { Account } from "../generated/schema"

export function handleOwnersUpdated(event: OwnersUpdated): void {
    let account = Account.load(event.address.toHex())
    if (account) {
        let currentOwners = account.owners

        // Remove owners
        for (let i = 0; i < event.params.removedOwners.length; i++) {
            let index = currentOwners.indexOf(event.params.removedOwners[i])
            if (index > -1) {
                currentOwners.splice(index, 1)
            }
        }

        // Add new owners
        for (let i = 0; i < event.params.addedOwners.length; i++) {
            if (!currentOwners.includes(event.params.addedOwners[i])) {
                currentOwners.push(event.params.addedOwners[i])
            }
        }

        account.owners = currentOwners
        account.save()
    }
}