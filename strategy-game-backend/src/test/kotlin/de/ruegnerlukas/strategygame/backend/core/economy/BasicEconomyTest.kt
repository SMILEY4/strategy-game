package de.ruegnerlukas.strategygame.backend.core.economy

import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.core.economy.EconomyTestUtils.game
import de.ruegnerlukas.strategygame.backend.core.economy.EconomyTestUtils.generateResourcesForPosition
import de.ruegnerlukas.strategygame.backend.core.economy.EconomyTestUtils.performEconomyUpdate
import de.ruegnerlukas.strategygame.backend.core.economy.EconomyTestUtils.shouldBeMissing
import de.ruegnerlukas.strategygame.backend.core.economy.EconomyTestUtils.shouldHaveConsumedCurrentTurn
import de.ruegnerlukas.strategygame.backend.core.economy.EconomyTestUtils.shouldHaveProducedCurrentTurn
import de.ruegnerlukas.strategygame.backend.core.economy.EconomyTestUtils.shouldHaveProducedLastTurn
import de.ruegnerlukas.strategygame.backend.core.economy.EconomyTestUtils.tiles
import de.ruegnerlukas.strategygame.backend.ports.models.Building
import de.ruegnerlukas.strategygame.backend.ports.models.BuildingType
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.ports.models.TileRef
import de.ruegnerlukas.strategygame.backend.ports.models.TileResourceType
import de.ruegnerlukas.strategygame.backend.shared.RGBColor
import io.kotest.core.spec.style.StringSpec

class BasicEconomyTest : StringSpec({

	"test basic city without any production,consumption" {
		val tiles = tiles()
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
					buildings = mutableListOf()
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

		for (i in 1..10) {
			performEconomyUpdate(game)
		}

		game.provinces[0].also { province ->
			province shouldHaveProducedLastTurn listOf(ResourceType.FOOD to 0f)
			province shouldHaveConsumedCurrentTurn listOf(ResourceType.FOOD to 0f)
			province shouldHaveProducedCurrentTurn listOf(ResourceType.FOOD to 0f)
			province shouldBeMissing listOf(ResourceType.FOOD to GameConfig.default().cityFoodCostPerTurn)
		}

	}

	"test basic production chain with all resources available" {
		val tiles = tiles().also { tiles ->
			generateResourcesForPosition(
				tiles, TilePosition(0, 0), listOf(
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
					cityId = "test-city",
					countryId = "test-country",
					tile = TileRef(tiles.find { it.position.q == 0 && it.position.r == 0 }!!),
					name = "Test",
					color = RGBColor.random(),
					isProvinceCapital = true,
					buildings = mutableListOf(
						Building(
							type = BuildingType.FARM,
							tile = TileRef(tiles.find { it.position.q == -1 && it.position.r == 0 }!!),
							active = true
						),
						Building(
							type = BuildingType.FARM,
							tile = TileRef(tiles.find { it.position.q == +1 && it.position.r == 0 }!!),
							active = true
						),
						Building(
							type = BuildingType.FARM,
							tile = TileRef(tiles.find { it.position.q == -1 && it.position.r == +1 }!!),
							active = true
						),
						Building(
							type = BuildingType.FARM,
							tile = TileRef(tiles.find { it.position.q == 0 && it.position.r == +1 }!!),
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
		game.provinces[0].also { province ->
			province shouldHaveProducedLastTurn listOf(
				ResourceType.FOOD to 0f,
				ResourceType.HIDE to 0f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
			province shouldHaveConsumedCurrentTurn listOf(
				ResourceType.FOOD to 0f,
				ResourceType.HIDE to 0f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
			province shouldHaveProducedCurrentTurn listOf(
				ResourceType.FOOD to 4f,
				ResourceType.HIDE to 0f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
			province shouldBeMissing listOf(
				ResourceType.FOOD to 4f,
				ResourceType.HIDE to 2f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
		}

		performEconomyUpdate(game)
		game.provinces[0].also { province ->
			province shouldHaveProducedLastTurn listOf(
				ResourceType.FOOD to 4f,
				ResourceType.HIDE to 0f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
			province shouldHaveConsumedCurrentTurn listOf(
				ResourceType.FOOD to 4f,
				ResourceType.HIDE to 0f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
			province shouldHaveProducedCurrentTurn listOf(
				ResourceType.FOOD to 4f,
				ResourceType.HIDE to 2f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
			province shouldBeMissing listOf(
				ResourceType.FOOD to 0f,
				ResourceType.HIDE to 2f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
		}

		performEconomyUpdate(game)
		game.provinces[0].also { province ->
			province shouldHaveProducedLastTurn listOf(
				ResourceType.FOOD to 4f,
				ResourceType.HIDE to 2f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
			province shouldHaveConsumedCurrentTurn listOf(
				ResourceType.FOOD to 4f,
				ResourceType.HIDE to 2f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
			province shouldHaveProducedCurrentTurn listOf(
				ResourceType.FOOD to 4f,
				ResourceType.HIDE to 2f,
				ResourceType.PARCHMENT to 1f,
				ResourceType.CLOTHES to 1f,
			)
			province shouldBeMissing listOf(
				ResourceType.FOOD to 0f,
				ResourceType.HIDE to 0f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
		}

		for (i in 1..5) {
			performEconomyUpdate(game)
			game.provinces[0].also { province ->
				province shouldHaveProducedLastTurn listOf(
					ResourceType.FOOD to 4f,
					ResourceType.HIDE to 2f,
					ResourceType.PARCHMENT to 1f,
					ResourceType.CLOTHES to 1f,
				)
				province shouldHaveConsumedCurrentTurn listOf(
					ResourceType.FOOD to 4f,
					ResourceType.HIDE to 2f,
					ResourceType.PARCHMENT to 0f,
					ResourceType.CLOTHES to 0f,
				)
				province shouldHaveProducedCurrentTurn listOf(
					ResourceType.FOOD to 4f,
					ResourceType.HIDE to 2f,
					ResourceType.PARCHMENT to 1f,
					ResourceType.CLOTHES to 1f,
				)
				province shouldBeMissing listOf(
					ResourceType.FOOD to 0f,
					ResourceType.HIDE to 0f,
					ResourceType.PARCHMENT to 0f,
					ResourceType.CLOTHES to 0f,
				)
			}
		}

	}


	"test basic production chain without enough food (for population)" {
		val tiles = tiles().also { tiles ->
			generateResourcesForPosition(
				tiles, TilePosition(0, 0), listOf(
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
					cityId = "test-city",
					countryId = "test-country",
					tile = TileRef(tiles.find { it.position.q == 0 && it.position.r == 0 }!!),
					name = "Test",
					color = RGBColor.random(),
					isProvinceCapital = true,
					buildings = mutableListOf(
						Building(
							type = BuildingType.FARM,
							tile = TileRef(tiles.find { it.position.q == -1 && it.position.r == 0 }!!),
							active = true
						),
						Building(
							type = BuildingType.FARM,
							tile = TileRef(tiles.find { it.position.q == +1 && it.position.r == 0 }!!),
							active = true
						),
						Building(
							type = BuildingType.FARM,
							tile = TileRef(tiles.find { it.position.q == -1 && it.position.r == +1 }!!),
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
		game.provinces[0].also { province ->
			province shouldHaveProducedLastTurn listOf(
				ResourceType.FOOD to 0f,
				ResourceType.HIDE to 0f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
			province shouldHaveConsumedCurrentTurn listOf(
				ResourceType.FOOD to 0f,
				ResourceType.HIDE to 0f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
			province shouldHaveProducedCurrentTurn listOf(
				ResourceType.FOOD to 3f,
				ResourceType.HIDE to 0f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
			province shouldBeMissing listOf(
				ResourceType.FOOD to 4f,
				ResourceType.HIDE to 2f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
		}

		performEconomyUpdate(game)
		game.provinces[0].also { province ->
			province shouldHaveProducedLastTurn listOf(
				ResourceType.FOOD to 3f,
				ResourceType.HIDE to 0f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
			province shouldHaveConsumedCurrentTurn listOf(
				ResourceType.FOOD to 3f,
				ResourceType.HIDE to 0f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
			province shouldHaveProducedCurrentTurn listOf(
				ResourceType.FOOD to 3f,
				ResourceType.HIDE to 2f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
			province shouldBeMissing listOf(
				ResourceType.FOOD to 1f,
				ResourceType.HIDE to 2f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
		}

		performEconomyUpdate(game)
		game.provinces[0].also { province ->
			province shouldHaveProducedLastTurn listOf(
				ResourceType.FOOD to 3f,
				ResourceType.HIDE to 2f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
			province shouldHaveConsumedCurrentTurn listOf(
				ResourceType.FOOD to 3f,
				ResourceType.HIDE to 2f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
			province shouldHaveProducedCurrentTurn listOf(
				ResourceType.FOOD to 3f,
				ResourceType.HIDE to 2f,
				ResourceType.PARCHMENT to 1f,
				ResourceType.CLOTHES to 1f,
			)
			province shouldBeMissing listOf(
				ResourceType.FOOD to 1f,
				ResourceType.HIDE to 0f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
		}

		for (i in 1..5) {
			performEconomyUpdate(game)
			game.provinces[0].also { province ->
				province shouldHaveProducedLastTurn listOf(
					ResourceType.FOOD to 3f,
					ResourceType.HIDE to 2f,
					ResourceType.PARCHMENT to 1f,
					ResourceType.CLOTHES to 1f,
				)
				province shouldHaveConsumedCurrentTurn listOf(
					ResourceType.FOOD to 3f,
					ResourceType.HIDE to 2f,
					ResourceType.PARCHMENT to 0f,
					ResourceType.CLOTHES to 0f,
				)
				province shouldHaveProducedCurrentTurn listOf(
					ResourceType.FOOD to 3f,
					ResourceType.HIDE to 2f,
					ResourceType.PARCHMENT to 1f,
					ResourceType.CLOTHES to 1f,
				)
				province shouldBeMissing listOf(
					ResourceType.FOOD to 1f,
					ResourceType.HIDE to 0f,
					ResourceType.PARCHMENT to 0f,
					ResourceType.CLOTHES to 0f,
				)
			}
		}

	}

	"test basic production chain without enough resource production (middle of the chain)" {
		val tiles = tiles().also { tiles ->
			generateResourcesForPosition(
				tiles, TilePosition(0, 0), listOf(
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
					cityId = "test-city",
					countryId = "test-country",
					tile = TileRef(tiles.find { it.position.q == 0 && it.position.r == 0 }!!),
					name = "Test",
					color = RGBColor.random(),
					isProvinceCapital = true,
					buildings = mutableListOf(
						Building(
							type = BuildingType.FARM,
							tile = TileRef(tiles.find { it.position.q == -1 && it.position.r == 0 }!!),
							active = true
						),
						Building(
							type = BuildingType.FARM,
							tile = TileRef(tiles.find { it.position.q == +1 && it.position.r == 0 }!!),
							active = true
						),
						Building(
							type = BuildingType.FARM,
							tile = TileRef(tiles.find { it.position.q == -1 && it.position.r == +1 }!!),
							active = true
						),
						Building(
							type = BuildingType.FARM,
							tile = TileRef(tiles.find { it.position.q == -1 && it.position.r == +1 }!!),
							active = true
						),
						Building(
							type = BuildingType.SHEEP_FARM,
							tile = null,
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
		game.provinces[0].also { province ->
			province shouldHaveProducedLastTurn listOf(
				ResourceType.FOOD to 0f,
				ResourceType.HIDE to 0f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
			province shouldHaveConsumedCurrentTurn listOf(
				ResourceType.FOOD to 0f,
				ResourceType.HIDE to 0f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
			province shouldHaveProducedCurrentTurn listOf(
				ResourceType.FOOD to 4f,
				ResourceType.HIDE to 0f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
			province shouldBeMissing listOf(
				ResourceType.FOOD to 3f,
				ResourceType.HIDE to 2f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
		}

		performEconomyUpdate(game)
		game.provinces[0].also { province ->
			province shouldHaveProducedLastTurn listOf(
				ResourceType.FOOD to 4f,
				ResourceType.HIDE to 0f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
			province shouldHaveConsumedCurrentTurn listOf(
				ResourceType.FOOD to 3f,
				ResourceType.HIDE to 0f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
			province shouldHaveProducedCurrentTurn listOf(
				ResourceType.FOOD to 4f,
				ResourceType.HIDE to 1f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
			province shouldBeMissing listOf(
				ResourceType.FOOD to 0f,
				ResourceType.HIDE to 2f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
		}

		performEconomyUpdate(game)
		game.provinces[0].also { province ->
			province shouldHaveProducedLastTurn listOf(
				ResourceType.FOOD to 4f,
				ResourceType.HIDE to 1f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
			province shouldHaveConsumedCurrentTurn listOf(
				ResourceType.FOOD to 3f,
				ResourceType.HIDE to 1f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
			province shouldHaveProducedCurrentTurn listOf(
				ResourceType.FOOD to 4f,
				ResourceType.HIDE to 1f,
				ResourceType.PARCHMENT to 1f,
				ResourceType.CLOTHES to 0f,
			)
			province shouldBeMissing listOf(
				ResourceType.FOOD to 0f,
				ResourceType.HIDE to 1f,
				ResourceType.PARCHMENT to 0f,
				ResourceType.CLOTHES to 0f,
			)
		}

		for (i in 1..5) {
			performEconomyUpdate(game)
			game.provinces[0].also { province ->
				province shouldHaveProducedLastTurn listOf(
					ResourceType.FOOD to 4f,
					ResourceType.HIDE to 1f,
					ResourceType.PARCHMENT to 1f,
					ResourceType.CLOTHES to 0f,
				)
				province shouldHaveConsumedCurrentTurn listOf(
					ResourceType.FOOD to 3f,
					ResourceType.HIDE to 1f,
					ResourceType.PARCHMENT to 0f,
					ResourceType.CLOTHES to 0f,
				)
				province shouldHaveProducedCurrentTurn listOf(
					ResourceType.FOOD to 4f,
					ResourceType.HIDE to 1f,
					ResourceType.PARCHMENT to 1f,
					ResourceType.CLOTHES to 0f,
				)
				province shouldBeMissing listOf(
					ResourceType.FOOD to 0f,
					ResourceType.HIDE to 1f,
					ResourceType.PARCHMENT to 0f,
					ResourceType.CLOTHES to 0f,
				)
			}
		}

	}

})
