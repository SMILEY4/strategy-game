package de.ruegnerlukas.strategygame.backend.core.economy

import de.ruegnerlukas.strategygame.backend.core.economy.EconomyTestUtils.game
import de.ruegnerlukas.strategygame.backend.core.economy.EconomyTestUtils.generateResourcesForPosition
import de.ruegnerlukas.strategygame.backend.core.economy.EconomyTestUtils.shouldBeMissing
import de.ruegnerlukas.strategygame.backend.core.economy.EconomyTestUtils.shouldHaveConsumedCurrentTurn
import de.ruegnerlukas.strategygame.backend.core.economy.EconomyTestUtils.shouldHaveProducedCurrentTurn
import de.ruegnerlukas.strategygame.backend.core.economy.EconomyTestUtils.shouldHaveProducedLastTurn
import de.ruegnerlukas.strategygame.backend.core.economy.EconomyTestUtils.shouldHaveTradeRoute
import de.ruegnerlukas.strategygame.backend.core.economy.EconomyTestUtils.tiles
import de.ruegnerlukas.strategygame.backend.ports.models.Building
import de.ruegnerlukas.strategygame.backend.ports.models.BuildingType
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType
import de.ruegnerlukas.strategygame.backend.ports.models.Route
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.ports.models.TileRef
import de.ruegnerlukas.strategygame.backend.ports.models.TileResourceType
import de.ruegnerlukas.strategygame.backend.ports.models.TradeRoute
import de.ruegnerlukas.strategygame.backend.shared.RGBColor
import io.kotest.core.spec.style.StringSpec

class TradeEconomyTest : StringSpec({

	"test basic production chain with resource provided via trade" {
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
					TileResourceType.PLAINS,
					TileResourceType.PLAINS,
					TileResourceType.PLAINS,
					TileResourceType.PLAINS,
					TileResourceType.PLAINS,
					TileResourceType.PLAINS
				)
			)
		}
		val game = game(
			tiles = tiles,
			cities = listOf(
				City(
					cityId = "test-city-consumer",
					countryId = "test-country",
					tile = TileRef(tiles.find { it.position.q == -5 && it.position.r == 0 }!!),
					name = "Test Consumer",
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
							type = BuildingType.PARCHMENTERS_WORKSHOP,
							tile = null,
							active = true
						),
						Building(
							type = BuildingType.TAILORS_WORKSHOP,
							tile = null,
							active = true
						)
					)
				),
				City(
					cityId = "test-city-provider",
					countryId = "test-country",
					tile = TileRef(tiles.find { it.position.q == +5 && it.position.r == 0 }!!),
					name = "Test Provider",
					color = RGBColor.random(),
					isProvinceCapital = true,
					buildings = mutableListOf(
						Building(
							type = BuildingType.FARM,
							tile = TileRef(tiles.find { it.position.q == +5 - 1 && it.position.r == 0 }!!),
							active = true
						),
						Building(
							type = BuildingType.FARM,
							tile = TileRef(tiles.find { it.position.q == +5 + 1 && it.position.r == 0 }!!),
							active = true
						),
						Building(
							type = BuildingType.FARM,
							tile = TileRef(tiles.find { it.position.q == +5 - 1 && it.position.r == 0 }!!),
							active = true
						),
						Building(
							type = BuildingType.FARM,
							tile = TileRef(tiles.find { it.position.q == +5 + 1 && it.position.r == 0 }!!),
							active = true
						),
						Building(
							type = BuildingType.SHEEP_FARM,
							tile = null,
							active = true
						),
						Building(
							type = BuildingType.SHEEP_FARM,
							tile = null,
							active = true
						)
					)
				),
			),
			provinces = listOf(
				Province(
					provinceId = "test-province-consumer",
					countryId = "test-country",
					cityIds = mutableListOf("test-city-consumer"),
					provinceCapitalCityId = "test-city-consumer",
					tradeRoutes = mutableListOf(
						TradeRoute(
							srcProvinceId = "test-province-provider",
							dstProvinceId = "test-province-consumer",
							routeIds = listOf("test-route"),
							resourceType = ResourceType.HIDE,
							rating = 42f,
							creationTurn = 0,
						)
					)
				),
				Province(
					provinceId = "test-province-provider",
					countryId = "test-country",
					cityIds = mutableListOf("test-city-provider"),
					provinceCapitalCityId = "test-city-provider",
					tradeRoutes = mutableListOf()
				)
			),
			routes = listOf(
				Route(
					routeId = "test-route",
					cityIdA = "test-city-consumer",
					cityIdB = "test-city-provider",
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

		for(i in 0..10) {
			EconomyTestUtils.performEconomyUpdateWithoutTradeRoute(game)
			println("===========")
		}

//		EconomyTestUtils.performEconomyUpdateWithoutTradeRoute(game)
//		game.provinces.find { it.provinceId == "test-province-consumer" }!!.also { province ->
//			province shouldHaveProducedLastTurn listOf(
//				ResourceType.FOOD to 0f,
//				ResourceType.HIDE to 0f,
//				ResourceType.PARCHMENT to 0f,
//				ResourceType.CLOTHES to 0f,
//			)
//			province shouldHaveConsumedCurrentTurn listOf(
//				ResourceType.FOOD to 0f,
//				ResourceType.HIDE to 0f,
//				ResourceType.PARCHMENT to 0f,
//				ResourceType.CLOTHES to 0f,
//			)
//			province shouldHaveProducedCurrentTurn listOf(
//				ResourceType.FOOD to 2f,
//				ResourceType.HIDE to 0f,
//				ResourceType.PARCHMENT to 0f,
//				ResourceType.CLOTHES to 0f,
//			)
//			province shouldBeMissing listOf(
//				ResourceType.FOOD to 2f,
//				ResourceType.HIDE to 2f,
//				ResourceType.PARCHMENT to 0f,
//				ResourceType.CLOTHES to 0f,
//			)
//		}
//		game.provinces.find { it.provinceId == "test-province-provider" }!!.also { province ->
//			province shouldHaveProducedLastTurn listOf(
//				ResourceType.FOOD to 0f,
//				ResourceType.HIDE to 0f,
//				ResourceType.PARCHMENT to 0f,
//				ResourceType.CLOTHES to 0f,
//			)
//			province shouldHaveConsumedCurrentTurn listOf(
//				ResourceType.FOOD to 0f,
//				ResourceType.HIDE to 0f,
//				ResourceType.PARCHMENT to 0f,
//				ResourceType.CLOTHES to 0f,
//			)
//			province shouldHaveProducedCurrentTurn listOf(
//				ResourceType.FOOD to 4f,
//				ResourceType.HIDE to 0f,
//				ResourceType.PARCHMENT to 0f,
//				ResourceType.CLOTHES to 0f,
//			)
//			province shouldBeMissing listOf(
//				ResourceType.FOOD to 4f,
//				ResourceType.HIDE to 0f,
//				ResourceType.PARCHMENT to 0f,
//				ResourceType.CLOTHES to 0f,
//			)
//		}

	}

})