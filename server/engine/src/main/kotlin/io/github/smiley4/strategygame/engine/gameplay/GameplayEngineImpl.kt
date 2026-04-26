package io.github.smiley4.strategygame.engine.gameplay

import io.github.smiley4.strategygame.engine.GameError
import io.github.smiley4.strategygame.engine.domain.GameplayEngine
import io.github.smiley4.strategygame.engine.PlayerCommand
import io.github.smiley4.strategygame.shared.domain.GameId

class GameplayEngineImpl(
    private val gameStateContextProvider: GameStateContextProvider
) : GameplayEngine {

    override fun processTurn(gameId: GameId, commands: Collection<PlayerCommand>) {

        val gameState = gameStateContextProvider.load(gameId)
            ?: throw GameError.NotFound(gameId.id.toString())

        // todo: implement gameplay logic, apply commands to game state

        gameState.save()

        // todo: send game states to all players connected to game "gameId"
    }

}