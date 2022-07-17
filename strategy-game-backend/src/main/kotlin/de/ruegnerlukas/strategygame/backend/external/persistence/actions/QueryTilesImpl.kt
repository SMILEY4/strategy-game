package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.allColumns
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.TileTbl
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryTiles

class QueryTilesImpl(private val database: Database) : QueryTiles {

	override suspend fun execute(worldId: String): List<TileEntity> {
		return database
			.startQuery("tiles.query.by-world") {
				SQL
					.select(TileTbl.allColumns())
					.from(TileTbl)
					.where(TileTbl.worldId.isEqual(placeholder("worldId")))
			}
			.parameters {
				it["worldId"] = worldId
			}
			.execute()
			.getMultipleOrNone { row ->
				TileEntity(
					id = row.getString(TileTbl.id),
					worldId = row.getString(TileTbl.worldId),
					q = row.getInt(TileTbl.q),
					r = row.getInt(TileTbl.r),
					type = row.getString(TileTbl.type),
				)
			}
	}

}