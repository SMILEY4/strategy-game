package de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.entities

import de.ruegnerlukas.strategygame.backend.common.models.Game
import de.ruegnerlukas.strategygame.backend.common.models.GameMeta
import de.ruegnerlukas.strategygame.backend.common.models.PlayerContainer
import de.ruegnerlukas.strategygame.backend.common.persistence.DbId
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.DbEntity
import de.ruegnerlukas.strategygame.backend.common.models.Player

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
        fun of(serviceModel: GameMeta, game: GameEntity) = GameEntity(
            key = DbId.asDbId(serviceModel.gameId),
            turn = serviceModel.turn,
            players = game.players.toList()
        )
    }


    fun asServiceModel() = Game(
        gameId = this.getKeyOrThrow(),
        turn = this.turn,
        players = PlayerContainer(this.players)
    )

}

