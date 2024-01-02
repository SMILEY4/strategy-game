package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.common.jsondsl.JsonType
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.utils.Err
import de.ruegnerlukas.strategygame.backend.common.utils.Ok
import de.ruegnerlukas.strategygame.backend.common.utils.err
import de.ruegnerlukas.strategygame.backend.common.utils.ok
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.POVBuilder
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.POVBuilder.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.POVBuilder.PlayerViewCreatorError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GameExtendedQuery


class POVBuilderImpl(
    private val gameExtendedQuery: GameExtendedQuery,
    private val gameConfig: GameConfig
) : POVBuilder {

    override suspend fun build(userId: String, gameId: String): Either<PlayerViewCreatorError, JsonType> {
        return when (val result = getGameState(gameId)) {
            is Ok -> build(userId, result.value).ok()
            is Err -> result.value.err()
        }
    }

    override fun build(userId: String, game: GameExtended): JsonType {
        return GameExtendedPOVBuilder(gameConfig).create(userId, game)
    }

    private suspend fun getGameState(gameId: String): Either<GameNotFoundError, GameExtended> {
        return gameExtendedQuery.execute(gameId).mapLeft { GameNotFoundError }
    }

}