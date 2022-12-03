package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventTileInfluenceUpdate
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TileInfluence
import de.ruegnerlukas.strategygame.backend.ports.models.TileOwner
import de.ruegnerlukas.strategygame.backend.shared.max

/**
 * Re-calculates the owner of the tiles after a change in influence
 * - triggered by [GameEventTileInfluenceUpdate]
 * - triggers nothing
 */
class GameActionInfluenceOwnership(
    private val gameConfig: GameConfig
) : GameAction<GameEventTileInfluenceUpdate>(GameEventTileInfluenceUpdate.TYPE) {

    override suspend fun perform(event: GameEventTileInfluenceUpdate): List<GameEvent> {
        event.tiles.forEach { tile ->
            if (tile.owner?.cityId == null) {
                updateTileOwner(tile)
            }
        }
        return listOf()
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