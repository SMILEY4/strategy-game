package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import io.github.smiley4.strategygame.backend.commonarangodb.DbEntity
import io.github.smiley4.strategygame.backend.commondata.DbId
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.GameMeta
import io.github.smiley4.strategygame.backend.commondata.PlayerContainer


internal class GameEntity(
    val name: String,
    val creationTimestamp: Long,
    val turn: Int,
    val players: List<PlayerEntity>,
    key: String? = null,
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: Game) =
            GameEntity(
                key = DbId.asDbId(serviceModel.gameId),
                name = serviceModel.name,
                creationTimestamp = serviceModel.creationTimestamp,
                turn = serviceModel.turn,
                players = serviceModel.players.map { PlayerEntity.of(it) }.toList(),
            )

        fun of(serviceModel: GameMeta, game: GameEntity) =
            GameEntity(
                key = DbId.asDbId(serviceModel.gameId),
                turn = serviceModel.turn,
                name = game.name,
                creationTimestamp = game.creationTimestamp,
                players = game.players.toList()
            )
    }


    fun asServiceModel() = Game(
        gameId = this.getKeyOrThrow(),
        name = this.name,
        creationTimestamp = this.creationTimestamp,
        turn = this.turn,
        players = PlayerContainer(this.players.map { it.asServiceModel() })
    )

}

