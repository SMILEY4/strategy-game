package de.ruegnerlukas.strategygame.backend.external.persistence.actions.city

import arrow.core.Either
import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.SQL.item
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.CityTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.GameTbl
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CityEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.city.CityInsert
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.game.GameInsert

class CityInsertImpl(private val database: Database) : CityInsert {

	override suspend fun execute(city: CityEntity): Either<DatabaseError, Unit> {
		return Either
			.catch {
				database
					.startInsert("city.insert") {
						SQL
							.insert()
							.into(CityTbl)
							.columns(CityTbl.id, CityTbl.countryId, CityTbl.tileId)
							.items(
								item()
									.set(CityTbl.id, placeholder("id"))
									.set(CityTbl.countryId, placeholder("countryId"))
									.set(CityTbl.tileId, placeholder("tileId"))
							)
					}
					.parameters {
						it["id"] = city.id
						it["countryId"] = city.countryId
						it["tileId"] = city.tileId
					}
					.execute()
			}
			.mapLeft { throw it }
	}

}
