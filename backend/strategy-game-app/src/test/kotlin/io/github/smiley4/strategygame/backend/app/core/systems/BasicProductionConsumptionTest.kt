package io.github.smiley4.strategygame.backend.app.core.systems

import io.github.smiley4.strategygame.backend.app.testdsl.accessors.getCountryId
import io.github.smiley4.strategygame.backend.app.testdsl.actions.createGame
import io.github.smiley4.strategygame.backend.app.testdsl.actions.runEconomyUpdate
import io.github.smiley4.strategygame.backend.app.testdsl.assertions.expectProvinceResources
import io.github.smiley4.strategygame.backend.app.testdsl.gameTest
import io.github.smiley4.strategygame.backend.app.testdsl.modifiers.addCity
import io.github.smiley4.strategygame.backend.app.testdsl.modifiers.addTileResources
import io.github.smiley4.strategygame.backend.app.testutils.TestUtils.TileDirection
import io.github.smiley4.strategygame.backend.common.models.BuildingType
import io.github.smiley4.strategygame.backend.common.models.TilePosition
import io.github.smiley4.strategygame.backend.common.models.resources.ResourceType
import io.github.smiley4.strategygame.backend.common.models.resources.amount
import io.github.smiley4.strategygame.backend.common.models.terrain.TerrainResourceType
import io.github.smiley4.strategygame.backend.engine.core.eco.node.ProvinceEconomyNode
import io.github.smiley4.strategygame.backend.worldgen.provided.WorldGenSettings
import io.kotest.core.spec.style.StringSpec

class BasicProductionConsumptionTest : StringSpec({

    "test basic city without any production,consumption" {
        gameTest(fixedPopFoodConsumption = 2) {
            ProvinceEconomyNode.enablePopGrowthEntity = false
            createGame {
                worldSettings = WorldGenSettings.landOnly()
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
                consumed = listOf()
                produced = listOf()
                missing = listOf(ResourceType.FOOD.amount(2f))
            }
        }
    }


    "test basic city with some food available" {
        gameTest(fixedPopFoodConsumption = 2) {
            ProvinceEconomyNode.enablePopGrowthEntity = false
            createGame {
                worldSettings = WorldGenSettings.landOnly()
                user("user")
            }
            addTileResources(0, 0) {
                allNeighbours(TerrainResourceType.PLAINS)
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
                consumed = listOf(ResourceType.FOOD.amount(1f))
                produced = listOf(ResourceType.FOOD.amount(1f))
                missing = listOf(ResourceType.FOOD.amount(1f))
            }
        }
    }

    "test basic production chain with all resources available" {
        gameTest(fixedPopFoodConsumption = 2) {
            ProvinceEconomyNode.enablePopGrowthEntity = false
            createGame {
                worldSettings = WorldGenSettings.landOnly()
                user("user")
            }
            addTileResources(0, 0) {
                allNeighbours(TerrainResourceType.PLAINS)
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
                consumed = listOf()
                produced = listOf(
                    ResourceType.FOOD.amount(4f),
                    ResourceType.HIDE.amount(0f),
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
                consumed = listOf(
                    ResourceType.FOOD.amount(4f),
                )
                produced = listOf(
                    ResourceType.FOOD.amount(4f),
                    ResourceType.HIDE.amount(2f),
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
                consumed = listOf(
                    ResourceType.FOOD.amount(4f),
                    ResourceType.HIDE.amount(2f),
                )
                produced = listOf(
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
                    consumed = listOf(
                        ResourceType.FOOD.amount(4f),
                        ResourceType.HIDE.amount(2f),
                    )
                    produced = listOf(
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



    "test basic production chain without enough food" {
        gameTest(fixedPopFoodConsumption = 2) {
            ProvinceEconomyNode.enablePopGrowthEntity = false
            createGame {
                worldSettings = WorldGenSettings.landOnly()
                user("user")
            }
            addTileResources(0, 0) {
                allNeighbours(TerrainResourceType.PLAINS)
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
                consumed = listOf(
                    ResourceType.FOOD.amount(0f),
                )
                produced = listOf(
                    ResourceType.FOOD.amount(3f),
                    ResourceType.HIDE.amount(0f),
                    ResourceType.PARCHMENT.amount(0f),
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
                consumed = listOf(
                    ResourceType.FOOD.amount(3f),
                )
                produced = listOf(
                    ResourceType.FOOD.amount(3f),
                    ResourceType.HIDE.amount(1f),
                    ResourceType.PARCHMENT.amount(0f),
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
                consumed = listOf(
                    ResourceType.FOOD.amount(3f),
                    ResourceType.HIDE.amount(1f),
                )
                produced = listOf(
                    ResourceType.FOOD.amount(3f),
                    ResourceType.HIDE.amount(1f),
                    ResourceType.PARCHMENT.amount(1f),
                )
                missing = listOf(
                    ResourceType.FOOD.amount(1f),
                    ResourceType.HIDE.amount(1f),
                    ResourceType.PARCHMENT.amount(0f),
                    ResourceType.CLOTHES.amount(0f),
                )
            }

            repeat(10) {
                runEconomyUpdate()
                expectProvinceResources("Test City") {
                    consumed = listOf(
                        ResourceType.FOOD.amount(3f),
                        ResourceType.HIDE.amount(1f),
                    )
                    produced = listOf(
                        ResourceType.FOOD.amount(3f),
                        ResourceType.HIDE.amount(1f),
                        ResourceType.PARCHMENT.amount(1f),
                    )
                    missing = listOf(
                        ResourceType.FOOD.amount(1f),
                        ResourceType.HIDE.amount(1f),
                        ResourceType.PARCHMENT.amount(0f),
                        ResourceType.CLOTHES.amount(0f),
                    )
                }
            }
        }
    }

    "test basic production chain without enough resource production (middle of the chain)" {
        gameTest(fixedPopFoodConsumption = 2) {
            ProvinceEconomyNode.enablePopGrowthEntity = false
            createGame {
                worldSettings = WorldGenSettings.landOnly()
                user("user")
            }
            addTileResources(0, 0) {
                allNeighbours(TerrainResourceType.PLAINS)
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
                consumed = listOf(
                )
                produced = listOf(
                    ResourceType.FOOD.amount(4f),
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
                consumed = listOf(
                    ResourceType.FOOD.amount(3f),
                )
                produced = listOf(
                    ResourceType.FOOD.amount(4f),
                    ResourceType.HIDE.amount(1f),
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
                consumed = listOf(
                    ResourceType.FOOD.amount(3f),
                    ResourceType.HIDE.amount(1f),
                )
                produced = listOf(
                    ResourceType.FOOD.amount(4f),
                    ResourceType.HIDE.amount(1f),
                    ResourceType.PARCHMENT.amount(1f),
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
                    consumed = listOf(
                        ResourceType.FOOD.amount(3f),
                        ResourceType.HIDE.amount(1f),
                    )
                    produced = listOf(
                        ResourceType.FOOD.amount(4f),
                        ResourceType.HIDE.amount(1f),
                        ResourceType.PARCHMENT.amount(1f),
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
