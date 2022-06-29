package de.ruegnerlukas.strategygame.backend.external.persistence.actions.marker

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.MarkerTbl
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.MarkerEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.marker.MarkerInsertMultiple
import de.ruegnerlukas.strategygame.backend.shared.either.Either

class MarkerInsertMultipleImpl(private val database: Database) : MarkerInsertMultiple {

	override suspend fun execute(markers: List<MarkerEntity>): Either<Unit, ApplicationError> {
		return Either.run {
			database.insertBatched(50, markers) { batch ->
				SQL
					.insert()
					.into(MarkerTbl)
					.columns(MarkerTbl.id, MarkerTbl.playerId, MarkerTbl.tileId)
					.items(
						batch.map {
							SQL.item()
								.set(MarkerTbl.id, it.id)
								.set(MarkerTbl.playerId, it.playerId)
								.set(MarkerTbl.tileId, it.tileId)
						}
					)
			}
		}
	}

}