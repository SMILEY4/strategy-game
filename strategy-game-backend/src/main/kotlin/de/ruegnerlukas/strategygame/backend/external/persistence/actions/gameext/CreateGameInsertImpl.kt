package de.ruegnerlukas.strategygame.backend.external.persistence.actions.gameext

import arrow.core.Either
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.game.GameInsertImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.tiles.TileInsertMultipleImpl
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameCreateEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.gameext.CreateGameInsert

class CreateGameInsertImpl(private val database: Database) : CreateGameInsert {

	override suspend fun execute(extGame: GameCreateEntity): Either<DatabaseError, Unit> {
		return Either
			.catch {
				database.startTransaction(true) { txDb ->
					GameInsertImpl(txDb).execute(
						GameEntity(
							id = extGame.id,
							seed = extGame.seed,
							turn = extGame.turn
						)
					)
					TileInsertMultipleImpl(txDb).execute(extGame.tiles)
				}
			}
			.mapLeft { throw it }
	}


}