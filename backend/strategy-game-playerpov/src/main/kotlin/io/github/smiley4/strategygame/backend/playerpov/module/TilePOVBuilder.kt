package io.github.smiley4.strategygame.backend.playerpov.module

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.engine.edge.GameValidations


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
            "base" to objHidden(visibility.isAtLeast(TileVisibilityDTO.DISCOVERED)) {
                obj {
                    "terrainType" to tile.dataWorld.terrainType
                    "resourceType" to tile.dataWorld.resourceType
                    "height" to tile.dataWorld.height
                }
            }
            "political" to objHidden(visibility.isAtLeast(TileVisibilityDTO.DISCOVERED)) {
                obj {
                    "controlledBy" to tile.dataPolitical.controlledBy?.let {
                        obj {
                            "country" to it.country.value
                            "province" to it.province.value
                            "settlement" to it.settlement.value
                        }
                    }
                }
            }
            "createSettlement" to obj {
                "settler" to canCreateSettlementWithSettler(game, tile, visibility)
                "direct" to canCreateSettlementDirect(game, tile, visibility)
            }
        }
    }

    private fun canCreateSettlementWithSettler(game: GameExtended, tile: Tile, visibility: TileVisibilityDTO): Boolean {
        if(visibility.isLessThan(TileVisibilityDTO.DISCOVERED)) {
            return false
        }
        try {
            gameValidations.validateSettlementLocationSettler(game, tile, povCache.povCountryId)
            return true
        } catch (e: Exception) {
            return false
        }
    }

    private fun canCreateSettlementDirect(game: GameExtended, tile: Tile, visibility: TileVisibilityDTO): Boolean {
        if(visibility.isLessThan(TileVisibilityDTO.DISCOVERED)) {
            return false
        }
        try {
            gameValidations.validateSettlementLocationDirect(game, tile, povCache.povCountryId)
            return true
        } catch (e: Exception) {
            return false
        }
    }

}