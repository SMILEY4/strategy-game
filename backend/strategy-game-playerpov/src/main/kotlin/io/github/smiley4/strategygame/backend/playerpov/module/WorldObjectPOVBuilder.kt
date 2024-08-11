package io.github.smiley4.strategygame.backend.playerpov.module

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.ScoutWorldObject
import io.github.smiley4.strategygame.backend.commondata.SettlerWorldObject
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.engine.edge.GameValidations


internal class WorldObjectPOVBuilder(private val povCache: POVCache, private val gameValidations: GameValidations) {

    fun build(game: GameExtended, worldObject: WorldObject): JsonType? {
        if (povCache.worldObjectVisibility(worldObject.id).isLessThan(TileVisibilityDTO.DISCOVERED)) {
            return null
        }
        return when (worldObject) {
            is ScoutWorldObject -> obj {
                "type" to "scout"
                "id" to worldObject.id
                "country" to worldObject.country
                "tile" to obj {
                    "id" to worldObject.tile.id
                    "q" to worldObject.tile.q
                    "r" to worldObject.tile.r
                }
                "maxMovement" to worldObject.maxMovement
            }
            is SettlerWorldObject -> obj {
                "type" to "settler"
                "id" to worldObject.id
                "country" to worldObject.country
                "tile" to obj {
                    "id" to worldObject.tile.id
                    "q" to worldObject.tile.q
                    "r" to worldObject.tile.r
                }
                "maxMovement" to worldObject.maxMovement
                "canCreateSettlement" to canCreateSettlement(game, worldObject)
            }
        }
    }

    private fun canCreateSettlement(game: GameExtended, settler: WorldObject): Boolean {
        try {
            gameValidations.validateSettlementLocation(game, game.findTile(settler.tile))
            return true
        } catch (e: Exception) {
            return false
        }
    }

}