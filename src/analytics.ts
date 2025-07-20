import { BigInt } from "@graphprotocol/graph-ts"
import { Analytics, TVLDayData } from "../generated/schema"
import { getDayStartTimestamp } from "./utils"

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

export function updateTVL(changeAmount: BigInt, blockTimestamp: BigInt): void {
    let analytics = getOrCreateAnalytics()
    analytics.tvl = analytics.tvl.plus(changeAmount)
    analytics.save()

    // Update daily TVL data
    updateTVLDayData(analytics.tvl, blockTimestamp)
}

function updateTVLDayData(currentTVL: BigInt, blockTimestamp: BigInt): void {
    let dayStartTimestamp = getDayStartTimestamp(blockTimestamp)
    let dayID = dayStartTimestamp.div(BigInt.fromI32(86400)).toString()
    let tvlDayData = TVLDayData.load(dayID)

    if (!tvlDayData) {
        tvlDayData = new TVLDayData(dayID)
        tvlDayData.timestamp = dayStartTimestamp
    }

    tvlDayData.tvl = currentTVL
    tvlDayData.save()
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

export function decrementTotalPools(): void {
    let analytics = getOrCreateAnalytics()
    if (analytics.totalPools > 0) {
        analytics.totalPools -= 1
        analytics.save()
    }
}

export function decrementTotalInvestors(): void {
    let analytics = getOrCreateAnalytics()
    if (analytics.totalInvestors > 0) {
        analytics.totalInvestors -= 1
        analytics.save()
    }
}