package de.ruegnerlukas.strategygame.backend.core.actions.update

import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TileInfluence
import de.ruegnerlukas.strategygame.backend.ports.models.TileOwner
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.max

/**
 * Re-calculates the owner of the tiles after a change in influence
 */
class InfluenceOwnershipAction(private val gameConfig: GameConfig): Logging {

    fun perform(tiles: Collection<Tile>) {
        log().debug("Update owner of ${tiles.size} tiles after changed influence")
        tiles.forEach { tile ->
            if (tile.owner?.cityId == null) {
                updateTileOwner(tile)
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