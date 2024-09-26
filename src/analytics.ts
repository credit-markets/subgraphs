import { BigInt } from "@graphprotocol/graph-ts"
import { Analytics } from "../generated/schema"

export function getOrCreateAnalytics(): Analytics {
    let analytics = Analytics.load("1")
    if (!analytics) {
        analytics = new Analytics("1")
        analytics.tvl = BigInt.fromI32(0)
        analytics.totalInvestors = 0
        analytics.totalPools = 0
        analytics.save()
    }
    return analytics as Analytics
}

export function updateTVL(changeAmount: BigInt): void {
    let analytics = getOrCreateAnalytics()
    analytics.tvl = analytics.tvl.plus(changeAmount)
    analytics.save()
}

export function incrementTotalInvestors(): void {
    let analytics = getOrCreateAnalytics()
    analytics.totalInvestors += 1
    analytics.save()
}

export function incrementTotalPools(): void {
    let analytics = getOrCreateAnalytics()
    analytics.totalPools += 1
    analytics.save()
}