package io.github.smiley4.strategygame.backend.playerpov.application

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.engine.ports.provided.GameValidations


internal class TilePOVBuilder(private val povCache: POVCache, private val gameValidations: GameValidations) {

    fun build(tile: Tile, game: GameExtended): JsonType {
        val visibility = povCache.tileVisibility(tile.id)
        return obj {
            "identifier" to obj {
                "id" to tile.id.value
                "q" to tile.position.q
                "r" to tile.position.r
            }
            "visibility" to visibility
            "base" to hidden(visibility.isAtLeast(TileVisibilityDTO.DISCOVERED)) {
                obj {
                    "terrainType" to tile.dataWorld.terrainType
                    "resourceType" to tile.dataWorld.resourceType
                    "height" to tile.dataWorld.height
                }
            }
            "political" to hidden(visibility.isAtLeast(TileVisibilityDTO.DISCOVERED)) {
                obj {
                    "controlledBy" to tile.dataPolitical.controlledBy?.let {
                        obj {
                            "country" to it.country.value
                            "settlement" to it.settlement.value
                        }
                    }
                }
            }
            "createSettlement" to canCreateSettlement(game, tile, visibility)
        }
    }

    private fun canCreateSettlement(game: GameExtended, tile: Tile, visibility: TileVisibilityDTO): Boolean {
        if(visibility.isLessThan(TileVisibilityDTO.DISCOVERED)) {
            return false
        }
        try {
            gameValidations.validateSettlementLocation(game, tile, povCache.povCountryId)
            return true
        } catch (e: Exception) {
            return false
        }
    }

}