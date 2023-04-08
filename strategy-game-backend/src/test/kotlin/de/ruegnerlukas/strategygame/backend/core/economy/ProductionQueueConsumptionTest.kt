package de.ruegnerlukas.strategygame.backend.core.economy

import de.ruegnerlukas.strategygame.backend.ports.models.BuildingType
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.ports.models.TileResourceType
import de.ruegnerlukas.strategygame.backend.ports.models.WorldSettings
import de.ruegnerlukas.strategygame.backend.ports.models.amount
import de.ruegnerlukas.strategygame.backend.testdsl.accessors.getCityId
import de.ruegnerlukas.strategygame.backend.testdsl.accessors.getCountryId
import de.ruegnerlukas.strategygame.backend.testdsl.actions.createGame
import de.ruegnerlukas.strategygame.backend.testdsl.actions.runEconomyUpdate
import de.ruegnerlukas.strategygame.backend.testdsl.assertions.expectProductionQueue
import de.ruegnerlukas.strategygame.backend.testdsl.gameTest
import de.ruegnerlukas.strategygame.backend.testdsl.modifiers.addCity
import de.ruegnerlukas.strategygame.backend.testdsl.modifiers.addTileResources
import de.ruegnerlukas.strategygame.backend.testutils.TestUtils.TileDirection
import io.kotest.core.spec.style.StringSpec

class ProductionQueueConsumptionTest : StringSpec({

    "test basic production queue consumption" {
        gameTest {
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            addTileResources(0, 0) {
                topLeft = TileResourceType.STONE
                left = TileResourceType.STONE
                bottomLeft = TileResourceType.STONE
                topRight = TileResourceType.FOREST
                right = TileResourceType.FOREST
                bottomRight = TileResourceType.FOREST
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