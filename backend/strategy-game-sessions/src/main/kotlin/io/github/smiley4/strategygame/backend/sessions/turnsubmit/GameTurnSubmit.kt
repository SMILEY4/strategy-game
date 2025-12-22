package io.github.smiley4.strategygame.backend.sessions.turnsubmit

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.EntityNotFoundError
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.CommandData
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.Player
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.commondata.utils.DbId
import io.github.smiley4.strategygame.backend.sessions.turnend.GameTurnEnd
import io.github.smiley4.strategygame.backend.sessions.turnend.GameTurnEndError

internal class GameTurnSubmit(
    private val gameDbCommandsInsert: GameDbCommandsInsert,
    private val gameDbQuery: GameDbQuery,
    private val gameDbUpdate: GameDbUpdate,
    private val gameTurnEnd: GameTurnEnd,
) : Logging {

    private val metricId = MetricId.action(GameTurnSubmit::class)

    suspend fun submit(userId: User.Id, gameId: Game.Id, commands: Collection<CommandData>) {
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
    private suspend fun getGame(gameId: Game.Id): Game {
        try {
            return gameDbQuery.query(gameId)
        } catch (e: EntityNotFoundError) {
            throw GameTurnSubmitError.GameNotFoundError(e)
        }
    }


    /**
     * Set the state of the given player to "submitted"
     */
    private suspend fun updatePlayerState(game: Game, userId: User.Id) {
        val player = game.players.findByUserId(userId)
        if (player != null) {
            player.state = Player.State.SUBMITTED
            gameDbUpdate.update(game)
        } else {
            throw GameTurnSubmitError.NotParticipantError()
        }
    }


    /**
     * save the given commands at the given game
     */
    private suspend fun saveCommands(game: Game, userId: User.Id, commandData: Collection<CommandData>) {
        val commands = commandData.map { data ->
            Command(
                id = Command.Id(DbId.PLACEHOLDER),
                user = userId,
                game = game.id,
                turn = game.turn,
                data = data
            )
        }
        gameDbCommandsInsert.insert(commands)
    }


    /**
     * End turn if all players submitted their commands (none in state "playing")
     */
    private suspend fun maybeEndTurn(game: Game) {
        val countPlaying = game.players.count { it.state == Player.State.PLAYING && it.connectionId != null }
        if (countPlaying == 0) {
            try {
                gameTurnEnd.end(game.id)
            } catch (e: GameTurnEndError) {
                when (e) {
                    is GameTurnEndError.GameNotFoundError -> throw GameTurnSubmitError.EndTurnError(e)
                    is GameTurnEndError.GameStepError -> throw GameTurnSubmitError.EndTurnError(e)
                }
            }
        }
    }

}
