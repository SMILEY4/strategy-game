package de.ruegnerlukas.strategygame.backend.external.persistence.actions.country

import arrow.core.Either
import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.CountryTbl
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.country.CountryInsert

class CountryInsertImpl(private val database: Database) : CountryInsert {

	override suspend fun execute(country: CountryEntity): Either<DatabaseError, Unit> {
		return Either
			.catch {
				database
					.startInsert("country.insert") {
						SQL
							.insert()
							.into(CountryTbl)
							.columns(CountryTbl.id, CountryTbl.playerId, CountryTbl.amountMoney)
							.items(
								SQL.item()
									.set(CountryTbl.id, placeholder("id"))
									.set(CountryTbl.playerId, placeholder("playerId"))
									.set(CountryTbl.amountMoney, placeholder("amountMoney"))
							)
					}
					.parameters {
						it["id"] = country.id
						it["playerId"] = country.playerId
						it["amountMoney"] = country.amountMoney
					}
					.execute()
			}
			.mapLeft { throw it }
	}

}