package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventTileInfluenceUpdate
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TileOwner
import de.ruegnerlukas.strategygame.backend.shared.max

/**
 * handles the changed ownership after updating the influence of some tiles
 */
class GameActionInfluenceOwnership(
    private val gameConfig: GameConfig
) : GameAction<GameEventTileInfluenceUpdate>(GameEventTileInfluenceUpdate.TYPE) {

    override suspend fun perform(event: GameEventTileInfluenceUpdate): List<GameEvent> {
        event.tiles.forEach { tile ->
            updateTileOwner(tile)
        }
        return listOf()
    }


    private fun updateTileOwner(tile: Tile) {
        if (tile.owner?.cityId == null) {
            val maxInfluence = tile.influences.max { it.amount }
            if (maxInfluence != null && maxInfluence.amount >= gameConfig.tileOwnerInfluenceThreshold) {
                tile.owner = TileOwner(
                    countryId = maxInfluence.countryId,
                    provinceId = maxInfluence.provinceId,
                    cityId = null
                )
            }
        }
    }

}