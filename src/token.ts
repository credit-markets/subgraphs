import { Transfer as TransferEvent } from "../generated/templates/Token/ERC20"
import { Token, Account, Holding, Transaction, Pool, UserMonthlyData } from "../generated/schema"
import { BigInt } from "@graphprotocol/graph-ts"
import { getMonthStartTimestamp, createCompositeId, calculateUSDValue } from "./utils"

export function handleTransfer(event: TransferEvent): void {
    let token = Token.load(event.address.toHexString())
    if (!token) return

    // Load accounts - they should exist from factory creation, but check anyway
    let fromAccount = Account.load(event.params.from.toHexString())
    let toAccount = Account.load(event.params.to.toHexString())

    // Check if this is a transfer to or from a pool
    let fromPool = Pool.load(event.params.from.toHexString())
    let toPool = Pool.load(event.params.to.toHexString())

    // Update holdings for accounts (not pools)
    if (fromAccount && !fromPool) {
        updateHolding(fromAccount, token, event.params.value.neg())
        // Account sending tokens (not from a pool) = WITHDRAW
        createTransaction(event, token, "WITHDRAW", fromAccount.id)
    }

    if (toAccount && !toPool) {
        updateHolding(toAccount, token, event.params.value)
        // Account receiving tokens (not to a pool) = DEPOSIT
        createTransaction(event, token, "DEPOSIT", toAccount.id)
    }

    // Handle pool-specific transactions
    if (fromPool && toAccount) {
        // Only count as REPAY if after the term period (endTime + term)
        let repaymentStartTime = fromPool.endTime.plus(fromPool.term)
        
        if (event.block.timestamp.ge(repaymentStartTime)) {
            // This is during the repayment period
            
            // Calculate interest if pool has return basis points
            if (fromPool.estimatedReturnBasisPoints.gt(BigInt.fromI32(0))) {
                let repaymentAmount = event.params.value
                let basisPoints = fromPool.estimatedReturnBasisPoints

                // Calculate principal and interest
                let returnRateNumerator = BigInt.fromI32(10000).plus(basisPoints)
                let principal = repaymentAmount.times(BigInt.fromI32(10000)).div(returnRateNumerator)
                let interestEarned = repaymentAmount.minus(principal)

                // Update total interest earned
                toAccount.totalInterestEarned = toAccount.totalInterestEarned.plus(interestEarned)
                toAccount.save()

                // Update monthly data
                updateMonthlyData(toAccount, principal, interestEarned, event.block.timestamp)
            }
            
            createTransaction(event, token, "REPAY", toAccount.id)
        }
        // If before repayment period, it's admin operations - don't create transaction
        
    } else if (toPool && fromAccount) {
        // Only count as INVEST if during the investment period (between startTime and endTime)
        if (event.block.timestamp.ge(toPool.startTime) && event.block.timestamp.le(toPool.endTime)) {
            createTransaction(event, token, "INVEST", fromAccount.id)
            
            // Note: TVL is updated in pool.ts when shares are minted, not here
            // This avoids double-counting
        }
        // If outside investment period, it's admin operations - don't create transaction
    }
}

function updateMonthlyData(account: Account, principal: BigInt, interest: BigInt, timestamp: BigInt): void {
    let monthTimestamp = getMonthStartTimestamp(timestamp)
    let monthlyDataId = createCompositeId(account.id, monthTimestamp.toString())

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
    let holdingId = createCompositeId(account.id, token.id)
    let holding = Holding.load(holdingId)

    if (!holding) {
        holding = new Holding(holdingId)
        holding.account = account.id
        holding.token = token.id
        holding.amount = BigInt.fromI32(0)
    }

    holding.amount = holding.amount.plus(changeAmount)
    // Only save if amount is non-negative
    if (holding.amount.ge(BigInt.fromI32(0))) {
        holding.save()
    }
}

function createTransaction(event: TransferEvent, token: Token, tag: string, accountId: string): void {
    // Use composite key to handle multiple transfers in same tx
    let transactionId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
    let transaction = new Transaction(transactionId)
    transaction.account = accountId
    transaction.from = event.params.from
    transaction.to = event.params.to
    transaction.token = token.id
    transaction.timestamp = event.block.timestamp
    transaction.amount = event.params.value
    transaction.tag = tag

    // Calculate USD value with proper decimal handling
    transaction.value = calculateUSDValue(
        event.params.value,
        token.decimals,
        token.lastPrice,
        8 // Chainlink typically uses 8 decimals
    )

    transaction.save()
}