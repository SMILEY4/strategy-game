package io.github.smiley4.strategygame.engine.simulation.playerstate

import com.lectra.koson.ObjectType
import com.lectra.koson.arr
import com.lectra.koson.obj
import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.Tile
import io.github.smiley4.strategygame.shared.values.UserId

/**
 * Builds the game state snapshot visible to a specific player.
 */
class PlayerStateBuilder {

    fun build(game: GameStateContext, player: UserId): ObjectType {
        return obj {
            "game" to obj {
                "turn" to game.turn
            }
            "tiles" to arr[
                game.tiles.map { tile(it) }
            ]
        }
    }

    fun tile(tile: Tile) = obj {
        "id" to tile.id.id.toString()
        "position" to obj {
            "q" to tile.position.q
            "r" to tile.position.r
        }
        "chunk" to obj {
            "q" to tile.meta.chunk.q
            "r" to tile.meta.chunk.r
        }
        "world" to obj {
            "biome" to tile.world.biome.name
            "elevation" to tile.world.elevation
            "feature" to tile.world.feature
            "resources" to arr[
                tile.world.resources.map { resource ->
                    obj {
                        "type" to resource.type
                        "amount" to resource.amount
                        "maxAmount" to resource.maxAmount
                        "changeRate" to resource.changeRate
                        "removeOnDeplete" to resource.removeOnDeplete
                    }
                }
            ]
        }
        "meta" to obj {
            "seed" to tile.meta.seed
        }
    }

}