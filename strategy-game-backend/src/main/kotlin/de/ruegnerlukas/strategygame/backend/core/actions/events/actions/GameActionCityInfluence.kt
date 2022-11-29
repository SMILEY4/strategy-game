package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventCityCreate
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventTileInfluenceUpdate
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TileInfluence
import de.ruegnerlukas.strategygame.backend.shared.distance
import de.ruegnerlukas.strategygame.backend.shared.positionsCircle
import kotlin.math.max

/**
 * handles the influence-change after building a city
 */
class GameActionCityInfluence(
    private val gameConfig: GameConfig
) : GameAction<GameEventCityCreate>(GameEventCityCreate.TYPE) {

    override suspend fun perform(event: GameEventCityCreate): List<GameEvent> {
        val city = getCity(event)
        val modifiedTiles = mutableListOf<Tile>()
        positionsCircle(city.tile, gameConfig.cityMaxRange) { q, r ->
            getTile(event, q, r)?.let { tile ->
                updateTile(event.game, tile)
                modifiedTiles.add(tile)
            }
        }
        return listOf(GameEventTileInfluenceUpdate(event.game, modifiedTiles))
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

    private fun getCity(event: GameEventCityCreate): City {
        return event.game.cities.find { it.cityId == event.createdCityId }!!
    }

    private fun getProvince(game: GameExtended, cityId: String): Province {
        return game.provinces.find { it.cityIds.contains(cityId) }!!
    }

    private fun getTile(event: GameEventCityCreate, q: Int, r: Int): Tile? {
        return event.game.tiles.find { it.position.q == q && it.position.r == r }
    }

}