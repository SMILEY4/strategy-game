package de.ruegnerlukas.strategygame.backend.external.persistence.actions.country

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.CountryTbl
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.country.CountryInsert
import de.ruegnerlukas.strategygame.backend.shared.either.Either

class CountryInsertImpl(private val database: Database) : CountryInsert {

	override suspend fun execute(country: CountryEntity): Either<Unit, ApplicationError> {
		return Either.run {
			database
				.startInsert("country.insert") {
					SQL
						.insert()
						.into(CountryTbl)
						.columns(CountryTbl.playerId, CountryTbl.amountMoney)
						.items(
							SQL.item()
								.set(CountryTbl.playerId, placeholder("playerId"))
								.set(CountryTbl.amountMoney, placeholder("amountMoney"))
						)
				}
				.parameters {
					it["playerId"] = country.playerId
					it["amountMoney"] = country.amountMoney
				}
				.execute()
		}
	}

}