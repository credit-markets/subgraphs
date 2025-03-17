import {
    FundsTaken as FundsTakenEvent,
    Repaid as RepaidEvent,
    Refunded as RefundedEvent,
    Transfer as TransferEvent
} from "../generated/templates/CMPool/CMPool"
import { Pool, Account, Investment, CreditFacilitator, CFMonthlyData } from "../generated/schema"
import { BigInt } from "@graphprotocol/graph-ts"
import { updateTVL, incrementTotalInvestors } from "./analytics"

export function handlePoolTransfer(event: TransferEvent): void {
    let pool = Pool.load(event.address.toHexString())
    if (!pool) return

    let fromAccount = Account.load(event.params.from.toHexString())
    let toAccount = Account.load(event.params.to.toHexString())

    if (fromAccount) {
        updateInvestment(fromAccount, pool, event.params.value.neg())
    }
    if (toAccount) {
        let isNewInvestor = updateInvestment(toAccount, pool, event.params.value)
        if (isNewInvestor) {
            incrementTotalInvestors()
        }
    }
}

function updateInvestment(account: Account, pool: Pool, sharesChange: BigInt): boolean {
    let investmentId = account.id + "-" + pool.id
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
    investment.save()

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
        updateTVL(pool.totalInvested.neg(), event.block.timestamp)

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
        pool.refunded = true
        pool.save()
    }
}

function updateCFMonthlyData(
    cf: CreditFacilitator,
    borrowedAmount: BigInt,
    repaidAmount: BigInt,
    timestamp: BigInt,
): void {
    // Calculate start of the month timestamp
    let monthTimestamp = timestamp.div(BigInt.fromI32(2629743)).times(BigInt.fromI32(2629743))
    let monthlyDataId = cf.id + "-" + monthTimestamp.toString()

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