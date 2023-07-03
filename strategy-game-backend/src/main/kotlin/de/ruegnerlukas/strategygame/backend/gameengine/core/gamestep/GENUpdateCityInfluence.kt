package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.events.BasicEventNodeDefinition
import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Province
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileInfluence
import de.ruegnerlukas.strategygame.backend.common.utils.distance
import de.ruegnerlukas.strategygame.backend.common.utils.positionsCircle
import kotlin.math.max

/**
 * Re-calculates the influence on tiles near the created city
 */
class GENUpdateCityInfluence(private val gameConfig: GameConfig, eventSystem: EventSystem) : Logging {

    object Definition : BasicEventNodeDefinition<CreateCityResultData, InfluenceDirtyTilesData>()

    init {
        eventSystem.createNode(Definition) {
            trigger(GENCreateCity.Definition.after())
            action { data ->
                log().debug("Updating influence after creation of city ${data.city.cityId}")
                val modifiedTiles = getAffectedTiles(data.game, data.city)
                modifiedTiles.forEach { updateTile(data.game, it) }
                eventResultOk(InfluenceDirtyTilesData(data.game, modifiedTiles))
            }
        }
    }

    private fun getAffectedTiles(game: GameExtended, city: City): List<Tile> {
        val tiles = mutableListOf<Tile>()
        positionsCircle(city.tile, gameConfig.cityMaxRange) { q, r ->
            game.findTileOrNull(q, r)?.also { tiles.add(it) }
        }
        return tiles
    }

    private fun updateTile(game: GameExtended, tile: Tile) {
        tile.influences.clear()
        game.cities.forEach { city ->
            val province = city.findProvince(game)
            updateTileInfluences(tile, city, province)
        }
    }

    private fun updateTileInfluences(tile: Tile, city: City, province: Province) {
        val influenceSpread = if (city.meta.isProvinceCapital) gameConfig.cityInfluenceSpread else gameConfig.townInfluenceSpread
        val influenceAmount = if (city.meta.isProvinceCapital) gameConfig.cityInfluenceAmount else gameConfig.townInfluenceAmount
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

}