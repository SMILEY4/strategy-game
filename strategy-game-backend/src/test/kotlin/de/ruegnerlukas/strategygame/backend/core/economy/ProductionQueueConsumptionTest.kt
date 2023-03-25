package de.ruegnerlukas.strategygame.backend.core.economy

import de.ruegnerlukas.strategygame.backend.core.economy.EconomyTestUtils.game
import de.ruegnerlukas.strategygame.backend.core.economy.EconomyTestUtils.generateResourcesForPosition
import de.ruegnerlukas.strategygame.backend.core.economy.EconomyTestUtils.performEconomyUpdate
import de.ruegnerlukas.strategygame.backend.core.economy.EconomyTestUtils.shouldBeExactly
import de.ruegnerlukas.strategygame.backend.core.economy.EconomyTestUtils.tiles
import de.ruegnerlukas.strategygame.backend.ports.models.Building
import de.ruegnerlukas.strategygame.backend.ports.models.BuildingType
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.ProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceCollection
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.ports.models.TileRef
import de.ruegnerlukas.strategygame.backend.ports.models.TileResourceType
import de.ruegnerlukas.strategygame.backend.ports.models.amount
import de.ruegnerlukas.strategygame.backend.shared.RGBColor
import io.kotest.core.spec.style.StringSpec

class ProductionQueueConsumptionTest : StringSpec({

    "test basic production queue consumption" {
        val tiles = tiles().also { tiles ->
            generateResourcesForPosition(
                tiles, TilePosition(0, 0), listOf(
                    TileResourceType.FOREST,
                    TileResourceType.FOREST,
                    TileResourceType.FOREST,
                    TileResourceType.STONE,
                    TileResourceType.STONE,
                    TileResourceType.STONE
                )
            )
        }
        val game = game(
            tiles = tiles,
            cities = listOf(
                City(
                    cityId = "test-city",
                    countryId = "test-country",
                    tile = TileRef(tiles.find { it.position.q == 0 && it.position.r == 0 }!!),
                    name = "Test",
                    color = RGBColor.random(),
                    isProvinceCapital = true,
                    buildings = mutableListOf(
                        Building(
                            type = BuildingType.WOODCUTTER,
                            tile = TileRef(tiles.find { it.position.q == -1 && it.position.r == 0 }!!),
                            active = true
                        ),
                        Building(
                            type = BuildingType.WOODCUTTER,
                            tile = TileRef(tiles.find { it.position.q == +1 && it.position.r == 0 }!!),
                            active = true
                        ),
                        Building(
                            type = BuildingType.WOODCUTTER,
                            tile = TileRef(tiles.find { it.position.q == -1 && it.position.r == +1 }!!),
                            active = true
                        ),
                        Building(
                            type = BuildingType.QUARRY,
                            tile = TileRef(tiles.find { it.position.q == 0 && it.position.r == +1 }!!),
                            active = true
                        ),
                        Building(
                            type = BuildingType.QUARRY,
                            tile = TileRef(tiles.find { it.position.q == 0 && it.position.r == -1 }!!),
                            active = true
                        ),
                        Building(
                            type = BuildingType.QUARRY,
                            tile = TileRef(tiles.find { it.position.q == +1 && it.position.r == -1 }!!),
                            active = true
                        )
                    ),
                    productionQueue = mutableListOf(
                        ProductionQueueEntry(
                            entryId = "entry-1",
                            buildingType = BuildingType.ARMOR_SMITH,
                            collectedResources = ResourceCollection.basic()
                        )
                    )
                ),
            ),
            provinces = listOf(
                Province(
                    provinceId = "test-province",
                    countryId = "test-country",
                    cityIds = mutableListOf("test-city"),
                    provinceCapitalCityId = "test-city",
                )
            )
        )


        performEconomyUpdate(game)
        game.cities.find { it.cityId == "test-city" }!!.productionQueue[0].also { queueEntry ->
            queueEntry.collectedResources shouldBeExactly listOf(
                ResourceType.WOOD.amount(0f),
                ResourceType.STONE.amount(0f),
            )
        }

        performEconomyUpdate(game)
        game.cities.find { it.cityId == "test-city" }!!.productionQueue[0].also { queueEntry ->
            queueEntry.collectedResources shouldBeExactly listOf(
                ResourceType.WOOD.amount(3f),
                ResourceType.STONE.amount(3f),
            )
        }

        performEconomyUpdate(game)
        game.cities.find { it.cityId == "test-city" }!!.productionQueue[0].also { queueEntry ->
            queueEntry.collectedResources shouldBeExactly listOf(
                ResourceType.WOOD.amount(6f),
                ResourceType.STONE.amount(5f),
            )
        }

        performEconomyUpdate(game)
        game.cities.find { it.cityId == "test-city" }!!.productionQueue[0].also { queueEntry ->
            queueEntry.collectedResources shouldBeExactly listOf(
                ResourceType.WOOD.amount(9f),
                ResourceType.STONE.amount(5f),
            )
        }

        performEconomyUpdate(game)
        game.cities.find { it.cityId == "test-city" }!!.productionQueue[0].also { queueEntry ->
            queueEntry.collectedResources shouldBeExactly listOf(
                ResourceType.WOOD.amount(10f),
                ResourceType.STONE.amount(5f),
            )
        }

        performEconomyUpdate(game)
        game.cities.find { it.cityId == "test-city" }!!.productionQueue[0].also { queueEntry ->
            queueEntry.collectedResources shouldBeExactly listOf(
                ResourceType.WOOD.amount(10f),
                ResourceType.STONE.amount(5f),
            )
        }

    }

})