package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.utils.Err
import de.ruegnerlukas.strategygame.backend.common.utils.Ok
import de.ruegnerlukas.strategygame.backend.common.utils.err
import de.ruegnerlukas.strategygame.backend.common.utils.ok
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.GameExtendedDTO
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.PlayerViewCreator
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.PlayerViewCreator.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.PlayerViewCreator.PlayerViewCreatorError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GameExtendedQuery


class PlayerViewCreatorImpl(
    private val gameExtendedQuery: GameExtendedQuery,
    private val gameConfig: GameConfig
) : PlayerViewCreator {

    override suspend fun build(userId: String, gameId: String): Either<PlayerViewCreatorError, GameExtendedDTO> {
        return when (val result = getGameState(gameId)) {
            is Ok -> build(userId, result.value).ok()
            is Err -> result.value.err()
        }
    }

    override fun build(userId: String, game: GameExtended): GameExtendedDTO {
        return GameExtendedDTOCreator(gameConfig).create(userId, game)
    }

    private suspend fun getGameState(gameId: String): Either<GameNotFoundError, GameExtended> {
        return gameExtendedQuery.execute(gameId).mapLeft { GameNotFoundError }
    }

}