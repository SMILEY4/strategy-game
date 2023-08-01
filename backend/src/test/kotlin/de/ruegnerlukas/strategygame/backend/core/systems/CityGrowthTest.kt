package de.ruegnerlukas.strategygame.backend.core.systems

import de.ruegnerlukas.strategygame.backend.common.models.BuildingType
import de.ruegnerlukas.strategygame.backend.common.models.TilePosition
import de.ruegnerlukas.strategygame.backend.common.models.terrain.TerrainResourceType
import de.ruegnerlukas.strategygame.backend.common.utils.RGBColor
import de.ruegnerlukas.strategygame.backend.gameengine.core.common.PopFoodConsumption
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CityInfrastructure
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CityMetadata
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CityPopulation
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.SettlementTier
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileRef
import de.ruegnerlukas.strategygame.backend.testdsl.GameTestContext
import de.ruegnerlukas.strategygame.backend.testdsl.accessors.getCountryId
import de.ruegnerlukas.strategygame.backend.testdsl.actions.createGame
import de.ruegnerlukas.strategygame.backend.testdsl.actions.submitTurn
import de.ruegnerlukas.strategygame.backend.testdsl.assertions.expectCity
import de.ruegnerlukas.strategygame.backend.testdsl.gameTest
import de.ruegnerlukas.strategygame.backend.testdsl.modifiers.addCity
import de.ruegnerlukas.strategygame.backend.testdsl.modifiers.addTileResources
import de.ruegnerlukas.strategygame.backend.testutils.TestUtils.TileDirection
import de.ruegnerlukas.strategygame.backend.worldcreation.WorldSettings
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.floats.plusOrMinus
import io.kotest.matchers.shouldBe

class CityGrowthTest : StringSpec({

    "city with more than enough available food " {
        gameTest(fixedPopFoodConsumption = 2) {
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            addTileResources(0, 0) {
                allNeighbours(TerrainResourceType.PLAINS)
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
        gameTest(fixedPopFoodConsumption = 2) {
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            addTileResources(0, 0) {
                allNeighbours(TerrainResourceType.PLAINS)
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
        gameTest(fixedPopFoodConsumption = 2) {
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            addTileResources(0, 0) {
                allNeighbours(TerrainResourceType.PLAINS)
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
        gameTest(fixedPopFoodConsumption = 2) {
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            addTileResources(0, 0) {
                allNeighbours(TerrainResourceType.PLAINS)
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

    "village cannot grow larger than max size" {
        gameTest(fixedPopFoodConsumption = 2) {
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            addTileResources(0, 0) {
                allNeighbours(TerrainResourceType.PLAINS)
            }
            addCity {
                name = "Test City"
                tier = SettlementTier.VILLAGE
                initialSize = SettlementTier.VILLAGE.maxSize
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
                expectedSize = SettlementTier.VILLAGE.maxSize
                expectedProgress = -0.1f
            }
            update {
                expectedSize = SettlementTier.VILLAGE.maxSize
                expectedProgress = -0.1f
            }
            update {
                expectedSize = SettlementTier.VILLAGE.maxSize
                expectedProgress = -0.1f
            }
            update {
                expectedSize = SettlementTier.VILLAGE.maxSize
                expectedProgress = -0.1f
            }
        }
    }

    "test city base food consumption" {
        cityOfSize(0).also { expectRequiredBaseFood(it, 0f) }
        cityOfSize(1).also { expectRequiredBaseFood(it, 1f) }
        cityOfSize(2).also { expectRequiredBaseFood(it, 1f) }
        cityOfSize(3).also { expectRequiredBaseFood(it, 1f) }
        cityOfSize(4).also { expectRequiredBaseFood(it, 1f) }
        cityOfSize(5).also { expectRequiredBaseFood(it, 2f) }
        cityOfSize(6).also { expectRequiredBaseFood(it, 2f) }
        cityOfSize(7).also { expectRequiredBaseFood(it, 2f) }
        cityOfSize(8).also { expectRequiredBaseFood(it, 2f) }
        cityOfSize(9).also { expectRequiredBaseFood(it, 3f) }
        cityOfSize(10).also { expectRequiredBaseFood(it, 3f) }
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

        internal fun cityOfSize(size: Int) =
            City(
                cityId = "test-city",
                countryId = "test-country",
                tile = TileRef("test-tile", 0, 0),
                tier = SettlementTier.CITY,
                meta = CityMetadata(
                    name = "Test City",
                    color = RGBColor.random(),
                    isProvinceCapital = true,
                ),
                infrastructure = CityInfrastructure(
                    buildings = mutableListOf(),
                    productionQueue = mutableListOf(),
                ),
                population = CityPopulation(
                    size = size,
                    growthProgress = 0f,
                    popConsumedFood = 0f,
                    popGrowthConsumedFood = false,
                ),
            )

        internal fun expectRequiredBaseFood(city: City, expected: Float) {
            PopFoodConsumption().getRequiredFood(city) shouldBe expected.plusOrMinus(0.0001f)
        }

    }

}