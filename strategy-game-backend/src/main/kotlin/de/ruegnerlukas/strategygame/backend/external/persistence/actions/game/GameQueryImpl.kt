package de.ruegnerlukas.strategygame.backend.external.persistence.actions.game

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.GameTbl
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.game.GameQuery
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.either.mapError

class GameQueryImpl(private val database: Database) : GameQuery {

	override suspend fun execute(id: String): Either<GameEntity, ApplicationError> {
		return Either
			.runCatching(NoSuchElementException::class) {
				database
					.startQuery("game.query") {
						SQL
							.select(GameTbl.id, GameTbl.turn)
							.from(GameTbl)
							.where(GameTbl.id.isEqual(placeholder("gameId")))
					}
					.parameters {
						it["gameId"] = id
					}
					.execute()
					.getOne {
						GameEntity(
							id = it.getString(GameTbl.id),
							turn = it.getInt(GameTbl.turn)
						)
					}
			}
			.mapError { EntityNotFoundError }
	}

}