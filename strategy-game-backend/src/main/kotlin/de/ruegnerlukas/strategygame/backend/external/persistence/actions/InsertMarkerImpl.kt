package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.MarkerTbl
import de.ruegnerlukas.strategygame.backend.ports.models.entities.MarkerEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.InsertMarker

class InsertMarkerImpl(private val database: Database) : InsertMarker {

	override suspend fun execute(marker: MarkerEntity) {
		database
			.startInsert("marker.insert") {
				SQL
					.insert()
					.into(MarkerTbl)
					.columns(MarkerTbl.id, MarkerTbl.tileId, MarkerTbl.playerId)
					.items(
						SQL.item()
							.set(MarkerTbl.id, placeholder("id"))
							.set(MarkerTbl.tileId, placeholder("tileId"))
							.set(MarkerTbl.playerId, placeholder("playerId"))
					)
			}
			.parameters {
				it["id"] = marker.id
				it["tileId"] = marker.tileId
				it["playerId"] = marker.playerId
			}
			.execute()
	}

}