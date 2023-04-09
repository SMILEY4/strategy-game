package de.ruegnerlukas.strategygame.backend.core.systems

import de.ruegnerlukas.strategygame.backend.ports.models.BuildingType
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.ports.models.TileResourceType
import de.ruegnerlukas.strategygame.backend.ports.models.WorldSettings
import de.ruegnerlukas.strategygame.backend.testdsl.GameTestContext
import de.ruegnerlukas.strategygame.backend.testdsl.accessors.getCountryId
import de.ruegnerlukas.strategygame.backend.testdsl.actions.createGame
import de.ruegnerlukas.strategygame.backend.testdsl.actions.submitTurn
import de.ruegnerlukas.strategygame.backend.testdsl.assertions.expectCity
import de.ruegnerlukas.strategygame.backend.testdsl.gameTest
import de.ruegnerlukas.strategygame.backend.testdsl.modifiers.addCity
import de.ruegnerlukas.strategygame.backend.testdsl.modifiers.addTileResources
import de.ruegnerlukas.strategygame.backend.testutils.TestUtils.TileDirection
import io.kotest.core.spec.style.StringSpec

class CityGrowthTest : StringSpec({

    "city with more than enough available food " {
        gameTest {
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
                building(BuildingType.FARM, TileDirection.LEFT)
                building(BuildingType.FARM, TileDirection.RIGHT)
                building(BuildingType.FARM, TileDirection.TOP_LEFT)
                building(BuildingType.FARM, TileDirection.TOP_RIGHT)
                building(BuildingType.FARM, TileDirection.BOTTOM_LEFT)
                building(BuildingType.FARM, TileDirection.BOTTOM_RIGHT)
            }
            update {
                expectedSize = 1
                expectedProgress = -0.1f
            }
            update {
                expectedSize = 1
                expectedProgress = 0.1f
            }
            update {
                expectedSize = 1
                expectedProgress = 0.3f
            }
            update {
                expectedSize = 1
                expectedProgress = 0.5f
            }
            update {
                expectedSize = 1
                expectedProgress = 0.7f
            }
            update {
                expectedSize = 1
                expectedProgress = 0.9f
            }
            update {
                expectedSize = 2
                expectedProgress = 0.1f
            }
        }
    }

    "city with just enough base food available" {
        gameTest {
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
                building(BuildingType.FARM, TileDirection.LEFT)
                building(BuildingType.FARM, TileDirection.RIGHT)
            }
            update {
                expectedSize = 1
                expectedProgress = -0.1f
            }
            update {
                expectedSize = 1
                expectedProgress = 0.0f
            }
            update {
                expectedSize = 1
                expectedProgress = 0.1f
            }
            update {
                expectedSize = 1
                expectedProgress = 0.2f
            }
        }
    }

    "city with some but not enough food available" {
        gameTest {
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
                building(BuildingType.FARM, TileDirection.LEFT)
            }
            update {
                expectedSize = 1
                expectedProgress = -0.1f
            }
            update {
                expectedSize = 1
                expectedProgress = -0.1f
            }
            update {
                expectedSize = 1
                expectedProgress = -0.1f
            }
            update {
                expectedSize = 1
                expectedProgress = -0.1f
            }
        }
    }

    "city with no food available" {
        gameTest {
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
            }
            update {
                expectedSize = 1
                expectedProgress = -0.1f
            }
            update {
                expectedSize = 1
                expectedProgress = -0.2f
            }
            update {
                expectedSize = 1
                expectedProgress = -0.3f
            }
            update {
                expectedSize = 1
                expectedProgress = -0.4f
            }
            update {
                expectedSize = 1
                expectedProgress = -0.5f
            }
            update {
                expectedSize = 1
                expectedProgress = -0.6f
            }
            update {
                expectedSize = 1
                expectedProgress = -0.7f
            }
            update {
                expectedSize = 1
                expectedProgress = -0.8f
            }
            update {
                expectedSize = 1
                expectedProgress = -0.9f
            }
            update {
                expectedSize = 0
                expectedProgress = -0.0f
            }
            update {
                expectedSize = 0
                expectedProgress = -0.1f
            }
        }
    }

}) {

    companion object {

        internal suspend fun GameTestContext.update(block: CityGrowthUpdateDsl.() -> Unit) {
            val dslConfig = CityGrowthUpdateDsl().apply(block)
            submitTurn("user")
            expectCity {
                name = "Test City"
                q = 0
                r = 0
                countryId = getCountryId("user")
                growthProgress = dslConfig.expectedProgress
            }
        }

        internal class CityGrowthUpdateDsl {
            var expectedProgress: Float? = null
            var expectedSize: Int? = null
        }

    }

}