package io.github.smiley4.strategygame.backend.engine.moduleold.gamestep

import io.github.smiley4.strategygame.backend.common.events.BasicEventNodeDefinition
import io.github.smiley4.strategygame.backend.common.events.EventSystem
import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.positionsCircle
import io.github.smiley4.strategygame.backend.common.utils.distance
import io.github.smiley4.strategygame.backend.commondata.City
import io.github.smiley4.strategygame.backend.commondata.GameConfig
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Province
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.TileInfluence
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