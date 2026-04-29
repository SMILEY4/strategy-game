package io.github.smiley4.strategygame.engine

import io.github.smiley4.strategygame.shared.domain.GameId
import io.github.smiley4.strategygame.shared.domain.UserId

interface GameEngineService {
    fun create(players: Collection<UserId>): GameId
    suspend fun delete(gameId: GameId)
    suspend fun submitTurn(player: UserId, gameId: GameId, commands: List<PlayerCommand>)
}