import {
    FundsTaken as FundsTakenEvent,
    Repaid as RepaidEvent,
    Refunded as RefundedEvent,
    Transfer as TransferEvent
} from "../generated/templates/CMPool/CMPool"
import { Pool, Account, Investment, CreditFacilitator, CFMonthlyData } from "../generated/schema"
import { BigInt, store } from "@graphprotocol/graph-ts"
import { updateTVL, incrementTotalInvestors } from "./analytics"
import { getMonthStartTimestamp, createCompositeId, normalizeTokenAmount } from "./utils"
import { Token } from "../generated/schema"

// Note: handleCMPoolCreated is removed because the event is emitted in the constructor
// before we start listening to the pool. Pool initialization is handled in registry.ts

export function handlePoolTransfer(event: TransferEvent): void {
    let pool = Pool.load(event.address.toHexString())
    if (!pool) return

    let fromAddress = event.params.from.toHexString()
    let toAddress = event.params.to.toHexString()
    let value = event.params.value
    
    // Handle burning (from account exists, to is zero address)
    if (fromAddress != "0x0000000000000000000000000000000000000000") {
        let fromAccount = Account.load(fromAddress)
        if (fromAccount) {
            updateInvestment(fromAccount, pool, value.neg())
        }
    }
    
    // Handle minting (to account exists, from is zero address)
    if (toAddress != "0x0000000000000000000000000000000000000000") {
        let toAccount = Account.load(toAddress)
        if (toAccount) {
            let isNewInvestor = updateInvestment(toAccount, pool, value)
            if (isNewInvestor) {
                incrementTotalInvestors()
            }
            
            // Update totalInvested on initial investment (minting from zero address)
            if (fromAddress == "0x0000000000000000000000000000000000000000") {
                pool.totalInvested = pool.totalInvested.plus(value)
                pool.save()
                
                // Update TVL with normalized amount
                let token = Token.load(pool.asset)
                if (token) {
                    let normalizedAmount = normalizeTokenAmount(value, token.decimals)
                    updateTVL(normalizedAmount, event.block.timestamp)
                }
            }
        }
    }
}

function updateInvestment(account: Account, pool: Pool, sharesChange: BigInt): boolean {
    let investmentId = createCompositeId(account.id, pool.id)
    let investment = Investment.load(investmentId)
    let isNewInvestor = false

    if (!investment) {
        investment = new Investment(investmentId)
        investment.account = account.id
        investment.pool = pool.id
        investment.shares = BigInt.fromI32(0)
        isNewInvestor = true
    }

    investment.shares = investment.shares.plus(sharesChange)
    
    // Only save if shares are greater than 0
    if (investment.shares.gt(BigInt.fromI32(0))) {
        investment.save()
    } else {
        // Remove investment if shares reach 0 or below
        if (!isNewInvestor) {
            store.remove("Investment", investmentId)
        }
        // Don't save new investments with 0 shares
    }

    return isNewInvestor
}

export function handleFundsTaken(event: FundsTakenEvent): void {
    let pool = Pool.load(event.address.toHexString())
    if (pool) {
        pool.fundsTaken = true
        pool.save()

        // Update CF monthly data for the borrow action
        let cf = CreditFacilitator.load(pool.creditFacilitator)
        if (cf) {
            updateCFMonthlyData(
                cf,
                event.params.amount,  // borrowed amount
                BigInt.fromI32(0),    // repaid amount (none for this event)
                event.block.timestamp
            )
        }
    }
}

export function handleRepaid(event: RepaidEvent): void {
    let pool = Pool.load(event.address.toHexString())
    if (pool) {
        pool.repaid = true
        pool.save()
        // TVL decreases when pool is repaid - use normalized amount
        let token = Token.load(pool.asset)
        if (token) {
            let normalizedAmount = normalizeTokenAmount(pool.totalInvested, token.decimals)
            updateTVL(normalizedAmount.neg(), event.block.timestamp)
        }

        // Update CF monthly data for the repayment action
        let cf = CreditFacilitator.load(pool.creditFacilitator)
        if (cf) {

            updateCFMonthlyData(
                cf,
                BigInt.fromI32(0),    // borrowed amount (none for this event)
                event.params.amount,  // repaid amount
                event.block.timestamp,
            )
        }
    }
}

export function handleRefunded(event: RefundedEvent): void {
    let pool = Pool.load(event.address.toHexString())
    if (pool) {
        // This event is per-investor, not for the whole pool
        // Update the specific investor's investment record
        let investor = Account.load(event.params.investor.toHexString())
        if (investor) {
            let investmentId = createCompositeId(investor.id, pool.id)
            let investment = Investment.load(investmentId)
            if (investment && investment.shares.gt(BigInt.fromI32(0))) {
                // Remove the investment since funds are refunded
                store.remove("Investment", investmentId)
                
                // Decrease TVL by the refunded amount (normalized)
                let token = Token.load(pool.asset)
                if (token) {
                    let normalizedAmount = normalizeTokenAmount(event.params.amount, token.decimals)
                    updateTVL(normalizedAmount.neg(), event.block.timestamp)
                }
            }
        }
        
        // Mark pool as refunded (this might be called multiple times)
        if (!pool.refunded) {
            pool.refunded = true
            pool.save()
        }
    }
}

function updateCFMonthlyData(
    cf: CreditFacilitator,
    borrowedAmount: BigInt,
    repaidAmount: BigInt,
    timestamp: BigInt,
): void {
    // Calculate start of the month timestamp
    let monthTimestamp = getMonthStartTimestamp(timestamp)
    let monthlyDataId = createCompositeId(cf.id, monthTimestamp.toString())

    let monthlyData = CFMonthlyData.load(monthlyDataId)
    if (!monthlyData) {
        monthlyData = new CFMonthlyData(monthlyDataId)
        monthlyData.creditFacilitator = cf.id
        monthlyData.timestamp = monthTimestamp
        monthlyData.borrowedAmount = BigInt.fromI32(0)
        monthlyData.repaidAmount = BigInt.fromI32(0)
    }

    monthlyData.borrowedAmount = monthlyData.borrowedAmount.plus(borrowedAmount)
    monthlyData.repaidAmount = monthlyData.repaidAmount.plus(repaidAmount)

    monthlyData.save()
}