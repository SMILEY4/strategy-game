package de.ruegnerlukas.strategygame.backend.core.systems

import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.core.economy.elements.nodes.ProvinceEconomyNode
import de.ruegnerlukas.strategygame.backend.ports.models.BuildingType
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.ports.models.TileResourceType
import de.ruegnerlukas.strategygame.backend.ports.models.WorldSettings
import de.ruegnerlukas.strategygame.backend.ports.models.amount
import de.ruegnerlukas.strategygame.backend.testdsl.accessors.getCountryId
import de.ruegnerlukas.strategygame.backend.testdsl.actions.createGame
import de.ruegnerlukas.strategygame.backend.testdsl.actions.runEconomyUpdate
import de.ruegnerlukas.strategygame.backend.testdsl.assertions.expectProvinceResources
import de.ruegnerlukas.strategygame.backend.testdsl.gameTest
import de.ruegnerlukas.strategygame.backend.testdsl.modifiers.addCity
import de.ruegnerlukas.strategygame.backend.testdsl.modifiers.addTileResources
import de.ruegnerlukas.strategygame.backend.testutils.TestUtils.TileDirection
import io.kotest.core.spec.style.StringSpec

class BasicProductionConsumptionTest : StringSpec({

    "test basic city without any production,consumption" {
        gameTest {
            ProvinceEconomyNode.enablePopGrowthEntity = false
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            addCity {
                name = "Test City"
                tile = TilePosition(0, 0)
                countryId = getCountryId("user")
            }
            repeat(10) {
                runEconomyUpdate()
            }
            expectProvinceResources("Test City") {
                producedLastTurn = listOf(ResourceType.FOOD.amount(0f))
                consumedThisTurn = listOf(ResourceType.FOOD.amount(0f))
                producedThisTurn = listOf(ResourceType.FOOD.amount(0f))
                missing = listOf(ResourceType.FOOD.amount(GameConfig.default().cityFoodCostPerTurn))
            }
        }
    }


    "test basic city with some food available" {
        gameTest {
            ProvinceEconomyNode.enablePopGrowthEntity = false
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            addTileResources(0, 0) {
                allNeighbours(TileResourceType.PLAINS)
            }
            addCity {
                name = "Test City"
                tile = TilePosition(0, 0)
                countryId = getCountryId("user")
                building(BuildingType.FARM, TileDirection.RIGHT)
            }
            repeat(10) {
                runEconomyUpdate()
            }
            expectProvinceResources("Test City") {
                producedLastTurn = listOf(ResourceType.FOOD.amount(1f))
                consumedThisTurn = listOf(ResourceType.FOOD.amount(1f))
                producedThisTurn = listOf(ResourceType.FOOD.amount(1f))
                missing = listOf(ResourceType.FOOD.amount(GameConfig.default().cityFoodCostPerTurn - 1))
            }
        }
    }

    "test basic production chain with all resources available" {
        gameTest {
            ProvinceEconomyNode.enablePopGrowthEntity = false
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            addTileResources(0, 0) {
                allNeighbours(TileResourceType.PLAINS)
            }
            addCity {
                name = "Test City"
                tile = TilePosition(0, 0)
                countryId = getCountryId("user")
                building(BuildingType.FARM, TileDirection.TOP_LEFT)
                building(BuildingType.FARM, TileDirection.TOP_RIGHT)
                building(BuildingType.FARM, TileDirection.LEFT)
                building(BuildingType.FARM, TileDirection.RIGHT)
                building(BuildingType.SHEEP_FARM)
                building(BuildingType.SHEEP_FARM)
                building(BuildingType.PARCHMENTERS_WORKSHOP)
                building(BuildingType.TAILORS_WORKSHOP)
            }

            runEconomyUpdate()
            expectProvinceResources("Test City") {
                producedLastTurn = listOf(
                    ResourceType.FOOD.amount(0f),
                    ResourceType.HIDE.amount(0f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
                consumedThisTurn = listOf(
                    ResourceType.FOOD.amount(0f),
                    ResourceType.HIDE.amount(0f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
                producedThisTurn = listOf(
                    ResourceType.FOOD.amount(4f),
                    ResourceType.HIDE.amount(0f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
                missing = listOf(
                    ResourceType.FOOD.amount(4f),
                    ResourceType.HIDE.amount(2f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
            }

            runEconomyUpdate()
            expectProvinceResources("Test City") {
                producedLastTurn = listOf(
                    ResourceType.FOOD.amount(4f),
                    ResourceType.HIDE.amount(0f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
                consumedThisTurn = listOf(
                    ResourceType.FOOD.amount(4f),
                    ResourceType.HIDE.amount(0f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
                producedThisTurn = listOf(
                    ResourceType.FOOD.amount(4f),
                    ResourceType.HIDE.amount(2f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
                missing = listOf(
                    ResourceType.FOOD.amount(0f),
                    ResourceType.HIDE.amount(2f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
            }

            runEconomyUpdate()
            expectProvinceResources("Test City") {
                producedLastTurn = listOf(
                    ResourceType.FOOD.amount(4f),
                    ResourceType.HIDE.amount(2f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
                consumedThisTurn = listOf(
                    ResourceType.FOOD.amount(4f),
                    ResourceType.HIDE.amount(2f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
                producedThisTurn = listOf(
                    ResourceType.FOOD.amount(4f),
                    ResourceType.HIDE.amount(2f),
                    ResourceType.PARCHMENT.amount(1f),
                    ResourceType.CLOTHES.amount(1f),
                )
                missing = listOf(
                    ResourceType.FOOD.amount(0f),
                    ResourceType.HIDE.amount(0f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
            }

            repeat(10) {
                runEconomyUpdate()
                expectProvinceResources("Test City") {
                    producedLastTurn = listOf(
                        ResourceType.FOOD.amount(4f),
                        ResourceType.HIDE.amount(2f),
                        ResourceType.PARCHMENT.amount(1f),
                        ResourceType.CLOTHES.amount(1f),
                    )
                    consumedThisTurn = listOf(
                        ResourceType.FOOD.amount(4f),
                        ResourceType.HIDE.amount(2f),
                        ResourceType.PARCHMENT.amount(0f),
                        ResourceType.CLOTHES.amount(0f),
                    )
                    producedThisTurn = listOf(
                        ResourceType.FOOD.amount(4f),
                        ResourceType.HIDE.amount(2f),
                        ResourceType.PARCHMENT.amount(1f),
                        ResourceType.CLOTHES.amount(1f),
                    )
                    missing = listOf(
                        ResourceType.FOOD.amount(0f),
                        ResourceType.HIDE.amount(0f),
                        ResourceType.PARCHMENT.amount(0f),
                        ResourceType.CLOTHES.amount(0f)
                    )
                }
            }
        }
    }



    "test basic production chain without enough food for population" {
        gameTest {
            ProvinceEconomyNode.enablePopGrowthEntity = false
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            addTileResources(0, 0) {
                allNeighbours(TileResourceType.PLAINS)
            }
            addCity {
                name = "Test City"
                tile = TilePosition(0, 0)
                countryId = getCountryId("user")
                building(BuildingType.FARM, TileDirection.TOP_LEFT)
                building(BuildingType.FARM, TileDirection.TOP_RIGHT)
                building(BuildingType.FARM, TileDirection.LEFT)
                building(BuildingType.SHEEP_FARM)
                building(BuildingType.SHEEP_FARM)
                building(BuildingType.PARCHMENTERS_WORKSHOP)
                building(BuildingType.TAILORS_WORKSHOP)
            }

            runEconomyUpdate()
            expectProvinceResources("Test City") {
                producedLastTurn = listOf(
                    ResourceType.FOOD.amount(0f),
                    ResourceType.HIDE.amount(0f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
                consumedThisTurn = listOf(
                    ResourceType.FOOD.amount(0f),
                    ResourceType.HIDE.amount(0f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
                producedThisTurn = listOf(
                    ResourceType.FOOD.amount(3f),
                    ResourceType.HIDE.amount(0f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
                missing = listOf(
                    ResourceType.FOOD.amount(4f),
                    ResourceType.HIDE.amount(2f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
            }

            runEconomyUpdate()
            expectProvinceResources("Test City") {
                producedLastTurn = listOf(
                    ResourceType.FOOD.amount(3f),
                    ResourceType.HIDE.amount(0f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
                consumedThisTurn = listOf(
                    ResourceType.FOOD.amount(3f),
                    ResourceType.HIDE.amount(0f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
                producedThisTurn = listOf(
                    ResourceType.FOOD.amount(3f),
                    ResourceType.HIDE.amount(2f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
                missing = listOf(
                    ResourceType.FOOD.amount(1f),
                    ResourceType.HIDE.amount(2f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
            }

            runEconomyUpdate()
            expectProvinceResources("Test City") {
                producedLastTurn = listOf(
                    ResourceType.FOOD.amount(3f),
                    ResourceType.HIDE.amount(2f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
                consumedThisTurn = listOf(
                    ResourceType.FOOD.amount(3f),
                    ResourceType.HIDE.amount(2f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
                producedThisTurn = listOf(
                    ResourceType.FOOD.amount(3f),
                    ResourceType.HIDE.amount(2f),
                    ResourceType.PARCHMENT.amount(1f),
                    ResourceType.CLOTHES.amount(1f),
                )
                missing = listOf(
                    ResourceType.FOOD.amount(1f),
                    ResourceType.HIDE.amount(0f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
            }

            repeat(10) {
                runEconomyUpdate()
                expectProvinceResources("Test City") {
                    producedLastTurn = listOf(
                        ResourceType.FOOD.amount(3f),
                        ResourceType.HIDE.amount(2f),
                        ResourceType.PARCHMENT.amount(1f),
                        ResourceType.CLOTHES.amount(1f),
                    )
                    consumedThisTurn = listOf(
                        ResourceType.FOOD.amount(3f),
                        ResourceType.HIDE.amount(2f),
                        ResourceType.PARCHMENT.amount(0f),
                        ResourceType.CLOTHES.amount(0f),
                    )
                    producedThisTurn = listOf(
                        ResourceType.FOOD.amount(3f),
                        ResourceType.HIDE.amount(2f),
                        ResourceType.PARCHMENT.amount(1f),
                        ResourceType.CLOTHES.amount(1f),
                    )
                    missing = listOf(
                        ResourceType.FOOD.amount(1f),
                        ResourceType.HIDE.amount(0f),
                        ResourceType.PARCHMENT.amount(0f),
                        ResourceType.CLOTHES.amount(0f),
                    )
                }
            }
        }
    }

    "test basic production chain without enough resource production (middle of the chain)" {
        gameTest {
            ProvinceEconomyNode.enablePopGrowthEntity = false
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            addTileResources(0, 0) {
                allNeighbours(TileResourceType.PLAINS)
            }
            addCity {
                name = "Test City"
                tile = TilePosition(0, 0)
                countryId = getCountryId("user")
                building(BuildingType.FARM, TileDirection.TOP_LEFT)
                building(BuildingType.FARM, TileDirection.TOP_RIGHT)
                building(BuildingType.FARM, TileDirection.LEFT)
                building(BuildingType.FARM, TileDirection.RIGHT)
                building(BuildingType.SHEEP_FARM)
                building(BuildingType.PARCHMENTERS_WORKSHOP)
                building(BuildingType.TAILORS_WORKSHOP)
            }

            runEconomyUpdate()
            expectProvinceResources("Test City") {
                producedLastTurn = listOf(
                    ResourceType.FOOD.amount(0f),
                    ResourceType.HIDE.amount(0f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
                consumedThisTurn = listOf(
                    ResourceType.FOOD.amount(0f),
                    ResourceType.HIDE.amount(0f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
                producedThisTurn = listOf(
                    ResourceType.FOOD.amount(4f),
                    ResourceType.HIDE.amount(0f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
                missing = listOf(
                    ResourceType.FOOD.amount(3f),
                    ResourceType.HIDE.amount(2f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
            }

            runEconomyUpdate()
            expectProvinceResources("Test City") {
                producedLastTurn = listOf(
                    ResourceType.FOOD.amount(4f),
                    ResourceType.HIDE.amount(0f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
                consumedThisTurn = listOf(
                    ResourceType.FOOD.amount(3f),
                    ResourceType.HIDE.amount(0f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
                producedThisTurn = listOf(
                    ResourceType.FOOD.amount(4f),
                    ResourceType.HIDE.amount(1f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
                missing = listOf(
                    ResourceType.FOOD.amount(0f),
                    ResourceType.HIDE.amount(2f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
            }

            runEconomyUpdate()
            expectProvinceResources("Test City") {
                producedLastTurn = listOf(
                    ResourceType.FOOD.amount(4f),
                    ResourceType.HIDE.amount(1f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
                consumedThisTurn = listOf(
                    ResourceType.FOOD.amount(3f),
                    ResourceType.HIDE.amount(1f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
                producedThisTurn = listOf(
                    ResourceType.FOOD.amount(4f),
                    ResourceType.HIDE.amount(1f),
                    ResourceType.PARCHMENT.amount(1f),
                    ResourceType.CLOTHES.amount(0f),
                )
                missing = listOf(
                    ResourceType.FOOD.amount(0f),
                    ResourceType.HIDE.amount(1f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
            }

            repeat(10) {
                runEconomyUpdate()
                expectProvinceResources("Test City") {
                    producedLastTurn = listOf(
                        ResourceType.FOOD.amount(4f),
                        ResourceType.HIDE.amount(1f),
                        ResourceType.PARCHMENT.amount(1f),
                        ResourceType.CLOTHES.amount(0f),
                    )
                    consumedThisTurn = listOf(
                        ResourceType.FOOD.amount(3f),
                        ResourceType.HIDE.amount(1f),
                        ResourceType.PARCHMENT.amount(0f),
                        ResourceType.CLOTHES.amount(0f),
                    )
                    producedThisTurn = listOf(
                        ResourceType.FOOD.amount(4f),
                        ResourceType.HIDE.amount(1f),
                        ResourceType.PARCHMENT.amount(1f),
                        ResourceType.CLOTHES.amount(0f),
                    )
                    missing = listOf(
                        ResourceType.FOOD.amount(0f),
                        ResourceType.HIDE.amount(1f),
                        ResourceType.PARCHMENT.amount(0f),
                        ResourceType.CLOTHES.amount(0f),
                    )
                }
            }
        }
    }

})
