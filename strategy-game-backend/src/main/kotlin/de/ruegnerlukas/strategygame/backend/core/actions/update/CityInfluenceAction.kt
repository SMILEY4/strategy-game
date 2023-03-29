package de.ruegnerlukas.strategygame.backend.core.actions.update

import de.ruegnerlukas.strategygame.backend.core.actions.update.CityCreationAction.Companion.CityCreationResult
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TileInfluence
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.distance
import de.ruegnerlukas.strategygame.backend.shared.positionsCircle
import kotlin.math.max

/**
 * Re-calculates the influence on tiles near the created city
 */
class CityInfluenceAction(private val gameConfig: GameConfig): Logging {

    fun perform(game: GameExtended, creationResult: CityCreationResult): List<Tile> {
        log().debug("Updating influence after creation of city ${creationResult.city.cityId}")
        val city = getCity(creationResult)
        val modifiedTiles = mutableListOf<Tile>()
        positionsCircle(city.tile, gameConfig.cityMaxRange) { q, r ->
            getTile(game, q, r)?.let { tile ->
                updateTile(game, tile)
                modifiedTiles.add(tile)
            }
        }
        return modifiedTiles
    }

    private fun updateTile(game: GameExtended, tile: Tile) {
        tile.influences.clear()
        game.cities.forEach { city ->
            val province = getProvince(game, city.cityId)
            updateTileInfluences(tile, city, province)
        }
    }

    private fun updateTileInfluences(tile: Tile, city: City, province: Province) {
        val influenceSpread = if (city.isProvinceCapital) gameConfig.cityInfluenceSpread else gameConfig.townInfluenceSpread
        val influenceAmount = if (city.isProvinceCapital) gameConfig.cityInfluenceAmount else gameConfig.townInfluenceAmount
        val cityInfluence = calcInfluence(tile.position.distance(city.tile), influenceSpread, influenceAmount)
        if (cityInfluence > 0) {
            addTileInfluence(tile, city, province, cityInfluence)
        }
    }

    private fun addTileInfluence(tile: Tile, city: City, province: Province, influenceValue: Double) {
        tile.influences.add(
            TileInfluence(
                countryId = province.countryId,
                provinceId = province.provinceId,
                cityId = city.cityId,
                amount = influenceValue
            )
        )
    }

    private fun calcInfluence(distance: Int, spread: Float, amount: Float): Double {
        return max((-(distance.toDouble() / spread) + 1) * amount, 0.0)
    }

    private fun getCity(creationResult: CityCreationResult): City {
        return creationResult.city
    }

    private fun getProvince(game: GameExtended, cityId: String): Province {
        return game.provinces.find { it.cityIds.contains(cityId) }!!
    }

    private fun getTile(game: GameExtended, q: Int, r: Int): Tile? {
        return game.tiles.get(q, r)
    }

}