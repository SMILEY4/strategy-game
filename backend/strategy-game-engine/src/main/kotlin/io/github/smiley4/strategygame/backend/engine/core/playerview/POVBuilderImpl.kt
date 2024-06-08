package io.github.smiley4.strategygame.backend.engine.core.playerview

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.models.GameConfig
import io.github.smiley4.strategygame.backend.common.persistence.EntityNotFoundError
import io.github.smiley4.strategygame.backend.engine.ports.models.GameExtended
import io.github.smiley4.strategygame.backend.engine.ports.provided.POVBuilder
import io.github.smiley4.strategygame.backend.engine.ports.required.GameExtendedQuery


class POVBuilderImpl(
    private val gameExtendedQuery: GameExtendedQuery,
    private val gameConfig: GameConfig
) : POVBuilder {

    override suspend fun build(userId: String, gameId: String): JsonType {
        val result = getGameState(gameId)
        return build(userId, result)
    }

    override fun build(userId: String, game: GameExtended): JsonType {
        return GameExtendedPOVBuilder(gameConfig).create(userId, game)
    }

    private suspend fun getGameState(gameId: String): GameExtended {
        try {
            return gameExtendedQuery.execute(gameId)
        } catch (e: EntityNotFoundError) {
            throw POVBuilder.GameNotFoundError()
        }
    }

}