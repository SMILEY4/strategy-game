package de.ruegnerlukas.strategygame.backend.external.persistence.actions.marker

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.and
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.MarkerTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.MarkerEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.marker.MarkersQueryByGame
import de.ruegnerlukas.strategygame.backend.shared.either.Either

class MarkersQueryByGameImpl(private val database: Database) : MarkersQueryByGame {

	override suspend fun execute(gameId: String): Either<List<MarkerEntity>, ApplicationError> {
		return Either.run {
			database
				.startQuery("marker.query.by_game") {
					SQL
						.select(MarkerTbl.id, MarkerTbl.tileId, MarkerTbl.playerId, PlayerTbl.userId)
						.from(MarkerTbl, PlayerTbl)
						.where(
							MarkerTbl.playerId.isEqual(PlayerTbl.id)
									and PlayerTbl.gameId.isEqual(placeholder("gameId"))
						)
				}
				.parameters {
					it["gameId"] = gameId
				}
				.execute()
				.getMultipleOrNone {
					MarkerEntity(
						id = it.getString(MarkerTbl.id),
						tileId = it.getString(MarkerTbl.tileId),
						playerId = it.getString(MarkerTbl.playerId),
						userId = it.getString(PlayerTbl.userId),
					)
				}
		}
	}

}