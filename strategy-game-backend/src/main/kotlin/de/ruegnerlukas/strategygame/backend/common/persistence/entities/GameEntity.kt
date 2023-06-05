package de.ruegnerlukas.strategygame.backend.common.persistence.entities

import de.ruegnerlukas.strategygame.backend.common.models.Game
import de.ruegnerlukas.strategygame.backend.common.models.containers.PlayerContainer
import de.ruegnerlukas.strategygame.backend.common.persistence.DbId
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.DbEntity
import de.ruegnerlukas.strategygame.backend.ports.models.Game
import de.ruegnerlukas.strategygame.backend.ports.models.Player
import de.ruegnerlukas.strategygame.backend.ports.models.containers.PlayerContainer

class GameEntity(
    val turn: Int,
    val players: List<Player>,
    key: String? = null,
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: Game) = GameEntity(
            key = DbId.asDbId(serviceModel.gameId),
            turn = serviceModel.turn,
            players = serviceModel.players.toList()
        )
    }


    fun asServiceModel() = Game(
        gameId = this.getKeyOrThrow(),
        turn = this.turn,
        players = PlayerContainer(this.players)
    )

}

