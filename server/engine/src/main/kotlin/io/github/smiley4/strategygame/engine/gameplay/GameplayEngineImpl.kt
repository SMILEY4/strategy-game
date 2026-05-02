package io.github.smiley4.strategygame.engine.gameplay

import io.github.smiley4.strategygame.engine.domain.GameplayEngine
import io.github.smiley4.strategygame.engine.PlayerCommand
import io.github.smiley4.strategygame.engine.domain.GameNotificationService
import io.github.smiley4.strategygame.engine.domain.ProcessTurnError
import io.github.smiley4.strategygame.shared.domain.GameId

internal class GameplayEngineImpl(
    private val gameStateRepository: GameStateRepository,
    private val gameNotificationService: GameNotificationService
) : GameplayEngine {

    override fun processTurn(gameId: GameId, commands: Collection<PlayerCommand>) {

        val gameState = gameStateRepository.load(gameId)
            ?: throw ProcessTurnError.NotFound(gameId.id.toString())

        // todo: implement gameplay logic, apply commands to game state

        gameStateRepository.save(gameState)

        // todo: send game states to all players connected to game "gameId"
        //   if(gameNotificationService.isReachable(...)) {
        //      build povState
        //      gameNotificationService.send(povState)
        //   }
    }

}