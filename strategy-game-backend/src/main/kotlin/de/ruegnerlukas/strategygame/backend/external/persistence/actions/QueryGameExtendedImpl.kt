package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.Either
import arrow.core.computations.either
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryGame
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryGameExtended
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryPlayersByGame
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryWorldExtended

class QueryGameExtendedImpl(
	private val queryGame: QueryGame,
	private val queryPlayersByGame: QueryPlayersByGame,
	private val queryWorldExtended: QueryWorldExtended
) : QueryGameExtended {

	override suspend fun execute(gameId: String): Either<EntityNotFoundError, GameExtendedEntity> {
		return either {
			val game = queryGame.execute(gameId).bind()
			val players = queryPlayersByGame.execute(gameId)
			val world = queryWorldExtended.execute(game.worldId).bind()
			GameExtendedEntity(
				id = game.id,
				turn = game.turn,
				world = world,
				players = players
			)
		}
	}

}