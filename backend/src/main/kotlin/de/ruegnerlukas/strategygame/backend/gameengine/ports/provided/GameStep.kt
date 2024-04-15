package de.ruegnerlukas.strategygame.backend.gameengine.ports.provided

import de.ruegnerlukas.strategygame.backend.common.jsondsl.JsonType
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.Command

interface GameStep {

    sealed class GameStepError : Exception()


    /**
     * The requested game could not be found
     */
    class GameNotFoundError : GameStepError()


    /**
     * Performs a single game-step
     * @return the game state from the perspective of the participating players
     * @throws GameStepError
     * @throws POVBuilder.PlayerViewCreatorError
     */
    suspend fun perform(gameId: String, commands: Collection<Command<*>>, userIds: Collection<String>): Map<String, JsonType>
}