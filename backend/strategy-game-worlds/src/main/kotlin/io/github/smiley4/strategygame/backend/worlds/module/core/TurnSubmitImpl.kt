package io.github.smiley4.strategygame.backend.worlds.module.core

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.EntityNotFoundError
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.CommandData
import io.github.smiley4.strategygame.backend.commondata.DbId
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.PlayerState
import io.github.smiley4.strategygame.backend.worlds.edge.TurnEnd
import io.github.smiley4.strategygame.backend.worlds.edge.TurnSubmit
import io.github.smiley4.strategygame.backend.worlds.module.persistence.CommandsInsert
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameQuery
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameUpdate


internal class TurnSubmitImpl(
    private val actionEndTurn: TurnEnd,
    private val gameQuery: GameQuery,
    private val gameUpdate: GameUpdate,
    private val commandsInsert: CommandsInsert,
) : TurnSubmit, Logging {

    private val metricId = MetricId.action(TurnSubmit::class)

    override suspend fun perform(userId: String, gameId: String, commands: Collection<CommandData>) {
        return time(metricId) {
            log().info("user $userId submits ${commands.size} commands for game $gameId")
            val game = getGame(gameId)
            updatePlayerState(game, userId)
            saveCommands(game, userId, commands)
            maybeEndTurn(game)
        }
    }


    /**
     * Fetch the game with the given id. Since we already found a player, we can assume the game exists
     */
    private suspend fun getGame(gameId: String): Game {
        try {
            return gameQuery.execute(gameId)
        } catch (e: EntityNotFoundError) {
            throw TurnSubmit.GameNotFoundError(e)
        }
    }


    /**
     * Set the state of the given player to "submitted"
     */
    private suspend fun updatePlayerState(game: Game, userId: String) {
        val player = game.players.findByUserId(userId)
        if (player != null) {
            player.state = PlayerState.SUBMITTED
            gameUpdate.execute(game)
        } else {
            throw TurnSubmit.NotParticipantError()
        }
    }


    /**
     * save the given commands at the given game
     */
    private suspend fun saveCommands(game: Game, userId: String, commandData: Collection<CommandData>) {
        val commands = commandData.map { data ->
            Command(
                commandId = DbId.PLACEHOLDER,
                userId = userId,
                gameId = game.gameId,
                turn = game.turn,
                data = data
            )
        }
        commandsInsert.execute(commands)
    }


    /**
     * End turn if all players submitted their commands (none in state "playing")
     */
    private suspend fun maybeEndTurn(game: Game) {
        val countPlaying = game.players.count { it.state == PlayerState.PLAYING && it.connectionId != null }
        if (countPlaying == 0) {
            try {
                actionEndTurn.perform(game.gameId)
            } catch (e: TurnEnd.TurnEndError) {
                when (e) {
                    is TurnEnd.GameNotFoundError -> throw TurnSubmit.EndTurnError(e)
                    is TurnEnd.GameStepError -> throw TurnSubmit.EndTurnError(e)
                }
            }
        }
    }

}