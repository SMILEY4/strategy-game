package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import de.ruegnerlukas.strategygame.backend.common.jsondsl.JsonType
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.POVBuilder
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.POVBuilder.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GameExtendedQuery


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
            throw GameNotFoundError()
        }
    }

}