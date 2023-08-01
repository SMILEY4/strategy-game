package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.events.BasicEventNodeDefinition
import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileOwner
import de.ruegnerlukas.strategygame.backend.common.utils.positionsCircle

/**
 * Re-calculates the owner of the tiles near the created city.
 * This only handles the tiles that will be owned directly by the city, not tiles added to the province via influence
 */
class GENUpdateCityTileOwnership(eventSystem: EventSystem) : Logging {

    object Definition : BasicEventNodeDefinition<CreateCityResultData, Unit>()

    init {
        eventSystem.createNode(Definition) {
            trigger(GENCreateCity.Definition.after())
            action { data ->
                log().debug("Update tile owners after creation of city ${data.city.cityId}")
                iterateAffectedTiles(data.game, data.city) { tile ->
                    if (canOwnTile(tile, data.city)) {
                        setTileOwner(tile, data.city, data.province.provinceId)
                    }
                }
                eventResultOk(Unit)
            }
        }
    }

    private fun iterateAffectedTiles(game: GameExtended, city: City, consumer: (tile: Tile) -> Unit) {
        positionsCircle(city.tile, 1) { q, r ->
            game.findTileOrNull(q, r)?.let { tile ->
                consumer(tile)
            }
        }
    }

    private fun canOwnTile(tile: Tile, city: City): Boolean {
        return tile.owner == null || (tile.owner?.countryId == city.countryId && tile.owner?.cityId == null)
    }

    private fun setTileOwner(tile: Tile, city: City, provinceId: String) {
        tile.owner = TileOwner(
            countryId = city.countryId,
            provinceId = provinceId,
            cityId = city.cityId
        )
    }

}