package de.ruegnerlukas.strategygame.backend.core.systems

import de.ruegnerlukas.strategygame.backend.common.models.BuildingType
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType
import de.ruegnerlukas.strategygame.backend.common.models.TilePosition
import de.ruegnerlukas.strategygame.backend.common.models.terrain.TerrainResourceType
import de.ruegnerlukas.strategygame.backend.common.models.resources.amount
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ProvinceEconomyNode
import de.ruegnerlukas.strategygame.backend.testdsl.accessors.getCountryId
import de.ruegnerlukas.strategygame.backend.testdsl.actions.createGame
import de.ruegnerlukas.strategygame.backend.testdsl.actions.runEconomyUpdate
import de.ruegnerlukas.strategygame.backend.testdsl.assertions.expectProvinceResources
import de.ruegnerlukas.strategygame.backend.testdsl.gameTest
import de.ruegnerlukas.strategygame.backend.testdsl.modifiers.addCity
import de.ruegnerlukas.strategygame.backend.testdsl.modifiers.addRoute
import de.ruegnerlukas.strategygame.backend.testdsl.modifiers.addTileResources
import de.ruegnerlukas.strategygame.backend.testutils.TestUtils.TileDirection
import de.ruegnerlukas.strategygame.backend.worldcreation.WorldSettings
import io.kotest.core.spec.style.StringSpec

class ResourceSharingTest : StringSpec({

    "test basic production chain with shared basic resources" {
        /*
        TEST_CITY_FOOD
        - 6x Farms
        - 3x Toolmaker

        TEST_CITY_WOOD
        - 6x Woodcutter
        - 1x Toolmaker
        - 2x Stables
        */
        gameTest(fixedPopFoodConsumption = 2) {
            ProvinceEconomyNode.enablePopGrowthEntity = false
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            addTileResources(-5, 0) {
                allNeighbours(TerrainResourceType.PLAINS)
            }
            addTileResources(+5, 0) {
                allNeighbours(TerrainResourceType.FOREST)
            }
            addCity {
                name = "Test City Food"
                tile = TilePosition(-5, 0)
                countryId = getCountryId("user")
                building(BuildingType.FARM, TileDirection.TOP_LEFT)
                building(BuildingType.FARM, TileDirection.TOP_RIGHT)
                building(BuildingType.FARM, TileDirection.LEFT)
                building(BuildingType.FARM, TileDirection.RIGHT)
                building(BuildingType.FARM, TileDirection.BOTTOM_LEFT)
                building(BuildingType.FARM, TileDirection.BOTTOM_RIGHT)
                building(BuildingType.TOOLMAKER)
                building(BuildingType.TOOLMAKER)
                building(BuildingType.TOOLMAKER)
            }
            addCity {
                name = "Test City Wood"
                tile = TilePosition(+5, 0)
                countryId = getCountryId("user")
                building(BuildingType.WOODCUTTER, TileDirection.TOP_LEFT)
                building(BuildingType.WOODCUTTER, TileDirection.TOP_RIGHT)
                building(BuildingType.WOODCUTTER, TileDirection.LEFT)
                building(BuildingType.WOODCUTTER, TileDirection.RIGHT)
                building(BuildingType.WOODCUTTER, TileDirection.BOTTOM_LEFT)
                building(BuildingType.WOODCUTTER, TileDirection.BOTTOM_RIGHT)
                building(BuildingType.TOOLMAKER)
                building(BuildingType.STABLES)
                building(BuildingType.STABLES)
            }
            addRoute("Test City Food", "Test City Wood")
            repeat(10) {
                runEconomyUpdate()
            }
            repeat(10) {
                runEconomyUpdate()
                expectProvinceResources("Test City Food") {
                    producedLastTurn = listOf(
                        ResourceType.FOOD.amount(6f),
                        ResourceType.TOOLS.amount(3f),
                    )
                    consumedThisTurn = listOf(
                        ResourceType.FOOD.amount(2f),
                        ResourceType.WOOD.amount(3f),
                    )
                    producedThisTurn = listOf(
                        ResourceType.FOOD.amount(6f),
                        ResourceType.TOOLS.amount(3f),
                    )
                    missing = listOf(
                        ResourceType.FOOD.amount(0f),
                        ResourceType.WOOD.amount(0f),
                    )
                }
                expectProvinceResources("Test City Wood") {
                    producedLastTurn = listOf(
                        ResourceType.WOOD.amount(6f),
                        ResourceType.TOOLS.amount(1f),
                        ResourceType.HORSE.amount(2f),
                    )
                    consumedThisTurn = listOf(
                        ResourceType.FOOD.amount(4f),
                        ResourceType.WOOD.amount(1f),
                    )
                    producedThisTurn = listOf(
                        ResourceType.WOOD.amount(6f),
                        ResourceType.TOOLS.amount(1f),
                        ResourceType.HORSE.amount(2f),
                    )
                    missing = listOf(
                        ResourceType.FOOD.amount(0f),
                        ResourceType.WOOD.amount(0f),

                        )
                }
            }
        }

    }

    "test share resources with not enough resources available (and one disconnected city)" {
        /*
        TEST_CITY_FOOD
        - 3x Farms
        - 2x Toolmaker

        TEST_CITY_WOOD
        - 1x Woodcutter

        TEST_CITY_DISCONNECTED
        - 3x Farms
        - 3x Woodcutter
        */
        gameTest(fixedPopFoodConsumption = 2) {
            ProvinceEconomyNode.enablePopGrowthEntity = false
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            addTileResources(-5, 0) {
                allNeighbours(TerrainResourceType.PLAINS)
            }
            addTileResources(+5, 0) {
                allNeighbours(TerrainResourceType.FOREST)
            }
            addTileResources(+10, 0) {
                topLeft = TerrainResourceType.PLAINS
                left = TerrainResourceType.PLAINS
                bottomLeft = TerrainResourceType.PLAINS
                topRight = TerrainResourceType.FOREST
                right = TerrainResourceType.FOREST
                bottomRight = TerrainResourceType.FOREST
            }
            addCity {
                name = "Test City Food"
                tile = TilePosition(-5, 0)
                countryId = getCountryId("user")
                building(BuildingType.FARM, TileDirection.TOP_LEFT)
                building(BuildingType.FARM, TileDirection.TOP_RIGHT)
                building(BuildingType.FARM, TileDirection.LEFT)
                building(BuildingType.TOOLMAKER)
                building(BuildingType.TOOLMAKER)
            }
            addCity {
                name = "Test City Wood"
                tile = TilePosition(+5, 0)
                countryId = getCountryId("user")
                building(BuildingType.WOODCUTTER, TileDirection.TOP_LEFT)
            }
            addCity {
                name = "Test City Disconnected"
                tile = TilePosition(+10, 0)
                countryId = getCountryId("user")
                building(BuildingType.WOODCUTTER, TileDirection.TOP_RIGHT)
                building(BuildingType.WOODCUTTER, TileDirection.RIGHT)
                building(BuildingType.WOODCUTTER, TileDirection.BOTTOM_RIGHT)
                building(BuildingType.FARM, TileDirection.TOP_LEFT)
                building(BuildingType.FARM, TileDirection.LEFT)
                building(BuildingType.FARM, TileDirection.BOTTOM_LEFT)
            }
            addRoute("Test City Food", "Test City Wood")
            repeat(10) {
                runEconomyUpdate()
            }
            repeat(10) {
                runEconomyUpdate()
                expectProvinceResources("Test City Food") {
                    producedLastTurn = listOf(
                        ResourceType.FOOD.amount(3f),
                        ResourceType.WOOD.amount(0f),
                        ResourceType.TOOLS.amount(1f),
                    )
                    consumedThisTurn = listOf(
                        ResourceType.FOOD.amount(2f),
                        ResourceType.WOOD.amount(1f),
                        ResourceType.TOOLS.amount(0f),
                    )
                    producedThisTurn = listOf(
                        ResourceType.FOOD.amount(3f),
                        ResourceType.WOOD.amount(0f),
                        ResourceType.TOOLS.amount(1f),
                    )
                    missing = listOf(
                        ResourceType.FOOD.amount(0f),
                        ResourceType.WOOD.amount(1f),
                        ResourceType.TOOLS.amount(0f)
                    )
                }
                expectProvinceResources("Test City Wood") {
                    producedLastTurn = listOf(
                        ResourceType.FOOD.amount(0f),
                        ResourceType.WOOD.amount(1f),
                    )
                    consumedThisTurn = listOf(
                        ResourceType.FOOD.amount(1f),
                        ResourceType.WOOD.amount(0f),
                    )
                    producedThisTurn = listOf(
                        ResourceType.FOOD.amount(0f),
                        ResourceType.WOOD.amount(1f),
                    )
                    missing = listOf(
                        ResourceType.FOOD.amount(1f),
                        ResourceType.WOOD.amount(0f)
                    )
                }
            }
        }

    }

})
