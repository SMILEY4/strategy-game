package io.github.smiley4.strategygame.backend.app.core.systems

import io.github.smiley4.strategygame.backend.app.testdsl.accessors.getCityId
import io.github.smiley4.strategygame.backend.app.testdsl.accessors.getCountryId
import io.github.smiley4.strategygame.backend.app.testdsl.actions.createGame
import io.github.smiley4.strategygame.backend.app.testdsl.actions.runEconomyUpdate
import io.github.smiley4.strategygame.backend.app.testdsl.assertions.expectProductionQueue
import io.github.smiley4.strategygame.backend.app.testdsl.gameTest
import io.github.smiley4.strategygame.backend.app.testdsl.modifiers.addCity
import io.github.smiley4.strategygame.backend.app.testdsl.modifiers.addTileResources
import io.github.smiley4.strategygame.backend.app.testutils.TestUtils.TileDirection
import io.github.smiley4.strategygame.backend.common.models.BuildingType
import io.github.smiley4.strategygame.backend.common.models.TilePosition
import io.github.smiley4.strategygame.backend.common.models.resources.ResourceType
import io.github.smiley4.strategygame.backend.common.models.resources.amount
import io.github.smiley4.strategygame.backend.common.models.terrain.TerrainResourceType
import io.github.smiley4.strategygame.backend.worldgen.WorldSettings
import io.kotest.core.spec.style.StringSpec

class ProductionQueueConsumptionTest : StringSpec({

    "test basic production queue consumption" {
        gameTest {
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            addTileResources(0, 0) {
                topLeft = TerrainResourceType.STONE
                left = TerrainResourceType.STONE
                bottomLeft = TerrainResourceType.STONE
                topRight = TerrainResourceType.FOREST
                right = TerrainResourceType.FOREST
                bottomRight = TerrainResourceType.FOREST
            }
            addCity {
                name = "Test City"
                tile = TilePosition(0, 0)
                countryId = getCountryId("user")
                building(BuildingType.WOODCUTTER, TileDirection.TOP_RIGHT)
                building(BuildingType.WOODCUTTER, TileDirection.RIGHT)
                building(BuildingType.WOODCUTTER, TileDirection.BOTTOM_RIGHT)
                building(BuildingType.QUARRY, TileDirection.TOP_LEFT)
                building(BuildingType.QUARRY, TileDirection.LEFT)
                building(BuildingType.QUARRY, TileDirection.BOTTOM_LEFT)
                queueConstructBuilding(BuildingType.ARMOR_SMITH)
            }

            runEconomyUpdate()
            expectProductionQueue(getCityId("Test City")) {
                entry("building.${BuildingType.ARMOR_SMITH}") {
                    collected = listOf(
                        ResourceType.WOOD.amount(0f + 1f),
                        ResourceType.STONE.amount(0f + 1f),
                    )
                }
            }

            runEconomyUpdate()
            expectProductionQueue(getCityId("Test City")) {
                entry("building.${BuildingType.ARMOR_SMITH}") {
                    collected = listOf(
                        ResourceType.WOOD.amount(3f + 2f),
                        ResourceType.STONE.amount(3f + 2f),
                    )
                }
            }

            runEconomyUpdate()
            expectProductionQueue(getCityId("Test City")) {
                entry("building.${BuildingType.ARMOR_SMITH}") {
                    collected = listOf(
                        ResourceType.WOOD.amount(6f + 3f),
                        ResourceType.STONE.amount(5f),
                    )
                }
            }

            runEconomyUpdate()
            expectProductionQueue(getCityId("Test City")) {}

        }
    }

})