package de.ruegnerlukas.strategygame.backend.core.economy_v2

import de.ruegnerlukas.strategygame.backend.core.economy_v2.EconomyV2TestUtils.game
import de.ruegnerlukas.strategygame.backend.core.economy_v2.EconomyV2TestUtils.generateResourcesForPosition
import de.ruegnerlukas.strategygame.backend.core.economy_v2.EconomyV2TestUtils.performEconomyUpdate
import de.ruegnerlukas.strategygame.backend.core.economy_v2.EconomyV2TestUtils.shouldBeMissing
import de.ruegnerlukas.strategygame.backend.core.economy_v2.EconomyV2TestUtils.shouldHaveConsumedCurrentTurn
import de.ruegnerlukas.strategygame.backend.core.economy_v2.EconomyV2TestUtils.shouldHaveProducedCurrentTurn
import de.ruegnerlukas.strategygame.backend.core.economy_v2.EconomyV2TestUtils.shouldHaveProducedLastTurn
import de.ruegnerlukas.strategygame.backend.core.economy_v2.EconomyV2TestUtils.tiles
import de.ruegnerlukas.strategygame.backend.ports.models.Building
import de.ruegnerlukas.strategygame.backend.ports.models.BuildingType
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType
import de.ruegnerlukas.strategygame.backend.ports.models.Route
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.ports.models.TileRef
import de.ruegnerlukas.strategygame.backend.ports.models.TileResourceType
import de.ruegnerlukas.strategygame.backend.shared.RGBColor
import io.kotest.core.spec.style.StringSpec

class NetworkEconomyV2Test : StringSpec({

    "test basic production chain with shared basic resources" {
        val tiles = tiles().also { tiles ->
            generateResourcesForPosition(
                tiles, TilePosition(-5, 0), listOf(
                    TileResourceType.PLAINS,
                    TileResourceType.PLAINS,
                    TileResourceType.PLAINS,
                    TileResourceType.PLAINS,
                    TileResourceType.PLAINS,
                    TileResourceType.PLAINS
                )
            )
            generateResourcesForPosition(
                tiles, TilePosition(+5, 0), listOf(
                    TileResourceType.FOREST,
                    TileResourceType.FOREST,
                    TileResourceType.FOREST,
                    TileResourceType.FOREST,
                    TileResourceType.FOREST,
                    TileResourceType.FOREST
                )
            )
        }
        val game = game(
            tiles = tiles,
            cities = listOf(
                City(
                    cityId = "test-city-food",
                    countryId = "test-country",
                    tile = TileRef(tiles.find { it.position.q == -5 && it.position.r == 0 }!!),
                    name = "Test Food",
                    color = RGBColor.random(),
                    isProvinceCapital = true,
                    buildings = mutableListOf(
                        Building(
                            type = BuildingType.FARM,
                            tile = TileRef(tiles.find { it.position.q == -5 - 1 && it.position.r == 0 }!!),
                            active = true
                        ),
                        Building(
                            type = BuildingType.FARM,
                            tile = TileRef(tiles.find { it.position.q == -5 + 1 && it.position.r == 0 }!!),
                            active = true
                        ),
                        Building(
                            type = BuildingType.FARM,
                            tile = TileRef(tiles.find { it.position.q == -5 - 1 && it.position.r == +1 }!!),
                            active = true
                        ),
                        Building(
                            type = BuildingType.FARM,
                            tile = TileRef(tiles.find { it.position.q == -5 - 1 && it.position.r == +1 }!!),
                            active = true
                        ),
                        Building(
                            type = BuildingType.FARM,
                            tile = TileRef(tiles.find { it.position.q == -5 - 1 && it.position.r == +1 }!!),
                            active = true
                        ),
                        Building(
                            type = BuildingType.FARM,
                            tile = TileRef(tiles.find { it.position.q == -5 - 1 && it.position.r == +1 }!!),
                            active = true
                        ),
						Building(
							type = BuildingType.TOOLMAKER,
							tile = null,
							active = true
						),
						Building(
							type = BuildingType.TOOLMAKER,
							tile = null,
							active = true
						),
						Building(
							type = BuildingType.TOOLMAKER,
							tile = null,
							active = true
						),
                    )
                ),
                City(
                    cityId = "test-city-wood",
                    countryId = "test-country",
                    tile = TileRef(tiles.find { it.position.q == +5 && it.position.r == 0 }!!),
                    name = "Test Wood",
                    color = RGBColor.random(),
                    isProvinceCapital = true,
                    buildings = mutableListOf(
                        Building(
                            type = BuildingType.WOODCUTTER,
                            tile = TileRef(tiles.find { it.position.q == +5 - 1 && it.position.r == 0 }!!),
                            active = true
                        ),
                        Building(
                            type = BuildingType.WOODCUTTER,
                            tile = TileRef(tiles.find { it.position.q == +5 + 1 && it.position.r == 0 }!!),
                            active = true
                        ),
                        Building(
                            type = BuildingType.WOODCUTTER,
                            tile = TileRef(tiles.find { it.position.q == +5 - 1 && it.position.r == +1 }!!),
                            active = true
                        ),
                        Building(
                            type = BuildingType.WOODCUTTER,
                            tile = TileRef(tiles.find { it.position.q == +5 - 1 && it.position.r == +1 }!!),
                            active = true
                        ),
						Building(
							type = BuildingType.WOODCUTTER,
							tile = TileRef(tiles.find { it.position.q == +5 - 1 && it.position.r == +1 }!!),
							active = true
						),
						Building(
							type = BuildingType.WOODCUTTER,
							tile = TileRef(tiles.find { it.position.q == +5 - 1 && it.position.r == +1 }!!),
							active = true
						),
						Building(
							type = BuildingType.TOOLMAKER,
							tile = null,
							active = true
						),
						Building(
							type = BuildingType.STABLES,
							tile = null,
							active = true
						),
						Building(
							type = BuildingType.STABLES,
							tile = null,
							active = true
						),
                    )
                ),
            ),
            provinces = listOf(
                Province(
                    provinceId = "test-province-food",
                    countryId = "test-country",
                    cityIds = mutableListOf("test-city-food"),
                    provinceCapitalCityId = "test-city-food",
                ),
				Province(
					provinceId = "test-province-wood",
					countryId = "test-country",
					cityIds = mutableListOf("test-city-wood"),
					provinceCapitalCityId = "test-city-wood",
				)
            ),
            routes = listOf(
                Route(
                    routeId = "test-route",
                    cityIdA = "test-city-food",
                    cityIdB = "test-city-wood",
                    path = listOf(
                        TileRef(tiles.find { it.position.q == -5 && it.position.r == 0 }!!),
                        TileRef(tiles.find { it.position.q == -4 && it.position.r == 0 }!!),
                        TileRef(tiles.find { it.position.q == -3 && it.position.r == 0 }!!),
                        TileRef(tiles.find { it.position.q == -2 && it.position.r == 0 }!!),
                        TileRef(tiles.find { it.position.q == -1 && it.position.r == 0 }!!),
                        TileRef(tiles.find { it.position.q == 0 && it.position.r == 0 }!!),
                        TileRef(tiles.find { it.position.q == 1 && it.position.r == 0 }!!),
                        TileRef(tiles.find { it.position.q == 2 && it.position.r == 0 }!!),
                        TileRef(tiles.find { it.position.q == 3 && it.position.r == 0 }!!),
                        TileRef(tiles.find { it.position.q == 4 && it.position.r == 0 }!!),
                        TileRef(tiles.find { it.position.q == 5 && it.position.r == 0 }!!)
                    )
                )
            )
        )

        for (i in 1..10) {
            performEconomyUpdate(game)
        }

		for (i in 1..10) {
			game.provinces.find { it.provinceId == "test-province-food" }!!.also { province ->
				province shouldHaveProducedLastTurn listOf(
					ResourceType.FOOD to 6f,
					ResourceType.TOOLS to 3f,
				)
//				province shouldHaveConsumedCurrentTurn listOf(
//					ResourceType.FOOD to 2f,
//					ResourceType.WOOD to 3f,
//				)
				province shouldHaveProducedCurrentTurn listOf(
					ResourceType.FOOD to 6f,
					ResourceType.TOOLS to 3f,
				)
//				province shouldBeMissing listOf(
//					ResourceType.FOOD to 0f,
//					ResourceType.WOOD to 0f,
//				)
			}
            game.provinces.find { it.provinceId == "test-province-wood" }!!.also { province ->
                province shouldHaveProducedLastTurn listOf(
                    ResourceType.WOOD to 6f,
                    ResourceType.TOOLS to 1f,
                    ResourceType.HORSE to 2f,
                )
//                province shouldHaveConsumedCurrentTurn listOf(
//                    ResourceType.FOOD to 4f,
//                    ResourceType.WOOD to 1f,
//                )
                province shouldHaveProducedCurrentTurn listOf(
					ResourceType.WOOD to 6f,
					ResourceType.TOOLS to 1f,
					ResourceType.HORSE to 2f,
                )
//                province shouldBeMissing listOf(
//					ResourceType.FOOD to 0f,
//					ResourceType.WOOD to 0f,
//                )
            }
        }

    }

})
