import { AnswerUpdated as AnswerUpdatedEvent } from "../generated/templates/PriceFeed/AggregatorV3Interface"
import { Token } from "../generated/schema"

export function handleAnswerUpdated(event: AnswerUpdatedEvent): void {
    let priceFeedAddress = event.address

    // Query the token with the matching price feed address
    let token = Token.load(priceFeedAddress.toHexString())

    if (token) {
        token.lastPrice = event.params.current
        token.lastUpdate = event.block.timestamp
        token.save()
    }
}
