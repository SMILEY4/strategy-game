package de.ruegnerlukas.strategygame.backend.external.persistence.actions.game

import arrow.core.Either
import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.and
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.GameTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.game.GamesQueryByUser

class GamesQueryByUserImpl(private val database: Database) : GamesQueryByUser {

	override suspend fun execute(userId: String): Either<DatabaseError, List<GameEntity>> {
		return Either
			.catch {
				database
					.startQuery("game.query.by_user_id") {
						SQL
							.select(GameTbl.id, GameTbl.turn, GameTbl.seed)
							.from(GameTbl, PlayerTbl)
							.where(PlayerTbl.gameId.isEqual(GameTbl.id) and PlayerTbl.userId.isEqual(placeholder("userId")))
					}
					.parameters {
						it["userId"] = userId
					}
					.execute()
					.getMultipleOrNone {
						GameEntity(
							id = it.getString(GameTbl.id),
							turn = it.getInt(GameTbl.turn),
							seed = it.getInt(GameTbl.seed)
						)
					}
			}
			.mapLeft { throw it }
	}

}