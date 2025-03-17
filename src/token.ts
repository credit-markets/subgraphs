import { Transfer as TransferEvent } from "../generated/templates/Token/ERC20"
import { Token, Account, Holding, Transaction, Pool, UserMonthlyData, CreditFacilitator } from "../generated/schema"
import { BigInt } from "@graphprotocol/graph-ts"
import { updateTVL } from "./analytics"

export function handleTransfer(event: TransferEvent): void {
    let token = Token.load(event.address.toHexString())
    if (!token) return

    let fromAccount = Account.load(event.params.from.toHexString())
    let toAccount = Account.load(event.params.to.toHexString())

    // Check if this is a transfer to or from a pool
    let fromPool = Pool.load(event.params.from.toHexString())
    let toPool = Pool.load(event.params.to.toHexString())

    // Check if this involves a Credit Facilitator
    let fromCF = CreditFacilitator.load(event.params.from.toHexString())
    let toCF = CreditFacilitator.load(event.params.to.toHexString())

    if (fromAccount) {
        updateHolding(fromAccount, token, event.params.value.neg())
        if (!fromPool) {
            createTransaction(event, token, "WITHDRAW", fromAccount.id)
        }
    }

    if (toAccount) {
        updateHolding(toAccount, token, event.params.value)
        if (!toPool) {
            createTransaction(event, token, "DEPOSIT", toAccount.id)
        }
    }

    // Handle specific transaction types
    if (fromPool && toCF && fromPool.creditFacilitator == toCF.id) {
        // This is a BORROW transaction (funds taken by CF)
        createTransaction(
            event,
            token,
            "BORROW",
            toCF.id
        )
    }
    else if (fromCF && toPool && toPool.creditFacilitator == fromCF.id) {
        // This is a REPAYMENT transaction (CF repaying the pool)
        createTransaction(
            event,
            token,
            "REPAYMENT",
            fromCF.id
        )
    } else if (fromPool) {
        let toAccountId = toAccount ? toAccount.id : event.params.to.toHexString()

        // Calculate principal and interest using estimatedReturnBasisPoints
        let account = Account.load(toAccountId)
        if (account && fromPool.estimatedReturnBasisPoints) {
            let repaymentAmount = event.params.value
            let basisPoints = fromPool.estimatedReturnBasisPoints

            // Calculate principal: repaymentAmount / (1 + returnRate)
            let returnRateNumerator = BigInt.fromI32(10000).plus(basisPoints)
            let principal = repaymentAmount.times(BigInt.fromI32(10000)).div(returnRateNumerator)

            // Calculate interest: repaymentAmount - principal
            let interestEarned = repaymentAmount.minus(principal)

            // Update total interest earned
            account.totalInterestEarned = account.totalInterestEarned.plus(interestEarned)
            account.save()

            // Update monthly data
            updateMonthlyData(account, principal, interestEarned, event.block.timestamp)
        }

        createTransaction(event, token, "REPAY", toAccountId)
    } else if (toPool) {
        let fromAccountId = fromAccount ? fromAccount.id : event.params.from.toHexString()
        createTransaction(event, token, "INVEST", fromAccountId)
        updateTVL(event.params.value, event.block.timestamp)
    }
}

function updateMonthlyData(account: Account, principal: BigInt, interest: BigInt, timestamp: BigInt): void {
    // Calculate start of the month timestamp
    let monthTimestamp = timestamp.div(BigInt.fromI32(2629743)).times(BigInt.fromI32(2629743))
    let monthlyDataId = account.id + "-" + monthTimestamp.toString()

    let monthlyData = UserMonthlyData.load(monthlyDataId)
    if (!monthlyData) {
        monthlyData = new UserMonthlyData(monthlyDataId)
        monthlyData.account = account.id
        monthlyData.timestamp = monthTimestamp
        monthlyData.principal = BigInt.fromI32(0)
        monthlyData.interest = BigInt.fromI32(0)
    }

    monthlyData.principal = monthlyData.principal.plus(principal)
    monthlyData.interest = monthlyData.interest.plus(interest)
    monthlyData.save()
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

function createTransaction(event: TransferEvent, token: Token, tag: string, accountId: string): void {
    let transaction = new Transaction(event.transaction.hash.toHexString())
    transaction.account = accountId
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