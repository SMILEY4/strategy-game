package io.github.smiley4.strategygame.platform.match.domain

import io.github.smiley4.strategygame.shared.domain.GameId
import io.github.smiley4.strategygame.shared.domain.UserId

interface GameEngineClient {
    fun createGame(players: Collection<UserId>): GameId
    fun deleteGame(gameId: GameId)
}