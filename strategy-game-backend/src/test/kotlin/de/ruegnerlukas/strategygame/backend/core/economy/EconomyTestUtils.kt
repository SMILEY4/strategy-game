package de.ruegnerlukas.strategygame.backend.core.economy

import de.ruegnerlukas.strategygame.backend.core.actions.events.actions.GameActionCountryResources
import de.ruegnerlukas.strategygame.backend.core.actions.events.actions.GameActionWorldPrepare
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventResourcesUpdate
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventWorldPrepare
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventWorldUpdate
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.core.world.WorldBuilder
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.Country
import de.ruegnerlukas.strategygame.backend.ports.models.Game
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Player
import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType
import de.ruegnerlukas.strategygame.backend.ports.models.Route
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TileData
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.ports.models.TileResourceType
import de.ruegnerlukas.strategygame.backend.ports.models.TileType
import de.ruegnerlukas.strategygame.backend.ports.models.TradeRoute
import de.ruegnerlukas.strategygame.backend.ports.models.WorldSettings
import de.ruegnerlukas.strategygame.backend.ports.models.containers.PlayerContainer
import de.ruegnerlukas.strategygame.backend.ports.models.containers.TileContainer
import de.ruegnerlukas.strategygame.backend.shared.RGBColor
import de.ruegnerlukas.strategygame.backend.shared.positionsNeighbours
import de.ruegnerlukas.strategygame.backend.shared.tracking
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.floats.plusOrMinus
import io.kotest.matchers.shouldBe

object EconomyTestUtils {

	fun tiles(): List<Tile> {
		return WorldBuilder().buildTiles(WorldSettings.landOnly()).map { tile ->
			Tile(
				tileId = "tile-${tile.q}-${tile.r}",
				position = TilePosition(tile.q, tile.r),
				data = TileData(
					terrainType = TileType.LAND,
					resourceType = TileResourceType.PLAINS
				),
				influences = mutableListOf(),
				owner = null,
				discoveredByCountries = mutableListOf("test-country"),
				content = mutableListOf()
			)
		}
	}

	fun generateResourcesForPosition(tiles: Collection<Tile>, position: TilePosition, resources: Collection<TileResourceType>) {
		val remainingResources = resources.toMutableList()
		positionsNeighbours(position) { q, r ->
			if (remainingResources.isNotEmpty()) {
				val resource = remainingResources.removeAt(0)
				tiles.find { it.position.q == q && it.position.r == r }?.let { tile ->
					tile.data.resourceType = resource
				}
			}
		}
	}

	fun game(
		tiles: Collection<Tile>? = null,
		cities: Collection<City>? = null,
		provinces: Collection<Province>? = null,
		routes: Collection<Route>? = null
	) =
		GameExtended(
			game = Game(
				gameId = "test-game",
				turn = 0,
				players = PlayerContainer(
					listOf(
						Player(
							userId = "test-user",
							connectionId = 0,
							state = Player.STATE_PLAYING
						)
					)
				),
			),
			tiles = TileContainer(tiles ?: listOf()),
			countries = listOf(
				Country(
					countryId = "test-country",
					userId = "test-user",
					color = RGBColor.random()
				)
			),
			cities = (cities ?: listOf()).tracking(),
			provinces = (provinces ?: listOf()).tracking(),
			routes = (routes ?: listOf()).tracking()
		)

	suspend fun performEconomyUpdate(game: GameExtended) {
		GameActionWorldPrepare().perform(GameEventWorldPrepare(game))
		GameActionCountryResources(GameConfig.default()).perform(GameEventWorldUpdate(game))
	}

	infix fun Province.shouldHaveProducedLastTurn(resources: Collection<Pair<ResourceType, Float>>) {
		resources.forEach { (type, amount) ->
			this.resourcesProducedPrevTurn[type] shouldBe amount.plusOrMinus(0.0001f)
		}
	}

	infix fun Province.shouldHaveProducedCurrentTurn(resources: Collection<Pair<ResourceType, Float>>) {
		resources.forEach { (type, amount) ->
			this.resourcesProducedCurrTurn[type] shouldBe amount.plusOrMinus(0.0001f)
		}
	}

	infix fun Province.shouldHaveConsumedCurrentTurn(resources: Collection<Pair<ResourceType, Float>>) {
		resources.forEach { (type, amount) ->
			this.resourcesConsumedCurrTurn[type] shouldBe amount.plusOrMinus(0.0001f)
		}
	}

	infix fun Province.shouldBeMissing(resources: Collection<Pair<ResourceType, Float>>) {
		resources.forEach { (type, amount) ->
			this.resourcesMissing[type] shouldBe amount.plusOrMinus(0.0001f)
		}
	}

}