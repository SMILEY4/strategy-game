package de.ruegnerlukas.strategygame.backend.core.actions.turn

import de.ruegnerlukas.strategygame.backend.ports.models.distance
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileCountryInfluence
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnUpdateAction
import kotlin.math.max

class TurnUpdateActionImpl : TurnUpdateAction {

	companion object {
		private const val CITY_INCOME = 10.0f
		private const val MAX_CITY_INFLUENCE = 10.0
		private const val MAX_CITY_INFLUENCE_DISTANCE = 5.0
	}

	override fun perform(game: GameExtendedEntity) {
		updateCountryResources(game)
		updateTileCountryInfluence(game)
	}

	private fun updateCountryResources(game: GameExtendedEntity) {
		game.cities.forEach { city ->
			game.countries.find { it.key == city.countryId }?.let { it.resources.money += CITY_INCOME }
		}
	}

	private fun updateTileCountryInfluence(game: GameExtendedEntity) {
		game.tiles.forEach { tile ->
			tile.influences.clear()
			game.cities.forEach { city ->
				val cityInfluence = influence(tile.position.distance(city.tile))
				tile.influences.find { it.countryId == city.countryId }
					?.let { it.value += cityInfluence }
					?: tile.influences.add(TileCountryInfluence(city.countryId, cityInfluence))
			}
		}
	}

	private fun influence(distance: Double): Double {
		return max((-(distance / MAX_CITY_INFLUENCE_DISTANCE) + 1) * MAX_CITY_INFLUENCE, 0.0)
	}


}