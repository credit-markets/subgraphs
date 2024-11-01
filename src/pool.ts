import {
    FundsTaken as FundsTakenEvent,
    Repaid as RepaidEvent,
    Refunded as RefundedEvent,
    Transfer as TransferEvent
} from "../generated/templates/InaPool/InaPool"
import { Pool, Account, Investment } from "../generated/schema"
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
    }
}

export function handleRepaid(event: RepaidEvent): void {
    let pool = Pool.load(event.address.toHexString())
    if (pool) {
        pool.repaid = true
        pool.save()
        updateTVL(pool.totalInvested.neg(), event.block.timestamp)
    }
}

export function handleRefunded(event: RefundedEvent): void {
    let pool = Pool.load(event.address.toHexString())
    if (pool) {
        pool.refunded = true
        pool.save()
    }
}