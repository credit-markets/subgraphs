import { Transfer as TransferEvent } from "../generated/templates/Token/ERC20"
import { Token, Account, Holding, Transaction } from "../generated/schema"
import { BigInt } from "@graphprotocol/graph-ts"

export function handleTransfer(event: TransferEvent): void {
    let token = Token.load(event.address.toHexString())
    if (!token) return

    let fromAccount = Account.load(event.params.from.toHexString())
    let toAccount = Account.load(event.params.to.toHexString())

    if (fromAccount) {
        updateHolding(fromAccount, token, event.params.value.neg())
        createTransaction(fromAccount, event, token, "WITHDRAW")
    }

    if (toAccount) {
        updateHolding(toAccount, token, event.params.value)
        createTransaction(toAccount, event, token, "DEPOSIT")
    }
}

function updateHolding(account: Account, token: Token, changeAmount: BigInt): void {
    let holdingId = account.id + "-" + token.id
    let holding = Holding.load(holdingId)

    if (!holding) {
        holding = new Holding(holdingId)
        holding.account = account.id
        holding.token = token.id
        holding.amount = BigInt.fromI32(0)
    }

    holding.amount = holding.amount.plus(changeAmount)
    holding.save()
}


function createTransaction(account: Account, event: TransferEvent, token: Token, tag: string): void {
    let transaction = new Transaction(event.transaction.hash.toHexString() + "-" + account.id)
    transaction.account = account.id
    transaction.from = event.params.from
    transaction.to = event.params.to
    transaction.token = token.id
    transaction.timestamp = event.block.timestamp
    transaction.amount = event.params.value
    transaction.tag = tag

    // Calculate USD value
    let price = token.lastPrice
    let decimals = BigInt.fromI32(token.decimals)
    let priceDecimals = BigInt.fromI32(8) // Chainlink typically uses 8 decimals

    let value = event.params.value
        .times(price)
        .div(BigInt.fromI32(10).pow((decimals.plus(priceDecimals)).toI32() as u8))

    transaction.value = value

    transaction.save()
}