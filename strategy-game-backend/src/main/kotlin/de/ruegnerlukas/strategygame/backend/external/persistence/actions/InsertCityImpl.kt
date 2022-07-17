package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.CityTbl
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CityEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.InsertCity

class InsertCityImpl(private val database: Database) : InsertCity {

	override suspend fun execute(city: CityEntity) {
		database
			.startInsert("city.insert") {
				SQL
					.insert()
					.into(CityTbl)
					.columns(CityTbl.id, CityTbl.tileId)
					.items(
						SQL.item()
							.set(CityTbl.id, placeholder("id"))
							.set(CityTbl.tileId, placeholder("tileId"))
					)
			}
			.parameters {
				it["id"] = city.id
				it["tileId"] = city.tileId
			}
			.execute()
	}

}