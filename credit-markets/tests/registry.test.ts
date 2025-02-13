import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { FactoryAdded } from "../generated/schema"
import { FactoryAdded as FactoryAddedEvent } from "../generated/Registry/Registry"
import { handleFactoryAdded } from "../src/registry"
import { createFactoryAddedEvent } from "./registry-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let factoryAddress = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newFactoryAddedEvent = createFactoryAddedEvent(factoryAddress)
    handleFactoryAdded(newFactoryAddedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("FactoryAdded created and stored", () => {
    assert.entityCount("FactoryAdded", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "FactoryAdded",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "factoryAddress",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
