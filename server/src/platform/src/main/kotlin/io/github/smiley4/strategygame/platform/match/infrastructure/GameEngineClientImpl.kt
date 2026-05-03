package io.github.smiley4.strategygame.platform.match.infrastructure

import io.github.smiley4.strategygame.platform.match.domain.GameEngineClient
import io.github.smiley4.strategygame.shared.domain.GameId
import io.github.smiley4.strategygame.shared.domain.UserId

class GameEngineClientImpl : GameEngineClient {

    override fun createGame(players: Collection<UserId>): GameId {
        TODO("Not yet implemented")
    }

    override fun deleteGame(gameId: GameId) {
        TODO("Not yet implemented")
    }

}