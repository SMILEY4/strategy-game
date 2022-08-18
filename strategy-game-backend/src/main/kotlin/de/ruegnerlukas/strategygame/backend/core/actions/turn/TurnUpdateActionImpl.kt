package de.ruegnerlukas.strategygame.backend.core.actions.turn

import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.distance
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CityEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileCityInfluence
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileCountryInfluence
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileOwner
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnUpdateAction
import de.ruegnerlukas.strategygame.backend.shared.max
import kotlin.math.max

class TurnUpdateActionImpl(
	private val gameConfig: GameConfig
) : TurnUpdateAction {

	override fun perform(game: GameExtendedEntity) {
		updateCountryResources(game)
		updateTileInfluences(game)
		updateTileOwner(game)
	}


	private fun updateCountryResources(game: GameExtendedEntity) {
		game.cities.forEach { city ->
			game.countries.find { it.key == city.countryId }?.let { it.resources.money += gameConfig.cityIncomePerTurn }
		}
	}


	private fun updateTileInfluences(game: GameExtendedEntity) {
		game.tiles.forEach { tile ->
			updateTileInfluences(game, tile)
		}
	}


	private fun updateTileInfluences(game: GameExtendedEntity, tile: TileEntity) {
		tile.influences.clear()
		game.cities.forEach { city ->
			updateTileInfluences(tile, city)
		}
	}


	private fun updateTileInfluences(tile: TileEntity, city: CityEntity) {
		val cityInfluence = calcInfluence(tile.position.distance(city.tile))
		if (cityInfluence > 0) {
			addTileInfluence(tile, city, cityInfluence)
		}
	}


	private fun addTileInfluence(tile: TileEntity, city: CityEntity, influenceValue: Double) {
		tile.influences.find { it.countryId == city.countryId }
			?.let {
				it.totalValue += influenceValue
				it.sources.add(
					TileCityInfluence(
						cityId = city.key!!,
						provinceId = city.provinceId,
						value = influenceValue
					)
				)
			}
			?: tile.influences.add(
				TileCountryInfluence(
					countryId = city.countryId,
					totalValue = influenceValue,
					sources = mutableListOf(TileCityInfluence(city.key!!, city.provinceId, influenceValue))
				)
			)
	}


	private fun calcInfluence(distance: Int): Double {
		return max((-(distance.toDouble() / gameConfig.cityInfluenceSpread) + 1) * gameConfig.cityInfluenceAmount, 0.0)
	}


	private fun updateTileOwner(game: GameExtendedEntity) {
		game.tiles.filter { it.owner == null }.forEach { tile ->
			val maxCountryInfluence = tile.influences.max { it.totalValue }
			if (maxCountryInfluence != null && maxCountryInfluence.totalValue >= gameConfig.tileOwnerInfluenceThreshold) {
				maxCountryInfluence.sources.max { it.value }?.let { maxCityInfluence ->
					tile.owner = TileOwner(
						countryId = maxCountryInfluence.countryId,
						provinceId = maxCityInfluence.provinceId,
						cityId = maxCityInfluence.cityId
					)
				}
			}
		}
	}

}