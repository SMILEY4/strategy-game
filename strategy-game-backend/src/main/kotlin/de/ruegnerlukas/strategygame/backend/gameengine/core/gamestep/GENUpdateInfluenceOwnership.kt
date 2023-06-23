package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.events.EventNodeDefinition
import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.common.models.TileInfluence
import de.ruegnerlukas.strategygame.backend.common.models.TileOwner
import de.ruegnerlukas.strategygame.backend.common.utils.max

/**
 * Re-calculates the owner of the tiles after a change in influence
 */
class GENUpdateInfluenceOwnership(private val gameConfig: GameConfig, eventSystem: EventSystem) : Logging {

    object Definition : EventNodeDefinition<InfluenceDirtyTilesData, Unit>()

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