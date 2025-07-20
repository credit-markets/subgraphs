import { BigInt } from "@graphprotocol/graph-ts"

// Constants for time calculations
export const SECONDS_PER_DAY = 86400
export const SECONDS_PER_HOUR = 3600

/**
 * Calculate the start of the month for a given timestamp
 * This provides a more accurate month calculation than using a fixed 30.4 day period
 */
export function getMonthStartTimestamp(timestamp: BigInt): BigInt {
    // Convert to days since epoch
    let daysSinceEpoch = timestamp.div(BigInt.fromI32(SECONDS_PER_DAY))
    
    // Approximate month calculation (more accurate than fixed 30.4 days)
    // Using 365.25 days per year / 12 months = 30.4375 days per month
    let monthsSinceEpoch = daysSinceEpoch.times(BigInt.fromI32(1000)).div(BigInt.fromI32(30437))
    
    // Calculate start of month timestamp
    let monthStartDays = monthsSinceEpoch.times(BigInt.fromI32(30437)).div(BigInt.fromI32(1000))
    return monthStartDays.times(BigInt.fromI32(SECONDS_PER_DAY))
}

/**
 * Calculate the start of the day for a given timestamp
 */
export function getDayStartTimestamp(timestamp: BigInt): BigInt {
    let daysSinceEpoch = timestamp.div(BigInt.fromI32(SECONDS_PER_DAY))
    return daysSinceEpoch.times(BigInt.fromI32(SECONDS_PER_DAY))
}

/**
 * Helper to check if an address is the zero address
 */
export function isZeroAddress(address: string): boolean {
    return address == "0x0000000000000000000000000000000000000000"
}

/**
 * Create a composite ID from two entities
 */
export function createCompositeId(id1: string, id2: string): string {
    return id1 + "-" + id2
}

/**
 * Normalize token amount to 18 decimals for consistent TVL calculations
 */
export function normalizeTokenAmount(amount: BigInt, decimals: i32): BigInt {
    if (decimals == 18) {
        return amount
    }
    
    if (decimals < 18) {
        // Scale up
        let scaleFactor = BigInt.fromI32(10).pow((18 - decimals) as u8)
        return amount.times(scaleFactor)
    } else {
        // Scale down
        let scaleFactor = BigInt.fromI32(10).pow((decimals - 18) as u8)
        return amount.div(scaleFactor)
    }
}

/**
 * Calculate USD value with proper decimal handling
 */
export function calculateUSDValue(amount: BigInt, tokenDecimals: i32, price: BigInt, priceDecimals: i32): BigInt {
    // Normalize to 18 decimals first
    let normalizedAmount = normalizeTokenAmount(amount, tokenDecimals)
    
    // price * amount / 10^priceDecimals
    // Result will be in 18 decimals
    return normalizedAmount.times(price).div(BigInt.fromI32(10).pow(priceDecimals as u8))
}