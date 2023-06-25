package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.common.utils.getOrThrow
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.PlayerViewCreator
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GameExtendedQuery
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.GameExtendedDTO
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.TurnEnd.GameNotFoundError

class PlayerViewCreatorImpl(
    private val gameExtendedQuery: GameExtendedQuery,
    private val gameConfig: GameConfig
) : PlayerViewCreator {

    override suspend fun build(userId: String, gameId: String): GameExtendedDTO {
        return build(userId, getGameState(gameId))
    }

    override fun build(userId: String, game: GameExtended): GameExtendedDTO {
        return GameExtendedDTOCreator(gameConfig).create(userId, game)
    }

    /**
     * Find and return the [GameExtended] or [GameNotFoundError] if the game does not exist
     */
    private suspend fun getGameState(gameId: String): GameExtended {
        return gameExtendedQuery.execute(gameId).getOrThrow()
    }

}