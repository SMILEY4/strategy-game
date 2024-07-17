package io.github.smiley4.strategygame.backend.engine.moduleold.gamestep

import io.github.smiley4.strategygame.backend.common.events.BasicEventNodeDefinition
import io.github.smiley4.strategygame.backend.common.events.EventSystem
import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.max
import io.github.smiley4.strategygame.backend.commondata.GameConfig
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.TileInfluence
import io.github.smiley4.strategygame.backend.commondata.TileOwner


/**
 * Re-calculates the owner of the tiles after a change in influence
 */
class GENUpdateInfluenceOwnership(private val gameConfig: GameConfig, eventSystem: EventSystem) : Logging {

    object Definition : BasicEventNodeDefinition<InfluenceDirtyTilesData, Unit>()

    init {
        eventSystem.createNode(Definition) {
            trigger(GENUpdateCityInfluence.Definition.after())
            action { data ->
                log().debug("Update owner of ${data.tiles.size} tiles after changed influence")
                data.tiles.forEach { tile ->
                    if (tile.owner?.cityId == null) {
                        updateTileOwner(tile)
                    }
                }
                eventResultOk(Unit)
            }
        }
    }

    private fun updateTileOwner(tile: Tile) {
        getMaxInfluence(tile)?.let { maxInfluence ->
            if (isRelevantInfluence(maxInfluence)) {
                setTileOwner(tile, maxInfluence)
            }
        }
    }

    private fun getMaxInfluence(tile: Tile): TileInfluence? {
        return tile.influences.max { it.amount }
    }

    private fun isRelevantInfluence(influence: TileInfluence): Boolean {
        return influence.amount >= gameConfig.tileOwnerInfluenceThreshold
    }

    private fun setTileOwner(tile: Tile, influence: TileInfluence) {
        tile.owner = TileOwner(
            countryId = influence.countryId,
            provinceId = influence.provinceId,
            cityId = null
        )
    }

}