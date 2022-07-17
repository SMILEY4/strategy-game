package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.allColumns
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.GameTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.WorldTbl
import de.ruegnerlukas.strategygame.backend.ports.models.entities.WorldEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryWorld

class QueryWorldImpl(private val database: Database) : QueryWorld {

	override suspend fun execute(worldId: String): Either<EntityNotFoundError, WorldEntity> {
		try {
			return database
				.startQuery("world.query") {
					SQL
						.select(WorldTbl.allColumns())
						.from(WorldTbl)
						.where(
							WorldTbl.id.isEqual(placeholder("worldId"))
						)
				}
				.parameters {
					it["worldId"] = worldId
				}
				.execute()
				.getOne { row ->
					WorldEntity(
						id = row.getString(GameTbl.id),
					)
				}
				.right()
		} catch (e: NoSuchElementException) {
			return EntityNotFoundError.left()
		}
	}

}