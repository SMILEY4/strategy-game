package io.github.smiley4.strategygame.engine.simulation.playerstate

import com.lectra.koson.ObjectType
import com.lectra.koson.arr
import com.lectra.koson.obj
import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.Tile
import io.github.smiley4.strategygame.shared.values.UserId

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
    }

}